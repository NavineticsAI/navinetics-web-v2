# Tickets — NaviNetics website

Generated from the drafting run by `tools/build-tickets.mjs`. **Local only** — nothing here
has been created on GitHub. Re-running the generator on the same input produces the same IDs.

72 tickets: **27 blocked** on NaviNetics, **27 ready** to
build, **18 done** in this branch.

Rules this list follows, which are the same rules the site follows:
never invent a regulatory claim, a certification, a clearance number, a customer or a performance
figure; "cleared" and never "approved" for a 510(k) device; and where something failed or was
reverted, say so rather than quietly dropping it.

---

## Blocked on NaviNetics — 27

Nothing here can be closed by engineering. Each names the role that must answer and what happens
to the site once they do.

| ID | Title | Owner | Pri | Est |
|---|---|---|---|---|
| NAV-001 | Clear or replace the patient CT studies published on the Education page | navinetics-clinical | P0 | M |
| NAV-002 | Confirm or withdraw the two patient CT studies on the Education page | navinetics-clinical | P0 | S |
| NAV-003 | Confirm whether MAVEN is used in human recordings, and under what authorisation | navinetics-regulatory | P0 | S |
| NAV-004 | Supply the D1 510(k) clearance number and clearance date | navinetics-regulatory | P0 | S |
| NAV-005 | Supply the MR safety classification and conditions for the D1 MR Localizer Kit | navinetics-regulatory | P0 | M |
| NAV-006 | Bring /company/partners steady-state busy from 93.8% to under 20% | engineering | P1 | M |
| NAV-007 | Bring /products/maven-neuromodulation steady-state busy from 91.9% to under 20% | engineering | P1 | M |
| NAV-008 | Confirm who manufactures the carbon-fibre surgical tables, and their regulatory status | navinetics-regulatory | P1 | S |
| NAV-009 | Decide whether D1 and MAVEN replace or sit alongside the existing product names | navinetics-marketing | P1 | S |
| NAV-010 | Provide the legal pages and the entity imprint | navinetics-legal | P1 | M |
| NAV-011 | Publish the complaint intake route and the adverse-event reporting path | navinetics-regulatory | P1 | M |
| NAV-012 | Supply intended use, Rx-only, MR safety and reprocessing information for the D1 | navinetics-regulatory | P1 | M |
| NAV-013 | Supply per-market regulatory status for the distributor territories (CE, UKCA, TGA, NMPA, MFDS) | navinetics-regulatory | P1 | M |
| NAV-014 | Supply reprocessing and sterilisation instructions for the reusable D1 | navinetics-regulatory | P1 | M |
| NAV-015 | Supply the D1 510(k) number and clearance date | navinetics-regulatory | P1 | S |
| NAV-016 | Supply the Rx-only statement and a formal indications-for-use block for the D1 | navinetics-regulatory | P1 | M |
| NAV-017 | Classify NaviNetics AI and sign off its body copy, intended use and intended user | navinetics-regulatory | P2 | M |
| NAV-018 | Confirm permission for the partner logos and the journal figures | navinetics-legal | P2 | S |
| NAV-019 | Confirm whether X-ray reticles, the microdrive and DBS lead accessories ship as standard | navinetics-marketing | P2 | S |
| NAV-020 | Decide the product naming and the company-wide "safe and effective" wording | navinetics-marketing | P2 | S |
| NAV-021 | Decide whether the partners globe degrades on low-power devices | navinetics-marketing | P2 | S |
| NAV-022 | Decide whether the per-fiducial accuracy values on Education figure 02.3.b may be public | navinetics-regulatory | P2 | S |
| NAV-023 | Decide whether the two held-back NaviNetics AI performance figures may be published | navinetics-regulatory | P2 | S |
| NAV-024 | Supply D1 compatibility, service, warranty and training information | navinetics-regulatory | P2 | M |
| NAV-025 | Supply the Mayo Clinic attribution and endorsement wording | navinetics-marketing | P2 | S |
| NAV-026 | Supply the Mayo Clinic attribution wording and endorsement disclaimer | navinetics-legal | P2 | S |
| NAV-027 | Supply a defaced surface render and the frame origin offset for the NaviNetics AI demo | navinetics-clinical | P3 | M |

## Ready to build — 27

| ID | Title | Owner | Pri | Est |
|---|---|---|---|---|
| NAV-028 | Spike: profile /products/maven-neuromodulation to the depth Partners got | engineering | P0 | M |
| NAV-029 | Spike: prove or kill the place() layout hypothesis on /company/partners | engineering | P0 | S |
| NAV-030 | Announce route changes to screen readers | engineering | P1 | M |
| NAV-031 | check-routes.mjs still leaks a headless Chrome on every run | engineering | P1 | S |
| NAV-032 | Clear or replace the journal figures used across three pages | navinetics-legal | P1 | M |
| NAV-033 | Measure the hamburger on the two routes where it actually feels broken | engineering | P1 | S |
| NAV-034 | Name a claims-review owner and define the sign-off gate for public copy | navinetics-regulatory | P1 | S |
| NAV-035 | Prerender the routes at build time | engineering | P1 | L |
| NAV-036 | Supply privacy policy, terms of use, cookie notice, accessibility statement and imprint | navinetics-legal | P1 | L |
| NAV-037 | Take focusable controls out of the aria-hidden SVG in EduFigures | engineering | P1 | S |
| NAV-038 | Add the missing check npm scripts and run check:copy in CI | engineering | P2 | S |
| NAV-039 | Get the entry chunk under Vite's 500 kB warning, or raise the budget on the record | engineering | P2 | M |
| NAV-040 | Give the locator-map markers a keyboard handler or make them non-interactive | engineering | P2 | S |
| NAV-041 | Give the NaviNetics AI demo usable controls below 1024px | engineering | P2 | M |
| NAV-042 | Install Playwright's WebKit browser in CI so check:webkit can run | engineering | P2 | S |
| NAV-043 | Instrument place() before optimising the two pages that peg the main thread | engineering | P2 | M |
| NAV-044 | Make check-perf declare a contended measurement instead of reporting it as fact | engineering | P2 | S |
| NAV-045 | Obtain written permission for the five partner marks | navinetics-legal | P2 | M |
| NAV-046 | Render MAVEN's specification table on the MAVEN page | engineering | P2 | S |
| NAV-047 | Resolve the NaviNetics Asia name-and-logo mismatch on the partners page | navinetics-marketing | P2 | S |
| NAV-048 | Retire the unreachable /products/:slug template | engineering | P2 | S |
| NAV-049 | Run tools/check-resize.mjs to completion and record the result | engineering | P2 | S |
| NAV-050 | Verify the rgb(from ...) fix on iOS 16.3 or below | engineering | P2 | S |
| NAV-051 | Add a steady-state busy% regression gate to check-perf | engineering | P3 | S |
| NAV-052 | Commission the two outstanding Education photographs | navinetics-marketing | P3 | M |
| NAV-053 | Put the theme toggle in the persistent bar below 640px | engineering | P3 | S |
| NAV-054 | Reduce the intra-section mt-* ladder to a scale and normalise three page headers | engineering | P3 | M |

## Done in this branch — 18

| ID | Title | Owner | Pri | Est |
|---|---|---|---|---|
| NAV-055 | Fix the four faults that broke the GitHub Pages deploy | engineering | P0 | M |
| NAV-056 | Make the contact form actually transmit the message | engineering | P0 | M |
| NAV-057 | Remove the six unsubstantiated claims that reached production | engineering | P0 | M |
| NAV-058 | Resolve public/ assets through asset() so images load under the sub-path | engineering | P0 | M |
| NAV-059 | Add sharing metadata, structured data, robots and sitemap, and per-route canonical/OG | engineering | P1 | M |
| NAV-060 | Add the check tools and gate the build in CI | engineering | P1 | L |
| NAV-061 | Fix dark-theme status contrast, the missing Careers h1 and the 36px menu button | engineering | P1 | S |
| NAV-062 | Make the mega-menu keyboard-operable and the media lightbox a real dialog | engineering | P1 | M |
| NAV-063 | Measurement hygiene: observer installed once, browsers closed, median of 3 | engineering | P1 | S |
| NAV-064 | Repair the two dead internal routes and redirect the old paths | engineering | P1 | S |
| NAV-065 | Restore the FDA 510(k) clearance statement and the company's own product language | engineering | P1 | M |
| NAV-066 | Take internal editorial notes off the public pages | engineering | P1 | M |
| NAV-067 | Unify the site onto one measure, one gutter and one vertical rhythm | engineering | P1 | L |
| NAV-068 | Company-wide decision on "safe, effective and high-quality" — kept | navinetics-regulatory | P2 | S |
| NAV-069 | Give the Technology mega-panel drawn marks instead of duplicated product photography | engineering | P2 | M |
| NAV-070 | Globe dot batching and graticule precompute: landed, no measured gain, kept anyway | engineering | P2 | M |
| NAV-071 | Split the bundle and stop the globe drawing off-screen — and record that it did not fix the busy ratio | engineering | P2 | L |
| NAV-072 | Record the makeAnchor scene rebuild as tried, rejected and reverted | engineering | P3 | S |

---

## Blocked — detail

Ordered by priority. P0 means a live exposure, not merely important.


### NAV-001 · Clear or replace the patient CT studies published on the Education page

`decision` · **P0** · owner **navinetics-clinical** · M · status **blocked**

The Education page publishes CT studies taken from deep brain stimulation cases. One of them, `01.2`, is a volume render that includes facial bone — a three-dimensional reconstruction of a head, which is the category HIPAA names as "full-face photographic images and any comparable images". The repository's own comment at the top of src/data/education.js flags the de-identification review as outstanding, and it has not happened. Nothing has been changed, because taking published patient imaging down is the company's call and not a developer's.

**Acceptance**
- [ ] Clinical confirms, for each published study, whether the source is a patient, a cadaver, or a phantom.
- [ ] For any patient-derived image: the de-identification method and the consent or IRB basis are documented in writing.
- [ ] Where the basis does not hold, the image is replaced with a phantom or cadaver acquisition, or removed from the page and from src/assets/education/.
- [ ] The provenance decision and its basis are recorded beside the import in src/data/education.js so the question is not re-litigated by the next person.
- [ ] The outstanding-review note at src/data/education.js lines 13-18 is replaced with the answer.

**Files** — `src/data/education.js`, `src/assets/education/01.2.png`, `src/assets/education/01.2.webp`, `src/ui/EduFigures.jsx`
**Blocked by** — Clinical lead with the privacy officer — provenance of each study, the de-identification method, and the consent or IRB basis
**Verify** — Every patient-derived image in src/data/education.js carries a dated provenance and consent note, or no longer ships; load /resources/education and confirm no un-cleared patient imaging renders

---

### NAV-002 · Confirm or withdraw the two patient CT studies on the Education page

`decision` · **P0** · owner **navinetics-clinical** · S · status **blocked**

src/data/education.js ships two CT studies from DBS cases, one of them a volume render that includes facial bone. The repository's own comment beside the import flags the de-identification review as outstanding. A full-face reconstruction sits directly against the HIPAA identifier for full-face photographic images and comparable images. This is published content on a public page today, and removing or keeping it is the company's call, not a developer's — which is why no code change has been made.

**Acceptance**
- [ ] Provenance is confirmed for each of the two studies: where the imaging came from and under what authority it can be published
- [ ] De-identification is confirmed against the HIPAA identifier list, specifically the full-face/comparable-image identifier for the volume render
- [ ] The consent or IRB basis is stated in writing
- [ ] A decision is recorded: publish as-is, replace with phantom or cadaver acquisitions, or remove
- [ ] If cleared to publish, the basis is written into src/data/education.js beside the import so nobody has to re-litigate it
- [ ] If not cleared, engineering is given the go-ahead to remove or substitute, and the replacement imagery is specified

**Files** — `src/data/education.js`, `src/pages/Education.jsx`, `docs/shubham/04-open-items.md`
**Blocked by** — NaviNetics clinical/compliance: provenance, de-identification confirmation and consent or IRB basis for both DBS CT studies
**Verify** — A written determination exists for each study, and either the basis is recorded in education.js or the images are removed and /resources/education loads clean

---

### NAV-003 · Confirm whether MAVEN is used in human recordings, and under what authorisation

`decision` · **P0** · owner **navinetics-regulatory** · S · status **blocked**

MAVEN is presented on the site next to the D1, a cleared surgical instrument, and a reader has no way to tell the two apart. A statement reading "not a cleared medical device and not for use in human subjects" was written onto the MAVEN record and withdrawn before it shipped: the second half was invented, and navinetics.com describes the neurochemical sensing work as enabling "both research development in preclinical studies and human recordings", which may contradict it outright. Until the real status is known the page says only what the company already says publicly — that this is preclinical research — and carries no regulatory record at all.

**Acceptance**
- [ ] Regulatory states whether MAVEN is used in human recordings and, if so, under what authorisation — IDE, IRB protocol, research use only, or other — and in which jurisdictions.
- [ ] A one-sentence status statement is supplied in the company's own words, suitable to publish verbatim.
- [ ] A `regulatory` record is added to the MAVEN entry in src/data/products.js containing only the supplied wording; the withdrawn "not for use in human subjects" phrasing is not reinstated unless regulatory supplies it.
- [ ] The published statement does not contradict what navinetics.com says about human recordings; if the live site is wrong, it is corrected too.
- [ ] The answer replaces the OPEN QUESTION block at src/data/products.js lines 272-285.

**Files** — `src/data/products.js`, `src/data/maven.js`, `src/pages/Maven.jsx`
**Blocked by** — Regulatory Affairs — MAVEN's human-use status and the authorisation basis for it
**Verify** — The MAVEN record in src/data/products.js carries a `regulatory` object whose statement is traceable to a named regulatory sign-off, and /products/maven-neuromodulation renders it

---

### NAV-004 · Supply the D1 510(k) clearance number and clearance date

`task` · **P0** · owner **navinetics-regulatory** · S · status **blocked**

The D1 page states "FDA 510(k) cleared" — the company's own live-site wording, restored during the rebuild — but gives no clearance number and no date. A hospital value-analysis committee that wants to check the claim has nothing to look up, and a bare claim is weaker than the public record that supports it. `regulatory.number` in src/data/products.js is deliberately null rather than absent, and the chip renders the number the moment it is filled in.

**Acceptance**
- [ ] Regulatory supplies the K-number, the decision date, and the exact device name as it appears on the clearance.
- [ ] `regulatory.number` is populated in src/data/products.js with the supplied K-number and a `date` field with the decision date; neither is inferred from anything.
- [ ] The regulatory chip on /products/d1-stereotactic-frame renders the number alongside the status.
- [ ] The device name on the clearance is recorded in a code comment beside the field, so the naming question in NAV-MKT-03 can be settled against it.
- [ ] Wording stays "cleared" throughout — never "approved", which is the PMA pathway and a different thing.

**Files** — `src/data/products.js`, `src/pages/D1.jsx`
**Blocked by** — Regulatory Affairs — the K-number, the decision date, and the cleared device name
**Verify** — grep -n "number:" src/data/products.js returns a non-null K-number; load /products/d1-stereotactic-frame and confirm the number renders in the regulatory chip

---

### NAV-005 · Supply the MR safety classification and conditions for the D1 MR Localizer Kit

`task` · **P0** · owner **navinetics-regulatory** · M · status **blocked**

