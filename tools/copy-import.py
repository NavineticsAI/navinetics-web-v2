"""Read the returned review document and work out what changed.

    python tools/copy-import.py copy/NaviNetics Website Review 2026-09-02.docx
    python tools/copy-import.py <file.docx> --json copy/copy-changes.json

Writes nothing to the site. It produces a report and a changes file; applying
them is tools/copy-apply.mjs, deliberately a separate step.

WHY THE XML IS PARSED BY HAND. python-docx reads a paragraph's text from its
direct `w:r` children. A run a reviewer TYPED with Track Changes on is not a
direct child — it sits inside a `w:ins` wrapper — so the convenient API silently
returns the document as it was before anyone edited it. Reading every `w:t` in
document order is what "accept all changes" actually means:

  * inserted text is in `w:t` inside `w:ins`     -> included, correctly
  * deleted text is in `w:delText`, never `w:t`  -> dropped, correctly

So the same one-line rule gives the accepted document, and a reviewer never has
to remember to accept their own changes before sending the file back.
"""
import argparse
import json
import os
import re
import sys
import zipfile
from xml.etree import ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
ANCHOR = re.compile(r'⟦([0-9a-f]{8})⟧')
# The switch on the cover. Nothing downstream acts until this says YES.
SWITCH = '⟦PUBLISH⟧'
# The export the document was built from, stamped on its cover.
BASE = re.compile(r'⟦BASE:([0-9a-f]{40})⟧')
YES = re.compile(r'^\s*(yes|y|publish|go|true|ok)\b', re.I)
SLOT = re.compile(r'\{(\d+)\}')

# Word helpfully rewrites what people type. The site's source uses real
# typographic characters already, so most of this is a no-op — but a reviewer
# pasting from another document brings non-breaking spaces and stray control
# characters with them, and those must not reach a source file.
CLEAN = {
    ' ': ' ', ' ': ' ', ' ': ' ', '​': '',
    '﻿': '', '': '\n', '\r': '',
}


def cell_text(tc):
    """Every paragraph of a cell, changes accepted, joined by newlines."""
    out = []
    for p in tc.iter(f'{W}p'):
        buf = []
        for t in p.iter(f'{W}t'):
            buf.append(t.text or '')
        out.append(''.join(buf))
    text = '\n'.join(out)
    for bad, good in CLEAN.items():
        text = text.replace(bad, good)
    return text.strip('\n')


def read_comments(zf):
    """Reviewer comments, keyed by the comment ids referenced in the document."""
    if 'word/comments.xml' not in zf.namelist():
        return {}
    root = ET.fromstring(zf.read('word/comments.xml'))
    out = {}
    for c in root.iter(f'{W}comment'):
        cid = c.get(f'{W}id')
        text = ''.join(t.text or '' for t in c.iter(f'{W}t')).strip()
        out[cid] = {
            'author': c.get(f'{W}author') or 'unknown',
            'date': c.get(f'{W}date') or '',
            'text': text,
        }
    return out


