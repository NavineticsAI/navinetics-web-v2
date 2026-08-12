# Pull request — draft

> Paste into the PR body. **Not** created on GitHub; local only.

**Title:** Fix the broken deploy, unify the layout, correct published claims

---

# Fix the broken deploy, unify the layout, correct published claims

Branch `site-fixes-2026-08`, off `main` at `e20b6ef`.

| | |
|---|---|
| Committed | `e49d7db` — 69 files, +3270 / -172 |
| Uncommitted, on top | 17 files, +491 / -96 (perf work, mega-panel marks, Education layout, `check-copy`/`check-webkit`) |

The complete working record is in `docs/shubham/` (README plus nine numbered documents), written as the work happened rather than reconstructed afterwards. Every number below comes from those documents or from the diff.

---

## 1 · What and why

**The deployed site did not work.** It builds to a GitHub Pages sub-path, but the router had no matching basename, so React Router read `location.pathname` as `/navinetics-web-v2/`, matched no route, and fell through to the catch-all: the home page rendered the 404 component at the site's own home URL. Deep links never reached the router at all — Pages returned its own 404 before the app booted — so every bookmark, refresh, shared link and crawl was dead, and all seven legacy redirects in `src/data/nav.js` could never fire, because they are React elements that only run once the app has loaded.

An audit was run before anything was changed: ten specialist passes, then an adversarial pass in which a second agent tried to refute each finding by opening the cited file. 204 findings (24 critical / 75 high / 88 medium / 17 low). Five independent lenses converged on the deploy break from different angles, which is what gave confidence it was real before anything was measured. The largest category was **regulatory (46)** — the finding a generic web audit would have missed entirely, and the one with the longest tail, because most of it needs a company decision rather than code.

This PR fixes what code can fix. Section 9 is the honest list of what it does not.

---

## 2 · The deploy break

Four compounding faults. Any one alone would have broken the deploy.

| # | Fault | What a user saw | Fix |
|---|---|---|---|
| 1 | `base: "navinetics-web-v2"` in `vite.config.js` — no leading or trailing slash | Vite warns on every build; the value is concatenated rather than joined, so hashed asset URLs come out malformed | `base: '/navinetics-web-v2/'`, with a comment marking this string as the single place the deployment path is declared |
| 2 | `<Router>` had no `basename` | **The home page rendered the 404 component.** Every `<Link to="/products/…">` pushed to a URL outside the deployed base | `<Router basename={import.meta.env.BASE_URL}>` — `/` in dev, the configured base in a build, so one value covers both |
| 3 | No SPA fallback on GitHub Pages | Any direct request for `/products/d1-stereotactic-frame` found no file and got GitHub's 404. The app never booted. Every deep link, bookmark, refresh and crawl was dead | `spaFallback()` Vite plugin copies `dist/index.html` → `dist/404.html` and writes `dist/.nojekyll` at `closeBundle` |
| 4 | 19 files under `public/` referenced at the server root | Broken images in production: all three founder portraits, the D1 photography, the entire media library, the `/products/:slug` hero and gallery, two technology heroes, and — because `data/technology.js` fed `hero` into the mega-panel — **two thumbnails in the global navigation on every page** | `src/lib/asset.js` exports `asset(path)`, prefixing `BASE_URL`, no-op for already-resolved, absolute and data URLs. Applied at the 21 data-definition sites |

The logo was a separate case: it was referenced from CSS as `url("/logo-378x75-1.png")`, and a root-absolute `url()` is not rewritten either. Moved to `src/assets/logo.png` and imported — by `index.css` via a relative `url()`, by `data/partners.js` via a real import.

**Two dead internal routes.** `/company/careers` and `/products` were linked from five places and were never routes. "Work with us" and "Open roles" — the only outbound links on two Company pages — both 404'd. Retargeted to `/resources/careers` and `/products/d1-stereotactic-frame`, and both old paths added to the `redirects` table so anything already shared keeps working.

**Verified:** all 17 routes render clean in real headless Chrome at the deployed URL shape — no dead roots, no thrown exceptions, no console errors, no images that failed to decode.

---

## 3 · Claims and regulatory

### Removed

