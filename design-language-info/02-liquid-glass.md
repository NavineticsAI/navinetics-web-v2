# 02 — Liquid Glass

A blur and a white border is not glass. Glass **bends light**. This document covers the two glass
materials, the refraction engine that powers one of them, and the measurements that forced them apart.

---

## Two materials, not one

Building real refraction surfaced a constraint worth designing around: **heavy frosting and visible
refraction cannot coexist**, because blur destroys exactly the high-frequency detail that makes
bending legible. They are therefore two distinct materials with opposite jobs.

| | **Frosted** | **Lens** |
|---|---|---|
| Blur | 14 / 26 / 40px | **5px** |
| Tint | `--glass-bg` (60% / 7%) | `--glass-bg-lens` (26% / 4%) |
| Refraction | none | bevel + pointer + chromatic |
| Optimised for | text **on** the glass | the world **behind** the glass |
| Use for | navbar, toolbars, modals, captions | hero panels, product callouts, showcase |
| Component | `<Glass>` | `<Lens>` |

Merging them produces the worst of both: a panel too washed to read through and too blurred to
refract. Don't.

---

## The measurement that decided it

Refraction strength measured as *share of panel pixels that actually change* versus an identical
refraction-off render, holding bevel and displacement constant and varying only blur:

| Blur | Pixels displaced |
|---|---|
| 0px | 48% |
| 3px | 6.6% |
| 5px | **2.2%** ← chosen |
| 7px | 0.4% |
| 14px | 0.7% — indistinguishable from off |

Combined with dropping the tint from 60% → 26%, the shipped `Lens` default measures **73% of panel
pixels displaced**. The first implementation — 14px blur, 60% tint — measured 0.7%, i.e. it did
nothing at all despite the filter being correctly built and applied.

### Filter order matters, and the intuitive order is wrong

`backdrop-filter` applies functions left to right.

| Order | Result |
|---|---|
| `url(#lens) blur(14px)` | displace, then blur → blur smears the refraction away (0.7%) |
| `blur(14px) url(#lens)` | blur, then displace → **0.0%**, nothing left to bend |
| `url(#lens) blur(5px)` | displace, then lightly blur → **works** |

Blurring first is strictly worse. Keep displacement first and keep the blur small.

---

## The seven layers

1. **Backdrop blur + saturation.** `backdrop-filter: blur(N) saturate(1.9)`. The saturation boost is
   the part people skip; without it, blurred content behind the glass goes grey and the panel reads
   as frosted plastic.
2. **Directional rim.** A 1px gradient border — bright top-left, near-invisible through the middle,
   bright again bottom-right — drawn with `mask-composite: exclude` so it is a true ring rather than
   a background bleed. This single detail separates glass from a flat stroke.
3. **Thickness.** An inset highlight on the top edge and an inset shadow on the bottom. The eye reads
   the pair as a physical slab rather than a decal.
4. **Pointer-tracked sheen.** A radial highlight positioned from two CSS variables the pointer writes.
   Glass that never changes as you move past it reads as a *picture* of glass.
5. **Two-part shadow.** Tight contact shadow plus wide ambient. One blur alone looks like a sticker.
6. **Edge refraction.** *(Lens only)* Real backdrop displacement — see below.
7. **Chromatic aberration.** *(Lens only)* Three displacement passes at slightly different scales,
   one channel taken from each. The faint colour fringing at a real lens edge. First thing to drop if
   a device struggles.

---

## The refraction engine

`src/lib/lens.js`

### Why not turbulence

The widely-copied glass trick feeds `feTurbulence` into the displacement map. That warps the whole
panel evenly, which reads as *rippled* or *frosted* glass — a bathroom window. Real optical glass
barely refracts through the middle, where the surface is flat, and refracts hard at the edge, where
it curves.

### The bevel map

Generated per panel from its own rounded-rectangle **signed distance field**, so the bevel follows
the actual corner radius instead of approximating it.

