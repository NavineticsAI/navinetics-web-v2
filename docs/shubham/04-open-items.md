# Open items

Split by who can close them. Nothing in section A can be written by a developer
— inventing a regulatory status, a certification or a performance figure for a
medical device is worse than leaving the gap.

---

## A · Only NaviNetics can decide these

### A1 · Patient imaging on the Education page — treat as urgent

`src/data/education.js` ships two CT studies from DBS cases, one of them a
volume render **including facial bone**. The repository's own comments flag the
de-identification review as outstanding. A full-face reconstruction sits
directly against the HIPAA identifier for "full-face photographic images and any
comparable images".

**Decision needed:** confirm provenance, de-identification and consent/IRB
basis, or replace with phantom/cadaver acquisitions. If cleared, record the
basis in `education.js` beside the import so nobody has to re-litigate it.

**Not actioned** — removing published content is the company's call, not a
developer's.

### A2 · Regulatory status is stated nowhere

No FDA, CE, UKCA, TGA or NMPA status appears for any product, on any page. For a
company selling surgical instruments through distributors into multiple markets
(see `data/partners.js`), that is the first thing a value-analysis committee
looks for.

**Decision needed:** the actual status of each product per market, and where on
each page it belongs.

### A3 · Missing device-specific content

| Missing | Product | Why it matters |
|---|---|---|
| Intended use / indications | D1 | Standard for a Class II surgical instrument |
| Rx-only statement | D1 | |
| MR safety information | D1 | The page advertises an MR localiser and says nothing about MR conditionality |
| Sterilisation / reprocessing | D1 | Stated to be reusable, with no reprocessing information |
| Research Use Only / not-for-human-use | MAVEN | Presented with DBS and stereotactic-placement copy |
| Compatibility | all | DBS lead systems, imaging equipment, head coils |
| Service, warranty, training | all | |

### A4 · Legal pages — none exist

No privacy policy, terms of use, cookie notice, accessibility statement, or
legal-entity imprint anywhere on the site. With EU/UK/Asia distributors, EU
visitors are a certainty.

The contact form now carries an inline plain-language data notice, which is a
floor, not a policy.

### A5 · Mayo Clinic attribution

Mayo Clinic is named as the origin of the products across the Company section,
the home page and the site meta description, with no endorsement disclaimer.
Institutions generally require specific language.

**Decision needed:** what the affiliation agreement requires.

### A6 · Third-party marks

Five partner logos are rendered on `/company/partners`. `src/assets/partners/README.md`
records no permission trail. Journal figures used on three pages carry a similar
open question in the codebase.

### A7 · A claims-review owner

Six unsubstantiated claims reached production, and at least one — the 0.6 mm
benchmark — was recorded in the code as held back pending sign-off and shipped
anyway. That is a process gap, not an editing mistake.

---

## B · Developer work, not yet done

### B1 · Accessibility — the two real blockers

- **Mega-menu is largely keyboard-unreachable.** `src/components/Navbar.jsx`.
  Company, Products and Technology sub-links cannot be reached by keyboard;
  panels render after the whole nav bar in DOM order.
- **Media lightbox** claims `aria-modal` with no Escape handler, no focus move,
  no focus trap and no focus return.

Hospitals procure against Section 508 / EN 301 549. These are procurement
blockers, not polish.

Also outstanding: route changes are silent to screen readers (no live region, no
focus move); focusable buttons nested inside `aria-hidden` SVGs in
`EduFigures.jsx`; locator-map markers are `role="button"` with no key handler.

### B2 · Performance

- Eager entry chunk is **552 kB raw / 176 kB gzip** and trips Vite's warning.
- The partner globe's 4,846-dot dataset is bundled into that chunk and decoded
  at module scope.
- Two Education figures run `requestAnimationFrame` loops that never stop,
  including while scrolled off screen.
- ~2 MB of raw PNG/JPG in the Media grid; several `public/` files over 200 kB
  ship uncompressed.

### B3 · Prerendering

The single highest-leverage SEO item left. The site is client-rendered, so a
crawler that does not execute JS sees one page. OG tags and the sitemap are the
floor; `vite-plugin-ssg` or equivalent is the fix.

### B4 · Commercial content

- **`Product.jsx` is unreachable.** All three product slugs have dedicated
  static routes declared above `/products/:slug`, so the template — and the only
  spec-table renderer — never runs. The D1 and MAVEN spec data exists in the
  data files and renders nowhere.
- **The D1 page has no spec table at all** — no dimensions, weight, materials,
  travel ranges.
- **No request-a-quote, demo booking or document download** anywhere on the
  site. Seven pages still end with no call to action.
- **Partners** names five territories with no way to contact any of them and no
  way to become one.

### B5 · Mobile, deliberately deferred

Both are design calls rather than defects:

- Theme-toggle and menu buttons are 36×36, under the 44px target.
- The NaviNetics AI planning demo hides its controls below 1024px, leaving
  view-only canvases.

### B6 · Layout tail

- Intra-section spacing uses 15 distinct `mt-*` values with no scale.
- Three page headers carry one-off top padding (Partners, Education,
  Publications).

### B7 · No resize coverage

Every check loads fresh at a fixed viewport. Nothing exercises a viewport that
changes, so a component that measures once at mount would not be caught.

---

## C · Decisions already taken

| Question | Answer | When |
|---|---|---|
| Horizontal measure | One frame at `max-w-7xl` (1280px) everywhere | 2026-08-11 |
| Vertical rhythm | 96px a side → 192px between sections | 2026-08-11 |
| Pull strategy | Fast-forward `main`; `pr-2` was already merged | 2026-08-11 |
| Unsubstantiated claims | Remove, do not soften | 2026-08-11 |