The D1 ships an MR Localizer Kit and the page advertises MR as one of its three imaging routes, but neither this site nor navinetics.com says anything about MR safety. Anything taken into a scanner room is either MR Safe, MR Conditional under stated conditions, or MR Unsafe; with no statement a radiographer has to assume the worst or telephone the company. This is ordinary labelling for a device sold to go near a magnet, and the information already exists in the device file.

**Acceptance**
- [ ] Regulatory supplies the MR classification for each frame component that can enter the scanner room.
- [ ] For anything MR Conditional, the full conditions are supplied: static field strength, spatial gradient, RF limits, permitted scan region, and any coil restriction.
- [ ] The supplied classification matches the device labelling and the 510(k) file.
- [ ] An MR safety block renders on /products/d1-stereotactic-frame using the supplied conditions verbatim — no condition is generalised, rounded, or summarised by the implementer.
- [ ] If any component is MR Unsafe, that is stated as plainly as the conditional ones.

**Files** — `src/data/products.js`, `src/data/d1.js`, `src/pages/D1.jsx`
**Blocked by** — Regulatory Affairs — MR classification and conditions of use, from the device labelling
**Verify** — Load /products/d1-stereotactic-frame and confirm an MR safety block whose text matches the supplied labelling word for word

---

### NAV-006 · Bring /company/partners steady-state busy from 93.8% to under 20%

`task` · **P1** · owner **engineering** · M · status **blocked**

The fix for the Partners globe, once NAV-PERF-01 has said what the cost actually is. A visitor on a mid-range phone currently cannot open the menu promptly on this page because the main thread is never free; that is the whole complaint. This is deliberately blocked rather than ready: two previous changes here were made on an unproven theory and produced no measurable improvement, and repeating that pattern is worse than waiting a day.

**Acceptance**
- [ ] npm run check:perf reports steady-state busy for /company/partners at or below 20% (baseline 93.8%), median of 3, with spread under 5 points.
- [ ] Long tasks per 5s at or below 10 (baseline ~44 at ~107ms each).
- [ ] Hamburger first paint on /company/partners at 375px at or below 200ms and settled at or below 500ms — the number NAV-PERF-05 makes visible.
- [ ] The globe still turns, drags, flings and eases to a selected territory; pins, site markers and chips still track the sphere; the route bead still runs.
- [ ] Keyboard reach and screen-reader labels on the pins, sites and chips are unchanged — every clickable thing is still a real button over the canvas.
- [ ] npm run check:routes and npm run check:mobile stay clean for /company/partners on both device profiles.
- [ ] The change made is the one the spike pointed at, and the mechanism is written into docs/shubham/02-fixes-applied.md. If it does not move the number it is reverted, not kept on the grounds that it ought to help.

**Files** — `src/ui/PartnerGlobe.jsx`, `src/lib/globeScene.js`, `docs/shubham/02-fixes-applied.md`, `docs/shubham/09-performance.md`
**Blocked by** — NAV-PERF-01 — the cause is not yet proven, and NAV-PERF-05 for the hamburger criterion. Both are engineering, both are ready to start now.
**Verify** — npm run check:perf — STEADY STATE row for /company/partners at or below 20%, HAMBURGER row for /company/partners at or below 200ms first paint; then npm run check:routes and npm run check:mobile clean.

---

### NAV-007 · Bring /products/maven-neuromodulation steady-state busy from 91.9% to under 20%

`task` · **P1** · owner **engineering** · M · status **blocked**

The fix for MAVEN, once NAV-PERF-02 has attributed the cost. MAVEN is the product page a research buyer reads, and it is currently the joint-worst page on the site for responsiveness: 91.9% busy at rest and 1457ms of blocking on load. Kept separate from the Partners fix because the two pages share no animation code and there is no reason to assume they share a cause.

**Acceptance**
- [ ] npm run check:perf reports steady-state busy for /products/maven-neuromodulation at or below 20% (baseline 91.9%), median of 3, spread under 5 points.
- [ ] Load-time TBT at or below 600ms (baseline 1457ms, median of 3) and long tasks at or below 20 (baseline 63).
- [ ] Hamburger first paint on /products/maven-neuromodulation at 375px at or below 200ms.
- [ ] The hero still plays its load spin, still scrubs with scroll, and still settles with all ten channels drawn and named; the four science bands still animate when on screen and still hold a composed still frame under prefers-reduced-motion.
- [ ] Nothing in the page copy changes. This is a rendering ticket; the regulatory-status gap on MAVEN is a separate open item and stays open.
- [ ] npm run check:routes and npm run check:mobile stay clean for this route.

**Files** — `src/ui/MavenHero.jsx`, `src/ui/ScienceBand.jsx`, `src/pages/Maven.jsx`, `docs/shubham/02-fixes-applied.md`, `docs/shubham/09-performance.md`
**Blocked by** — NAV-PERF-02 — MAVEN has not been profiled yet, and NAV-PERF-05 for the hamburger criterion. Both engineering, both ready now.
**Verify** — npm run check:perf — STEADY STATE and PAGE LOAD rows for /products/maven-neuromodulation, plus its HAMBURGER row; then npm run check:routes and npm run check:mobile.

---

### NAV-008 · Confirm who manufactures the carbon-fibre surgical tables, and their regulatory status

`decision` · **P1** · owner **navinetics-regulatory** · S · status **blocked**

The table specifications on /products/carbon-fiber-surgical-tables are transcribed from a brochure branded Quantum Hunex Korea / ParagonCare Korea, and the tables carry a CBH mark — the company that became NaviNetics Asia in March 2026. The codebase reads that as NaviNetics' own Korean subsidiary's product line sold through a distributor, but records plainly that this is an inference from two documents and needs confirming before the page ships. Neither brochure states a regulatory status for any model, so the page states none, and the brochure contradicts itself on one model's specification.

**Acceptance**
- [ ] Company confirms the legal manufacturer of the table line and NaviNetics' own role — manufacturer, distributor, or brand owner.
- [ ] Regulatory status per market is supplied for the line, or it is confirmed that the page deliberately carries none.
- [ ] The CXR-704L contradiction is resolved by the manufacturer: height range 734-1,184 mm or 722-1,172 mm, lateral tilt ±19° or ±17°.
- [ ] The `conflict` field for that model in src/data/orTables.js is replaced with the confirmed figure and the alternative is dropped.
- [ ] The confirmation is recorded in the claims notice at the top of src/data/orTables.js.

**Files** — `src/data/orTables.js`, `src/pages/SurgicalTables.jsx`
**Blocked by** — Regulatory Affairs with NaviNetics Asia — manufacturer identity, market status, and the correct CXR-704L specification
**Verify** — The claims notice in src/data/orTables.js names the confirmed manufacturer; the CXR-704L entry carries one height range and one tilt figure rather than two

---

### NAV-009 · Decide whether D1 and MAVEN replace or sit alongside the existing product names

`decision` · **P1** · owner **navinetics-marketing** · S · status **blocked**

navinetics.com sells "NaviNetics Frame System" and "NaviNetics Reusable Stereotactic System"; this site calls the same product the D1 Stereotactic Frame. The neuromodulation work is "WINCS" and "WINCS Harmoni" on the live site and on the published papers, while here it is MAVEN — and NaviNetics has confirmed WINCS is an earlier generation, not another name for the same device. A surgeon who saw the product under the old name, or a researcher searching for the name on the papers, has to land somewhere sensible. An alias for "NaviNetics Frame System" is already in place; nothing covers the WINCS side.

**Acceptance**
- [ ] Marketing states, for each product, whether the new name replaces the old one outright or the two coexist.
- [ ] If the MAVEN-to-WINCS-Harmoni lineage is worth stating publicly, NaviNetics supplies the sentence — which generation, what changed, and which published papers apply to which device. It is not inferred from a deck; that was tried once and withdrawn.
- [ ] Confirmed aliases are recorded in src/data/products.js and surfaced on the page and in the page description.
- [ ] Every old URL still resolves via the redirects table in src/data/nav.js.
- [ ] The decision is checked against the device name on the 510(k) clearance from NAV-REG-01.

