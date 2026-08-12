# SHB-WEBSITE-001 — BUG-001 Deployed site rendered the 404 page and served no images

**Type:** Bug
**Owner:** Shubham
**Author:** shubhvmhaske
**Status:** Fixed on this branch
**Source Document:** `documentation/dev/shubham/website/02-fixes-applied.md`
**PR Link:** _pending_
**Branch:** `site-fixes-2026-08` → `main`

---

## Summary

Four faults compounded and the deployed site did not work at all: `base` was written as a bare segment rather than a path, `<Router>` had no matching `basename` so the home page matched no route and rendered the 404 component, GitHub Pages had no `404.html` so every deep link and refresh returned its own 404 before the app booted, and 21 images referenced from `public/` resolved against the server root.

## Why this ticket exists

Every one of these is invisible in dev — the dev server is served from `/`, so the base is `/` and nothing is prefixed — and every one of them broke production. The build passed throughout. A distributor sent a product link, a surgeon who bookmarked a page, and Googlebot all received a 404, and the seven legacy redirects could never fire because they are React elements that only run once the app has loaded.

## Scope (implemented)

- `base` set to `/navinetics-web-v2/` with both slashes
- `<Router basename={import.meta.env.BASE_URL}>` so one value covers dev and build
- A Vite `closeBundle` plugin writing `dist/404.html` and `dist/.nojekyll`
- `asset()` helper resolving every `public/` reference against the deployed base
- The logo moved into `src/assets` and imported, since a root-absolute `url()` in CSS is not rewritten
- `/company/careers` and `/products` corrected and added to the redirect table

## Affected Files

- `vite.config.js`
- `src/App.jsx`
- `src/lib/asset.js`
- `src/data/nav.js`
- `src/index.css`
- `tools/check-build.mjs`
- `.github/workflows/node.js.yml`

## Traceability

No `REQ-*` / `RISK-*` registry exists in this repository, so none is cited. The standard is
explicit that a broken trace is worse than none, and inventing IDs here would be exactly that.
This repository is the marketing website, not device software, so it carries no IEC 62304 software
safety class; regulatory exposure here is about published claims and is labelled `FDA` /
`regulatory` where it applies.

Supporting record: `documentation/dev/shubham/website/` — audit, fixes, layout, open items,
verification, copy policy, performance.

## Acceptance Criteria

- [ ] All 17 routes render at the deployed URL shape, not only at the server root
- [ ] `dist/404.html` is byte-identical to `dist/index.html` and `.nojekyll` exists
- [ ] No `public/` filename appears as a root-absolute string in any bundled file
- [ ] `npm run check:build` passes and runs in CI after the build step

## Suggested Labels

`bug` · `fix` · `priority-critical` · `regression` · `infra` · `shubham`
