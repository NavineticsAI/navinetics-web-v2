# 05 — Motion

The direction is cinematic, so motion carries real weight. But four curves and five durations, not
per-component guesswork.

---

## Curves

| Token | Value | Use |
|---|---|---|
| `ease-out` | `cubic-bezier(.16, 1, .3, 1)` | Reveals, cards, entrances. The default. |
| `ease-inout` | `cubic-bezier(.65, 0, .35, 1)` | Position changes, pinned scroll sequences |
| `ease-spring` | `cubic-bezier(.34, 1.4, .64, 1)` | Toggles, switches, press release |
| `linear` | `linear` | Progress indicators only — never UI |

`ease-out` is the workhorse: a fast start that settles slowly reads as confident and expensive.
Anything that overshoots (`ease-spring`) must be a control the user just acted on, otherwise it reads
as jitter.

---

## Durations

| Token | Value | Applied to |
|---|---|---|
| `d-1` | 120ms | Hover colour, link underline start |
| `d-2` | 220ms | Buttons, inputs, tabs, toggles |
| `d-3` | 420ms | Cards, accordions, glass sheen, theme swap |
| `d-4` | 720ms | Image scale, gallery change |
| `d-cine` | 1100ms | Hero entrance, scroll-pinned reveals |

---

## Non-negotiables

### 1. Reduced motion is honoured

Not one animation in the original codebase checked `prefers-reduced-motion`. For a site whose
audience includes people with Parkinson's disease, essential tremor and dystonia — the exact
conditions this company treats — that is the wrong default.

Two layers of enforcement:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

and in JS, `src/lib/motion.js` exports `usePrefersReducedMotion()`. Framer Motion variants degrade to
opacity-only, and scroll-pinned sequences degrade to plain stacked sections. Nothing is lost but the
movement.

### 2. Scroll-pinning has an escape

The 300vh pinned sequence on the Frame System page is the strongest moment on the site and is kept.
It gets:

- a **capped** total length (never more than 3 steps / 300vh)
- **keyboard navigation** between steps
- a **visible progress indicator** so nobody feels trapped
- full degradation to stacked sections under reduced motion

### 3. Transform and opacity only

Animating `width`, `height`, `top` or `left` forces layout on every frame. `backdrop-filter` is
expensive too — glass panels animate opacity and transform, **never their blur radius**.

The one sanctioned exception is `grid-template-rows: 0fr → 1fr` for accordion height, which is
cheaper and smoother than animating `max-height` and doesn't require measuring content.

### 4. Entrances fire once

`viewport={{ once: true }}` on every scroll reveal. Content that re-animates each time it scrolls
back into view is exhausting on a long page.

---

## Shared variants

`src/lib/motion.js`

```js
fadeUp      // opacity 0 → 1, y 24 → 0, d-3, ease-out
fadeIn      // opacity only — also the reduced-motion fallback for everything
scaleIn     // opacity + scale .96 → 1, for media
stagger(n)  // container that staggers children by n (default 60ms)
revealProps // the standard {initial, whileInView, viewport, transition} bundle
```

Use `revealProps` rather than hand-writing the four props on every section — that's how the original
codebase ended up with six slightly different reveal timings.

---

## Hero entrance

The one orchestrated moment. On the home page:

1. eyebrow fades up (0ms)
2. headline fades up (90ms)
3. lead fades up (180ms)
4. actions fade up (270ms)
5. the reticle crosshair draws to centre and the coordinate readout counts in (400ms)

Total under `d-cine`. Everything else on the site is a single reveal — the sequence is what makes the
hero feel like an opening rather than a page.
