/**
 * A synthetic head volume, re-sliced live.
 *
 * This exists so the NaviNetics AI page can show planning software working
 * rather than a screenshot of it. Nothing here is anyone's anatomy: the head
 * is generated from a handful of ellipsoids plus noise, so there is no scan
 * to de-identify and no consent to obtain.
 *
 * World coordinates are millimetres, centered on the head:
 *   +x patient right   +y anterior   +z superior
 * The frame coordinates the UI displays are derived in stereo.js.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * The two series are one geometry with two tissue palettes. Because they share
 * the model they register to each other exactly, which is what a stereo CT
 * fused to a planning MR is supposed to look like.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── value noise ───────────────────────────────────────────────────────────
   A 48³ table, built once. Sampling a table beats recomputing hashes per
   voxel by a wide margin, and every pointer move re-slices three planes.  */
const NS = 48;
const NSM = NS - 1;
const NOISE = new Float32Array(NS * NS * NS);
{
  let seed = 0x9e3779b9 >>> 0;
  for (let i = 0; i < NOISE.length; i++) {
    seed ^= seed << 13; seed >>>= 0;
    seed ^= seed >>> 17;
    seed ^= seed << 5; seed >>>= 0;
    NOISE[i] = seed / 4294967295;
  }
}

const nIdx = (i, j, k) => ((k & NSM) * NS + (j & NSM)) * NS + (i & NSM);

export function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let fx = x - xi, fy = y - yi, fz = z - zi;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  fz = fz * fz * (3 - 2 * fz);
  const c000 = NOISE[nIdx(xi, yi, zi)],         c100 = NOISE[nIdx(xi + 1, yi, zi)];
  const c010 = NOISE[nIdx(xi, yi + 1, zi)],     c110 = NOISE[nIdx(xi + 1, yi + 1, zi)];
  const c001 = NOISE[nIdx(xi, yi, zi + 1)],     c101 = NOISE[nIdx(xi + 1, yi, zi + 1)];
  const c011 = NOISE[nIdx(xi, yi + 1, zi + 1)], c111 = NOISE[nIdx(xi + 1, yi + 1, zi + 1)];
  const x00 = c000 + (c100 - c000) * fx, x10 = c010 + (c110 - c010) * fx;
  const x01 = c001 + (c101 - c001) * fx, x11 = c011 + (c111 - c011) * fx;
  const y0 = x00 + (x10 - x00) * fy, y1 = x01 + (x11 - x01) * fy;
  return y0 + (y1 - y0) * fz;
}

export const fbm = (x, y, z) =>
  vnoise(x, y, z) * 0.6 +
  vnoise(x * 2.13, y * 2.13, z * 2.13) * 0.28 +
  vnoise(x * 4.41, y * 4.41, z * 4.41) * 0.12;

/* ── head geometry ──────────────────────────────────────────────────────── */
export const HC = [0, 6, 8];        // center
export const HR = [74, 97, 84];     // scalp radii: 148 wide, 194 front-to-back
export const R_SCALP = 1.0;
export const R_BONE = 0.955;
export const R_CSF = 0.9;
export const R_BRAIN = 0.846;
export const Z_CUT = -52;           // inferior edge of the scanned volume

/**
 * Normalized ellipsoid radius, 1 at the scalp. Perturbed by low-frequency
 * noise so the contours are irregular the way a head is, rather than the
 * drawn ellipse a bare ellipsoid gives.
 */
export function headQ(x, y, z) {
  const a = (x - HC[0]) / HR[0], b = (y - HC[1]) / HR[1], c = (z - HC[2]) / HR[2];
  const q = Math.sqrt(a * a + b * b + c * c);
  return q + (fbm(x * 0.013, y * 0.013, z * 0.013) - 0.5) * 0.016;
}

const ellQ = (x, y, z, cx, cy, cz, rx, ry, rz) => {
  const a = (x - cx) / rx, b = (y - cy) / ry, c = (z - cz) / rz;
  return a * a + b * b + c * c;
};

