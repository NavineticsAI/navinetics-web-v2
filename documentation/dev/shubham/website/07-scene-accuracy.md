# Scene accuracy

**2026-08-11. Status: inventory kept, rebuild REVERTED.**

A rebuild of `makeAnchor` was attempted as a worked example, reviewed, and
rejected — "bad, keep the original animations". `src/lib/d1Scenes.js` is back to
its original state and **all scenes on the site are the originals**.

The inventory below is still accurate and still worth having. The rebuild
section is kept as a record of what was tried and turned down, so nobody
proposes the same thing again without knowing it was already seen.

**Do not re-apply the rebuild without asking.** The abstract scenes are a
deliberate house style, not an oversight — `d1Scenes.js` says so in its own
header: *"Nothing here is a measurement, a trajectory or a coordinate; they are
drawings of an argument."* That intent was in the code the whole time and the
rebuild worked against it.

## The problem

Reported from a walkthrough:

> all the animations that we have in the website, they are at some places just
> boxes and circles and not clinically accurate animation to the concept there

Accurate. Reading the scene code there are two clear tiers, and the split is
not subtle.

### Tier 1 — built from the science

| Scene | Grounded in |
|---|---|
| `EduFigures.jsx` — all six | Real geometry and real physics, computed |
| `LocaliserFigure` | Actual frame geometry, `nbar_localization_geometry.json` |
| `featureScenes.makeNbar` | The N-localiser principle — three rods, two upright one diagonal |
| `featureScenes.makeFusion` | CT/MR contour registration |
| `lib/localizer.js`, `stereo.js`, `volume.js` | Verified against the application |

### Tier 2 — visual texture

| Scene | Page | What it drew |
|---|---|---|
| `d1Scenes.makeAnchor` | D1 · Fixation | **Rebuilt — see below** |
| `d1Scenes.makeArc` | D1 · Targeting | Line-and-dot motif |
| `d1Scenes.makeDrive` | D1 · Advancement | Line-and-dot motif |
| `d1Scenes.makeAccess` | D1 · Access | Line-and-dot motif |
| `tableScenes.makeBeam` | Tables · Radiolucency | Source/fan/detector — closest of the lot, but non-carbon parts are `fillRect` blocks and rays are **binary** blocked/not rather than attenuated |
| `tableScenes.makeEnvelope` | Tables · Motion | Abstract envelope sweep |
| `mavenScenes.makeSweep` | MAVEN, Neuromod | Real waveform shape, but no electrode and no tissue in frame |
| `mavenScenes.makeSpikes` | MAVEN, Neuromod | Field motif |
| `mavenScenes.makeStim` | MAVEN, Neuromod | Deliver-then-watch motif |
| `mavenScenes.makeStack` | MAVEN, Neuromod | Stacked sweeps |

The pattern: **`EduFigures` was built from the science; the band scenes were
built as texture.** The band scenes are doing the more important job — they sit
on the product pages a surgeon actually reads.

---

## Worked example: `makeAnchor` — TRIED AND REVERTED

Everything in this section describes code that **is no longer in the
repository**. Kept for the record.

### Before

Three straight lines converging on a dot inside concentric circles, with the
dot wobbling until a `lock` value reached 1. A picture of *"three things meet
at a point"* — true of a great many things, specific to none.

The band it sits behind makes a clinical argument: a small key screwed to the
skull replaces the base ring frame-based systems are built around, and the face
is left clear. The drawing said none of that.

### After

A head in sagittal section, facing left, and the argument in order:

1. **The base ring being replaced, ghosted in.** In sagittal view a stereotactic
   base ring crosses at about the supraorbital ridge — directly across the face.
   That is the point. Drawn in the rule colour, never brand blue: it is the
   thing this system does without.
2. **It fades.** What replaces it seats on the cranial vault, posterior to the
   hairline, nowhere near the orbit or the airway.
