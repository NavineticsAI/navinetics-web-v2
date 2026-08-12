## Summary

The deployed site did not work. `base` was written as a bare segment, `<Router>` had no matching
`basename` so the home page matched no route and rendered the 404 component, GitHub Pages had no
`404.html` so every deep link and refresh died before the app booted, and 21 images referenced from
`public/` resolved against the server root. The build passed throughout, and every one of these is
invisible in dev.

That is fixed and gated in CI. Alongside it: six unsubstantiated claims are removed and the FDA
510(k) clearance navinetics.com already publishes is restored, the contact form now transmits
instead of discarding every message, the layout is unified onto one measure and one rhythm, and
three accessibility defects are closed — one of which put eleven pages out of reach of a keyboard.

Two pages still hold the main thread at ~93% while idle. That is **not** fixed, and is stated as
such below rather than left for a reviewer to discover.

## Linked issues

To be filled with real numbers after issue publication:

- `BUG-001` Deployed site rendered the 404 page and served no images — _pending_
- `TASK-001` Published claims and regulatory status need NaviNetics sign-off — _pending_
- `TASK-002` Legal pages, third-party permissions and patient imagery — _pending_
- `BUG-002` Contact form discarded every message, and product pages had no next step — _pending_
- `FEAT-001` Unify the site onto one measure, one gutter and one vertical rhythm — _pending_
- `BUG-003` Mega-menu unreachable by keyboard; lightbox not a real dialog; dark contrast below AA — _pending_
- `BUG-004` Partners and MAVEN hold the main thread at ~93% while the page is idle — _pending_
- `FEAT-002` Per-route metadata, structured data and prerendering — _pending_
- `TASK-003` Automated checks for the failure classes that reached production — _pending_

## What changed

### Deploy — `BUG-001`
`base: '/navinetics-web-v2/'` · `<Router basename={import.meta.env.BASE_URL}>` · a Vite
`closeBundle` plugin emitting `404.html` and `.nojekyll` · an `asset()` helper resolving 21
`public/` references · two dead internal routes repaired and redirected.

### Claims and regulatory — `TASK-001`
Removed: "unparalleled precision", a comparative "0.6 mm deviation" benchmark the codebase itself
recorded as held back pending sign-off, "Superior radiolucency", "Lightweight and safe". Restored:
`FDA 510(k) cleared` on the D1 page, above the fold, as a typographic status line rather than a
badge — 21 CFR 807.97 makes an approval-flavoured seal misbranding. Withdrawn: an invented
"not for use in human subjects" line on MAVEN which navinetics.com may contradict. Kept at
NaviNetics' direction: "safe, effective and high-quality", which is live on their site.

### Conversion — `BUG-002`
The contact form validated input and then told the visitor nothing was sent. It now posts to
`VITE_CONTACT_ENDPOINT`, or hands the message to the mail client fully composed, and carries a
product-complaint route.

### Layout — `FEAT-001`
One `.nn-frame` measure stepping at 1920 and 2560; `Section` rhythm reduced so the gap between
sections is 192px rather than 320px. Sections sharing one left edge at 1440px went from 27 of 68 to
68 of ~70. The Technology mega-panel had been showing the same photographs as the Products panel.

### Accessibility — `BUG-003`
Mega-menu panels were unreachable by keyboard, putting eleven pages out of reach. The media lightbox
declared `aria-modal` and implemented none of it. Dark-theme status colours were inherited from the
light theme at 3.81 / 4.12 / 3.14:1. The implanted-system figure said "Hover or tap a part" and
tapping did nothing — its parts were 2.4px strokes.

### Discoverability — `FEAT-002`
Open Graph, Twitter Card, canonical, Organization JSON-LD, `robots.txt`, `sitemap.xml`, and
per-route canonical/OG for all 18 pages.

### Performance — `BUG-004`, not fixed
`/company/partners` and `/products/maven-neuromodulation` sit at ~93% busy while idle. Two
optimisations were made on the theory that drawing was the cost and neither moved the number, so the
cause is stated as unproven and the next step is instrumentation. The measurement harness itself was
wrong first — it counted long tasks up to six times over and reported 13,314ms of blocking inside a
9,000ms window — and is fixed.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | clean in `src/` (one pre-existing fast-refresh warning) |
| `npm run build` | clean; entry chunk 552 → 522 kB |
| `npm run check:build` | 10/10 — runs in CI |
| `node tools/check-routes.mjs` | 17/17 routes render at the deployed URL shape |
| `node tools/check-mobile.mjs` | 6 devices × 16 routes, no panning, no console errors |
| `node tools/check-webkit.mjs` | WebKit 26.5, 16 routes × desktop and iPhone, all clean |
| `node tools/check-copy.mjs` | 17/17 — no editorial notes reaching the page |
| `node tools/check-tap.mjs` | every interactive figure part reachable by touch |
| `node tools/check-layout.mjs` | one content edge per viewport width |

## Documentation

`documentation/dev/shubham/website/` — audit method and findings, every fix with its reason, the
layout system measured before and after, open items split by who can close them, the check tools,
the copy policy, a scene rebuild that was tried and reverted, a comparison against navinetics.com,
and the performance record including how the measurement went wrong before it was useful.

## Suggested QA

1. Load a deep link directly — `/products/d1-stereotactic-frame` — and refresh it.
2. Tab to **Company** in the nav and press ArrowDown; check focus enters the panel and Escape returns it.
3. Open an image on `/resources/media`, press Escape, and confirm focus returns to the tile.
4. Switch to dark theme and submit the contact form empty; check the error text is legible.
5. On a phone, open `/resources/education` and tap each part of the implanted-system figure.
6. Scroll `/company/who-we-are` and confirm the left edge does not step in and out.
7. Drag the window between a laptop panel and an ultrawide.
