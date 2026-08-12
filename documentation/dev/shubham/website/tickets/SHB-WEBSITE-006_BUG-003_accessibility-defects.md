# SHB-WEBSITE-006 — BUG-003 Mega-menu unreachable by keyboard; lightbox not a real dialog; dark contrast below AA

**Type:** Bug
**Owner:** Shubham
**Author:** shubhvmhaske
**Status:** Partly fixed on this branch
**Source Document:** `documentation/dev/shubham/website/02-fixes-applied.md`
**PR Link:** _pending_
**Branch:** `site-fixes-2026-08` → `main`

---

## Summary

The mega-menu panels could not be reached by keyboard at all, putting eleven pages out of reach. The media lightbox declared `role="dialog" aria-modal="true"` and implemented none of what that promises. Dark-theme status colours were inherited from the light theme and sat below WCAG AA.

## Why this ticket exists

Hospitals and health systems procure against Section 508 and EN 301 549, so this is a purchasing blocker rather than polish. The menu failed because panels render as siblings of the bar and focusing the next trigger unmounted the previous panel before it could be reached.

## Scope (implemented)

- DONE — ArrowDown opens a panel and moves into it; Left/Right move between triggers; Escape returns focus
- DONE — `useDialog` hook giving the lightbox Escape, focus move, focus trap and focus return
- DONE — dark-theme `--ok`/`--warn`/`--crit` redefined; measured 3.81/4.12/3.14 → 8.3/7.4/5.9 on `--surface`
- DONE — the missing Careers `h1`, and the mobile menu button raised to 44×44
- DONE — the implanted-system SVG no longer `aria-hidden` while holding focusable children, and its parts are tappable
- TODO — route changes are silent to screen readers
- TODO — focusable controls still inside an `aria-hidden` SVG elsewhere in `EduFigures`
- TODO — locator-map markers are `role="button"` with no key handler
- TODO — the NaviNetics AI demo hides its controls below 1024px; the theme toggle is absent below 640px

## Affected Files

- `src/components/Navbar.jsx`
- `src/lib/dialog.js`
- `src/pages/Media.jsx`
- `src/index.css`
- `src/ui/EduFigures.jsx`
- `src/pages/Careers.jsx`

## Traceability

No `REQ-*` / `RISK-*` registry exists in this repository, so none is cited. The standard is
explicit that a broken trace is worse than none, and inventing IDs here would be exactly that.
This repository is the marketing website, not device software, so it carries no IEC 62304 software
safety class; regulatory exposure here is about published claims and is labelled `FDA` /
`regulatory` where it applies.

Supporting record: `documentation/dev/shubham/website/` — audit, fixes, layout, open items,
verification, copy policy, performance.

## Acceptance Criteria

- [ ] Every nav destination is reachable by keyboard alone
- [ ] The lightbox closes on Escape, traps focus, and returns focus to its opener
- [ ] No text/background pair used for status is below 4.5:1 in either theme
- [ ] `node tools/check-tap.mjs` passes — every interactive figure part is reachable by touch

## Suggested Labels

`bug` · `fix` · `priority-high` · `accessibility` · `ui/ux` · `shubham`
