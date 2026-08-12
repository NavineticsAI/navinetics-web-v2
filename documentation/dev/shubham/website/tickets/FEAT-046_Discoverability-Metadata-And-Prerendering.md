# FEAT-046 — Per-route metadata, structured data and prerendering

**Date:** 2026-08-12 · **Author:** shubhvmhaske · **Owner:** Shubham · **Type:** Feature
**Priority:** Medium · **Status:** Partly done
**Branch:** `site-fixes-2026-08` → `main` · **PR:** #3 · **Issue:** _not yet filed_

---

**Summary.** The site is client-rendered with no prerendering, so a crawler or link unfurler that does not execute JavaScript saw one title and one description for all 21 routes, and every shared link rendered as a bare URL with no title, summary or image.

The long-tail pages — publications, education — are the ones people link to, and a product page emailed to a surgeon is the most valuable link the company has. Neither worked.

**Scope.**

- DONE — Open Graph, Twitter Card and canonical tags in `index.html` as the no-JavaScript floor
- DONE — Organization JSON-LD, asserting only what is verifiable from the site
- DONE — `robots.txt`, and a 16-route `sitemap.xml`
- DONE — `usePageMeta` extended to set canonical and OG per route, for all 18 pages
- TODO — prerender the routes at build time; the remaining structural fix

**Acceptance.**

- [ ] A shared product link unfurls with a title, a description and an image
- [ ] Each route reports its own canonical URL
- [ ] Every route is independently indexable without executing JavaScript

**Files.** `index.html` — `src/lib/meta.js` — `public/robots.txt` — `public/sitemap.xml`

**Traceability.** No requirement or risk registry exists in this repository, so none is cited. Record: `02-fixes-applied.md` §4. Numbering continues the navinetics-ai-suite series so an id is unique
across NaviNetics work. This repository is the marketing website and carries no software safety
class; regulatory exposure here is about published claims, labelled `FDA` and `regulatory`.

**Labels.** `enhancement` `priority-medium` `seo` `shubham`
