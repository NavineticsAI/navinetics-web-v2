# MAVEN artwork

Everything `/products/maven-neuromodulation` draws from. **To replace any of
it: drop a new file over the old one, keep the filename, and run**

```
node tools/maven-art.mjs
```

That cuts the unit out of its background, trims each master to its own ink and
writes the `.webp` beside it. The page imports the `.webp`; the master stays as
the source of truth. If the trimmed size of `device.png` changes, the tool
prints the new one — put it in `deviceNative` in `src/data/maven.js`, which is
what the ring reads to size the image.

`detail.png` is generated rather than supplied — delete it and the tool
re-renders it from the EMF. Everything else is as NaviNetics sent it.

| File | Used | What it is |
| --- | --- | --- |
| `device.png` | ✅ as `device.webp` | The whole unit, 1061×1483, on pure black. The hero |
| `product-drawing/Picture11.emf` | ✅ as `detail.webp` | Vector drawing at 600 dpi. Its own frame is a crop of the lower two thirds |
| `product-drawing/2.png` | — | The previous hero: same view at 334×382, standing on a slab of table |
| `product-drawing/1.png` | — | The same unit in charcoal, flattened onto white with no alpha |
| `product-drawing/Picture10.png` | — | The unit beside a USB dongle, 563×366 |
| `maven.png` | — | A 108×155 thumbnail of the same view |
| `info.png` | Read, not shipped | NaviNetics' summary slide. The four domains and ten channels in `src/data/maven.js` are read off it |
| `graph.png` | Read, not shipped | A screenshot of the acquisition software. The colour ramp in `src/lib/mavenScene.js` is its colour bar, resampled |
| `info.pptx` | Read, not shipped | **159 MB, and gitignored** — see below |

## The unit is cut out, not cropped

`device.png` is rendered on pure black: the border's mean luminance is 0.17 and
its brightest pixel is 7, while the darkest pixel anywhere inside the product
is 54. Nothing sits between them, so a flood fill inward from the four corners
takes the background exactly and stops at the product. The one or two blended
pixels at the silhouette are then given alpha in proportion to their own
brightness, which is what stops the cutout showing a dark rim on a ground that
is dark but not black.

A fill rather than a threshold on purpose: a threshold is a claim about every
pixel in the image, and a fill is a claim only about pixels connected to the
outside. A black recess inside a future render survives the fill and would be
punched through by a threshold.

## The one thing still worth asking for

**A turntable — the same unit at eight or twelve angles.**

The hero ring spins and settles. The unit itself can only tilt, because one
render is all there is to tilt. Nothing else is missing: `device.png` is three
times the resolution the largest slot needs.

## Not shipped, deliberately

`graph.png` is real output from the acquisition software. The page draws a
schematic in the same visual language instead, captioned as one, because a plot
on a product page is a claim about a device used in preclinical research.
Publishing the real one is a better page and needs NaviNetics' sign-off — see
the claims notice in `src/data/maven.js`.

`info.pptx` is **159 MB** and is in `.gitignore`. The partners deck is committed
at 2.6 MB as the provenance record for third-party trademarks and that trade is
worth making; sixty times the whole repository's history, kept forever and for
every future revision, is not. Nothing in the build reads it. Remove the line
from `.gitignore` if you decide otherwise.
