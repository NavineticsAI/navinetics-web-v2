# 03 — The Reticle System

The signature motif. Borrowed from NaviNetics' own CT and X-ray localisers rather than invented,
which is what makes it unusable by any other company.

---

## Where it comes from

Stereotactic localisers draw crosshairs, fiducial marks and graduated scales. Arc-centred targeting
converges every degree of freedom on a single point — the **iso-center**. That vocabulary is the
ornament language for the whole site.

It also happens that MR localisers use N-shaped fiducial rods, and the logo is an N. That coincidence
is left unremarked in the marketing copy but it's why the mark sits comfortably inside this system.

---

## The three devices

### 1. Corner frame — `<Reticle>`

Four corner marks, no full border. Frames anything being **targeted**: a product shot, a key figure,
a featured spec, a pull-quote.

Drawn as eight gradient layers on a single pseudo-element — no extra DOM, no SVG.

```jsx
<Reticle>
  <img src={product.image} alt="" />
</Reticle>
```

### 2. Graduated edge — `<Reticle variant="rule">`

A measurement rule along one edge. Section dividers, table headers, the top of a spec panel.

```css
background: repeating-linear-gradient(90deg, var(--hairline) 0 1px, transparent 1px 7px);
```

### 3. Iso-center mark — `<IsoMark>`

Concentric arcs converging on a point, with axis ticks. A watermark for hero and section backgrounds,
never a foreground element.

```jsx
<IsoMark className="absolute -right-12 -top-12 w-56 opacity-20" />
```

---

## Restraint rules

**One reticle device per viewport, maximum.**

The moment corner marks appear on every card they stop meaning *"this is the target"* and become
wallpaper — which is precisely how a distinctive motif turns generic. The motif earns its meaning
from scarcity.

**Never on interactive controls.** Buttons, inputs and links do not get corner marks. The reticle
frames subjects, not actions.

**Never inside a reticle.** No nesting. A framed subject containing another framed subject reads as
a mistake.

**Opacity floor.** The iso-center watermark sits between `opacity-15` and `opacity-25`. Above that it
competes with content; below it, it looks like a rendering artefact.

---

## Colour

The reticle draws in `--retic`, which is `--action` at 55% alpha in both themes. It is never a
neutral grey — the mark is a *targeting* device and should read as instrumentation, not as a border.

---

## Structural devices that are NOT ornament

Numbered indices (`01`, `02`, `03`) appear in this system **only where the content is genuinely a
sequence**:

- ✅ the section index in the design-language reference (a document read in order)
- ✅ system component lists (an enumerated bill of materials)
- ✅ accordion steps describing a procedure
- ❌ feature grids, bento cards, product cards, founder profiles

If the order carries no information the reader needs, drop the number. Decorative numbering is one of
the clearest tells of a templated design.
