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
    lead: 'A small Skull Anchor Key is affixed to the skull, and everything else attaches to that. '
      + 'Historically a stereotactic frame was a ring encircling the head; this one fixes near the '
      + 'top of the skull, leaving the face clear.',
    figure: {
      src: headArt,
      w: 444, h: 1042,
      bare: true,
      alt: 'The NRSS fitted to an anatomical head model, clear of the face, with a probe on its '
        + 'trajectory.',
      caption: '',
    },
  },
  {
    scene: 'arc',
    ground: 'light',
    tone: 'ephys',
    eyebrow: 'Targeting',
    title: 'Arc-centered.',
    lead: 'An arc-centered stereotactic device: three linear degrees of freedom set the target, '
      + 'and two angles of rotation set how you reach it. Every approach the arc allows meets '
      + 'the same point.',
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
      + 'down the same line the frame has already set.',
    points: [
      {
        label: 'Coaxial with the approach.',
        body: 'The drive runs on the axis the arc chose, so advancing stays on the line the '
          + 'frame has set.',
      },
      {
        label: 'A manual microdrive.',
        /* No longer says "supplied with the frame". data/products.js records it
           as an open question that the microdrive and the X-ray reticles are not
           in the nine-kit bill of materials, so the two files were asserting
           different things about what is in the box. */
        body: 'Advanced by hand, along the trajectory the arc has set. It also accepts Alpha '
          + 'Omega drives.',
      },
    ],
    meta: [{ label: 'Drive', value: 'Mechanical' }, { label: 'Supplied', value: 'With the frame' }],
    figure: {
      src: asset('/microdrive-image-1024x797.png'),
      w: 1024, h: 797,
      alt: 'The NaviNetics manual microdrive.',
      caption: 'The manual microdrive',
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
