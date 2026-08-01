/**
 * Canvas drawing for the planning viewports.
 *
 * Two canvases per pane: a slice canvas that only re-renders when its plane
 * moves, and a cheap vector overlay redrawn every frame. Slices render at half
 * resolution and upscale — real slice data is soft, so it reads correctly and
 * keeps a four-pane redraw inside a frame.
 */
import { HC, HR, R_BRAIN, Z_CUT, fbm, sampleVol } from './volume.js';
import { cross, unit } from './stereo.js';
import {
  C_FIDUCIAL, C_RAIL, C_ROD, FIDUCIALS, FRAME_HI, FRAME_LO, RAILS, RODS,
} from './localizer.js';

export const FOV = 210;        // mm across the taller axis of an orthogonal pane
export const FOV_PROBE = 96;

/**
 * Display convention, confirmed against the application: radiological for
 * axial and coronal — the patient's right on the viewer's left — and sagittal
 * shown with anterior to the left.
 */
export const VIEWS = {
  coronal: { h: [-1, 0, 0], v: [0, 0, 1], labels: ['R', 'L', 'S', 'I'] },
  sagittal: { h: [0, -1, 0], v: [0, 0, 1], labels: ['A', 'P', 'S', 'I'] },
  axial: { h: [-1, 0, 0], v: [0, 1, 0], labels: ['R', 'L', 'A', 'P'] },
};

/** The orthogonal panes are centred on the CURSOR, not the target. */
export function planeBasis(view, geo) {
  if (view === 'probe') return { h: geo.v1, v: geo.v2, o: geo.tip, fov: FOV_PROBE };
  const b = VIEWS[view];
  return { h: b.h, v: b.v, o: geo.C, fov: FOV };
}

/* ── slices ────────────────────────────────────────────────────────────── */

