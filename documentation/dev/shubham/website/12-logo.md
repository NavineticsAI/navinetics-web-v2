# The logo — how it is drawn, and why it stopped being a mask

Settled 2026-08-13.

**The lockup is the artwork, rendered as an `<img>`.** It is not recoloured,
masked, tinted or animated. There is exactly one component — `src/ui/Logo.jsx` —
and two files.

---

## 1 · The files

| | Path | Used on |
|---|---|---|
| Master | `src/assets/logo.png` | light grounds — navbar, partners tile |
| Reversed | `src/assets/logo-reversed.png` | dark grounds — the footer |

Both 375×74, RGBA.

**The master is byte-identical to the file navinetics.com serves**
(`wp-content/uploads/logo-378x75-1.png`, same MD5). Verified 2026-08-13. It is
the authoritative master; do not regenerate, resize or re-export it. If the
brand artwork is ever reissued, replace this file and re-derive the reversed one
(§4).

### The two official colours

The lockup is **two different blues**, and it carries a gradient and fold
shading. It is not one flat colour:

| | Hex | |
|---|---|---|
| **Mark** — the ribbon | `#196184` | lighter, bluer; gradient across the fold |
| **Wordmark** — NAVINETICS | `#164f6a` | darker; shading up to `#428aa9` |

`#164f6a` is `nn-600` in `design-language-info/01-foundations.md`, where it is
already labelled **"Logo core"** — the structural ramp was sampled from this
artwork, which is why the mark sits naturally on the page.

---

## 2 · Usage

```jsx
<Logo height={28} />            // navbar, partners tile — light ground
<Logo height={30} reversed />   // footer — dark ground
```

`height` is in px; width follows the artwork's 375:74 ratio. Intrinsic
`width`/`height` attributes are set so the header does not reflow while the
image loads.

Three placements, and they must stay in agreement:

| Placement | File | Ground |
|---|---|---|
| `components/Navbar.jsx` | master | follows the theme, always light enough |
| `components/Footer.jsx` | **reversed** | `bg-nn-950` — near-black in **both** themes |
| `ui/PartnerGlobe.jsx` (`<Mark>`, `org.self`) | master | `.nn-mark`, white plate in both themes |

**The footer is the exception, and it is not optional.** That band is `#04141d`
in light mode as well as dark, so the master — a deep navy — is close to
unreadable on it. It is the only placement whose ground does not follow the
theme.

---

## 3 · What this replaced, and why

The lockup used to be a **CSS mask**: this same PNG supplied the silhouette via
`mask-image`, a flat `--logo-ink` was poured through it, and two animation
layers ran a travelling highlight along each ribbon stroke and a slow hue drift
across the wordmark. Roughly **200 lines of CSS** and four theme tokens.

It was removed because **a CSS mask reads only the alpha channel.** The colour
is discarded at that step. What survived was the outline, flooded with one flat
value — so:

- the **gradient** across the ribbon was gone;
- the **fold shading** was gone;
- the mark and the wordmark were painted the **same** colour, when the artwork
  has two;
- the flat value itself matched neither. `--logo-ink` was `#185273` against the
  mark's `#196184` — **ΔE 6.4**, comfortably past the ~2 threshold where a
  difference is visible;
- and because the footer had to pin a light ink to stay legible on its dark
  band, **the light-mode footer did not match the light-mode navbar**. Same
  logo, two colours, one page.

No choice of colour could have fixed the first three. One flat fill cannot be a
gradient.

**What was given up.** The mask could recolour itself per theme, and it carried
the shimmer and hue drift. Both are gone. They were a rebuild invention rather
than part of the brand, and an exact logo was judged worth more than an animated
approximation. If the motion is ever wanted back it needs a route that does not
destroy the artwork — an SVG with real gradients, or an overlay above the image.

---

## 4 · Re-deriving the reversed lockup

`logo-reversed.png` is **derived from the master**, not hand-drawn, and not a
white silhouette. In CIELAB:

1. take ink pixels (alpha > 60);
2. remap their own `L*` range — 3rd to 97th percentile — onto **62–88**;
3. scale `a*` and `b*` by **0.85**, since reversed marks read over-saturated on
   dark grounds;
4. leave alpha untouched.

Remapping the range rather than inverting is what preserves the gradient and the
folds: light and dark areas keep their order and their relative spacing, the
whole set just moves up into a band that reads on `#04141d`.

**This is our derivation, not the designer's.** If NaviNetics has an official
reversed or white lockup, it should replace this file — that is the one thing in
this document worth changing.

---

## 5 · Rules

- **Never recolour the lockup in CSS.** No `filter`, no `mask-image`, no
  `background-color` behind a stencil. If a placement needs a different colour,
  it needs a different file, derived as in §4.
- **Never regenerate `logo.png`.** It is the upstream master, matched to the
  live site byte for byte. Re-exporting it through any tool breaks that.
- **A new dark placement takes `reversed`.** Do not pick a lighter flat colour.
- **Keep the three placements in step.** They are listed in §2 precisely so the
  next one is added deliberately rather than by copying whichever was nearest.
- Both files are RGBA with real transparency — they sit on any ground without a
  plate behind them.