```js
// for each pixel, distance to the rounded-rect edge (negative = inside)
qx = abs(px) - halfW + r;   qy = abs(py) - halfH + r;
sd = hypot(max(qx,0), max(qy,0)) + min(max(qx,qy), 0) - r;

if (sd < 0 && sd > -bevel) {
  t = -sd / bevel;        // 0 at the edge, 1 at the inner limit
  k = (1 - t) ** 2;       // convex falloff — strongest right at the edge
  n = normalize(edge gradient);
}
R = 128 + n.x * k * 127;   // 128 is neutral; R drives X, G drives Y
G = 128 + n.y * k * 127;
```

Rendered to a canvas, exported as a data URI, fed to `feImage`. Regenerated only when the element's
width, height, radius or bevel changes — never on pointer move.

### The pointer lens

A separate radial "droplet" map, summed onto the bevel map and repositioned each frame by writing
`x`/`y` on its `feImage`. Two attribute writes; no canvas regeneration.

Amplitude eases in and out through the composite weights (`k2`/`k3`), so it fades rather than snapping.

### The filter graph

```xml
<filter filterUnits="userSpaceOnUse" x="0" y="0" width="W" height="H"
        color-interpolation-filters="sRGB">
  <feFlood flood-color="rgb(128,128,128)" result="neutral"/>

  <feImage href="{lensPNG}" x="{mx}" y="{my}" result="blobRaw"/>
  <feComposite in="blobRaw" in2="neutral" operator="over" result="blobFull"/>
  <feComposite in="blobFull" in2="neutral" operator="arithmetic"
               k2="{a}" k3="{1-a}" result="ptr"/>

  <feImage href="{bevelPNG}" x="0" y="0" width="W" height="H" result="edgeRaw"/>
  <feComposite in="edgeRaw" in2="neutral" operator="arithmetic"
               k2="{eA}" k3="{1-eA}" result="edge"/>

  <!-- both maps are centred on 0.5, so subtract one -->
  <feComposite in="ptr" in2="edge" operator="arithmetic"
               k2="1" k3="1" k4="-0.5" result="map"/>

  <feDisplacementMap in="SourceGraphic" in2="map"
                     xChannelSelector="R" yChannelSelector="G" scale="{S}"/>
</filter>
```

**`color-interpolation-filters="sRGB"` is not optional.** The default is linearRGB, which shifts
where "neutral" sits and smears the entire panel sideways.

**The neutral flood is not optional either.** `feImage` produces transparent black outside its
subregion, which a displacement map reads as a full-scale negative offset. Flooding neutral grey and
compositing `over` fixes the out-of-bounds region.

**Amplitude is decoupled from scale.** The displacement scale is `max(edge, pointer)`; each map is
then weighted by its own share so the two strengths can be tuned independently.

---

## Browser support

`backdrop-filter` accepts SVG filter references in **Chromium only**. Safari and Firefox support
`backdrop-filter` but not `url()` inside it.

The refraction layer is attached by script **only after a capability probe passes**, so an
unsupported browser never loses its blur — a failed `backdrop-filter` declaration would drop the
whole thing.

Fallback for Safari/Firefox: layers 1–5 plus `.glass-edge`, a masked ring that re-blurs the backdrop
at the bevel. Convincing thickness; not true displacement.

Verified directly rather than assumed: `feImage` + `feDisplacementMap` inside `backdrop-filter` was
tested in isolation in Chromium before anything was built on it.

---

## Performance budget

Each refracting panel is a full backdrop re-filter for every frame it changes.

- **Three refracting panels on screen, maximum.**
- **Never on the sticky navbar** — it would re-filter on every scroll pixel.
- Chromatic aberration triples the displacement passes; drop it first under load.
- Pointer updates are rAF-throttled and only touch the hovered element.
- Under `prefers-reduced-motion`, the static bevel refraction stays (it isn't motion) but the
  pointer lens is disabled.

---

## Where glass is banned

Never behind long-form reading — Education, Publications, founder bios. Translucency under body copy
is a legibility and accessibility problem, not a style choice.

Rule of thumb: **if it's read for more than ten seconds, it sits on a solid surface.**
