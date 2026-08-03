/**
 * The D1 hero, out of the assembly CAD.
 *
 * `node tools/d1-frame.mjs` turns src/assets/d1/*.STEP into the 36-frame
 * turntable and three highlight stills in src/assets/d1/turn/. The STEP is
 * gitignored — 73 MB that git would keep every revision of forever — so this
 * only runs on a machine that has the CAD beside it. The renders are committed
 * and are what the site actually loads; if the CAD is absent the tool says so
 * and stops rather than writing anything.
 *
 * WHY RENDER AHEAD OF TIME. The tessellated frame is ~88,000 triangles. Shipped
 * as a mesh with indices and normals that is roughly a megabyte before you draw
 * anything, needs WebGL, and still looks like a CAD viewer. Rendered here it
 * gets three lights, a screen-space occlusion pass and 2x supersampling, and
 * the page pays for a sequence of pictures instead. It also means no geometry
 * goes over the wire: a turntable cannot be turned back into a model.
 *
 * THE STAGES, in order — each is a separate file because each is a separate
 * kind of problem, and the middle one is the only one worth re-running while
 * you tune lighting:
 *
 *   d1/step.mjs        an ISO 10303-21 reader: entity table, argument
 *                      splitting, rigid transforms, de Boor evaluation.
 *   d1/tessellate.mjs  resolves the assembly (82 products, 157 placements —
 *                      read coordinates without this and every part lands on
 *                      the origin), then turns each of the 15,056 trimmed
 *                      faces into triangles. Writes tools/.d1/mesh.bin.
 *   d1/render.mjs      z-buffered rasteriser -> tools/.d1/turn/*.png.
 *   d1/webp.mjs        crops every frame to one shared alpha box, so the
 *                      object cannot jump between frames, and encodes WebP
 *                      through headless Chrome into src/assets/d1/turn/.
 *
 * TOLERANCES AND COUNTS worth knowing before you change anything:
 *   · 91% of faces sit on planes, cylinders, cones, tori or spheres, which
 *     invert into (u,v) in closed form. The remaining 8% are B-spline patches,
 *     nearly all fillets, inverted numerically. 179 faces (1.2%) fail and are
 *     skipped; at hero scale they are not visible, but that is the number to
 *     watch if the model is ever re-exported.
 *   · Stock fasteners are dropped, and they are not a rounding error: the
 *     whole file tessellates to 2.25M triangles and the frame alone to 88k.
 *     Threads are 96% of the geometry and none of the picture.
 *   · The accessory tray is dropped too. It sits at y < 0 in assembly space
 *     while every frame part's centroid is y > 0, which is the whole test.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '');
const CAD = `${ROOT}src/assets/d1/`;
const WORK = `${ROOT}tools/.d1/`;
const OUT = `${ROOT}src/assets/d1/turn/`;

const TOL = 0.5;        // chord tolerance, mm
const SIZE = 960;       // rendered square, px, before the alpha crop
const FRAMES = 36;
const QUALITY = 0.82;

const step = readdirSync(CAD).find((f) => /\.step$/i.test(f));
if (!step) {
  console.log(`\n  No STEP file in ${CAD}`);
  console.log('  The CAD is gitignored on purpose. Put 20186_D003 REV2.STEP there and re-run.');
  console.log('  The committed renders in src/assets/d1/turn/ are untouched.\n');
  process.exit(0);
}
console.log(`\n  source: ${step}`);

mkdirSync(`${WORK}turn`, { recursive: true });
mkdirSync(OUT, { recursive: true });

const run = (file, args) => new Promise((resolve, reject) => {
  const p = spawn(process.execPath, ['--max-old-space-size=8192', `${ROOT}tools/d1/${file}`, ...args], {
    stdio: 'inherit',
  });
  p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${file} exited ${code}`))));
});

console.log('\n── 1 · tessellate ────────────────────────────────────────────');
await run('tessellate.mjs', [String(TOL)]);

console.log('\n── 2 · render ────────────────────────────────────────────────');
/* Clear the PNGs first: a shorter run would otherwise leave the tail of a
   longer one behind, and webp.mjs globs the directory. */
for (const f of readdirSync(`${WORK}turn`)) {
  if (f.endsWith('.png')) rmSync(`${WORK}turn/${f}`);
}
await run('render.mjs', [String(SIZE), 'turn', String(FRAMES)]);

console.log('\n── 3 · encode ────────────────────────────────────────────────');
for (const f of readdirSync(OUT)) {
  if (f.endsWith('.webp')) rmSync(OUT + f);
}
await run('webp.mjs', [String(QUALITY), '1.0', '1']);

const made = readdirSync(OUT).filter((f) => f.endsWith('.webp'));
const bytes = made.reduce((s, f) => s + statSync(OUT + f).size, 0);
console.log(`\n  ${made.length} files in src/assets/d1/turn/, ${(bytes / 1024).toFixed(0)} kB total\n`);