**Files** — `src/data/products.js`, `src/data/maven.js`, `src/data/nav.js`, `src/pages/D1.jsx`, `src/pages/Maven.jsx`
**Blocked by** — Product marketing — the naming decision, and the MAVEN/WINCS lineage sentence if one is to be published
**Verify** — Search the site for "NaviNetics Frame System" and "WINCS" and confirm each resolves to the correct product page; any lineage sentence in src/data/*.js is quoted from a NaviNetics source, not inferred

---

### NAV-010 · Provide the legal pages and the entity imprint

`decision` · **P1** · owner **navinetics-legal** · M · status **blocked**

The site has no privacy policy, no terms of use, no cookie notice, no accessibility statement and no legal-entity imprint beyond the footer's company name. With EU, UK and Asia distributors listed on the Partners page, EU visitors are a certainty. The contact form now carries an inline plain-language notice about what happens to what the visitor typed, which is a floor and not a policy. The gap is pre-existing rather than introduced by the rebuild, but the contact form now actually transmits data, which changes the exposure.

**Acceptance**
- [ ] Privacy policy text is supplied, covering what the contact form collects, where it is sent, how long it is kept and who to contact
- [ ] Terms of use are supplied
- [ ] A cookie/storage notice is supplied, or a written confirmation that the site sets no cookies and stores only the theme preference locally
- [ ] An accessibility statement is supplied, naming the standard targeted (Section 508 / EN 301 549 / WCAG 2.2 AA) and the known gaps
- [ ] The legal-entity imprint is confirmed: NaviNetics, Inc. is currently named in the footer as the single merged entity, following the merger of NaviNetics, Inc. and NaviNetics NeuroModulation, Inc. — this needs confirming rather than assuming
- [ ] An adverse-event / product-complaint reporting route is named, so the complaint reason now offered on the contact form has a real destination
- [ ] Routes and footer placement are agreed so engineering can add the pages and the sitemap entries

**Files** — `src/components/Footer.jsx`, `src/pages/Contact.jsx`, `src/data/nav.js`, `public/sitemap.xml`
**Blocked by** — NaviNetics legal: policy text, entity confirmation and the complaint-reporting route
**Verify** — Each legal page loads at its agreed route, is linked from the footer, appears in sitemap.xml, and check:build still passes

---

### NAV-011 · Publish the complaint intake route and the adverse-event reporting path

`task` · **P1** · owner **navinetics-regulatory** · M · status **blocked**

The contact form now offers "product complaint or device issue" as a reason and warns senders not to include patient identifiers, but the site never says where a complaint actually goes, how quickly it is acknowledged, or how a serious incident reaches a regulator. For a device company that route should be findable in seconds. There is also no quality-system statement — ISO 13485 or otherwise — anywhere on either site.

**Acceptance**
- [ ] A complaint intake address or telephone route is supplied, with the target acknowledgement time.
- [ ] The vigilance / adverse-event reporting route is supplied for each market where a product is placed.
- [ ] Regulatory confirms whether a quality-system certification may be stated publicly and, if so, supplies the certificate number and its scope.
- [ ] The complaint route renders on /contact and is reachable from the footer on every page.
- [ ] No certification is stated on the site that regulatory has not supplied a certificate number for.

**Files** — `src/pages/Contact.jsx`, `src/components/Footer.jsx`
**Blocked by** — Regulatory Affairs and Quality — complaint intake route, acknowledgement target, and per-market vigilance contacts
**Verify** — Load /contact and confirm a named complaint route with an acknowledgement time; confirm the footer links to it from any page

---

### NAV-012 · Supply intended use, Rx-only, MR safety and reprocessing information for the D1

`decision` · **P1** · owner **navinetics-regulatory** · M · status **blocked**

The D1 page advertises an MR localiser and says nothing about MR conditionality; states the system is reusable and gives no reprocessing information; and carries no indications-for-use block and no Rx-only statement. These are standard for a Class II surgical instrument and are the content a hospital value-analysis committee looks for before anything else. The live site's component list names two sterilisation trays, which is more than the rebuild carried and is now restored — but a tray is not a reprocessing instruction. Every one of these is a regulated statement that must come from the company; none can be drafted by a developer.

**Acceptance**
- [ ] An indications-for-use / intended-use statement is supplied for the D1 in approved wording
- [ ] The Rx-only statement is supplied in the form the company uses
- [ ] MR safety status for the MR localiser is stated — MR Safe, MR Conditional with its conditions, or MR Unsafe
- [ ] Reprocessing and sterilisation information is supplied, or a document reference a customer can request is named
- [ ] Compatibility is stated for DBS lead systems, imaging equipment and head coils, or explicitly declined with a reason
- [ ] Research Use Only / not-for-human-use framing for MAVEN is confirmed in approved wording
- [ ] Service, warranty and training information is supplied or explicitly deferred
- [ ] Each item names where on the page it belongs, so engineering can place it without interpreting

**Files** — `src/data/products.js`, `src/pages/D1.jsx`, `src/pages/Maven.jsx`, `docs/shubham/04-open-items.md`
**Blocked by** — NaviNetics regulatory: approved wording for intended use, Rx-only, MR safety, reprocessing, compatibility and MAVEN research-use framing
**Verify** — Approved copy exists for each item and is rendered on the named page; no developer-drafted regulatory sentence appears anywhere in src/

---

### NAV-013 · Supply per-market regulatory status for the distributor territories (CE, UKCA, TGA, NMPA, MFDS)

`task` · **P1** · owner **navinetics-regulatory** · M · status **blocked**

/company/partners names distributors covering the United States, South America, Greater China and Singapore, Australia and South Korea, and no page states a regulatory status for any market except the FDA one. A distributor cannot quote and a hospital cannot buy without knowing whether the device is registered in their own country. The partner deck carried FDA and CE MDR badges; they were deliberately kept off the map, because a badge with no scope and no certificate number is decoration rather than a regulatory statement.

**Acceptance**
- [ ] Regulatory states, per market and per product, whether the device is CE marked under MDR, UKCA marked, ARTG-listed, NMPA-registered, MFDS-registered, or simply not placed on that market.
- [ ] Certificate numbers and the notified body are supplied for every mark claimed.
- [ ] `regulatory.market` in src/data/products.js becomes one entry per market, rendering as one chip per market rather than a single status.
- [ ] Territories with no registration either say so or carry no product claim at all — never left ambiguous.
- [ ] The same statuses are applied to the carbon-fibre table line, or it is confirmed that the line is sold only in Korea.

**Files** — `src/data/products.js`, `src/data/partners.js`, `src/pages/Partners.jsx`, `src/pages/D1.jsx`
**Blocked by** — Regulatory Affairs — per-market registration status, certificate numbers and notified body
**Verify** — Each territory on /company/partners either carries a per-market status chip backed by a value in src/data/products.js, or makes no regulatory claim at all

---

### NAV-014 · Supply reprocessing and sterilisation instructions for the reusable D1

`task` · **P1** · owner **navinetics-regulatory** · M · status **blocked**

The D1 is stated to be reusable and ships with a Key Sterilization Tray and a Frame Sterilization Tray, both now listed on the page. Naming a tray is not a reprocessing instruction: a sterile-processing department needs the validated cycle — method, temperature, exposure and dry times, cleaning agents — and any limit on how many times a component may be reused. Neither site gives one today.

**Acceptance**
- [ ] Regulatory supplies the validated reprocessing method(s) and cycle parameters as they appear in the instructions for use.
- [ ] Regulatory decides whether the IFU document may be published on the site or should be request-only.
- [ ] If publishable: a reprocessing section renders on /products/d1-stereotactic-frame carrying the validated parameters exactly as labelled.
- [ ] If request-only: the page carries a named, working route to request the IFU rather than a silent gap.
- [ ] Any reuse limit is stated; if there is none, that is stated too.
- [ ] No cycle parameter is written into src/data/*.js that did not come from the supplied document.

**Files** — `src/data/products.js`, `src/data/d1.js`, `src/pages/D1.jsx`
**Blocked by** — Regulatory Affairs — validated reprocessing instructions, plus a publish-or-request-only decision
**Verify** — /products/d1-stereotactic-frame either states the validated cycle or offers a working IFU-request route; grep the D1 data files and confirm no parameter lacks a source note

---

### NAV-015 · Supply the D1 510(k) number and clearance date

`task` · **P1** · owner **navinetics-regulatory** · S · status **blocked**

The D1 page now states the FDA clearance in the company's own words, matching what navinetics.com has said publicly for years. The `number` field in src/data/products.js is deliberately present and null: a bare "FDA cleared" with no number is weaker than it needs to be for a value-analysis committee, and the number is public record once someone confirms which one it is. No developer can fill this in — inventing or guessing a clearance number for a Class II surgical instrument is not a lesser error than leaving it blank.

**Acceptance**
- [ ] The 510(k) number is supplied in writing, together with the clearance date and the exact device name as cleared
- [ ] It is confirmed that the cleared device is the same product the D1 page describes, and whether the "NaviNetics Frame System" name on the live site is the cleared name
- [ ] The wording to display is approved — "cleared", never "approved"
- [ ] Engineering fills the `number` field and renders it beside the status; the spec table's Regulatory status row shows number and date
- [ ] The rendered string is checked against the FDA clearance database entry

**Files** — `src/data/products.js`, `src/pages/D1.jsx`
**Blocked by** — NaviNetics regulatory: the 510(k) number, clearance date and the cleared device name
**Verify** — The number rendered on /products/d1-stereotactic-frame matches the FDA 510(k) database record for the named device

---

### NAV-016 · Supply the Rx-only statement and a formal indications-for-use block for the D1

`task` · **P1** · owner **navinetics-regulatory** · M · status **blocked**

The D1 is a prescription device in the United States — sold on the order of a licensed practitioner — and neither this site nor navinetics.com says so. There is also no indications-for-use statement anywhere: nothing tells a surgeon what the frame is cleared to be used for, which is precisely what the clearance itself defines. Both come straight out of the 510(k) file and the device labelling, and neither can be written by anyone outside the company.

**Acceptance**
- [ ] The indications-for-use statement is supplied verbatim from the 510(k) file.
- [ ] The Rx-only statement is supplied in the exact wording used on the device labelling.
- [ ] Both render on /products/d1-stereotactic-frame inside a labelled block — not paraphrased into body copy, and not reworded for tone.
- [ ] Regulatory confirms whether an equivalent block is required on the surgical tables and MAVEN pages, and supplies the wording if so.

**Files** — `src/data/products.js`, `src/data/d1.js`, `src/pages/D1.jsx`
**Blocked by** — Regulatory Affairs — indications-for-use text from the 510(k) file and the Rx-only wording from device labelling
**Verify** — Load /products/d1-stereotactic-frame and diff the rendered indications block against the supplied 510(k) wording character for character; confirm the Rx-only statement is present

---

### NAV-017 · Classify NaviNetics AI and sign off its body copy, intended use and intended user

`decision` · **P2** · owner **navinetics-regulatory** · M · status **blocked**

The NaviNetics AI page describes surgical planning software that is in development. Its body copy was derived from the application repository — the master application guide, the requirements set and the named modules — rather than supplied by the company, and it still needs someone to approve it as a public statement. The page also has to say what the thing is: a hospital reads "product", "platform" and "research" very differently, and none of the three is currently claimed.

**Acceptance**
- [ ] Company states whether NaviNetics AI is a product, a platform, or research.
- [ ] An approved classification, intended-use and intended-user statement is supplied.
- [ ] The derived body copy is signed off, amended, or replaced with approved wording.
- [ ] The approved wording replaces the derived copy in src/data/technology.js, and the `needsContent` entries it answers are deleted rather than left standing.
- [ ] Nothing is claimed about availability, regulatory status or performance beyond what is approved.

**Files** — `src/data/technology.js`, `src/pages/NaviNeticsAI.jsx`
**Blocked by** — Regulatory Affairs with product management — classification plus intended-use and intended-user statements
**Verify** — grep -n "needsContent" -A 8 src/data/technology.js shows the answered items removed; /technology/navinetics-ai states what the software is and who it is for

---

### NAV-018 · Confirm permission for the partner logos and the journal figures

`decision` · **P2** · owner **navinetics-legal** · S · status **blocked**

Five partner logos render on /company/partners and src/assets/partners/README.md records no permission trail. Journal figures are used on three pages with a similar open question recorded in the codebase. Both are third-party marks and copyrighted material being republished on a commercial site; neither a developer nor a designer can grant that permission.

**Acceptance**
- [ ] Written permission or a licence basis exists for each of the five partner logos, or the logo is replaced with the partner's name as text
- [ ] Written permission or a licence basis exists for each journal figure used, with the required attribution wording
- [ ] The permission trail is recorded in src/assets/partners/README.md and beside each figure's import, so the question is not reopened
- [ ] Any figure or logo without a basis is removed and the page still loads clean

**Files** — `src/assets/partners/README.md`, `src/data/partners.js`, `src/data/neuromodulation.js`, `src/data/education.js`
**Blocked by** — NaviNetics legal: permission or licence basis for five partner logos and the journal figures
**Verify** — A permission record exists for every third-party mark rendered on the site; node tools/check-routes.mjs still passes after any removals

---

### NAV-019 · Confirm whether X-ray reticles, the microdrive and DBS lead accessories ship as standard

`decision` · **P2** · owner **navinetics-marketing** · S · status **blocked**

navinetics.com describes X-ray reticles, a mechanical microdrive, and DBS lead implantation accessories in its prose about the frame system, but none of the three appears in that page's own System Components list. Our components list follows the list rather than the prose, so all three are currently missing from what a buyer sees as included — even though the microdrive appears in the product gallery. Someone has to say whether each is standard, an option, or a separate purchase, because a quote depends on it.

**Acceptance**
- [ ] Product marketing states, for each of the three, whether it is standard, optional, or sold separately.
- [ ] Optional items are flagged as such in src/data/products.js rather than listed flat alongside standard ones.
- [ ] The components list on /products/d1-stereotactic-frame renders the standard/optional distinction visibly.
- [ ] The same answer is applied to navinetics.com so the two lists do not disagree.

**Files** — `src/data/products.js`, `src/pages/D1.jsx`
**Blocked by** — Product marketing — standard, optional or separate for each of the three items
**Verify** — Every entry in the D1 `components` array in src/data/products.js carries a standard/optional flag, and /products/d1-stereotactic-frame renders the distinction

---

### NAV-020 · Decide the product naming and the company-wide "safe and effective" wording

`decision` · **P2** · owner **navinetics-marketing** · S · status **blocked**

Two questions that are one decision each and cannot be settled inside a rebuild. First, naming: the live site calls the frame "NaviNetics Frame System" and "NaviNetics Reusable Stereotactic System", while the rebuild calls it "D1 Stereotactic Frame" — anyone who has seen the product under the old name will not find it. An alias has been added as a stopgap. Second, "safe, effective and high-quality": the rebuild removed it because "safe and effective" is FDA's term of art for an authorised device, but the same sentence is live on navinetics.com right now, on at least three pages, and has been since 2021. That makes it a company-wide claims decision, not a page edit.

**Acceptance**
- [ ] A decision is recorded on whether D1 and MAVEN replace the old product names or sit alongside them, and whether the live site is renamed to match
- [ ] If they sit alongside, the alias wording and where it appears is specified — the D1 record already carries aka: ['NaviNetics Frame System']
- [ ] MAVEN's relationship to WINCS is either stated in a sentence NaviNetics supplies, or confirmed as deliberately unstated — it must not be inferred, and the codebase already warned against inferring it once before it was inferred anyway
- [ ] A decision is recorded on "safe, effective and high-quality" that covers navinetics.com as well as this site, made by whoever owns claims review
- [ ] A claims-review owner is named — six unsubstantiated claims reached production and at least one was recorded in the code as held back pending sign-off and shipped anyway, which is a process gap rather than an editing mistake

**Files** — `src/data/products.js`, `src/pages/D1.jsx`, `src/pages/Maven.jsx`, `docs/shubham/08-existing-site.md`
**Blocked by** — NaviNetics marketing and claims review: naming decision, MAVEN/WINCS lineage sentence, "safe and effective" ruling, and a named claims owner
**Verify** — The decisions are written into docs/shubham/08-existing-site.md and the named owner is recorded; any resulting copy change is applied and check:copy still passes

---

### NAV-021 · Decide whether the partners globe degrades on low-power devices

`decision` · **P2** · owner **navinetics-marketing** · S · status **blocked**

The globe is the most expensive thing on the site and it is deliberate design: real Natural Earth geography, territories that light up as their own shape, a route drawn from Rochester to each partner. If NAV-PERF-01 shows the cost is intrinsic to what the globe does rather than to how it is written, the remaining levers all change what a visitor sees — hold the spin until the visitor interacts, fall back to a static projection on low-memory or low-core devices, or accept the cost as it stands. That is a brand and product judgement about how NaviNetics presents its distributor network, not an engineering one, and nothing about what the globe shows changes until NaviNetics chooses.

**Acceptance**
- [ ] One option is chosen and recorded in docs/shubham/04-open-items.md section C with the date, alongside the other decisions already taken.
- [ ] If degradation is chosen, the trigger is named. prefers-reduced-motion is already honoured; navigator.deviceMemory, hardwareConcurrency and saveData are available and are already reported by the perf beacon in vite.config.js.
- [ ] If holding the current behaviour is chosen, that is written down too, so it is not re-opened every time the busy number is read.
- [ ] The decision references the measured busy% from NAV-PERF-01 and the residual figure from NAV-PERF-03, so it is made against numbers rather than impressions.

**Files** — `docs/shubham/04-open-items.md`, `src/ui/PartnerGlobe.jsx`
**Blocked by** — NAV-PERF-01 and NAV-PERF-03. The question only arises if the fix cannot get the page under budget without changing what the globe shows — ask NaviNetics only once there is a number to ask about.
**Verify** — An entry exists in docs/shubham/04-open-items.md section C naming the option chosen, the date, and the person at NaviNetics who chose it.

---

### NAV-022 · Decide whether the per-fiducial accuracy values on Education figure 02.3.b may be public

`decision` · **P2** · owner **navinetics-regulatory** · S · status **blocked**

Figure 02.3.b on the Education page shows a numbered fiducial ring with a value beside each marker — 0.70, 0.48, 0.36 and so on — legible at the size the page displays it. Those are per-point accuracy figures, which makes them a performance claim, and they arrived on the image as supplied rather than through a decision to publish them. The figure's caption is about where the nine points land, not how well they landed, so the values can be cropped out without losing anything the page is using the figure for.

**Acceptance**
- [ ] Regulatory states whether the per-fiducial values may be public.
- [ ] If not: the crop in tools/education-images.mjs is adjusted to exclude the values, the markers themselves are kept, and the image is regenerated.
- [ ] If yes: the units and the measurement method behind them are supplied and stated in the figure caption.
- [ ] The note at src/data/education.js lines 20-26 is replaced with the decision.

**Files** — `src/data/education.js`, `src/ui/EduFigures.jsx`, `tools/education-images.mjs`, `src/assets/education/02.3.b.png`
**Blocked by** — Regulatory Affairs — publication decision on the per-fiducial values
**Verify** — node tools/education-images.mjs, then load /resources/education and confirm figure 02.3.b either carries no legible per-point values or carries them with a stated method

---

### NAV-023 · Decide whether the two held-back NaviNetics AI performance figures may be published

`decision` · **P2** · owner **navinetics-regulatory** · S · status **blocked**

Two numbers about NaviNetics AI are held back in the codebase: a ±1 mm placement tolerance and an operating-room time benchmark. A third — "around 0.6 mm deviation" against "industry-standard planning software" — was published without sign-off and has since been removed, because it named no comparator, no method and no sample size for software that has had no submission and no clearance. A performance figure about a targeting device is a regulated claim, so each of the two either arrives with its method or stays out.

**Acceptance**
- [ ] For each figure, regulatory either releases it — with the measurement method, the sample size, and the named comparator where the figure is comparative — or confirms it stays withheld.
- [ ] Released figures render on the page with their method stated alongside; withheld figures remain absent and the decision is recorded in the code comment so it is not re-litigated.
- [ ] The removed 0.6 mm claim is not reinstated in any form or wording.
- [ ] The corresponding `needsContent` entry in src/data/technology.js is resolved either way.

**Files** — `src/data/technology.js`, `src/pages/NaviNeticsAI.jsx`
**Blocked by** — Regulatory Affairs — release decision, plus method and sample size for each figure released
**Verify** — grep -rn "0.6 mm" src returns no hit in rendered copy; any published figure on /technology/navinetics-ai is accompanied by its stated method

---

### NAV-024 · Supply D1 compatibility, service, warranty and training information

`task` · **P2** · owner **navinetics-regulatory** · M · status **blocked**

A stereotactic frame is bought to be used with other equipment: DBS lead systems from other manufacturers, particular CT and MR scanners, and specific head coils. The site names none of those compatibilities and says nothing about warranty length, service intervals, or what training comes with a system. Purchasing departments ask all four before a quote is signed, and a compatibility statement about another manufacturer's lead is a claim, so it needs review rather than a best guess.

**Acceptance**
- [ ] A verified compatibility list is supplied for DBS lead systems, imaging equipment, and head coils, with any conditions attached to each.
- [ ] Warranty terms, service intervals, and the training offer are supplied.
- [ ] Every compatibility statement passes claims review before publication (see NAV-REG-08).
- [ ] The information renders on /products/d1-stereotactic-frame; nothing is listed as compatible that has not been supplied as such.

**Files** — `src/data/products.js`, `src/data/d1.js`, `src/pages/D1.jsx`
**Blocked by** — Regulatory Affairs with service and clinical education — verified compatibility list and commercial terms
**Verify** — Every entry in the compatibility list on /products/d1-stereotactic-frame traces to a value in src/data/*.js carrying a source note

---

### NAV-025 · Supply the Mayo Clinic attribution and endorsement wording

`decision` · **P2** · owner **navinetics-marketing** · S · status **blocked**

Mayo Clinic is named as the origin of the products across the Company section, the home page and the site meta description, with no endorsement disclaimer anywhere. Institutions generally require specific language when their name is used commercially, and the affiliation agreement will say what it is. Naming an institution without its required disclaimer is a risk a developer cannot assess and should not draft around.

**Acceptance**
- [ ] The affiliation agreement's required attribution and non-endorsement language is supplied verbatim
- [ ] Where it must appear is specified — footer, every page that names Mayo Clinic, or both
- [ ] It is confirmed whether the meta description may continue to name Mayo Clinic, since that text appears in search results and link unfurls
- [ ] Engineering places the wording and it renders on every page that names the institution
- [ ] check:copy still passes — the disclaimer is site copy, not an internal note

**Files** — `src/components/Footer.jsx`, `src/pages/WhoWeAre.jsx`, `src/pages/Home.jsx`, `src/lib/meta.js`, `index.html`
**Blocked by** — NaviNetics marketing: the affiliation agreement's required attribution and non-endorsement wording
**Verify** — The supplied wording renders on every page that names Mayo Clinic, including the footer, and appears in the built index.html where the meta description does

---

### NAV-026 · Supply the Mayo Clinic attribution wording and endorsement disclaimer

`decision` · **P2** · owner **navinetics-legal** · S · status **blocked**

Mayo Clinic is named as the origin of the products on the home page, across the Company section, and in the site's meta description, with no disclaimer anywhere. Institutions normally require specific wording so that being named is not read as endorsing a commercial product, and the affiliation agreement usually says exactly what that wording is. Nobody has checked what this one requires — navinetics.com has the same gap, so it is pre-existing rather than introduced by the rebuild.

**Acceptance**
- [ ] Legal states what the affiliation agreement requires: permitted phrasing, any required disclaimer, and whether the Mayo Clinic name or marks may be used at all.
- [ ] The required disclaimer is placed wherever Mayo Clinic is named, including the site meta description if the agreement reaches it.
- [ ] Any phrasing the agreement does not permit is removed from both this site and navinetics.com.
- [ ] The permitted phrasing is recorded in a code comment so it is not paraphrased by the next editor.

**Files** — `src/pages/WhoWeAre.jsx`, `src/pages/Founders.jsx`, `src/pages/Home.jsx`, `src/lib/meta.js`, `index.html`, `src/components/Footer.jsx`
**Blocked by** — Legal — the Mayo Clinic affiliation agreement's attribution and disclaimer requirements
**Verify** — grep -rin "mayo" src index.html lists every mention; each sits inside the approved phrasing and, where required, next to the disclaimer

---

### NAV-027 · Supply a defaced surface render and the frame origin offset for the NaviNetics AI demo

`task` · **P3** · owner **navinetics-clinical** · M · status **blocked**

The planning demo on the NaviNetics AI page runs on a synthetic head, because a real one would show a face. A defaced surface render — a real head scan with the facial surface removed — would make the demo look like the software actually running without publishing an identifiable person. The demo also assumes a frame origin offset that nobody has confirmed, so the coordinates it displays may not be the ones the real system would produce.

**Acceptance**
- [ ] A defaced surface render is supplied, with its de-identification method documented and a consent or IRB basis where the source is a patient scan.
- [ ] The frame origin offset the demo uses is confirmed against the real system.
- [ ] The render replaces the synthetic head in the demo and the coordinates are corrected to the confirmed offset.
- [ ] The two corresponding `needsContent` entries in src/data/technology.js are removed.
- [ ] Provenance and de-identification method are recorded beside the asset, following the same rule as NAV-CLIN-01.

**Files** — `src/data/technology.js`, `src/pages/NaviNeticsAI.jsx`
**Blocked by** — Clinical — a defaced surface render with documented de-identification, plus confirmation of the frame origin offset
**Verify** — Load /technology/navinetics-ai and confirm the demo runs on the supplied render; grep -n "needsContent" -A 8 src/data/technology.js shows both entries removed


---

## Ready — detail

No company input needed; these can start now.


### NAV-028 · Spike: profile /products/maven-neuromodulation to the depth Partners got

`spike` · **P0** · owner **engineering** · M · status **ready**

MAVEN sits at 91.9% steady-state busy and 1457ms TBT with 63 long tasks on load — the same failure as Partners, and the same consequence for a visitor: taps queue. Unlike Partners it was never investigated, so there is no evidence about where the time goes. ScienceBand already gates on IntersectionObserver and caps at 30fps, so the cost is somewhere else. Reading src/ui/MavenHero.jsx raises two candidates that are observations only, not findings: paint() runs on every animation frame with only the canvas call drawField gated behind `visible`, so roughly forty DOM and SVG writes across ten channels plus a per-frame blur() filter keep running while the hero is off screen; and each frame reads window.scrollY after the previous frame's style writes, which is the shape of a forced synchronous layout. Both must be measured before either is believed.

**Acceptance**
- [ ] A trace of a settled /products/maven-neuromodulation is captured and saved under tools/.perf/, attributed across Recalculate Style, Layout, Paint/Composite and scripting.
- [ ] Cost is split between MavenHero and the four ScienceBand instances by measuring each in isolation (page with the bands removed, then with the hero removed), and both busy% figures are recorded.
- [ ] Question (a) answered with evidence: does paint() continue running when the hero is scrolled off screen, and what does the busy% become if it is gated the way drawField already is.
- [ ] Question (b) answered with a number: what share of frame time is Recalculate Style plus Layout, versus canvas rasterisation.
- [ ] Question (c) answered: is the per-frame blur() filter on the rotating assembly a measurable cost, or noise.
- [ ] A verdict is written into docs/shubham/09-performance.md under a MAVEN heading, including any of the three candidates the measurement kills — a dead hypothesis is recorded, not deleted.

**Files** — `src/ui/MavenHero.jsx`, `src/ui/ScienceBand.jsx`, `src/pages/Maven.jsx`, `tools/check-perf.mjs`, `docs/shubham/09-performance.md`
**Verify** — npm run check:perf against the preview build — the STEADY STATE row for /products/maven-neuromodulation, median of 3, against the 91.9% baseline; plus the saved trace under tools/.perf/.

---

### NAV-029 · Spike: prove or kill the place() layout hypothesis on /company/partners

`spike` · **P0** · owner **engineering** · S · status **ready**

/company/partners holds the main thread at 93.8% busy while the visitor does nothing, so every tap queues behind it — which is why the hamburger felt broken even though the menu itself paints in 30-107ms. Two earlier changes made on the theory that canvas drawing was the cost (dot batching, graticule precompute) were strictly less work for an identical picture and neither moved the number. The remaining suspect is place() in src/ui/PartnerGlobe.jsx, which writes style.left, top, opacity, pointerEvents and a custom property on every pin, site marker and chip every frame, forcing style recalculation and layout. That is a hypothesis, not a finding, and the last two hypotheses were wrong — so this ticket measures and changes nothing.

**Acceptance**
- [ ] A Chrome DevTools performance trace of a settled /company/partners is captured and saved under tools/.perf/, with frame time attributed across Recalculate Style, Layout, Paint/Composite and scripting (drawGlobe vs place).
- [ ] A throwaway control run with the body of place() short-circuited (early return, nothing else touched) is measured with `npm run check:perf` and its steady-state busy% is recorded beside the 93.8% baseline, median of 3 with the individual runs shown.
- [ ] docs/shubham/09-performance.md carries a verdict in one of exactly two forms: 'place() accounts for N% of the busy ratio' or 'place() is not the cause — busy% with it disabled is N%, hypothesis dead'.
- [ ] If the hypothesis is dead, the entry names the next suspect and the evidence that points at it, in the same candid register as the existing 'what was tried and why it did not work' section.
- [ ] No behavioural change to src/ui/PartnerGlobe.jsx is committed from this ticket. The short-circuit is an instrument, not a fix.
- [ ] The run is taken with no `npm run dev` running and no leftover headless Chrome alive, and the output says so.

**Files** — `src/ui/PartnerGlobe.jsx`, `src/lib/globeScene.js`, `tools/check-perf.mjs`, `docs/shubham/09-performance.md`
**Verify** — npm run build && npx vite preview --port 4319 --strictPort, then npm run check:perf — read the STEADY STATE row for /company/partners (baseline 93.8%, median of 3, runs printed) with place() live and with it short-circuited.

---

### NAV-030 · Announce route changes to screen readers

`bug` · **P1** · owner **engineering** · M · status **ready**

This is a single-page app, so navigating between pages replaces the DOM without any of the signals a screen reader relies on. There is no live region and no focus move on navigation, so a reader who activates a nav link hears nothing at all and is left with focus wherever it was — typically still inside the collapsed menu. They have no way to know the page changed or where the new content starts. Hospitals procure against Section 508 and EN 301 549, so this sits alongside the mega-menu and lightbox fixes as procurement-relevant, not polish.

**Acceptance**
- [ ] A visually-hidden aria-live="polite" region announces the new page title on every route change, including the redirect routes and the 404
- [ ] Focus moves to the main heading (or to #main with tabIndex={-1}) on navigation, so the next Tab lands in the new page's content and not in stale nav markup
- [ ] The announcement fires once per navigation — not on every render, and not twice when a redirect resolves
- [ ] The skip-to-content link still works and is still the first focusable element after navigation
- [ ] Back/forward navigation announces the same way as a link click
- [ ] Verified with a real screen reader (NVDA or VoiceOver) on at least three routes, one of which is a lazy-loaded route so the Suspense fallback does not swallow the announcement

**Files** — `src/App.jsx`, `src/components/AnimatedRoutes.jsx`, `src/lib/meta.js`
**Verify** — Manual: with NVDA or VoiceOver running, click through Home -> Products -> D1 -> a lazy route and confirm each page title is spoken and focus lands in the new content

---

### NAV-031 · check-routes.mjs still leaks a headless Chrome on every run

`bug` · **P1** · owner **engineering** · S · status **ready**

Leaked headless browsers are what made each successive performance run look worse than the last regardless of code — nine of them alive at one point, burning 257 CPU-seconds between them against the cores being measured. That was fixed in the tools that spawn Chrome, and docs/shubham/09-performance.md records it as done. tools/check-routes.mjs is not among them: it spawns Chrome at line 50 and calls process.exit at line 98 with no Browser.close, so every run leaves one alive. It is also the tool most likely to be run repeatedly during ordinary work, which makes it the worst one to have missed.

**Acceptance**
- [ ] tools/check-routes.mjs sends Browser.close before exiting on both the pass path and the fail path, so a failing route check does not leak either.
- [ ] After ten consecutive runs of npm run check:routes, no chrome.exe process with nn-chrome-routes in its command line remains.
- [ ] The claim in docs/shubham/09-performance.md that 'all six tools now call Browser.close' is corrected to the accurate list, since it was not true when written.
- [ ] check-routes still exits non-zero when a route is broken — the close must not swallow the exit code.

**Files** — `tools/check-routes.mjs`, `docs/shubham/09-performance.md`
**Verify** — Run npm run check:routes three times, then `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object CommandLine -match 'nn-chrome-routes'` returns nothing.

---

### NAV-032 · Clear or replace the journal figures used across three pages

`task` · **P1** · owner **navinetics-legal** · M · status **ready**

Several images on the site look like figures taken from published papers. `fig-waveform` and `fig-fscv` on the neuromodulation technology page are flagged in src/data/maven.js as needing a permissions answer, and `/WINC-Harmoni-Device.png` — a four-panel journal figure showing device dimensions, a block diagram, a chip die and a calibration curve — is still listed in the media library. Journals normally hold copyright on figures even when the authors are the company's own people, so authorship is not permission. Education figures 02.3.a and 02.3.b need the same check.

**Acceptance**
- [ ] The source publication is identified for each figure: fig-waveform, fig-fscv, WINC-Harmoni-Device.png, 02.3.a and 02.3.b.
- [ ] Reuse permission or the applicable licence is documented for each, together with the attribution that licence requires.
- [ ] Required attribution renders in the figure caption on the page.
- [ ] Any figure without permission is removed from the page, from src/data/media.js, and from public/.
- [ ] The permissions note at src/data/maven.js lines 40-43 is replaced with the answer.

**Files** — `src/data/maven.js`, `src/data/neuromodulation.js`, `src/data/media.js`, `src/data/education.js`, `src/ui/EduFigures.jsx`
**Verify** — Each figure listed in the ticket either carries its licence and attribution in the caption or no longer appears; npm run check:routes passes with no missing images

---

### NAV-033 · Measure the hamburger on the two routes where it actually feels broken

`task` · **P1** · owner **engineering** · S · status **ready**

The hamburger complaint came from the busy pages, but tools/check-perf.mjs taps it only on / and /technology/navinetics-ai — two pages measured at or near 0% busy. It reports 30-107ms first paint and concludes the control is not slow. That is true and beside the point: the delay a thumb feels is the thread being unavailable, and that only happens on Partners and MAVEN. Without this measurement the two fix tickets have no criterion a person can recognise, only a percentage.

**Acceptance**
- [ ] The hamburger loop in tools/check-perf.mjs iterates /company/partners and /products/maven-neuromodulation as well as the existing two routes.
- [ ] npm run check:perf prints four rows in the HAMBURGER section, each with first paint and settled in ms.
- [ ] The current (bad) figures for the two busy routes are recorded in docs/shubham/09-performance.md as the baseline the fixes are judged against.
- [ ] The existing rows for / and /technology/navinetics-ai are unchanged in value and still printed, so the comparison holds.
- [ ] The SLOW threshold stays where it is (settled > 500ms or painted > 200ms) rather than being loosened to make the new rows pass.

**Files** — `tools/check-perf.mjs`, `docs/shubham/09-performance.md`
**Verify** — npm run check:perf — the HAMBURGER section prints four rows, two of which are /company/partners and /products/maven-neuromodulation.

---

### NAV-034 · Name a claims-review owner and define the sign-off gate for public copy

`decision` · **P1** · owner **navinetics-regulatory** · S · status **ready**

Six unsubstantiated claims reached the live site, and at least one — "around 0.6 mm deviation" measured against unnamed "industry-standard planning software" — was recorded in the code as held back pending sign-off and shipped anyway. That is a process gap rather than an editing mistake: no named person has to approve a claim before it is published. Every other ticket in this set produces copy that will need the same approval, so this one gates the rest.

**Acceptance**
- [ ] A named individual owns claims review for public-facing copy on both navinetics.com and this site.
- [ ] A written rule states which changes require their sign-off: any performance figure, any comparison with another device, any regulatory status, any indication, and any safety statement.
- [ ] The rule and the owner are recorded in docs/shubham/06-copy-policy.md and referenced from the CLAIMS NOTICE blocks in src/data/products.js, src/data/orTables.js and src/data/technology.js.
- [ ] A sign-off record exists for each claim currently live on either site.

**Files** — `docs/shubham/06-copy-policy.md`, `src/data/products.js`, `src/data/orTables.js`, `src/data/technology.js`
**Verify** — docs/shubham/06-copy-policy.md names the claims-review owner and lists the change classes requiring sign-off; each CLAIMS NOTICE block points at it

---

### NAV-035 · Prerender the routes at build time

`task` · **P1** · owner **engineering** · L · status **ready**

The single highest-leverage item left. The site is client-rendered, so a crawler or link unfurler that does not execute JavaScript sees one HTML file with no links in it and can discover exactly one URL. The OG tags, per-route canonical and sitemap that were added are the correct behaviour underneath prerendering, not a replacement for it — they only take effect once JS has run. For a company whose buyers are found through search and through links pasted into email, this caps discoverability at one page.

**Acceptance**
- [ ] A build-time prerender step (vite-plugin-ssg or equivalent) emits a real HTML file per route under dist/, each containing that route's rendered copy, its own <title>, canonical, OG tags and internal links
- [ ] dist/404.html is still produced and still byte-identical to the SPA shell, and .nojekyll is still written — the prerender must not break the GitHub Pages fallback that NAV-DEP-01 established
- [ ] Fetching a prerendered route with JavaScript disabled shows the page's real headings and body copy, not an empty root
- [ ] Hydration is clean: no hydration mismatch warnings in the console on any route
- [ ] Canvas scenes, IntersectionObserver gating and any browser-only globals are guarded so the build does not crash on window/document during prerender
- [ ] check:build is extended to assert one HTML file per sitemap URL, so a route silently dropping out of the prerender fails CI
- [ ] npm run check:routes and npm run check:mobile still pass against the prerendered output

**Files** — `vite.config.js`, `tools/check-build.mjs`, `src/main.jsx`, `src/App.jsx`, `package.json`, `.github/workflows/node.js.yml`
**Verify** — npm run build, then ls dist/**/index.html shows one per route; curl a route's HTML and grep for its h1 text; load it in a browser with JS disabled

