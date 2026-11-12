/**
 * The D1 Stereotactic Frame page.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 *
 * WHERE THE PICTURES COME FROM. Neither is photography. Both are the assembly
 * CAD — 20186_D003 REV2, a 73 MB SolidWorks AP214 STEP file — rendered
 * offline: the hero in Blender Cycles, and the "Room to work." detail by
 * tools/d1/trace.mjs, which tessellates it to 1.7M triangles and ray traces
 * it (a BVH, a cosine-weighted hemisphere per pixel for real occlusion,
 * GGX-sampled reflections, an analytic studio environment). The STEP is
 * gitignored and never reaches the browser; what ships is pictures of a mesh,
 * which cannot be turned back into geometry. No dimension, travel,
 * angle or tolerance from that file appears anywhere on the page.
 *
 * ONE RENDER, STILL. The hero does not rotate, settle or arrive. It is simply
 * there, correct at first paint — so the entire quality budget goes into a
 * single image instead of being divided across frames that only ever exist in
 * motion.
 *
 * NOTHING IN THE FIGURE IS NAMED, and that is deliberate. The tool can
 * separate the assembly into six groups and light any of them independently —
 * that machinery still exists in tools/d1/render.mjs — but the page does not
 * label them. The CAD names its parts by internal drawing number
 * (20186-9_D0014 REV3 and the like), which is neither public nor meaningful,
 * and every mapping from those to a component name would be an inference of
 * mine rather than something NaviNetics has stated. So the hero shows the
 * instrument and says nothing about which piece is which.
 *
 * NOT HERE, deliberately:
 *   · Any accuracy or precision figure. None appears on the existing site and
 *     none is invented here — that is a regulated claim.
 *   · Any setup time, and any comparison with another manufacturer's frame.
 *   · Any dimension, even though the renders are to scale.
 *   · Regulatory status, which the product record does not state.
 *   · The accessory tray that sits beside the frame in the assembly. It was
 *     dropped at your request and is in none of the renders.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* The hero is a Blender Cycles render of the same STEP: 192 samples, a 2400 ×
   2600 RGBA master (NRSS_hero_2400x2600.png, gitignored like the STEP),
   cropped to its own alpha and encoded at full resolution as WebP q90 —
   1790 × 2466, about 195 kB. It replaced tools/d1-frame.mjs's traced hero on
   2026-11-11; "Room to work." below still uses that tool's detail render. */
import heroArt from '../assets/d1/nrss-hero.webp';
import detailArt from '../assets/d1/detail.webp';
/* Supplied photography, not a render: the frame fitted to a head model. The
   black studio ground is keyed out by tools/d1-photo.mjs so it sits on the
   band's own dark ground, like the traced images do. */
import headArt from '../assets/d1/head.webp';
/* The arc-centered band's figure is the axis-motion clip from the same Blender
   job as the hero, replacing the education page's head-model turntable here on
   2026-11-12 (the education page keeps that one). It is the delivered file
   byte for byte (NRSS_axis_motion_preview_on_03101A.mp4, gitignored beside it):
   H.264 High 4.0, 1200 × 1300, 30 fps, 15 s, 6.1 MB, moov first so it streams.
   A browser re-encode through tools/education-video.mjs got it to 1.4 MB and
   went blocky the moment anything moved, smearing the engraving, so it ships
   as delivered. preload="none" means none of it loads until the band is on
   screen. The poster is its first frame. */
import axisVideo from '../assets/d1/axis-motion.mp4';
import axisPoster from '../assets/d1/axis-motion.poster.webp';
import { asset } from '../lib/asset.js';


/** The one render, at its encoded size. The microdrive rod runs off the top
    edge on purpose; D1Hero fades it out. */
export const hero = heroArt;
export const FRAME = { w: 1790, h: 2466 };

/* The same object from the other side, for the closing band. Not a second
   asset in any meaningful sense — same mesh, same studio, same tracer, one
   more camera. */
export const detail = detailArt;
export const DETAIL = { w: 759, h: 1134 };

/**
 * The four explanations, each with a figure. Two of them - "Arc-centered."
 * and "Down the trajectory." - also carry an abstract animated ground;
 * "Anchored to the skull." and "Room to work." lost theirs on review.
 *
 * Copy is paraphrased from the product record's own `sequence`, `highlights`
 * and `detail` — nothing here says more than the existing site already does.
 */
