# Founder portraits — the processing spec

Settled 2026-08-13, after roughly a dozen iterations. This is the recipe that
produced the four portraits currently in `public/`. It exists because the
parameters are not recoverable from the images, and because several of them were
arrived at by getting them wrong first.

Runnable version: **`tools/founder-portraits.py`**. It rebuilds all four from
the original sources in one pass. Never edit the JPEGs in `public/` by hand —
re-run the script, so nothing is ever a second-generation encode.

---

## 1 · The problem this solves

Four portraits, two eras, and they did not belong to each other:

| | source | resolution | lighting |
|---|---|---|---|
| Lee | old site export | 500×400 | flash — flat, shadowless |
| Goerss | old site export | 1000×800 | flash — flat, shadowless |
| Bennet | camera original, 14 MB | 5200×4160 | window behind, backlit |
| Oh | camera original, 10 MB | 4274×3410 | window behind, backlit |

Three separate mismatches, fixed independently: **exposure** (faces differed by
68 luminance points), **head height** (eye lines differed by 11 points of frame
height), and **colour** (Bennet cyan, Oh yellow).

**Lee and Goerss are the reference.** Every target below is measured off them,
because their look is what NaviNetics has been publishing for years — not
because it is better.

---

## 2 · Sources

> **Superseded for Lee, 2026-08-17.** His source is `dr_lee_enhanced_final.png`,
> retouched outside the repository. Geometry-only was tried first, on the
> principle that a hand-retouched file should not be second-guessed — and
> **measurement did not support it**:
>
> | | Lee, ungraded | Bennet | Oh | Goerss |
> |---|---|---|---|---|
> | Face luminance | **143.6** | 103.5 | 116.9 | 113.0 |
> | R/B | **1.81** | 1.44 | 1.45 | 1.31 |
> | Skin chroma | **31.4** | 15.3 | 17.4 | 13.0 |
>
> Twice the saturation and thirty luminance points brighter reads as a different
> photographic treatment rather than a different sitting; on a row of four cards
> it was visibly the retouched one. So exposure, white balance and an **even
> chroma scale** are applied — and nothing else. De-glow and the midtone S-curve
> stay off: both model things the retoucher has already handled. The expression,
> the cleanup and the detail are untouched; only the colour moves.
>
> **`desat`, not `chroma_to`.** The targeted skin push was tried and is the wrong
> instrument for a source this far out: it applies a large gain inside a
> feathered face mask and none outside it, the white balance then over-corrects
> trying to follow, and the background came back cyan at `a* −13.9` against Oh's
> `+2.2`. Scaling `a*` and `b*` together moves everything by one factor, so
> nothing shifts hue relative to anything else and the ground stays put. At
> `k = 0.62` his chroma lands at **17.8** against Oh's 17.4.
>
> Two consequences worth knowing. His 2.34× upscale is gone — the source is
> larger than the output. And his `focus` moved from `83% 0%` to `50% 0%`,
> because the recrop centres him where the old export had his face at 62% of the
> frame; §5's formula still holds, the input to it changed.
>
> **Headroom is the one thing that cannot be matched.** His crown sits 2.4% down
> the source frame, so the crop starts at y=0 and still lands at 3.0% against
> Oh's 7.7% and Goerss's 9.9%. Putting it at 7.7% would need a crop shorter than
> his own head. There is nothing above him to crop to.

| output | source | pre-crop |
|---|---|---|
| `public/kendall-lee-150-500x400-1.jpg` | `dr_lee_enhanced_final.png` — retouched, **not graded here** | `(343, 0, 1368, 820)` |
| `public/stephan-goerss-150.jpg` | the existing web export | — |
| `public/kevin-bennet.jpg` | `dr_benett_final.JPG` | `(0, 0, 5200, 4160)` — already exactly 5:4 |
| `public/yoonbae-oh.jpg` | `dr_oh_tie_final.jpg` | `(12, 0, 4274, 3410)` → 4262×3410, trimmed to exactly 5:4 |

**No originals exist for Lee and Goerss.** If Mayo has them, re-exporting is
worth more than everything in this document — see §9.

The 2026 camera files are not in the repo. Keep them somewhere durable; without
them this script cannot be re-run for Bennet and Oh.

---

## 3 · Aspect ratio and output size

Every portrait is **5:4 landscape (1.25)**, matching the legacy exports. This is
load-bearing: it is what makes the CSS in §5 behave predictably.

| | output | scaling at display |
|---|---|---|
| Lee | 400×320 | 2.34× up ⚠ |
| Goerss | 760×608 | 1.23× up |
| Bennet | 1200×960 | 0.78× down |
| Oh | 1200×960 | 0.78× down |

