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

| output | source | pre-crop |
|---|---|---|
| `public/kendall-lee-150-500x400-1.jpg` | the existing web export | — |
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

## 4 · Framing — the eye line

All four eye lines sit at **25% of image height**.

25% is not arbitrary and cannot be moved far. Bennet's crown sits at 11% of his
frame, so raising him onto Lee's original 20% line would have **cut the top of
his head off**. Lee and Goerss had to come down to meet him. Anything below ~24%
crops Bennet's skull; anything above ~26% costs Lee more resolution than he can
spare.

Measured eye lines before reframing:

| | before | after | action |
|---|---|---|---|
| Lee | 20% | 25% | crop from bottom |
| Goerss | 19% | 25% | crop from bottom |
| Bennet | 31.5% | 25% | crop from top |
| Oh | 30% | 25% | crop from top |

```
eye > 0.25 → crop T = (eye − 0.25) / (1 − 0.25) off the TOP
eye < 0.25 → crop B = 1 − eye / 0.25       off the BOTTOM
```

Then restore 5:4 by cropping width to `height × 1.25`, positioned so the face's
horizontal fraction is unchanged — which is what keeps §5 valid.

---

## 5 · Positioning on the page — the `focus` values

Each portrait carries a `focus` value in `src/pages/Founders.jsx` and
`src/pages/WhoWeAre.jsx`. It is the CSS `object-position`.

| | face x | focus |
|---|---|---|
| Lee | 62.0% | `83% 0%` |
| Bennet | 62.0% | `83% 0%` |
| Goerss | 60.0% | `78% 0%` |
| Oh | 63.9% | `89% 0%` |

**Why these numbers.** A 5:4 image in the 4:5 founders card is scaled to match
the box *height*, so the browser shows the full height and crops the sides —
keeping 64% of the width. To land a face at the centre of that window:

```
focus = (faceX − 0.32) / 0.36
```

All four subjects sit right of centre in their originals. Without this, every
face is jammed against the right edge of the card.

**Two things that follow from the geometry:**

- The **vertical** half is always `0%`. In the 4:5 card no vertical cropping
  happens at all, so a vertical value would do nothing — head height is a
  property of the file (§4), never of the CSS.
- In the 4:3 card on `/who-we-are` the opposite is true: it crops vertically and
  not horizontally, so `focus` has no visible effect there. It is set anyway so
  the two pages never disagree about where a face is.

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

- **Lighting direction.** Lee and Goerss are flash-lit: flat and shadowless.
  Bennet and Oh are window-lit: directional, one side of the face in shadow.
  Brightness, contrast, black point and colour are all matchable. Direction is
  not. This is the largest remaining difference between the two pairs.
- **Lee's resolution.** 500×400 to begin with, 400×320 after the alignment crop,
  rendered around 600px wide — a 2.34× upscale. He is visibly the softest, and
  §8 rules out the usual cosmetic fix.
- **Bennet's sharpness.** His original is genuinely the least sharp of the four.

**The real fix is a reshoot of Lee and Goerss** — same seat, same window, same
session as the other two. That resolves resolution, lighting direction, head
height and colour in one go, and would let most of this document be deleted.
