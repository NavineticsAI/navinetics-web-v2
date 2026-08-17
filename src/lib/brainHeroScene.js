/* ══════════════════════════════════════════════════════════════════════════
   The page hero: a brain, held still, with one track through it.

   The supplied mesh reduced to a surface point cloud, breathing between a
   dispersed cloud and a read-able surface. The tracts inside it are the SAME
   streamlines the DTI band draws — tracked through the shared field in
   tractField.js, so containment is structural rather than eyeballed and the
   two can never drift apart.

   The view is LOCKED. No orbit, no pointer-driven rotation: the pointer has a
   better job, swinging the entry point around the arc while the target stays
   put. That is the whole idea of an arc-centered frame, and it is far more
   legible when the anatomy holds still.

   Because the orientation never changes, every rotation is done once at build
   time. Per frame this touches no trigonometry for the geometry at all: the
   cloud is a scale and an add, and the tracts are pre-built paths stroked
   under a canvas transform.
   ══════════════════════════════════════════════════════════════════════════ */
import { BRAIN } from './brainShape.js';
import { buildTracts } from './tractField.js';

const TAU = Math.PI * 2;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v) => v * v * (3 - 2 * v);

/* The locked view. Three-quarter, slightly from above — enough obliquity to
   read as a volume, little enough that the midline still reads. */
const AZ = 0.58;
const EL = 0.13;

/* The entry point is confined to a quarter-turn centered on straight up, which
   is roughly the usable span of a real arc over a burr hole. Every angle in
   it lands on the same target. */
const SPAN = Math.PI / 4;

/** Decode the packed cloud once, into centered coordinates in [-0.5, 0.5]. */
function decodeCloud(b64) {
  const bin = atob(b64);
  const n = (bin.length / 3) | 0;
  const P = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) P[i] = bin.charCodeAt(i) / 255 - 0.5;
  return P;
}