---

### NAV-036 · Supply privacy policy, terms of use, cookie notice, accessibility statement and imprint

`task` · **P1** · owner **navinetics-legal** · L · status **ready**

The site has no privacy policy, no terms of use, no cookie notice and no accessibility statement — a gap it inherits from navinetics.com rather than one the rebuild introduced. The contact form collects a name, an email address, an organisation and a free-text message, and carries an inline plain-language notice about what happens to that data; that is a floor, not a policy. With distributors in the EU, the UK, Australia and Asia, European visitors are a certainty and so is the obligation that follows them.

**Acceptance**
- [ ] Legal supplies final text for a privacy policy, terms of use, cookie notice, and accessibility statement.
- [ ] The privacy policy covers each field the contact form collects, the retention period, and the route to request deletion.
- [ ] An imprint names NaviNetics, Inc., the Rochester address, and any EU or UK representative required for the markets served.
- [ ] Pages exist at stable paths, are linked from the footer on every page, appear in src/data/nav.js, and are listed in public/sitemap.xml.
- [ ] The inline notice on /contact is reconciled with the published policy so the two do not say different things.

**Files** — `src/pages/Privacy.jsx`, `src/pages/Terms.jsx`, `src/pages/Cookies.jsx`, `src/pages/Accessibility.jsx`, `src/components/Footer.jsx`, `src/data/nav.js`, `public/sitemap.xml`, `src/pages/Contact.jsx`
**Verify** — npm run build && npm run check:build passes with the new routes present in public/sitemap.xml; the footer links to each page and each renders the supplied text

