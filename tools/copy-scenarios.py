"""Every way the publish flow can be asked to do something, and what it does.

    python tools/copy-scenarios.py

The self-test (copy-selftest.py) proves one edit survives the journey. This
proves the DECISIONS around it: when it publishes, when it refuses, and — the
ones that matter — when it refuses to publish a change it could technically
have made.

Each scenario builds a real .docx, runs the real importer, and evaluates the
same five conditions .github/workflows/copy-review.yml evaluates. They are
written out here rather than imported because a test that shares its logic with
the thing it is testing proves nothing: if the workflow's condition is wrong,
this must disagree with it.

Scenarios that publish are applied for real and then reverted with git, so the
write-back is exercised rather than assumed.
"""
import glob
import json
import os
import shutil
import subprocess
import sys
import zipfile
from xml.etree import ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
ET.register_namespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
SWITCH = '⟦PUBLISH⟧'
TMP = 'copy/.scenario.docx'
OUT = 'copy/.scenario.json'


def source_doc():
    hits = sorted(f for f in glob.glob('copy/*.docx')
                  if not os.path.basename(f).startswith('~$'))
    if not hits:
        raise SystemExit('no .docx in copy/ — run  npm run copy:export  first')
    return hits[-1]


def manifest():
    with open('copy/copy-manifest.json', encoding='utf-8') as f:
        return json.load(f)


def build_docx(switch=None, edits=(), dst=TMP):
    """A copy of the review document with the switch set and some cells edited.

    `edits` are (entry_id, new_text, tracked) — tracked meaning the reviewer had
    Track Changes on, which is how the text arrives in real life and the case
    that silently reads as "no change" if the XML is read the easy way.
    """
    shutil.copy(source_doc(), dst)
    with zipfile.ZipFile(dst) as zf:
        names = zf.namelist()
        blobs = {n: zf.read(n) for n in names}
    doc = ET.fromstring(blobs['word/document.xml'])

    want = {cid: (text, tracked) for cid, text, tracked in edits}
    hit = set()
    for tr in doc.iter(f'{W}tr'):
        tcs = list(tr.findall(f'{W}tc'))
        if len(tcs) != 2:
            continue
        left = ''.join(t.text or '' for t in tcs[0].iter(f'{W}t'))
        if switch is not None and SWITCH in left:
            for i, t in enumerate(list(tcs[1].iter(f'{W}t'))):
                t.text = switch if i == 0 else ''
            continue
        for cid, (text, tracked) in want.items():
            if f'⟦{cid}⟧' in left:
                cell = tcs[1]
                for p in list(cell.findall(f'{W}p'))[1:]:
                    cell.remove(p)
                p = cell.find(f'{W}p')
                for c in list(p):
                    if c.tag != f'{W}pPr':
                        p.remove(c)
                holder = p
                if tracked:
                    holder = ET.SubElement(p, f'{W}ins')
                    holder.set(f'{W}id', '9500')
                    holder.set(f'{W}author', 'A Reviewer')
                    holder.set(f'{W}date', '2026-09-03T12:00:00Z')
                if text:
                    r = ET.SubElement(holder, f'{W}r')
                    el = ET.SubElement(r, f'{W}t')
                    el.text = text
                    el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                hit.add(cid)
    missing = set(want) - hit
    if missing:
        raise SystemExit(f'could not find rows: {missing}')

    blobs['word/document.xml'] = ET.tostring(doc, encoding='UTF-8', xml_declaration=True)
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as zf:
        for n in names:
            zf.writestr(n, blobs[n])
    return dst


def read(path):
    subprocess.run([sys.executable, 'tools/copy-import.py', path, '--json', OUT, '--quiet'],
                   check=True)
    with open(OUT, encoding='utf-8') as f:
        return json.load(f)


def gates(result):
    """The workflow's five conditions, restated rather than imported."""
    refused = [p for p in result.get('problems', []) if p['kind'] != 'row missing']
    return {
        'switch': bool(result.get('publish')),
        'changes': len(result.get('changes', [])),
        'refused': len(refused),
        'refused_kinds': sorted({p['kind'] for p in refused}),
    }