export function makeBrainHero() {
  const CA = Math.cos(AZ), SA = Math.sin(AZ);
  const CE = Math.cos(EL), SE = Math.sin(EL);

  /* The one projection, in unit space. Screen is `center + unit * scale`, so
     scale and position can change per frame without redoing any of this. */
  const proj = (x, y, z) => {
    const x1 = x * CA - z * SA;
    const z1 = x * SA + z * CA;
    return [x1, y * CE - z1 * SE, y * SE + z1 * CE];
  };

  /* ── the point cloud ──────────────────────────────────────────────────── */
  const P = decodeCloud(BRAIN.points);
  const N = (P.length / 3) | 0;
  const DEPTH_BUCKETS = 7;

  const UX = new Float32Array(N);         // projected x, unit space
  const UY = new Float32Array(N);         // projected y, unit space
  const ND = new Float32Array(N);         // rotated normal depth — the cull test
  const JIT = new Float32Array(N);        // stable per-point dispersal offset
  const bucketOf = new Uint8Array(N);

  for (let i = 0; i < N; i++) {
    const j = i * 3;
    const x = P[j], y = P[j + 1], z = P[j + 2];
    const [px, py, d] = proj(x, y, z);
    UX[i] = px;
    UY[i] = py;
    bucketOf[i] = Math.min(DEPTH_BUCKETS - 1, Math.max(0, ((0.5 - d) * DEPTH_BUCKETS) | 0));
    JIT[i] = ((i * 2654435761) % 1000) / 1000;

    // Outward normal, approximated as the direction from the centroid, put
    // through the same rotation as the point — comparing an un-rotated axis
    // culls the wrong half and the shape never reads.
    const m = Math.hypot(x, y, z) || 1;
    ND[i] = proj(x / m, y / m, z / m)[2];
  }

  // Points grouped by depth once, so the frame loop never computes a bucket.
  const byDepth = [];
  for (let b = 0; b < DEPTH_BUCKETS; b++) {
    const idx = [];
    for (let i = 0; i < N; i++) if (bucketOf[i] === b) idx.push(i);
    byDepth.push(Uint16Array.from(idx));
  }

  /* ── the silhouette the tracts must stay inside ───────────────────────────
     Built from the projected cloud — the exact shape drawn below — then
     closed to seal the gaps a decimated cloud leaves, and eroded so tracts
     sit clear of the edge rather than grazing it. Bounding them by the mask
     instead let them fan past the occiput, because the mask runs wider than
     the cloud and the cloud's per-cell width is unreliable at the rim. */
  const SG = 96;                       // grid resolution
  const SH = 0.58;                     // half-extent it covers, unit space
  const sil = new Uint8Array(SG * SG);
  const scell = (x, y) => {
    const i = ((x + SH) / (2 * SH) * SG) | 0;
    const j = ((y + SH) / (2 * SH) * SG) | 0;
    return i < 0 || j < 0 || i >= SG || j >= SG ? -1 : j * SG + i;
  };
  for (let i = 0; i < N; i++) {
    const k = scell(UX[i], UY[i]);
    if (k >= 0) sil[k] = 1;
  }
  {
    const src = Uint8Array.from(sil);
    const at = (x, y) => (x < 0 || y < 0 || x >= SG || y >= SG ? 0 : src[y * SG + x]);
    for (let y = 0; y < SG; y++) for (let x = 0; x < SG; x++) {
      if (src[y * SG + x]) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) n += at(x + dx, y + dy);
      if (n >= 4) sil[y * SG + x] = 1;                       // close
    }
    const closed = Uint8Array.from(sil);
    const at2 = (x, y) => (x < 0 || y < 0 || x >= SG || y >= SG ? 0 : closed[y * SG + x]);
    for (let y = 0; y < SG; y++) for (let x = 0; x < SG; x++) {
      if (!closed[y * SG + x]) continue;
      if (at2(x - 1, y) && at2(x + 1, y) && at2(x, y - 1) && at2(x, y + 1)) continue;
      sil[y * SG + x] = 0;                                   // erode one cell
    }
  }

  /* ── the tracts ───────────────────────────────────────────────────────────
     Same field as the DTI band, tracked in the mask's own coordinates, so
     u/v/z drop straight into the projection above with no fitting. Fewer and
     shorter than the band's: here they read through a surface, and the band
     is the place to look at them properly. */
  /* Dense, because it costs nothing at run time — this is rasterized once
     into the tile below and never touched again, so the only price is a few
     milliseconds at construction. */
  const tracts = buildTracts({
    count: 520,
    max: 46,
    step: 0.0068,
    seed: 0x71c3,
    lateral: 1.2,
    // The frontal and temporal poles are narrow, so a 2.2-cell margin from
    // the surface leaves them almost unseeded. The silhouette test below is
    // what keeps tracts inside now, so the margin can be looser.
    minDepth: 1.7,
    contain: (u, v, z) => {
      const [x, y] = proj(u, v, z);
      const k = scell(x, y);
      return k >= 0 && sil[k] === 1;
    },
  });

  /* Tract geometry never changes, so it is built once into paths keyed by
     quantized direction color and depth. A frame strokes ~60 pre-built paths
     instead of walking fifteen thousand segments. */
  const QC = 4, QD = 3;
  const tractPaths = new Map();
  for (const tr of tracts) {
    let lastKey = -1;
    let lastPath = null;
    for (let k = 1; k < tr.pts.length; k++) {
      const a = tr.pts[k - 1], b = tr.pts[k];
      // Directionally-encoded color, straight off the field: red left-right,
      // green front-back, blue up-down.
      const mx = Math.max(b[2], b[3], b[4]) || 1;
      const p0 = proj(a[0], a[1], a[5]);
      const p1 = proj(b[0], b[1], b[5]);
      const qd = Math.min(QD - 1, Math.max(0, (clamp01(p1[2] + 0.5) * QD) | 0));
      const key = (((Math.round((b[2] / mx) * QC) * (QC + 1)
        + Math.round((b[3] / mx) * QC)) * (QC + 1)
        + Math.round((b[4] / mx) * QC)) * QD) + qd;

      if (key !== lastKey) {
        lastPath = tractPaths.get(key);
        if (!lastPath) { lastPath = new Path2D(); tractPaths.set(key, lastPath); }
        lastPath.moveTo(p0[0], p0[1]);
        lastKey = key;
      }
      lastPath.lineTo(p1[0], p1[1]);
    }
  }

  /* Rasterized once, into an offscreen tile.
     Tracking through the real field produces far more distinct directions
     than a handful of hand-authored families did, so the same bucketing that
     used to yield ~50 paths now yields ~300 — and 300 additive strokes over a
     full-viewport canvas costs half the frame. None of this geometry ever
     changes, so it is drawn a single time and blitted thereafter. */
  const TEX = 1280;                    // px
  const SPANU = 1.1;                   // unit-space extent the tile covers
  const tex = document.createElement('canvas');
  tex.width = TEX;
  tex.height = TEX;
  {
    const tc = tex.getContext('2d');
    tc.translate(TEX / 2, TEX / 2);
    tc.scale(TEX / SPANU, TEX / SPANU);
    tc.globalCompositeOperation = 'lighter';
    tc.lineCap = 'round';
    for (const [key, path] of tractPaths) {
      const qd = key % QD;
      const rest = (key - qd) / QD;
      const qb = rest % (QC + 1);
      const qg = ((rest - qb) / (QC + 1)) % (QC + 1);
      const qr = ((rest - qb) / (QC + 1) - qg) / (QC + 1);
      /* Gentle depth cueing only. At this azimuth "far" lines up closely with
         "anterior", so a strong front-to-back alpha ramp dims the entire
         frontal half and it reads as having no tracts at all. */
      const near = qd / (QD - 1);
      tc.strokeStyle = `rgba(${((qr / QC) * 255) | 0},${((qg / QC) * 255) | 0},`
        + `${((qb / QC) * 255) | 0},${(0.58 + near * 0.42).toFixed(3)})`;
      tc.lineWidth = (0.78 + near * 0.55) * SPANU / TEX;
      tc.stroke(path);
    }
  }

  // The target sits on the internal capsule — the same anchor the field is
  // built around, so the track ends where the bundles converge.
  const FOCUS = proj(0.03, 0.06, 0);
  const paths = new Array(DEPTH_BUCKETS);

  /**
   * @param p  scroll progress, 0 = full-bleed background, 1 = settled
   * @param pointer  {x,y} in −1..1 across the host, or null
   */
  return (ctx, w, h, t, pointer, p = 0) => {
    ctx.clearRect(0, 0, w, h);
    if (w < 4 || h < 4) return;

    /* You start inside it and scroll back out: at rest the shape is bigger
       than the viewport and reads as ground, and the settle pulls back far
       enough to see the whole silhouette. Sized off the short edge so the
       crop is the same on a wide monitor as on a laptop. */
    const e = smooth(clamp01(p));
    const REST = Math.min(w, h) * 0.80;
    const s = Math.min(w, h) * 1.55 + (REST - Math.min(w, h) * 1.55) * e;
    const cx = w * (0.52 + 0.20 * e);
    const cy = h * (0.52 - 0.02 * e);

    // 0 = dispersed cloud, 1 = closed surface
    const res = 0.5 + 0.5 * Math.sin(t * 0.2);
    const open = 1 - res;
    const cullAt = 1.2 - res * 1.2;
    const k = s;

    /* ── the cloud ─────────────────────────────────────────────────────────
       Dot size follows the scale. A fixed size over a shape half again as
       wide as the viewport spreads the same points across four times the
       area, and the surface stops reading — it goes to dust. */
    const grain = (s / REST) ** 0.8;

    for (let b = 0; b < DEPTH_BUCKETS; b++) {
      const idx = byDepth[b];
      const path = new Path2D();
      const size = (1 + (b / DEPTH_BUCKETS) * 1.6 + res * 0.7) * grain;
      for (let n = 0; n < idx.length; n++) {
        const i = idx[n];
        if (ND[i] > cullAt) continue;
        // an uneven dispersal, so the cloud comes apart rather than scaling
        // as one lump
        const kk = k * (1 + open * 0.05 * (JIT[i] - 0.5));
        path.rect(cx + UX[i] * kk, cy + UY[i] * kk, size, size);
      }
      paths[b] = path;
    }

    for (let b = 0; b < DEPTH_BUCKETS; b++) {
      const near = b / (DEPTH_BUCKETS - 1);
      ctx.fillStyle = `rgba(${(150 + near * 75) | 0},${(188 + near * 52) | 0},${(206 + near * 44) | 0},`
        + `${(0.16 + near * 0.6).toFixed(3)})`;
      ctx.fill(paths[b]);
    }

    /* ── the tracts ──────────────────────────────────────────────────────
       One blit. Brightest when the surface has opened up, so the cycle reads
       as a shape, then a way into it, then a shape again. */
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (0.34 + open * 0.55) * (0.86 + 0.14 * Math.sin(t * 0.55));
    const half = SPANU * s * 0.5;
    ctx.drawImage(tex, cx - half, cy - half, half * 2, half * 2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    /* ── the track ─────────────────────────────────────────────────────────
       The entry rides a circle centered on the target and is confined to a
       quarter-turn about vertical. Wherever it is, the track ends on the same
       point — which is the property the whole frame exists to provide. With
       no pointer it sweeps the span on its own, so this is never a dead
       control on touch. */
    const fx = cx + FOCUS[0] * s;
    const fy = cy + FOCUS[1] * s;

    let ang;
    if (pointer) {
      const hx = (pointer.x * 0.5 + 0.5) * w - fx;
      const hy = (pointer.y * 0.5 + 0.5) * h - fy;
      // measured from straight up, positive toward the right
      ang = Math.hypot(hx, hy) < 12 ? 0 : Math.atan2(hx, -hy);
    } else {
      ang = Math.sin(t * 0.22) * SPAN;
    }
    if (ang > SPAN) ang = SPAN;
    if (ang < -SPAN) ang = -SPAN;

    const vx = Math.sin(ang), vy = -Math.cos(ang);
    const R = s * 0.46;
    const ex = fx + vx * R, ey = fy + vy * R;

    // the locus the entry rides, and the span of it that can actually be used
    ctx.beginPath();
    ctx.arc(fx, fy, R, 0, TAU);
    ctx.strokeStyle = 'rgba(3,161,189,0.09)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(fx, fy, R, -Math.PI / 2 - SPAN, -Math.PI / 2 + SPAN);
    ctx.strokeStyle = 'rgba(3,161,189,0.3)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // past the target, kept faint — the track stops where it stops
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx - vx * R * 0.3, fy - vy * R * 0.3);
    ctx.strokeStyle = 'rgba(3,161,189,0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // entry → target
    const grad = ctx.createLinearGradient(ex, ey, fx, fy);
    grad.addColorStop(0, 'rgba(3,161,189,0.2)');
    grad.addColorStop(1, 'rgba(115,229,25,0.85)');
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(fx, fy);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // depth ticks along the track, so it reads as a measured advance
    const nx = -vy, ny = vx;
    ctx.strokeStyle = 'rgba(3,161,189,0.32)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 10; i++) {
      const q = i / 10;
      const tx = ex + (fx - ex) * q, ty = ey + (fy - ey) * q;
      const len = i % 5 === 0 ? 5 : 2.5;
      ctx.moveTo(tx - nx * len, ty - ny * len);
      ctx.lineTo(tx + nx * len, ty + ny * len);
    }
    ctx.stroke();

    // the entry point
    ctx.beginPath();
    ctx.arc(ex, ey, 3.4, 0, TAU);
    ctx.strokeStyle = 'rgba(115,229,25,0.75)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* ── the target: the one point every trajectory passes through ─────── */
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.1);
    ctx.beginPath();
    ctx.arc(fx, fy, 2.6, 0, TAU);
    ctx.fillStyle = `rgba(198,45,45,${(0.62 + pulse * 0.35).toFixed(3)})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx, fy, 8 + pulse * 6, 0, TAU);
    ctx.strokeStyle = `rgba(3,161,189,${(0.3 * (1 - pulse)).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  };
}
