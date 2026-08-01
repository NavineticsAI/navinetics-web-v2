/* Do the point cloud and the sagittal mask actually agree?
 *
 * They are produced by different paths in the extractor, and the hero draws
 * the cloud while the tract field is defined against the mask. If the two
 * disagree by a flip, tracts sit outside the head. This projects the cloud
 * into the mask's grid and prints both, so the answer is looked at rather
 * than reasoned about. */
import { BRAIN } from '../src/lib/brainShape.js';

const N = BRAIN.n;
const occ = new Uint8Array(N * N);
for (let i = 0; i < N * N; i++) {
  occ[i] = ((BRAIN.mask.charCodeAt((i / 6) | 0) - 48) >> (i % 6)) & 1;
}

const bin = Buffer.from(BRAIN.points, 'base64');
const n = bin.length / 3;
const proj = new Uint8Array(N * N);
for (let i = 0; i < n; i++) {
  const x = bin[i * 3] / 255 - 0.5;          // AP
  const y = bin[i * 3 + 1] / 255 - 0.5;      // SI as stored for the cloud
  const cx = Math.min(N - 1, Math.max(0, ((x + 0.5) * N) | 0));
  const cy = Math.min(N - 1, Math.max(0, ((y + 0.5) * N) | 0));
  proj[cy * N + cx] = 1;
}

const row = (a, y) => {
  let s = '';
  for (let x = 0; x < N; x++) s += a[y * N + x] ? '#' : '.';
  return s;
};

// Overlap under each candidate transform of the cloud's projection.
const variants = {
  identity: (x, y) => [x, y],
  flipY: (x, y) => [x, N - 1 - y],
  flipX: (x, y) => [N - 1 - x, y],
  flipXY: (x, y) => [N - 1 - x, N - 1 - y],
};
console.log('cloud points:', n, ' mask cells:', occ.reduce((s, v) => s + v, 0));
for (const [name, f] of Object.entries(variants)) {
  let hit = 0, tot = 0;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!proj[y * N + x]) continue;
    tot++;
    const [tx, ty] = f(x, y);
    if (occ[ty * N + tx]) hit++;
  }
  console.log(`${name.padEnd(9)} ${(hit / tot * 100).toFixed(1)}% of cloud lands inside the mask`);
}

console.log('\nMASK (left) vs CLOUD PROJECTION (right), rows top→bottom:');
for (let y = 0; y < N; y += 2) console.log(row(occ, y), ' | ', row(proj, y));
