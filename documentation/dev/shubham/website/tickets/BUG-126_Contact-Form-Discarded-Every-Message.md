# BUG-126 — The contact form discarded every message, and product pages had no next step

**Date:** 2026-08-12 · **Author:** shubhvmhaske · **Owner:** Shubham · **Type:** Bug
**Priority:** Critical · **Status:** Partly fixed on this branch
**Branch:** `site-fixes-2026-08` → `main` · **PR:** #3 · **Issue:** _not yet filed_

---

**Summary.** The only enquiry form on the site validated the visitor's input, showed a success panel, and then told them nothing had been transmitted. Every call to action funnelled into it.

A surgeon or a purchasing manager who completed that form was told, on a medical device company's own site, that the form did not work — which is worse than having no form, because it turns an interested buyer into a lost lead and a credibility judgement in one screen. Nothing was logged, so the losses were invisible.

**Scope.**

- DONE — posts JSON to `VITE_CONTACT_ENDPOINT`, with real sending, sent and failed states
- DONE — with no endpoint set it hands the message to the mail client fully composed rather than pretending
- DONE — reasons extended to cover distribution, press, and product complaints
- DONE — `?reason=` preselects the enquiry type from product pages; "Request a quote" on D1 and the tables
- TODO — MAVEN's specification table exists in the data and renders on no live route
- TODO — retire the unreachable `/products/:slug` template; no slug reaches it

**Acceptance.**

- [ ] A submitted enquiry either reaches NaviNetics, or the visitor is handed a composed message they can send
- [ ] A product complaint has its own route, and warns against including patient identifiers
- [ ] Every product page ends with an action
- [ ] No route renders a component that cannot be reached

**Files.** `src/pages/Contact.jsx` — `src/pages/D1.jsx` — `src/pages/SurgicalTables.jsx` — `src/pages/Product.jsx` — `src/components/AnimatedRoutes.jsx`

**Traceability.** No requirement or risk registry exists in this repository, so none is cited. Record: `02-fixes-applied.md` §3. Numbering continues the navinetics-ai-suite series so an id is unique
across NaviNetics work. This repository is the marketing website and carries no software safety
class; regulatory exposure here is about published claims, labelled `FDA` and `regulatory`.

**Labels.** `bug` `fix` `priority-critical` `ui/ux` `shubham`