---

### NAV-037 · Take focusable controls out of the aria-hidden SVG in EduFigures

`bug` · **P1** · owner **engineering** · S · status **ready**

The implanted-system figure in EduFigures.jsx puts the whole SVG behind aria-hidden="true", and then nests three groups inside it that each carry tabIndex={0}, role="button" and an aria-label. That combination is invalid: the elements stay in the tab order but have no accessible name and no role as far as assistive technology is concerned, so a keyboard user tabs into three announced-as-nothing stops and a screen-reader user is told there is nothing there. It is worse than either choice made cleanly.

**Acceptance**
- [ ] No element with tabIndex={0} or role="button" remains inside an aria-hidden subtree anywhere in src/ui/EduFigures.jsx
- [ ] Either the SVG is exposed with a proper accessible name (role="img" or role="group" plus a title/aria-label) and the three part controls keep their roles and labels, or the SVG stays hidden and the part controls are moved out into real focusable buttons alongside it
- [ ] Each part control is reachable by Tab, activates on Enter and Space, and updates the caption text below the figure
- [ ] The caption's change is announced — the description region is aria-live="polite" or the controls are a labelled radio/tab group
- [ ] The same audit is applied to the other five EduFigures: any interactive element inside an aria-hidden region is fixed or the finding recorded as absent

**Files** — `src/ui/EduFigures.jsx`
**Verify** — Load /resources/education, Tab through the implanted-system figure with a screen reader and confirm each stop is announced with its part name; then rg 'aria-hidden' -A 40 src/ui/EduFigures.jsx and confirm no tabIndex or role="button" falls inside a hidden subtree

---

### NAV-038 · Add the missing check npm scripts and run check:copy in CI

`chore` · **P2** · owner **engineering** · S · status **ready**

tools/check-copy.mjs was written to stop internal editorial notes reaching the page — the failure mode that put a "Still to come" checklist and a photo-shoot brief in front of visitors. It has no npm script and runs in CI nowhere, so nothing stops the same class of leak returning on the next copy edit. check-layout and check-resize are in the same position: real tools invoked only by hand, which means by memory. Only check:build currently gates the pipeline.

**Acceptance**
- [ ] package.json declares check:copy, check:layout and check:resize alongside the existing check:build, check:routes, check:mobile, check:webkit and check:perf
- [ ] A CI job builds, starts `vite preview --port 4319 --strictPort`, waits for it to answer, runs check:copy against it, and tears the server down whether the check passed or failed
- [ ] check:copy fails the job on any CERTAIN-list hit and reports SUSPECT hits without failing, so the split the tool already makes survives into CI
- [ ] A deliberate test leak (add the word 'placeholder' to a rendered string) fails the job, and removing it makes the job pass — proving the gate is live rather than merely present
- [ ] The deploy job still runs check:build after the build, unchanged

**Files** — `package.json`, `.github/workflows/node.js.yml`, `tools/check-copy.mjs`
**Verify** — Push a branch with a temporary rendered 'placeholder' string and confirm CI goes red on the check:copy step; remove it and confirm green

---

### NAV-039 · Get the entry chunk under Vite's 500 kB warning, or raise the budget on the record

`task` · **P2** · owner **engineering** · M · status **ready**

dist/assets/index-*.js is 522 kB raw / ~169 kB gzip, about 22 kB over the 500 kB threshold, so every build prints a chunk-size warning. Nine routes are already split and the 4,846-dot world dataset no longer reaches every visitor. What remains is React, react-router, framer-motion and the eagerly loaded Home path — including src/ui/index.js, a barrel that pulls SpecTable, Tabs, Accordion, Gallery, ConvergenceDiagram and ScrollSequence into the entry chunk for pages that never render them. This is not a measured user problem — Home is 0% busy with a 2172ms LCP — it is bytes every first-time visitor pays for, and a build warning that has become permanent and therefore invisible.

**Acceptance**
- [ ] npm run build completes with no 'Some chunks are larger than 500 kB' warning; OR build.chunkSizeWarningLimit is raised deliberately in vite.config.js with a comment stating the number and why — one or the other, never silence.
- [ ] Script bytes transferred for a cold load of / do not increase: the js kB figure from check-perf's per-route measurement is recorded before and after, and the after is equal or lower. A manualChunks split that only relocates bytes does not pass this ticket.
- [ ] Home LCP does not regress: median of 3 stays at or under 2172ms under the same 4x CPU / 1.6Mbps throttling.
- [ ] Home steady-state busy stays at 0%.
- [ ] No route gains a flash of the wrong ground on entry: any newly split route carries a Suspense fallback in its own ground colour, matching the pattern documented in src/components/AnimatedRoutes.jsx.
- [ ] npm run check:build stays 10/10 and npm run check:routes stays clean across all 17 routes.

**Files** — `vite.config.js`, `src/ui/index.js`, `src/components/AnimatedRoutes.jsx`, `src/pages/Home.jsx`
**Verify** — npm run build — no chunk-size warning in the output; then npm run check:build, npm run check:routes, and npm run check:perf for the / row (LCP, js kB, steady-state busy).

---

### NAV-040 · Give the locator-map markers a keyboard handler or make them non-interactive

`bug` · **P2** · owner **engineering** · S · status **ready**

LocatorMap.jsx renders an invisible circle per city with tabIndex={0}, role="button" and an aria-label, but the only handlers are onMouseEnter and onFocus. It announces itself as a button and does nothing when a keyboard user presses Enter or Space. Focus alone happens to change the active marker, so the behaviour half-works by accident, which makes it harder to notice than a control that fails outright.

**Acceptance**
- [ ] The markers either gain onKeyDown handling for Enter and Space that performs the same action as activation, or drop role="button" and tabIndex in favour of a non-interactive labelled presentation if there is genuinely nothing to activate
- [ ] If they remain focusable, they have a visible focus indicator — the current className is outline-none with no focus-visible replacement
- [ ] The role matches the behaviour: a control that only reveals a label on focus/hover is not a button
- [ ] Keyboard walkthrough of the map produces the same information a mouse user gets

**Files** — `src/ui/LocatorMap.jsx`
**Verify** — Load the page carrying LocatorMap, Tab to each marker, confirm a visible focus ring and that Enter/Space behaves as announced

---

### NAV-041 · Give the NaviNetics AI demo usable controls below 1024px

`task` · **P2** · owner **engineering** · M · status **ready**

Workstation.jsx hides both side panels below the lg breakpoint — the left panel and the right aside are both `hidden ... lg:flex` — leaving a phone or small-tablet visitor with view-only canvases and no way to drive the demo. The demo is the whole argument of the NaviNetics AI page: a surgeon looking at it on a phone between cases sees a picture of software instead of software. This is a design call as much as a defect, which is why it was deferred rather than patched.

**Acceptance**
- [ ] Below 1024px the demo exposes its controls in a form that fits — a bottom sheet, a collapsible drawer, or a tab strip switching between viewport and controls — rather than hiding them
- [ ] Every control available at desktop is reachable below 1024px, or a deliberate reduced set is chosen and the omissions are listed in a comment
- [ ] Controls meet the 44x44 tap-target minimum
- [ ] The demo canvases do not collapse to zero height at any width, and check-mobile reports no collapsed canvas on /technology/navinetics-ai
- [ ] No horizontal overflow at 344, 360, 375, 390, 412 and 430px
- [ ] Screenshots at 375 and 744px are reviewed, not only measured

**Files** — `src/ui/Workstation.jsx`, `src/pages/NaviNeticsAI.jsx`
**Verify** — npx vite preview --port 4319 --strictPort && npm run check:mobile (collapsed-canvas, tap-target and overflow checks), then node tools/shot.mjs /technology/navinetics-ai 375 812 600 ai-mobile and look at it

---

### NAV-042 · Install Playwright's WebKit browser in CI so check:webkit can run

`chore` · **P2** · owner **engineering** · S · status **ready**

tools/check-webkit.mjs drives Playwright's WebKit build and covers 16 routes across desktop 1440 and iPhone 15 — the only Safari coverage that exists. Playwright is a devDependency, but no CI step runs `npx playwright install`, so the browser binary is absent on the runner and the script cannot run there at all. Safari is a large share of the audience for a site read on iPhones and iPads in clinical settings, and today a WebKit regression can only be caught by someone remembering to run the check locally.

**Acceptance**
- [ ] A CI step runs `npx playwright install --with-deps webkit` before any step that needs it, cached on the Playwright version so it is not re-downloaded every run
- [ ] A CI job builds, serves the preview server, runs check:webkit against it, and tears the server down on both success and failure
- [ ] The job fails on a thrown exception, a console error, a failed image decode, horizontal overflow, or an h1 count other than one — the same assertions the local run makes
- [ ] Screenshots are uploaded as a build artifact so a WebKit-only visual regression can be inspected without a Mac
- [ ] The added minutes are measured and recorded; if the job is too slow for every push it is scheduled or gated to PRs, with the choice written into the workflow as a comment

**Files** — `.github/workflows/node.js.yml`, `tools/check-webkit.mjs`, `package.json`
**Verify** — Push a branch and confirm the check:webkit job runs to completion on the runner and uploads tools/.webkit/ as an artifact

---

### NAV-043 · Instrument place() before optimising the two pages that peg the main thread

`spike` · **P2** · owner **engineering** · M · status **ready**

/company/partners and /products/maven-neuromodulation sit at ~93% steady-state main-thread busy while the visitor does nothing, which is why controls feel unresponsive on those pages. Two optimisations have already been made on the assumption that canvas drawing was the cost, and neither moved the number. The remaining suspect is place() in PartnerGlobe.jsx, which writes style.left, top, opacity, pointerEvents and a custom property on every pin, site marker and chip on EVERY frame — forcing style recalculation and synchronous layout, which is far more expensive than canvas work. Roughly 44 long tasks per 5 s at ~107 ms each is about 9 fps, compute-bound. This is explicitly a hypothesis, and the last two hypotheses were wrong, so the deliverable is a measurement and not a patch.

**Acceptance**
- [ ] place() is disabled (or reduced to a no-op) and /company/partners is re-measured with check:perf; the busy% delta is recorded with its median-of-3 spread
- [ ] If place() is the cost, the same method identifies whether MavenHero's own loop or the four concurrent band scenes drive /products/maven-neuromodulation — MAVEN has not been investigated in the same depth
- [ ] The finding is written into docs/shubham/09-performance.md as a measured result, stating plainly whether the hypothesis held
- [ ] No optimisation is applied in this ticket; the output is a number and a named cause, and any fix is raised as its own ticket with a target busy%
- [ ] Measurements are taken with no dev server running, since a running dev server contends for the same cores and makes the numbers unreliable

**Files** — `src/ui/PartnerGlobe.jsx`, `src/ui/MavenHero.jsx`, `tools/check-perf.mjs`, `docs/shubham/09-performance.md`
**Verify** — Stop the dev server; npm run build && npx vite preview --port 4319 --strictPort && npm run check:perf, once with place() live and once with it stubbed, comparing medians

---

### NAV-044 · Make check-perf declare a contended measurement instead of reporting it as fact

`chore` · **P2** · owner **engineering** · S · status **ready**

Numbers taken while npm run dev is running are contended and unreliable — the dev server, its file watcher and its esbuild workers compete for the same cores as the page under measurement. This has already produced wrong numbers once, and the failure is silent: a contended run looks exactly like a slow page. It is the same class of fault as the six-times-counted observer and the leaked browsers, both of which were fixed by making the instrument declare its own state rather than by remembering a rule.

**Acceptance**
- [ ] tools/check-perf.mjs probes for a listener on the Vite dev port before its first navigation and prints a labelled banner when one is found.
- [ ] The banner appears above the results, not after them, so a pasted result carries its own caveat.
- [ ] It warns rather than exits when the target URL is itself the dev server, because `node tools/check-perf.mjs http://localhost:5173` is a legitimate invocation.
- [ ] The same caution is stated in the header comment of tools/check-perf.mjs and in docs/shubham/05-verification.md, next to the instructions that tell a reader to start a server.
- [ ] Verified by observation: start npm run dev, run check:perf against preview on 4319, see the banner; stop dev, rerun, banner is gone.

**Files** — `tools/check-perf.mjs`, `docs/shubham/05-verification.md`
**Verify** — With npm run dev running, npm run check:perf prints the contention banner before the first results table; with dev stopped, it does not.

---

### NAV-045 · Obtain written permission for the five partner marks

`task` · **P2** · owner **navinetics-legal** · M · status **ready**

/company/partners renders the marks of Abbott, Paragon Care, Lituo Medical, ELIM DMP and Delta Medical. Most were extracted from an internal slide deck, and src/assets/partners/README.md records no permission trail for any of them. Using another company's logo generally needs their agreement, and usually comes with brand rules attached — Abbott's wordmark is black, for instance, so recolouring it to survive the dark theme would breach most guidelines.

**Acceptance**
- [ ] Written permission is on file for each of the five marks, with any brand-guideline constraints recorded.
- [ ] Each permission is noted in the table in src/assets/partners/README.md against the file it covers.
- [ ] Any mark without permission is removed from the page and that organisation is presented as text instead.
- [ ] The low-resolution Lituo Medical mark (194x68 in the deck) is re-requested at 800px or wider while permission is being sought.

**Files** — `src/assets/partners/README.md`, `src/data/partners.js`, `src/pages/Partners.jsx`
**Verify** — Every row of the table in src/assets/partners/README.md carries a permission reference; /company/partners renders no mark that lacks one

