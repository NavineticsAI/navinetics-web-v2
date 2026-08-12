# SHB-WEBSITE-002 — TASK-001 Published claims and regulatory status need NaviNetics sign-off

**Type:** Task
**Owner:** Shubham
**Author:** shubhvmhaske
**Status:** Blocked on NaviNetics
**Source Document:** `documentation/dev/shubham/website/08-existing-site.md`
**PR Link:** _pending_
**Branch:** `site-fixes-2026-08` → `main`

---

## Summary

Six unsubstantiated claims had reached production and are removed, and the FDA 510(k) clearance navinetics.com already publishes is restored to the D1 page. What remains is information only NaviNetics holds. Until it arrives the site says less than it is entitled to say.

## Why this ticket exists

One removed claim — "around 0.6 mm deviation" benchmarked against unnamed competitor software — was recorded in the codebase itself as held back pending sign-off and shipped anyway. That is a process gap rather than an editing mistake, which is why a named claims-review owner is part of this ticket. Separately, the site is currently LESS informative than the site it replaces on the first question a hospital value-analysis committee asks.

## Scope (implemented)

- DONE — removed: "unparalleled precision", the 0.6 mm comparative benchmark, "Superior radiolucency", "Lightweight and safe"
- DONE — restored: `FDA 510(k) cleared` on the D1 page, above the fold, as a typographic status line rather than a badge
- DONE — withdrew an invented "not for use in human subjects" line on MAVEN that navinetics.com may contradict
- DONE — "safe, effective and high-quality" kept, at NaviNetics' direction, since it is live on navinetics.com
- NEEDED — the 510(k) number and clearance date (`regulatory.number` is `null` and waiting)
- NEEDED — MR safety classification and conditions for the MR Localizer Kit
- NEEDED — intended use, Rx-only statement and a formal indications-for-use block for the D1
- NEEDED — reprocessing and sterilisation instructions for the reusable D1
- NEEDED — whether MAVEN is used in human recordings, and under what authorisation
- NEEDED — per-market status for the distributor territories (CE, UKCA, TGA, NMPA, MFDS)
- NEEDED — classification, intended use and intended user for NaviNetics AI
- NEEDED — whether the two held-back AI performance figures and the per-fiducial accuracy values may be published
- NEEDED — product naming: do D1 and MAVEN replace or sit alongside the existing names
- NEEDED — whether X-ray reticles, the microdrive and DBS lead accessories ship as standard
- NEEDED — a named claims-review owner and a sign-off gate for public copy

## Affected Files

- `src/data/products.js`
- `src/ui/D1Hero.jsx`
- `src/pages/D1.jsx`
- `src/pages/Maven.jsx`
- `src/pages/NaviNeticsAI.jsx`
- `src/data/orTables.js`

## Traceability

No `REQ-*` / `RISK-*` registry exists in this repository, so none is cited. The standard is
explicit that a broken trace is worse than none, and inventing IDs here would be exactly that.
This repository is the marketing website, not device software, so it carries no IEC 62304 software
safety class; regulatory exposure here is about published claims and is labelled `FDA` /
`regulatory` where it applies.

Supporting record: `documentation/dev/shubham/website/` — audit, fixes, layout, open items,
verification, copy policy, performance.

## Acceptance Criteria

- [ ] Every quantitative or regulatory statement on the site traces to a NaviNetics-approved source
- [ ] The 510(k) chip renders as `FDA 510(k) cleared · K######` with no code change once the number is supplied
- [ ] "Cleared" is used throughout and "approved" appears nowhere in relation to a 510(k) device
- [ ] A named owner signs off public copy before it ships

## Suggested Labels

`documentation` · `priority-critical` · `FDA` · `regulatory` · `blocked` · `shubham`
