# BUG-127 — Mega-menu unreachable by keyboard, lightbox not a real dialog, dark contrast below AA

**Date:** 2026-08-12 · **Author:** shubhvmhaske · **Owner:** Shubham · **Type:** Bug
**Priority:** High · **Status:** Partly fixed on this branch
**Branch:** `site-fixes-2026-08` → `main` · **PR:** #3 · **Issue:** _not yet filed_

---

**Summary.** The mega-menu panels could not be reached by keyboard at all, putting eleven pages out of reach. The media lightbox declared `role="dialog" aria-modal="true"` and implemented none of what that promises. Dark-theme status colours were inherited from the light theme and sat below WCAG AA.

Hospitals and health systems procure against Section 508 and EN 301 549, so this is a purchasing blocker rather than polish. The menu failed because panels render as siblings of the bar, and focusing the next trigger unmounted the previous panel before it could be reached. Measured contrast on `--surface`: 3.81, 4.12 and 3.14:1 against a 4.5:1 requirement.

**Scope.**

- DONE — ArrowDown opens a panel and moves into it; Left/Right move between triggers; Escape returns focus
- DONE — a `useDialog` hook giving the lightbox Escape, focus move, focus trap and focus return
- DONE — dark-theme `--ok`, `--warn`, `--crit` redefined: 3.81/4.12/3.14 becomes 8.3/7.4/5.9
- DONE — the missing Careers `h1`; the mobile menu button raised to 44x44
- DONE — the implanted-system SVG no longer `aria-hidden` while holding focusable children, and its parts are tappable
- TODO — route changes are silent to screen readers
- TODO — focusable controls remain inside an `aria-hidden` SVG elsewhere in `EduFigures`
- TODO — locator-map markers are `role="button"` with no key handler
- TODO — the NaviNetics AI demo hides its controls below 1024px; the theme toggle is absent below 640px

**Acceptance.**

- [ ] Every nav destination is reachable by keyboard alone
- [ ] The lightbox closes on Escape, traps focus, and returns focus to its opener
- [ ] No status text/background pair is below 4.5:1 in either theme
- [ ] `node tools/check-tap.mjs` passes: every interactive figure part is reachable by touch

**Files.** `src/components/Navbar.jsx` — `src/lib/dialog.js` — `src/pages/Media.jsx` — `src/index.css` — `src/ui/EduFigures.jsx` — `src/pages/Careers.jsx`

**Traceability.** No requirement or risk registry exists in this repository, so none is cited. Standards: WCAG 2.2 AA, Section 508, EN 301 549. Record: `02-fixes-applied.md` §5. Numbering continues the navinetics-ai-suite series so an id is unique
across NaviNetics work. This repository is the marketing website and carries no software safety
class; regulatory exposure here is about published claims, labelled `FDA` and `regulatory`.

**Labels.** `bug` `fix` `priority-high` `accessibility` `ui/ux` `shubham`
