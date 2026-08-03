/**
 * The hero, ray traced.
 *
 * The rasteriser this replaces could not get there, and not for want of
 * tuning: it had no reflections, and a metal object without reflections reads
 * as plastic no matter how the lights are set. Its occlusion was a
 * screen-space guess, so contact darkening appeared where geometry merely
 * overlapped on screen rather than where parts actually meet.
 *
 * So: a BVH over the tessellated assembly, and every pixel traced. Occlusion
 * is real — a cosine-weighted hemisphere of rays that either escape to the
 * environment or do not. Reflections are real — GGX-sampled rays that see the
 * rest of the object and the studio around it. Both fall out of the same
 * integral, which is why this is shorter than the thing it replaces.
 *
 * LIGHTING is an analytic studio rather than an HDR file: a graded sky and
 * three large softboxes, evaluated by any ray that escapes. Large and dim
 * beats small and bright here — soft sources give the long gradients across a
 * curved anodised surface that make it look photographed, and they keep the
 * variance low enough that the image resolves without a denoiser.
 *
 * ONE IMAGE, so the sample budget is spent where a turntable could never
 * afford it. Rendering runs across every core through worker_threads over a
 * SharedArrayBuffer; nothing here is incremental.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { deflateSync } from 'node:zlib';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/^\//, '');
const WORK = `${ROOT}tools/.d1/`;

const W = +(process.argv[2] || 1440);
const H = +(process.argv[3] || 2060);
const SPP = +(process.argv[4] || 4);      // primary samples per pixel
const DIFF = +(process.argv[5] || 28);    // hemisphere rays per primary sample
const SPEC = +(process.argv[6] || 10);    // reflection rays per primary sample
const OUTNAME = process.argv[7] || 'hero';
const YAW = (+(process.argv[8] ?? 38)) * Math.PI / 180;
const PITCH = (+(process.argv[9] ?? -18)) * Math.PI / 180;
/* 'tight' frames this view alone. 'spin' frames the widest the object gets
   anywhere in a full revolution, so every frame of a turntable is drawn at the
   same scale — fit each frame to itself and the object visibly breathes as it
   turns. */
const FIT = process.argv[10] || 'tight';

/* ── mesh ─────────────────────────────────────────────────────────────────── */
const raw = readFileSync(`${WORK}mesh.bin`);
const NV = raw.readUInt32LE(0);
const NT = NV / 3;
const posSAB = new SharedArrayBuffer(NV * 3 * 4);
const nrmSAB = new SharedArrayBuffer(NV * 3 * 4);
const grpSAB = new SharedArrayBuffer(NT);
const pos = new Float32Array(posSAB);
const nrm = new Float32Array(nrmSAB);
const grp = new Uint8Array(grpSAB);
for (let i = 0, o = 4; i < NV; i++, o += 25) {
  pos[i * 3] = raw.readFloatLE(o);
  pos[i * 3 + 1] = raw.readFloatLE(o + 4);
  pos[i * 3 + 2] = raw.readFloatLE(o + 8);
  nrm[i * 3] = raw.readFloatLE(o + 12);
  nrm[i * 3 + 1] = raw.readFloatLE(o + 16);
  nrm[i * 3 + 2] = raw.readFloatLE(o + 20);
  if (i % 3 === 0) grp[i / 3] = raw.readUInt8(o + 24);
}
console.log(`${NT.toLocaleString()} triangles`);

/* centre and scale so the camera maths below is in units of the object */
const lo = [Infinity, Infinity, Infinity];
const hi = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < NV; i++) {
  for (let c = 0; c < 3; c++) {
    const v = pos[i * 3 + c];
    if (v < lo[c]) lo[c] = v;
    if (v > hi[c]) hi[c] = v;
  }
}
const mid = lo.map((v, c) => (v + hi[c]) / 2);
const span = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
for (let i = 0; i < NV; i++) {
  for (let c = 0; c < 3; c++) pos[i * 3 + c] = (pos[i * 3 + c] - mid[c]) / span;
}

