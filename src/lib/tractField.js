/* ══════════════════════════════════════════════════════════════════════════
   The fibre-direction field, and streamlines tracked through it.

   Shared by the DTI feature band and the page hero so both draw the SAME
   bundles. The hero used to carry its own hand-placed families, which meant
   its tracts and its brain were only related by eye — and they drifted apart.
   Tracking against the mask makes containment structural: a streamline stops
   when it leaves the head, so it cannot sit outside it.

   Everything is in the mask's coordinates: u = anterior(−) to posterior(+),
   v = superior(−) to inferior(+), both in [−0.5, 0.5], and z = left-right,
   bounded by the actual lateral half-width of the mesh at that point.
   ══════════════════════════════════════════════════════════════════════════ */
import { BRAIN } from './brainShape.js';

/** Deterministic, so the same bundles are produced on every load. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

const N = BRAIN.n;

/* ── occupancy, from the sagittal mask ────────────────────────────────── */
const occ = new Uint8Array(N * N);
for (let i = 0; i < N * N; i++) {
  occ[i] = ((BRAIN.mask.charCodeAt((i / 6) | 0) - 48) >> (i % 6)) & 1;
}

/* Two-pass chamfer. Gives both how deep a point is and, through its gradient,
   which way the surface lies — used to bend fibres tangentially. */
const dist = new Float32Array(N * N);
{
  const BIG = 1e5;
  for (let i = 0; i < dist.length; i++) dist[i] = occ[i] ? BIG : 0;
  const rel = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0 : dist[y * N + x]);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!occ[y * N + x]) continue;
    dist[y * N + x] = Math.min(dist[y * N + x],
      rel(x - 1, y) + 1, rel(x, y - 1) + 1, rel(x - 1, y - 1) + 1.414, rel(x + 1, y - 1) + 1.414);
  }
  for (let y = N - 1; y >= 0; y--) for (let x = N - 1; x >= 0; x--) {
    if (!occ[y * N + x]) continue;
    dist[y * N + x] = Math.min(dist[y * N + x],
      rel(x + 1, y) + 1, rel(x, y + 1) + 1, rel(x + 1, y + 1) + 1.414, rel(x - 1, y + 1) + 1.414);
  }
}

/* ── lateral half-width, measured off the point cloud ─────────────────────
   The mask is one sagittal silhouette and says nothing about how wide the
   head is at a given place. The cloud does, so it is binned into the same
   grid and the largest |z| per cell kept. That is what keeps a lifted
   streamline inside the volume near the poles, where the brain is narrow. */
const halfW = new Float32Array(N * N);
{
  const bin = atob(BRAIN.points);
  const n = (bin.length / 3) | 0;
  for (let i = 0; i < n; i++) {
    const x = bin.charCodeAt(i * 3) / 255 - 0.5;
    const y = bin.charCodeAt(i * 3 + 1) / 255 - 0.5;
    const z = Math.abs(bin.charCodeAt(i * 3 + 2) / 255 - 0.5);
    const cx = Math.min(N - 1, Math.max(0, ((x + 0.5) * N) | 0));
    const cy = Math.min(N - 1, Math.max(0, ((y + 0.5) * N) | 0));
    const k = cy * N + cx;
    if (z > halfW[k]) halfW[k] = z;
  }
  /* Fill only cells the cloud missed from the INSIDE — a cell needs most of
     its neighbours occupied to inherit a width. Dilating outward instead
     hands interior widths to boundary cells, and a streamline that takes one
     ends up beside the head rather than in it. */
  const copy = Float32Array.from(halfW);
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
    if (copy[y * N + x] > 0) continue;
    let m = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const v = copy[(y + dy) * N + (x + dx)];
      if (v > 0) { n++; if (v > m) m = v; }
    }
    if (n >= 6) halfW[y * N + x] = m * 0.7;
  }
}

const cell = (u, v) => [((u + 0.5) * N) | 0, ((v + 0.5) * N) | 0];

