/**
 * Derive a brain shape from the supplied 3MF, offline.
 *
 * The runtime must not parse a 4.5 MB mesh, so everything expensive happens
 * here and only a compact result is written to src/lib/brainShape.js: a
 * sagittal silhouette, a coarse occupancy mask used to keep streamlines
 * inside the brain, the cortical boundary, and a decimated 3D point cloud.
 *
 * Run with:  node tools/brain-extract.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { dir } from './lib/paths.mjs';

const DIR = dir('../', import.meta.url);
const MODEL = DIR + 'tmp/motion-init/brain3D.3mf';

/**
 * A 3MF is a ZIP. Rather than shelling out to unzip — or leaving an unpacked
 * copy lying around that can drift from the source — read the archive
 * directly. Only one entry is needed and zlib is already in Node.
 */
function readZipEntry(file, want) {
  const buf = readFileSync(file);
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('not a zip: ' + file);

  let p = buf.readUInt32LE(eocd + 16);                 // central directory
  const count = buf.readUInt16LE(eocd + 10);
  for (let i = 0; i < count; i++) {
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (name === want) {
      const method = buf.readUInt16LE(p + 10);
      const size = buf.readUInt32LE(p + 20);
      const lh = buf.readUInt32LE(p + 42);             // local header offset
      const data = lh + 30 + buf.readUInt16LE(lh + 26) + buf.readUInt16LE(lh + 28);
      const raw = buf.subarray(data, data + size);
      return method === 0 ? raw : inflateRawSync(raw);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`${want} not found in ${file}`);
}

const xml = readZipEntry(MODEL, '3D/3dmodel.model').toString('utf8');

/* ── vertices ─────────────────────────────────────────────────────────── */
const verts = [];
const vre = /<vertex\s+x="([^"]+)"\s+y="([^"]+)"\s+z="([^"]+)"/g;
let m;
while ((m = vre.exec(xml))) verts.push([+m[1], +m[2], +m[3]]);
console.log('vertices:', verts.length);
if (!verts.length) { console.log('sample:', xml.slice(0, 600)); process.exit(1); }

const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
for (const v of verts) for (let k = 0; k < 3; k++) {
  if (v[k] < lo[k]) lo[k] = v[k];
  if (v[k] > hi[k]) hi[k] = v[k];
}
const size = hi.map((h, k) => h - lo[k]);
console.log('bounds min:', lo.map((v) => v.toFixed(1)).join(', '));
console.log('bounds max:', hi.map((v) => v.toFixed(1)).join(', '));
console.log('extent   :', size.map((v) => v.toFixed(1)).join(', '));

/* Work out which axis is which. A brain is longest front-to-back, next
   tallest, and narrowest across — so sorting the extents identifies them
   without having to guess at the exporter's convention. */
const order = [0, 1, 2].sort((a, b) => size[b] - size[a]);
const AP = order[0], SI = order[1], LR = order[2];
console.log(`axes → anterior-posterior: ${'xyz'[AP]}  superior-inferior: ${'xyz'[SI]}  left-right: ${'xyz'[LR]}`);

const centre = lo.map((l, k) => l + size[k] / 2);
const scale = 1 / Math.max(...size);
const nrm = (v) => [
  (v[AP] - centre[AP]) * scale,
  (v[SI] - centre[SI]) * scale,
  (v[LR] - centre[LR]) * scale,
];

/* ── occupancy on the sagittal projection ─────────────────────────────── */
const N = 72;
const grid = new Float32Array(N * N);          // how much depth sits behind each cell
for (const v of verts) {
  const [u, s] = nrm(v);
  const gx = Math.floor((u + 0.5) * N), gy = Math.floor((s + 0.5) * N);
  if (gx < 0 || gy < 0 || gx >= N || gy >= N) continue;
  grid[gy * N + gx] += 1;
}
let peak = 0;
for (const g of grid) if (g > peak) peak = g;
const mask = Array.from(grid, (g) => (g / peak > 0.006 ? 1 : 0));

// close single-cell gaps so the mask is solid rather than speckled
const filled = mask.slice();
for (let y = 1; y < N - 1; y++) {
  for (let x = 1; x < N - 1; x++) {
    if (mask[y * N + x]) continue;
    let n = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) n += mask[(y + dy) * N + x + dx];
    if (n >= 3) filled[y * N + x] = 1;
  }
}
const occupied = filled.reduce((a, b) => a + b, 0);
console.log(`mask: ${N}×${N}, ${occupied} cells occupied (${(occupied / (N * N) * 100).toFixed(0)}%)`);

/* ── silhouette outline, by marching the mask boundary ────────────────── */
const at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0 : filled[y * N + x]);
// for each column, the topmost and bottommost occupied cell
const top = [], bot = [];
for (let x = 0; x < N; x++) {
  let t = -1, b = -1;
  for (let y = 0; y < N; y++) if (at(x, y)) { if (t < 0) t = y; b = y; }
  top.push(t); bot.push(b);
}
const outline = [];
for (let x = 0; x < N; x++) if (top[x] >= 0) outline.push([x, top[x]]);
for (let x = N - 1; x >= 0; x--) if (bot[x] >= 0) outline.push([x, bot[x]]);
const toUnit = ([x, y]) => [+((x + 0.5) / N - 0.5).toFixed(4), +((y + 0.5) / N - 0.5).toFixed(4)];
const poly = outline.map(toUnit);
console.log('outline points:', poly.length);

/* ── emit in SCENE coordinates ────────────────────────────────────────────
   The scene uses u = anterior(−) to posterior(+) and v = superior(−) to
   inferior(+), with v growing downward like a screen axis. The mask rows are
   flipped here so the runtime never has to remember to do it.             */