/* ── BVH ──────────────────────────────────────────────────────────────────── */
/* Binned SAH over centroids. A median split is quicker to write and roughly
   twice as slow to trace, which on 350M rays is the difference between four
   minutes and eight. */
console.time('bvh');
const cx = new Float32Array(NT);
const cy = new Float32Array(NT);
const cz = new Float32Array(NT);
const tlo = new Float32Array(NT * 3);
const thi = new Float32Array(NT * 3);
for (let t = 0; t < NT; t++) {
  for (let c = 0; c < 3; c++) {
    const a = pos[t * 9 + c];
    const b = pos[t * 9 + 3 + c];
    const d = pos[t * 9 + 6 + c];
    tlo[t * 3 + c] = Math.min(a, b, d);
    thi[t * 3 + c] = Math.max(a, b, d);
  }
  cx[t] = (tlo[t * 3] + thi[t * 3]) / 2;
  cy[t] = (tlo[t * 3 + 1] + thi[t * 3 + 1]) / 2;
  cz[t] = (tlo[t * 3 + 2] + thi[t * 3 + 2]) / 2;
}

const idxSAB = new SharedArrayBuffer(NT * 4);
const triIdx = new Int32Array(idxSAB);
for (let i = 0; i < NT; i++) triIdx[i] = i;

const MAXN = NT * 2 + 8;
const boundsSAB = new SharedArrayBuffer(MAXN * 6 * 4);
const metaSAB = new SharedArrayBuffer(MAXN * 2 * 4);
const nb = new Float32Array(boundsSAB);
const nm = new Int32Array(metaSAB);
let nNodes = 0;
const LEAF = 4;
const BINS = 16;

const centroid = (t, ax) => (ax === 0 ? cx[t] : ax === 1 ? cy[t] : cz[t]);

