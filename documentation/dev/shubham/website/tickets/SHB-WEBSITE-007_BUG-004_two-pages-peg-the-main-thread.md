# SHB-WEBSITE-007 — BUG-004 Partners and MAVEN hold the main thread at ~93% while the page is idle

**Type:** Bug
**Owner:** Shubham
**Author:** shubhvmhaske
**Status:** Open — cause not yet proven
**Source Document:** `documentation/dev/shubham/website/09-performance.md`
**PR Link:** _pending_
**Branch:** `site-fixes-2026-08` → `main`

---

## Summary

`/company/partners` and `/products/maven-neuromodulation` spend ~93% of wall-clock inside long tasks with the page settled and the visitor doing nothing. Taps queue behind the thread, which is why the hamburger felt broken — the menu itself paints in 30–107ms.

## Why this ticket exists

Two optimisations were made on the theory that drawing was the cost — batching 4,846 dot fills into ~100 colour buckets, and precomputing the graticule to remove ~5,300 trigonometric calls a frame. Both are strictly less work for an identical picture and **neither moved the number** (93.1% → 93.8%). The next step is therefore to prove the cause rather than guess a third time.

## Scope (implemented)

- DONE — measurement made trustworthy: the observer was being installed once per route, so later pages counted every long task six times and reported 13,314ms of blocking inside a 9,000ms window
- DONE — all six browser tools now close their browser; leaked instances were competing for the same cores
- DONE — `check-perf` reports a median of three runs with the spread shown
- DONE — the globe stops drawing off-screen and in background tabs, and is capped at 30fps
- TODO — instrument `place()` in `PartnerGlobe.jsx`, which writes style on every pin, marker and chip every frame
- TODO — profile MAVEN to the same depth; it has not been investigated
- TODO — a steady-state busy% regression gate in `check-perf`
- TODO — the entry chunk is ~22kB over Vite's 500kB warning

## Affected Files

- `src/ui/PartnerGlobe.jsx`
- `src/lib/globeScene.js`
- `src/ui/MavenHero.jsx`
- `tools/check-perf.mjs`
- `src/components/AnimatedRoutes.jsx`

## Traceability

No `REQ-*` / `RISK-*` registry exists in this repository, so none is cited. The standard is
explicit that a broken trace is worse than none, and inventing IDs here would be exactly that.
This repository is the marketing website, not device software, so it carries no IEC 62304 software
safety class; regulatory exposure here is about published claims and is labelled `FDA` /
`regulatory` where it applies.

Supporting record: `documentation/dev/shubham/website/` — audit, fixes, layout, open items,
verification, copy policy, performance.

## Acceptance Criteria

- [ ] Steady-state busy under 20% on every route, measured by `node tools/check-perf.mjs`
- [ ] The cause is demonstrated by instrumentation before any further optimisation is attempted
- [ ] A regression gate fails the build if busy% climbs back

## Suggested Labels

`bug` · `priority-high` · `performance` · `shubham`
