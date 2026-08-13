# PR: Add a fourth co-founder, settle the product names, and rebuild the portraits

**Branch:** `founders-portraits-and-copy-consistency` → `main`
**Type:** Content + copy + assets
**Status:** Local only. **Not pushed.** Three commits landed, the rest is working tree.
**Author:** shubhvmhaske
**Tracker:** not yet filed

---

## 0. STATUS (2026-08-13) — read this first

- Everything here came from NaviNetics directly, in session, on 12–13 August. Several items
  **close open questions the codebase had recorded as blocked** — the NRSS name and the CBH/NaviNetics
  Asia mismatch were both written into source comments as "needs the company to decide". They have
  decided. Those comments are updated in place rather than deleted, so the decision is traceable.
- **One regression was introduced and fixed inside this branch.** Recategorising publications took
  `/technology/neuromodulation` to a blank white page. It is fixed, and §6 says what should catch it
  next time — nothing in the build did.
- **Not addressed:** the site-wide audit run on 13 August found a contact form that transmits
  nothing, no indications for use on any product, and no reprocessing information for a reusable
  Class II instrument. **None of that is in this PR.** See §8.
- Verification: build clean, all 16 routes render with no console errors, checked at 1440px in both
  themes. `oxlint` and the Playwright check scripts **cannot run on this machine** — Node 20.14
  against a project that wants ≥20.19. They must run in CI before merge.

## 1. Summary

Yoonbae Oh joins the founders. Kevin Bennet's portrait is replaced, and all four portraits are
rebuilt to one specification — same exposure, same colour, same eye line — because two are 2026
camera originals and two are web exports from the old site, and side by side they did not look like
one company.

Alongside that, four naming decisions are applied site-wide: the frame is the **NaviNetics Reusable
Stereotactic System (NRSS)**, **MAVEN** is always capitalised, "base ring" and "head ring" are gone,
and the footer draws the real logo instead of a typographic imitation of it.

The home page leads with the company's own slogan. The partners page loses three organisations,
renames a fourth to match its own mark, splits a territory that no longer held together, and gains a
Scientific Collaborators section. Publications drops its highlighted paper and reorganises onto the
three technology lines.

27 files changed, 367 insertions, 278 deletions, plus five new files.

## 2. What changed — before and after

### 2.1 People

| | Before | After |
|---|---|---|
| Founders listed | 3 | **4** — Yoonbae Oh, Ph.D., Co-Founder |
| Bennet's portrait | old site export, 500×400 | 2026 original, 1200×960 |
| Oh's portrait | — | 2026 original, 1200×960 |
| `/who-we-are` grid | `lg:grid-cols-3` | `sm:grid-cols-2 xl:grid-cols-4` — a fourth card would otherwise sit alone on its own row |
| Publications author lists | `K.H. Lee`, `K.E. Bennet`, `S.J. Goerss` bolded | `Y. Oh` added — he is senior author on the whole Neurochemistry line |
| Neuromodulation, 36-author paper | "Including **both** of NaviNetics' scientific founders" | "**Three of them** are NaviNetics founders" — Bennet, Oh and Lee are all on that byline |

Dr Oh's biography is **only** the three appointments NaviNetics supplied plus the publication record
already on this site. Nothing is inferred. It is three paragraphs where the others run four or five;
that is visible and deliberate, and the file says so.

### 2.2 Product names

| | Before | After |
|---|---|---|
| The frame | "NaviNetics D1 Stereotactic Frame System" | **"NaviNetics Reusable Stereotactic System (NRSS)"** |
| Its slug and route | `/products/d1-stereotactic-frame` | **unchanged** — no link breaks, no redirect needed |
| MAVEN | `name`/`shortName`/`family` in title case | **`MAVEN`** — the last title-case holdouts, and the fields nav, catalogue and page heading all read |
| "base ring" / "head ring" | 12 occurrences | **0** |

`products.js` carried a comment saying the NRSS name was *deliberately not used* because it might
belong to an earlier generation and needed NaviNetics to confirm it. That comment is replaced with
the decision, and records that "D1" survives as slug, route, component and asset folder.

On the ring terminology: those phrases were almost always comparisons against conventional frames
("in place of the typical head ring…"). NaviNetics chose to **delete the comparisons**, not reword
them, so the copy now describes the anchor key on its own terms. Two comparison-table cells could not
be cut without leaving holes in a row and are reworded instead.

### 2.3 Logo

Full spec: **`documentation/dev/shubham/website/12-logo.md`**.

| | Before | After |
|---|---|---|
| Navbar | masked PNG, flat `--logo-ink` `#185273` | **the artwork itself** |
| **Footer** | `Navi<span>Netics</span>` **set in the body typeface** | the artwork, `reversed` |
| Partners tile | raw `logo.png` | the artwork |
| CSS | ~200 lines of mask, stage, blend layers and animation | **removed**, with 4 theme tokens |

Two problems, one cause. The footer was drawing a *typographic imitation* of the wordmark, so every
page showed one mark above the fold and a different one below it. And the lockup everywhere else was
a **CSS mask** — this PNG supplying the silhouette, flooded with one flat colour.