def read_docx(path):
    with zipfile.ZipFile(path) as zf:
        doc = ET.fromstring(zf.read('word/document.xml'))
        comments = read_comments(zf)

    whole = ''.join(t.text or '' for t in doc.iter(f'{W}t'))
    mb = BASE.search(whole)
    base_id = mb.group(1) if mb else None

    rows = {}
    dupes = []
    row_comments = {}
    publish = False
    for tr in doc.iter(f'{W}tr'):
        tcs = list(tr.findall(f'{W}tc'))
        if len(tcs) != 2:
            continue
        left = cell_text(tcs[0])
        if SWITCH in left:
            publish = bool(YES.match(cell_text(tcs[1])))
            continue
        m = ANCHOR.search(left)
        if not m:
            continue
        cid = m.group(1)
        if cid in rows:
            dupes.append(cid)
        rows[cid] = cell_text(tcs[1])
        refs = [r.get(f'{W}id') for r in tr.iter(f'{W}commentReference')]
        if refs:
            row_comments[cid] = [comments[r] for r in refs if r in comments]

    # Comments that are not attached to any row still matter — a reviewer may
    # have left one on a heading to say a whole section should go.
    attached = {c['text'] for lst in row_comments.values() for c in lst}
    loose = [c for c in comments.values() if c['text'] not in attached]
    return rows, dupes, row_comments, loose, publish, base_id


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('docx')
    ap.add_argument('--manifest', default='copy/copy-manifest.json')
    ap.add_argument('--json', default='copy/copy-changes.json')
    ap.add_argument('--quiet', action='store_true')
    a = ap.parse_args()

    with open(a.manifest, encoding='utf-8') as f:
        manifest = json.load(f)
    index = {e['id']: e for e in manifest['entries']}
    parts = {p['key']: p for p in manifest['parts']}

    changes, problems = [], []

    rows, dupes, row_comments, loose, publish, base_id = read_docx(a.docx)

    # The copy AS IT WAS when this document was made. Without it every
    # comparison is two-way and a stale document reverts published text.
    baseline = None
    if base_id:
        bp = os.path.join(os.path.dirname(a.manifest), 'baselines', base_id + '.json')
        if os.path.exists(bp):
            with open(bp, encoding='utf-8') as f:
                baseline = json.load(f)
        else:
            problems.append(('baseline missing', base_id[:8], '',
                             'this document names an export whose record is not in '
                             'copy/baselines/. Without it there is no way to tell a '
                             'reviewer edit from the site having moved on, so nothing '
                             'is applied'))
    elif index:
        problems.append(('no document version', '', '',
                         'this document carries no version stamp — it predates them. '
                         'Re-export and send a fresh one'))

    for cid in dupes:
        problems.append(('duplicate row', cid, index.get(cid, {}).get('label', '?'),
                         'the same piece of text appears in two rows; only the last was read'))

    for cid, after in rows.items():
        e = index.get(cid)
        if not e:
            problems.append(('unknown id', cid, '',
                             'not in this manifest — the document was built from a '
                             'different export'))
            continue
        live = e['text']
        # THREE TEXTS, NOT TWO. `origin` is what this document was built from;
        # `live` is what the site says now. Comparing only the cell against the
        # site cannot tell "the reviewer changed this" from "the site moved on
        # while they had the document open" — and treats the second as the
        # first, so a document made before a correction was published and
        # returned afterwards silently puts the old wording back. Measured on
        # this repo: one change recorded, zero refusals, straight to the site.
        origin = baseline.get(cid, live) if baseline else live
        if after == origin:
            # The reviewer did not touch this row. Whatever the site says now
            # is right, and this document has no opinion about it.
            continue
        if after == live:
            continue
        if baseline and live != origin:
            problems.append(('changed on both sides', cid, e['label'],
                             'this text was edited in the document AND changed on '
                             'the site since the document was made. Applying either '
                             'would silently discard the other, so neither is'))
            continue
        before = live
        if not after.strip():
            problems.append(('emptied', cid, e['label'],
                             'the cell was emptied. Removing text needs a code change '
                             'as well, so this is reported and not applied'))
            continue
        want = SLOT.findall(before)
        got = SLOT.findall(after)
        if want != got:
            problems.append(('placeholder changed', cid, e['label'],
                             f'expected {want or "none"}, found {got or "none"} — '
                             'the site fills those in, so the edit cannot be applied'))
            continue
        changes.append({
            'id': cid, 'file': e['file'], 'label': e['label'],
            'page': parts.get(e['part'], {}).get('title', e['part']),
            'appears_on': e.get('appears_on', []),
            'before': before, 'after': after,
        })

    missing = [e for cid, e in index.items() if cid not in rows]
    for e in missing[:50]:
        problems.append(('row missing', e['id'], e['label'],
                         'no row for this text in the returned document'))
    if len(missing) > 50:
        problems.append(('row missing', '...', f'and {len(missing) - 50} more', ''))

    out = {
        'source_document': a.docx,
        # The cover switch. Everything downstream stops unless this is true.
        'publish': publish,
        'manifest_version': manifest['generated_from'],
        'changes': changes,
        'problems': [{'kind': k, 'id': i, 'label': l, 'detail': d} for k, i, l, d in problems],
        'comments': {k: v for k, v in row_comments.items()},
        'loose_comments': loose,
    }
    with open(a.json, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=1, ensure_ascii=False)

    if not a.quiet:
        print(f'\n  read {len(rows)} rows from {a.docx}')
        print(f'  {len(changes)} text changes')
        print(f'  {sum(len(v) for v in row_comments.values())} comments on specific text, '
              f'{len(loose)} elsewhere')
        print(f'  {len(problems)} things needing a person\n')
        for c in changes[:25]:
            print(f'  {c["page"]} — {c["label"]}')
            print(f'      was: {c["before"][:110]}')
            print(f'      now: {c["after"][:110]}')
            if len(c['appears_on']) > 1:
                print(f'      changes {len(c["appears_on"])} pages: {", ".join(c["appears_on"])}')
        if len(changes) > 25:
            print(f'  ... and {len(changes) - 25} more changes\n')
        if problems:
            print('\n  NEEDS A PERSON')
            for k, i, l, d in problems[:20]:
                print(f'  [{k}] {l or i}\n      {d}')
        for cid, cs in list(row_comments.items())[:15]:
            e = index.get(cid, {})
            for c in cs:
                print(f'\n  comment from {c["author"]} on "{e.get("label", cid)}"'
                      f'\n      {c["text"][:200]}')
        print(f'\n  -> {a.json}\n')
    return 0


if __name__ == '__main__':
    sys.exit(main())
