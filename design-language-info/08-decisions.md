# 08 — Decisions

Why each major call was made, including the ones that were reversed. Written so a future maintainer
doesn't re-litigate settled questions or repeat a dead end.

---

## Brief

Four choices set by NaviNetics at the outset:

| Question | Choice |
|---|---|
| Light vs dark | **Full dual theme with a toggle** |
| Blue direction | **Logo-matched teal-blue with a mature accent** |
| Personality | **Cinematic product story** |
| Scale target | **Multi-product catalogue** |

Everything below follows from those.

---

## The accent moved from cyan to steel-blue

**Initial proposal:** `#21A7D4` / `#7FD4F0` — an electric cyan accent against the logo's navy-teal.

**Feedback:** *"make it more mature blue."*

**Change:** hue shifted from ~195° to **205°**, saturation reduced, value deepened. Accent became
`#1F6890` (light) / `#4E9AC4` (dark). Glow tokens were pulled back from neon in the same pass.

**Why it's better:** cyan reads as consumer tech. A deep steel-blue reads as instrumentation, which
is what a surgical device company is selling. It also sits more comfortably beside the logo's own
`#164F6A` rather than making the mark look desaturated.

---

## Light is the default, not the OS preference

**Initial build:** the theme followed `prefers-color-scheme`, falling back to light.

**Change:** light is now the default for every visitor. Dark is opt-in via the toggle and persisted
in `localStorage`.

**Why:** a medical device site should open the same way for everyone. Whether a surgeon happens to
have dark mode enabled on their laptop is not a signal about how NaviNetics wants to introduce
itself, and it made the first impression unpredictable — screenshots, demos and investor meetings
would vary by machine.

**Consequence worth knowing:** the `@media (prefers-color-scheme: dark)` block was removed from
`index.css` entirely rather than left as a no-JS fallback. Leaving it would have flipped a
JavaScript-disabled visitor on a dark OS into the dark theme — reintroducing exactly the
inconsistency the light default removes.

Three places must agree, and all three are commented as such: the pre-paint script in `index.html`,
`DEFAULT_THEME` in `src/lib/theme.jsx`, and the absence of the media query in `src/index.css`.

---

## Two glass materials instead of one

**Initial design:** one `.glass` class, blur 26px, tint 60%, with refraction added on top.

**What happened:** the refraction measured **0.7% of pixels displaced** — indistinguishable from off
— despite the filter being correctly constructed and applied. Verified by headless render + pixel
diff against a refraction-off build, not by eye.

**Root cause:** blur destroys the high-frequency detail that makes displacement legible. Frosting and
lensing are physically opposed.

**Dead end, recorded so it isn't retried:** reordering to `blur() url(#lens)` so blur runs *first*
makes it strictly worse — **0.0%**. There is nothing left to bend.

**Resolution:** split into `Glass` (frosted, for reading off) and `Lens` (5px blur, 26% tint, hard
refraction, for looking through). Shipped `Lens` measures **73%**.

Full numbers in [02-liquid-glass.md](02-liquid-glass.md#the-measurement-that-decided-it).

---

## Investigated and cleared

Two suspects for the refraction failure were tested and found innocent. Don't remove these:

- **`isolation: isolate`** on `.glass` — removing it changed the measurement by exactly 0.0%.
- **`will-change: backdrop-filter`** — same.

Both stay because they serve stacking and compositing correctness.

---

## Displacement map from an SDF, not turbulence

The widely-copied approach feeds `feTurbulence` into `feDisplacementMap`. It warps the panel evenly,
which reads as *rippled* glass — a bathroom window.

Real glass barely refracts through the flat middle and hard at the curved edge. Generating the map
from the element's own rounded-rectangle signed-distance field produces that falloff and makes the
bevel follow the actual `border-radius` rather than approximating it.

Cost: one canvas per panel per size change. Cheap, and cacheable by geometry key.

---

## Instrument Sans + IBM Plex Mono

**Rejected:** Inter (the default everyone reaches for, and already what the site used), Space Grotesk
(the other default), a serif display face (wrong register — this is an instrument, not a journal).

**Chosen:** Instrument Sans for display *and* body, differentiated by scale and tracking. IBM Plex
Mono strictly for measured values.

**Why one sans:** swapping families between display and body is what makes a page feel like a
collage. One family at different optical treatments is what makes it feel like one object.

**Why a mono at all:** this company's entire product is coordinates and measurements. A mono voice
for data is content-derived, not decorative — provided it's held to that rule.

**Self-hosted** rather than CDN-linked: no third-party request, no privacy question, no dependency on
fonts.googleapis.com staying up.

---

## Reticle motif over generic geometry

The alternative was the usual abstract-tech vocabulary: gradient meshes, particle fields, floating
orbs. All of it is interchangeable between any two companies.

Corner marks, graduated rules and iso-center crosshairs come from NaviNetics' own localisers. The
constraint that makes it work is **scarcity** — one device per viewport. See
[03-reticle-system.md](03-reticle-system.md#restraint-rules).

---

## Products became data

**Before:** Frame System and Neuromodulation were two hand-built pages sharing no code. A third
product meant a third bespoke page.

**After:** `src/data/products.js`. One record yields a catalogue card, a detail page, a nav entry and
a comparison column.

This was the direct consequence of the "more products" answer in the brief. It is the single change
most likely to save work later.

---

## Kept from the original build

Not everything needed replacing:

- **The 300vh scroll-pinned sequence** on Frame System — the strongest moment on the site. Kept, with
  a cap, keyboard controls, a progress indicator and reduced-motion degradation added.
- **Framer Motion** — already a dependency, well suited, no reason to change.
- **The bento composition** on the home page — good structure, wrong colours. Retokenised only.
- **Alternating media/text sections** on Education — correct pattern for that content.

---

## Deliberately not done

- **`mix-blend-multiply` removal is incomplete.** It only works over white; on the dark theme the
  product shots would become black mush. The real fix is transparent-background cutouts, which don't
  exist yet. Interim: each product image sits on a **product plate** that stays light in both themes.
  This is a stopgap and is marked as such in the code.
- **No CMS.** Content lives in `src/data/*.js`. Fine at this size; revisit past ~30 publications
  needing non-developer edits.
- **No analytics, no cookie banner.** Out of scope, and adding either has legal implications that
  aren't a design decision.
- **Contact form has no backend.** States are designed and wired; submission is a stub.

---

## Standing constraint: regulated claims

Spec tables and comparison grids render whatever data they're given. Numeric performance claims and
comparative statements about competing devices are **regulated marketing claims**.

Every placeholder value currently in `products.js` is paraphrased from the existing public site and
flagged. Nothing invented was added — specifically, no accuracy figures and no setup times, both of
which are the tempting ones to fabricate for a spec table. New values need NaviNetics sign-off and
regulatory review.
