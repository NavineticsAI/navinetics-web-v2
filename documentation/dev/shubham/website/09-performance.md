# Performance

**Measured 2026-08-11.** Production build, headless Chrome, 4× CPU throttle,
~1.6 Mbps / 150 ms latency — roughly a mid-range Android on hospital wifi.

## The headline

**Two pages peg the main thread at ~93% while the visitor does nothing.**
`/company/partners` and `/products/maven-neuromodulation` run canvas animation
loops that never let the thread go idle. That is why the hamburger menu felt
broken: the menu itself paints in 30–100 ms, but a tap has to wait for the
thread, and on those pages it never comes free.

**Everything else is fine.** Home, D1, contact, education and NaviNetics AI are
all at or near 0% idle-state busy.

## Steady-state busy ratio

The metric that matches the complaint: share of wall-clock spent inside long
tasks **after the page has settled**, sampled over 5 s. Under 5% is
interactive; over 30% fights back.

| Page | Before | After | Verdict |
|---|---|---|---|
| `/` | 0% | **0%** | fine |
| `/resources/education` | 13.8% | 16.2% | acceptable |
| `/products/maven-neuromodulation` | 93.9% | **91.9%** | **unfixed** |
| `/company/partners` | 93.1% | **93.8%** | **unfixed** |

Run-to-run spread on this metric is ~2%, so these numbers are trustworthy.

## Page load

Median of 3, same throttling.

| Page | LCP | TBT | Long tasks |
|---|---|---|---|
| `/` | 2172 | 77 | 2 |
| `/products/d1-stereotactic-frame` | 3760 | 87 | 5 |
| `/products/maven-neuromodulation` | 2828 | 1457 | 63 |
| `/technology/navinetics-ai` | 3364 | 388 | 9 |
| `/resources/education` | 2872 | 33 | 1 |
| `/company/partners` | 2160 | 1550 | 90 |
| `/contact` | 2144 | 68 | 2 |

LCP is acceptable everywhere (target <2500 good, >4000 poor). The TBT on
Partners and MAVEN is the same animation problem bleeding into load.

Hamburger, measured directly at 375px: **first paint 30–107 ms, settled
110–243 ms.** The control is not slow.

---

## What was tried, and why it did not work

Two changes were made to the globe on the hypothesis that drawing was the
bottleneck. Both are strictly less work for an identical picture. **Neither
moved the busy ratio.**

1. **Dot batching.** `drawGlobe` drew 4,846 dots one at a time — a `withAlpha()`
   string built per dot, assigned to `fillStyle` (which re-parses it), then
   `beginPath`/`arc`/`fill`. About 24,000 canvas operations and 4,846 string
   allocations per frame. Now grouped into one `Path2D` per quantised colour
   bucket: fewer than a hundred fills, colour strings built once per bucket.
2. **Graticule precompute.** `meridians()` rebuilt the wireframe with `unit()`
   per point per frame — ~1,300 points, ~5,300 trigonometric calls — to redraw
   the same fixed lines. Now built once at module load; each frame only rotates
   and projects.

Also added, and **kept regardless** because it is correct behaviour: the globe
loop now stops when off-screen (`IntersectionObserver`) and when the tab is
hidden, and is capped at 30 fps. `SceneBand` and `ScienceBand` already did this;
`PartnerGlobe` never had.

**What the numbers say instead.** ~44 long tasks per 5 s at ~107 ms each is
about **9 fps, compute-bound** — the 30 fps cap was irrelevant because it never
reached 30. Since the dots are not the cost, the remaining suspect is `place()`
in `PartnerGlobe.jsx`: it writes `style.left`, `top`, `opacity`,
`pointerEvents` and a custom property on **every pin, site marker and chip,
every frame**, which forces style recalculation and layout each time. Canvas
work is cheap next to synchronous layout.

**This is a hypothesis, not a finding.** The last two hypotheses were wrong.
The next step is to instrument `place()` directly — comment it out and re-measure
— before changing anything.

## MAVEN

Not investigated in the same depth. `ScienceBand` already gates on visibility,
so the cost is likely `MavenHero`'s own loop or the four band scenes running
together. Same method applies: measure before changing.

---

## How the measurements went wrong first, and what fixed them

Worth recording, because the first set of numbers reported were wrong and acted
on.

