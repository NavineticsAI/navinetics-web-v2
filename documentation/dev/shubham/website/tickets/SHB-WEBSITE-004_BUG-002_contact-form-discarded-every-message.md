# SHB-WEBSITE-004 — BUG-002 Contact form discarded every message, and product pages had no next step

**Type:** Bug
**Owner:** Shubham
**Author:** shubhvmhaske
**Status:** Partly fixed on this branch
**Source Document:** `documentation/dev/shubham/website/02-fixes-applied.md`
**PR Link:** _pending_
**Branch:** `site-fixes-2026-08` → `main`

---

## Summary

The only enquiry form on the site validated the visitor's input, showed a success panel, and then told them nothing had been transmitted. Every call to action on the site funnelled into it.

## Why this ticket exists

A surgeon or a purchasing manager who completed that form was told, on a medical device company's own site, that the form did not work — which is worse than having no form, because it converts an interested buyer into a lost lead and a credibility judgement in one screen. Nothing was logged, so the losses were invisible.

## Scope (implemented)

- DONE — posts JSON to `VITE_CONTACT_ENDPOINT` with real sending/sent/failed states
- DONE — with no endpoint set it hands the message to the mail client fully composed rather than pretending
- DONE — reasons extended to cover distribution, press and product complaints
- DONE — `?reason=` preselects the enquiry type from product pages
- DONE — "Request a quote" on the D1 and surgical tables pages
- TODO — MAVEN's specification table exists in the data and renders on no live route
- TODO — retire the unreachable `/products/:slug` template, which no slug reaches

## Affected Files

- `src/pages/Contact.jsx`
- `src/pages/D1.jsx`
- `src/pages/SurgicalTables.jsx`
- `src/pages/Product.jsx`
- `src/components/AnimatedRoutes.jsx`

## Traceability

No `REQ-*` / `RISK-*` registry exists in this repository, so none is cited. The standard is
explicit that a broken trace is worse than none, and inventing IDs here would be exactly that.
This repository is the marketing website, not device software, so it carries no IEC 62304 software
safety class; regulatory exposure here is about published claims and is labelled `FDA` /
`regulatory` where it applies.

Supporting record: `documentation/dev/shubham/website/` — audit, fixes, layout, open items,
verification, copy policy, performance.

## Acceptance Criteria

- [ ] A submitted enquiry either reaches NaviNetics or the visitor is handed a composed message they can send
- [ ] A product complaint has its own route and warns against including patient identifiers
- [ ] Every product page ends with an action
- [ ] No route renders a component that cannot be reached

## Suggested Labels

`bug` · `fix` · `priority-critical` · `ui/ux` · `shubham`
