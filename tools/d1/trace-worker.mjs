/* One horizontal strip of the trace. See trace.mjs for the reasoning; this
   file is the inner loop and nothing else. */
import { workerData, parentPort } from 'node:worker_threads';

const {
  posSAB, nrmSAB, grpSAB, idxSAB, boundsSAB, metaSAB, imgSAB, rowSAB,
  W, H, SPP, DIFF, SPEC, DIST, FOC, YAW, PITCH, id,
} = workerData;

const pos = new Float32Array(posSAB);
const nrm = new Float32Array(nrmSAB);
const grp = new Uint8Array(grpSAB);
const triIdx = new Int32Array(idxSAB);
const nb = new Float32Array(boundsSAB);
const nm = new Int32Array(metaSAB);
const img = new Float32Array(imgSAB);
const rowCounter = new Int32Array(rowSAB);

/* deterministic per-pixel RNG: same image every run, which matters when the
   only way to judge a lighting change is to diff two renders */
let rs = 0;
const seed = (a, b) => { rs = (Math.imul(a, 0x9e3779b1) ^ Math.imul(b, 0x85ebca6b)) >>> 0; };
const rnd = () => {
  rs ^= rs << 13; rs >>>= 0;
  rs ^= rs >>> 17;
  rs ^= rs << 5; rs >>>= 0;
  return rs / 4294967296;
};

/* ── materials ────────────────────────────────────────────────────────────── */
/* Measured off NaviNetics' photographs: body #2e6ab1, shadow #102045,
   highlight #70b2e5, and roughly half the frame bare metal. Anodised
   aluminium is a metal under a coloured oxide, so it gets a coloured F0 and a
   little diffuse; the bare parts are near-pure metal. */
const MAT = [
  /* arc      */ { f0: [0.075, 0.255, 0.575], alb: [0.020, 0.075, 0.190], rough: 0.235, metal: 0.88 },
  /* rails    */ { f0: [0.075, 0.255, 0.575], alb: [0.020, 0.075, 0.190], rough: 0.245, metal: 0.88 },
  /* drive    */ { f0: [0.560, 0.575, 0.590], alb: [0.030, 0.031, 0.032], rough: 0.175, metal: 0.97 },
  /* stage    */ { f0: [0.070, 0.240, 0.545], alb: [0.018, 0.070, 0.180], rough: 0.255, metal: 0.88 },
  /* base     */ { f0: [0.058, 0.195, 0.450], alb: [0.014, 0.055, 0.140], rough: 0.290, metal: 0.88 },
  /* fastener */ { f0: [0.585, 0.600, 0.615], alb: [0.032, 0.033, 0.034], rough: 0.265, metal: 0.97 },
];

/* ── the studio ───────────────────────────────────────────────────────────── */
/* Three large softboxes and a graded sky. Large and dim, not small and
   bright: it is what gives a curved anodised surface a long gradient instead
   of a hot dot, and it is why this resolves without a denoiser. */
/* Intensities are set so that a lit anodised face lands on the measured body
   colour rather than on whatever looked bright: #2e6ab1 is linear
   (0.025, 0.156, 0.55), so the environment seen through the specular lobe has
   to average about 1, not about 15. The first pass had it at 15 and every blue
   surface saturated to cyan. */
const LAMPS = [
  { d: [-0.42, 0.80, 0.44], r: 0.42, c: [2.70, 2.78, 2.92] },  // key, upper left front
  { d: [0.86, 0.16, 0.34], r: 0.50, c: [0.62, 0.67, 0.80] },   // fill, right
  { d: [0.05, -0.30, -0.92], r: 0.38, c: [0.90, 1.00, 1.26] }, // rim, behind
];
for (const L of LAMPS) {
  const n = Math.hypot(L.d[0], L.d[1], L.d[2]);
  L.d = [L.d[0] / n, L.d[1] / n, L.d[2] / n];
}
function env(dx, dy, dz, out) {
  // graded sky: cool above, near-black below, so the object has somewhere dark
  // to sit and the chrome has something to reflect
  const t = dy * 0.5 + 0.5;
  let r = 0.022 + 0.090 * t * t;
  let g = 0.028 + 0.115 * t * t;
  let b = 0.038 + 0.155 * t * t;
  for (const L of LAMPS) {
    const c = dx * L.d[0] + dy * L.d[1] + dz * L.d[2];
    if (c <= 1 - L.r) continue;
    // smooth-edged disc: a hard edge shows as a visible seam in a reflection
    const k = Math.min(1, (c - (1 - L.r)) / (L.r * 0.85));
    const s = k * k * (3 - 2 * k);
    r += L.c[0] * s; g += L.c[1] * s; b += L.c[2] * s;
  }
  out[0] = r; out[1] = g; out[2] = b;
}