JPEG: **quality 86** (Lee, Goerss), **88** (Bennet, Oh), `optimize=True`,
`progressive=True`.

---

## 4 · Framing — one face size, one eye line

**Superseded 2026-09-02.** The set is now solved for two numbers, both measured
in the finished 1200×960 file:

| target | value |
|---|---|
| interocular distance (pupil to pupil) | **170 px** |
| eye line | **29% of image height** |

**Why interocular and not head height.** Head height — crown to chin — was the
previous target, and it is the wrong measurement. It counts Goerss's beard and
Lee's hair as head, so equalising it left Goerss's *face* visibly the smallest
of the four while the numbers reported a match. Pupils are the same landmark on
every face, in a way that a hairline is not.

**Why it matters at all.** Four cards in a row are read against each other. A
face that renders larger than its neighbours reads as the senior one — which is
a claim the site should not be making with a crop. Equal face size and equal eye
height is what removes it.

Measured in the sources, interocular runs 110 px (Goerss), 134 (Bennet), 148
(Oh) and 213 (Lee). Lee's is a different, much closer photograph, which is why
his box is by far the largest.

**170 px / 29% is the loosest setting all four sources can reach.** Goerss sets
the ceiling: there are only ~200 px above his pupils in the whole file, so
pushing the eye line lower forces a smaller crop on *everyone*. Anything looser
than this needs a different source, not a different box.

| | interocular in the card, before | after |
|---|---|---|
| Lee | 169 px | 170 px |
| Oh | 158 px | 170 px |
| Bennet | 132 px | 170 px |
| Goerss | 117 px | 170 px |

| | eye line, before | after |
|---|---|---|
| Lee | 35.0% | 29% |
| Bennet | 26.8% | 29% |
| Oh | 24.9% | 29% |
| Goerss | 18.2% | 29% |

Lee's face was **44% wider than Goerss's** in the shipped cards, and the eye
lines spanned 17 points.

### Edge padding

Two boxes run slightly past a source edge and are filled by replicating the
edge row — `crop_pad()` in the script. It is what buys the set a common face
size. Both overhangs land on plain content:

- **Lee** — 67 rows below his shoulder: out-of-focus corridor and dark suit.
  The 4:3 card on `/who-we-are` trims the bottom 6.25% and never shows it.
- **Oh** — 42 columns at the right edge, outside the 64% window the 4:5 card
  shows.

Replicate, not mirror: mirroring a shoulder puts a second, upside-down shoulder
in the frame.

The `reframe()` step is a pass-through now (`eye = .25`, `facex = .5`) — the
boxes are already 5:4 and already centred on the face. It is kept because it
still enforces the aspect ratio if a box is ever mistyped.

---

## 5 · Positioning on the page — the `focus` values

Each portrait carries a `focus` value in `src/pages/Founders.jsx` and
`src/pages/WhoWeAre.jsx`. It is the CSS `object-position`.

**All four are now `50% 0%`.** The crops are centred on the face in the file, so
the card needs no correction. The old per-founder percentages — derived from
`focus = (faceX − 0.32) / 0.36` — are gone, and with them the coupling that made
every crop change require a matching edit in two JSX files.

The field is kept rather than hard-coded because the two pages must not disagree
about where a face is if either box changes shape.

**What each card actually shows:**

- **`/company/our-founders`, 4:5.** A 5:4 file scaled to match the box *height*:
  full height, centre 64% of the width. Vertical `focus` is always `0%`; it
  would do nothing.
- **`/who-we-are`, 4:3.** The opposite — full width, top 93.75% of the height.
  Equal face size and equal eye height carry over unchanged, and it trims the
  edge where Lee's crop is padded.

---

## 6 · Grade — Bennet and Oh

Applied in this order, in one pass from the original. Everything is in **linear
light**; the black and white points are restored at the end so corrections land
on the face rather than fogging the picture.

**6.1 Exposure.** Target face luminance **114** (sRGB 0–255), solved
iteratively — measure, adjust, repeat, ≤7 passes, step `(114/measured)^0.85`,
tolerance ±1.2. A single-shot gamma will not hit it, because step 6.5 pulls the
result back down every time.

Gamma is applied in linear light, clamped **0.30–1.7**.

**6.2 Shadow lift: `0.04`.** This was `0.22` and that was wrong — it laid a
milky veil over the midtones of both faces. It is the single most damaging
parameter here; do not raise it.

```
lin *= 1 + 0.04 · clip((0.34 − L) / 0.34, 0, 1)^1.6
```

**6.3 White balance.** Face **R/B → 1.40**, **G/B → 1.09**, measured on the face
box. Per-channel gains clamped 0.80–1.30, scaled to preserve luminance so
correcting colour does not undo 6.1.

