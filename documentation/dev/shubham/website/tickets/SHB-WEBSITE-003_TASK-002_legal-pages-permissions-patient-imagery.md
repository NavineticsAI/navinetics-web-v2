# SHB-WEBSITE-003 — TASK-002 Legal pages, third-party permissions and patient imagery

**Type:** Task
**Owner:** Shubham
**Author:** shubhvmhaske
**Status:** Blocked on NaviNetics
**Source Document:** `documentation/dev/shubham/website/04-open-items.md`
**PR Link:** _pending_
**Branch:** `site-fixes-2026-08` → `main`

---

## Summary

The site carries no privacy policy, terms of use, cookie notice, accessibility statement or legal-entity imprint, and it has EU, UK and Asia distributors. Five partner marks and several journal figures are published with no permission record. Two patient CT studies are live on the Education page with the de-identification review the repository itself asks for still outstanding.

## Why this ticket exists

These gaps are pre-existing rather than introduced by this branch — navinetics.com has none of them either — which is exactly why they need an owner rather than an assumption. The patient imaging is the item to action first: one of the two studies is a volume render including facial bone, which sits directly against the HIPAA identifier for comparable images.

## Scope (implemented)

- NEEDED — privacy policy, terms of use, cookie notice, accessibility statement, legal-entity imprint
- NEEDED — a complaint intake route and an adverse-event reporting path
- NEEDED — written permission for the five partner marks
- NEEDED — clearance for the journal figures used across three pages
- NEEDED — Mayo Clinic attribution wording and an endorsement disclaimer
- NEEDED — confirmation or withdrawal of the two patient CT studies on the Education page
- DONE — `NaviNetics, Inc.` and the registered address are in the footer
- DONE — the contact form carries a plain-language data notice, which is a floor and not a policy

## Affected Files

- `src/components/Footer.jsx`
- `src/pages/Contact.jsx`
- `src/data/education.js`
- `src/data/partners.js`
- `src/data/media.js`

## Traceability

No `REQ-*` / `RISK-*` registry exists in this repository, so none is cited. The standard is
explicit that a broken trace is worse than none, and inventing IDs here would be exactly that.
This repository is the marketing website, not device software, so it carries no IEC 62304 software
safety class; regulatory exposure here is about published claims and is labelled `FDA` /
`regulatory` where it applies.

Supporting record: `documentation/dev/shubham/website/` — audit, fixes, layout, open items,
verification, copy policy, performance.

## Acceptance Criteria

- [ ] Nothing is published the company cannot show it has the right to publish
- [ ] The patient CT studies are either cleared with the basis recorded beside the import, or removed
- [ ] A visitor can find how to report a problem with a device
- [ ] The legal pages exist and are linked from the footer

## Suggested Labels

`documentation` · `priority-high` · `regulatory` · `blocked` · `shubham`
