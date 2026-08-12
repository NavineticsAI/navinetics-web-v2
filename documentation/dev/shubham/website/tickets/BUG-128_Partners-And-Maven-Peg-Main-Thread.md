# BUG-128 — Partners and MAVEN hold the main thread at ~93% while the page is idle

**Date:** 2026-08-12 · **Author:** shubhvmhaske · **Owner:** Shubham · **Type:** Bug
**Priority:** High · **Status:** Open — cause not proven
**Branch:** `site-fixes-2026-08` → `main` · **PR:** #3 · **Issue:** _not yet filed_

---

**Summary.** `/company/partners` and `/products/maven-neuromodulation` spend about 93% of wall-clock inside long tasks with the page settled and the visitor doing nothing. Taps queue behind the thread, which is why the hamburger felt broken — the menu itself paints in 30 to 107ms.

Two optimisations were made on the theory that drawing was the cost: batching 4,846 dot fills into about 100 colour buckets, and precomputing the graticule to remove roughly 5,300 trigonometric calls a frame. Both are strictly less work for an identical picture and **neither moved the number** — 93.1% before, 93.8% after, inside noise. They were kept because gating the loop off-screen is correct behaviour regardless. The next step is to prove the cause rather than guess a third time.

The measurement itself was wrong before it was useful, and that is worth recording: the harness installed its observer once per route, so by the sixth page every long task was counted six times and it reported 13,314ms of blocking inside a 9,000ms window — impossible on its face. All six browser tools also leaked their browser, so accumulated instances competed for the same cores as the thing being measured.

**Scope.**

- DONE — observer installed once; all six tools close their browser; median of three with the spread shown
- DONE — the globe stops drawing off-screen and in background tabs, and is capped at 30fps
- TODO — instrument `place()` in `PartnerGlobe.jsx`, which writes style on every pin, marker and chip every frame
- TODO — profile MAVEN to the same depth; it has not been investigated
- TODO — a steady-state busy% regression gate in `check-perf`
- TODO — the entry chunk is about 22kB over Vite's 500kB warning

**Acceptance.**

- [ ] Steady-state busy under 20% on every route, measured by `node tools/check-perf.mjs`
- [ ] The cause is demonstrated by instrumentation before any further optimisation is attempted
- [ ] A regression gate fails the build if busy% climbs back

**Files.** `src/ui/PartnerGlobe.jsx` — `src/lib/globeScene.js` — `src/ui/MavenHero.jsx` — `tools/check-perf.mjs` — `src/components/AnimatedRoutes.jsx`

**Traceability.** No requirement or risk registry exists in this repository, so none is cited. Record: `09-performance.md`, including how the measurement went wrong first. Numbering continues the navinetics-ai-suite series so an id is unique
across NaviNetics work. This repository is the marketing website and carries no software safety
class; regulatory exposure here is about published claims, labelled `FDA` and `regulatory`.

**Labels.** `bug` `priority-high` `performance` `shubham`
