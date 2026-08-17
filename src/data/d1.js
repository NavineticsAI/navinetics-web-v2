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
    eyebrow: 'Fixation',
    title: 'Anchored to\nthe skull.',
    /* The screw passage came out at the company's request. The sentence still
       has to say what the key does, so it says it is fixed to the skull and
       carries everything else — which is the mechanism, without the detail. */
    /* THE SECOND SENTENCE IS THE DIFFERENTIATOR, AND IT WAS BURIED.
       It sat about 800 words into the education material, where a surgeon
       evaluating this page would never reach it: "Historically the frame was a
       large ring encircling the head; the NaviNetics system fixes near the top
       of the skull instead, leaving the face clear."

       It is also the model for how to differentiate WITHOUT a competitive
       claim — it compares against a historical category rather than a company,
       the same move the tables page makes against "the steel or aluminium a
       table would otherwise be built from". Nothing here names a competitor or
       asserts anything about one. */
    lead: 'The Skull Anchor Key is fixed to the skull, and everything else attaches to that. '
      + 'Historically a stereotactic frame was a ring encircling the head; this one fixes near the '
      + 'top of the skull, leaving the face clear.',
    points: [
      {
        label: 'The face stays clear.',
        /* The body used to open "Nothing crosses the facial area", which both
           restates the label and states it as an absence. The label already
           carries the fact; the body's job is why it matters. */
        body: 'It matters most in awake procedures, where the patient has to be spoken with and '
          + 'watched throughout.',
      },
      {
        /* Was: "The existing product record puts patient experience first among
           its improvements, and this is the part that delivers it." That is a
           sentence about one of our own documents — it cites the product record
           to a reader who has never seen it, and says nothing about what the
           patient experiences. Replaced with the thing itself: what is on the
           patient, and for how long. */
        label: 'Designed around comfort.',
        /* Also rewritten away from comparison. "A key at the skull rather than
           a frame around the head" measures the patient's experience against
           the thing we do not make. What they actually experience is one small
           part, in one place, for a known length of time — which is a stronger
           sentence and needs no alternative to stand next to. */
        body: 'The patient wears one small key at the skull, for as long as the procedure takes.',
      },
    ],
    /* "Percutaneous screws" came off with the rest of the screw passage. This
       row was missed in that pass because it is a meta value rather than prose. */
    meta: [{ label: 'Fixation', value: 'Anchor key' }, { label: 'Fitting', value: 'To the skull' }],
    figure: {
      src: headArt,
      w: 444, h: 1042,
      bare: true,
      alt: 'The D1 frame fitted to an anatomical head model, held clear of the face, with a probe '
        + 'on its trajectory.',
      caption: 'The frame on a head model',
    },
  },
  {
    scene: 'arc',
    ground: 'light',
    tone: 'ephys',
    eyebrow: 'Targeting',
    title: 'Arc-centered.',
    lead: 'Classified as an arc-centered stereotactic device: three linear degrees of freedom set '
      + 'the target, and two angles of rotation set how you get to it. Every approach the arc '
      + 'allows meets the same point.',
    points: [
      {
        label: 'Three linear, two angular.',
        body: 'X, Y and Z position the target; the collar and the arc choose the trajectory to it '
          + 'without moving the target.',
      },
      {
        label: 'Adjustments near the field.',
        /* Was "... close to where the work is, rather than out at the rim of a
           ring." Two problems. It defines the instrument against an unnamed
           competitor instead of describing itself — the reader is told what we
           are not, and has to already know the alternative for the sentence to
           mean anything. And it put "ring" back on the page after the term was
           removed everywhere else, which is how a retired word survives a sweep.
           Stated on its own terms, the sentence needs no comparison. */
        body: 'Every adjustment sits within reach of the surgical field, so the target is set '
          + 'from where the surgeon is already standing.',
      },
      {
        /* NO ACCURACY FIGURE ON THIS PAGE. Decided by NaviNetics, 2026-08-17.
           ────────────────────────────────────────────────────────────────
           A figure was added here and removed the same day. It is published and
           it is good — Shin, Scheitler, Sharaf et al., Operative Neurosurgery
           2025;29(1):93-101, already cited on /resources/publications, reports
           mean radial error of 0.71 +/- 0.33 mm across 32 leads in 17 patients.

           It comes off because the company does not want performance numbers on
           the published site while the work is still developing, and because
           navinetics.com states no accuracy figure either — putting one here
           would make the two sites disagree about what NaviNetics claims.

           The paper stays cited in full. A surgeon who wants the number can read
           it in its own context, with its n and its conditions, which is where a
           measured result belongs. What this page says instead is what the
           instrument does, which needs no substantiation file.

           DO NOT re-add a figure here without the company asking for it. */
        label: 'One focus, every approach.',
        body: 'Because the two rotations turn about the focus, changing the approach cannot move '
          + 'the target.',
      },
    ],
    meta: [{ label: 'Classification', value: 'Arc-centered' }, { label: 'Freedom', value: '3 linear · 2 angular' }],
    figure: {
      video: frameVideo,
      poster: framePoster,
      w: 1280, h: 720,
      alt: 'The stereotactic frame on a head model, turning, with a probe held on its trajectory '
        + 'as the arc moves around it.',
      caption: 'The arc moving through its approaches',
    },
  },
  {
    scene: 'drive',
    ground: 'bay',
    tone: 'stim',
    eyebrow: 'Advancement',
    title: 'Down the\ntrajectory.',
    lead: 'Once the arc has chosen the approach, a mechanical microdrive advances along it — '
      + 'down the line the frame has already set, rather than beside it.',
    points: [
      {
        label: 'Coaxial with the approach.',
        body: 'The drive is coaxial with the approach, so advancing does not disturb what the '
          + 'frame has already set.',
      },
      {
        label: 'Part of the kit.',
        body: 'Supplied with the frame, along with the DBS lead implantation accessories and the '
          + 'accuracy verification accessories.',
      },
    ],
    meta: [{ label: 'Drive', value: 'Mechanical' }, { label: 'Supplied', value: 'With the frame' }],
    figure: {
      src: asset('/microdrive-image-1024x797.png'),
      w: 1024, h: 797,
      alt: 'The NaviNetics mechanical microdrive.',
      caption: 'The mechanical microdrive',
    },
  },
  {
    scene: 'access',
    ground: 'light',
    tone: 'soft',
    eyebrow: 'Access',
    title: 'Room\nto work.',
    lead: 'Components attach to and detach from the Skull Anchor Key as the procedure needs them, so '
      + 'the burr hole stays reachable and the sterile field stays intact from start to finish.',
    points: [
      {
        label: 'Take it off, put it back.',
        body: 'The frame comes away from the key without losing the coordinate system the key '
          + 'defines.',
      },
      {
        label: 'Frameless size, frame workflow.',
        body: 'The record’s own claim: the workflow of a frame-based system at the size of a '
          + 'frameless one.',
      },
    ],
    meta: [{ label: 'Localizers', value: 'MR · CT · X-ray' }, { label: 'Reusable', value: 'Yes' }],
    figure: {
      src: detailArt,
      w: 759, h: 1134,
      alt: 'The D1 frame from the opposite side, rendered from the assembly CAD.',
      caption: 'The frame from the opposite side',
    },
  },
];
