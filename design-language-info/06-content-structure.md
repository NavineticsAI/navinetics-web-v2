# 06 — Content Structure

What the existing content actually is, and the templates that fall out of it.

---

## Content audit

Eleven routes, five genuinely distinct content types:

| Type | Routes | Shape |
|---|---|---|
| **Product** | Frame System, Neuromodulation | Hero, narrative sequence, specs, components, gallery |
| **Long-form technical** | Education | 400-word blocks of electrochemistry + figures |
| **Indexed records** | Publications | A growing list needing search and filter |
| **People** | Founders | Long biographies with portraits |
| **Statement + CTA** | Careers, Investment, Community, Who We Are | Short copy, one action |
| **Interactive** | Contact | Form |

The original build treated all eleven as bespoke pages. Five templates cover them.

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

Careers, Investment, Community, Who We Are. Short copy and one action.

The original built these as centred cards with decorative blurred blobs, each in a different colour —
Careers in slate, Investment in **emerald**, Community's card in emerald, Who We Are mixing blue and
emerald. All of it becomes one `Statement` component using `action`.

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

Unchanged. The existing structure is sound and the URLs should not break.

```
/                                   Home
/who-we-are                         About
/who-we-are/our-founders            Founders
/who-we-are/community               Community
/what-we-do/navinetics-frame-system Product · Frame System
/what-we-do/neuromodulation         Product · Neuromodulation
/resources/education                Education
/resources/publications             Publications
/careers                            Careers
/investment-opportunities           Investment
/contact                            Contact
```

New products slot in under `/what-we-do/:slug` automatically.

---

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
