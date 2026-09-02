# The copy round trip — website ⇄ Word

Every word on the site, out to a Word document stakeholders edit with Track
Changes, and back into the source without anyone retyping anything.

```
  src/**                                            the site
    │  node tools/copy-export.mjs
    ▼
  copy/copy-manifest.json                           1,552 strings + byte ranges
    │  python tools/copy-docx.py
    ▼
  copy/NaviNetics-website-copy.docx        ─────►   stakeholders, Word, Track Changes
                                                              │
  copy/copy-changes.json                   ◄─────   python tools/copy-import.py <file.docx>
    │  node tools/copy-apply.mjs --apply
    ▼
  src/**                                            the site, updated
```

---

## 1 · Running it

| | |
|---|---|
| `npm run copy:export` | manifest + document, from the current source |
| `npm run copy:import -- <file.docx>` | read a returned document, report what changed |
| `npm run copy:apply` | show the patch — **writes nothing** |
| `npm run copy:apply -- --apply` | write it into `src/` |
| `npm run copy:check` | prove the manifest covers what the site renders |
| `npm run copy:test` | prove the round trip is lossless |

Needs `acorn` + `acorn-jsx` (devDependencies) and `python-docx` (`pip install python-docx`).

**The full loop.**

```bash
npm run copy:export                                   # build the document
# … send copy/NaviNetics-website-copy.docx out for review, get it back …
npm run copy:import -- ~/Downloads/reviewed.docx      # read it; writes nothing
npm run copy:apply                                    # look at the patch
npm run copy:apply -- --apply                         # write it
npm run build && npx oxlint src                       # confirm it still works
git diff                                              # read the change like any other
```

`copy/copy-manifest.json` **is committed**. It is the record of what the
document was built from; an import whose manifest is missing has no safe way to
write anything back.

---

## 2 · Why byte ranges, and not search-and-replace

Every string is located by the exact byte range it occupies in its file,
recorded from an AST parse.

The tempting alternative — find the old text in the file and replace it — is
wrong here, and quietly. Two founders share a job title. Four cards say
*Learn more*. `Coming soon` appears on three pages. One reviewer changing one of
them would rewrite all of them, and nothing in the diff would say why.

It has a cost, which §5 covers: offsets are only valid against the file they
were measured in.

---

## 3 · What counts as copy

A string is offered for editing if it passes a **value test** and is not
excluded by **where it sits**. Both halves are needed: `className` values are
prose-shaped often enough to fool a value test, and a headline is sometimes a
single word that no value test would pass.

The extractor understands six shapes, and the awkward ones are the point:

| shape | example | why it is not optional |
|---|---|---|
| `jsx-text` | `<p>Quality and simplicity</p>` | |
| `jsx-attr` | `<Hero title="…" />` | |
| `object-field` | `{ lead: '…' }` | most of `src/data` |
| `array-item` | `bio: ['…', '…']` | the founder biographies |
| **`concat`** | `'one half ' + 'the other'` | **how nearly every long sentence on this site is written.** A walker that only reads single literals keeps the headings and drops the paragraphs — the most dangerous kind of incomplete, because the document still looks full. Worth 140 strings. |
| **`template-dyn`** | `` `Portrait of ${f.name}` `` | shown as `Portrait of {1}`. Reviewers edit the words, never the expression. |

Plus bare strings inside JSX expressions — `{busy ? 'Sending…' : 'Send message'}`.
Conditional button labels, `Play`/`Pause`, and the error-boundary copy live
there and nowhere else; without them the Contact form's own submit button is
missing from a document claiming to hold every word on the site.

### Proving it, rather than trusting it

Heuristics that quietly drop a sentence are the failure that matters, so
coverage is **measured, not asserted**:

```bash
node tools/dump-copy.mjs copy/.rendered.json    # every line a browser renders
npm run copy:check                              # prove each one is in the manifest
```

Currently **95.6%** of rendered lines (810 of 847). The residual is text the
browser composes as you look at it — `Browse 9 papers`, `2353 × 613 mm`,
`vol 29 · pp 93-101`, a list joined with dots. Those are built from pieces that
*are* in the document and are not separately editable. The cover page says so.

Run `copy:check` after touching the extractor. A number that falls is a
sentence that just became uneditable.

---

## 4 · Why the document is a table

