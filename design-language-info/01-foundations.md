# 01 — Foundations

The token contract. Components read semantic names; the theme decides what they resolve to.

---

## Colour

### Structure ramp — `nn-*`

Sampled directly from the logo mark, whose gradient runs deep navy-teal → bright cyan. `nn-600` and
`nn-800` are the logo's own colours, which is why the mark never looks pasted onto the page.

| Token | Hex | Role |
|---|---|---|
| `nn-950` | `#04141D` | Dark ground |
| `nn-900` | `#06202E` | Dark elevated |
| `nn-850` | `#092836` | |
| `nn-800` | `#0B384D` | Logo deep |
| `nn-700` | `#124A63` | |
| `nn-600` | `#164F6A` | **Logo core** |
| `nn-500` | `#1E6685` | |
| `nn-400` | `#3D839F` | |
| `nn-300` | `#6BA5BC` | |
| `nn-200` | `#A3C8D8` | |
| `nn-100` | `#CFE2EB` | |
| `nn-50` | `#E9F2F6` | |

### Signal ramp — `sg-*`

The accent. Hue ~205°, moderate saturation — a **matured steel-blue**, deliberately pulled back from
cyan. Reads as authority rather than neon.

| Token | Hex | Role |
|---|---|---|
| `sg-900` | `#0C2F45` | |
| `sg-800` | `#123F5C` | |
| `sg-700` | `#185273` | Light-theme action hover |
| `sg-600` | `#1F6890` | **Light-theme action** |
| `sg-500` | `#2C7FAC` | |
| `sg-400` | `#4E9AC4` | **Dark-theme action** |
| `sg-300` | `#82BAD9` | Dark-theme action hover |
| `sg-200` | `#B6D7E9` | |
| `sg-100` | `#E0EFF7` | |

### Semantic tokens

These are the **only** names a component may use. Left value is light, right is dark.

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#F4F7F9` | `#04141D` | Page ground |
| `sunk` | `#E8EFF3` | `#020C12` | Recessed bands |
| `surface` | `#FFFFFF` | `#0A2231` | Cards, panels |
| `surface-2` | `#FAFCFD` | `#0D2A3B` | Table headers, inset |
| `ink` | `#04141D` | `#E6F0F5` | Primary text |
| `ink-2` | `#3C5866` | `#9DB6C3` | Secondary text |
| `ink-3` | `#55707B` | `#6D8794` | Labels, captions |
| `hairline` | `#D3E0E7` | `#173B4E` | Borders |
| `hairline-soft` | `#E4EDF1` | `#102C3B` | Dividers |
| `action` | `#1F6890` | `#4E9AC4` | Links, primary buttons |
| `action-hi` | `#185273` | `#82BAD9` | Action hover |
| `on-action` | `#FFFFFF` | `#04141D` | Text on action fill |
| `action-soft` | `rgb(31 104 144 / .09)` | `rgb(78 154 196 / .14)` | Tints, hover wash |
| `ok` | `#0F8A72` | `#0F8A72` | Available, success |
| `warn` | `#B0730C` | `#B0730C` | In development |
| `crit` | `#C33C40` | `#C33C40` | Error, not-for-clinical-use |

**Why `action` differs per theme.** No single blue clears 4.5:1 on both `#F4F7F9` and `#04141D`.
`#1F6890` is 5.6:1 on light but only 3.0:1 on dark. `#4E9AC4` is 6.0:1 on dark. This split is the
single hardest constraint of a real dual theme, and it's why hardcoded hex values break themes.

**Neutrals are not grey.** Every neutral carries a slight teal bias toward the accent. A pure mid-grey
reads as unconsidered next to a blue-tinted ground.

**Semantic ≠ accent.** `ok` / `warn` / `crit` sit outside the blue family on purpose, so a status pill
never reads as brand emphasis and never reads as a link.

---

## Type

Two families, three voices.