**6.4 De-glow (veiling glare).** Both are backlit, and the blown window casts
bloom onto the face. Model it and subtract:

```
source    = clip(L* − 72, 0, ∞) / (100 − 72)      # only blown highlights contribute
glow      = gaussian(source, σ = 42px)            # at 1200×960
L*        = L* − 0.55 · glow · clip((100 − L*)/100, 0, 1) · 22
```

**Strength 0.55.** Tested at 1.0; it goes heavy around the eyes.

**6.5 Black/white re-anchor.** Percentiles **0.4 and 99.6** restored to their
pre-grade values. This is what keeps the suits black and the window white.

**6.6 Midtone S-curve, amount `0.16`,** on L\* only:

```
L' = L + 0.16 · (L − 0.5) · (1 − |L − 0.5| · 2)     # L normalised 0–1
```

Restores modelling after the lift. It is *not* an edge operation — see §8.

**6.7 Skin chroma — Bennet only.** He was by far the most desaturated
(chroma 9.8 against Lee's 17.8). Skin `a* → 11.05`, `b* → 10.35`, the Lee+Goerss
mean. Gains capped at **±1.35** and applied through a feathered skin mask, so
the background does not saturate with it.

**6.8 De-blue — Bennet only.** His background measured `a* −7.1, b* −6.2`
against roughly `−4.4, −1.6` for the others. Shift `a* +2.7`, `b* +4.6`,
weighted by `clip(1 − chroma/16, 0, 1)` so it moves neutrals — background, white
shirt, grey suit — and leaves skin and the yellow tie alone.

**Skin mask**, used by 6.7 and 6.8: YCbCr, `133 < Cr < 180`, `77 < Cb < 130`,
`45 < Y < 235`, feathered with a gaussian at σ = 7.

---

## 7 · Grade — Lee and Goerss

Lighter, because they only needed bringing toward the middle: target skin
luminance **142**, warmth **R/B 1.45**, same 0.4/99.6 re-anchor. Goerss came
down (he was the brightest at 163), Lee came down slightly.

They are cropped (§4) but otherwise carry their original tone. They are the
reference; do not grade them toward the other two.

---

## 8 · Rules

**Never sharpen these images.** Unsharp masking was tried and it was the worst
thing done to them — visible noise and pixelation, immediately rejected. It
cannot add detail, only amplify what is there, including JPEG artefacts. Lee is
upscaled 2.34×, so on his file it amplifies almost nothing but artefacts. If a
portrait looks soft, the answer is a better source file, not a filter.

**Measure inside the card crop, not the whole image.** A skin-tone detector run
over Oh's full frame reported his face at 122 when it was actually 76 — the
beige Plummer Building behind him falls squarely in skin tones, and the mask was
averaging the building. Always crop to what the card shows, then to a face box
(**12–45% vertical, faceX ± 7.5% horizontal**), then measure.

**Measure colour in CIELAB, not RGB ratios.** "Yellowish" and "washed out" are
different quantities — hue angle and chroma — and RGB ratios cannot separate
them. Judging by R/B alone identified the wrong photo as the outlier.

**Rebuild from the original; never correct a correction.** Every pass is a
re-encode, and errors compound. The script always starts from the camera files.

**Look at the picture before trusting the number.** Every wrong turn in this
work came from optimising a metric that was measuring the wrong thing. The
brief — *they should look cohesive* — is a visual judgement, and the tables only
ever supported it.

---

## 9 · What this cannot fix

**All four sources were replaced during 2026-08/09, so most of what this section
used to list is gone.** Lee's 500×400 file and Goerss's flash-lit one are both
retired. What is left:

- **Lee's background.** His is the only one not shot at the window. Bennet,
  Goerss and Oh share a ground — the Plummer Building through the same glass, at
  the same hour. Lee is in a corridor: darker, warmer, with green and amber
  bokeh instead of a skyline. On a row of four cards this is the one difference
  a reader still sees, and **no crop or grade can fix it** — the location is in
  the file. Grading him toward the other three was tried on 2026-09-01 and
  looked worse, not better (§7); it took his skin to a\* 7.0 and the ground to
  L\* 58.8, and it read as blue and dull.
- **Lee's framing.** He is photographed much closer than the other three
  (interocular 213 px against 110–148). That is why he sets the size the whole
  set has to match, and why the set cannot be framed any looser than §4 without
  a different photograph of him.
- **Lighting direction.** Still not matchable in software, though the gap is
  much smaller now that Goerss is window-lit like Bennet and Oh.

**The remaining fix is one photograph: Lee, at the same window as the other
three.** It resolves background, lighting and framing at once, and would let §4
be re-solved at a looser, more flattering crop for all four.