**1. The harness inflated later pages.** `Page.addScriptToEvaluateOnNewDocument`
was called inside the per-route loop, so by the sixth page six copies of the
observer script were installed and every long task was counted six times. It
reported 13,314 ms of blocking inside a 9,000 ms window — impossible on its
face. *If a measurement exceeds its own wall clock, the instrument is wrong.*
Now installed once.

**2. Leaked browsers poisoned every later run.** Every tool in `tools/` spawned
a headless Chrome and none ever closed one. They accumulated across the session,
competing for the same cores as the thing being measured, which made each run
look worse than the last regardless of code. All six tools now call
`Browser.close`.

**3. Single runs were noise.** With those two faults present, `/company/partners`
measured 828, 2615 and 1654 ms on identical code — spread three times larger
than the effect being measured. `check-perf.mjs` now reports the **median of 3
with the spread shown**, so an untrustworthy number is visible as one.

**4. Load-time TBT was the wrong metric anyway.** The complaint was about a page
sitting still. Steady-state busy% is stable to ~2% and directly describes it.

**Also worth knowing:** measurements taken while `npm run dev` is running are
contended and unreliable. Stop it first.

---

## Layout and mobile status

**Mobile — 6 devices × 16 routes, all clean.** No horizontal panning, one `h1`
per page, no broken images, no console errors.

iPhone SE 375×667 · iPhone 15 390×844 · iPhone 15 Pro Max 430×932 ·
Galaxy S23 360×780 · Galaxy Fold shut 344×882 · iPad Mini 744×1133

**Content left edge — one value per width means the site aligns.**

| Viewport | Result |
|---|---|
| 375 | 24px × 64 (+ 6 full-bleed) |
| 768 | 24px × 63 |
| 1024 | 32px × 63 |
| 1440 | **73px × 68** |
| 1920 | **185px × 68** |

68 of ~70 sections share one edge at every width. The remainder are full-bleed
heroes and one centred `max-w-prose` block, both deliberate.

**Ultrawide.** `.nn-frame` steps 80rem → 96rem at 1920 → 110rem at 2560, so a
3840 × 1600 panel shows 1760px of content rather than 1280px stranded in the
middle. The hero's targeting readout is now inside the frame; it used to sit
~1300px away in the right margin.

## Bundle

Entry chunk **520.9 kB / 169.4 kB gzip**, down from 552 kB. Partners, Product
and Technology are split out; `worldDots` (4,846 entries) is no longer parsed by
every visitor. Still ~21 kB over Vite's 500 kB warning — the remainder is React,
framer-motion and the eagerly-loaded Home scene code.

## Safari / WebKit — tested

Playwright's WebKit build is installed (`npm i -D playwright`,
`npx playwright install webkit`) and `tools/check-webkit.mjs` drives it.

```bash
npm run build && npx vite preview --port 4319 --strictPort
npm run check:webkit
```

**WebKit 26.5, 16 routes × desktop 1440 and iPhone 15 — all 32 clean.** No
exceptions, no console errors, no broken images, no horizontal overflow, one
`h1` per page. Screenshots in `tools/.webkit/`, comparable against the Chrome
set in `tools/.mobile/`.

Every CSS feature this codebase leans on is supported and resolving:
`backdrop-filter`, `-webkit-mask-composite`, relative colour syntax, `svh`
units, `text-wrap: balance`, `scrollbar-gutter`, `aspect-ratio`, `color-mix`,
`:has()`. The `.nn-glass` panels report
`-webkit-backdrop-filter: blur(16px) saturate(1.9)` as intended, and the
ScienceBand scrim resolves to real stops:
`linear-gradient(96deg, rgb(244,247,249) 0%, rgba(244,247,249,0.88) 30%, …)`.

**An important caveat, which the green result does not remove.** WebKit 26.5 is
a *current* engine, and current Safari supports `rgb(from …)` — so this run
proves today's Safari is fine, NOT that the bug that was fixed was imaginary.
That bug affected **iOS 16.3 and below**, and Playwright cannot supply an old
WebKit. The fix stands on the support data, not on this test.

What this still does not cover: real iOS device quirks (momentum scrolling,
the dynamic viewport as the URL bar hides, Low Power Mode throttling, PWA
standalone mode) and Safari's own UI. For those, a handset on the LAN URL is
the only real answer.
- **Real devices.** The dev server binds `0.0.0.0`, so a handset on the same
  wifi can hit it directly.
- **Resize.** `tools/check-resize.mjs` exists — steps a live page through both
  attached displays including DPR changes — but has not been run to completion.