/**
 * Cortical folding.
 *
 * Thresholding plain noise gives round blobs, which reads as static rather
 * than a brain. Two changes fix it: warp the sample point through a second,
 * lower-frequency noise field, then take a RIDGE of the result
 * (1 - |2n-1|) rather than the value itself. Ridges of a warped field are
 * long, sinuous and branching — which is what a sulcus is.
 *
 * Returns ~1 along a fold line and ~0 on a gyral crown.
 */
function foldField(x, y, z) {
  const w = 0.019, A = 32;
  const wx = x + (vnoise(x * w + 11, y * w, z * w) - 0.5) * A;
  const wy = y + (vnoise(x * w, y * w + 23, z * w) - 0.5) * A;
  const wz = z + (vnoise(x * w, y * w, z * w + 37) - 0.5) * A;
  const f = 0.082;
  return 1 - Math.abs(2 * (
    vnoise(wx * f, wy * f, wz * f) * 0.68 +
    vnoise(wx * f * 2.3, wy * f * 2.3, wz * f * 2.3) * 0.32
  ) - 1);
}

/** Distance to the corpus callosum arc, in millimetres. */
function ccDist(x, y, z) {
  if (Math.abs(x) > 26) return 99;
  const a = (y - 2) / 42, b = (z - 8) / 27;
  return Math.abs(Math.sqrt(a * a + b * b) - 1) * 34;
}

/* ── the two series ─────────────────────────────────────────────────────────
   MR values were measured off the application's own screenshots: tissue
   median 28/255, ninetieth percentile 44, brightest pixel 127. Nothing on
   that series is anywhere near white, cortical bone is the darkest tissue in
   the head, and only true CSF collections are bright.

   CT values are conventional for a head study wide enough to show bone. Note
   that several are near-inversions of the MR, which is the point.          */
export const SERIES = {
  mr: {
    key: 'mr',
    label: 'MR · T2',
    scalp: 0.108,
    skullTable: 0.026,   // cortical bone — the darkest thing in the head
    diploe: 0.075,       // brighter than the tables on MR
    csfThin: 0.1,
    grey: 0.145,
    white: 0.1,
    csfBright: 0.45,     // ventricles
    sulcus: 0.3,         // narrower, so dimmer than a ventricle
    falx: 0.045,
    falxBright: false,
    vitreous: 0.44,      // the globes are bright on T2
    nuclei: 0.145,
    grain: 0.013,
  },
  ct: {
    key: 'ct',
    label: 'CT · Stereo',
    scalp: 0.34,
    skullTable: 0.97,    // bone saturates
    diploe: 0.6,         // darker than the tables on CT
    csfThin: 0.22,
    grey: 0.47,
    white: 0.39,
    csfBright: 0.17,     // ventricles are dark
    sulcus: 0.21,
    falx: 0.62,          // often calcified
    falxBright: true,
    vitreous: 0.3,       // near water, so darker than brain
    nuclei: 0.44,
    grain: 0.03,         // quantum mottle is coarser than MR noise
  },
};

/**
 * Intensity at a point, 0..1. The renderer multiplies by 255.
 * `t` is one of the SERIES palettes above.
 */
