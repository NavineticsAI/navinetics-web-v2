# Epics — NaviNetics website

Nine epics. **Local only** — nothing has been created on GitHub.

The drafting run produced 72 tickets, which is too many to run a project from and contained real
duplication across streams. They are collapsed here and kept in full in
[10-tickets.md](10-tickets.md); every one of them appears below as a checklist line, so nothing
was dropped in the consolidation.

| Epic | Title | Owner | Status | Items |
|---|---|---|---|---|
| **E1** | Restore the deployed site | engineering | DONE | 3 |
| **E2** | Published claims and regulatory status | navinetics-regulatory | BLOCKED | 23 |
| **E3** | Legal pages, permissions and patient imagery | navinetics-legal | BLOCKED | 8 |
| **E4** | Conversion and commercial content | engineering | READY | 6 |
| **E5** | Layout and design system | engineering | DONE | 4 |
| **E6** | Accessibility | engineering | READY | 7 |
| **E7** | Performance | engineering | READY | 13 |
| **E8** | Discoverability | engineering | READY | 2 |
| **E9** | Verification tooling | engineering | READY | 6 |

**Three of the nine are blocked on NaviNetics, not on engineering.** E2 and E3 between them hold
almost everything that cannot be closed by writing code.

---


## E1 · Restore the deployed site

`P0` · owner **engineering** · **DONE** · 3 items

The site did not work in production. `base` was written as a bare segment, the router had no matching basename so the home page rendered the 404 component, GitHub Pages had no 404.html so every deep link and refresh died, and 21 images referenced from public/ resolved against the server root. Two internal links pointed at routes that never existed.

**Done when** — All 17 routes render at the deployed URL shape, gated by `npm run check:build` in CI.

- [x] Fix the four faults that broke the GitHub Pages deploy
- [x] Resolve public/ assets through asset() so images load under the sub-path
- [x] Repair the two dead internal routes and redirect the old paths

---

## E2 · Published claims and regulatory status

`P0` · owner **navinetics-regulatory** · **BLOCKED** · 23 items

Six unsubstantiated claims had reached production, including a comparative "0.6 mm deviation" benchmark the codebase itself recorded as held back pending sign-off. Those are removed and the FDA 510(k) clearance the company already publishes is restored. What remains is information only NaviNetics holds — and until it arrives the site says less than it could.

**Done when** — Every quantitative or regulatory statement on the site is traceable to a NaviNetics-approved source.

- [x] Remove the six unsubstantiated claims that reached production
- [x] Restore the FDA 510(k) clearance statement and the company's own product language
- [x] Company-wide decision on "safe, effective and high-quality" — kept — **regulatory**
- [ ] Clear or replace the patient CT studies published on the Education page — **clinical**
- [ ] Confirm or withdraw the two patient CT studies on the Education page — **clinical**
- [ ] Confirm whether MAVEN is used in human recordings, and under what authorisation — **regulatory**
- [ ] Supply the D1 510(k) clearance number and clearance date — **regulatory**
- [ ] Supply the MR safety classification and conditions for the D1 MR Localizer Kit — **regulatory**
- [ ] Confirm who manufactures the carbon-fibre surgical tables, and their regulatory status — **regulatory**
- [ ] Decide whether D1 and MAVEN replace or sit alongside the existing product names — **marketing**
- [ ] Supply intended use, Rx-only, MR safety and reprocessing information for the D1 — **regulatory**
- [ ] Supply per-market regulatory status for the distributor territories (CE, UKCA, TGA, NMPA, MFDS) — **regulatory**
- [ ] Supply reprocessing and sterilisation instructions for the reusable D1 — **regulatory**
- [ ] Supply the D1 510(k) number and clearance date — **regulatory**
- [ ] Supply the Rx-only statement and a formal indications-for-use block for the D1 — **regulatory**
- [ ] Classify NaviNetics AI and sign off its body copy, intended use and intended user — **regulatory**
- [ ] Confirm whether X-ray reticles, the microdrive and DBS lead accessories ship as standard — **marketing**
- [ ] Decide the product naming and the company-wide "safe and effective" wording — **marketing**
- [ ] Decide whether the per-fiducial accuracy values on Education figure 02.3.b may be public — **regulatory**
- [ ] Decide whether the two held-back NaviNetics AI performance figures may be published — **regulatory**
- [ ] Supply D1 compatibility, service, warranty and training information — **regulatory**
- [ ] Name a claims-review owner and define the sign-off gate for public copy — **regulatory**
- [ ] Resolve the NaviNetics Asia name-and-logo mismatch on the partners page — **marketing**

---

## E3 · Legal pages, permissions and patient imagery

`P1` · owner **navinetics-legal** · **BLOCKED** · 8 items

The site carries no privacy policy, terms, cookie notice, accessibility statement or legal-entity imprint, and has EU/UK/Asia distributors. Five partner marks and several journal figures are published with no permission record. Two patient CT studies are live on the Education page with the de-identification review the repo itself asks for still outstanding.

**Done when** — Nothing is published that the company cannot show it has the right to publish.

- [ ] Provide the legal pages and the entity imprint — **legal**
- [ ] Publish the complaint intake route and the adverse-event reporting path — **regulatory**
- [ ] Confirm permission for the partner logos and the journal figures — **legal**
- [ ] Supply the Mayo Clinic attribution and endorsement wording — **marketing**
- [ ] Supply the Mayo Clinic attribution wording and endorsement disclaimer — **legal**
- [ ] Clear or replace the journal figures used across three pages — **legal**
- [ ] Supply privacy policy, terms of use, cookie notice, accessibility statement and imprint — **legal**
- [ ] Obtain written permission for the five partner marks — **legal**

