"""Prove the round trip survives a real reviewer.

    python tools/copy-selftest.py

Edits a throwaway copy of the review document the way a person actually would —
some changes typed with Track Changes ON, some with it off — then reads it back
and checks that exactly the intended edits came through, unchanged.

The cases are chosen because each one has a specific way of going wrong:

  plain edit          the baseline
  tracked edit        text typed with Track Changes on lives inside a <w:ins>
                      wrapper; the obvious way to read a document misses it
                      entirely and reports no change at all
  apostrophe          must not end the ' string literal it is written back into
  double quote        same, for the other quote style
  backtick and ${     must not open a template substitution
  backslash           must not escape the character after it
  placeholder kept    {1} survives -> the edit is allowed
  placeholder lost    {1} deleted  -> the edit must be REFUSED, not applied
"""
import glob
import os
import shutil
import subprocess
import sys
import zipfile
from xml.etree import ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
ET.register_namespace('w', NS)

def _latest():
    """Whichever review document is in copy/ — the filename carries a date."""
    # Word writes a lock file beside an open document, named ~$<document>.
    # It is 162 bytes of nothing, it is not a zip, and '~' sorts AFTER every
    # letter — so picking the last match grabs the lock file whenever the
    # document happens to be open, which is exactly when someone is most
    # likely to run this.
    hits = sorted(f for f in glob.glob('copy/*.docx')
                  if not os.path.basename(f).startswith('~$'))
    if not hits:
        raise SystemExit('no .docx in copy/ — run  npm run copy:export  first')
    return hits[-1]

DOCX = _latest()
TMP = 'copy/.selftest.docx'
OUT = 'copy/.selftest-changes.json'


def set_cell(tc, text, tracked, uid):
    """Replace a cell's text, optionally as a tracked insertion."""
    for p in list(tc.findall(f'{W}p'))[1:]:
        tc.remove(p)
    p = tc.find(f'{W}p')
    for child in list(p):
        if child.tag != f'{W}pPr':
            p.remove(child)

    def new_run(t):
        r = ET.SubElement(p if not tracked else ins, f'{W}r')
        el = ET.SubElement(r, f'{W}t')
        el.text = t
        el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        return r

    if tracked:
        ins = ET.SubElement(p, f'{W}ins')
        ins.set(f'{W}id', str(uid))
        ins.set(f'{W}author', 'A Reviewer')
        ins.set(f'{W}date', '2026-09-02T12:00:00Z')
        new_run(text)
    else:
        ins = None
        r = ET.SubElement(p, f'{W}r')
        el = ET.SubElement(r, f'{W}t')
        el.text = text
        el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')


def main():
    import json
    with open('copy/copy-manifest.json', encoding='utf-8') as f:
        manifest = json.load(f)
    entries = manifest['entries']
    by_kind = {}
    for e in entries:
        by_kind.setdefault(e['kind'], []).append(e)

    # Never hand back a row already claimed by another case. Two cases landing
    # on one row is not a harmless duplicate: the second overwrites the first,
    # the assertions still pass because they are keyed by id, and the test
    # reports success over a case it never actually ran.
    taken = set()

    def pick(kind, pred=None):
        for e in by_kind.get(kind, []):
            if e['id'] in taken:
                continue
            if pred is None or pred(e):
                taken.add(e['id'])
                return e
        raise SystemExit(f'no unused {kind} entry to test with')

    dyn = pick('template-dyn', lambda e: '{1}' in e['text'] and ' ' in e['text'])
    cases = [
        (pick('object-field', lambda e: len(e['text']) > 30), 'A plain edit by a reviewer.', False, True),
        (pick('concat'), 'Tracked change: a long sentence rewritten by someone with Track Changes switched on, which is the case that matters.', True, True),
        (pick('jsx-text'), 'Discover the system', False, True),
        (pick('array-item'), "It doesn't end the literal — an apostrophe.", True, True),
        (pick('jsx-attr'), 'She said "precision" and meant it.', False, True),
        (pick('object-field', lambda e: len(e['text']) > 40),
         'A backslash \\ and a ${template} and a `backtick`.', True, True),
        (dyn, dyn['text'].replace(' ', ' really ', 1), False, True),
    ]
    # And one that must be refused.
    refuse = pick('template-dyn', lambda e: '{1}' in e['text'])
    cases.append((refuse, refuse['text'].replace('{1}', 'the name'), False, False))

    seen = [c[0]['id'] for c in cases]
    assert len(set(seen)) == len(seen), 'cases must target distinct rows'

    shutil.copy(DOCX, TMP)
    want = {c[0]['id']: (c[1], c[3]) for c in cases}

    with zipfile.ZipFile(TMP) as zf:
        names = zf.namelist()
        blobs = {n: zf.read(n) for n in names}
    doc = ET.fromstring(blobs['word/document.xml'])

    hit = 0
    for uid, (entry, text, tracked, _ok) in enumerate(cases, start=9000):
        for tr in doc.iter(f'{W}tr'):
            tcs = tr.findall(f'{W}tc')
            if len(tcs) != 2:
                continue
            left = ''.join(t.text or '' for t in tcs[0].iter(f'{W}t'))
            if f'⟦{entry["id"]}⟧' in left:
                set_cell(tcs[1], text, tracked, uid)
                hit += 1
                break
    if hit != len(cases):
        raise SystemExit(f'could only edit {hit} of {len(cases)} rows')

    blobs['word/document.xml'] = ET.tostring(doc, encoding='UTF-8', xml_declaration=True)
    with zipfile.ZipFile(TMP, 'w', zipfile.ZIP_DEFLATED) as zf:
        for n in names:
            zf.writestr(n, blobs[n])

    subprocess.run([sys.executable, 'tools/copy-import.py', TMP, '--json', OUT, '--quiet'],
                   check=True)
    with open(OUT, encoding='utf-8') as f:
        result = json.load(f)

    got = {c['id']: c['after'] for c in result['changes']}
    refused_ids = {p['id'] for p in result['problems']}

    fails = []
    for cid, (text, should_apply) in want.items():
        if should_apply:
            if cid not in got:
                fails.append(f'{cid}: edit did not come through at all')
            elif got[cid] != text:
                fails.append(f'{cid}: text differs\n      wanted {text!r}\n      got    {got[cid]!r}')
        else:
            if cid in got:
                fails.append(f'{cid}: a broken placeholder was accepted; it must be refused')
            elif cid not in refused_ids:
                fails.append(f'{cid}: broken placeholder was neither applied nor reported')

    extra = [c for c in result['changes'] if c['id'] not in want]
    if extra:
        fails.append(f'{len(extra)} rows changed that nobody edited '
                     f'(first: {extra[0]["label"]})')

    labels = ['plain edit', 'tracked edit', 'jsx text', 'apostrophe', 'double quote',
              'backslash / backtick / dollar-brace', 'placeholder kept', 'placeholder lost']
    for lab, (entry, _t, tracked, ok) in zip(labels, cases):
        mark = 'ok' if not any(entry['id'] in f for f in fails) else 'FAILED'
        tag = ' (tracked)' if tracked else ''
        expect = '' if ok else '  -> correctly refused' if mark == 'ok' else ''
        print(f'  {mark:<7} {lab}{tag}{expect}')

    for f in fails:
        print(f'\n  FAIL {f}')
    print()
    if not fails:
        print(f'  round trip clean: {len(got)} edits in, {len(got)} edits out, '
              f'{len(refused_ids)} correctly refused\n')
    for tmp in (TMP, OUT):
        if os.path.exists(tmp):
            os.remove(tmp)
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
