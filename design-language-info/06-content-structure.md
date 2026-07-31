# 06 — Content Structure

What the existing content actually is, and the templates that fall out of it.

---

## Content audit

Sixteen routes, seven genuinely distinct content types:

| Type | Routes | Shape |
|---|---|---|
| **Product** | Frame System, Neuromodulation | Hero, narrative sequence, specs, components, gallery |
| **Long-form technical** | Education | 400-word blocks of electrochemistry + figures |
| **Indexed records** | Publications | A growing list needing search and filter |
| **People** | Founders | Long biographies with portraits |
| **Statement + CTA** | Careers, Community, Who We Are | Short copy, one action |
| **Interactive** | Contact | Form |
| **Platform** | Technology × 3 | Principles, applied-in, hand-offs |
| **Gallery** | Media | Filterable image and video library |

The original build treated every route as a bespoke page. Five templates cover them.

---

## Product template

**Driven entirely by `src/data/products.js`.** Adding a record produces a card, a detail page, a nav
entry and a comparison column.

```
Hero            dark showcase band · Lens glass · eyebrow / display / lead / metric row
Narrative       scroll-pinned sequence (max 3 steps) OR stacked sections under reduced motion
Specification   SpecTable — tabular figures, mono values, graduated header
Highlights      numbered grid — numbering justified: it's an enumerated feature set
Components      ComponentList — the bill of materials
Gallery         main view + thumbnails
Cross-sell      the other products as ProductCards
```

**Why the numbering is allowed here:** the highlights grid on Frame System is an enumerated set the
reader is meant to traverse completely. Compare the bento cards on the home page, which are not
sequential and therefore carry no numbers.

**The scroll sequence stays.** It is the strongest moment on the site. It gains a cap, keyboard
controls, a progress indicator, and full degradation. See [05-motion.md](05-motion.md).

---

## Long-form technical template

Education runs to five sections of dense material — FSCV waveforms, MCSWV, arc-centred geometry.
A surgeon skims it; a researcher reads all of it. Both from one page.

```
Hero
Section index    sticky, tracks scroll position
Per section:
  media          alternating side, on a product plate
  prose          max-w-prose, opaque surface, never glass
  detail         Accordion — the paragraph that only researchers want
  lists          treated/researched indications as two-column lists
```

Progressive disclosure is the whole point: the accordion is where `subcontent` goes, so the primary
read stays scannable.

---

## Indexed records template

Publications currently renders eleven entries as a flat list, with copy admitting there are "100+
more". A flat list does not survive that.

```
Hero
Controls     search input · year filter · journal filter · result count
List         PublicationCard[] — year badge, journal, title, authors, DOI link
Empty state  "No publications match — clear filters"
Pagination   or incremental reveal past ~30
```

Records live in `src/data/publications.js`. Filters derive their options from the data, so adding a
record with a new journal adds the filter option automatically.

---

## People template

Founders. Long biographies — five paragraphs for Dr. Lee. Portrait, name, role, then prose at
reading measure. Alternating sides for rhythm.

No glass, no reticle on the portraits. These are people, not targets.

---

## Statement + CTA template

Careers, Community, Who We Are. Short copy and one action.

The original built these as centred cards with decorative blurred blobs, each in a different colour —
Careers in slate, the since-removed Investment page in **emerald**, Community's card in emerald,
Who We Are mixing blue and emerald. All of it becomes one `Statement` component using `action`.

**Careers is built to grow.** It renders a `JobList` when `src/data/jobs.js` is non-empty and falls
back to the general enquiry statement when it isn't. No rework needed when the first opening posts.

---

## Navigation

The current dropdown is a 64px-wide text list. With a growing catalogue that stops working.

**"What We Do" becomes a mega-panel** — a Tier-3 frosted glass panel with a thumbnail and one-line
descriptor per product, generated from `products.js`. It is the natural home for products four, five
and six.

Other items keep simple dropdowns. The bar contracts into a floating pill on scroll — chrome that
signals the page has moved without stealing height from it.

---

## Information architecture

Restructured into four top-level groups. Products is what you can buy; Technology
is how it works. They cross-reference rather than duplicate — Technology pages stay
at platform level and hand off to Education for the science and Publications for
the evidence.

```
/                                        Home

Company
/company/who-we-are                      About
/company/our-founders                    Founders
/company/partners                        Partners            (placeholder)
/company/community                       Community

Products — the devices
/products/d1-stereotactic-frame          D1 Stereotactic Frame
/products/carbon-fiber-surgical-tables   Carbon Fiber Tables (placeholder)
/products/maven-neuromodulation          Maven Neuromodulation

Technology — the science
/technology/stereotactic-devices         Stereotaxy
/technology/neuromodulation              Neuromodulation
/technology/navinetics-ai                NaviNetics AI       (placeholder)

Resources
/resources/media                         Media gallery
/resources/careers                       Careers
/resources/education                     Education
/resources/publications                  Publications

/contact                                 Contact
```

`src/data/nav.js` is the single source of truth: the navbar, the footer and the
route table all read it, so adding a page puts it in all three. Product and
technology entries derive from their own data files, so a new product needs no
nav edit at all.

### Redirects

The IA changed, so every previously published URL is redirected rather than left
to 404. Declared in `redirects` in `src/data/nav.js` and registered ahead of the
catch-all route:

| Old | New |
|---|---|
| `/who-we-are` | `/company/who-we-are` |
| `/who-we-are/our-founders` | `/company/our-founders` |
| `/who-we-are/community` | `/company/community` |
| `/what-we-do/navinetics-frame-system` | `/products/d1-stereotactic-frame` |
| `/what-we-do/neuromodulation` | `/products/maven-neuromodulation` |
| `/careers` | `/resources/careers` |
| `/investment-opportunities` | `/contact` |

### Placeholders

Three pages exist without content: Partners, Carbon Fiber Surgical Tables, and
NaviNetics AI. They render `<ComingSoon>`, which states plainly that the page is
incomplete and lists what is outstanding.

This is deliberate. The alternative — filling a spec table with plausible numbers
— is the exact failure mode to avoid on a medical device site, where dimensions,
load ratings and performance figures are regulated claims. An honest placeholder
is safer than an invented specification, and the outstanding list means it cannot
be quietly forgotten.

Partners is empty for a different reason: "we came out of Mayo Clinic" and "Mayo
Clinic is a named partner" are different claims, and the second needs both
confirmation and permission to use another organisation's name and marks.

## Per-route metadata

No route set its own title or description; every page shared one generic tag. `src/lib/meta.js`
provides `usePageMeta({ title, description })`, called by each page. Titles follow
`<Page> — NaviNetics`.

---

## Images

**The `mix-blend-multiply` problem.** Every product image uses it. It only works over white; on the
dark theme those shots become black mush.

The correct fix is transparent-background cutouts, which don't exist yet. The interim treatment is a
**product plate** — a light, subtly tinted surface that stays light in both themes and carries the
image. The plate is a deliberate design element (it reads as a lightbox or specimen tray), not an
apology, but it should be replaced with real cutouts when they're available.

`ProductPlate` is the component. It is the only place `mix-blend-multiply` may appear.
