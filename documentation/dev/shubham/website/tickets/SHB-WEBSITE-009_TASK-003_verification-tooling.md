# SHB-WEBSITE-009 — TASK-003 Automated checks for the failure classes that reached production

**Type:** Task
**Owner:** Shubham
**Author:** shubhvmhaske
**Status:** Partly fixed on this branch
**Source Document:** `documentation/dev/shubham/website/05-verification.md`
**PR Link:** _pending_
**Branch:** `site-fixes-2026-08` → `main`

---

## Summary

Every fault in BUG-001 was invisible in dev and fatal in production, and the build passed throughout. These checks exist so that class of failure cannot ship twice.

## Why this ticket exists

The existing route smoke check would not have caught the deploy break: it requested `/`, which is not the URL shape the site is served at. A check that does not exercise production geometry is not a check.

## Scope (implemented)

- DONE — `check-build` (404.html, base-prefixed assets, no root-absolute `public/` refs, robots/sitemap/OG/JSON-LD), gated in CI
- DONE — `check-routes` fixed to request the deployed base
- DONE — `check-mobile` across six real device profiles
- DONE — `check-layout` measuring edge, measure and rhythm at five widths
- DONE — `check-webkit` driving a real WebKit build rather than Chrome in an iPhone-shaped window
- DONE — `check-copy` reading rendered text and failing on editorial notes that reach the page
- DONE — `check-tap` using real touch events
- TODO — install Playwright's WebKit in CI so `check:webkit` can run there
- TODO — run `check:copy` in CI; `check-routes` still leaks a browser
- TODO — run `check-resize` to completion; verify the `rgb(from …)` fix on iOS 16.3 or below

## Affected Files

- `tools/check-build.mjs`
- `tools/check-routes.mjs`
- `tools/check-mobile.mjs`
- `tools/check-layout.mjs`
- `tools/check-webkit.mjs`
- `tools/check-copy.mjs`
- `tools/check-tap.mjs`
- `tools/check-perf.mjs`
- `.github/workflows/node.js.yml`
- `package.json`

## Traceability

No `REQ-*` / `RISK-*` registry exists in this repository, so none is cited. The standard is
explicit that a broken trace is worse than none, and inventing IDs here would be exactly that.
This repository is the marketing website, not device software, so it carries no IEC 62304 software
safety class; regulatory exposure here is about published claims and is labelled `FDA` /
`regulatory` where it applies.

Supporting record: `documentation/dev/shubham/website/` — audit, fixes, layout, open items,
verification, copy policy, performance.

## Acceptance Criteria

- [ ] Every failure class that has bitten once fails the build if reintroduced
- [ ] `check:build` runs in CI on every push
- [ ] The WebKit and copy checks are runnable in CI

## Suggested Labels

`test` · `verification` · `priority-medium` · `infra` · `shubham`