const rows = [];
for (let y = N - 1; y >= 0; y--) {
  const row = [];
  for (let x = 0; x < N; x++) row.push(at(x, y));
  rows.push(row);
}
const flat = rows.flat();

// six cells per character, printable ASCII
let bits = '';
for (let i = 0; i < flat.length; i += 6) {
  let b = 0;
  for (let k = 0; k < 6; k++) b |= (flat[i + k] || 0) << k;
  bits += String.fromCharCode(48 + b);
}

const cell = (x, y) => [+((x + 0.5) / N - 0.5).toFixed(4), +((y + 0.5) / N - 0.5).toFixed(4)];

// outline, walking the top edge left-to-right then the bottom edge back
const topR = [], botR = [];
for (let x = 0; x < N; x++) {
  let t = -1, b = -1;
  for (let y = 0; y < N; y++) if (rows[y][x]) { if (t < 0) t = y; b = y; }
  topR.push(t); botR.push(b);
}
const ring = [];
for (let x = 0; x < N; x++) if (topR[x] >= 0) ring.push(cell(x, topR[x]));
for (let x = N - 1; x >= 0; x--) if (botR[x] >= 0) ring.push(cell(x, botR[x]));

// smooth it, or the silhouette reads as a staircase
const smoothRing = ring.map((_, i) => {
  let su = 0, sv = 0;
  for (let k = -2; k <= 2; k++) {
    const p = ring[(i + k + ring.length) % ring.length];
    su += p[0]; sv += p[1];
  }
  return [+(su / 5).toFixed(4), +(sv / 5).toFixed(4)];
});

/* Cortical boundary of the cerebrum — the corona radiata fans out to this,
   so the fan ends on the real outline instead of a guessed arc. Restricted
   to the upper two thirds, which excludes the brainstem stalk. */
const cortex = [];
for (let x = 2; x < N - 2; x += 1) {
  const t = topR[x];
  if (t < 0 || t > N * 0.62) continue;
  cortex.push(cell(x, t + 2));
}

/* ── a decimated 3D point cloud, for the hero ─────────────────────────────
   The mesh's own vertices bunch wherever it happens to be dense, so they are
   binned onto a grid and one kept per cell. That spreads them evenly over the
   surface, which is what makes the cloud read as a shape rather than as a
   few crowded patches.                                                    */
const G = +(process.env.CLOUD_G || 82);
const cells = new Map();
for (const v of verts) {
  const p = nrm(v);                                   // [ap, si, lr], centred
  const key = `${Math.floor((p[0] + 0.5) * G)},${Math.floor((p[1] + 0.5) * G)},${Math.floor((p[2] + 0.5) * G)}`;
  if (!cells.has(key)) cells.set(key, p);
}
const cloud = [...cells.values()];
// u = anterior(−) to posterior(+), v = superior(−) to inferior(+), w = across
const bytes = new Uint8Array(cloud.length * 3);
cloud.forEach((p, i) => {
  const q = [p[0], -p[1], p[2]];
  for (let k = 0; k < 3; k++) {
    bytes[i * 3 + k] = Math.max(0, Math.min(255, Math.round((q[k] + 0.5) * 255)));
  }
});
const points = Buffer.from(bytes).toString('base64');
console.log(`cloud: ${cloud.length} points, ${(points.length / 1024).toFixed(1)}kB base64`);

/* Also emit it as a module, so the scene file can be lifted into the repo
   unchanged and this stays a build-time artefact. */
writeFileSync(DIR + 'src/lib/brainShape.js',
  '/**\n'
  + ' * Sagittal brain shape, derived offline from tmp/motion-init/brain3D.3mf.\n'
  + ' *\n'
  + ' * The mesh is 19,286 vertices and 4.5 MB of XML — far too much to parse at\n'
  + ' * runtime for a background. It is reduced here to a silhouette, an\n'
  + ' * occupancy mask and the cortical boundary, which is all the tractography\n'
  + ' * scene needs to be genuinely brain-shaped.\n'
  + ' *\n'
  + ' *   u  anterior (−) to posterior (+)\n'
  + ' *   v  superior (−) to inferior (+), growing downward like a screen axis\n'
  + ' *\n'
  + ' * mask: one character per six cells, six bits each, row-major over n × n.\n'
  + ' * Regenerate with brain-extract.mjs.\n'
  + ' */\n'
  + 'export const BRAIN = '
  + JSON.stringify({ n: N, mask: bits, outline: smoothRing, cortex, points }) + ';\n');

console.log('mask chars:', bits.length, '| outline:', smoothRing.length, '| cortex:', cortex.length);

/* ── previews, so the orientation can be checked rather than assumed ──── */
console.log('\nSAGITTAL (superior up):');
let art = '';
for (let y = N - 1; y >= 0; y -= 2) {
  for (let x = 0; x < N; x++) art += at(x, y) ? '#' : '.';
  art += '\n';
}
console.log(art);

// axial: anterior-posterior against left-right, to confirm the axis guess
const ax = new Float32Array(N * N);
for (const v of verts) {
  const [u, , l] = nrm(v);
  const gx = Math.floor((u + 0.5) * N), gy = Math.floor((l + 0.5) * N);
  if (gx >= 0 && gy >= 0 && gx < N && gy < N) ax[gy * N + gx] += 1;
}
let apk = 0;
for (const g of ax) if (g > apk) apk = g;
console.log('AXIAL (AP across, LR down) — should be roughly oval:');
let art2 = '';
for (let y = 0; y < N; y += 3) {
  for (let x = 0; x < N; x++) art2 += ax[y * N + x] / apk > 0.006 ? '#' : '.';
  art2 += '\n';
}
console.log(art2);