/**
 * Inside the head, by BOTH accounts.
 *
 * The mask and the point cloud come out of the extractor by different paths
 * and do not have identical extents — the mask runs a little wider at the
 * poles. The hero draws the cloud, so a streamline allowed only by the mask
 * ends up beside the visible shape. Requiring both is what keeps the tracts
 * and the brain locked together.
 */
export const inside = (u, v) => {
  const [x, y] = cell(u, v);
  if (x < 0 || y < 0 || x >= N || y >= N) return false;
  return occ[y * N + x] === 1 && halfW[y * N + x] > 0;
};

export const depthAt = (u, v) => {
  const [x, y] = cell(u, v);
  return x < 0 || y < 0 || x >= N || y >= N ? 0 : dist[y * N + x];
};

/**
 * How far off the midline a fibre may sit at (u, v).
 *
 * Two corrections on top of the measured width. A boundary cell holds the
 * largest |z| anywhere in it, which near the poles is much wider than the
 * head actually is there; and the head thins towards its surface in every
 * direction, not only in the sagittal plane. Tapering by distance-to-surface
 * handles both, and is why tracts stay inside the silhouette instead of
 * fanning past the occiput.
 */
export const halfWidthAt = (u, v) => {
  const [x, y] = cell(u, v);
  if (x < 0 || y < 0 || x >= N || y >= N) return 0;
  const taper = Math.min(1, dist[y * N + x] / 4);
  return halfW[y * N + x] * taper;
};

/* ── smooth 2D noise, for organic wander ──────────────────────────────── */
function makeNoise(seed) {
  const S = 64, T = new Float32Array(S * S);
  const rr = rng(seed);
  for (let i = 0; i < T.length; i++) T[i] = rr();
  const at = (x, y) => T[(y & (S - 1)) * S + (x & (S - 1))];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    let fx = x - xi, fy = y - yi;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * fx;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * fx;
    return a + (b - a) * fy;
  };
}
const nBend = makeNoise(0x9131);
const nDepth = makeNoise(0x37ab);

const ANCHOR = [0.03, 0.06];        // internal capsule

/**
 * The local principal direction — a LINE field, so its sign carries no
 * meaning and tracking has to maintain continuity itself.
 */
export function fieldAt(u, v) {
  const du = u - ANCHOR[0], dv = v - ANCHOR[1];
  const rad = Math.hypot(du, dv) || 1e-4;
  const rx = du / rad, ry = dv / rad;

  // How far above the capsule we are. The corona radiata occupies a broad
  // superior region, not a narrow column — too tight a corridor and the whole
  // field collapses onto the association regime.
  const superior = Math.max(0, -dv / 0.42);

  // projection fibres: radial from the capsule, fanning upward
  const corridor = Math.exp(-((du / 0.27) ** 2));
  const wProj = corridor * (0.35 + 1.5 * Math.min(1, rad / 0.26)) * (0.45 + superior * 1.15);

  // association fibres: front to back, everywhere the corridor is weak
  const wAssoc = (1 - corridor * 0.72) * (0.5 + 0.6 * Math.min(1, (v + 0.22) / 0.5));

  // callosal arc: tangential, in a ring riding over the ventricle
  const wArc = Math.exp(-(((rad - 0.19) / 0.1) ** 2)) * Math.max(0, -dv / 0.26) * 1.3;

  let dx = rx * wProj + wAssoc - ry * wArc;
  let dy = ry * wProj + rx * wArc;

  // low-frequency wander, so no two neighbours run exactly parallel
  const ang = (nBend(u * 5.5 + 4, v * 5.5 + 2) - 0.5) * 1.15;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  [dx, dy] = [dx * ca - dy * sa, dx * sa + dy * ca];

  // near the surface, drop the outward component so fibres turn to run along
  // the cortex rather than straight into it
  const d = depthAt(u, v);
  if (d < 4.5) {
    const e = 0.7 / N;
    const gx = depthAt(u + e, v) - depthAt(u - e, v);
    const gy = depthAt(u, v + e) - depthAt(u, v - e);
    const gm = Math.hypot(gx, gy);
    if (gm > 1e-6) {
      const nx = gx / gm, ny = gy / gm;          // points inward
      const dot = dx * nx + dy * ny;
      if (dot < 0) {
        const k = 1 - d / 4.5;
        dx -= nx * dot * k;
        dy -= ny * dot * k;
      }
    }
  }

  // Left-right component: strongest where fibres cross the midline, and in
  // the cortical splay. Scaled to actually compete with the in-plane terms —
  // otherwise it never dominates and nothing in the field reads red.
  const dz = (nDepth(u * 4.5 + 9, v * 4.5) - 0.5) * 2.7
    * (0.34 + wArc * 1.1 + Math.min(1, rad / 0.32) * 0.5);

  const m = Math.hypot(dx, dy, dz) || 1;
  return [dx / m, dy / m, dz / m];
}

