"""Build the stakeholder review document from the copy manifest.

    python tools/copy-docx.py [--manifest copy/copy-manifest.json] [--out copy/]

THE DOCUMENT HAS ONE JOB: a reviewer opens it, finds a sentence, and knows
where that sentence is on the website. Everything here serves that and nothing
else. The first draft explained the mechanism at length on the cover and
repeated each string's full address on every row; both were cut, because a
reviewer who has to read instructions to find a paragraph will not find it.

So: page, then section, then the text. The section headings carry the location,
which is why a row only has to say WHAT it is — "Heading", "Paragraph 2".

WHY A TABLE. The obvious layout is a small grey code with the sentence under it.
It reads well and does not survive a reviewer: the code is just another line of
text, so it gets selected with the paragraph above and deleted, and the edit can
no longer be attributed to anything. A cell is something you edit INSIDE.
Track Changes works normally in table cells.
"""
import argparse
import json
import os
import sys

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

GREY = RGBColor(0x77, 0x7B, 0x80)
INK = RGBColor(0x1A, 0x1D, 0x21)
ACTION = RGBColor(0x0B, 0x5F, 0x87)
RULE = 'D9DCE0'
BAND = 'F4F6F7'


def shade(cell, fill):
    el = OxmlElement('w:shd')
    el.set(qn('w:val'), 'clear')
    el.set(qn('w:fill'), fill)
    cell._tc.get_or_add_tcPr().append(el)


