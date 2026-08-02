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

| File | State | Where it came from |
| --- | --- | --- |
| `abbott.png` | Deck artwork | `info.pptx`, supplied as vector — the one crisp mark of the set |
| `paragon-care.png` | Deck artwork | `info.pptx`, 2256×763 |
| `lituo-medical.png` | **Low resolution** | `info.pptx`, 194×68 — soft at chip size on a 2× display |
| `cbh.png` | Deck artwork | `info.pptx`, 200×126 — also low resolution |
| `elim-dmp.png` | Deck artwork | `info.pptx`, 477×106 |
| `delta-medical.png` | **Placeholder** | No artwork anywhere in the deck |
| `navinetics-asia.png` | **Placeholder** | The deck still shows the pre-integration CBH mark |

`navinetics-asia.png` is deliberately a separate file from `cbh.png` rather than
a copy of it. The deck records the integration as March 2026 but still carries
the old mark, so the page needs somewhere to put the new one the moment it
exists — and until then the placeholder says plainly that it is missing.

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