/**
 * Track streamlines through the field, both ways from each seed.
 *
 * Each point is `[u, v, |dz|, |du|, |dv|, z]` — the three magnitudes are the
 * directionally-encoded colour (red left-right, green front-back, blue
 * up-down) and `z` is the lateral position, integrated along the run and
 * held inside the mesh's own width.
 */
export function buildTracts({
  count = 420, max = 46, step = 0.0062, seed = 0x2c41, lateral = 1, contain = null,
  minDepth = 2.2,
} = {}) {
  const r = rng(seed);
  /* `contain` is an extra, caller-supplied test in 3D. The hero passes one
     that projects the point and checks it against the silhouette it actually
     draws — the only way to guarantee a tract is never drawn outside the
     brain, because the decimated cloud is sparse and asymmetric near the
     edges and its per-cell width can license a point the surface does not
     back up. */
  const ok = contain
    ? (u, v, z) => inside(u, v) && contain(u, v, z)
    : (u, v) => inside(u, v);

  const track = (su, sv, sz) => {
    const fwd = [], bwd = [];
    for (const sign of [1, -1]) {
      let u = su, v = sv, z = sz;
      let prev = null;
      const out = sign > 0 ? fwd : bwd;
      for (let k = 0; k < max; k++) {
        let d = fieldAt(u, v);
        // A line field has no sign. Without this the streamline reverses at
        // random and collapses into a scribble.
        if (prev && d[0] * prev[0] + d[1] * prev[1] + d[2] * prev[2] < 0) {
          d = [-d[0], -d[1], -d[2]];
        }
        if (!prev) d = [d[0] * sign, d[1] * sign, d[2] * sign];
        const nu = u + d[0] * step, nv = v + d[1] * step;
        // Lateral position follows the field's own left-right component, then
        // is held inside the width actually measured at that place.
        const lim = halfWidthAt(nu, nv) * 0.92;
        let nz = z + d[2] * step * lateral;
        if (nz > lim) nz = lim;
        if (nz < -lim) nz = -lim;
        if (!ok(nu, nv, nz)) break;
        out.push([nu, nv, Math.abs(d[2]), Math.abs(d[0]), Math.abs(d[1]), nz]);
        u = nu; v = nv; z = nz; prev = d;
      }
    }
    bwd.reverse();
    const pts = bwd.concat([[su, sv, 0, 1, 0, sz]], fwd);
    return pts.length > 8 ? { pts, seed: bwd.length, phase: r() } : null;
  };

  const tracts = [];
  let guard = 0;
  while (tracts.length < count && guard++ < 200000) {
    const u = r() - 0.5, v = r() - 0.5;
    if (depthAt(u, v) < minDepth) continue;
    if (v > 0.3 && r() > 0.35) continue;            // thin out the brainstem
    // Seed across the width, not only on the midline, so the bundle has body.
    const sz = (r() * 2 - 1) * halfWidthAt(u, v) * 0.85;
    if (!ok(u, v, sz)) continue;
    const t = track(u, v, sz);
    if (t) tracts.push(t);
  }
  return tracts;
}