A mask reads only the alpha channel, so the colour was discarded: the gradient across the ribbon,
the fold shading, and the fact that **the mark (`#196184`) and the wordmark (`#164f6a`) are two
different blues**. The flat value matched neither — `#185273`, **ΔE 6.4** against the mark, past the
threshold where a difference is visible. And because the footer had to pin a light ink to stay
legible on its dark band, the light-mode footer did not match the light-mode navbar.

`src/assets/logo.png` was verified **byte-identical to the file navinetics.com serves** (same MD5),
so it is the authoritative master and is now rendered as an `<img>` — the colour cannot drift,
because it is the colour. `nn-600` in `design-language-info/01-foundations.md` is already labelled
"Logo core" at `#164f6a`, which corroborates the measurement.

The footer takes `src/assets/logo-reversed.png`, derived from the same master in CIELAB — lightness
remapped onto a light band, hues held — so the gradient and folds survive. Its band is near-black in
*both* themes, which is why it cannot take the master.

**Given up:** the travelling highlight and hue drift, which only the mask could carry. A rebuild
invention rather than brand, traded for an exact logo. **Worth replacing:** the reversed lockup is
our derivation — an official one from the designer should supersede it.

### 2.4 Home page

| | Before | After |
|---|---|---|
| H1 | "Innovate. Elevate." | **"Targeting the future. Improving today."** — the company's own slogan, which navinetics.com leads with |
| Closing text | "Whether you're a surgeon, a researcher, or a prospective colleague — we'd like to hear from you." | **"We would like to hear from you."** |
| Hero readout | live `X / Y / Z / ◎ ISO-CENTER` coordinates | **removed** — crosshair reticle kept |
| Product plates | floating lens panel, e.g. "DEGREES OF FREEDOM 3 + 2" | **removed** on all three |

Set in sentence case, not the live site's caps: at display size this is the same face every other
heading uses, and caps would read as a different typographic system.

### 2.5 Partners

| | Before | After |
|---|---|---|
| United States | NaviNetics HQ + **Abbott** | NaviNetics HQ |
| Greater China & Singapore | one territory, **Lituo Medical**, covering China + Taiwan + Singapore | **split** — `China` and `Singapore`, no organisation named, Taiwan no longer claimed |
| South Korea | "NaviNetics Asia" + **ELIM DMP** | **CBH** |
| Territories | 5 | 6 |
| Scientific collaborators | — | **10 institutions** |
| Lead paragraph | "The organisations we work with, and the territories they cover." | removed |

**The CBH rename closes a flagged inconsistency.** `partners.js` recorded that the "NaviNetics Asia"
slot was showing the CBH mark — a name and a logo that did not match — and asked for a decision
either way. The name now follows the logo.

China and Singapore each carry a `note` saying the organisation is still to be named. `<Mark>` gained
a `leadOrg()` fallback because four call sites indexed `orgs[0]` blindly and would have crashed on a
territory with none.

The globe was rebaked: `tools/world-dots.mjs` and `src/data/worldDots.js` regenerated together, plus
new `--terr-sg` colour tokens. Singapore is smaller than one dot at 1.5° and bakes to zero, so it
carries a point marker instead.

Collaborator marks are **set in type, not as logos** — Mayo Clinic, Toronto, UT El Paso, Melbourne,
Deakin, Korea, Hanyang, Queensland, Stanford, Samsung Medical Center. The plate fixes the height, so
they are a consistent size by construction. See §8 for why no artwork.

### 2.6 Publications

| | Before | After |
|---|---|---|
| Highlighted paper | the 2025 Operative Neurosurgery paper, lifted into a card above the list | **removed** — it now sits in year order with the rest |
| Categories | 2, derived from the records (Stereotaxy, Neurochemistry) | **3, fixed** — Stereotactic Devices, Neuromodulation, NaviNetics AI |
| Empty category | could not exist | renders with a paper count and an explanatory blurb |

Category names come from `data/technology.js`, so they match the Technology nav exactly. NaviNetics AI
has no papers; NaviNetics chose to show the heading anyway. The section list had to become a fixed
array — derived from the records, a line with no papers did not exist.

### 2.7 Portraits — the rebuild

All four now share one specification. Full spec and every parameter:
**`documentation/dev/shubham/website/11-founder-portraits.md`**.

| | Face brightness | Eye line | Notes |
|---|---|---|---|
| Before | spread of **68** points | spread of **11** points of frame height | Bennet dark and flat, Goerss flash-bright, Oh yellow |
| After | spread of **4.4** | **all at 25%** | one exposure, one white balance |

Three separate problems, fixed independently: exposure, head height, colour. The centring is done
with per-portrait `object-position` rather than by cropping, so Lee's and Goerss's low-resolution
files are not cut further than the eye-line alignment already requires.

`tools/founder-portraits.py` rebuilds all four from source and **reproduces the shipped files
byte-identical**. `tools/portraits-src/` holds Lee's and Goerss's graded exports, which matter
because **no camera originals exist for those two** — these are the most upstream copies there are.

