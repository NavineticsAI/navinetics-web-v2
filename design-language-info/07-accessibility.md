# 07 — Accessibility

Target: **WCAG 2.1 AA**. This is a medical device company whose audience includes clinicians working
long shifts and patients with movement and vestibular disorders. Treat it as a requirement.

---

## Contrast ledger

All ratios computed against the token's own background.

### Light theme (on `canvas #F4F7F9`)

| Token | Hex | Ratio | Verdict |
|---|---|---|---|
| `ink` | `#04141D` | 17.6:1 | AAA |
| `ink-2` | `#3C5866` | 6.7:1 | AA (AAA large) |
| `ink-3` | `#55707B` | 4.6:1 | AA |
| `action` | `#1F6890` | 5.6:1 | AA |
| `on-action` on `action` | `#FFF` on `#1F6890` | 6.3:1 | AA |

### Dark theme (on `canvas #04141D`)

| Token | Hex | Ratio | Verdict |
|---|---|---|---|
| `ink` | `#E6F0F5` | 15.4:1 | AAA |
| `ink-2` | `#9DB6C3` | 8.9:1 | AAA |
| `ink-3` | `#6D8794` | 5.0:1 | AA |
| `action` | `#4E9AC4` | 6.0:1 | AA |
| `on-action` on `action` | `#04141D` on `#4E9AC4` | 6.0:1 | AA |

`ink-3` is the floor. Nothing lighter is used for text at any size.

### What this fixed

The original site set body copy in `text-gray-400` on white — roughly **2.8:1**, a clear AA failure.
It appeared at least twice:

- `Publications.jsx` — the "100+ more publications" line
- `FrameSystem.jsx` — the hero subheading

Because everything now reads `ink-3` or darker, the failure cannot recur by accident.

---

## Focus

Every interactive element has a visible focus state. `outline: none` without a replacement is banned.

```css
:focus-visible {
  outline: 2px solid var(--action);
  outline-offset: 3px;
  border-radius: 4px;
}
```

`:focus-visible` rather than `:focus`, so mouse users don't see rings on click but keyboard users
always do.

On dark showcase bands the outline inherits the theme's `action`, which is the lighter `#4E9AC4` —
verified visible against `nn-950`.

---

## Keyboard

| Component | Behaviour |
|---|---|
| `Tabs` | `←` `→` move between tabs, roving `tabIndex`, `role="tablist"` |
| `Accordion` | Native `<button>` with `aria-expanded`; panel is not focus-trapped |
| `Gallery` | Thumbnails are buttons with `aria-current`; arrow keys move selection |
| `Nav mega-panel` | Opens on hover **and** focus; `Esc` closes; never traps |
| `ThemeToggle` | Two buttons with `aria-pressed`, not a div |
| `Switch` | `role="switch"` + `aria-checked`, `Space` toggles |
| Scroll sequence | Step controls are real buttons; sequence is skippable |

Skip link to `#main` is the first focusable element on every page.

---

## Motion

See [05-motion.md](05-motion.md). `prefers-reduced-motion: reduce` is honoured globally in CSS and
per-component in JS. Scroll-pinned sequences degrade to stacked sections.

This matters more here than on a typical site: the conditions named throughout this company's own
content — Parkinson's, essential tremor, dystonia — correlate with vestibular sensitivity.

---

## Semantics

- One `<h1>` per page; heading levels never skip.
- Landmarks: `<header>`, `<nav>`, `<main id="main">`, `<footer>`.
- Decorative SVG carries `aria-hidden="true"`; meaningful SVG has `<title>`.
- Product images have descriptive `alt`; pure decoration has `alt=""`.
- Form fields have real `<label>`, not placeholder-as-label.
- Errors use `aria-invalid` + `aria-describedby`, and say **what to do**, not just what's wrong.
- External links carry `rel="noreferrer"` and an "opens in new tab" affordance.

---

## Error copy rule

> "Add the part after the @ — for example hospital.org"

not

> "Invalid email"

Explain the fix, not the failure. No apologies, no vagueness.

---

## Glass and legibility

Never behind long-form reading. Translucent backgrounds under body copy make contrast
*unpredictable* — it depends on whatever happens to be behind. All prose sits on `surface` or
`canvas`, which are opaque and measured above.

---

## Known gaps

Honest list of what is **not** done:

1. **No automated axe/Lighthouse run in CI.** Contrast is verified by calculation; DOM-level checks
   are manual. Worth wiring up.
2. **The Community page image is hotlinked from Unsplash.** It is an uncontrolled third-party
   dependency on a page NaviNetics owns. It needs to become a local asset with a licence on file.
   Marked `TODO` in `Community.jsx`.
3. **No screen-reader pass on real hardware.** Semantics are correct by construction but untested
   with NVDA/JAWS/VoiceOver.
4. **Contact form has no backend.** It validates and shows states but does not submit anywhere.
5. **Refraction is Chromium-only.** Not an accessibility failure — the fallback is complete and
   nothing is lost but the effect.