function build(start, count) {
  const node = nNodes++;
  const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = start; i < start + count; i++) {
    const t = triIdx[i];
    for (let c = 0; c < 3; c++) {
      if (tlo[t * 3 + c] < b[c]) b[c] = tlo[t * 3 + c];
      if (thi[t * 3 + c] > b[3 + c]) b[3 + c] = thi[t * 3 + c];
    }
  }
  for (let c = 0; c < 6; c++) nb[node * 6 + c] = b[c];

  if (count <= LEAF) {
    nm[node * 2] = start;
    nm[node * 2 + 1] = count;
    return node;
  }

  // pick the axis with the widest centroid spread, then bin it
  let ax = 0;
  let best = -1;
  const clo = [Infinity, Infinity, Infinity];
  const chi = [-Infinity, -Infinity, -Infinity];
  for (let i = start; i < start + count; i++) {
    const t = triIdx[i];
    for (let c = 0; c < 3; c++) {
      const v = centroid(t, c);
      if (v < clo[c]) clo[c] = v;
      if (v > chi[c]) chi[c] = v;
    }
  }
  for (let c = 0; c < 3; c++) {
    if (chi[c] - clo[c] > best) { best = chi[c] - clo[c]; ax = c; }
  }
  if (best <= 1e-9) {
    nm[node * 2] = start;
    nm[node * 2 + 1] = count;
    return node;
  }

  const binN = new Int32Array(BINS);
  const binB = new Float32Array(BINS * 6).fill(0);
  for (let k = 0; k < BINS; k++) {
    binB[k * 6] = Infinity; binB[k * 6 + 1] = Infinity; binB[k * 6 + 2] = Infinity;
    binB[k * 6 + 3] = -Infinity; binB[k * 6 + 4] = -Infinity; binB[k * 6 + 5] = -Infinity;
  }
  const k1 = BINS / (chi[ax] - clo[ax]);
  for (let i = start; i < start + count; i++) {
    const t = triIdx[i];
    const k = Math.min(BINS - 1, Math.floor((centroid(t, ax) - clo[ax]) * k1));
    binN[k]++;
    for (let c = 0; c < 3; c++) {
      if (tlo[t * 3 + c] < binB[k * 6 + c]) binB[k * 6 + c] = tlo[t * 3 + c];
      if (thi[t * 3 + c] > binB[k * 6 + 3 + c]) binB[k * 6 + 3 + c] = thi[t * 3 + c];
    }
  }
  const area = (x) => {
    const dx = Math.max(0, x[3] - x[0]);
    const dy = Math.max(0, x[4] - x[1]);
    const dz = Math.max(0, x[5] - x[2]);
    return dx * dy + dy * dz + dz * dx;
  };
  let bestCost = Infinity;
  let bestSplit = -1;
  for (let s = 1; s < BINS; s++) {
    const L = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    const R = L.slice();
    let nL = 0;
    let nR = 0;
    for (let k = 0; k < s; k++) {
      if (!binN[k]) continue;
      nL += binN[k];
      for (let c = 0; c < 3; c++) {
        if (binB[k * 6 + c] < L[c]) L[c] = binB[k * 6 + c];
        if (binB[k * 6 + 3 + c] > L[3 + c]) L[3 + c] = binB[k * 6 + 3 + c];
      }
    }
    for (let k = s; k < BINS; k++) {
      if (!binN[k]) continue;
      nR += binN[k];
      for (let c = 0; c < 3; c++) {
        if (binB[k * 6 + c] < R[c]) R[c] = binB[k * 6 + c];
        if (binB[k * 6 + 3 + c] > R[3 + c]) R[3 + c] = binB[k * 6 + 3 + c];
      }
    }
    if (!nL || !nR) continue;
    const cost = nL * area(L) + nR * area(R);
    if (cost < bestCost) { bestCost = cost; bestSplit = s; }
  }
  if (bestSplit < 0) {
    nm[node * 2] = start;
    nm[node * 2 + 1] = count;
    return node;
  }

  let i = start;
  let j = start + count - 1;
  while (i <= j) {
    const t = triIdx[i];
    const k = Math.min(BINS - 1, Math.floor((centroid(t, ax) - clo[ax]) * k1));
    if (k < bestSplit) i++;
    else { triIdx[i] = triIdx[j]; triIdx[j] = t; j--; }
  }
  const nLeft = i - start;
  if (nLeft === 0 || nLeft === count) {
    nm[node * 2] = start;
    nm[node * 2 + 1] = count;
    return node;
  }
  nm[node * 2 + 1] = 0;
  build(start, nLeft);
  nm[node * 2] = build(start + nLeft, count - nLeft);   // right child index
  return node;
}
build(0, NT);
console.timeEnd('bvh');
console.log(`bvh nodes: ${nNodes.toLocaleString()}`);

/* ── camera, fitted to the object ─────────────────────────────────────────── */
/* A long lens: a product shot at 35mm-equivalent looks like a snapshot, and
   the perspective divergence on the two rails is the giveaway. */
