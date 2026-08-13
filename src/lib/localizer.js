/* ══════════════════════════════════════════════════════════════════════════
   The N-BAR localizer, as geometry the demo can draw.

   The rod endpoints are NOT invented and not traced off a screenshot: they
   are the same numbers the application registers against, copied from its
   `config/nbar_localization_geometry.json` — three panels, three rods each,
   two upright and one diagonal. They arrive in frame space (millimetres,
   x right-to-left, y posterior-to-anterior, z superior-to-inferior) and are
   converted here with the demo's own `fromFrame`, so if the frame origin
   convention is ever corrected both move together.

   The rails around them are proportioned from the CAD's measured bounds
   (203 × 208 × 187 mm, from tools/stl-bounds.mjs against nbar_cad_stereo.stl)
   rather than modeled from its 335k triangles, which would be several
   megabytes to ship for a shape that reads as a box.

   Colors are sampled from the application's own render, not chosen.
   ══════════════════════════════════════════════════════════════════════════ */
import { fromFrame } from './stereo.js';

/** Rod endpoints, verbatim from the application's geometry config. */
const RODS_FRAME = {
  left: {
    vertical_a: [[195.0, 159.8, 47.9], [195.0, 159.8, 153.0]],
    vertical_c: [[195.0, 39.8, 45.1], [195.0, 39.8, 150.5]],
    diagonal: [[195.0, 46.5, 46.8], [195.0, 151.5, 151.6]],
  },
  anterior: {
    vertical_a: [[160.0, 214.8, 47.9], [160.0, 214.8, 153.0]],
    vertical_c: [[40.0, 214.8, 45.1], [40.0, 214.8, 150.5]],
    diagonal: [[46.7, 214.8, 46.8], [151.7, 214.8, 151.6]],
  },
  right: {
    vertical_a: [[5.0, 159.8, 47.9], [5.0, 159.7, 153.0]],
    vertical_c: [[5.0, 39.8, 45.1], [5.0, 39.8, 150.5]],
    diagonal: [[5.0, 46.5, 46.8], [5.0, 151.5, 151.6]],
  },
};

/** Every rod as a world-space capsule. */
export const RODS = [];
for (const [panel, rods] of Object.entries(RODS_FRAME)) {
  for (const [name, [a, b]] of Object.entries(rods)) {
    RODS.push({ panel, name, a: fromFrame(a), b: fromFrame(b), r: 3.4 });
  }
}

/* ── the rails ─────────────────────────────────────────────────────────────
   Each panel is an open rectangle: the rods sit in the gap. Sized to clear
   the rods with the margin the CAD has, and given the plate thickness that
   makes them read as machined bar rather than wire. */
const BAR = 13;                 // rail cross-section, mm
const PLATE = 9;                // panel thickness along its own normal
const Y0 = -74, Y1 = 74;        // panel extent, anterior-posterior
const X0 = -74, X1 = 74;        // panel extent, left-right
const Z0 = -66, Z1 = 68;        // panel extent, superior-inferior
const SIDE_X = 95;              // where the side panels sit
const ANT_Y = 114.8;            // where the anterior panel sits

const box = (x0, y0, z0, x1, y1, z1) => ({
  lo: [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)],
  hi: [Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)],
});

export const RAILS = [];

// left and right panels: a rectangle in the y-z plane
for (const sx of [-SIDE_X, SIDE_X]) {
  const a = sx - PLATE / 2, b = sx + PLATE / 2;
  RAILS.push(box(a, Y0, Z1 - BAR, b, Y1, Z1));          // top
  RAILS.push(box(a, Y0, Z0, b, Y1, Z0 + BAR));          // bottom
  RAILS.push(box(a, Y0, Z0, b, Y0 + BAR, Z1));          // posterior upright
  RAILS.push(box(a, Y1 - BAR, Z0, b, Y1, Z1));          // anterior upright
}

// anterior panel: a rectangle in the x-z plane
{
  const a = ANT_Y - PLATE / 2, b = ANT_Y + PLATE / 2;
  RAILS.push(box(X0, a, Z1 - BAR, X1, b, Z1));
  RAILS.push(box(X0, a, Z0, X1, b, Z0 + BAR));
  RAILS.push(box(X0, a, Z0, X0 + BAR, b, Z1));
  RAILS.push(box(X1 - BAR, a, Z0, X1, b, Z1));
}

/* The head rests in the frame, so the frame has to be joined over the top —
   and in the CAD that top structure carries the pin mounts. Two rails front
   to back, two across, at the height the CAD puts them. */
const TOP_Z = 100;
for (const sx of [-SIDE_X, SIDE_X]) {
  RAILS.push(box(sx - PLATE / 2, Y0, TOP_Z - BAR / 2, sx + PLATE / 2, ANT_Y, TOP_Z + BAR / 2));
}
for (const sy of [Y0 + BAR, ANT_Y - BAR / 2]) {
  RAILS.push(box(-SIDE_X, sy - BAR / 2, TOP_Z - BAR / 2, SIDE_X, sy + BAR / 2, TOP_Z + BAR / 2));
}
/* The CAD carries four pin mounts on the top plate. They are left out: at
   this scale they are a few pixels each and rendered as a row of identical
   blocks they read as a comb sitting on the frame, which is worse than not
   drawing them. */

/* ── the detected fiducials ────────────────────────────────────────────────
   Every image plane that cuts a plate meets all three of its rods, so across
   a stack the detections accumulate into dense strings along each rod. That
   is what the application draws, and it is the whole point of the N: where
   the middle point sits between the outer two encodes the slice height. The
   spacing here is a plausible slice pitch, not a specification. */
const PITCH = 4.6;              // mm between detections along a rod
export const FIDUCIALS = [];
for (const rod of RODS) {
  const d = [rod.b[0] - rod.a[0], rod.b[1] - rod.a[1], rod.b[2] - rod.a[2]];
  const len = Math.hypot(d[0], d[1], d[2]);
  const n = Math.max(2, Math.round(len / PITCH));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    FIDUCIALS.push([
      rod.a[0] + d[0] * t,
      rod.a[1] + d[1] * t,
      rod.a[2] + d[2] * t,
    ]);
  }
}

/* One box around the whole localizer. Most of a tall 3-D pane is background,
   and testing 18 rails and 9 rods per background pixel is the bulk of the
   render for nothing — this rejects all of it in a single slab test. */
export const FRAME_LO = [Infinity, Infinity, Infinity];
export const FRAME_HI = [-Infinity, -Infinity, -Infinity];
for (const r of RAILS) {
  for (let k = 0; k < 3; k++) {
    if (r.lo[k] < FRAME_LO[k]) FRAME_LO[k] = r.lo[k];
    if (r.hi[k] > FRAME_HI[k]) FRAME_HI[k] = r.hi[k];
  }
}
for (const rod of RODS) {
  for (let k = 0; k < 3; k++) {
    FRAME_LO[k] = Math.min(FRAME_LO[k], rod.a[k] - rod.r, rod.b[k] - rod.r);
    FRAME_HI[k] = Math.max(FRAME_HI[k], rod.a[k] + rod.r, rod.b[k] + rod.r);
  }
}

/** Sampled from the application's own N-BAR render. */
export const C_RAIL = [26, 46, 62];
export const C_RAIL_LIT = [84, 91, 94];
export const C_ROD = [46, 78, 196];
export const C_FIDUCIAL = '#36eb37';
