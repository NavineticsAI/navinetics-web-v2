# The layout system

**Status:** unified 2026-08-11. Measured before and after with
`tools/check-layout.mjs`.

## The complaint that started it

> "there is too much random white space gaps left vertically in some pages more
> than needed for spacious aesthetic. also left and right alignment of the
> content of all the pages feels like there is no unified spacing and margin and
> layout and sizing engine"

Both halves were correct, and both were measurable.

## What was wrong

### Two competing measures

`Section` offered two frame widths: `max-w-5xl` (1024px) by default and
`max-w-7xl` (1280px) behind a `wide` prop. Pages used both, often on the same
page, and several pages hand-rolled their own `<section>` with a third or fourth
width — `max-w-4xl`, `max-w-[96rem]`.

Measured at a 1440px viewport, content left edges landed at:

```
73px  × 27 sections     ← max-w-7xl, centred
201px × 22 sections     ← max-w-5xl, centred
32px  × 18 sections     ← full-bleed scene bands
```

A near-even split between two edges 128px apart. Scrolling one page, the left
margin stepped in and out repeatedly. That is the "no unified engine" feeling —
it is real geometry, not perception.

Below 1024px everything already agreed (24px, then 32px), which is why the
problem only showed on desktop.

### Gutters that dropped the `lg` step

`Section` is `px-6 lg:px-8`. Every hand-rolled section wrote `px-6` alone, so
above 1024px its content sat 8px left of everything else.

### Vertical padding that doubled

`Section` was `py-24 md:py-32 lg:py-40` — **160px top and bottom** at desktop.
Sections stack, so two adjacent ones produced **320px of empty space**: about a
third of a laptop screen with nothing in it. That is the "random white space".

It was also inconsistent. Eight distinct top-padding values at 1440px:

```
160px × 31   Section at lg:py-40 — the intended standard
144px × 12   hand-rolled pt-36 page headers
128px × 12   hand-rolled py-32, missing the lg: step
  0px × 10   full-bleed
112 / 64 / 56 / 48   one-off each
```

## What it is now

### One measure

**`max-w-7xl` (1280px), everywhere.** `Section` no longer branches. Long-form
text stays readable through `max-w-prose` **on the text**, which is the correct
place for it — the frame should not narrow because a paragraph is inside it.

`wide` is still accepted as a prop so existing call sites keep working, but it
does nothing. Drop it from call sites as they are touched.

### One gutter

`px-6 lg:px-8` — 24px, stepping to 32px at 1024px. Declared once in `Section`;
hand-rolled sections now use the identical string.

### One rhythm

`py-16 md:py-20 lg:py-24` — 64 / 80 / **96px** a side.

Because sections stack, the gap between two of them is twice the padding:
**192px** at desktop, down from 320px. Still spacious; 40% less dead space.

`Hero` keeps `pt-36` (144px) — that is **nav clearance**, not rhythm. The navbar
is fixed and the heading has to clear it. Its bottom padding was changed to
match `Section` so hero→section is the same 192px as section→section.

## After

```
CONTENT LEFT EDGE at 1440px
  73px × 67     the unified frame
   0px × 1      full-bleed hero
 170px × 1      a centred max-w-prose block, not a container

SECTION TOP PADDING at 1440px
  96px × 44     the standard
 144px × 12     hero nav clearance (deliberate)
   0px × 10     full-bleed (deliberate)
  56 / 48 / 64  one-off each, on hand-built page headers
```

The 201px edge is gone entirely. 49 of 68 sections now share one edge, and the
rest are deliberate full-bleed treatments.

## The scene bands — full-bleed ground, framed content

This was initially left as a "deliberate exception" and that judgement was
**wrong**. `SceneBand` and `ScienceBand` used `max-w-[96rem]` with asymmetric
`lg:pl-8 lg:pr-5`, giving a 32px content edge against the site's 73px.

Product pages (D1, MAVEN, surgical tables) are built almost entirely out of
these bands, so the exception was not an accent — it *was* the product pages.
Reported from a walkthrough as "on product pages the margins on left and right
are different, the content seems aligned to the extreme left and right as we
scroll down", which is exactly right.

The fix separates the two things the band was conflating:

- **The ground stays full-bleed.** The `<canvas>` and the gradient are
  `absolute inset-0` and unchanged — the dark bay still runs edge to edge.
- **The content joins the frame.** The inner grid is now `max-w-7xl` with the
  site gutter (`px-6 lg:px-8`), so band copy lines up with section copy.

Column ratios were nudged (`28%` → `30%`, middle `minmax(190px,…)` →
`minmax(150px,…)`) to keep the middle window — the gap the animation reads
through — proportional inside the narrower frame.

Result: the 32px edge disappeared entirely and 67 of 69 sections now share one
edge, up from 27.

## Deliberate exceptions — do not "fix" these

- **`Hero` `pt-36`** is fixed-navbar clearance.
- **`Navbar`** animates `max-w-7xl` → `max-w-5xl` on scroll. That is the
  floating pill shrinking, and it is meant to.
- **Centred `max-w-prose` blocks** measure ~1086px (65ch) and sit at a 170px
  edge. A centred paragraph is a typographic choice inside the frame, not the
  frame. `check-layout.mjs` originally reported these as misalignments; the
  probe was corrected to take the widest capped element, not the first.

## Files that define the system

| File | Role |
|---|---|
| `src/ui/Section.jsx` | The single declaration of measure, gutter and rhythm |
| `src/ui/Hero.jsx` | Page opener; nav clearance + the same measure |
| `src/ui/SceneBand.jsx`, `ScienceBand.jsx` | Full-bleed exceptions |
| `tools/check-layout.mjs` | Measures all of it, five widths, sixteen routes |

## How to check it

```bash
npm run dev                                   # or npx vite preview --port 4319
node tools/check-layout.mjs http://localhost:5173
```

One value under "CONTENT LEFT EDGE" per width means the site aligns. More than
one means either a new hand-rolled section, or a new deliberate exception that
belongs in the list above.

## Still open

- Intra-section spacing still uses an ad-hoc `mt-*` ladder — 15 distinct values
  across the pages (`mt-1` through `mt-28`) with no scale behind it. Worth
  reducing to four or five steps, but it is cosmetic and lower risk than the
  frame, so it was left.
- Three page headers still carry one-off top padding (48 / 56 / 64px) rather
  than a scale value: Partners, Education, Publications.
