# 04 — Components

API reference for `src/ui/`. Import everything from the barrel:

```js
import { Button, Section, ProductCard } from '../ui/index.js';
```

---

## Layout

### `<Section>`

Page section with the standard vertical rhythm (`py-24 → py-32 → py-40`).

| Prop | Type | Default | Notes |
|---|---|---|---|
| `band` | bool | `false` | Recesses onto `sunk` |
| `dark` | bool | `false` | Dark showcase band (`nn-950`) |
| `wide` | bool | `false` | `max-w-7xl` instead of `max-w-5xl` |
| `as` | string | `'section'` | |
| `innerClassName` | string | | Applied to the inner container |

Extra props spread onto the element, so `id` works for anchor targets.

### `<SectionHead>`

Rule, eyebrow, heading, lead — the standard section opener. Reveals on scroll.

```jsx
<SectionHead eyebrow="Specification" title="Numbers, set like instruments." lead="…" />
```

`align="center"` drops the tick rule and centres.

### `<Reveal>`

Scroll-reveal wrapper. Use this rather than hand-writing motion props — that is how the previous
build ended up with six different reveal timings.

| Prop | Default | Notes |
|---|---|---|
| `variant` | `fadeUp` | Falls back to `fadeIn` under reduced motion |
| `delay` | `0` | Seconds |
| `as` | `'div'` | Any `motion.*` tag |

### `<Eyebrow>` · `<TickLine>`

Mono uppercase label; tick-marked hairline.

---

## Actions

### `<Button>`

Renders `<Link>`, `<a>` or `<button>` depending on `to` / `href` / neither. External `href`s
automatically get `target="_blank" rel="noreferrer"`.

| Prop | Values | Default |
|---|---|---|
| `variant` | `primary` `secondary` `glass` `ghost` | `primary` |
| `size` | `sm` `md` `lg` | `md` |
| `arrow` | bool | `false` |

**One primary action per viewport.** Everything else steps down.

### `<LinkAction>`

Inline text action with an underline that draws on hover. Do not nest inside another link — if the
whole card is already a link, write the markup inline instead.

---

## Glass

### `<Glass>` — frosted

Heavy blur, opaque-ish tint, no displacement. For text sitting **on** glass.

| Prop | Values | Blur |
|---|---|---|
| `tier` | `chrome` | 14px — navbars, pills, toolbars |
| | `surface` | 26px — cards over imagery, pinned captions |
| | `modal` | 40px — dialogs, mega-panels, lightboxes |

### `<Lens>` — refracting

Lightly blurred, barely tinted, physically displaces the backdrop. For looking **through** glass.

| Prop | Default | Notes |
|---|---|---|
| `bevel` | `26` | px width of the refracting band |
| `edge` | `130` | displacement strength at the bevel |
| `pointer` | `60` | strength of the cursor-following lens |
| `chroma` | `5` | chromatic aberration; `0` disables the extra passes |
| `blur` | `5` | **above ~7 the refraction stops being visible** |

**Budget: three on screen maximum, never on the sticky navbar.** Chromium-only; degrades to frosted
glass plus a bevel ring elsewhere. See [02-liquid-glass.md](02-liquid-glass.md).

---

## Reticle

### `<Reticle>`

Corner marks framing a targeted subject. **One per viewport.** Never on interactive controls, never
nested, never on portraits of people.

### `<Rule>` · `<IsoMark>`

Graduated measurement edge; concentric iso-center watermark (keep between 15% and 25% opacity).

---

## Content

### `<Card>`

Base surface card. `lift` adds hover elevation.

### `<ProductPlate>`

**Interim treatment.** Product shots still rely on `mix-blend-multiply`, which only works over a
light ground — on the dark theme they would become black mush. The plate stays light in both themes.
**This is the only place `mix-blend-multiply` is permitted.** Replace with transparent cutouts.

| Prop | Default |
|---|---|
| `src` `alt` | |
| `fit` | `'contain'` — or `'cover'` |
| `imgClassName` | |

### `<ProductCard>`

Catalogue card. Takes a whole record from `data/products.js`.

### `<StatTile>` · `<MetricRow>`

Metric tiles and inline metric rows. `MetricRow` takes `tone="dark"` on showcase bands.

### `<Badge>`

| `tone` | Use |
|---|---|
| `action` | Category, default |
| `line` | Neutral outline |
| `ok` `warn` `crit` | Status — deliberately outside the blue family |

### `<Statement>` · `<PullQuote>`

Short copy plus one action; and a framed quote for long-form pages.

---

## Data

### `<SpecTable rows={[{k, v}]}>`

Tabular figures, mono values, graduated header rule.

### `<ComparisonTable columns rows highlight>`

⚠️ Comparative claims about competing devices are **regulated**. Gated behind
`comparison.published` in `data/products.js`.

### `<ComponentList items={[…]}>`

Numbered bill of materials. Numbering is meaningful here — it is an enumerated set.

---

## Disclosure

### `<Tabs items={[{id, label, content}]}>`

WAI-ARIA tabs pattern: `role="tablist"`, roving `tabIndex`, `←`/`→` navigation.

### `<Accordion items={[{id, label, body, index?}]}>`

Height animates via `grid-template-rows: 0fr → 1fr` — no content measurement, cheaper than
`max-height`.

---

## Forms

### `<Field>`

| Prop | Notes |
|---|---|
| `as` | `'input'` (default) · `'textarea'` · `'select'` |
| `label` | Required — a real `<label>`, never placeholder-as-label |
| `error` | Sets `aria-invalid` + `aria-describedby` |
| `hint` `success` | |

**Error copy rule:** say what to **do**. "Add the part after the @ — for example hospital.org"
beats "Invalid email".

### `<Switch checked onChange label>`

Real `role="switch"` with `aria-checked`.

---

## Composites

### `<Hero>`

| Prop | Notes |
|---|---|
| `size` | `md` (default) · `lg` for landing heroes |
| `tone` | `light` (default) · `dark` showcase |
| `targeting` | Live cursor-tracked reticle + coordinate readout |
| `isoMark` | Background watermark, default `true` |

The one orchestrated entrance on the site: eyebrow → headline → lead → actions, staggered 90ms.

### `<ScrollSequence steps image imageAlt>`

Scroll-pinned narrative, **capped at 3 steps**. Includes a progress indicator and degrades to
stacked sections under reduced motion.

### `<Gallery items={[{src, caption, fit}]}>`

Main view plus keyboard-navigable thumbnails.

### `<ThemeToggle>`

Two real buttons with `aria-pressed`.

---

## Conventions

1. **Semantic tokens only.** Never a raw hex, never `blue-600`. Missing colour → missing token.
2. **`cn()` for all class merging** so callers can override with `className`.
3. **Extra props spread** onto the root element.
4. **No `outline: none`** without a replacement focus style.
5. **Motion via `src/lib/motion.js`**, never inline ad-hoc durations.
