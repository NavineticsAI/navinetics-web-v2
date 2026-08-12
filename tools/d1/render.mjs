/* Stage of tools/d1-frame.mjs. Run that, not this. */
/**
 * Shade the tessellated frame offline.
 *
 * A z-buffered rasteriser with interpolated normals, three lights and a
 * screen-space occlusion pass, rendered at 2x and box-filtered down. Offline,
 * so quality costs render time rather than the visitor's frame budget — which
 * is the whole reason the page ships pictures of a mesh rather than the mesh.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dir } from '../lib/paths.mjs';

const ROOT = dir('../../', import.meta.url);
const DIR = ROOT + 'tools/.d1/';
const SS = 2;                                  // supersample factor
const OUT = +(process.argv[2] || 1000);        // output edge, px
const W = OUT * SS;

const raw = readFileSync(`${DIR}mesh.bin`);
const NV = raw.readUInt32LE(0);
const pos = new Float32Array(NV * 3);
const nor = new Float32Array(NV * 3);
const grp = new Uint8Array(NV);
for (let i = 0, o = 4; i < NV; i++, o += 25) {
  pos[i * 3] = raw.readFloatLE(o); pos[i * 3 + 1] = raw.readFloatLE(o + 4); pos[i * 3 + 2] = raw.readFloatLE(o + 8);
  nor[i * 3] = raw.readFloatLE(o + 12); nor[i * 3 + 1] = raw.readFloatLE(o + 16); nor[i * 3 + 2] = raw.readFloatLE(o + 20);
  grp[i] = raw.readUInt8(o + 24);
}
const lo = [Infinity, Infinity, Infinity]; const hi = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < NV; i++) for (let c = 0; c < 3; c++) {
  const v = pos[i * 3 + c];
  if (v < lo[c]) lo[c] = v; if (v > hi[c]) hi[c] = v;
}
const mid = lo.map((v, c) => (v + hi[c]) / 2);
const span = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
console.log(`${NV / 3} triangles, extent ${hi.map((v, c) => (v - lo[c]).toFixed(0)).join('×')} mm`);

/* ── buffers ──────────────────────────────────────────────────────────────── */
const zb = new Float32Array(W * W);
const nb = new Float32Array(W * W * 3);
const ib = new Uint8Array(W * W);      // group id + 1, 0 = background
const vz = new Float32Array(W * W);    // view-space depth, for occlusion

/* Materials, measured off NaviNetics' own photographs of the real frame
   rather than chosen (tools/d1/../../ — see the sampler note in the commit).
   The body blue reads #2e6ab1 / #296796 across two photographs, its shadows
   #102045 and its highlights #70b2e5. Crucially, half the frame is NOT blue:
   between 48% and 69% of the frame pixels in those photographs are bare
   metal, because the fasteners, knobs and the microdrive column are steel.
   Rendering the whole assembly one colour was the single biggest reason the
   first pass did not look like the object.

   Values are linear — the shader gammas at the end — and are the measured
   sRGB divided through by the diffuse term a mid-lit surface receives. */
const BLUE = [0.032, 0.195, 0.595];
const BLUE_DK = [0.024, 0.150, 0.470];
const STEEL = [0.700, 0.735, 0.780];
const STEEL_HI = [0.760, 0.790, 0.830];
/*            arc    rails   drive   stage   base      fastener */
const GCOL = [BLUE, BLUE, STEEL, BLUE, BLUE_DK, STEEL_HI];
/* Anodised aluminium is far less specular than bare turned steel. */
const SPEC = [0.55, 0.55, 1.15, 0.55, 0.5, 1.3];
const LIT = [0.510, 0.729, 0.851];   // sg-300 #82bad9
const DIM = [0.030, 0.062, 0.092];