const DIST = 5.2;
const cyaw = Math.cos(YAW); const syaw = Math.sin(YAW);
const cpit = Math.cos(PITCH); const spit = Math.sin(PITCH);
const toView = (p) => {
  const x1 = p[0] * cyaw + p[2] * syaw;
  const z1 = -p[0] * syaw + p[2] * cyaw;
  return [x1, p[1] * cpit - z1 * spit, p[1] * spit + z1 * cpit];
};
let fx = -Infinity;
let fy = -Infinity;
if (FIT === 'spin') {
  /* Every seventh vertex over 36 yaws: the extremes of a machined assembly are
     corners and rims, which survive that sampling, and the margin below covers
     what does not. */
  for (let a = 0; a < 36; a++) {
    const y2 = (a / 36) * Math.PI * 2;
    const c2 = Math.cos(y2); const s2 = Math.sin(y2);
    for (let i = 0; i < NV; i += 7) {
      const x = pos[i * 3]; const y = pos[i * 3 + 1]; const z = pos[i * 3 + 2];
      const x1 = x * c2 + z * s2;
      const z1 = -x * s2 + z * c2;
      const y2v = y * cpit - z1 * spit;
      const z2v = y * spit + z1 * cpit;
      const w = DIST - z2v;
      if (Math.abs(x1) / w > fx) fx = Math.abs(x1) / w;
      if (Math.abs(y2v) / w > fy) fy = Math.abs(y2v) / w;
    }
  }
  fx *= 1.03; fy *= 1.03;
} else {
  for (let i = 0; i < NV; i++) {
    const v = toView([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]]);
    const w = DIST - v[2];
    fx = Math.max(fx, Math.abs(v[0]) / w);
    fy = Math.max(fy, Math.abs(v[1]) / w);
  }
}
const FOC = Math.min((W * 0.5) / (fx * 1.075), (H * 0.5) / (fy * 1.045));
console.log(`camera: dist ${DIST}, focal ${FOC.toFixed(0)}px on ${W}x${H}`);

/* ── render ───────────────────────────────────────────────────────────────── */
const imgSAB = new SharedArrayBuffer(W * H * 4 * 4);
const rowSAB = new SharedArrayBuffer(4);
new Int32Array(rowSAB)[0] = 0;

const NW = Math.max(1, Math.min(availableParallelism(), 16));
console.log(`tracing on ${NW} workers — ${(W * H * SPP * (DIFF + SPEC) / 1e6).toFixed(0)}M secondary rays`);
console.time('trace');

const shared = {
  posSAB, nrmSAB, grpSAB, idxSAB, boundsSAB, metaSAB, imgSAB, rowSAB,
  W, H, SPP, DIFF, SPEC, DIST, FOC, YAW, PITCH, NT,
};
await Promise.all(Array.from({ length: NW }, (_, id) => new Promise((res, rej) => {
  const wk = new Worker(new URL('./trace-worker.mjs', import.meta.url), {
    workerData: { ...shared, id },
  });
  wk.on('message', (m) => { if (m.done) res(); });
  wk.on('error', rej);
})));
console.timeEnd('trace');

/* ── tone map and write ───────────────────────────────────────────────────── */
const img = new Float32Array(imgSAB);
const out = Buffer.alloc(W * H * 4);
/* ACES-ish filmic curve: the specular hits on turned steel run well past 1.0
   and a straight clamp turns every one of them into a flat white blob. */
const EXPOSURE = 1.15;
const tone = (x) => {
  const a = 2.51; const b = 0.03; const c = 2.43; const d = 0.59; const e = 0.14;
  return Math.max(0, Math.min(1, (x * (a * x + b)) / (x * (c * x + d) + e)));
};
for (let i = 0; i < W * H; i++) {
  const a = img[i * 4 + 3];
  if (a < 1e-4) { out[i * 4 + 3] = 0; continue; }
  for (let c = 0; c < 3; c++) {
    out[i * 4 + c] = Math.round(255 * (tone((img[i * 4 + c] / a) * EXPOSURE) ** (1 / 2.2)));
  }
  out[i * 4 + 3] = Math.round(Math.min(1, a / SPP) * 255);
}

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return (b) => {
    let c = -1;
    for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();
const chunk = (ty, d) => {
  const l = Buffer.alloc(4); l.writeUInt32BE(d.length);
  const body = Buffer.concat([Buffer.from(ty, 'ascii'), d]);
  const c = Buffer.alloc(4); c.writeUInt32BE(CRC(body));
  return Buffer.concat([l, body, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
const rows = Buffer.alloc(H * (W * 4 + 1));
for (let y = 0; y < H; y++) out.copy(rows, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
writeFileSync(`${WORK}${OUTNAME}.png`, Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr), chunk('IDAT', deflateSync(rows, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
]));
console.log(`wrote ${OUTNAME}.png`);