/* ── traversal ────────────────────────────────────────────────────────────── */
const stack = new Int32Array(64);
const hit = { t: 0, tri: 0, u: 0, v: 0 };

function trace(ox, oy, oz, dx, dy, dz, tmax, anyHit) {
  const ix = 1 / dx; const iy = 1 / dy; const iz = 1 / dz;
  let sp = 0;
  stack[sp++] = 0;
  let best = tmax;
  let found = -1;
  let bu = 0; let bv = 0;
  while (sp) {
    const n = stack[--sp];
    const b = n * 6;
    let t0 = (nb[b] - ox) * ix; let t1 = (nb[b + 3] - ox) * ix;
    let lo = Math.min(t0, t1); let hi2 = Math.max(t0, t1);
    t0 = (nb[b + 1] - oy) * iy; t1 = (nb[b + 4] - oy) * iy;
    lo = Math.max(lo, Math.min(t0, t1)); hi2 = Math.min(hi2, Math.max(t0, t1));
    t0 = (nb[b + 2] - oz) * iz; t1 = (nb[b + 5] - oz) * iz;
    lo = Math.max(lo, Math.min(t0, t1)); hi2 = Math.min(hi2, Math.max(t0, t1));
    if (hi2 < Math.max(lo, 1e-5) || lo > best) continue;

    const count = nm[n * 2 + 1];
    if (count === 0) {
      stack[sp++] = n + 1;
      stack[sp++] = nm[n * 2];
      continue;
    }
    const start = nm[n * 2];
    for (let i = start; i < start + count; i++) {
      const tri = triIdx[i];
      const p = tri * 9;
      const ax = pos[p]; const ay = pos[p + 1]; const az = pos[p + 2];
      const e1x = pos[p + 3] - ax; const e1y = pos[p + 4] - ay; const e1z = pos[p + 5] - az;
      const e2x = pos[p + 6] - ax; const e2y = pos[p + 7] - ay; const e2z = pos[p + 8] - az;
      const hx = dy * e2z - dz * e2y;
      const hy = dz * e2x - dx * e2z;
      const hz = dx * e2y - dy * e2x;
      const det = e1x * hx + e1y * hy + e1z * hz;
      if (det > -1e-12 && det < 1e-12) continue;
      const inv = 1 / det;
      const sx = ox - ax; const sy = oy - ay; const sz = oz - az;
      const u = (sx * hx + sy * hy + sz * hz) * inv;
      if (u < 0 || u > 1) continue;
      const qx = sy * e1z - sz * e1y;
      const qy = sz * e1x - sx * e1z;
      const qz = sx * e1y - sy * e1x;
      const v = (dx * qx + dy * qy + dz * qz) * inv;
      if (v < 0 || u + v > 1) continue;
      const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
      if (t > 1e-5 && t < best) {
        if (anyHit) return 1;
        best = t; found = tri; bu = u; bv = v;
      }
    }
  }
  if (anyHit) return 0;
  hit.t = best; hit.tri = found; hit.u = bu; hit.v = bv;
  return found >= 0 ? 1 : 0;
}

/* ── shading ──────────────────────────────────────────────────────────────── */
const E = [0, 0, 0];