function render(yaw, pitch) {
  /* -Infinity, not +Infinity: view space here has +z toward the camera, so
     the depth test keeps the LARGER z and every fragment loses against a
     +Infinity seed. */
  zb.fill(-Infinity); nb.fill(0); ib.fill(0); vz.fill(0);
  const cy = Math.cos(yaw); const sy = Math.sin(yaw);
  const cp = Math.cos(pitch); const sp = Math.sin(pitch);
  const D = span * 3.1;            // camera distance
  const F = W * 0.86 * (D / span); // focal, chosen so the model fills the frame
  const cxs = W / 2; const cys = W / 2;

  const sx = new Float32Array(3); const sy2 = new Float32Array(3);
  const sz = new Float32Array(3); const nx = new Float32Array(9);

  for (let t = 0; t < NV; t += 3) {
    for (let k = 0; k < 3; k++) {
      const i = t + k;
      const x = pos[i * 3] - mid[0]; const y = pos[i * 3 + 1] - mid[1]; const z = pos[i * 3 + 2] - mid[2];
      const x1 = x * cy + z * sy; const z1 = -x * sy + z * cy;
      const y2 = y * cp - z1 * sp; const z2 = y * sp + z1 * cp;
      const w = D - z2;
      sx[k] = cxs + (x1 * F) / w; sy2[k] = cys - (y2 * F) / w; sz[k] = z2;
      const a = nor[i * 3]; const b = nor[i * 3 + 1]; const c = nor[i * 3 + 2];
      const a1 = a * cy + c * sy; const c1 = -a * sy + c * cy;
      nx[k * 3] = a1; nx[k * 3 + 1] = b * cp - c1 * sp; nx[k * 3 + 2] = b * sp + c1 * cp;
    }
    let x0 = Math.max(0, Math.floor(Math.min(sx[0], sx[1], sx[2])));
    let x1b = Math.min(W - 1, Math.ceil(Math.max(sx[0], sx[1], sx[2])));
    let y0 = Math.max(0, Math.floor(Math.min(sy2[0], sy2[1], sy2[2])));
    let y1b = Math.min(W - 1, Math.ceil(Math.max(sy2[0], sy2[1], sy2[2])));
    if (x0 > x1b || y0 > y1b) continue;
    const d = (sy2[1] - sy2[2]) * (sx[0] - sx[2]) + (sx[2] - sx[1]) * (sy2[0] - sy2[2]);
    if (Math.abs(d) < 1e-9) continue;
    const g = grp[t] + 1;
    for (let py = y0; py <= y1b; py++) {
      for (let px = x0; px <= x1b; px++) {
        const fx = px + 0.5; const fy = py + 0.5;
        const l0 = ((sy2[1] - sy2[2]) * (fx - sx[2]) + (sx[2] - sx[1]) * (fy - sy2[2])) / d;
        if (l0 < 0) continue;
        const l1 = ((sy2[2] - sy2[0]) * (fx - sx[2]) + (sx[0] - sx[2]) * (fy - sy2[2])) / d;
        if (l1 < 0) continue;
        const l2 = 1 - l0 - l1;
        if (l2 < 0) continue;
        const z = l0 * sz[0] + l1 * sz[1] + l2 * sz[2];
        const o = py * W + px;
        if (z <= zb[o]) continue;      // +z is toward the camera
        zb[o] = z; vz[o] = z; ib[o] = g;
        nb[o * 3] = l0 * nx[0] + l1 * nx[3] + l2 * nx[6];
        nb[o * 3 + 1] = l0 * nx[1] + l1 * nx[4] + l2 * nx[7];
        nb[o * 3 + 2] = l0 * nx[2] + l1 * nx[5] + l2 * nx[8];
      }
    }
  }
  /* zb was seeded to Infinity but the test wants "nearer = larger z"; reseed
     handled by treating untouched pixels via ib === 0. */
}

/* screen-space occlusion: how much nearer geometry crowds each pixel */
function occlusion() {
  const ao = new Float32Array(W * W).fill(1);
  const R = Math.max(4, Math.round(W * 0.012));
  const OFF = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = R * (0.35 + 0.65 * ((i % 4) + 1) / 4);
    OFF.push([Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r)]);
  }
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const o = y * W + x;
      if (!ib[o]) continue;
      const z = vz[o];
      let occ = 0;
      for (const [dx, dy] of OFF) {
        const sx2 = x + dx; const sy3 = y + dy;
        if (sx2 < 0 || sy3 < 0 || sx2 >= W || sy3 >= W) continue;
        const o2 = sy3 * W + sx2;
        if (!ib[o2]) continue;
        const dz = vz[o2] - z;
        if (dz > span * 0.004 && dz < span * 0.09) occ++;
      }
      ao[o] = Math.max(0.22, 1 - (occ / OFF.length) * 1.25);
    }
  }
  return ao;
}

const norm3 = (a, b, c) => { const l = Math.hypot(a, b, c) || 1; return [a / l, b / l, c / l]; };
const KEY = norm3(-0.45, 0.72, 0.62);
const FILL = norm3(0.78, 0.12, 0.42);
const RIM = norm3(0.15, -0.35, -0.85);

