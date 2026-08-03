/* Bounds and occupancy of a binary STL, so the demo's localiser matches the
 * real CAD rather than being eyeballed from a screenshot.
 *
 * Prints the overall bounding box plus a coarse occupancy grid per axis pair,
 * which is what tells you where the plates actually are — a bounding box
 * alone cannot distinguish a solid block from an open three-sided frame. */
import { openSync, readSync, statSync, closeSync } from 'node:fs';

const file = process.argv[2];
const fd = openSync(file, 'r');
const size = statSync(file).size;

const head = Buffer.alloc(84);
readSync(fd, head, 0, 84, 0);
const nTri = head.readUInt32LE(80);
const expected = 84 + nTri * 50;
if (expected !== size) {
  console.error(`not a binary STL (header says ${nTri} tris = ${expected} bytes, file is ${size})`);
  process.exit(1);
}
console.log(`${file}\n  triangles: ${nTri.toLocaleString()}`);

const lo = [Infinity, Infinity, Infinity];
const hi = [-Infinity, -Infinity, -Infinity];
const verts = [];

// stream it; 16 MB is fine to read in chunks rather than all at once
const CHUNK = 50 * 20000;
const buf = Buffer.alloc(CHUNK);
let off = 84;
while (off < size) {
  const n = readSync(fd, buf, 0, Math.min(CHUNK, size - off), off);
  for (let p = 0; p + 50 <= n; p += 50) {
    for (let v = 0; v < 3; v++) {
      const b = p + 12 + v * 12;
      const x = buf.readFloatLE(b), y = buf.readFloatLE(b + 4), z = buf.readFloatLE(b + 8);
      if (x < lo[0]) lo[0] = x; if (x > hi[0]) hi[0] = x;
      if (y < lo[1]) lo[1] = y; if (y > hi[1]) hi[1] = y;
      if (z < lo[2]) lo[2] = z; if (z > hi[2]) hi[2] = z;
      verts.push(x, y, z);
    }
  }
  off += n;
}
closeSync(fd);

const f = (v) => v.map((x) => x.toFixed(1)).join(', ');
console.log(`  bounds min: ${f(lo)}\n  bounds max: ${f(hi)}`);
console.log(`  extent    : ${f(hi.map((v, i) => v - lo[i]))}`);

/* Occupancy on each axis, as a histogram of vertex counts. A three-sided
   frame shows as spikes at the plate positions and near-nothing between. */
const G = 40;
for (const [ax, name] of [[0, 'X'], [1, 'Y'], [2, 'Z']]) {
  const bins = new Array(G).fill(0);
  const span = hi[ax] - lo[ax] || 1;
  for (let i = ax; i < verts.length; i += 3) {
    const k = Math.min(G - 1, Math.floor((verts[i] - lo[ax]) / span * G));
    bins[k]++;
  }
  const max = Math.max(...bins);
  console.log(`\n  ${name}  ${lo[ax].toFixed(0)} → ${hi[ax].toFixed(0)} mm`);
  bins.forEach((c, k) => {
    const at = (lo[ax] + (k + 0.5) / G * span).toFixed(0).padStart(5);
    console.log(`   ${at}  ${'#'.repeat(Math.round(c / max * 46))}`);
  });
}