export const bands = [
  {
    /* NO SCENE - the 'anchor' animation came off on the animation audit,
       2026-10-27. Its own header in lib/d1Scenes.js describes it: "Screws come
       in from three directions and tighten". That is the fitting detail
       NaviNetics had already cut from this band's copy, and it showed THREE
       screws, a count the site never states. Nothing in it showed what the
       lead now says - that the key replaces the baseframe and keeps the
       mechanics off the face - and on a phone its lines crossed three lines
       of the lead under a scrim of about 0.13: the same unlabelled-callout
       look "Room to work." was removed for. */
    ground: 'bay',
    tone: 'chem',
    eyebrow: 'New mechanism',
    title: 'Anchored to\nthe skull.',
    /* Fitting detail out, on NaviNetics' instruction. The second sentence is the
       differentiator, promoted from ~800 words into the teaching material where
       a surgeon evaluating this page would never reach it — and it is the model
       for differentiating without a competitive claim, comparing against a
       historical category rather than a company.

       REWORDED 2026-11-11 for readability, same points and no new claim. It
       read: "Our skull anchor key replaces a traditional stereotactic
       baseframe. This design removes all of the mechanics away from the
       patient’s face, improving the patients’ and clinicians’ experience." -
       Aditya Kulkarni's edit in the shared document (11 Nov, published
       12 Nov) to Steve Goerss's wording (15 and 23 Oct), whose ending came
       from a signed-out reviewer (21 Oct). Steve's opened: "Replacing a
       traditional stereotactic baseframe is the Skull Anchor Key." This
       keeps Aditya's "Our", and capitalizes the name as the rest of the
       site does. */
    lead: 'Our Skull Anchor Key replaces a traditional stereotactic baseframe. It moves all of '
    + 'the mechanics away from the patient’s face, improving the experience for patients and '
    + 'clinicians.',
    figure: {
      src: headArt,
      w: 444, h: 1042,
      bare: true,
      alt: 'The NRSS fitted to an anatomical head model, clear of the face, with a probe on its '
        + 'trajectory.',
    },
  },
  {
    scene: 'arc',
    ground: 'light',
    tone: 'ephys',
    eyebrow: 'Targeting',
    title: 'Arc-centered.',
    /* NO ACCURACY FIGURE ON THIS PAGE. Decided by NaviNetics, 2026-08-17.
       ────────────────────────────────────────────────────────────────────
       A figure was added to this band and removed the same day. It is published
       and it is good — Shin, Scheitler, Sharaf et al., Operative Neurosurgery
       2025;29(1):93-101, already cited on /resources/publications, reports mean
       radial error of 0.71 +/- 0.33 mm across 32 leads in 17 patients.

       It comes off because the company does not want performance numbers on the
       published site while the work is still developing, and because
       navinetics.com states no accuracy figure either — putting one here would
       make the two sites disagree about what NaviNetics claims.

       DO NOT re-add a figure here without the company asking for it. */
    lead: 'An arc-centered stereotactic device: three linear degrees of freedom set the target, and '
    + 'two angles of rotation set how you reach it.',
    figure: {
      video: axisVideo,
      poster: axisPoster,
      w: 1200, h: 1300,
      /* Rendered on the hero's own ground (#03101A), so it goes on a plate of
         that colour rather than white: the clip's background and the plate
         meet without an edge. Portrait, so it is capped like the cut-outs and
         centred; the plate keeps the column's width either side of it. */
      plate: 'bay',
      cap: 'plate',
      /* No `rate`. The head-model clip ran at a third of its speed because it
         was a 15 fps turntable; this one is 30 fps and paced by the render. */
      alt: 'The NRSS rendered from its assembly CAD, moving through its axes: the stage '
        + 'shifting, and the microdrive swinging along the arc to new trajectories.',
    },
  },
  {
    scene: 'drive',
    ground: 'bay',
    tone: 'stim',
    eyebrow: 'Advancement',
    title: 'Down the\ntrajectory.',
    /* Steve Goerss's wording from the 19 Oct review, restored 2026-11-11.
       PR #10 had added "the collar turning about the vertical axis, the arc
       swinging over it", which contradicts the convention NaviNetics
       confirmed in src/lib/stereo.js: the collar turns about the
       left-right axis. Define "collar" only in wording NaviNetics
       supplies. */
    lead: 'Once the arc and collar values are set, a mechanical microdrive attaches to advance DBS '
    + 'leads and micro-recording electrodes to the target.',
    figure: {
      src: asset('/microdrive-image-1024x797.png'),
      w: 1024, h: 797,
      alt: 'The NaviNetics manual microdrive.',
    },
  },
  {
    /* NO SCENE - the 'access' animation came off on NaviNetics' instruction
       2026-10-26. It drew pale blocks floating around the frame cut-out, which
       on this light ground read as empty callouts rather than as access to the
       field; the layout audit found the same three blocks (x 112-312,
       y ~3344-3519 on phone) and called them that. ScienceBand renders a band
       with no scene as copy and figure only. 'access' itself is still in
       lib/d1Scenes.js and unreferenced. */
    ground: 'light',
    tone: 'soft',
    eyebrow: 'Access',
    title: 'Room\nto work.',
    /* Was "…and the The compact design provides easy access to  the surgical
       field." — doubled "the", a doubled space, and a singular verb on a
       compound subject. */
    lead: 'The Skull Anchor Key and the compact design provide easy access to the surgical '
    + 'field.',
    figure: {
      src: detailArt,
      w: 759, h: 1134,
      /* A tall cut-out with its own alpha, so it goes unplated. On a plate it
         filled the column and stood about 840px high, well over twice the
         plated figures above it; reduced on review to match them, so it takes
         the `plate` cap — about the microdrive plate's height — rather than the
         head model's taller one. */
      bare: true,
      cap: 'plate',
      alt: 'The NRSS frame from the opposite side, rendered from the assembly CAD.',
    },
  },
];

/* On review, every band lost its bullet points, its chips ("Classification ·
   Arc-centered", "Freedom · 3 linear · 2 angular", "Drive · Mechanical",
   "Supplied · With the frame", "Localizers · MR · CT · X-ray", "Reusable ·
   Yes") and its figure caption. ScienceBand renders each only when present, so
   leaving them out is the whole change. */
