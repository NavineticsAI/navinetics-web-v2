# SHB-WEBSITE-005 — FEAT-001 Unify the site onto one measure, one gutter and one vertical rhythm

**Type:** Feature
**Owner:** Shubham
**Author:** shubhvmhaske
**Status:** Fixed on this branch
**Source Document:** `documentation/dev/shubham/website/03-layout-system.md`
**PR Link:** _pending_
**Branch:** `site-fixes-2026-08` → `main`

---

## Summary

Roughly half the site's sections sat on a 1024px measure and half on 1280px, alternating within single pages, and adjacent sections each contributed full padding to produce 320px voids. On a 3840px ultrawide the frame showed 1280px of content in the middle of an empty screen.

## Why this ticket exists

Reported as "no unified spacing and margin and layout and sizing engine", and the measurements bore it out: at 1440px the left edge alternated between 73px and 201px as you scrolled, a 128px step between adjacent sections.

## Scope (implemented)

- One `.nn-frame` utility declaring the measure, stepping to 96rem at 1920 and 110rem at 2560
- `Section` reduced to `py-16 md:py-20 lg:py-24` — 192px between sections, down from 320px
- Nine hand-rolled sections brought onto the same gutter and rhythm
- Scene bands keep a full-bleed ground but their content joins the frame
- Technology mega-panel given drawn marks instead of the Products panel's photography
- The `makeAnchor` scene rebuild recorded as tried, rejected and reverted

## Affected Files

- `src/index.css`
- `src/ui/Section.jsx`
- `src/ui/Hero.jsx`
- `src/ui/SceneBand.jsx`
- `src/ui/ScienceBand.jsx`
- `src/ui/TechMark.jsx`
- `src/components/Navbar.jsx`

## Traceability

No `REQ-*` / `RISK-*` registry exists in this repository, so none is cited. The standard is
explicit that a broken trace is worse than none, and inventing IDs here would be exactly that.
This repository is the marketing website, not device software, so it carries no IEC 62304 software
safety class; regulatory exposure here is about published claims and is labelled `FDA` /
`regulatory` where it applies.

Supporting record: `documentation/dev/shubham/website/` — audit, fixes, layout, open items,
verification, copy policy, performance.

## Acceptance Criteria

- [ ] One content left edge per viewport width, exceptions documented
- [ ] 68 of ~70 sections share that edge at 1440px and at 1920px
- [ ] An ultrawide shows 1760px of content rather than 1280px
- [ ] `node tools/check-layout.mjs` reports one distinct edge per width

## Suggested Labels

`enhancement` · `refactor` · `priority-high` · `ui/ux` · `shubham`