3. **Three percutaneous screws** advance along the local surface normal and stop
   in bone. Fanned, because they are not coplanar on a real skull, and they stop
   at the outer table rather than running on into the drawing.
4. **The origin resolves** once all three are home — the datum everything else on
   the frame is measured from, which is what lets the next band talk about
   targeting.

### What made it work

**The face line is lifted verbatim from `nextScene.js`** rather than redrawn, so
the two head profiles on this site are the same head.

**The vault was scaled from the face, not guessed.** The first attempt put the
occiput at `u = 0.447` and the vertex at `v = -0.505`, which drew a head half
again wider than tall — on the page it read as a speech bubble. The face fixes
the scale: forehead to chin is 0.73 units and about 18 cm, so one unit ≈ 24.6 cm.
From glabella the occiput is ~19 cm back (u ≈ 0.23) and the vertex ~22 cm above
the chin (v ≈ -0.57). That puts the head at very nearly 1:1, which is what a head
in profile is.

**Bone is drawn as a thickness, not a line** — the vault offset inward by a
plausible scalp-plus-outer-table distance. The screws have to stop *in* something.

**It is placed on the window column, not the canvas centre.** The band is three
columns — copy, empty window, photograph — and the canvas spans all of them.
Centred on the canvas the head came out half behind the text and half behind the
photograph. It now sits at ~43% of the viewport, which is where that column's
centre falls from 1024px up. Below 1024 the columns stack, so it centres, grows,
and drops to `globalAlpha` 0.55 so it reads as ground rather than competing with
the copy sitting directly on it.

**The cycle is phased for the reduced-motion still.** `ScienceBand` draws a
single frame at `t = 5.4` when `prefers-reduced-motion` is set. `SPEED = 0.157`
puts that at cyc ≈ 0.85 — key seated, screws home, ring gone. A still of the
mid-animation would show the state being argued *against*.

### What is still not claimed

Screw count comes from the product record's "percutaneous screws". **The angles,
the key's dimensions and its exact seating position are drawn to be
anatomically plausible and are not from any drawing NaviNetics has supplied.**
Nothing here is a measurement. If the real geometry arrives, `makeAnchor` is the
function to correct — the comment at the top of it says so.

---

## Proposed — NOT to be actioned without a fresh decision

The rebuild above was rejected, so treat everything below as an idea that has
already been declined once in its first form. If scene work is wanted later,
start by asking what the objection was — literal anatomy may simply be the wrong
register for this site.

In value order, were it wanted:

1. **`makeBeam`** — replace binary blocking with Beer–Lambert attenuation, so
   carbon reads as a faint density and aluminium/steel as a hard shadow. That
   *is* radiolucency; the current version cannot show a difference of degree,
   which is the entire claim the band makes.
2. **`makeSweep`** — put the electrode and the diffusion layer in frame, the way
   `RedoxFigure` does, so the current trace has a visible physical cause instead
   of being a line.
3. **`makeStim`** — stimulation and recording on one timebase with the artifact
   window, which is the actual hard problem MAVEN addresses.
4. **`makeArc` / `makeDrive` / `makeAccess`** — the remaining D1 bands, to match
   the anchor scene now that there is a head profile and a bone model to reuse.

Each needs a domain call that should not be made alone — anchor-point angles,
whether bone is drawn realistically or schematically, what the artifact window
actually looks like.

## Also worth doing

**Move `RedoxFigure` onto the MAVEN page.** It is the best figure on the site —
particles reaching an electrode with the current trace computed from the same
arrival schedule — and it currently only appears on `/resources/education`,
where it sells nothing.

## Tooling added

`tools/shot.mjs` — one screenshot of one route at a size and scroll position,
for looking at a change rather than measuring it.

```bash
node tools/shot.mjs /products/d1-stereotactic-frame 1440 900 1000 anchor
node tools/shot.mjs /products/d1-stereotactic-frame 375 812 700 anchor-mobile
```

Writes to `tools/.shots/`. Three iterations of the head geometry above were
judged from it.