Each was removed rather than softened, and each edit carries an in-place comment saying why, so it does not come back.

| Claim | Where | Why it went |
|---|---|---|
| "unparalleled precision" | Home hero lead | Comparative accuracy claim about a targeting device, in the first sentence on the site, with no accuracy figure anywhere to substantiate it — `products.js` withholds those deliberately |
| "around 0.6 mm deviation" vs "industry-standard planning software" | `NaviNeticsAI.jsx` | Quantitative **and** comparative, no comparator named, no method, no n — for software the same page states has had no submission and no clearance. The codebase's own comments recorded it as held back pending sign-off; it shipped anyway |
| "safe, effective" ×2 | `WhoWeAre.jsx` hero + meta | FDA's terms of art, asserted about our own products |
| "safe, effective, high-quality" | `Contact.jsx` hero lead | Same |
| "Superior radiolucency" | `orTables.js` | Comparative performance claim on the one property that file explicitly states it has no figure for |
| "Lightweight and safe" | `orTables.js` | Unsubstantiated safety assertion |

The Home lead was rewritten rather than merely cut, because it also fixed a separate finding: a cold visitor could not tell what NaviNetics makes or for whom. It now names the three product lines and the field.

### Restored

Reviewing navinetics.com found the rebuild was **less** informative than the site it replaces on the first question a value-analysis committee asks. The live Frame System page states, verbatim: *"NaviNetics has developed an FDA cleared system to reduce the burden of establishing the stereotactic coordinate system for both the surgeon and the patient."* Restoring that is matching an existing public statement, not inventing one.

| Change | Files |
|---|---|
| `regulatory: { status: 'FDA 510(k) **cleared**', market: null, number: null, statement: … }` on the D1, plus a "Regulatory status" row in the spec strip | `data/products.js`, `pages/D1.jsx` |
| Five missing System Components added, including both sterilisation trays and the ground-truth fixture kit | `data/products.js` |
| Product name merged rather than renamed: `NaviNetics D1 Stereotactic Frame System`, so anyone who knows the old "NaviNetics Frame System" still finds the page | `data/products.js` |
| MAVEN stated as a preclinical research instrument, in the company's own language from the live Neuromodulation page | `data/products.js`, `pages/Maven.jsx` |
| Legal entity named in the footer | `components/Footer.jsx` |
| Quote route: `?reason=` preselects the enquiry type from product-page CTAs | `pages/Contact.jsx`, `pages/D1.jsx`, `pages/SurgicalTables.jsx` |

`number` is `null` rather than absent on purpose — **the 510(k) number and clearance date are still wanted.** A bare "FDA cleared" is weaker than it needs to be, and the number is public record once NaviNetics confirms which one it is. Nothing else is asserted: no CE, UKCA, TGA or NMPA status appears anywhere, because the company states none.

"Cleared", never "approved", throughout. The chip reads `FDA 510(k) cleared`; 510(k) clearance and PMA approval are different things and a clinical reader knows the difference.

### One correction, recorded

An earlier pass of this work added `aka: ['WINCS', 'WINCS Harmoni']` to MAVEN and shipped a page line reading *"Published as WINCS — the instrument the papers describe."* **That was wrong.** WINCS is an earlier generation, confirmed by NaviNetics; the papers describe its predecessor. Saying otherwise tells a researcher the wrong thing about what the published work applies to. The codebase had already warned against exactly this at `src/data/maven.js:61` — *"that is a sentence NaviNetics should supply rather than one to infer from a deck"* — and it was inferred anyway. Both the alias and the page line are removed and the reason recorded in `products.js` so it is not re-added.

### The one thing that is a company decision, not a code change

**"Safe, effective and high-quality."** This PR removes the phrase from Who We Are, Contact and the footer, on the reasoning that "safe and effective" is FDA's term of art for a device it has authorised. That reasoning holds — **but the same sentence is live on navinetics.com right now, on at least three pages, and has been since 2021.**

So this is not a page edit. It is a company-wide wording decision that affects the live site too, and it belongs to whoever owns claims review, not to a rebuild. It is escalated in `docs/shubham/08-existing-site.md` and left there. Worth noting the phrase is less exposed than it was: with FDA clearance now actually stated, it reads differently than it did on a page with no regulatory status at all.