## 3. New files

| File | Why |
|---|---|
| `documentation/dev/shubham/website/11-founder-portraits.md` | The portrait spec. Not recoverable from the images. |
| `documentation/dev/shubham/website/12-logo.md` | The logo spec — the two official colours, and why masking was removed. |
| `src/assets/logo-reversed.png` | Reversed lockup for the footer's dark band. |
| `tools/founder-portraits.py` | Runnable rebuild. `--check` reports without writing. |
| `tools/portraits-src/{lee,goerss}-graded.jpg` | Irreplaceable — no originals exist. |
| `public/kevin-bennet.jpg`, `public/yoonbae-oh.jpg` | 2026 portraits. |

The old `public/kevin-bennet-150-500x400-1.jpg` is now unreferenced. Left in place deliberately —
deleting it is a separate call.

## 4. Commits

| | |
|---|---|
| `5b1c8cc` | Add Yoonbae Oh as co-founder; re-shoot and re-centre portraits |
| `d800aa9` | Site-wide naming: NRSS, MAVEN, no ring terminology, one logo |
| `f5dd607` | Zoom the 2026 portraits out to full frame |
| *working tree* | Home page, Partners, Publications, the portrait rebuild, docs and tooling |

The working tree should land as **three further commits** — home page, Partners, Publications +
the crash fix — so any one can be reverted alone.

## 5. Decisions this PR records

Each of these was an open question in the source, and each is now answered in the file that asked it.

| Question | Answer | Recorded in |
|---|---|---|
| Is the frame the NRSS? | Yes. D1 stays as slug/route/component only. | `products.js` |
| Is the Korean subsidiary CBH or NaviNetics Asia? | **CBH** — the name follows the supplied mark. | `partners.js` |
| Should ring terminology be reworded or removed? | **Removed**, comparisons deleted. | `products.js`, `d1.js`, `disciplines.js` |
| What are the publication categories? | The three technology lines, even where one is empty. | `publications.js` |
| Dr Oh's role? | **Co-Founder**. | `Founders.jsx` |

## 6. The regression, and what should catch it

`publications.js` renamed its `line` values. `neuromodulation.js:53` still filtered on the old
`'Neurochemistry'`, matched nothing, and `paperFor()` threw on the first chapter — taking
`/technology/neuromodulation` to a **blank white screen**. It rendered 1 word.

Fixed, and the page is back to 1,079 words across 8.6 screens.

**The build passed the entire time.** A filter that silently returns `[]` is invisible to it, and
nothing asserts that a route rendered anything. The cheapest guard is a smoke check that walks every
route and fails if `<main>` holds less than a threshold of text — `tools/check-routes.mjs` already
walks the route list and is the natural home for it. **Not written in this PR.**

## 7. Verification

- `npm run build` clean.
- All **16 routes** render, no console errors, checked in Chromium at 1440×900.
- Light and dark both checked on the pages this touches — the footer and partner-tile logo work is
  theme-sensitive by construction.
- Portrait tool reproduces both shipped 2026 files byte-identical.
- **Not run:** `oxlint`, `tools/check-copy.mjs`, `check-mobile`, `check-webkit`. Node 20.14 on this
  machine against a project wanting ≥20.19; `oxlint` crashes and the Playwright scripts need a webkit
  build that is not installed. **These must pass in CI before merge.**
- `package-lock.json` was reverted after a local `npm install` rewrote it — npm 10.7 strips `libc`
  fields that Linux CI needs. Do not commit a lockfile written by this Node version.

## 8. Deliberately not in this PR

- **Collaborator logos.** Ten institutional marks were attempted and the sourcing was unreliable —
  of four probes, three returned error stubs and the fourth gave Stanford's *athletics* logo rather
  than the university wordmark. These are also third-party trademarks: Mayo Clinic, Stanford and
  Samsung all restrict use by companies, because a logo on a commercial site reads as endorsement.
  Type-set names ship instead. Adding artwork later is one `logo` field each.
- **Everything in the 13 August site audit.** The contact form transmits nothing
  (`VITE_CONTACT_ENDPOINT` is set nowhere, so every enquiry — and every device complaint — falls to a
  `mailto:` handoff); no product states an indication for use; a reusable Class II instrument has no
  reprocessing information; the generic product template is reachable by no route, stranding six NRSS
  highlights and all of MAVEN's specs. **None of it is touched here.** It wants its own tickets.
- **Deleting the superseded Bennet portrait.**
- **A route smoke test** (§6).

## 9. Known limitations

- **Lee's portrait is upscaled ~2.3×** at display size. His file is a 500×400 web export, cropped to
  400×320 by the eye-line alignment. He is visibly the softest of the four. Sharpening was tried and
  rejected — it produced visible noise, and the spec now forbids it.
- **Flash versus window light cannot be graded away.** Lee and Goerss are flat and shadowless; Bennet
  and Oh are directional. Brightness, contrast, black point and colour all match now. Light direction
  does not, and it is the largest remaining difference.
- **The real fix for both is a reshoot of Lee and Goerss** — same seat, same window, same session as
  the other two.
