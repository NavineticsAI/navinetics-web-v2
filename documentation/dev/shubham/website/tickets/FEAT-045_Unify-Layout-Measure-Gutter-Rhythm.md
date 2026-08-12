# FEAT-045 — Unify the site onto one measure, one gutter and one vertical rhythm

**Date:** 2026-08-12 · **Author:** shubhvmhaske · **Owner:** Shubham · **Type:** Feature
**Priority:** High · **Status:** Done
**Branch:** `site-fixes-2026-08` → `main` · **PR:** #3 · **Issue:** _not yet filed_

---

**Summary.** Roughly half the site's sections sat on a 1024px measure and half on 1280px, alternating within single pages, and adjacent sections each contributed full padding to produce 320px voids. On a 3840px ultrawide the frame showed 1280px of content in the middle of an empty screen.

Reported as "no unified spacing and margin and layout and sizing engine", and the measurements bore it out: at 1440px the content left edge alternated between 73px and 201px as you scrolled — a 128px step between adjacent sections, 27 of 68 sections on one edge and 22 on the other.

**Scope.**

- One `.nn-frame` utility declaring the measure, stepping to 96rem at 1920 and 110rem at 2560
- `Section` reduced to `py-16 md:py-20 lg:py-24` — 192px between sections, down from 320px
- Nine hand-rolled sections brought onto the same gutter and rhythm
- Scene bands keep a full-bleed ground, but their content joins the frame
- The Technology mega-panel given drawn marks; it had been showing the Products panel's photography
- The `makeAnchor` scene rebuild recorded as tried, rejected and reverted

**Acceptance.**

- [ ] One content left edge per viewport width, with the exceptions documented
- [ ] 68 of ~70 sections share that edge at 1440px and at 1920px
- [ ] An ultrawide shows 1760px of content rather than 1280px
- [ ] `node tools/check-layout.mjs` reports one distinct edge per width

**Files.** `src/index.css` — `src/ui/Section.jsx` — `src/ui/Hero.jsx` — `src/ui/SceneBand.jsx` — `src/ui/ScienceBand.jsx` — `src/ui/TechMark.jsx` — `src/components/Navbar.jsx`

**Traceability.** No requirement or risk registry exists in this repository, so none is cited. Record: `03-layout-system.md`, measured before and after. Numbering continues the navinetics-ai-suite series so an id is unique
across NaviNetics work. This repository is the marketing website and carries no software safety
class; regulatory exposure here is about published claims, labelled `FDA` and `regulatory`.

**Labels.** `enhancement` `refactor` `priority-high` `ui/ux` `shubham`
