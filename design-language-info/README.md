# NaviNetics Design Language — v1

The design system for navinetics.com. Two materials in tension: the **machined geometry** of a
stereotactic frame, and the **optical depth** of liquid glass. Titanium and glass.

Every ornament in this system is borrowed from NaviNetics' own instruments — reticle corner marks,
graduated tick rules, iso-center crosshairs, coordinate readouts — rather than invented. That is
what makes it unusable by anyone else.

---

## Documents

| | |
|---|---|
| [01-foundations.md](01-foundations.md) | Colour, type, space, radius, elevation. The token contract. |
| [02-liquid-glass.md](02-liquid-glass.md) | The two glass materials, the refraction engine, and the measurements behind them. |
| [03-reticle-system.md](03-reticle-system.md) | The signature motif and its restraint rules. |
| [04-components.md](04-components.md) | API reference for everything in `src/ui/`. |
| [05-motion.md](05-motion.md) | Easing curves, durations, and the reduced-motion contract. |
| [06-content-structure.md](06-content-structure.md) | Content analysis and the page templates it produced. |
| [07-accessibility.md](07-accessibility.md) | Contrast ledger, keyboard, motion, and known gaps. |
| [08-decisions.md](08-decisions.md) | Why each major call was made, including the ones that were reversed. |

**[design-language.html](design-language.html)** — the interactive reference. Open it in a browser.
Every component is live: toggle the theme, hover the glass, drag the lens panels across body text,
tune the refraction with the sliders. This is the approved artefact the code implements.

---

## The short version

**Colour.** A structural navy-teal ramp sampled directly from the logo mark, and a *signal* ramp at
hue 205° — a matured steel-blue, deliberately held back from cyan. Neutrals carry a teal bias so they
read as chosen rather than inherited. Semantic colours (ok / warn / crit) sit outside the blue family
so status never reads as brand emphasis or as a link.

**Type.** Instrument Sans carries display *and* body, separated by scale and tracking rather than by
swapping families. IBM Plex Mono is reserved strictly for things that are **measured** — coordinates,
model numbers, token names, eyebrows. That rule is what makes the mono read as instrumentation
instead of decoration. Both self-hosted; no CDN.

**Materials.** Frosted glass for things you read *off* (chrome, modals). Lens glass — lightly blurred,
barely tinted, hard-refracting — for things you look *through*. These are physically incompatible and
must not be merged; see [02-liquid-glass.md](02-liquid-glass.md).

**Theme.** Full dual theme. Every semantic token has a light and a dark value, resolved by a
`data-theme` attribute set before first paint. Components never reference a raw hex.

**Light is the default**, for everyone. The OS `prefers-color-scheme` setting is deliberately not
consulted — dark is opt-in through the toggle and remembered in `localStorage`. There is no
`@media (prefers-color-scheme: dark)` fallback in the CSS, on purpose; see
[08-decisions.md](08-decisions.md#light-is-the-default-not-the-os-preference).

---

## Rules that are not negotiable

1. **One primary action per viewport.** Everything else steps down to secondary, glass, or ghost.
2. **Components read semantic tokens only.** Never `#1F6890`, never `blue-600`. If a component needs
   a colour that doesn't exist as a token, the token is missing — add it.
3. **No glass behind long-form reading.** Translucency under body copy is a legibility problem, not a
   style choice. If it's read for more than ten seconds, it sits on a solid surface.
4. **Refraction has a budget.** Three refracting panels on screen, maximum. Never on the navbar.
5. **`prefers-reduced-motion` is honoured everywhere.** The audience includes people with Parkinson's,
   essential tremor and dystonia. This is not a nice-to-have.
6. **Every interactive element has a visible focus state.** No exceptions, no `outline: none`.

---

## Where things live

```
src/
  index.css            token layer, both themes, @font-face, base
  lib/
    cn.js              clsx + tailwind-merge
    theme.jsx          ThemeProvider, useTheme, pre-paint resolution
    motion.js          shared variants + reduced-motion guard
    lens.js            the refraction engine
    meta.js            per-route document title + description
  data/
    products.js        product records → cards, pages, nav, comparison
    publications.js    publication records → searchable index
  ui/                  the component library (see 04-components.md)
public/fonts/          self-hosted Instrument Sans + IBM Plex Mono
```

---

## Adding a product

Add one record to `src/data/products.js`. You get a catalogue card, a detail page, a nav entry in the
"What We Do" mega-panel, and a column in the comparison grid — no new components, no new routes.
See [06-content-structure.md](06-content-structure.md#product-template).

---

## A standing caution on claims

Spec tables, comparison grids and metric tiles render whatever data they are given. Numeric
performance claims (accuracy, setup time) and any comparative statement about competing devices are
**regulated marketing claims**. Placeholder values in this repo are paraphrased from the existing
public site and marked in `products.js`. Anything new needs to come from NaviNetics and clear
regulatory review before it ships.