def borders(table):
    """Hairlines. A heavy grid turns 1,500 rows into a wall."""
    el = OxmlElement('w:tblBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement(f'w:{edge}')
        e.set(qn('w:val'), 'single')
        e.set(qn('w:sz'), '4')
        e.set(qn('w:color'), RULE)
        el.append(e)
    table._tbl.tblPr.append(el)


def repeat_header(row):
    pr = row._tr.get_or_add_trPr()
    el = OxmlElement('w:tblHeader')
    el.set(qn('w:val'), 'true')
    pr.append(el)


def run(p, text, size=10, bold=False, italic=False, color=INK, font='Aptos'):
    r = p.add_run(text)
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.italic = italic
    r.font.color.rgb = color
    r.font.name = font
    return r


def para(doc, space_after=6, space_before=0, indent=0):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    if indent:
        p.paragraph_format.left_indent = Inches(indent)
    return p


def add_table(doc, rows, note_col=True):
    t = doc.add_table(rows=1, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    t.autofit = False
    borders(t)
    hdr = t.rows[0]
    repeat_header(hdr)
    for cell, label in zip(hdr.cells, ('What it is', 'Text  —  edit here')):
        cell.paragraphs[0].text = ''
        run(cell.paragraphs[0], label, size=8, bold=True, color=GREY)
        shade(cell, BAND)

    for e in rows:
        r = t.add_row()
        left, right = r.cells

        lp = left.paragraphs[0]
        lp.paragraph_format.space_after = Pt(0)
        run(lp, e['label'], size=9, color=INK)
        code = left.add_paragraph()
        code.paragraph_format.space_after = Pt(0)
        run(code, f'⟦{e["id"]}⟧', size=7, color=GREY, font='Consolas')
        if note_col and e.get('note'):
            n = left.add_paragraph()
            n.paragraph_format.space_after = Pt(0)
            run(n, e['note'], size=7.5, italic=True, color=GREY)
        shade(left, BAND)

        # One Word paragraph per line of the original, so a line break somebody
        # put in a headline survives the round trip as a line break.
        lines = e['text'].split('\n')
        rp = right.paragraphs[0]
        rp.paragraph_format.space_after = Pt(0)
        run(rp, lines[0], size=10.5)
        for extra in lines[1:]:
            q = right.add_paragraph()
            q.paragraph_format.space_after = Pt(0)
            run(q, extra, size=10.5)

    for row in t.rows:
        row.cells[0].width = Inches(1.7)
        row.cells[1].width = Inches(5.2)
    return t


def build(manifest, out_path, generated_on):
    doc = Document()

    base = doc.styles['Normal']
    base.font.name = 'Aptos'
    base.font.size = Pt(10.5)
    base.paragraph_format.space_after = Pt(6)
    for name, size, color, bold in (('Heading 1', 19, INK, True),
                                    ('Heading 2', 13, ACTION, True),
                                    ('Heading 3', 10.5, INK, True)):
        st = doc.styles[name]
        st.font.name = 'Aptos'
        st.font.size = Pt(size)
        st.font.color.rgb = color
        st.font.bold = bold

    sec = doc.sections[0]
    sec.left_margin = sec.right_margin = Inches(0.7)
    sec.top_margin = sec.bottom_margin = Inches(0.7)

    entries = manifest['entries']
    live = [e for e in entries if e.get('rendered') is not False]
    dead = [e for e in entries if e.get('rendered') is False]
    parts = [p for p in manifest['parts'] if p['count']]

    # ── cover ────────────────────────────────────────────────────────────────
    run(para(doc, space_after=2), 'NaviNetics website', size=26, bold=True)
    run(para(doc, space_after=2), 'Every word on the site, for review', size=14, color=ACTION)
    run(para(doc, space_after=18), f'{generated_on}   ·   {len(live)} pieces of text', size=9, color=GREY)

    run(para(doc, space_after=8), 'Four rules', size=13, bold=True, color=ACTION)
    for n, (rule, why) in enumerate([
        ('Turn on Track Changes before you type.', 'Review ▸ Track Changes'),
        ('Edit the right-hand column only.', 'the left column is how your edit finds its page'),
        ('Do not add or delete rows.', 'to remove or add text, leave a comment instead'),
        ('Keep any {1} exactly as it is.', 'the website fills those in'),
    ], 1):
        p = para(doc, space_after=5)
        run(p, f'{n}.  ', size=10.5, bold=True, color=ACTION)
        run(p, rule, size=10.5, bold=True)
        run(p, f'   {why}', size=9.5, color=GREY)

    run(para(doc, space_before=14, space_after=2), 'How to find something', size=13, bold=True, color=ACTION)
    run(para(doc, space_after=4),
        'Ctrl+F and paste the sentence you are looking for. Or use the contents '
        'below — pages are in the same order as the website menu.', size=10, color=GREY)

    # ── contents ─────────────────────────────────────────────────────────────
    doc.add_page_break()
    run(para(doc, space_after=10), 'Contents', size=17, bold=True)
    for group in ('Site-wide', 'Pages', 'Shared content'):
        gp = [p for p in parts if p['group'] == group]
        if not gp:
            continue
        g = para(doc, space_before=12, space_after=3)
        run(g, group, size=11, bold=True, color=ACTION)
        if group == 'Shared content':
            run(g, '   — used by more than one page', size=9, color=GREY)
        for p in gp:
            row = para(doc, space_after=1, indent=0.2)
            run(row, p['title'], size=10)
            if p.get('path'):
                run(row, f'   {p["path"]}', size=8.5, color=GREY)
            if p.get('unlisted'):
                run(row, '   not in the menus', size=8.5, italic=True, color=GREY)

    # ── the copy ─────────────────────────────────────────────────────────────
    by_part = {}
    for e in live:
        by_part.setdefault(e['part'], []).append(e)

    for group in ('Site-wide', 'Pages', 'Shared content'):
        gp = [p for p in parts if p['group'] == group and by_part.get(p['key'])]
        if not gp:
            continue
        doc.add_page_break()
        doc.add_heading(group, level=1)

        for part in gp:
            rows = by_part[part['key']]
            doc.add_heading(part['title'], level=2)

            m = para(doc, space_after=8)
            if part.get('path'):
                run(m, part['path'], size=9, color=GREY)
                if part.get('unlisted'):
                    run(m, '   ·   page is not linked from the menus', size=9, italic=True, color=GREY)
            if part.get('appears_on'):
                if part.get('path'):
                    run(m, '\n', size=9)
                run(m, 'Changing anything here changes: ', size=9, bold=True, color=GREY)
                run(m, ', '.join(part['appears_on']), size=9, color=GREY)

            # Grouped by the section a reader would see it in, in page order.
            block, title = [], rows[0].get('section', '')
            for e in rows + [None]:
                s = e.get('section', '') if e else '\x00'
                if e is None or s != title:
                    if block:
                        if title:
                            run(para(doc, space_before=9, space_after=3), title,
                                size=10.5, bold=True)
                        add_table(doc, block)
                    block, title = [], s
                if e:
                    block.append(e)

    # ── appendix ─────────────────────────────────────────────────────────────
    if dead:
        doc.add_page_break()
        doc.add_heading('Appendix — text we could not find on the live pages', level=1)
        run(para(doc, space_after=10),
            'Each of these is written into the site but did not appear when we '
            'checked every page. Either it only shows in a particular situation — '
            'a form while it is sending, a menu while it is open — or that part of '
            'the site is currently switched off. It is here for completeness. '
            'Editing it may not change anything you can see.', size=10, color=GREY)
        by_file = {}
        for e in dead:
            by_file.setdefault(e['file'], []).append(e)
        for f, rows in sorted(by_file.items()):
            run(para(doc, space_before=9, space_after=3), f.replace('src/', ''),
                size=10, bold=True, color=GREY)
            add_table(doc, rows, note_col=False)

    doc.save(out_path)
    return len(live), len(dead)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--manifest', default='copy/copy-manifest.json')
    ap.add_argument('--out', default='copy')
    ap.add_argument('--date', default='')
    ap.add_argument('--name', default='',
                    help='output filename; defaults to a dated review name')
    a = ap.parse_args()

    with open(a.manifest, encoding='utf-8') as f:
        manifest = json.load(f)

    os.makedirs(a.out, exist_ok=True)
    # The filename is the first thing a reviewer sees, in an inbox next to
    # forty other attachments. It says what it is and which round it is, so
    # that a second review does not overwrite the first in someone's folder.
    name = a.name or f'NaviNetics Website Copy - Review {a.date or "draft"}.docx'
    out_path = os.path.join(a.out, name)
    live, dead = build(manifest, out_path, a.date or 'Generated today')
    print(f'\n  {live} pieces of text, {dead} in the appendix -> {out_path}\n')
    return 0


if __name__ == '__main__':
    sys.exit(main())
