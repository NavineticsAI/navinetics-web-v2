/**
 * The D1 Stereotactic Frame page.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 *
 * WHERE THE PICTURES COME FROM. The hero is not photography. It is the
 * assembly CAD — 20186_D003 REV2, a 73 MB SolidWorks AP214 STEP file —
 * tessellated and rendered offline by tools/d1-frame.mjs. The STEP itself is
 * gitignored and never reaches the browser; what ships is a turntable of
 * pictures of a mesh, which cannot be turned back into geometry. No dimension,
 * travel, angle or tolerance from that file appears anywhere on the page.
 *
 * WHAT THE CALLOUTS ARE NAMED. Every name below is taken verbatim from the
 * `components` list on the product record, which came from NaviNetics' own
 * public site. They are NOT read out of the CAD: the file names its parts by
 * internal drawing number (20186-9_D0014 REV3 and the like), and those are
 * neither public nor meaningful to a reader.
 *
 * ONE MAPPING NEEDS CONFIRMING. Two of the three are certain — the graduated
 * lead-screw column is the Mechanical Microdrive, and the arc, rails and stage
 * together are the Stereotactic Head Frame. The third, `anchor`, is the flat
 * plate group at the base of the assembly, and calling it the Skull Anchor Key
 * is an inference from position rather than something the file states. If it
 * is wrong, change the label here; the geometry grouping is in the tool.
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

/* Vite resolves the turntable at build time. Sorted because glob order is not
   guaranteed and the frames are an animation — one out of place is a stutter. */
const frames = import.meta.glob('../assets/d1/turn/f*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});
export const turntable = Object.keys(frames).sort().map((k) => frames[k]);

const stills = import.meta.glob('../assets/d1/turn/hl-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});
const still = (id) => stills[`../assets/d1/turn/hl-${id}.webp`];

/** The rendered frame is 673 × 960; the hero needs the ratio to lay out. */
export const FRAME = { w: 673, h: 960 };

/**
 * What the settled hero names.
 *
 * Three, not four, because three is how many component names the geometry
 * actually supports. A fourth would have been a label invented to fill a slot.
 */
export const callouts = [
  {
    id: 'frame',
    name: 'Stereotactic Head Frame',
    note: 'The arc, the rails and the targeting stage — one component.',
    src: still('frame'),
  },
  {
    id: 'microdrive',
    name: 'Mechanical Microdrive',
    note: 'The graduated column on the trajectory.',
    src: still('microdrive'),
  },
  {
    id: 'anchor',
    name: 'Skull Anchor Key',
    note: 'What the whole assembly hangs from.',
    src: still('anchor'),
  },
];

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
    title: 'A key,\nnot a ring.',
    lead: 'In place of the head ring that frame-based systems are built around, a small anchor key '
      + 'is affixed to the skull with percutaneous screws. Everything else attaches to that.',
    points: [
      {
        label: 'The face stays clear.',
        body: 'Nothing crosses the facial area, which matters most in awake procedures where the '
          + 'patient has to be spoken with and watched.',
      },
      {
        label: 'Designed around comfort.',
        body: 'The existing product record puts patient experience first among its improvements, '
          + 'and this is the part that delivers it.',
      },
    ],
    meta: [{ label: 'Fixation', value: 'Anchor key' }, { label: 'Fitting', value: 'Percutaneous screws' }],
    figure: {
      src: '/model-head-clean-750x998-1-451x600.png',
      w: 451, h: 600,
      alt: 'The NaviNetics skull anchor key fitted to an anatomical head model.',
      caption: 'The anchor key on a model',
    },
  },
  {
    scene: 'arc',
    ground: 'light',
    tone: 'ephys',
    eyebrow: 'Targeting',
    title: 'Arc-centred.',
    lead: 'Classified as an arc-centred stereotactic device: three linear degrees of freedom set '
      + 'the target, and two angles of rotation set how you get to it. Every approach the arc '
      + 'allows meets the same point.',
    points: [
      {
        label: 'Three linear, two angular.',
        body: 'X, Y and Z position the target; the ring and the arc choose the trajectory to it '
          + 'without moving the target.',
      },
      {
        label: 'Adjustments near the field.',
        body: 'The compact design puts every adjustment close to where the work is, rather than '
          + 'out at the rim of a ring.',
      },
    ],
    meta: [{ label: 'Classification', value: 'Arc-centred' }, { label: 'Freedom', value: '3 linear · 2 angular' }],
    figure: {
      src: '/DSC05397-1024x695.jpg',
      w: 1024, h: 695,
      alt: 'The NaviNetics stereotactic frame assembly.',
      caption: 'The frame assembly',
    },
  },
  {
    scene: 'drive',
    ground: 'bay',
    tone: 'stim',
    eyebrow: 'Advancement',
    title: 'Down the\ntrajectory.',
    lead: 'A mechanical microdrive sits on the trajectory the arc has chosen and advances along '
      + 'it — the graduated column that rises out of the middle of the hero.',
    points: [
      {
        label: 'On the line, not beside it.',
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
      src: '/microdrive-image-1024x797.png',
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
    lead: 'Components attach to and detach from the anchor key as the procedure needs them, so '
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
    meta: [{ label: 'Localisers', value: 'MR · CT · X-ray' }, { label: 'Reusable', value: 'Yes' }],
    figure: {
      src: turntable[Math.round(turntable.length * 0.62)],
      w: FRAME.w, h: FRAME.h,
      alt: 'The D1 frame seen from behind, rendered from the assembly CAD.',
      caption: 'The same assembly, turned',
    },
  },
];
