/**
 * The D1 Stereotactic Frame page.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 *
 * WHERE THE PICTURE COMES FROM. The hero is not photography. It is the
 * assembly CAD — 20186_D003 REV2, a 73 MB SolidWorks AP214 STEP file —
 * tessellated to 1.7M triangles and then ray traced offline by
 * tools/d1/trace.mjs: a BVH, a cosine-weighted hemisphere per pixel for real
 * occlusion, GGX-sampled reflections, and an analytic studio environment. The
 * STEP is gitignored and never reaches the browser; what ships is one picture
 * of a mesh, which cannot be turned back into geometry. No dimension, travel,
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

import heroArt from '../assets/d1/hero.webp';
import detailArt from '../assets/d1/detail.webp';
/* Supplied photography, not a render: the frame fitted to a head model. The
   black studio ground is keyed out by tools/d1-photo.mjs so it sits on the
   band's own dark ground, like the traced images do. */
import headArt from '../assets/d1/head.webp';
/* The arc-centered band's figure is the existing video of the instrument
   turning on a head model with a probe on its trajectory — which is precisely
   what arc-centered means, and no still can show it. Same encode the education
   page uses; there is no second copy. */
import frameVideo from '../assets/education/02.1.web.mp4';
import framePoster from '../assets/education/02.1.web.poster.webp';
import { asset } from '../lib/asset.js';


/** The one render: traced at 1700 × 2430 and encoded down to this. */
export const hero = heroArt;
export const FRAME = { w: 1027, h: 1565 };

/* The same object from the other side, for the closing band. Not a second
   asset in any meaningful sense — same mesh, same studio, same tracer, one
   more camera. */
export const detail = detailArt;
export const DETAIL = { w: 759, h: 1134 };

/**
 * The four explanations, each with an abstract ground and a figure.
 *
 * Copy is paraphrased from the product record's own `sequence`, `highlights`
 * and `detail` — nothing here says more than the existing site already does.
 */
export const bands = [
  {
    scene: 'anchor',
    ground: 'bay',
    tone: 'chem',
    eyebrow: 'New mechanism',
    title: 'Anchored to\nthe skull.',
    /* Fitting detail out, on NaviNetics' instruction. The second sentence is the
       differentiator, promoted from ~800 words into the teaching material where
       a surgeon evaluating this page would never reach it — and it is the model
       for differentiating without a competitive claim, comparing against a
       historical category rather than a company. */
    lead: 'Replacing a traditional stereotactic baseframe is the Skull Anchor Key. This design '
    + 'removes all of the mechanics away from the patient’s face, improving the patients’ and '
    + 'clinicians’ experience.',
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
      video: frameVideo,
      poster: framePoster,
      w: 1280, h: 720,
      /* One-third speed, on review — half was asked to go slower still. The
         master is only 15 fps (see tools/education-video.mjs), so this already
         shows five frames a second; much below it the turn reads as a series of
         stills, and the cure for that is a higher-rate render, not a lower
         rate here. */
      rate: 0.33,
      alt: 'The stereotactic frame on a head model, turning, with a probe held on its trajectory '
        + 'as the arc moves around it.',
    },
  },
  {
    scene: 'drive',
    ground: 'bay',
    tone: 'stim',
    eyebrow: 'Advancement',
    title: 'Down the\ntrajectory.',
    /* "collar" was used twice on the whole site and defined neither time.
       One clause, so a reader is not left to infer which rotation is
       which. */
    lead: 'Once the arc and collar angles are set — the collar turning about the '
    + 'vertical axis, the arc swinging over it — a mechanical microdrive attaches to advance DBS '
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