---

## E4 · Conversion and commercial content

`P1` · owner **engineering** · **READY** · 6 items

The only enquiry form on the site validated input and then discarded it, and every CTA funnelled into it. That is fixed. Beyond it, a buyer still cannot find specifications, compatibility, service or warranty, and the MAVEN spec table exists in the data but renders on no live route.

**Done when** — A surgeon or purchasing manager can find what they need and has somewhere to go next.

- [x] Make the contact form actually transmit the message
- [x] Take internal editorial notes off the public pages
- [ ] Render MAVEN's specification table on the MAVEN page
- [ ] Retire the unreachable /products/:slug template
- [ ] Commission the two outstanding Education photographs — **marketing**
- [ ] Supply a defaced surface render and the frame origin offset for the NaviNetics AI demo — **clinical**

---

## E5 · Layout and design system

`P1` · owner **engineering** · **DONE** · 4 items

Half the site's sections sat on a 1024px measure and half on 1280px, alternating within single pages, and adjacent sections stacked their full padding into 320px voids. An ultrawide showed 1280px of content in 3840px of screen.

**Done when** — One measure, one gutter, one rhythm. 68 of ~70 sections share a left edge at every width.

- [x] Unify the site onto one measure, one gutter and one vertical rhythm
- [x] Give the Technology mega-panel drawn marks instead of duplicated product photography
- [ ] Reduce the intra-section mt-* ladder to a scale and normalise three page headers
- [x] Record the makeAnchor scene rebuild as tried, rejected and reverted

---

## E6 · Accessibility

`P1` · owner **engineering** · **READY** · 7 items

Hospitals procure against Section 508 and EN 301 549, so this is a purchasing blocker rather than polish. The mega-menu was keyboard-unreachable, putting eleven pages out of reach; the media lightbox claimed `aria-modal` and delivered none of it; dark-theme status colours were inherited from the light theme and sat below AA. Those are fixed. The rest is outstanding.

**Done when** — The site is operable by keyboard and screen reader throughout, and meets WCAG 2.2 AA.

- [x] Fix dark-theme status contrast, the missing Careers h1 and the 36px menu button
- [x] Make the mega-menu keyboard-operable and the media lightbox a real dialog
- [ ] Announce route changes to screen readers
- [ ] Take focusable controls out of the aria-hidden SVG in EduFigures
- [ ] Give the locator-map markers a keyboard handler or make them non-interactive
- [ ] Give the NaviNetics AI demo usable controls below 1024px
- [ ] Put the theme toggle in the persistent bar below 640px

---

## E7 · Performance

`P1` · owner **engineering** · **READY** · 13 items

Two pages hold the main thread at ~93% while the visitor does nothing, so taps queue and the hamburger feels broken — the menu itself paints in 30-107ms. Two optimisations were made on the theory that drawing was the cost and **neither moved the number**, so the next step is to prove the cause before changing anything else.

**Done when** — Steady-state busy under 20% on every route, with a regression gate to keep it there.

- [ ] Bring /company/partners steady-state busy from 93.8% to under 20%
- [ ] Bring /products/maven-neuromodulation steady-state busy from 91.9% to under 20%
- [ ] Spike: profile /products/maven-neuromodulation to the depth Partners got
- [ ] Spike: prove or kill the place() layout hypothesis on /company/partners
- [ ] Measure the hamburger on the two routes where it actually feels broken
- [ ] Instrument place() before optimising the two pages that peg the main thread
- [ ] Add a steady-state busy% regression gate to check-perf
- [x] Globe dot batching and graticule precompute: landed, no measured gain, kept anyway
- [x] Split the bundle and stop the globe drawing off-screen — and record that it did not fix the busy ratio
- [ ] Get the entry chunk under Vite's 500 kB warning, or raise the budget on the record
- [ ] Decide whether the partners globe degrades on low-power devices — **marketing**
- [x] Measurement hygiene: observer installed once, browsers closed, median of 3
- [ ] Make check-perf declare a contended measurement instead of reporting it as fact

---

## E8 · Discoverability

`P2` · owner **engineering** · **READY** · 2 items

The site is client-rendered, so a crawler that does not execute JavaScript sees one page for every route. Sharing metadata, canonical URLs, structured data, robots.txt and a sitemap are in place; prerendering is the remaining structural fix and the largest single SEO item left.

**Done when** — Every route is independently indexable and unfurls correctly when shared.

- [x] Add sharing metadata, structured data, robots and sitemap, and per-route canonical/OG
- [ ] Prerender the routes at build time

---

## E9 · Verification tooling

`P2` · owner **engineering** · **READY** · 6 items

Every failure in E1 was invisible in dev and fatal in production, and the build passed throughout. The checks exist so that class of thing cannot ship twice. Some are not yet wired into CI, and the WebKit check needs a browser install step.

**Done when** — Every failure class that has bitten once is gated automatically.

- [x] Add the check tools and gate the build in CI
- [ ] check-routes.mjs still leaks a headless Chrome on every run
- [ ] Add the missing check npm scripts and run check:copy in CI
- [ ] Install Playwright's WebKit browser in CI so check:webkit can run
- [ ] Run tools/check-resize.mjs to completion and record the result
- [ ] Verify the rgb(from ...) fix on iOS 16.3 or below