---

### NAV-046 · Render MAVEN's specification table on the MAVEN page

`task` · **P2** · owner **engineering** · S · status **ready**

data/products.js carries a six-row spec block for MAVEN — modality, technique, telemetry, stimulation, analytes, use — and it renders nowhere, because the only component that draws specs is SpecTable and its only consumer was the unreachable template. The D1 page was given a SpecTable directly for exactly this reason; MAVEN was not. A researcher evaluating the instrument currently cannot see on the page that it does FSCV and MCSWV, or that it is for preclinical research, in the one place they would look for it.

**Acceptance**
- [ ] /products/maven-neuromodulation renders a SpecTable from the MAVEN record's `specs`, with a caption
- [ ] The 'Use: Preclinical research' row is present, so the research framing appears in the specification and not only in prose
- [ ] The section uses the standard Section wrapper so it lands on the site's 73px content edge at 1440px
- [ ] No invented figures are added: the table renders exactly what data/products.js already holds, and any absent dimension stays absent rather than being estimated
- [ ] check-copy still passes on the route — the page must not gain a paragraph explaining which figures are missing

**Files** — `src/pages/Maven.jsx`, `src/data/products.js`, `src/ui/SpecTable.jsx`
**Verify** — Load /products/maven-neuromodulation in the preview server and read the table; then node tools/check-layout.mjs and node tools/check-copy.mjs

---

### NAV-047 · Resolve the NaviNetics Asia name-and-logo mismatch on the partners page

`decision` · **P2** · owner **navinetics-marketing** · S · status **ready**

The South Korea entry on /company/partners is introduced as "NaviNetics Asia" while displaying the CBH mark — the name the subsidiary traded under before the March 2026 integration. It may still trade as CBH, in which case the name should follow the logo; if a NaviNetics Asia mark exists, the file should be replaced. Either way the page currently shows a name and a mark that do not agree, which is the kind of detail a distributor notices.

**Acceptance**
- [ ] Company states which name the South Korean entity is presented under publicly.
- [ ] If NaviNetics Asia: a NaviNetics Asia mark is supplied at 800px wide or more on a transparent or white background, and dropped over src/assets/partners/navinetics-asia.png keeping the filename.
- [ ] If CBH: the org name in src/data/partners.js is changed to follow the mark.
- [ ] node tools/partner-logos.mjs is run so the rendered .webp matches the master.
- [ ] The note in src/data/partners.js and the one in src/assets/partners/README.md are both updated with the answer.

**Files** — `src/data/partners.js`, `src/assets/partners/navinetics-asia.png`, `src/assets/partners/README.md`
**Verify** — node tools/partner-logos.mjs; load /company/partners and confirm the South Korea entry's name and mark agree

---

### NAV-048 · Retire the unreachable /products/:slug template

`chore` · **P2** · owner **engineering** · S · status **ready**

src/pages/Product.jsx is dead code. All three product slugs — d1-stereotactic-frame, carbon-fiber-surgical-tables, maven-neuromodulation — have dedicated static routes declared above /products/:slug in AnimatedRoutes.jsx, and React Router ranks static segments above dynamic ones regardless of order, so the template never runs. It carries the only renderers for SpecTable, ComparisonTable and ComingSoon plus a lazy chunk that is downloaded by nobody. Leaving it in place means the next person to edit product copy may edit a file that no visitor can reach.

**Acceptance**
- [ ] Either the /products/:slug route and src/pages/Product.jsx are deleted, or a slug exists that resolves to the template — not both states left ambiguous
- [ ] If deleted: no import of Product.jsx remains, the lazy chunk is gone from the build manifest, and any component whose only consumer was Product.jsx (ComparisonTable; ComingSoon if Technology.jsx no longer uses it) is either deleted with it or documented as intentionally retained for a named future caller
- [ ] If deleted: the comparison-grid data in src/data/products.js is either removed or given a rendering site, so no data structure is left with no consumer
- [ ] The getProduct / isPlaceholder / otherProducts helpers keep only the consumers that actually exist
- [ ] All 17 routes still load clean and check:build still passes 10/10
- [ ] The decision and its reason are appended to docs/shubham/04-open-items.md section C

**Files** — `src/pages/Product.jsx`, `src/components/AnimatedRoutes.jsx`, `src/ui/SpecTable.jsx`, `src/ui/ComingSoon.jsx`, `src/data/products.js`, `docs/shubham/04-open-items.md`
**Blocked by** — NAV-PRD-02 should land first if the spec data is to be preserved on a live page — otherwise deleting the template removes the last SpecTable consumer for MAVEN
**Verify** — rg "Product\.jsx|products/:slug" src returns nothing (or exactly one intended route); npm run build && npm run check:build; node tools/check-routes.mjs against the preview server

---

### NAV-049 · Run tools/check-resize.mjs to completion and record the result

`task` · **P2** · owner **engineering** · S · status **ready**

Every other check loads a page fresh at a fixed size, so nothing exercises a viewport that CHANGES. This site has ten canvases sizing themselves off clientWidth and devicePixelRatio, several rAF loops, and a navbar that measures element positions — all of which can be correct at mount and wrong after a monitor change. The reported symptom that prompted the tool was a tab crashing on a display switch. check-resize.mjs was written to step a live page through both attached displays including DPR changes in both directions, and it has never been run to completion, so the coverage gap is still open and the tool itself is unproven.

**Acceptance**
- [ ] check-resize runs end to end against the preview server over all eight steps, including the phone -> ultrawide and ultrawide -> laptop DPR jumps
- [ ] It runs against at least the canvas-heavy routes: /company/partners, /products/maven-neuromodulation, /products/d1-stereotactic-frame, /technology/navinetics-ai, /resources/education
- [ ] Results are recorded in docs/shubham/09-performance.md: thrown exceptions, console errors, canvas backing-store area after each step, and whether the app is still mounted at the end
- [ ] Any canvas whose backing store grows unbounded across steps is identified by component name, not just reported as an area number
- [ ] If the tool needs fixing to complete, the fix lands with it — a check that has never finished is not coverage
- [ ] If the run is clean, that is recorded as a result rather than an assumption

**Files** — `tools/check-resize.mjs`, `docs/shubham/09-performance.md`
**Verify** — npm run build && npx vite preview --port 4319 --strictPort, then node tools/check-resize.mjs http://localhost:4319 and paste the output into docs/shubham/09-performance.md

---

### NAV-050 · Verify the rgb(from ...) fix on iOS 16.3 or below

`task` · **P2** · owner **engineering** · S · status **ready**

The ScienceBand light scrim was written inline with relative colour syntax — rgb(from var(--canvas) r g b / .88). That syntax is Safari 16.4+ and Chrome 119+, and on iOS 16.3 and below the whole linear-gradient declaration fails to parse, so the band loses its scrim entirely and the copy sits directly on the raw animation with nothing holding it readable. The fix replaced it with three explicit stops. WebKit 26.5 tests 32/32 clean, but 26.5 is a CURRENT engine that supports the syntax anyway — so the green result proves today's Safari is fine, not that the bug was imaginary. Playwright cannot supply an old WebKit. The fix currently stands on support data alone, with no reproduction and no confirmation.