export function sampleVol(x, y, z, t) {
  if (z < Z_CUT) return 0;
  const q = headQ(x, y, z);
  if (q >= R_SCALP) return 0;

  const nx = x * 0.055, ny = y * 0.055, nz = z * 0.055;

  if (q >= R_BONE) return t.scalp + (fbm(nx * 3, ny * 3, nz * 3) - 0.5) * 0.04;

  // Skull: two tables with diploe between them. One interpolation serves both
  // series — on MR the middle is brighter, on CT it is darker.
  if (q >= R_CSF) {
    const b = (q - R_CSF) / (R_BONE - R_CSF);
    const mid = Math.exp(-Math.pow((b - 0.5) / 0.26, 2));
    return t.skullTable + mid * (t.diploe - t.skullTable);
  }

  // The globes. The giveaway that a low axial slice is real.
  const eye = Math.min(
    ellQ(x, y, z, -31, 74, -30, 12, 12, 12),
    ellQ(x, y, z, 31, 74, -30, 12, 12, 12),
  );
  if (eye < 1) return t.vitreous * (eye > 0.72 ? 0.75 : 1);

  if (q >= R_BRAIN) return t.csfThin + (fbm(nx * 4, ny * 4, nz * 4) - 0.5) * 0.035;

  // ── brain ──
  const deep = Math.min(1, (R_BRAIN - q) / 0.085);
  let v = t.grey - deep * (t.grey - t.white) + (fbm(nx * 1.4, ny * 1.4, nz * 1.4) - 0.5) * 0.03;

  // Folding runs right through the hemisphere but only opens into visible CSF
  // near the surface; deeper in it modulates the grey/white boundary, which is
  // what gives the interior its texture instead of leaving it flat.
  const fold = foldField(x, y, z);
  const openness = Math.min(1, Math.max(0, (R_BRAIN - q) / 0.17));
  const sulcal = fold - 0.72 - openness * 0.3;
  if (sulcal > 0) {
    const m = Math.min(1, sulcal / 0.1);
    v = v * (1 - m) + t.sulcus * m;
  } else {
    v += (fold - 0.5) * 0.02 * (1 - openness * 0.5);
  }

  // deep grey nuclei — the first landmark a reader looks for at this level
  const bg = Math.min(
    ellQ(x, y, z, -18, 4, 3, 11, 16, 10),
    ellQ(x, y, z, 18, 4, 3, 11, 16, 10),
  );
  if (bg < 1) { const m = Math.min(1, (1 - bg) * 2.2) * 0.55; v = v * (1 - m) + t.nuclei * m; }

  const cc = ccDist(x, y, z);
  if (cc < 5) { const m = Math.min(1, (5 - cc) / 2.4) * 0.85; v = v * (1 - m) + (t.white - 0.012) * m; }

  const bs = ellQ(x, y, z, 0, -12, -26, 12, 14, 30);
  if (bs < 1) { const m = Math.min(1, (1 - bs) * 2.4); v = v * (1 - m) + (t.white + 0.008) * m; }

  // Cerebellum. Both limits ramp: a hard cut on either axis draws a straight
  // edge across whichever pane is parallel to it, which a real slice never has.
  const tz = Math.min(1, Math.max(0, (-16 - z) / 15));
  const ty = Math.min(1, Math.max(0, (-2 - y) / 16));
  if (tz > 0 && ty > 0) {
    const m = tz * ty;
    const fol = 1 - Math.abs(2 * vnoise(x * 0.1, y * 0.3, z * 0.3) - 1);
    v = v * (1 - m) + (t.grey - 0.012 + (fol > 0.8 ? (t.sulcus - t.grey) * 0.5 : 0)) * m;
  }

  // lateral ventricles, with a slightly irregular margin
  const wob = (fbm(nx * 2.4 + 9, ny * 2.4, nz * 2.4) - 0.5) * 0.22;
  const lv = Math.min(
    ellQ(x, y, z, -12, 2, 9, 8, 30, 11),
    ellQ(x, y, z, 12, 2, 9, 8, 30, 11),
  ) + wob;
  if (lv < 1) { const m = Math.min(1, (1 - lv) * 3.2); v = v * (1 - m) + t.csfBright * m; }

  // third ventricle — soft-edged, or it renders as a rectangle
  const t3 = ellQ(x, y, z, 0, 0, 2, 2.4, 14, 10);
  if (t3 < 1) { const m = Math.min(1, (1 - t3) * 3); v = v * (1 - m) + t.csfBright * m; }

  // The falx is the darkest thing on T2 and one of the brightest on CT, so
  // the direction of the clamp flips with the series.
  if (Math.abs(x) < 0.9 && z > 18) {
    v = t.falxBright ? Math.max(v, t.falx) : Math.min(v, t.falx);
  }

  return v;
}