| Role | Family | Weight | Tracking | Size |
|---|---|---|---|---|
| Hero | Instrument Sans | 600 | −0.045em | `clamp(2.75rem, 8.5vw, 7rem)` |
| Display 1 | Instrument Sans | 600 | −0.035em | `clamp(2.25rem, 5.4vw, 4rem)` |
| Display 2 | Instrument Sans | 600 | −0.035em | `clamp(1.75rem, 3.6vw, 2.75rem)` |
| Heading | Instrument Sans | 600 | −0.025em | `1.375rem` |
| Lead | Instrument Sans | 400 | −0.015em | `clamp(1.06rem, 1.5vw, 1.25rem)` |
| Body | Instrument Sans | 400 | −0.011em | `1rem` / 1.6 |
| Eyebrow | IBM Plex Mono | 600 | **+0.16em** | `0.6875rem`, uppercase |
| Data | IBM Plex Mono | 500 | 0 | tabular-nums |

**The mono rule.** Plex Mono is reserved for things that are *measured*: coordinates, model numbers,
years, token names, section indices, eyebrows. Never for prose, never for emphasis. Break this rule
and the mono stops signalling instrumentation and becomes decoration.

**Display and body are the same family.** Differentiated by scale and tracking, never by swapping
faces. This is what keeps it feeling like one instrument rather than a collage.

**Measure.** Running text is capped near 65 characters (`max-w-prose`, ~62ch). Headings get
`text-wrap: balance`.

**Self-hosted.** `public/fonts/`, `font-display: swap`, latin + latin-ext subsets. No CDN request, no
third-party dependency, no layout shift beyond the swap.

---

## Space

4px base. Use these steps; don't invent intermediate values.

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160`

Section rhythm: `py-24` mobile → `py-32` tablet → `py-40` desktop. Content max width `1080px` for
reading, `1280px` for grids and galleries.

**Layout does the spacing.** Sibling groups use flex/grid `gap`, not per-element margins that
collapse or double.

---

## Radius

Two families, deliberately — and the tension between them *is* the identity.

| Token | Value | Applies to |
|---|---|---|
| `instr` | `3px` | Reticle frames, spec tables, localiser graphics, data surfaces |
| `sm` | `10px` | Inputs, thumbnails, small chips |
| `md` | `16px` | Panels, tables, accordions |
| `lg` | `24px` | Cards, glass surfaces |
| `xl` | `32px` | Hero containers, large media |
| `pill` | `999px` | Buttons, badges, toggles |

Hardware isn't soft. Anything representing an instrument stays near-sharp at `3px`; content and glass
surfaces round generously. Never blend the two on one element.

---

## Elevation

Never one blur. Every shadow is a tight **contact** shadow plus a wide **ambient** shadow.

| Level | Shadow |
|---|---|
| `e1` rest | `0 1px 2px rgb(var(--sh)/.06)` |
| `e2` raised | `0 1px 2px rgb(var(--sh)/.08), 0 8px 20px -6px rgb(var(--sh)/.18)` |
| `e3` float | `0 2px 4px rgb(var(--sh)/.10), 0 22px 48px -14px rgb(var(--sh)/.28)` |

`--sh` is `11 56 77` on light — the brand navy, **not black**. Black shadows on a blue-tinted ground
read muddy. On dark it becomes `0 6 10` and the sense of lift comes from the rim highlight instead.

---

## Implementation

Static ramps live in Tailwind's `@theme`. Themeable semantic tokens live in a plain `:root` /
`[data-theme]` layer and are bridged into Tailwind with `@theme inline`, so `bg-surface` and
`text-ink` are real utilities that respond to the theme.

```css
@theme {                      /* static — generates utilities directly */
  --color-nn-600: #164F6A;
  --color-sg-600: #1F6890;
}

:root      { --surface: #FFFFFF; }   /* themeable */
[data-theme="dark"] { --surface: #0A2231; }

@theme inline {               /* bridge — utility points at the live var */
  --color-surface: var(--surface);
}
```

> `tailwind.config.js` was deleted. It was v3-format and silently ignored under Tailwind v4, which
> reads configuration from `@theme` in CSS. Leaving it there invited edits that would do nothing.