**Acceptance**
- [ ] /technology/stereotactic-devices and /products/d1-stereotactic-frame (the ScienceBand routes) are loaded on a real iOS 16.3-or-below device or a BrowserStack/Sauce session on that version
- [ ] The band scrim is confirmed present and the copy legible over the animation, with a screenshot kept alongside the WebKit set in tools/.webkit/
- [ ] src/index.css is grepped for any remaining relative-colour or color-mix declaration on a code path an old engine must resolve, and each hit is either replaced with explicit stops or confirmed to have a working fallback
- [ ] --band-scrim-1/2/3 are confirmed still in step with --canvas (#f4f7f9); a comment already says they must be, and nothing enforces it
- [ ] The result is recorded in docs/shubham/09-performance.md, replacing the current caveat with a finding either way

**Files** — `src/index.css`, `src/ui/ScienceBand.jsx`, `docs/shubham/09-performance.md`
**Blocked by** — Access to an iOS 16.3-or-below device or a paid cross-browser testing account
**Verify** — Open the deployed preview on the old-iOS session, screenshot the ScienceBand, and confirm the scrim renders; keep the screenshot in tools/.webkit/

---

### NAV-051 · Add a steady-state busy% regression gate to check-perf

`chore` · **P3** · owner **engineering** · S · status **ready**

Two pages reached 93% busy without anyone noticing, because nothing measured it until a visitor complained. Once NAV-PERF-03 and NAV-PERF-04 land, the same drift can happen again the next time a scene is added. A local exit-code gate on the busy ratio catches it the first time someone runs the check rather than the first time someone taps a menu. Not a CI gate: CI has no throttled Chrome and shared runners would make the number meaningless — the honest place for this is the developer's machine.

**Acceptance**
- [ ] check-perf exits non-zero when any measured route's median steady-state busy% exceeds a per-route budget declared in one table at the top of tools/check-perf.mjs.
- [ ] Budgets are seeded at today's measured values so the gate is green on landing, and are tightened in the same commit as NAV-PERF-03 and NAV-PERF-04.
- [ ] A run whose spread exceeds 10 points reports UNTRUSTWORTHY and does not fail the build on that route, because a noisy measurement is not evidence of a regression.
- [ ] The budget table carries a comment stating that these are budgets and not targets, and that raising one requires a reason written beside it.

**Files** — `tools/check-perf.mjs`, `docs/shubham/05-verification.md`
**Verify** — npm run check:perf exits 0 at current budgets; temporarily lower one budget and confirm it exits non-zero and names the route.

---

### NAV-052 · Commission the two outstanding Education photographs

`task` · **P3** · owner **navinetics-marketing** · M · status **ready**

Two image slots under the Deep Brain Stimulation topic on the Education page were briefed and never shot. The briefs themselves were removed from the page, because they rendered as dashed boxes printing photo-shoot instructions to a visitor who came to read about DBS. The two are a studio shot of the three implanted parts — lead, extension and pulse generator — laid out unbranded on a neutral ground, and a consented clinical photograph of a clinician adjusting stimulation settings. The slots still exist, so dropping the files in fills them with no other change.

**Acceptance**
- [ ] Both photographs are delivered at a resolution suitable for a 2x display.
- [ ] The clinical photograph carries documented patient and clinician consent for public use.
- [ ] Each is added to the `shots` array under the `dbs` topic in src/data/education.js as `src` with a caption, and the consent reference is recorded beside it.
- [ ] Neither image shows a competitor's branding or any identifiable patient feature.

**Files** — `src/data/education.js`, `src/assets/education/`
**Verify** — Load /resources/education and confirm topic 01 renders three images; confirm consent references are recorded beside the imports in src/data/education.js

---

### NAV-053 · Put the theme toggle in the persistent bar below 640px

`task` · **P3** · owner **engineering** · S · status **ready**

Navbar.jsx renders the bar's theme toggle as `hidden sm:inline-flex`, so below 640px it is absent from the persistent chrome. It is not gone entirely — a copy sits inside the mobile menu panel, so a phone user can still reach it by opening the menu — but switching theme on the smallest screens takes two interactions and is undiscoverable, on exactly the devices where a dark hospital corridor or a bright OR most changes which theme a reader wants.

**Acceptance**
- [ ] The theme toggle is reachable on the smallest supported width (344px) without first opening the menu, or a deliberate decision to keep it menu-only is recorded in a comment in Navbar.jsx
- [ ] If it is added to the bar, the bar does not wrap or overflow at 344, 360 and 375px — check-mobile reports no horizontal overflow on any route
- [ ] The toggle meets the 44x44 tap-target minimum at every width
- [ ] The menu-panel copy and the bar copy do not both render at any single width, so a screen reader does not encounter two controls with the same label

**Files** — `src/components/Navbar.jsx`, `src/ui/ThemeToggle.jsx`
**Verify** — npm run check:mobile for overflow and tap targets at 344/360/375, plus a visual pass at each width

---

### NAV-054 · Reduce the intra-section mt-* ladder to a scale and normalise three page headers

`chore` · **P3** · owner **engineering** · M · status **ready**

The frame is unified — one measure, one gutter, one rhythm — but spacing INSIDE sections is still ad hoc: 15 distinct mt-* values from mt-1 to mt-28 across the pages, with no scale behind them. Three page headers also carry one-off top padding rather than a scale value. Nothing is visibly broken, which is why it was left; the cost is that every new section is a fresh guess and the ladder grows. This is the tail of the layout work, deliberately lower risk than the frame changes and correspondingly lower priority.

**Acceptance**
- [ ] The 15 distinct mt-* values are reduced to four or five documented steps, and the chosen scale is written into docs/shubham/03-layout-system.md next to the measure, gutter and rhythm
- [ ] Partners, Education and Publications page headers use a scale value instead of their current one-off 48 / 56 / 64px top padding
- [ ] check-layout's SECTION TOP PADDING output shows only the standard 96px, the deliberate 144px hero nav clearance and 0px full-bleed — no one-off values
- [ ] CONTENT LEFT EDGE is unchanged: one value per width at 375, 768, 1024, 1440 and 1920
- [ ] A visual pass at 1440px across all 16 routes confirms nothing collapsed or doubled

**Files** — `src/pages/Partners.jsx`, `src/pages/Education.jsx`, `src/pages/Publications.jsx`, `src/ui/Section.jsx`, `docs/shubham/03-layout-system.md`, `tools/check-layout.mjs`
**Verify** — npx vite preview --port 4319 --strictPort && node tools/check-layout.mjs http://localhost:4319 — SECTION TOP PADDING should list only 96 / 144 / 0


---

## Done — detail

Landed on `site-fixes-2026-08`. Listed so a reviewer can see what the branch actually contains.


### NAV-055 · Fix the four faults that broke the GitHub Pages deploy

`bug` · **P0** · owner **engineering** · M · status **done**

The deployed site did not work at all. `base` in vite.config.js was the bare string `navinetics-web-v2` with no leading or trailing slash, the router had no `basename`, GitHub Pages had no SPA fallback file, and Jekyll was free to strip underscore directories. A visitor landing on the site's own home URL was served the 404 component, and every deep link, bookmark, refresh and crawl returned GitHub's own 404 before the app ever booted. Any one of the four alone would have broken the deploy.

**Acceptance**
- [ ] vite.config.js sets base: '/navinetics-web-v2/' with both slashes, and `npm run build` emits no base-path warning
- [ ] src/App.jsx passes basename={import.meta.env.BASE_URL} to <Router>, so the same value covers dev ('/') and build
- [ ] `npm run build` produces dist/404.html byte-identical to dist/index.html and an empty dist/.nojekyll, written by the spaFallback() plugin at closeBundle
- [ ] `npm run check:build` reports 10/10 pass
- [ ] All 17 routes load at the deployed base shape with no empty root, no thrown exception, no console error and no failed image decode

**Files** — `vite.config.js`, `src/App.jsx`, `tools/check-build.mjs`, `tools/check-routes.mjs`
**Verify** — npm run build && npm run check:build; then npx vite preview --port 4319 --strictPort and node tools/check-routes.mjs http://localhost:4319

---

### NAV-056 · Make the contact form actually transmit the message

`bug` · **P0** · owner **engineering** · M · status **done**

Contact.jsx validated the input, showed a success panel, and then discarded the message — it told the visitor nothing had been transmitted. This is the only conversion point on the site: the navbar button, the Home close, "Ask about the D1", "Talk to the team", "Ask about a table" and the 404 page all funnel here. A device company also needs its complaint path to be findable, not a line in a footer.

**Acceptance**
- [ ] The form POSTs JSON to VITE_CONTACT_ENDPOINT when it is set, with real sending / sent / failed states rather than an unconditional success panel
- [ ] With no endpoint configured it does not pretend: it hands the message to the visitor's mail client fully composed, so the words they wrote survive
- [ ] The reason list covers distribution, press, and product complaint or device issue
- [ ] Selecting the complaint reason surfaces guidance to include device and date and NOT to include patient identifiers
- [ ] An organisation field is present, and a plain-language notice about what happens to what they typed sits next to where they type it
- [ ] ?reason= in the URL preselects the enquiry type

**Files** — `src/pages/Contact.jsx`
**Verify** — With VITE_CONTACT_ENDPOINT unset, submit the form in the preview server and confirm the mail client opens with the composed message. With it set to a request-bin URL, submit and confirm the JSON body arrives and the panel shows a real sent state.

---

### NAV-057 · Remove the six unsubstantiated claims that reached production

`task` · **P0** · owner **engineering** · M · status **done**

Six claims were published that the site could not substantiate — including a quantitative accuracy figure ("around 0.6 mm deviation" against unnamed "industry-standard planning software") for software the same page states has had no submission and no clearance, and FDA's terms of art "safe, effective" asserted about our own devices. Each was removed rather than softened, because softening a claim a medical device company cannot support still leaves the claim. Every edit carries a comment saying what was there and why it went.

**Acceptance**
- [ ] "unparalleled precision" no longer appears in the Home hero lead; the replacement lead names the three product lines and the field, which also closes the separate finding that a cold visitor could not tell what NaviNetics makes
- [ ] The 0.6 mm deviation figure and the "industry-standard planning software" comparator are gone from the NaviNeticsAI status ladder
- [ ] "safe, effective" is gone from the Who We Are hero, its meta description, the Contact hero lead and the footer
- [ ] "Superior radiolucency" and "Lightweight and safe" are gone from the orTables strengths list
- [ ] Each removal site carries an in-place comment recording the removed text and the reason, so it does not come back
- [ ] No rendered string on any route matches the removed phrases, checked against rendered text rather than source

**Files** — `src/pages/Home.jsx`, `src/pages/NaviNeticsAI.jsx`, `src/pages/WhoWeAre.jsx`, `src/pages/Contact.jsx`, `src/components/Footer.jsx`, `src/data/orTables.js`, `src/lib/meta.js`
**Verify** — npm run build && npx vite preview --port 4319 --strictPort, then node tools/check-copy.mjs — it reads the rendered text of every route rather than grepping source, so code comments recording the removals do not false-positive

---

### NAV-058 · Resolve public/ assets through asset() so images load under the sub-path

`bug` · **P0** · owner **engineering** · M · status **done**

Nineteen files referenced from public/ used root-absolute literals like '/DSC05397-1024x695.jpg'. Vite copies public/ verbatim and does not rewrite those, so under a sub-path deploy every one 404'd: the three founder portraits, all D1 photography, the entire media library, the /products/:slug hero and gallery, two technology heroes, and — because data/technology.js fed `hero` into the mega-panel — two thumbnails in the global navigation on every page. The logo was a separate case: referenced from CSS as url("/logo-378x75-1.png"), which Vite also leaves alone.

**Acceptance**
- [ ] src/lib/asset.js exports asset(path), prefixing import.meta.env.BASE_URL and returning the input unchanged for http(s):, data: and blob: URLs and for paths that already carry the base
- [ ] All 21 data-definition sites that hold a public/ path pass it through asset(), so no consumer needs to know which kind of URL it is holding
- [ ] The logo lives at src/assets/logo.png and is reached by a relative url() from src/index.css and by a real import in src/data/partners.js — no root-absolute logo reference remains
- [ ] check-build's scan of every bundled .js and .css for "/filename" literals finds no public/ file referenced at the server root
- [ ] No image fails to decode on any of the 17 routes in headless Chrome

**Files** — `src/lib/asset.js`, `src/data/products.js`, `src/data/technology.js`, `src/data/media.js`, `src/data/d1.js`, `src/data/company.js`, `src/data/partners.js`, `src/data/orTables.js`, `src/data/neuromodulation.js`, `src/index.css`, `src/assets/logo.png`
**Verify** — npm run build && npm run check:build (the server-root scan is one of the ten assertions); then node tools/check-routes.mjs, which fails on any image that does not decode

---

### NAV-059 · Add sharing metadata, structured data, robots and sitemap, and per-route canonical/OG

`task` · **P1** · owner **engineering** · M · status **done**

The site is client-rendered with no SSR, so a crawler or link unfurler that does not execute JavaScript sees only index.html and can discover exactly one URL. Before this, every shared link — a product page emailed to a surgeon, a page posted to LinkedIn — rendered as a bare URL with no title, summary or image. This is the correct behaviour underneath prerendering, not a substitute for it.

**Acceptance**
- [ ] index.html carries Open Graph, Twitter Card and canonical tags, and Organization JSON-LD that asserts only what is verifiable from the site — no certifications, clearances or performance claims
- [ ] public/robots.txt and public/sitemap.xml exist, and the sitemap lists all 16 public routes
- [ ] src/lib/meta.js sets canonical, og:title, og:description, og:url and the Twitter equivalents per route, not just title and description
- [ ] All 18 pages get the per-route tags without further edits, because all 18 already call usePageMeta
- [ ] check-build asserts robots.txt, sitemap.xml, an OG title, a canonical and JSON-LD are all present in the built output

**Files** — `index.html`, `src/lib/meta.js`, `public/robots.txt`, `public/sitemap.xml`, `tools/check-build.mjs`
**Verify** — npm run build && npm run check:build; then load two routes in the preview server and read document.querySelector('link[rel=canonical]').href and the og:url meta to confirm they differ per route

---

### NAV-060 · Add the check tools and gate the build in CI

`chore` · **P1** · owner **engineering** · L · status **done**

If a bug class can ship once it can ship again. Every failure that reached production here was invisible in dev, because dev serves from / and production serves from a sub-path. check-routes already existed — written after the home page shipped blank for several commits — but it requested /, the URL shape that does not exist in production, which is exactly why it never caught the missing router basename.

**Acceptance**
- [ ] tools/check-build.mjs runs with no browser and asserts ten things about dist/: 404.html present and byte-identical to index.html, .nojekyll present, every asset URL in index.html carries the deployed base, no public/ file referenced at the server root (scanning every bundled .js and .css for "/filename" literals), and robots.txt, sitemap.xml, an OG title, a canonical and JSON-LD all present
- [ ] check:build runs in .github/workflows/node.js.yml immediately after the build step, with a comment saying which three failures it gates
- [ ] tools/check-routes.mjs requests the deployed base rather than /
- [ ] tools/check-layout.mjs measures content left edge, inner container width and section padding at 375/768/1024/1440/1920 across 16 routes and prints the distinct values
- [ ] tools/check-mobile.mjs drives two real phone profiles with touch emulation and reports horizontal overflow with the offending elements NAMED, sub-44px tap targets, sub-12px text, collapsed canvases, h1 count, broken images and console errors, writing a screenshot per route to tools/.mobile/
- [ ] tools/check-perf.mjs reports the median of 3 with the spread shown, installs its observer script once rather than per route, and closes its browser
- [ ] tools/check-webkit.mjs, tools/check-resize.mjs and tools/shot.mjs exist and are documented in docs/shubham/05-verification.md
- [ ] Every browser tool puts its Chrome profile in os.tmpdir() — a profile inside the project tree sits in Vite's watcher and Vite exits with EBUSY the moment Chrome touches its own session or cache database, which kills the dev server the check is pointed at
- [ ] Every tool calls Browser.close; leaked headless Chromes from earlier runs previously competed for cores and made each successive measurement look worse regardless of code

**Files** — `tools/check-build.mjs`, `tools/check-routes.mjs`, `tools/check-layout.mjs`, `tools/check-mobile.mjs`, `tools/check-perf.mjs`, `tools/check-webkit.mjs`, `tools/check-resize.mjs`, `tools/shot.mjs`, `.github/workflows/node.js.yml`, `docs/shubham/05-verification.md`
**Verify** — npm run build && npm run check:build (10/10); npx vite preview --port 4319 --strictPort then npm run check:mobile, node tools/check-layout.mjs, node tools/check-routes.mjs; confirm the CI workflow contains the check:build step

---

### NAV-061 · Fix dark-theme status contrast, the missing Careers h1 and the 36px menu button

`bug` · **P1** · owner **engineering** · S · status **done**

--ok, --warn and --crit were never redefined for the dark theme, so they were being read on --surface (#0a2231) at 3.81:1, 4.12:1 and 3.14:1 — all below WCAG AA. That put the Contact form's error text and the mega-menu's "In development" label below the threshold on every dark page. Separately, Careers has no Hero so its outline started at h2 with no h1 above it, and the hamburger — the only way into the navigation on a phone — was 36x36, under the WCAG 2.2 AA target minimum.

**Acceptance**
- [ ] --ok, --warn and --crit are redefined for the dark theme and measure 8.3, 7.4 and 5.9:1 against --surface
- [ ] Careers renders exactly one h1: SectionHead already took a `level` prop, and both branches pass level="h1"
- [ ] The menu button is h-11 w-11 (44x44)
- [ ] check-mobile reports one h1 per page and no tap target under 44x44 across 16 routes on both phone profiles

**Files** — `src/index.css`, `src/pages/Careers.jsx`, `src/components/Navbar.jsx`, `tools/check-mobile.mjs`
**Verify** — npx vite preview --port 4319 --strictPort && npm run check:mobile — it reports h1 count and sub-44px tap targets per route; contrast values re-measured against --surface with a contrast checker

---

### NAV-062 · Make the mega-menu keyboard-operable and the media lightbox a real dialog

`bug` · **P1** · owner **engineering** · M · status **done**

Two procurement blockers, not polish — hospitals procure against Section 508 and EN 301 549. The Company, Products and Technology sub-links could not be reached by keyboard at all, and the panels rendered after the whole nav bar in DOM order. The media lightbox claimed role="dialog" and aria-modal="true" and implemented none of what those attributes promise: no Escape, no focus move, no focus trap, no focus return. For a mouse user it worked; for a keyboard user it opened a dialog they could not reach, could not leave, and whose backdrop they could tab straight through.

**Acceptance**
- [ ] Mega-menu triggers carry aria-expanded and aria-controls, and a key handler opens the panel and moves focus into its first link
- [ ] Escape closes the panel and returns focus to the trigger rather than stranding the reader at the top of the document
- [ ] Tabbing out of the last link in a panel closes it instead of leaving an open panel behind the reader
- [ ] src/lib/dialog.js exports useDialog(open, onClose) implementing all four dialog promises — Escape, focus move in, focus trap in both Tab directions, focus return to the opener captured before focus moves
- [ ] Media.jsx uses useDialog with a stable useCallback close handler, so the effect does not tear down and re-move focus on every render
- [ ] Keyboard walkthrough: open every mega-panel, open and close the lightbox, without a mouse

**Files** — `src/components/Navbar.jsx`, `src/lib/dialog.js`, `src/pages/Media.jsx`
**Verify** — Manual keyboard walkthrough in the preview server: Tab to each nav trigger, open with Enter/Down, Tab through the panel, Escape; then Tab to a media tile, open the lightbox, Tab around it, Escape, and confirm focus lands back on the tile

---

### NAV-063 · Measurement hygiene: observer installed once, browsers closed, median of 3

`chore` · **P1** · owner **engineering** · S · status **done**

The first set of performance numbers reported was wrong, and was acted on before anyone checked the instrument. Three faults: Page.addScriptToEvaluateOnNewDocument was called inside the per-route loop, so by the sixth page six observers were installed and every long task was counted six times — reporting 13,314ms of blocking inside a 9,000ms window, impossible on its face. Every browser tool spawned a headless Chrome and none closed one, so they accumulated and competed for the cores being measured. And single runs had a spread three times larger than the effect: /company/partners measured 828, 2615 and 1654ms on identical code. The metric was wrong too — load-time TBT does not describe a page that is sitting still.

**Acceptance**
- [ ] Page.addScriptToEvaluateOnNewDocument is called once, before the route loop — tools/check-perf.mjs line 92, with the reason in the comment above it.
- [ ] Browser.close on exit in check-perf, check-layout, check-mobile, check-webkit, check-resize and check-copy. check-routes is the outstanding exception and is tracked as NAV-PERF-08.
- [ ] check-perf reports the median of 3 with the individual runs and the spread printed, so an untrustworthy number is visible as one rather than quoted as fact.
- [ ] A steady-state busy% metric exists — share of wall-clock inside long tasks over 5s after the page settles — and is stable to about 2% run to run, which is what makes the 93.8% and 91.9% figures usable.
- [ ] The reasoning lives in the source, not only in the doc: tools/check-perf.mjs lines 86-91, 131-143 and 235-241 each say why the code is shaped the way it is.

**Files** — `tools/check-perf.mjs`, `tools/check-layout.mjs`, `tools/check-mobile.mjs`, `tools/check-webkit.mjs`, `tools/check-resize.mjs`, `tools/check-copy.mjs`, `docs/shubham/09-performance.md`
**Verify** — npm run check:perf — every PAGE LOAD row prints '(runs a/b/c, spread n)' and every STEADY STATE row prints '(runs a/b/c)'; no chrome.exe survives the run.

---

### NAV-064 · Repair the two dead internal routes and redirect the old paths

`bug` · **P1** · owner **engineering** · S · status **done**

/company/careers and /products were linked from five places and were never declared as routes. The "Work with us" and "Open roles" buttons — the only outbound links on the Who We Are and Community pages — both 404'd, and on GitHub Pages they 404'd at the server before the app could even render a NotFound page.

**Acceptance**
- [ ] No link in src/ targets /company/careers or /products; the Careers CTAs point at /resources/careers and the products CTA at /products/d1-stereotactic-frame
- [ ] Both retired paths appear in the `redirects` table in src/data/nav.js so anything already shared still resolves
- [ ] Loading /company/careers lands on /resources/careers and /products lands on /products/d1-stereotactic-frame, in a browser, from the deployed base

**Files** — `src/data/nav.js`, `src/pages/WhoWeAre.jsx`, `src/pages/Community.jsx`, `src/ui/ComingSoon.jsx`
**Verify** — rg "/company/careers|to=\"/products\"" src --glob '*.jsx' returns nothing; then load both old paths in the preview server and confirm the redirect

---

### NAV-065 · Restore the FDA 510(k) clearance statement and the company's own product language

`task` · **P1** · owner **engineering** · M · status **done**

The audit recorded "no regulatory status is stated for any product, on any page" as needing a company decision. It did not: navinetics.com already states, publicly and today, that NaviNetics has developed an FDA cleared system. The rebuild had dropped the only regulatory statement the company makes — a regression, and the first thing a hospital value-analysis committee looks for. Restoring it matches an existing public statement rather than inventing one. Five components the live site lists (both sterilisation trays, the ground-truth fixture kit, the key placement guide, screw kits) were also missing, and MAVEN needed the live site's own "preclinical research" framing so it is not read as a cleared device.

**Acceptance**
- [ ] The D1 record carries status 'FDA 510(k) cleared' — "cleared", never "approved" — with a `number` field present and explicitly null pending the 510(k) number, and the clearance sentence in the company's own wording
- [ ] The D1 page renders the clearance status, and the spec table carries a "Regulatory status" row
- [ ] The five missing components are present in the D1 component list
- [ ] D1 carries aka: ['NaviNetics Frame System'], surfaced on the page and in the page description, so the old product name still finds the page
- [ ] MAVEN is stated as a preclinical research instrument and no clearance or human-use claim is made for it anywhere
- [ ] No WINCS alias or WINCS-lineage sentence appears on the MAVEN page or in its data — WINCS is an earlier generation, confirmed by NaviNetics, and the reason is recorded in products.js so it is not re-added
- [ ] The footer names the legal entity NaviNetics, Inc.
- [ ] Contact accepts ?reason= to preselect the enquiry type, and the D1 and surgical-table pages link to it that way

**Files** — `src/data/products.js`, `src/pages/D1.jsx`, `src/pages/Maven.jsx`, `src/pages/SurgicalTables.jsx`, `src/pages/Contact.jsx`, `src/components/Footer.jsx`
**Verify** — Load /products/d1-stereotactic-frame in the preview server: the clearance statement, the alias, the component list and the Regulatory status spec row are all visible. rg "WINCS" src/data/products.js src/pages/Maven.jsx returns only the comment explaining why it is absent.

---

### NAV-066 · Take internal editorial notes off the public pages

`task` · **P1** · owner **engineering** · M · status **done**

This codebase is unusually disciplined about not publishing claims it cannot substantiate, but the record of that discipline had leaked onto the pages. Visitors were shown a page-closing section headed "What is still open", a "Still to come" checklist naming everything NaviNetics had not documented (including "Sign-off on the body copy"), alt text reading "Placeholder image — NaviNetics AI visuals pending", and photo-shoot briefs rendered as dashed boxes on a public education page. A surgeon or a purchasing manager did not ask about our editorial process; publishing the gaps does not make a page more honest, it makes it read as unfinished and hands a competitor a list of what we cannot substantiate.

**Acceptance**
- [ ] The "What is still open" closing section is gone from SurgicalTables and replaced with a next step, keeping both existing CTAs; the sourcing note survives in full as the claims notice at the top of data/orTables.js
- [ ] ComingSoon still accepts `needs` and callers still pass it, but it is no longer rendered as a "Still to come" list
- [ ] Body copy that narrated the editorial process on Technology and Product is replaced with a statement of status; titles read "X is in development" rather than "X isn't specified yet"
- [ ] technology.js heroAlt describes the photograph instead of announcing the backlog; that the artwork is a stand-in remains as a comment beside it
- [ ] The two photo-shoot briefs under the DBS topic and the three under chemistry are removed from data/education.js, with a comment recording what they were and that adding a `src` re-fills the slot with no other change
- [ ] All NOT HERE, deliberately: JSDoc blocks in src/data/*.js are untouched — they never render and are exactly where this reasoning belongs
- [ ] tools/check-copy.mjs exists, reads the RENDERED text of all 17 routes rather than grepping source, and splits its phrase list into CERTAIN, SUSPECT and ALLOW so real site copy such as "in development" and "preclinical research" is not flagged
- [ ] check-copy passes on every route

**Files** — `src/pages/SurgicalTables.jsx`, `src/ui/ComingSoon.jsx`, `src/pages/Technology.jsx`, `src/pages/Product.jsx`, `src/data/technology.js`, `src/data/education.js`, `src/pages/Education.jsx`, `tools/check-copy.mjs`, `docs/shubham/06-copy-policy.md`
**Verify** — npm run build && npx vite preview --port 4319 --strictPort, then node tools/check-copy.mjs

---

### NAV-067 · Unify the site onto one measure, one gutter and one vertical rhythm

`task` · **P1** · owner **engineering** · L · status **done**

Two competing frame widths were in use — max-w-5xl (1024px) and max-w-7xl (1280px) — often on the same page, plus hand-rolled sections at max-w-4xl and max-w-[96rem]. Measured at 1440px, content left edges landed at 73px on 27 sections and 201px on 22: a near-even split between two edges 128px apart, so scrolling one page the left margin stepped in and out. Vertical padding was py-24 md:py-32 lg:py-40 — 160px a side, so two stacked sections produced 320px of empty screen. Both halves of the reported complaint were real geometry, not perception.

**Acceptance**
- [ ] Section declares one measure (max-w-7xl), one gutter (px-6 lg:px-8) and one rhythm (py-16 md:py-20 lg:py-24) and no longer branches on `wide`; `wide` is still accepted so call sites keep working but has no effect
- [ ] Long-form text is constrained by max-w-prose on the text, not by narrowing the frame
- [ ] SceneBand and ScienceBand keep their canvas and gradient full-bleed (absolute inset-0) while their inner grid joins the site frame at max-w-7xl with the site gutter — this was initially left as a deliberate exception and that judgement was wrong, because the product pages are built almost entirely out of these bands
- [ ] Hero keeps pt-36 as fixed-navbar clearance, with bottom padding matching Section so hero-to-section equals section-to-section
- [ ] check-layout reports one CONTENT LEFT EDGE value per width: 24px at 375 and 768, 32px at 1024, 73px at 1440, 185px at 1920
- [ ] 68 of ~70 sections share that edge; the remainder are full-bleed heroes and one centred max-w-prose block, both listed as deliberate exceptions in docs/shubham/03-layout-system.md

**Files** — `src/ui/Section.jsx`, `src/ui/Hero.jsx`, `src/ui/SceneBand.jsx`, `src/ui/ScienceBand.jsx`, `tools/check-layout.mjs`, `docs/shubham/03-layout-system.md`
**Verify** — npx vite preview --port 4319 --strictPort, then node tools/check-layout.mjs http://localhost:4319 — one value per width under CONTENT LEFT EDGE means it aligns

---

### NAV-068 · Company-wide decision on "safe, effective and high-quality" — kept

`decision` · **P2** · owner **navinetics-regulatory** · S · status **done**

"Translating those conversations into safe, effective and high-quality device offerings" has been NaviNetics' wording on navinetics.com since 2021. It was removed during the rebuild on the reasoning that "safe and effective" is the phrase the FDA uses about a device it has authorised, so asserting it about your own products reads as a regulatory claim. Because the same sentence was live on navinetics.com at the time, this could not be settled as a page edit — it had to be a company-wide call. NaviNetics reviewed it and kept the wording: it is their claim, on their products, and the D1 is in fact cleared.

**Acceptance**
- [ ] Decision recorded: the wording stays, and both sites say the same thing.
- [ ] The phrase is restored verbatim on Who We Are, the site meta description, the contact page lead, and the footer.
- [ ] The reasoning and the decision are recorded in a code comment at src/pages/WhoWeAre.jsx so the phrase is not removed again by the next reviewer.
- [ ] The decision is written up in docs/shubham/08-existing-site.md.

**Files** — `src/pages/WhoWeAre.jsx`, `src/pages/Contact.jsx`, `src/components/Footer.jsx`, `docs/shubham/08-existing-site.md`
**Verify** — grep -rn "safe, effective" src returns the restored sites in WhoWeAre.jsx, Contact.jsx and Footer.jsx, with the decision comment present at src/pages/WhoWeAre.jsx

---

### NAV-069 · Give the Technology mega-panel drawn marks instead of duplicated product photography

`task` · **P2** · owner **engineering** · M · status **done**

The Technology dropdown read `hero` from data/technology.js, which is the page's opening image — so it showed the same three pictures as the Products dropdown. The D1 frame photograph appeared in both, and NaviNetics AI, which is software, was illustrated with a mechanical microdrive. The two panels exist to draw a distinction: Products shows the object you buy, Technology shows how it works. Photography was tried twice in the slot and failed both times — at 64x56 CSS px the science figures became a brown blob, a white box with a smudge and a field of noise; cropping helped and was still not good enough.

**Acceptance**
- [ ] src/ui/TechMark.jsx draws a named glyph per technology: 'stereotaxy' (an arc and the point every approach along it reaches), 'neuro' (the triangular FSCV sweep and its response), 'ai' (four planning panes with one target running through them)
- [ ] data/technology.js carries a `mark` field separate from `hero`; `hero` is unchanged and still the page's opening image
- [ ] data/nav.js maps `mark` rather than `image` for technology entries, with a comment recording why
- [ ] Navbar renders TechMark when an item carries `mark` and ProductPlate otherwise, so both panels share one slot
- [ ] No product photograph appears in the Technology panel; opening both dropdowns side by side shows no repeated image
- [ ] tools/crop-icons.mjs is kept for reference so the rejected photographic approach is not re-attempted blind

**Files** — `src/ui/TechMark.jsx`, `src/data/technology.js`, `src/data/nav.js`, `src/components/Navbar.jsx`, `tools/crop-icons.mjs`, `tools/mark-options.mjs`
**Verify** — node tools/shot-menu.mjs (or open the preview server at 1440px) and compare the Products and Technology panels — no image appears in both

---

### NAV-070 · Globe dot batching and graticule precompute: landed, no measured gain, kept anyway

`chore` · **P2** · owner **engineering** · M · status **done**

Two changes were made to the partner globe on the theory that drawing was the bottleneck. drawGlobe was filling 4,846 dots one at a time — a colour string built and re-parsed per dot, then beginPath/arc/fill, roughly 24,000 canvas operations and 4,846 string allocations per frame — and now groups them into one Path2D per quantised colour-and-alpha bucket, fewer than a hundred fills. meridians() was rebuilding the wireframe every frame with about 5,300 trigonometric calls to redraw fixed lines, and is now built once at module load and only rotated and projected per frame. Both are strictly less work for an identical picture. Neither moved the busy ratio: 93.1% before, 93.8% after, inside the ~2% run-to-run spread. They were kept because they are not wrong and because the third change made alongside them is correct behaviour regardless — the loop now stops off screen and in a hidden tab. This ticket exists so the null result stays in the record rather than being quietly absorbed.

**Acceptance**
- [ ] Dot batching is in src/lib/globeScene.js: alpha quantised to 1/16ths, one Path2D per (colour, alpha) bucket, colour string built once per bucket.
- [ ] The graticule is built once at module load (GRATICULE in src/lib/globeScene.js) rather than rebuilt per frame.
- [ ] The PartnerGlobe loop is gated on IntersectionObserver with a 120px rootMargin and on document.hidden, and capped at 30fps — src/ui/PartnerGlobe.jsx lines 233-254. SceneBand and ScienceBand already did this; PartnerGlobe never had.
- [ ] The rendered globe is unchanged: the same dots, the same wireframe, the same colours.
- [ ] docs/shubham/09-performance.md states the null result plainly — 'neither moved the number' — rather than presenting the reduced operation count as an improvement.
- [ ] The arithmetic that redirected the investigation is recorded: ~44 long tasks per 5s at ~107ms each is about 9fps, so the page never reached the 30fps cap and the cap was irrelevant. That is what makes the remaining cost compute-bound somewhere the dot count does not explain.

**Files** — `src/lib/globeScene.js`, `src/ui/PartnerGlobe.jsx`, `docs/shubham/09-performance.md`
**Verify** — npm run check:perf — /company/partners steady state still reports ~93%, which is the honest outcome of this work; the globe compared against the screenshots in tools/.mobile/ shows no visual change.

---

### NAV-071 · Split the bundle and stop the globe drawing off-screen — and record that it did not fix the busy ratio

`task` · **P2** · owner **engineering** · L · status **done**

Two pages peg the main thread at ~93% while the visitor does nothing, which is why the hamburger felt broken: the menu paints in 30-107 ms, but a tap has to wait for a thread that never comes free. Two optimisations were made to the partner globe on the hypothesis that drawing was the bottleneck. Both are strictly less work for an identical picture, and NEITHER moved the busy ratio. That is recorded here on purpose — the next person should not repeat them believing they help.

**Acceptance**
- [ ] drawGlobe groups its 4,846 dots into one Path2D per quantised colour bucket — fewer than a hundred fills instead of ~24,000 canvas operations and 4,846 per-dot colour-string allocations per frame
- [ ] The graticule is built once at module load instead of rebuilding ~1,300 points and ~5,300 trigonometric calls every frame
- [ ] The globe loop stops when off-screen (IntersectionObserver) and when the tab is hidden, and is capped at 30 fps — kept regardless of measured effect, because it is correct behaviour that SceneBand and ScienceBand already had and PartnerGlobe never did
- [ ] Route-level code splitting: Partners, Product, Technology, D1, MAVEN, Neuromodulation, SurgicalTables, NaviNetics AI and Education are lazy, each with a fallback matching its own page ground so the split cannot flash a pale panel over a dark hero
- [ ] Entry chunk is 520.9 kB / 169.4 kB gzip, down from 552 kB / 176 kB; worldDots' 4,846 entries are no longer parsed by every visitor to every page
- [ ] docs/shubham/09-performance.md records the measured outcome honestly: /company/partners 93.1% -> 93.8% and /products/maven-neuromodulation 93.9% -> 91.9% steady-state busy, i.e. within the ~2% run-to-run spread — unfixed
- [ ] The same doc records the three ways the measurement itself was wrong first (observer installed per route so long tasks were counted six times over; leaked browsers poisoning later runs; single runs reported as fact when the spread was three times the effect)

**Files** — `src/lib/globeScene.js`, `src/ui/PartnerGlobe.jsx`, `src/components/AnimatedRoutes.jsx`, `tools/check-perf.mjs`, `docs/shubham/09-performance.md`
**Verify** — Stop any dev server (measurements taken alongside one are contended), then npm run build && npx vite preview --port 4319 --strictPort && npm run check:perf; read the median-of-3 busy% with spread

---

### NAV-072 · Record the makeAnchor scene rebuild as tried, rejected and reverted

`decision` · **P3** · owner **engineering** · S · status **done**

A walkthrough reported that some animations are "just boxes and circles and not clinically accurate". That is accurate — there are two clear tiers, with EduFigures and the localiser figure built from real geometry and the product-page band scenes built as visual texture. A rebuild of d1Scenes.makeAnchor into an anatomically-scaled sagittal head was built as a worked example, reviewed, and rejected: "bad, keep the original animations". It was reverted in full.

**Acceptance**
- [ ] src/lib/d1Scenes.js is back to its original state and every scene on the site is the original
- [ ] docs/shubham/07-scene-accuracy.md keeps the tier inventory, keeps the rebuild description as a record of what was tried and turned down, and states plainly that it must not be re-applied without a fresh decision
- [ ] The doc records why: the abstract register is a deliberate house style, stated in d1Scenes.js's own header ("Nothing here is a measurement, a trajectory or a coordinate; they are drawings of an argument") — the rebuild worked against intent that was already in the code
- [ ] The four proposed follow-ups (makeBeam Beer-Lambert attenuation, makeSweep electrode and diffusion layer, makeStim artifact window, the remaining D1 bands) are listed as declined-in-first-form, each needing a domain call that should not be made alone
- [ ] tools/shot.mjs is kept — it takes one screenshot of one route at a size and scroll position, which is how the three rejected head geometries were judged

**Files** — `src/lib/d1Scenes.js`, `docs/shubham/07-scene-accuracy.md`, `tools/shot.mjs`
**Verify** — git diff e20b6ef..HEAD -- src/lib/d1Scenes.js is empty, confirming the revert; docs/shubham/07-scene-accuracy.md carries the record