Related process finding, also not a code change: six unsubstantiated claims reached production, and at least one was recorded in the code as held back pending sign-off and shipped regardless. **That is a process gap and it needs an owner.**

---

## 4 · Layout

Two complaints, both measurable, both confirmed with `tools/check-layout.mjs` before anything was changed.

### Before, measured at 1440px

Content left edge — a near-even split between two edges 128px apart, so the left margin stepped in and out as you scrolled a single page:

```
 73px × 27 sections    max-w-7xl, centred
201px × 22 sections    max-w-5xl, centred
 32px × 18 sections    full-bleed scene bands
```

Section top padding — eight distinct values:

```
160px × 31   Section at lg:py-40 — the intended standard
144px × 12   hand-rolled pt-36 page headers
128px × 12   hand-rolled py-32, missing the lg: step
  0px × 10   full-bleed
112 / 64 / 56 / 48   one-off each
```

`Section` was `py-24 md:py-32 lg:py-40` — 160px a side. Sections stack, so two adjacent ones produced **320px of empty space**, about a third of a laptop screen with nothing in it.

### After

| Axis | Before | After |
|---|---|---|
| Measure | `max-w-5xl` (1024) and `max-w-7xl` (1280), mixed within pages; plus hand-rolled `max-w-4xl` and `max-w-[96rem]` | One `.nn-frame`: 80rem (1280), stepping to 96rem at ≥1920 and 110rem (1760) at ≥2560 |
| Gutter | `px-6 lg:px-8` in `Section`; bare `px-6` in every hand-rolled section, sitting 8px left above 1024px | `px-6 lg:px-8` everywhere, declared once |
| Rhythm | `py-24 md:py-32 lg:py-40` → 320px between sections | `py-16 md:py-20 lg:py-24` → **192px between sections, 40% less dead space** |

Content left edge, final, one value per width means the site aligns:

| Viewport | Result |
|---|---|
| 375 | 24px × 64 (+ 6 full-bleed) |
| 768 | 24px × 63 |
| 1024 | 32px × 63 |
| 1440 | **73px × 68** |
| 1920 | **185px × 68** |

The 201px edge is gone entirely. 68 of ~70 sections share one edge at every width; the remainder are full-bleed heroes and one centred `max-w-prose` block, both deliberate.

### The scene bands — a judgement that was wrong first time

`SceneBand` and `ScienceBand` were initially left as a "deliberate exception" at a 32px content edge. That was wrong: the product pages (D1, MAVEN, surgical tables) are built almost entirely out of these bands, so the exception was not an accent — **it was the product pages.** Reported from a walkthrough as *"on product pages the margins on left and right are different, the content seems aligned to the extreme left and right as we scroll down."*

The fix separates the two things the band was conflating. **The ground stays full-bleed** — the canvas and gradient are `absolute inset-0` and unchanged, the dark bay still runs edge to edge. **The content joins the frame** — the inner grid is now `.nn-frame` with the site gutter. Column ratios nudged (28% → 30%, middle `minmax(190px,…)` → `minmax(150px,…)`) to keep the window the animation reads through proportional inside the narrower frame. That took the shared edge from 27 sections to 67.

### Ultrawide

The frame steps rather than holding flat because at 3840 × 1600 a flat 80rem showed 1280px of content and 2560px of empty ground. It now shows 1760px. The hero's targeting readout used to sit ~1300px away in the right margin — a stray instrument readout alone on the page; it is now inside the frame, under the content's own right edge.

### Deliberate exceptions — do not "fix" these

- `Hero` `pt-36` is fixed-navbar clearance, not rhythm.
- `Navbar` animates `.nn-frame` → `max-w-5xl` on scroll. That is the floating pill shrinking and it is meant to.
- Centred `max-w-prose` blocks measure ~1086px (65ch) at a 170px edge. A centred paragraph is a typographic choice inside the frame, not the frame. `check-layout.mjs` reported these as misalignments until the probe was corrected to take the widest capped element rather than the first.

`wide` is still accepted as a prop so existing call sites keep working, but it no longer does anything. Drop it from call sites as they are touched.

---

## 5 · Accessibility