The obvious layout is a small grey code, then the sentence under it. It reads
well and it does not survive contact with a reviewer: the code is just another
line of text, so it gets selected with the paragraph above it and deleted, or
pasted over — and the edit can no longer be attributed to anything.

A two-column table makes the structure physical. A cell is something you edit
*inside* rather than *across*, the left column reads as furniture, and every row
is unambiguously one string. Track Changes works normally in table cells.

Order is the site's own: **site-wide chrome, then one part per page in nav
order, then the shared content libraries.** A reviewer's first question about
any sentence is *where does this appear*, and a document ordered by filename
cannot answer it. Library sections carry a **Used by these pages** line, because
one word in `src/data/products.js` can change four pages at once and the person
editing it deserves to know before they type.

`founders[0].bio[2]` is precise and useless to a marketing lead, so each row is
labelled *Founders — item 1 — Biography, paragraph 3*.

---

## 5 · What the import refuses

`copy-import.py` reads the document; `copy-apply.mjs` writes source. They are
separate commands so that reading a document is never accidentally a write, and
`--apply` is never the default.

**Tracked changes are read by hand, not through python-docx.** That library
reads a paragraph's text from its direct `w:r` children — and a run somebody
*typed* with Track Changes on is not a direct child, it sits inside a `w:ins`
wrapper. The convenient API silently returns the document as it was before
anyone edited it: no error, no changes, no clue. Reading every `w:t` in
document order is what "accept all changes" actually means, because inserted
text is in `w:t` and deleted text is in `w:delText`. Reviewers never have to
remember to accept their own changes first.

Refused, reported, and never applied:

| | |
|---|---|
| **the file moved** | The whole file is skipped if its hash differs from export. Someone pushing a copy fix during a two-week review is likely, and stale offsets would corrupt the file silently. Re-export, rebuild, re-apply. |
| **a placeholder changed** | `{1}` deleted, added or reordered. The site fills those in. |
| **a cell emptied** | Removing a sentence usually needs a layout change too. Reported for a person. |
| **a row deleted** | Reported, not guessed at. |
| **an unknown id** | The document was built from a different export. |
| **a dirty `src/`** | `--apply` refuses when there are uncommitted changes, so `git checkout -- src/` stays a clean undo of the review alone. `--force` overrides. |

Reviewer **comments** come through too, attached to the row they sit on.

Writing back, each shape is rebuilt in its own form: a concatenation is
re-wrapped to the same indentation and line budget, a template keeps its
`${expression}`, and text is escaped for the quote style it is going into — so
an apostrophe, a backslash or a `${` in someone's prose cannot end the literal
it lands in. Ranges are applied **last-first**, so writing one string never
shifts the offsets of the ones not yet written.

---

## 6 · The self-test

`npm run copy:test` edits a throwaway copy of the document the way a person
would — some changes with Track Changes on, some off — and checks that exactly
the intended edits come back:

```
  ok      plain edit
  ok      tracked edit (tracked)
  ok      jsx text
  ok      apostrophe (tracked)
  ok      double quote
  ok      backslash / backtick / dollar-brace (tracked)
  ok      placeholder kept
  ok      placeholder lost  -> correctly refused
```

Each case has a specific way of going wrong; the tracked-edit one is the case
that silently returns "no changes" if the XML is read the easy way.

An **unedited** document must import as **zero changes**. It does. Getting there
took two fixes worth keeping: source files are CRLF and Word is not, and a
template literal wrapped across source lines carries that wrap into its value —
each would otherwise have reported a spurious change on every affected
paragraph.

---

## 7 · What this does not do

- **New copy.** The document edits strings that exist. Somewhere for new text to
  live is a layout decision, so reviewers are asked to comment instead.
- **Reordering.** Moving a paragraph is a code change.
- **Anything outside `src/`.** Not `index.html`, not the sitemap, not alt text on
  files in `public/`.
- **`src/lib/**`, `worldDots.js`, `locatorMap.js`.** Coordinates and easing
  curves, deliberately excluded — a stray prose-shaped constant is a distraction
  in a document meant for a marketing lead.

## 8 · If a page is added

`copy-export.mjs` holds the route list, in nav order, at the top. Add the route
and the page file. Everything else — labels, which pages a library reaches, the
document — follows.