function onb(nx, ny, nz, out) {
  // Duff et al. branchless orthonormal basis
  const s = nz >= 0 ? 1 : -1;
  const a = -1 / (s + nz);
  const b = nx * ny * a;
  out[0] = 1 + s * nx * nx * a; out[1] = s * b; out[2] = -s * nx;
  out[3] = b; out[4] = s + ny * ny * a; out[5] = -ny;
}
const B = new Float32Array(6);

/** One camera ray, two bounces of it, into rgb. */
function shade(ox, oy, oz, dx, dy, dz, rgb) {
  if (!trace(ox, oy, oz, dx, dy, dz, 1e9, false)) return 0;

  const tri = hit.tri;
  const w = 1 - hit.u - hit.v;
  const p = tri * 9;
  let nx = nrm[p] * w + nrm[p + 3] * hit.u + nrm[p + 6] * hit.v;
  let ny = nrm[p + 1] * w + nrm[p + 4] * hit.u + nrm[p + 7] * hit.v;
  let nz = nrm[p + 2] * w + nrm[p + 5] * hit.u + nrm[p + 8] * hit.v;
  const nl = Math.hypot(nx, ny, nz) || 1;
  nx /= nl; ny /= nl; nz /= nl;
  if (nx * dx + ny * dy + nz * dz > 0) { nx = -nx; ny = -ny; nz = -nz; }

  const hx = ox + dx * hit.t + nx * 2e-4;
  const hy = oy + dy * hit.t + ny * 2e-4;
  const hz = oz + dz * hit.t + nz * 2e-4;
  const m = MAT[grp[tri]] || MAT[0];

  onb(nx, ny, nz, B);
  let dr = 0; let dg = 0; let db = 0;

  /* diffuse / occlusion: cosine-weighted, so an unoccluded ray is exactly the
     irradiance integral and an occluded one contributes the bounce instead */
  for (let s = 0; s < DIFF; s++) {
    const r1 = rnd(); const r2 = rnd();
    const sr = Math.sqrt(r1);
    const phi = 6.283185307 * r2;
    const lx = sr * Math.cos(phi);
    const ly = sr * Math.sin(phi);
    const lz = Math.sqrt(Math.max(0, 1 - r1));
    const wx = B[0] * lx + B[3] * ly + nx * lz;
    const wy = B[1] * lx + B[4] * ly + ny * lz;
    const wz = B[2] * lx + B[5] * ly + nz * lz;
    if (trace(hx, hy, hz, wx, wy, wz, 1e9, false)) {
      /* it hit the object: one bounce of its own colour, lit by an
         unoccluded estimate. Cheap, and at this albedo the error is under a
         percent of the pixel. */
      const m2 = MAT[grp[hit.tri]] || MAT[0];
      env(wx, wy, wz, E);
      dr += m2.alb[0] * 0.30 * E[0];
      dg += m2.alb[1] * 0.30 * E[1];
      db += m2.alb[2] * 0.30 * E[2];
    } else {
      env(wx, wy, wz, E);
      dr += E[0]; dg += E[1]; db += E[2];
    }
  }
  dr /= DIFF; dg /= DIFF; db /= DIFF;

  /* specular: GGX-sampled reflection lobe */
  const a2 = m.rough * m.rough;
  let sr2 = 0; let sg = 0; let sb = 0;
  const vdn = -(nx * dx + ny * dy + nz * dz);
  for (let s = 0; s < SPEC; s++) {
    const r1 = rnd(); const r2 = rnd();
    const ct = Math.sqrt((1 - r1) / (1 + (a2 * a2 - 1) * r1));
    const st = Math.sqrt(Math.max(0, 1 - ct * ct));
    const phi = 6.283185307 * r2;
    const mx = B[0] * (st * Math.cos(phi)) + B[3] * (st * Math.sin(phi)) + nx * ct;
    const my = B[1] * (st * Math.cos(phi)) + B[4] * (st * Math.sin(phi)) + ny * ct;
    const mz = B[2] * (st * Math.cos(phi)) + B[5] * (st * Math.sin(phi)) + nz * ct;
    const dm = dx * mx + dy * my + dz * mz;
    const rx = dx - 2 * dm * mx;
    const ry = dy - 2 * dm * my;
    const rz = dz - 2 * dm * mz;
    if (rx * nx + ry * ny + rz * nz <= 0) continue;
    if (trace(hx, hy, hz, rx, ry, rz, 1e9, false)) {
      const m2 = MAT[grp[hit.tri]] || MAT[0];
      env(rx, ry, rz, E);
      sr2 += m2.f0[0] * 0.34 * E[0] + m2.alb[0] * 0.22 * E[0];
      sg += m2.f0[1] * 0.34 * E[1] + m2.alb[1] * 0.22 * E[1];
      sb += m2.f0[2] * 0.34 * E[2] + m2.alb[2] * 0.22 * E[2];
    } else {
      env(rx, ry, rz, E);
      sr2 += E[0]; sg += E[1]; sb += E[2];
    }
  }
  sr2 /= SPEC; sg /= SPEC; sb /= SPEC;

  // Schlick, on the view angle
  const fr = (1 - vdn) ** 5;
  const kr = m.f0[0] + (1 - m.f0[0]) * fr;
  const kg = m.f0[1] + (1 - m.f0[1]) * fr;
  const kb = m.f0[2] + (1 - m.f0[2]) * fr;

  const dk = 1 - m.metal;
  rgb[0] = dr * m.alb[0] * dk + sr2 * kr;
  rgb[1] = dg * m.alb[1] * dk + sg * kg;
  rgb[2] = db * m.alb[2] * dk + sb * kb;
  return 1;
}

