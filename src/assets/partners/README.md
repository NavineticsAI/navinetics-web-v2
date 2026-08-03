# Partner marks

One PNG master per organisation, named after the organisation. **To replace a
mark: drop a new PNG over the old one, keep the filename, and run**

```
node tools/partner-logos.mjs
```

That trims the new artwork to its own ink and writes the `.webp` beside it. The
page imports the `.webp`; the `.png` stays as the source of truth. Nothing in
the codebase refers to a mark by any other name, so the filename is the whole
contract.

If you drop in a **`.webp`** instead and delete the `.png`, the tool now takes
that as the replacement and rebuilds the master from it. It used to draw a
placeholder over the top of exactly that, so this is a safety net rather than a
second supported route — a `.png` is still the thing to supply.

| File | State | Where it came from |
| --- | --- | --- |
| `abbott.png` | Deck artwork | `info.pptx`, supplied as vector — the one crisp mark of the set |
| `paragon-care.png` | Deck artwork | `info.pptx`, 2256×763 |
| `lituo-medical.png` | **Low resolution** | `info.pptx`, 194×68 — soft at chip size on a 2× display |
| `cbh.png` | Reference only | `info.pptx`, 200×126. Nothing imports it — see below |
| `elim-dmp.png` | Deck artwork | `info.pptx`, 477×106 |
| `delta-medical.png` | Supplied | Dropped in by NaviNetics, 300×58 |
| `navinetics-asia.png` | Supplied | Dropped in by NaviNetics, 1485×944 — **the CBH mark** |

No placeholders remain. Every mark the page shows is the organisation's own.

**`navinetics-asia.png` currently holds the CBH mark**, at seven times the size
of the deck's copy — so `cbh.png` is now reference material rather than a mark
anything renders. The page introduces that organisation as "NaviNetics Asia"
while showing a logo that reads CBH. If South Korea should be presented as CBH
the name should follow the logo; if a NaviNetics Asia mark exists it should
replace this file. Either is one change, and the note in `src/data/partners.js`
says the same thing where a reader of the data will find it.

NaviNetics' own mark is not here. It lives at `public/logo-378x75-1.png` and is
shared with the navbar, so there is one copy of it rather than two that can
drift apart.

## What to supply

Any width from about 800px up, on a **transparent or white background**, with
the artwork filling the frame — the tool crops the slack itself, so padding in
the file is neither needed nor harmful. Marks are shown at roughly 70×20 CSS px
on the page, so 800px wide is already several times the pixels a 2× display can
use.

Colour marks are used exactly as supplied, on a white plate. That is deliberate:
recolouring another organisation's mark to survive the site's dark theme is
usually a breach of their brand guidelines, and Abbott's wordmark is black, so
it would disappear entirely.

## Source deck

`info.pptx` is the original slide the marks and the territory list were taken
from. It is kept here so the extraction is reproducible — `tools/partner-logos.mjs`
reads it directly, unzipping it in-process, and only for marks whose master is
missing.
