# TASK-003 — Automated checks for the failure classes that reached production

**Date:** 2026-08-12 · **Author:** shubhvmhaske · **Owner:** Shubham · **Type:** Task
**Priority:** Medium · **Status:** Partly done
**Branch:** `site-fixes-2026-08` → `main` · **PR:** #3 · **Issue:** _not yet filed_

---

**Summary.** Every fault in BUG-125 was invisible in dev and fatal in production, and the build passed throughout. These checks exist so that class of failure cannot ship twice.

The existing route smoke check would not have caught the deploy break: it requested `/`, which is not the URL shape the site is served at. A check that does not exercise production geometry is not a check.

**Scope.**

- DONE — `check-build`: 404.html, base-prefixed assets, no root-absolute `public/` refs, robots, sitemap, OG, JSON-LD. Gated in CI
- DONE — `check-routes` fixed to request the deployed base
- DONE — `check-mobile` across six real device profiles; `check-layout` at five widths
- DONE — `check-webkit` driving a real WebKit build rather than Chrome in an iPhone-shaped window
- DONE — `check-copy` reading rendered text, including alt and aria-label, and failing on editorial notes
- DONE — `check-tap` using real touch events
- TODO — install Playwright's WebKit in CI so `check:webkit` can run there
- TODO — run `check:copy` in CI; `check-routes` still leaks a browser
- TODO — run `check-resize` to completion; verify the `rgb(from ...)` fix on iOS 16.3 or below

**Acceptance.**

- [ ] Every failure class that has bitten once fails the build if reintroduced
- [ ] `check:build` runs in CI on every push
- [ ] The WebKit and copy checks are runnable in CI

**Files.** `tools/check-build.mjs` — `tools/check-routes.mjs` — `tools/check-mobile.mjs` — `tools/check-layout.mjs` — `tools/check-webkit.mjs` — `tools/check-copy.mjs` — `tools/check-tap.mjs` — `tools/check-perf.mjs` — `.github/workflows/node.js.yml` — `package.json`

**Traceability.** No requirement or risk registry exists in this repository, so none is cited. Record: `05-verification.md`. Numbering continues the navinetics-ai-suite series so an id is unique
across NaviNetics work. This repository is the marketing website and carries no software safety
class; regulatory exposure here is about published claims, labelled `FDA` and `regulatory`.

**Labels.** `test` `verification` `priority-medium` `infra` `shubham`