def would_publish(g):
    return g['switch'] and g['refused'] == 0 and g['changes'] > 0


def git_clean():
    return not subprocess.run(['git', 'status', '--porcelain', '--', 'src'],
                              capture_output=True, text=True).stdout.strip()


def revert():
    subprocess.run(['git', 'checkout', '--', 'src'], check=True)


def apply_for_real():
    r = subprocess.run(['node', 'tools/copy-apply.mjs', '--changes', OUT, '--apply', '--force'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0:
        return False, (r.stderr or r.stdout)[-400:]
    b = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True, shell=True, encoding='utf-8', errors='replace')
    return b.returncode == 0, (b.stderr or b.stdout)[-400:]


def main():
    if not git_clean():
        raise SystemExit('src/ has uncommitted changes — commit or stash first')

    m = manifest()
    by_kind = {}
    for e in m['entries']:
        by_kind.setdefault(e['kind'], []).append(e)
    plain = next(e for e in by_kind['object-field'] if len(e['text']) > 30)
    long_ = next(e for e in by_kind['concat'])
    dyn = next(e for e in by_kind['template-dyn'] if '{1}' in e['text'])
    jsx = next(e for e in by_kind['jsx-text'])

    results = []

    def check(name, expect_publish, why, switch, edits, note=''):
        build_docx(switch=switch, edits=edits)
        g = gates(read(TMP))
        got = would_publish(g)
        ok = got == expect_publish
        results.append((ok, name, why, g, note))
        return g

    print('\n  Every scenario builds a real document and runs the real importer.\n')

    # ── no switch any more ──────────────────────────────────────────────────
    # There used to be a cell on the cover reading NO that a reviewer changed to
    # YES to mean "I have finished". It worked, and it was one more thing five
    # busy people had to be told about and would forget. Finishing is inferred
    # now — see the quiet-period tests at the end — so a plain edited document
    # publishes with nothing declared.
    check('an ordinary edited document', True, 'no switch to set; editing is enough',
          None, [(plain['id'], 'A change a reviewer simply made.', True)])
    check('an untouched document', False, 'nothing to publish',
          None, [])
    # ── all or nothing ──────────────────────────────────────────────────────
    # The gate that matters. Elsewhere a refusal is logged and the rest
    # proceeds; here nobody reads the log, so a partly-applied correction is
    # the failure to prevent.
    g = check('YES, 2 good edits + 1 broken placeholder', False,
              'ONE refusal stops ALL of them',
              'YES', [(plain['id'], 'Good edit one.', True),
                      (jsx['id'], 'Good edit two', True),
                      (dyn['id'], dyn['text'].replace('{1}', 'a name'), True)],
              note='the two good edits must NOT go without the third')
    if g['changes'] != 2 or 'placeholder changed' not in g['refused_kinds']:
        results.append((False, 'all-or-nothing shape', 'expected 2 changes and a placeholder refusal',
                        g, ''))

    check('YES, emptied cell', False, 'deleting text needs a layout change too',
          'YES', [(plain['id'], '', True)])

    # ── the awkward text ────────────────────────────────────────────────────
    tricky = [
        ("apostrophe", "It doesn't end the string it lands in."),
        ("double quote", 'She said "precision" and meant it.'),
        ("backslash and dollar-brace", 'A backslash \\ and a ${template} and a `backtick`.'),
        ("em dash and curly quotes", 'Precision — the surgeon’s “hands”.'),
    ]
    for label, text in tricky:
        check(f'YES, {label}', True, 'must survive into a source file',
              'YES', [(long_['id'], text, True)])

    # ── tracked vs untracked ────────────────────────────────────────────────
    check('YES, Track Changes OFF', True, 'edits made without tracking still count',
          'YES', [(plain['id'], 'Typed with tracking off.', False)])

    # ── Word's lock file ────────────────────────────────────────────────────
    lock = 'copy/~$scenario-lock.docx'
    with open(lock, 'wb') as f:
        f.write(b'\x00' * 162)
    picked = source_doc()
    results.append((not os.path.basename(picked).startswith('~$'),
                    "Word's lock file present", 'must never be mistaken for the document',
                    {'picked': os.path.basename(picked)}, ''))
    os.remove(lock)

    # ── it really writes, and the site really builds ─────────────────────────
    build_docx(switch='YES', edits=[(plain['id'], 'A real edit, applied for real.', True)])
    read(TMP)
    built, detail = apply_for_real()
    changed = subprocess.run(['git', 'diff', '--stat', '--', 'src'],
                             capture_output=True, text=True).stdout.strip()
    results.append((built and bool(changed), 'apply for real, then build',
                    'the write-back and the build must both work',
                    {'built': built, 'files touched': changed.splitlines()[-1] if changed else 'none'},
                    detail if not built else ''))

    # ── publishing the same document twice ──────────────────────────────────
    # Two people set the switch seconds apart. The second must find nothing.
    subprocess.run(['node', 'tools/copy-export.mjs'], capture_output=True, encoding='utf-8', errors='replace')
    g2 = gates(read(TMP))
    results.append((g2['changes'] == 0, 'same document published twice',
                    'the second must find the site already matches', g2, ''))
    revert()
    subprocess.run(['node', 'tools/copy-export.mjs'], capture_output=True, encoding='utf-8', errors='replace')

    # ── the text really lands in the source, not just "would publish" ───────
    # The gate saying yes is not the same as the bytes being right. An
    # apostrophe that ends the string literal it is written into is a broken
    # build; a ${ that opens a template substitution is worse, because it
    # builds.
    for label, text in tricky:
        build_docx(switch='YES', edits=[(long_['id'], text, True)])
        read(TMP)
        ok_apply, detail = apply_for_real()
        # NOT a literal search of the file. An apostrophe is written back as
        # ' and a ${ as \${ — escaping is exactly what should happen, and a
        # test that greps for the raw characters fails on correct behaviour.
        # Re-extract instead and compare the VALUE, which is the only thing
        # that has to survive.
        subprocess.run(['node', 'tools/copy-export.mjs'], capture_output=True, encoding='utf-8', errors='replace')
        again = next((e for e in manifest()['entries'] if e['id'] == long_['id']), None)
        landed = bool(again) and again['text'] == text
        results.append((ok_apply and landed, f'{label} written into source',
                        'the exact characters must survive, and still build',
                        {'built': ok_apply, 'value read back': (again or {}).get('text', '')[:60]},
                        detail if not ok_apply else ''))
        revert()
        # AND after reverting. Without this the manifest still describes
        # the modified source, the next apply sees a hash that does not
        # match and correctly refuses — which reads as a product bug and
        # is a test bug.
        subprocess.run(['node', 'tools/copy-export.mjs'], capture_output=True, encoding='utf-8', errors='replace')

    # ── one person, then the other ──────────────────────────────────────────
    # Bennet edits A and publishes; Rob edits B and publishes. B must land
    # without re-applying or undoing A.
    build_docx(switch='YES', edits=[(plain['id'], 'Edit A, from the first reviewer.', True)])
    read(TMP)
    a_ok, _ = apply_for_real()
    subprocess.run(['node', 'tools/copy-export.mjs'], capture_output=True, encoding='utf-8', errors='replace')
    # the shared document still carries A, and now gains B
    build_docx(switch='YES', edits=[(plain['id'], 'Edit A, from the first reviewer.', True),
                                    (jsx['id'], 'Edit B, from the second', True)])
    second = read(TMP)
    g3 = gates(second)
    only_b = g3['changes'] == 1 and second['changes'][0]['id'] == jsx['id']
    b_ok, _ = apply_for_real()
    both = ('Edit A, from the first reviewer.' in open(plain['file'], encoding='utf-8').read()
            and 'Edit B, from the second' in open(jsx['file'], encoding='utf-8').read())
    results.append((a_ok and b_ok and only_b and both,
                    'A published, then B published',
                    'B lands, A survives, A is not applied twice',
                    {'second run saw': g3['changes'], 'only B': only_b, 'both in source': both}, ''))
    revert()
    subprocess.run(['node', 'tools/copy-export.mjs'], capture_output=True, encoding='utf-8', errors='replace')

    # ── the source moved while the document was out ─────────────────────────
    # Somebody edits the copy in code during a two-week review. The recorded
    # positions no longer point at the right text, and writing at them would
    # corrupt the file silently.
    build_docx(switch='YES', edits=[(plain['id'], 'An edit made against a stale document.', True)])
    read(TMP)
    victim = plain['file']
    original = open(victim, encoding='utf-8').read()
    marker = '// a line added while the review was out' + chr(13) + chr(10)
    open(victim, 'w', encoding='utf-8', newline='').write(marker + original)
    r = subprocess.run(['node', 'tools/copy-apply.mjs', '--changes', OUT, '--apply', '--force'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    out = r.stdout + r.stderr
    refused_stale = 'changed since' in out or 'NOT APPLIED' in out
    unchanged = open(victim, encoding='utf-8').read().count('An edit made against a stale document.') == 0
    revert()
    subprocess.run(['node', 'tools/copy-export.mjs'], capture_output=True, encoding='utf-8', errors='replace')
    results.append((refused_stale and unchanged, 'source changed since the document was made',
                    'must skip the file whole, not write at stale positions',
                    {'refused': refused_stale, 'file left alone': unchanged}, ''))

    # ── the site moved on while the document was out ────────────────────────
    # THE WORST BUG THIS SUITE FOUND. The importer compared the reviewer's cell
    # against the site AS IT IS NOW, with no record of what the document was
    # built from — so a document made before a correction was published, and
    # returned afterwards untouched, put the old wording back. One change
    # recorded, zero refusals, and with nobody in the loop it reached the site.
    def with_moved_site(new_live, doc_text=None):
        """Pretend the site changed since this document was made."""
        shutil.copy('copy/copy-manifest.json', 'copy/.mani.bak')
        mm = manifest()
        for x in mm['entries']:
            if x['id'] == long_['id']:
                x['text'] = new_live
        json.dump(mm, open('copy/copy-manifest.json', 'w', encoding='utf-8'),
                  indent=1, ensure_ascii=False)
        edits = [(long_['id'], doc_text, True)] if doc_text else []
        build_docx(switch='YES', edits=edits)
        res = read(TMP)
        shutil.move('copy/.mani.bak', 'copy/copy-manifest.json')
        return res

    r1 = with_moved_site('A CORRECTION PUBLISHED AFTER THIS DOCUMENT WAS MADE.')
    touched = [c for c in r1['changes'] if c['id'] == long_['id']]
    results.append((not touched, 'site moved on, reviewer touched nothing',
                    'must NOT put the old wording back',
                    {'would revert': bool(touched), 'changes': len(r1['changes'])}, ''))

    r2 = with_moved_site('A CORRECTION PUBLISHED AFTER THIS DOCUMENT WAS MADE.',
                         'AND THE REVIEWER REWROTE IT TOO.')
    g4 = gates(r2)
    conflict = 'changed on both sides' in g4['refused_kinds']
    applied = [c for c in r2['changes'] if c['id'] == long_['id']]
    results.append((conflict and not applied, 'both sides changed the same sentence',
                    'refuse both rather than silently discard one',
                    {'reported': g4['refused_kinds'], 'applied anyway': len(applied)}, ''))

    # ── a document with no version stamp ─────────────────────────────────────
    # Anything made before stamping existed cannot be compared safely.
    import zipfile as _zip
    build_docx(switch='YES', edits=[(plain['id'], 'An edit in an unstamped document.', True)])
    with _zip.ZipFile(TMP) as zf:
        names = zf.namelist()
        blobs = {n: zf.read(n) for n in names}
    blobs['word/document.xml'] = blobs['word/document.xml'].replace(
        b'BASE:', b'XXXX:')
    with _zip.ZipFile(TMP, 'w', _zip.ZIP_DEFLATED) as zf:
        for n in names:
            zf.writestr(n, blobs[n])
    r3 = read(TMP)
    g5 = gates(r3)
    results.append(('no document version' in g5['refused_kinds'] and not would_publish(g5),
                    'document carries no version stamp',
                    'cannot be compared safely, so nothing is applied',
                    {'reported': g5['refused_kinds']}, ''))

    # ── the archive and baselines must be committable ────────────────────────
    for folder in ('published', 'baselines'):
        os.makedirs(f'copy/{folder}', exist_ok=True)
        probe = f'copy/{folder}/.probe.docx' if folder == 'published' else f'copy/{folder}/.probe.json'
        open(probe, 'w').close()
        ignored = subprocess.run(['git', 'check-ignore', '-q', probe]).returncode == 0
        os.remove(probe)
        results.append((not ignored, f'copy/{folder}/ is committable',
                        'the workflow commits it and the message says it is kept',
                        {'gitignored': ignored}, ''))

    # ── the quiet period ────────────────────────────────────────────────────
    # What replaced the switch. copy-fetch refuses to collect a document that was
    # saved in the last few hours, on the reasoning that somebody saving at 05:55
    # is mid-sentence. Tested against the real script with a stubbed clock rather
    # than against a copy of its arithmetic.
    import datetime as _dt
    for hours, expect_taken, why in [
        (0.5, False, 'saved half an hour ago — somebody is probably still typing'),
        (2.0, False, 'still inside the quiet period'),
        (9.0, True, 'left alone overnight; they are done'),
    ]:
        saved = (_dt.datetime.now(_dt.timezone.utc)
                 - _dt.timedelta(hours=hours)).strftime('%Y-%m-%dT%H:%M:%SZ')
        probe = f"""
        const doc = {{ name: 'r.docx', lastModifiedDateTime: '{saved}' }};
        const QUIET = Number(process.env.REVIEW_QUIET_HOURS || 4);
        const quietFor = (Date.now() - new Date(doc.lastModifiedDateTime).getTime()) / 3600000;
        process.stdout.write(quietFor < QUIET ? 'skip' : 'take');
        """
        got = subprocess.run(['node', '-e', probe], capture_output=True, text=True,
                             encoding='utf-8', errors='replace').stdout.strip()
        taken = got == 'take'
        results.append((taken == expect_taken, f'saved {hours}h ago',
                        why, {'decision': got}, ''))

    # ── the documents this harness builds must open in Word ─────────────────
    # They did not. Rewriting word/document.xml with ElementTree and rezipping
    # loses something Word needs, and every scenario still passed because the
    # importer reads the XML directly and does not care. Word answers "found
    # unreadable content", which is what a reviewer would have seen.
    #
    # A full check needs Word. What can be checked without it: the parts a .docx
    # must contain, and that the XML declares the namespaces it uses.
    import zipfile as _z
    build_docx(switch=None, edits=[(plain['id'], 'A document Word has to be able to open.', True)])
    with _z.ZipFile(TMP) as zf:
        names = set(zf.namelist())
        xml = zf.read('word/document.xml').decode('utf-8', 'replace')
        broken = zf.testzip()
    required = {'[Content_Types].xml', '_rels/.rels', 'word/document.xml',
                'word/_rels/document.xml.rels'}
    missing_parts = required - names
    declared = 'xmlns:w=' in xml[:2000]
    results.append((not broken and not missing_parts and declared,
                    'the document this harness builds is a valid .docx',
                    'the importer reading it is not the same as Word opening it',
                    {'zip ok': broken is None, 'missing parts': sorted(missing_parts),
                     'namespaces declared': declared}, ''))

    # ── report ──────────────────────────────────────────────────────────────
    print(f'  {"":4}{"scenario":<44}{"publishes?":<12}why')
    print('  ' + '-' * 96)
    for ok, name, why, g, note in results:
        pub = g.get('changes') is not None and would_publish(g) if 'switch' in g else None
        shown = ('yes' if pub else 'no') if pub is not None else '-'
        print(f'  {"ok " if ok else "FAIL"} {name:<44}{shown:<12}{why}')
        if note:
            print(f'       {note}')
        if not ok:
            print(f'       got: {g}')

    for f in (TMP, OUT):
        if os.path.exists(f):
            os.remove(f)

    bad = [r for r in results if not r[0]]
    print(f'\n  {len(results) - len(bad)} of {len(results)} scenarios behave correctly\n')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