export function renderSlice(cv, view, geo, tis, draft = false) {
  const w = cv.width, h = cv.height;
  if (!w || !h) return;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;

  const B = planeBasis(view, geo);
  const mm = B.fov / h;
  const [hx, hy, hz] = B.h;
  const [vx, vy, vz] = B.v;
  const [ox, oy, oz] = B.o;

  const step = draft ? 2 : 1;
  let grain = 0x2545f491;

  for (let py = 0; py < h; py += step) {
    const b = (h / 2 - py - 0.5) * mm;
    for (let px = 0; px < w; px += step) {
      const a = (px - w / 2 + 0.5) * mm;
      let s = sampleVol(ox + hx * a + vx * b, oy + hy * a + vy * b, oz + hz * a + vz * b, tis);
      if (s > 0) {
        grain ^= grain << 13; grain >>>= 0;
        grain ^= grain >>> 17;
        grain ^= grain << 5; grain >>>= 0;
        s += (grain / 4294967295 - 0.5) * tis.grain;
      }
      const g = s <= 0 ? 0 : s >= 1 ? 255 : (s * 255) | 0;
      for (let by = 0; by < step && py + by < h; by++) {
        let i = ((py + by) * w + px) * 4;
        for (let bx = 0; bx < step && px + bx < w; bx++, i += 4) {
          d[i] = g; d[i + 1] = g; d[i + 2] = g; d[i + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

/* ── 3D surface ────────────────────────────────────────────────────────── */

/**
 * Millimetres per CSS pixel for the 3D pane. Derived from BOTH dimensions so
 * the head is never cropped in a narrow pane, and shared by the render and
 * the overlay so the trajectory lands on the anatomy.
 */
/* Wide enough for the localiser, not just the head: the frame is 203 mm
   across and 208 deep, so a three-quarter view needs about 300 mm of field
   before the corners start clipping. */
export const mm3d = (cssW, cssH) => Math.max(300 / cssW, 370 / cssH);

const RAD = Math.PI / 180;

export function camRot(p, cam) {
  const ca = Math.cos(cam.az * RAD), sa = Math.sin(cam.az * RAD);
  const X = p[0] * ca - p[1] * sa, Y0 = p[0] * sa + p[1] * ca, Z0 = p[2];
  const ce = Math.cos(cam.el * RAD), se = Math.sin(cam.el * RAD);
  return [X, Y0 * ce - Z0 * se, Y0 * se + Z0 * ce];
}

function camUnrot(p, cam) {
  const ce = Math.cos(-cam.el * RAD), se = Math.sin(-cam.el * RAD);
  const X = p[0], Y0 = p[1] * ce - p[2] * se, Z0 = p[1] * se + p[2] * ce;
  const ca = Math.cos(-cam.az * RAD), sa = Math.sin(-cam.az * RAD);
  return [X * ca - Y0 * sa, X * sa + Y0 * ca, Z0];
}

/* ── the head ──────────────────────────────────────────────────────────────
   A plain ellipsoid read as an egg, which is not what a surface
   reconstruction looks like. This deforms it toward a cranium: tapered where
   the neck would be, a little flatter across the front, and carrying an
   occipital bulge. Deliberately smooth and featureless — the eventual
   replacement is a DEFACED render of a real volume, so adding a face here
   would be building the wrong thing.

   `shape` is a radius multiplier over the unit sphere in normalised head
   space. It never exceeds 1, so the deformed surface lies inside the base
   ellipsoid and the analytic hit is a safe place to start marching from. */
function shape(ux, uy, uz) {
  const inf = uz < 0 ? -uz : 0;          // toward the neck
  const ant = uy > 0 ? uy : 0;           // toward the face
  /* Two rules only, and both deliberately vanish at the crown.
     `scalpHit` puts entry points on the UNDEFORMED ellipsoid, so any inset up
     there would leave the entry marker hovering off the surface it is
     supposed to sit on. Superior stays exactly 1; the shaping is all in the
     lower half, which is where the difference between an egg and a head
     actually lives. */
  let r = 1;
  r -= inf * inf * 0.30;                          // taper down to the neck
  r -= ant * ant * ant * (0.03 + inf * 0.35);     // flatter face, narrow jaw
  return r;
}

const HR_MIN = Math.min(HR[0], HR[1], HR[2]);

/** Signed field: negative inside the deformed head, positive outside. */
function headField(p) {
  const qx = (p[0] - HC[0]) / HR[0], qy = (p[1] - HC[1]) / HR[1], qz = (p[2] - HC[2]) / HR[2];
  const m = Math.hypot(qx, qy, qz);
  if (m < 1e-6) return -1;
  return m - shape(qx / m, qy / m, qz / m);
}

/**
 * Ray against the scalp, clipped by the half-space z >= Z_CUT — the same flat
 * inferior edge the slices have. Reports whether the hit landed on that cut
 * face, which shades as a cross-section rather than a curve.
 *
 * The deformation has no closed form, so the analytic ellipsoid gives the
 * bracket and a short march plus a bisection finds the surface inside it.
 */
function hitHead(o, d) {
  const ox = (o[0] - HC[0]) / HR[0], oy = (o[1] - HC[1]) / HR[1], oz = (o[2] - HC[2]) / HR[2];
  const dx = d[0] / HR[0], dy = d[1] / HR[1], dz = d[2] / HR[2];
  const a = dx * dx + dy * dy + dz * dz;
  const b = 2 * (ox * dx + oy * dy + oz * dz);
  const c = ox * ox + oy * oy + oz * oz - 1;
  const disc = b * b - 4 * a * c;
  if (disc <= 0) return null;
  const sq = Math.sqrt(disc);
  let t0 = (-b - sq) / (2 * a), t1 = (-b + sq) / (2 * a);

  let cap = false;
  if (Math.abs(d[2]) > 1e-9) {
    const tp = (Z_CUT - o[2]) / d[2];
    if (d[2] > 0) { if (tp > t0) { t0 = tp; cap = true; } }
    else if (tp < t1) t1 = tp;
  } else if (o[2] < Z_CUT) return null;

  if (t0 > t1 || t1 <= 0) return null;
  const start = t0 > 0 ? t0 : t1;
  if (start <= 0) return null;
  if (cap && start === t0) {
    // the flat cut: no deformation to solve, but it only counts if the point
    // is actually within the deformed body
    const p = [o[0] + d[0] * start, o[1] + d[1] * start, o[2] + d[2] * start];
    return headField(p) <= 0 ? { t: start, cap: true } : null;
  }

  /* Sphere-trace rather than march at a fixed pitch. The field is the
     normalised radius minus the shape multiplier, so scaling it by the
     smallest head radius gives a step that cannot overshoot the surface. It
     matters: a fixed 2 mm march spent ~84 evaluations crossing the middle of
     the head, where this converges in one or two — the deformation is zero at
     the crown, so most rays are already on the surface when they arrive.

     The floor of a 24th of the chord is what bounds the miss case: without it
     a ray that grazes without ever crossing takes hundreds of tiny steps. */
  const at = (t) => headField([o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t]);
  let t = start;
  let f = at(t);
  if (f <= 0) return { t, cap: false };
  const floor = Math.max(0.4, (t1 - start) / 24);
  for (let k = 0; k < 26; k++) {
    const step = Math.max(floor, f * HR_MIN * 0.85);
    const prev = t;
    t += step;
    if (t > t1) return null;
    f = at(t);
    if (f <= 0) {
      let a0 = prev, b0 = t;
      for (let i = 0; i < 6; i++) {
        const mid = (a0 + b0) * 0.5;
        if (at(mid) <= 0) b0 = mid; else a0 = mid;
      }
      return { t: b0, cap: false };
    }
  }
  return null;
}

/** Gradient of the deformed field — the surface normal. */
function headNormal(p) {
  const e = 0.35;
  return unit([
    headField([p[0] + e, p[1], p[2]]) - headField([p[0] - e, p[1], p[2]]),
    headField([p[0], p[1] + e, p[2]]) - headField([p[0], p[1] - e, p[2]]),
    headField([p[0], p[1], p[2] + e]) - headField([p[0], p[1], p[2] - e]),
  ]);
}

/* ── the localiser ─────────────────────────────────────────────────────────
   Slab test for the rails, capsule test for the rods. Both report the normal
   so they can be lit by the same light as the head. */
function hitBox(o, d, lo, hi) {
  let t0 = -1e9, t1 = 1e9, axis = 0, sign = 1;
  for (let k = 0; k < 3; k++) {
    if (Math.abs(d[k]) < 1e-9) {
      if (o[k] < lo[k] || o[k] > hi[k]) return null;
      continue;
    }
    const inv = 1 / d[k];
    let a = (lo[k] - o[k]) * inv, b = (hi[k] - o[k]) * inv;
    let s = -1;
    if (a > b) { const tmp = a; a = b; b = tmp; s = 1; }
    if (a > t0) { t0 = a; axis = k; sign = s; }
    if (b < t1) t1 = b;
    if (t0 > t1) return null;
  }
  const t = t0 > 0 ? t0 : t1;
  if (t <= 0) return null;
  const n = [0, 0, 0];
  n[axis] = sign;
  return { t, n };
}

function hitCapsule(o, d, a, b, r) {
  const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const oa = [o[0] - a[0], o[1] - a[1], o[2] - a[2]];
  const bb = ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2];
  const bd = ba[0] * d[0] + ba[1] * d[1] + ba[2] * d[2];
  const bo = ba[0] * oa[0] + ba[1] * oa[1] + ba[2] * oa[2];
  const A = bb - bd * bd;
  const B = bb * (oa[0] * d[0] + oa[1] * d[1] + oa[2] * d[2]) - bo * bd;
  const C = bb * (oa[0] * oa[0] + oa[1] * oa[1] + oa[2] * oa[2] - r * r) - bo * bo;
  const h = B * B - A * C;
  if (h < 0) return null;
  const sq = Math.sqrt(h);
  let t = (-B - sq) / A;
  const y = bo + t * bd;
  if (t > 0 && y >= 0 && y <= bb) {
    const p = [o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t];
    const s = y / bb;
    const n = unit([
      p[0] - (a[0] + ba[0] * s), p[1] - (a[1] + ba[1] * s), p[2] - (a[2] + ba[2] * s),
    ]);
    return { t, n };
  }
  // spherical caps, so a rod end reads round rather than sheared
  for (const c of [a, b]) {
    const co = [o[0] - c[0], o[1] - c[1], o[2] - c[2]];
    const bq = co[0] * d[0] + co[1] * d[1] + co[2] * d[2];
    const cq = co[0] * co[0] + co[1] * co[1] + co[2] * co[2] - r * r;
    const hh = bq * bq - cq;
    if (hh < 0) continue;
    const tc = -bq - Math.sqrt(hh);
    if (tc > 0) {
      const p = [o[0] + d[0] * tc, o[1] + d[1] * tc, o[2] + d[2] * tc];
      return { t: tc, n: unit([p[0] - c[0], p[1] - c[1], p[2] - c[2]]) };
    }
  }
  return null;
}

const LIGHT = unit([-0.45, -0.72, 0.52]);

/**
 * Skin surface inside the localiser.
 *
 * A 3D pane in the application shows the surface reconstruction WITH the
 * frame around it, because that is the thing being registered — so the head
 * alone was only half the picture. Head, rails and rods are all traced in one
 * pass and the nearest hit wins, which is what makes the frame occlude the
 * head properly and the head occlude the far rods.
 *
 * The head remains synthetic and featureless; a defaced render of a real
 * volume is still what should replace it.
 */
/**
 * One ray. Writes RGBA 0..255 into `out` (alpha 0 for a miss) and returns
 * what was hit — 0 nothing, 1 rail, 2 rod, 3 head, 4 the cut face. The kind
 * is what the edge pass compares; two neighbouring pixels of the same kind
 * are flat shading and gain nothing from more samples.
 */
function traceScene(o, dir, tis, out) {
  let best = Infinity;
  let hitN = null, hitKind = 0;              // 1 rail, 2 rod

  // One slab test rejects the whole localiser for a background pixel, which
  // most of a tall pane is.
  if (hitBox(o, dir, FRAME_LO, FRAME_HI)) {
    for (let k = 0; k < RAILS.length; k++) {
      const r = hitBox(o, dir, RAILS[k].lo, RAILS[k].hi);
      if (r && r.t < best) { best = r.t; hitN = r.n; hitKind = 1; }
    }
    for (let k = 0; k < RODS.length; k++) {
      const rod = RODS[k];
      const r = hitCapsule(o, dir, rod.a, rod.b, rod.r);
      if (r && r.t < best) { best = r.t; hitN = r.n; hitKind = 2; }
    }
  }

  const hs = hitHead(o, dir);
  if (hs && hs.t < best) {
    const p = [o[0] + dir[0] * hs.t, o[1] + dir[1] * hs.t, o[2] + dir[2] * hs.t];
    if (hs.cap) {
      // Where the scan volume ends, show it in cross-section using the same
      // sampler the slice panes use.
      const g = Math.min(255, sampleVol(p[0], p[1], p[2] + 0.4, tis) * 250);
      out[0] = g; out[1] = g; out[2] = g; out[3] = 255;
      return 4;
    }
    const n = headNormal(p);
    const lam = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
    const rim = Math.pow(1 - Math.abs(n[0] * dir[0] + n[1] * dir[1] + n[2] * dir[2]), 3.4);
    const skin = 0.97 + (fbm(p[0] * 0.3, p[1] * 0.3, p[2] * 0.3) - 0.5) * 0.07;
    // measured off the application's render: mid #ad7d55
    const sh = (0.34 + lam * 0.66) * skin;
    const spec = Math.pow(lam, 26) * 0.5;
    out[0] = Math.min(255, 214 * sh + rim * 16 + spec * 200);
    out[1] = Math.min(255, 163 * sh + rim * 24 + spec * 200);
    out[2] = Math.min(255, 122 * sh + rim * 38 + spec * 200);
    out[3] = 255;
    return 3;
  }

  if (hitN) {
    const lam = Math.max(0, hitN[0] * LIGHT[0] + hitN[1] * LIGHT[1] + hitN[2] * LIGHT[2]);
    if (hitKind === 1) {
      const sh = 0.55 + lam * 0.9;           // machined bar
      out[0] = Math.min(255, C_RAIL[0] * sh + lam * lam * 26);
      out[1] = Math.min(255, C_RAIL[1] * sh + lam * lam * 26);
      out[2] = Math.min(255, C_RAIL[2] * sh + lam * lam * 24);
    } else {
      /* The rods read as lit acrylic in the application — bright, a little
         translucent, brighter still along the edges. */
      const face = Math.abs(hitN[0] * dir[0] + hitN[1] * dir[1] + hitN[2] * dir[2]);
      const edge = Math.pow(1 - face, 2.2);
      const sh = 0.62 + lam * 0.72;
      out[0] = Math.min(255, C_ROD[0] * sh + edge * 90);
      out[1] = Math.min(255, C_ROD[1] * sh + edge * 110);
      out[2] = Math.min(255, C_ROD[2] * sh + edge * 60);
    }
    out[3] = 255;
    return hitKind;
  }
  out[0] = 0; out[1] = 0; out[2] = 0; out[3] = 0;
  return 0;
}

// Reused for the draft upscale so a gesture allocates nothing.
let scratch = null;

/**
 * Two qualities, because they are wanted at different moments.
 *
 * `draft` traces a quarter-area buffer at one ray per pixel and lets the
 * browser scale it up — that is what keeps an orbit at frame rate. Everything
 * else traces the pane one-for-one at 2×2 supersampling, which is what
 * removes the staircase from the rods and the rim of the head. The expensive
 * one only runs when the gesture stops, so nobody waits on it mid-drag.
 */
export function render3D(cv, cssW, cssH, cam, tis, draft = false) {
  if (!cv.width || !cv.height || !cssW || !cssH) return;
  const ctx = cv.getContext('2d');
  const w = draft ? Math.max(1, cv.width >> 1) : cv.width;
  const h = draft ? Math.max(1, cv.height >> 1) : cv.height;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const mm = mm3d(cssW, cssH) * (cssW / w);
  const dir = camUnrot([0, 1, 0], cam);
  const px4 = [0, 0, 0, 0];
  const ray = (across, up) => camUnrot([across, -420, up], cam);

  /* Pass one: a single ray per pixel, keeping what each one hit. */
  const kind = draft ? null : new Uint8Array(w * h);
  let i = 0;
  for (let py = 0; py < h; py++) {
    const up = (h / 2 - py - 0.5) * mm;
    for (let px = 0; px < w; px++, i += 4) {
      const k = traceScene(ray((px - w / 2 + 0.5) * mm, up), dir, tis, px4);
      d[i] = px4[0] | 0; d[i + 1] = px4[1] | 0; d[i + 2] = px4[2] | 0; d[i + 3] = px4[3] | 0;
      if (kind) kind[(i >> 2)] = k;
    }
  }

  /* Pass two: supersample ONLY where a pixel's four neighbours disagree about
     what was hit. Those are the silhouettes — a rod against the background, a
     rail against the head — and they are the only places extra rays change
     anything. Flat interiors are already exact, and shading them four times
     over was most of the cost: at full resolution the edges are about a
     twentieth of the pane. */
  if (kind) {
    const SS = 2;
    const sub = mm / SS;
    const half = (SS - 1) / 2;
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const c = py * w + px;
        const k = kind[c];
        const edge = (px > 0 && kind[c - 1] !== k)
          || (px < w - 1 && kind[c + 1] !== k)
          || (py > 0 && kind[c - w] !== k)
          || (py < h - 1 && kind[c + w] !== k);
        if (!edge) continue;
        let R = 0, G = 0, B = 0, A = 0;
        for (let sy = 0; sy < SS; sy++) {
          const up = (h / 2 - py - 0.5) * mm - (sy - half) * sub;
          for (let sx = 0; sx < SS; sx++) {
            traceScene(ray((px - w / 2 + 0.5) * mm + (sx - half) * sub, up), dir, tis, px4);
            R += px4[0]; G += px4[1]; B += px4[2]; A += px4[3];
          }
        }
        const j = c << 2;
        d[j] = (R / 4) | 0; d[j + 1] = (G / 4) | 0; d[j + 2] = (B / 4) | 0; d[j + 3] = (A / 4) | 0;
      }
    }
  }

  if (!draft) { ctx.putImageData(img, 0, 0); return; }
  // putImageData ignores scaling, so the draft goes via a scratch canvas
  if (!scratch) scratch = document.createElement('canvas');
  if (scratch.width !== w || scratch.height !== h) { scratch.width = w; scratch.height = h; }
  scratch.getContext('2d').putImageData(img, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.drawImage(scratch, 0, 0, cv.width, cv.height);
}

/* ── overlays ──────────────────────────────────────────────────────────────
   Colours sampled from the application, not chosen.                      */
export const C_TRACK = '#03a1bd';
export const C_TARGET = '#c62d2d';
export const C_ENTRY = '#73e519';
const C_ORIENT = 'rgba(255,219,79,.95)';

function edgeLabels(ctx, w, h, L) {
  ctx.font = '600 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = C_ORIENT;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.fillText(L[0], 6, h / 2);
  ctx.textAlign = 'right'; ctx.fillText(L[1], w - 6, h / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top'; ctx.fillText(L[2], w / 2, 5);
  ctx.textBaseline = 'bottom'; ctx.fillText(L[3], w / 2, h - 5);
}

/**
 * Anatomical axes projected into an oblique plane. The application places the
 * Probe's Eye letters this way, following the tilt rather than pinning them
 * to the pane edges.
 */
function obliqueLabels(ctx, w, h, B) {
  const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const named = [['L', 'R'], ['A', 'P'], ['S', 'I']];
  ctx.font = '600 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = C_ORIENT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rad = Math.min(w, h) / 2 - 12;
  axes.forEach((ax, k) => {
    const a = ax[0] * B.h[0] + ax[1] * B.h[1] + ax[2] * B.h[2];
    const b = ax[0] * B.v[0] + ax[1] * B.v[1] + ax[2] * B.v[2];
    const m = Math.hypot(a, b);
    if (m < 0.22) return;                       // axis nearly normal to the plane
    for (const s of [1, -1]) {
      ctx.fillText(named[k][s > 0 ? 0 : 1], w / 2 + (a / m) * rad * s, h / 2 - (b / m) * rad * s);
    }
  });
}

/**
 * The mapping between a pane's pixels and the world, both ways.
 *
 * Shared so that what is drawn and what can be grabbed are guaranteed to
 * agree — a hit test computed separately from the overlay drifts the moment
 * either is touched.
 *
 * `toWorld` returns a point ON the displayed slice: the plane's own position
 * supplies the third coordinate, which is how PICKING is meant to behave —
 * you get the point you are looking at, not one behind it.
 *
 * `toWorldAt` is for DRAGGING something that already exists, and keeps that
 * point's out-of-plane coordinate instead. Using `toWorld` to drag flattens
 * the point into the displayed slice: drag the entry in the coronal view and
 * its anterior-posterior coordinate is overwritten with the cursor's, so if
 * the target shares that plane the track loses all A-P extent and the
 * sagittal view draws it bolt upright. A pane may only move what it can
 * actually show.
 */
export function paneMap(view, geo, cssW, cssH) {
  const B = planeBasis(view, geo);
  const mm = B.fov / cssH;
  const n = cross(B.h, B.v);              // the plane normal, i.e. the axis a
  const inPlane = (x, y) => {             // pane cannot represent
    const a = (x - cssW / 2) * mm;
    const b = (cssH / 2 - y) * mm;
    return [
      B.o[0] + B.h[0] * a + B.v[0] * b,
      B.o[1] + B.h[1] * a + B.v[1] * b,
      B.o[2] + B.h[2] * a + B.v[2] * b,
    ];
  };
  return {
    B,
    mm,
    toPx: (p) => {
      const rx = p[0] - B.o[0], ry = p[1] - B.o[1], rz = p[2] - B.o[2];
      return [
        cssW / 2 + (rx * B.h[0] + ry * B.h[1] + rz * B.h[2]) / mm,
        cssH / 2 - (rx * B.v[0] + ry * B.v[1] + rz * B.v[2]) / mm,
      ];
    },
    toWorld: inPlane,
    toWorldAt: (x, y, ref) => {
      const p = inPlane(x, y);
      // put back however far `ref` sits off this plane
      const d = (ref[0] - B.o[0]) * n[0] + (ref[1] - B.o[1]) * n[1] + (ref[2] - B.o[2]) * n[2];
      return [p[0] + n[0] * d, p[1] + n[1] * d, p[2] + n[2] * d];
    },
  };
}

export function drawOverlay(cv, view, geo, cssW, cssH, active = null, preview = false) {
  const ctx = cv.getContext('2d');
  ctx.setTransform(cv.width / cssW, 0, 0, cv.height / cssH, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  if (cssW < 40 || cssH < 40) return;

  const { B, toPx } = paneMap(view, geo, cssW, cssH);

  if (view === 'probe') {
    ctx.strokeStyle = 'rgba(3,161,189,.9)';
    ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(cssW / 2, cssH / 2, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cssW / 2 - 12, cssH / 2); ctx.lineTo(cssW / 2 - 3, cssH / 2);
    ctx.moveTo(cssW / 2 + 3, cssH / 2); ctx.lineTo(cssW / 2 + 12, cssH / 2);
    ctx.moveTo(cssW / 2, cssH / 2 - 12); ctx.lineTo(cssW / 2, cssH / 2 - 3);
    ctx.moveTo(cssW / 2, cssH / 2 + 3); ctx.lineTo(cssW / 2, cssH / 2 + 12);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(199,134,58,.85)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cssW / 2, cssH / 2, 11, 0, Math.PI * 2); ctx.stroke();
    obliqueLabels(ctx, cssW, cssH, B);
    return;
  }

  const pT = toPx(geo.T), pE = toPx(geo.E), pP = toPx(geo.tip);
  const beyond = toPx([
    geo.E[0] + geo.u[0] * 26,
    geo.E[1] + geo.u[1] * 26,
    geo.E[2] + geo.u[2] * 26,
  ]);

  /* The track. Dashed while a drag is in flight and solid once committed —
     the application draws the same distinction, so what is on screen says
     whether you are looking at a preview or at the plan. The shaft also
     thickens when it is the thing under the pointer, because it is grabbable
     in its own right and a bare line gives no sign of that. */
  ctx.strokeStyle = C_TRACK;
  ctx.lineWidth = active === 'shaft' ? 3 : 1.5;
  if (preview) ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(pE[0], pE[1]); ctx.lineTo(pT[0], pT[1]); ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.45;
  ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(pE[0], pE[1]); ctx.lineTo(beyond[0], beyond[1]); ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(pP[0], pP[1], 7, 4.5, Math.atan2(pT[1] - pE[1], pT[0] - pE[0]), 0, Math.PI * 2);
  ctx.stroke();

  /* Entry and target are draggable, so they are drawn as handles: a soft
     ring under the pointer says "this one moves", which a bare dot does not.
     The radius matches the hit test, so what lights up is what you get. */
  const halo = (p, colour) => {
    ctx.beginPath();
    ctx.arc(p[0], p[1], 13, 0, Math.PI * 2);
    ctx.fillStyle = colour;
    ctx.globalAlpha = 0.16;
    ctx.fill();
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1;
    ctx.strokeStyle = colour;
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  if (active === 'entry') halo(pE, C_ENTRY);
  if (active === 'target') halo(pT, C_TARGET);

  ctx.fillStyle = C_ENTRY;
  ctx.beginPath(); ctx.arc(pE[0], pE[1], 3.6, 0, Math.PI * 2); ctx.fill();

  // The target is a ring so it stays legible when the cursor sits on it.
  ctx.strokeStyle = C_TARGET;
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(pT[0], pT[1], 5.4, 0, Math.PI * 2); ctx.stroke();

  // The cursor. Always at pane centre, because the slice follows it.
  ctx.fillStyle = C_TARGET;
  ctx.beginPath(); ctx.arc(cssW / 2, cssH / 2, 3.2, 0, Math.PI * 2); ctx.fill();

  edgeLabels(ctx, cssW, cssH, VIEWS[view].labels);
}

// Visible fiducials for the current camera, as a flat x,y list.
let fidKey = '';
let fidShown = [];

export function draw3DOverlay(cv, geo, cam, cssW, cssH) {
  const ctx = cv.getContext('2d');
  ctx.setTransform(cv.width / cssW, 0, 0, cv.height / cssH, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  if (cssW < 40 || cssH < 40) return;

  const mm = mm3d(cssW, cssH);
  const pr = (p) => {
    const r = camRot(p, cam);
    return [cssW / 2 + r[0] / mm, cssH / 2 - r[2] / mm];
  };
  const pE = pr(geo.E), pT = pr(geo.T), pP = pr(geo.tip);

  /* ── the detected fiducials ──────────────────────────────────────────────
     Drawn as an overlay, which is what they are — the output of the
     detection, not part of the model. Each is depth-tested against the head
     AND the rails, by casting the same ray the renderer would: an overlay
     that ignores depth gives itself away immediately, with points sitting on
     top of the bar that should be hiding them.

     The rods are deliberately NOT occluders. A fiducial lies on its own rod's
     surface, so testing against it would have every point fighting its own
     geometry for the same pixel.

     Cached on the camera, because that is all any of it depends on. This
     overlay is redrawn on every plan change, and re-deciding four hundred
     visibilities per frame while a trajectory is dragged is work done to
     produce an identical answer. */
  const key = `${cam.az}|${cam.el}|${cssW}|${cssH}`;
  if (fidKey !== key) {
    const camDir = camUnrot([0, 1, 0], cam);   // world-space view direction
    const BACK = 700;                          // camera stand-off for the test
    const near = BACK - 1.2;
    fidShown = [];
    for (let k = 0; k < FIDUCIALS.length; k++) {
      const f = FIDUCIALS[k];
      const r = camRot(f, cam);
      const x = cssW / 2 + r[0] / mm, y = cssH / 2 - r[2] / mm;
      if (x < -4 || y < -4 || x > cssW + 4 || y > cssH + 4) continue;

      const o = [f[0] - camDir[0] * BACK, f[1] - camDir[1] * BACK, f[2] - camDir[2] * BACK];
      let hidden = false;
      const hs = hitHead(o, camDir);
      if (hs && hs.t < near) hidden = true;
      for (let j = 0; !hidden && j < RAILS.length; j++) {
        const hb = hitBox(o, camDir, RAILS[j].lo, RAILS[j].hi);
        if (hb && hb.t < near) hidden = true;
      }
      if (!hidden) fidShown.push(x, y);
    }
    fidKey = key;
  }

  ctx.fillStyle = C_FIDUCIAL;
  ctx.globalAlpha = 0.95;
  for (let i = 0; i < fidShown.length; i += 2) {
    ctx.beginPath();
    ctx.arc(fidShown[i], fidShown[i + 1], 1.35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.55;
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = C_TRACK;
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(pE[0], pE[1]); ctx.lineTo(pT[0], pT[1]); ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  ctx.lineWidth = 2.4;
  ctx.strokeStyle = 'rgba(3,161,189,.85)';
  ctx.beginPath(); ctx.moveTo(pE[0], pE[1]); ctx.lineTo(pP[0], pP[1]); ctx.stroke();

  ctx.fillStyle = C_ENTRY;
  ctx.beginPath(); ctx.arc(pE[0], pE[1], 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C_TARGET;
  ctx.beginPath(); ctx.arc(pT[0], pT[1], 3, 0, Math.PI * 2); ctx.fill();
}

/** Keeps a dragged target inside the parenchyma. */
export const insideBrain = (q) => q < R_BRAIN + 0.02;