function shade(ao, highlight) {
  const img = Buffer.alloc(OUT * OUT * 4);
  const acc = new Float32Array(OUT * OUT * 4);
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const o = y * W + x;
      let r = 0; let g = 0; let b = 0; let a = 0;
      if (ib[o]) {
        const gi = ib[o] - 1;
        let n = norm3(nb[o * 3], nb[o * 3 + 1], nb[o * 3 + 2]);
        if (n[2] < 0) n = [-n[0], -n[1], -n[2]];
        let base = GCOL[gi];
        let gain = 1;
        let sk = SPEC[gi];
        if (highlight != null) {
          if (highlight.has(gi)) { base = LIT; gain = 1.12; } else { base = DIM; gain = 0.8; sk *= 0.35; }
        }
        const kd = Math.max(0, n[0] * KEY[0] + n[1] * KEY[1] + n[2] * KEY[2]);
        const fd = Math.max(0, n[0] * FILL[0] + n[1] * FILL[1] + n[2] * FILL[2]);
        const rd = Math.pow(Math.max(0, n[0] * RIM[0] + n[1] * RIM[1] + n[2] * RIM[2]), 2.2);
        const fres = Math.pow(1 - Math.max(0, n[2]), 3.4);
        const hv = norm3(KEY[0], KEY[1], KEY[2] + 1);
        const spec = Math.pow(Math.max(0, n[0] * hv[0] + n[1] * hv[1] + n[2] * hv[2]), 46) * 0.85;
        /* Ambient is a sky/ground pair rather than a constant: cool from
           above, deep navy from below, so unlit faces still read as blue
           metal instead of neutral grey. */
        const up = n[1] * 0.5 + 0.5;
        const ambR = 0.085 * up + 0.030; const ambG = 0.125 * up + 0.045; const ambB = 0.175 * up + 0.062;
        const k = ao[o];
        const dif = kd * 0.88 + fd * 0.20;
        r = (base[0] * (ambR + dif) * k + spec * sk * 0.88 + rd * 0.16 + fres * 0.07) * gain;
        g = (base[1] * (ambG + dif) * k + spec * sk * 0.94 + rd * 0.24 + fres * 0.11) * gain;
        b = (base[2] * (ambB + dif) * k + spec * sk + rd * 0.34 + fres * 0.17) * gain;
        a = 1;
      }
      const oy = Math.floor(y / SS); const ox = Math.floor(x / SS);
      const ao2 = (oy * OUT + ox) * 4;
      acc[ao2] += r; acc[ao2 + 1] += g; acc[ao2 + 2] += b; acc[ao2 + 3] += a;
    }
  }
  const n = SS * SS;
  for (let i = 0; i < OUT * OUT; i++) {
    const al = acc[i * 4 + 3] / n;
    const gm = (v) => Math.max(0, Math.min(255, Math.round(255 * Math.pow(Math.max(0, v / n / (al || 1)), 1 / 2.2))));
    img[i * 4] = gm(acc[i * 4]); img[i * 4 + 1] = gm(acc[i * 4 + 1]); img[i * 4 + 2] = gm(acc[i * 4 + 2]);
    img[i * 4 + 3] = Math.round(al * 255);
  }
  return img;
}

/* ── PNG ──────────────────────────────────────────────────────────────────── */
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return (b) => { let c = -1; for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
})();
function png(path, w, h, rgba) {
  const chunk = (ty, d) => {
    const l = Buffer.alloc(4); l.writeUInt32BE(d.length);
    const body = Buffer.concat([Buffer.from(ty, 'ascii'), d]);
    const c = Buffer.alloc(4); c.writeUInt32BE(CRC(body));
    return Buffer.concat([l, body, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const rows = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) rgba.copy(rows, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  writeFileSync(path, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(rows, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]));
}

const D2R = Math.PI / 180;
const mode = process.argv[3] || 'one';
if (mode === 'one') {
  console.time('frame');
  render(38 * D2R, -18 * D2R);
  const ao = occlusion();
  png(`${DIR}r-settled.png`, OUT, OUT, shade(ao, null));
  png(`${DIR}r-rails.png`, OUT, OUT, shade(ao, new Set([0, 1, 3])));
  console.timeEnd('frame');
  console.log('wrote r-settled.png, r-rails.png');
}

/* The turntable the scroll scrubs: one full revolution ending on the settled
   angle, the pitch easing in over the same travel. Frame N-1 is the pose the
   callouts point at, so the highlight stills are rendered from it. */
const SETTLE = { yaw: 38 * D2R, pitch: -18 * D2R };
if (mode === 'turn') {
  const N = +(process.argv[4] || 48);
  console.time('turntable');
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    render(SETTLE.yaw - Math.PI * 2 * (1 - e), SETTLE.pitch + (1 - e) * -16 * D2R);
    png(`${DIR}turn/f${String(i).padStart(2, '0')}.png`, OUT, OUT, shade(occlusion(), null));
    if (i % 8 === 0) process.stdout.write(`  ${i}/${N}\r`);
  }
  console.timeEnd('turntable');
  console.log(`wrote ${N} frames`);
}

/* One still per geometry group. Not used by the page — the hero labels nothing
   — but kept as a diagnostic: it is how you check that a grouping change did
   what you meant, by looking at each group lit on its own. */
if (mode === 'groups') {
  render(SETTLE.yaw, SETTLE.pitch);
  const ao = occlusion();
  ['arc', 'rails', 'drive', 'stage', 'base', 'fastener'].forEach((g, i) => {
    png(`${DIR}turn/grp-${g}.png`, OUT, OUT, shade(ao, new Set([i])));
  });
  png(`${DIR}turn/grp-all.png`, OUT, OUT, shade(ao, null));
  console.log('wrote 6 group stills + the neutral frame');
}
