/**
 * Arc-centred stereotactic geometry.
 *
 * The target sits at the focus of the arc; two rotations set the approach to
 * it. Angles are DERIVED from entry and target — that is how the application
 * behaves, and why its panel offers "Update Entry" and "Update Target" rather
 * than angle fields you type into. The steppers drive the inverse.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CONVENTION — confirmed by NaviNetics.
 *
 *   Arc 0    points to the patient's RIGHT.
 *   Collar 0 points ANTERIOR; positive Collar swings toward superior.
 *
 *     u = [ cos(arc), sin(arc)·cos(collar), sin(arc)·sin(collar) ]
 *
 * where u runs from target toward entry in world axes (+x right, +y anterior,
 * +z superior). Checked against the application: Arc 106.3° / Collar 40.9°
 * yields (-0.281, +0.726, +0.629) — left, anterior, superior — which is where
 * the entry marker sits in its coronal and sagittal views.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { HC, HR } from './volume.js';

const RAD = Math.PI / 180;

export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a) => Math.hypot(a[0], a[1], a[2]);
export const unit = (a) => { const n = norm(a) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };

export function dirFromAngles(arcDeg, collarDeg) {
  const t = arcDeg * RAD, f = collarDeg * RAD, st = Math.sin(t);
  return [Math.cos(t), st * Math.cos(f), st * Math.sin(f)];
}

export function anglesFromDir(u) {
  return {
    arc: Math.acos(Math.max(-1, Math.min(1, u[0]))) / RAD,
    collar: Math.atan2(u[2], u[1]) / RAD,
  };
}

/* ── frame coordinates ─────────────────────────────────────────────────────
   Origin at the top posterior superior corner of the frame space, with
   +X to the patient's LEFT, +Y ANTERIOR, +Z INFERIOR. World is centred on the
   head, so the two differ by a sign and an offset.                        */
export const FRAME_MID = 100;
export const toFrame = (p) => [FRAME_MID - p[0], FRAME_MID + p[1], FRAME_MID - p[2]];
export const fromFrame = (f) => [FRAME_MID - f[0], f[1] - FRAME_MID, FRAME_MID - f[2]];

/** Where a ray leaving the target in direction u crosses the scalp. */
export function scalpHit(T, u) {
  const ox = (T[0] - HC[0]) / HR[0], oy = (T[1] - HC[1]) / HR[1], oz = (T[2] - HC[2]) / HR[2];
  const dx = u[0] / HR[0], dy = u[1] / HR[1], dz = u[2] / HR[2];
  const a = dx * dx + dy * dy + dz * dz;
  const b = 2 * (ox * dx + oy * dy + oz * dz);
  const c = ox * ox + oy * oy + oz * oz - 1;
  const disc = b * b - 4 * a * c;
  const t = disc <= 0 ? 70 : (-b + Math.sqrt(disc)) / (2 * a);
  return [T[0] + u[0] * t, T[1] + u[1] * t, T[2] + u[2] * t];
}

/**
 * Everything the views and the readouts need, from the three pieces of state
 * that actually define a plan: target, entry, and where the probe sits along
 * the track.
 */
export function buildGeometry({ target, entry, cursor, pos }) {
  const d = [entry[0] - target[0], entry[1] - target[1], entry[2] - target[2]];
  const len = norm(d) || 1;
  const u = [d[0] / len, d[1] / len, d[2] / len];
  const { arc, collar } = anglesFromDir(u);

  const fromEntry = pos * len;
  const tip = [
    entry[0] - u[0] * fromEntry,
    entry[1] - u[1] * fromEntry,
    entry[2] - u[2] * fromEntry,
  ];

  // orthonormal basis for the probe's-eye plane
  let v1 = cross(u, [0, 0, 1]);
  if (norm(v1) < 1e-4) v1 = cross(u, [0, 1, 0]);
  v1 = unit(v1);

  return { T: target, E: entry, C: cursor, u, len, arc, collar, tip, fromEntry, v1, v2: unit(cross(u, v1)) };
}
