# BUG-125 — The deployed site rendered the 404 page and served no images

**Date:** 2026-08-12 · **Author:** shubhvmhaske · **Owner:** Shubham · **Type:** Bug
**Priority:** Critical · **Status:** Fixed on this branch
**Branch:** `site-fixes-2026-08` → `main` · **PR:** #3 · **Issue:** _not yet filed_

---

**Summary.** Four faults compounded and the deployed site did not work at all. `base` was written as a bare segment rather than a path; `<Router>` had no matching `basename`, so the pathname matched no route and the home page rendered the 404 component; GitHub Pages had no `404.html`, so every deep link and refresh returned its own 404 before the app booted; and 21 images referenced from `public/` resolved against the server root.

Every one of these is invisible in dev, because the dev server is served from `/` — the base is `/` and nothing is prefixed — and the build passed throughout. A distributor sent a product link, a surgeon who bookmarked a page, and Googlebot all received a 404. The seven legacy redirects could never fire either, because they are React elements that only run once the app has loaded.

**Scope.**

- `base` set to `/navinetics-web-v2/`, with both slashes
- `<Router basename={import.meta.env.BASE_URL}>` so one value covers dev and build
- A Vite `closeBundle` plugin writing `dist/404.html` and `dist/.nojekyll`
- `asset()` resolving every `public/` reference against the deployed base
- The logo moved into `src/assets` and imported — a root-absolute `url()` in CSS is not rewritten
- `/company/careers` and `/products` corrected, and both added to the redirect table

**Acceptance.**

- [ ] All 17 routes render at the deployed URL shape, not only at the server root
- [ ] `dist/404.html` is byte-identical to `dist/index.html`, and `.nojekyll` exists
- [ ] No `public/` filename survives as a root-absolute string in any bundled file
- [ ] `npm run check:build` passes, and runs in CI after the build step

**Files.** `vite.config.js` — `src/App.jsx` — `src/lib/asset.js` — `src/data/nav.js` — `src/index.css` — `tools/check-build.mjs` — `.github/workflows/node.js.yml`

**Traceability.** No requirement or risk registry exists in this repository, so none is cited. Record: `02-fixes-applied.md` §1. Numbering continues the navinetics-ai-suite series so an id is unique
across NaviNetics work. This repository is the marketing website and carries no software safety
class; regulatory exposure here is about published claims, labelled `FDA` and `regulatory`.

**Labels.** `bug` `fix` `priority-critical` `regression` `infra` `shubham`