/* ── the strip loop ───────────────────────────────────────────────────────── */
const cyaw = Math.cos(YAW); const syaw = Math.sin(YAW);
const cpit = Math.cos(PITCH); const spit = Math.sin(PITCH);
/* The camera basis is the transpose of the view rotation, written out step by
   step rather than composed — the composed form is easy to get subtly wrong
   and the failure mode is an image that looks plausible from the wrong angle. */
function camRay(sx, sy, out) {
  const vx = sx;
  const vy = sy;
  const vz = -FOC;
  // undo pitch
  const y1 = vy * cpit + vz * spit;
  const z1 = -vy * spit + vz * cpit;
  // undo yaw
  out[0] = vx * cyaw - z1 * syaw;
  out[1] = y1;
  out[2] = vx * syaw + z1 * cyaw;
  const n = Math.hypot(out[0], out[1], out[2]);
  out[0] /= n; out[1] /= n; out[2] /= n;
}
const eye = (() => {
  const o = [0, 0, 0];
  // camera sits at +DIST along the view axis, rotated into world
  const y1 = 0 * cpit + DIST * spit;
  const z1 = -0 * spit + DIST * cpit;
  o[0] = 0 * cyaw - z1 * syaw;
  o[1] = y1;
  o[2] = 0 * syaw + z1 * cyaw;
  return o;
})();

const dir = [0, 0, 0];
const rgb = [0, 0, 0];
const ROWS = 8;
for (;;) {
  const y0 = Atomics.add(rowCounter, 0, ROWS);
  if (y0 >= H) break;
  for (let y = y0; y < Math.min(H, y0 + ROWS); y++) {
    for (let x = 0; x < W; x++) {
      seed(x * 73856093 + 1, y * 19349663 + 1);
      let r = 0; let g = 0; let b = 0; let a = 0;
      for (let s = 0; s < SPP; s++) {
        const jx = (x + rnd()) - W / 2;
        const jy = (H / 2) - (y + rnd());
        camRay(jx, jy, dir);
        if (shade(eye[0], eye[1], eye[2], dir[0], dir[1], dir[2], rgb)) {
          r += rgb[0]; g += rgb[1]; b += rgb[2]; a += 1;
        }
      }
      const o = (y * W + x) * 4;
      img[o] = r; img[o + 1] = g; img[o + 2] = b; img[o + 3] = a;
    }
  }
  if (id === 0) process.stdout.write(`  row ${Math.min(H, y0 + ROWS)}/${H}\r`);
}
parentPort.postMessage({ done: true });
