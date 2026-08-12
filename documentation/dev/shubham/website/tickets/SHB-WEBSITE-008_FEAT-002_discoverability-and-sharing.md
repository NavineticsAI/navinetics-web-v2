# SHB-WEBSITE-008 — FEAT-002 Per-route metadata, structured data and prerendering

**Type:** Feature
**Owner:** Shubham
**Author:** shubhvmhaske
**Status:** Partly fixed on this branch
**Source Document:** `documentation/dev/shubham/website/02-fixes-applied.md`
**PR Link:** _pending_
**Branch:** `site-fixes-2026-08` → `main`

---

## Summary

The site is client-rendered with no prerendering, so a crawler or link unfurler that does not execute JavaScript saw one title and one description for all 21 routes, and every shared link rendered as a bare URL with no title, summary or image.

## Why this ticket exists

The long-tail pages — publications, education — are the ones people link to, and a product page emailed to a surgeon is the most valuable link the company has. Neither worked.

## Scope (implemented)

- DONE — Open Graph, Twitter Card and canonical tags in `index.html` as the no-JavaScript floor
- DONE — Organization JSON-LD asserting only what is verifiable from the site
- DONE — `robots.txt` and a 16-route `sitemap.xml`
- DONE — `usePageMeta` extended to set canonical and OG per route for all 18 pages
- TODO — prerender the routes at build time; this is the remaining structural fix

## Affected Files

- `index.html`
- `src/lib/meta.js`
- `public/robots.txt`
- `public/sitemap.xml`

## Traceability

No `REQ-*` / `RISK-*` registry exists in this repository, so none is cited. The standard is
explicit that a broken trace is worse than none, and inventing IDs here would be exactly that.
This repository is the marketing website, not device software, so it carries no IEC 62304 software
safety class; regulatory exposure here is about published claims and is labelled `FDA` /
`regulatory` where it applies.

Supporting record: `documentation/dev/shubham/website/` — audit, fixes, layout, open items,
verification, copy policy, performance.

## Acceptance Criteria

- [ ] A shared product link unfurls with a title, description and image
- [ ] Each route reports its own canonical URL
- [ ] Every route is independently indexable without executing JavaScript

## Suggested Labels

`enhancement` · `priority-medium` · `seo` · `shubham`
