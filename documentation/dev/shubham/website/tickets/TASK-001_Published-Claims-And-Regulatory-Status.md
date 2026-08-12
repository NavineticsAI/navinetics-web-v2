# TASK-001 — Published claims and regulatory status need NaviNetics sign-off

**Date:** 2026-08-12 · **Author:** shubhvmhaske · **Owner:** Shubham · **Type:** Task
**Priority:** Critical · **Status:** Blocked on NaviNetics
**Branch:** `site-fixes-2026-08` → `main` · **PR:** #3 · **Issue:** _not yet filed_

---

**Summary.** Six unsubstantiated claims had reached production and are removed, and the FDA 510(k) clearance navinetics.com already publishes is restored to the D1 page. What remains is information only NaviNetics holds, and until it arrives the site says less than it is entitled to say.

One removed claim — "around 0.6 mm deviation", benchmarked against unnamed competitor software — was recorded in the codebase itself as held back pending sign-off, and shipped anyway. That is a process gap rather than an editing mistake, which is why a named claims-review owner is part of this ticket. Separately, before the clearance statement was restored this site was **less** informative than the site it replaces on the first question a hospital value-analysis committee asks.

**Scope.**

- DONE — removed: "unparalleled precision", the 0.6 mm comparative benchmark, "Superior radiolucency", "Lightweight and safe"
- DONE — restored: `FDA 510(k) cleared` on the D1 page, above the fold, as a typographic status line and not a badge (21 CFR 807.97 makes an approval-flavoured seal misbranding)
- DONE — withdrew an invented "not for use in human subjects" line on MAVEN which navinetics.com may contradict
- DONE — "safe, effective and high-quality" kept, at NaviNetics' direction, since it is live on their site
- NEEDED — the 510(k) number and clearance date; `regulatory.number` is `null` and renders the moment it is filled
- NEEDED — MR safety classification and conditions for the MR Localizer Kit
- NEEDED — intended use, an Rx-only statement, and a formal indications-for-use block for the D1
- NEEDED — reprocessing and sterilisation instructions for the reusable D1
- NEEDED — whether MAVEN is used in human recordings, and under what authorisation
- NEEDED — per-market status for the distributor territories: CE, UKCA, TGA, NMPA, MFDS
- NEEDED — classification, intended use and intended user for NaviNetics AI
- NEEDED — whether the two held-back AI performance figures and the per-fiducial accuracy values may be public
- NEEDED — product naming: do D1 and MAVEN replace or sit alongside the existing names
- NEEDED — whether X-ray reticles, the microdrive and DBS lead accessories ship as standard
- NEEDED — a named claims-review owner, and a sign-off gate for public copy

**Acceptance.**

- [ ] Every quantitative or regulatory statement on the site traces to a NaviNetics-approved source
- [ ] The chip renders as `FDA 510(k) cleared · K######` with no code change once the number is supplied
- [ ] "Cleared" is used throughout; "approved" appears nowhere in relation to a 510(k) device
- [ ] A named owner signs off public copy before it ships

**Files.** `src/data/products.js` — `src/ui/D1Hero.jsx` — `src/pages/D1.jsx` — `src/pages/Maven.jsx` — `src/pages/NaviNeticsAI.jsx` — `src/data/orTables.js`

**Traceability.** No requirement or risk registry exists in this repository, so none is cited. Record: `08-existing-site.md`, `04-open-items.md` §A. Numbering continues the navinetics-ai-suite series so an id is unique
across NaviNetics work. This repository is the marketing website and carries no software safety
class; regulatory exposure here is about published claims, labelled `FDA` and `regulatory`.

**Labels.** `documentation` `priority-critical` `FDA` `regulatory` `blocked` `shubham`