Three real defects, each of which blocked something specific.

### 5.1 Dark-theme status colours were never redefined — below AA on every dark page

`--ok`, `--warn` and `--crit` were inherited from the light theme, where they are read on near-white surfaces. Against `--surface` (`#0a2231`):

| Token | Before | After |
|---|---|---|
| `--ok` | 3.81 : 1 | **8.3 : 1** |
| `--warn` | 4.12 : 1 | **7.4 : 1** |
| `--crit` | 3.14 : 1 | **5.9 : 1** |

**Blocked:** the Contact form's error text — the only feedback telling a visitor why their enquiry would not submit — and the mega-menu's "In development" label, on every dark page.

### 5.2 The mega-menu was keyboard-unreachable

The panels render as siblings of the bar (they have to, to escape the frosted pill's stacking context), which puts their links after every trigger, the theme toggle and the Contact button in DOM order. And because focusing the next trigger opens *that* panel, the panel you were on unmounted before you could reach it.

**Blocked:** every link inside Company, Products, Technology and Resources — **eleven of the site's pages, unreachable from the navigation by keyboard.** Hospitals procure against Section 508 / EN 301 549; this is a procurement blocker, not polish.

Fixed with the disclosure-navigation pattern: Down-arrow opens the panel and moves into it; Left/Right moves between triggers; Escape closes and returns focus to the trigger rather than stranding the reader at the top of the document; tabbing out of the last link closes the panel; `aria-haspopup` and `aria-controls` added. Enter still follows the trigger to its section landing page, so nothing is taken away from anyone.

### 5.3 The media lightbox claimed `aria-modal` and implemented none of it

`role="dialog" aria-modal="true"` promises four behaviours. None existed: no Escape, no focus move in, no focus trap, no focus return.

**Blocked:** for a sighted mouse user it worked. For anyone on a keyboard it opened a dialog they could not reach, could not leave, and whose backdrop they could tab straight through into the page behind. `src/lib/dialog.js` (`useDialog`) supplies all four, and the close button went from 40×40 to 44×44 with a visible focus ring.

### Smaller, alongside

- **Careers had no `h1`.** The page has no `Hero`, so its outline started at `h2` with nothing above it. `SectionHead` already took a `level` prop; both branches now pass `level="h1"`.
- **The mobile menu button was 36×36**, under the WCAG 2.2 AA target minimum — and it is the only way into the navigation on a phone. Now 44×44.

> Note for reviewers: `docs/shubham/04-open-items.md` §B1 still lists the mega-menu and the lightbox as outstanding. That section predates the commit; both are fixed in `e49d7db`. The rest of B1 (route changes silent to screen readers, focusable buttons inside `aria-hidden` SVGs in `EduFigures.jsx`, locator-map markers with no key handler) is accurate and still open.

---

## 6 · Performance — what worked, what did not

Measured on a production build in headless Chrome at 4× CPU throttle, ~1.6 Mbps / 150 ms latency — roughly a mid-range Android on hospital wifi.

### The headline, and it is not good

**Two pages peg the main thread at ~93% while the visitor does nothing, and they are still doing it after this PR.**

Steady-state busy ratio — share of wall clock spent inside long tasks after the page has settled, sampled over 5 s. Under 5% is interactive; over 30% fights back. Run-to-run spread is ~2%, so these numbers are trustworthy.

| Page | Before | After | Verdict |
|---|---|---|---|
| `/` | 0% | 0% | fine |
| `/resources/education` | 13.8% | 16.2% | acceptable |
| `/products/maven-neuromodulation` | 93.9% | **91.9%** | **unfixed** |
| `/company/partners` | 93.1% | **93.8%** | **unfixed** |

That is why the hamburger menu felt broken. The menu itself paints in 30–107 ms and settles in 110–243 ms, measured directly at 375px — **the control is not slow.** A tap has to wait for the main thread, and on those two pages it never comes free.

### Two optimisations that produced no measurable change

Both were made on the hypothesis that drawing was the bottleneck. Both are strictly less work for an identical picture. **Neither moved the busy ratio.**

1. **Dot batching.** `drawGlobe` drew 4,846 dots one at a time — a colour string built per dot, assigned to `fillStyle` (which re-parses it), then `beginPath`/`arc`/`fill`: about 24,000 canvas operations and 4,846 string allocations per frame. Now grouped into one `Path2D` per quantised colour bucket — fewer than a hundred fills, colour strings built once per bucket.
2. **Graticule precompute.** `meridians()` rebuilt the wireframe with `unit()` per point per frame — ~1,300 points, ~5,300 trigonometric calls — to redraw the same fixed lines. Now built once at module load; each frame only rotates and projects.

They are kept because they are correct, not because they helped.

**Kept regardless, because it is correct behaviour:** the globe loop now stops when off-screen (`IntersectionObserver`) and when the tab is hidden, and is capped at 30 fps. `SceneBand` and `ScienceBand` already did this; `PartnerGlobe` never had.

### What the numbers say instead

~44 long tasks per 5 s at ~107 ms each is about **9 fps, compute-bound** — the 30 fps cap was irrelevant because it never reached 30. Since the dots are not the cost, the remaining suspect is `place()` in `PartnerGlobe.jsx`: it writes `style.left`, `top`, `opacity`, `pointerEvents` and a custom property on **every pin, site marker and chip, every frame**, forcing style recalculation and layout each time. Canvas work is cheap next to synchronous layout.

**This is a hypothesis, not a finding. The last two hypotheses were wrong.** The next step is to instrument `place()` directly — comment it out and re-measure — before changing anything. MAVEN has not been investigated in the same depth; `ScienceBand` already gates on visibility, so the cost is likely `MavenHero`'s own loop or the four band scenes running together. Same method: measure first.

### Load

| Page | LCP | TBT | Long tasks |
|---|---|---|---|
| `/` | 2172 | 77 | 2 |
| `/products/d1-stereotactic-frame` | 3760 | 87 | 5 |
| `/products/maven-neuromodulation` | 2828 | 1457 | 63 |
| `/technology/navinetics-ai` | 3364 | 388 | 9 |
| `/resources/education` | 2872 | 33 | 1 |
| `/company/partners` | 2160 | 1550 | 90 |
| `/contact` | 2144 | 68 | 2 |

LCP is acceptable everywhere. The TBT on Partners and MAVEN is the same animation problem bleeding into load.

### Bundle

Entry chunk **520.9 kB / 169.4 kB gzip**, down from 552 kB. Partners, Product and Technology are now lazy routes, so `worldDots` (4,846 entries, decoded at module scope) is no longer parsed by every visitor to draw a globe on one page. **Still ~21 kB over Vite's 500 kB warning** — the remainder is React, framer-motion and the eagerly-loaded Home scene code.

### How the measurements went wrong first

Recorded because the first set of numbers were wrong and were acted on.

1. **The harness inflated later pages.** `addScriptToEvaluateOnNewDocument` was called inside the per-route loop, so by the sixth page six copies of the observer were installed and every long task counted six times. It reported 13,314 ms of blocking inside a 9,000 ms window — impossible on its face. *If a measurement exceeds its own wall clock, the instrument is wrong.*
2. **Leaked browsers poisoned every later run.** Every tool in `tools/` spawned headless Chrome and none closed one. They accumulated across the session, competing for the same cores as the thing being measured. All six now call `Browser.close`.
3. **Single runs were noise.** `/company/partners` measured 828, 2615 and 1654 ms on identical code — spread three times larger than the effect being measured. `check-perf.mjs` now reports the median of 3 with the spread shown.
4. **Load-time TBT was the wrong metric anyway.** The complaint was about a page sitting still; steady-state busy% describes that directly and is stable to ~2%.

Measurements taken while `npm run dev` is running are contended and unreliable. Stop it first.

---

## 7 · Tooling added

| Tool | Catches | In CI |
|---|---|---|
| `tools/check-build.mjs` | No browser. `404.html` exists and is byte-identical to `index.html`; `.nojekyll` exists; every asset URL in `index.html` carries the deployed base; **no `public/` file is referenced at the server root** (scans every bundled `.js`/`.css` for `"/filename"` literals); robots, sitemap, OG title, canonical and JSON-LD present | **Yes** — `npm run check:build`, wired into `.github/workflows/node.js.yml` immediately after the build step |
| `tools/check-routes.mjs` | Every route in real headless Chrome; fails on an empty root, a thrown exception, a console error, or an image that failed to decode. **Pre-existed but was requesting `/`** — the URL shape that does not exist in production, which is exactly why it never caught the missing basename. Now requests the deployed base | no |
| `tools/check-layout.mjs` | Content left edge, inner container width and section padding at 375 / 768 / 1024 / 1440 / 1920 across 16 routes, printing the distinct values | no |
| `tools/check-mobile.mjs` | Real phone profiles with touch emulation: horizontal overflow **with the offending elements named**, tap targets under 44×44, text under 12px, collapsed canvases, `h1` count, broken images, console errors — plus a screenshot per route to `tools/.mobile/`, so the design can be judged and not only measured | no |
| `tools/check-perf.mjs` | Steady-state busy%, LCP, TBT and long-task counts; median of 3 with the spread shown | no |
| `tools/check-webkit.mjs` | The site in **real WebKit** via Playwright, not Chrome in a costume. 16 routes × desktop 1440 and iPhone 15, plus whether the CSS features this codebase depends on actually *resolved* on the elements using them | no |
| `tools/check-copy.mjs` | Dev-facing language in **rendered** text. Grepping the source cannot answer this, because the same words belong in comments — this reads what a visitor can actually see | no |
| `tools/check-resize.mjs` | Exists; steps a live page through display and DPR changes. **Has not been run to completion** | no |
| `tools/shot.mjs` | One screenshot of one route at a size and scroll position, for looking at a change rather than measuring it | no |

Also added: a `perfBeacon()` Vite plugin with `apply: 'serve'`, so it exists only on the dev and preview servers and **never enters `dist/`**. It reports long-task busy% and `navigator.connection` from a real handset into the terminal running the server, which separates "the network is slow" from "the page is burning the CPU" — two causes that feel identical from the sofa.

### One thing to know before running any of them

**The headless Chrome profile must live outside the project tree.** A profile under `tools/` sits inside Vite's file watcher; Vite hits `EBUSY` the instant Chrome touches its own session or cache database and the dev server **exits**. It looks like the site is down when what actually happened is that the test harness shot the server. All the browser tools now use `os.tmpdir()`. This bit twice before it was understood. If a new tool is added, do the same.

### Results as of 2026-08-11

| Check | Result |
|---|---|
| `npm run lint` | clean (7 pre-existing warnings in `tools/`, none in `src/`) |
| `npm run build` | clean; one chunk-size warning, pre-existing |
| `check:build` | 10/10 pass |
| `check-routes` | 17/17 clean |
| `check-mobile` | 6 devices × 16 routes — no horizontal panning, one `h1` each, no broken images, no console errors |
| `check-webkit` | WebKit 26.5, 16 routes × 2 viewports — all 32 clean |
| `check-layout` | 68 of ~70 sections on one edge at every width; the rest are documented exceptions |

---

## 8 · How to review

**Read `docs/shubham/README.md` first.** It is the index; the nine numbered documents are the reasoning, and this description is a summary of them.

### The deploy fix — the part that matters most

```bash
npm ci
npm run build && npm run check:build      # no server needed; expect 10/10
npx vite preview --port 4319 --strictPort
```

Then open **`http://localhost:4319/navinetics-web-v2/`** — note the sub-path; `http://localhost:4319/` is the URL shape that does not exist in production and is what let the bug survive the old checks.

What "good" looks like:

1. The home page is the home page, not the 404 component.
2. Paste `http://localhost:4319/navinetics-web-v2/products/d1-stereotactic-frame` straight into a fresh tab and press Enter. It loads. Refresh it. It still loads. That is the 404.html fallback working.
3. Open any page and check the Products and Technology mega-panels — the thumbnails render. They 404'd on every page before.
4. Visit `/company/our-founders` and `/resources/media` — no broken images.
5. `dist/404.html` and `dist/.nojekyll` exist.

### The rest

```bash
node tools/check-routes.mjs http://localhost:4319   # expect 17/17 clean
node tools/check-layout.mjs http://localhost:4319   # ONE value per width under CONTENT LEFT EDGE
npm run check:mobile
npm run check:webkit
node tools/check-copy.mjs
npm run check:perf                                  # stop `npm run dev` first, or the numbers are contended
```

By hand:

- **Layout.** Scroll `/products/d1-stereotactic-frame` at 1440px and watch the left edge. It should not step. Compare against `main` — the difference is 128px of stepping, and it is obvious once you look for it.
- **Keyboard.** Tab to "Products" in the nav, press Down-arrow: focus should land inside the panel. Press Escape: focus returns to the trigger. Then open a media item on `/resources/media`, Tab around inside it, press Escape.
- **Dark theme.** Switch to dark, submit the contact form empty, read the error text. Then open a mega-panel and read the "In development" label.
- **Contact form.** Submit it. With no `VITE_CONTACT_ENDPOINT` set it hands off to the mail client with everything already composed. It does **not** claim to have sent anything.
- **Claims.** `git log -p e20b6ef..HEAD -- src/data/ src/pages/` — every claim edit carries a comment explaining why, which is the part worth reading.

### Please look hardest at

The D1 regulatory block in `src/data/products.js` and how it renders on `pages/D1.jsx`. It is the one place this PR *adds* a regulatory statement, and it should be checked against navinetics.com's own wording before merge.

---

## 9 · What this PR does NOT do

**Regulatory and legal — needs a NaviNetics decision, not code.**

- **The 510(k) number and clearance date.** The field is `null` and waiting.
- **No CE / UKCA / TGA / NMPA status** for any product, in any market — the company states none publicly, so neither does this.
- **No Rx-only statement, no indications-for-use block, no MR safety statement.** The D1 page advertises an MR localiser and says nothing about MR conditionality.
- **No reprocessing instructions** for a device stated to be reusable. Sterilisation trays are now named; a procedure is not.
- **No privacy policy, terms of use, cookie notice, accessibility statement.** With EU/UK/Asia distributors, EU visitors are a certainty. The contact form's inline data notice is a floor, not a policy.
- **No Mayo Clinic endorsement disclaimer**, and no permission trail for the five partner logos or the journal figures on three pages.
- **The Education page's patient imaging is untouched.** `src/data/education.js` ships two CT studies from DBS cases, one a volume render **including facial bone** — which sits directly against the HIPAA identifier for full-face images. The repository's own comments flag the de-identification review as outstanding. **Treat as urgent.** Removing published clinical content is the company's call, not a developer's, so it was not actioned.
- **"Safe and effective" is not settled** — see §3.

**Developer work, identified and not done.**

- **Prerendering.** The single highest-leverage SEO item left. OG tags, canonical, JSON-LD, robots.txt and a 16-route sitemap are in, but none of it helps a crawler that does not execute JavaScript — such a crawler still discovers exactly one URL.
- **Partners and MAVEN remain at ~93% busy.** See §6. Not fixed, and the next step is measurement, not code.
- **The entry chunk is still ~21 kB over Vite's warning.**
- **`Product.jsx` is unreachable.** All three product slugs have dedicated static routes declared above `/products/:slug`, so the template — and the only spec-table renderer on the site — never runs. The D1 and MAVEN spec data exists in the data files and renders nowhere. **The D1 page has no spec table at all** — no dimensions, weight, materials or travel ranges.
- **No request-a-quote, demo booking or document download.** The `?reason=` preselect is a routing improvement, not a quote flow. Seven pages still end with no call to action, and Partners names five territories with no way to contact any of them.
- **Remaining accessibility:** route changes are silent to screen readers (no live region, no focus move); focusable buttons are nested inside `aria-hidden` SVGs in `EduFigures.jsx`; locator-map markers are `role="button"` with no key handler; the theme toggle is still 28×32, under the 44px target.
- **Two Education figures run `requestAnimationFrame` loops that never stop**, including while scrolled off screen. ~2 MB of raw PNG/JPG in the Media grid.
- **The NaviNetics AI planning demo hides its controls below 1024px**, leaving view-only canvases. A design call, deliberately deferred.
- **Resize is not covered.** Every check loads fresh at a fixed viewport, so a component that measures once at mount and never re-measures would not be caught. `check-resize.mjs` exists but has not been run to completion.
- **Real devices are not covered.** Emulation is not a phone, and Playwright cannot supply an old WebKit — the Safari fix in this PR (explicit gradient stop tokens replacing `rgb(from …)`, which fails to parse on iOS ≤16.3 and drops the ScienceBand scrim entirely) stands on support data, not on the green WebKit 26.5 run.
- **Layout tail:** intra-section spacing still uses 15 distinct `mt-*` values with no scale behind them, and three page headers (Partners, Education, Publications) carry one-off top padding.

**A scene rebuild was tried and rejected.**

`makeAnchor` on the D1 fixation band was rebuilt as a worked example — a head in sagittal section, the base ring being replaced ghosted in and fading, three percutaneous screws advancing along the surface normal. It was reviewed and turned down: *"bad, keep the original animations."* `src/lib/d1Scenes.js` is back to its original state and **all scenes on the site are the originals.** The full account is kept in `docs/shubham/07-scene-accuracy.md` so nobody proposes the same thing again without knowing it was already seen — the abstract scenes are a deliberate house style, which `d1Scenes.js` states in its own header: *"Nothing here is a measurement, a trajectory or a coordinate; they are drawings of an argument."*

That document also carries an accurate inventory of which scenes are built from the science and which are visual texture, which is worth keeping regardless.

---

## 10 · Risk and rollback

### What could regress

| Risk | Why | Mitigation |
|---|---|---|
| The deployment path changes and `vite.config.js` is not updated | Everything breaks in exactly the same way again | `check:build` now fails the pipeline before a broken artefact can be published. `base` is a single string with a comment marking it as the only place the path is declared; for a custom domain set it to `'/'` and add `public/CNAME` — the router follows automatically through `BASE_URL` |
| A new image is added to a data file without `asset()` | It 404s in production only, and looks fine in dev | `check-build.mjs` scans every bundled `.js`/`.css` for `"/filename"` literals and fails on any |
| The rhythm change is global | Every page is 40% tighter vertically. Broad but shallow visual change; a page that relied on the old 320px gap for separation may now read as crowded | Revert surface is small: `src/ui/Section.jsx`, `src/ui/Hero.jsx` and the `.nn-frame` block in `src/index.css` |
| `wide` is now inert | A call site that passed `wide={false}` expecting a 1024px frame now gets 1280px | Deliberate, documented, and the whole point of §4. If a specific block needs to be narrow, cap the text with `max-w-prose`, not the frame |
| Dark status colours changed globally | Anything else keyed to `--ok`/`--warn`/`--crit` shifts hue on the dark theme | The new values are measured on `--surface`; if the surfaces move, re-measure. Noted in the comment beside them |
| Lazy routes (Partners, Product, Technology) | A Suspense fallback flash on a slow connection | Fallbacks are plain canvas-coloured full-height divs, so the flash is a background, not a spinner |
| `perfBeacon` | It injects a script into the served HTML | `apply: 'serve'` — it cannot reach `dist/`. `check:build` inspects the real build output if you want proof |
| Contact form with no endpoint | Submissions go through the visitor's mail client, which some visitors will abandon | **Set `VITE_CONTACT_ENDPOINT` before merge if that is not acceptable.** Formspree, Netlify Forms or a small serverless function all accept the JSON POST and all work from a static host. In CI, expose it as a repository variable to the build step. The previous behaviour — validate, show success, then admit nothing was transmitted — lost every enquiry, so mailto is strictly better than what shipped |

### Rollback

- The layout, claims and deploy work is one commit: `git revert e49d7db` undoes all of it. The remaining work is uncommitted and not yet in history.
- To roll back a single area instead: layout is `src/ui/Section.jsx` + `src/ui/Hero.jsx` + `src/ui/SceneBand.jsx` + `src/ui/ScienceBand.jsx` + the `.nn-frame` utility in `src/index.css`. The deploy fix is `vite.config.js` + `src/App.jsx` + `src/lib/asset.js` and the `asset()` call sites in `src/data/`. They are independent.
- Removing the CI gate is one block in `.github/workflows/node.js.yml`. **Do not** — it is the only thing standing between this bug class and production, and this bug class has already shipped once.

