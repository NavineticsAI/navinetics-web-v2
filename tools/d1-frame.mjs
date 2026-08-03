/**
 * The D1 hero, out of the assembly CAD.
 *
 * `node tools/d1-frame.mjs` turns src/assets/d1/*.STEP into the two renders in
 * src/assets/d1/: hero.webp and detail.webp. The STEP is gitignored — 73 MB
 * that git would keep every revision of forever — so this only runs on a
 * machine that has the CAD beside it. The renders are committed and are what
 * the site loads; if the CAD is absent the tool says so and stops rather than
 * writing anything.
 *
 * TWO PICTURES, RAY TRACED. This went through a rasterised 36-frame turntable
 * first, and that was the wrong trade twice over. Rotation divides the quality
 * budget 36 ways, and 36 mediocre frames read worse than one good picture. And
 * the rasteriser could not have got there anyway: it had no reflections, and
 * metal without reflections reads as plastic however the lights are set, while
 * its occlusion was a screen-space guess that darkened wherever geometry
 * merely overlapped on screen rather than where parts actually meet. The whole
 * budget now goes into two traced images.
 *
 * THE STAGES, in order:
 *
 *   d1/step.mjs        an ISO 10303-21 reader: entity table, argument
 *                      splitting, rigid transforms, de Boor evaluation.
 *   d1/tessellate.mjs  resolves the assembly (82 products, 157 placements —
 *                      read coordinates without this and every part lands on
 *                      the origin), then turns each of the 15,056 trimmed
 *                      faces into triangles. Writes tools/.d1/mesh.bin.
 *   d1/trace.mjs       BVH + traced, across every core over a
 *                      SharedArrayBuffer. About 2.5 minutes for the hero.
 *   d1/encode.mjs      crops each render to its own alpha and encodes WebP
 *                      through headless Chrome.
 *
 * d1/render.mjs is the old rasteriser. Nothing the site loads comes from it
 * any more; it is kept only for its `groups` mode, which lights one geometry
 * group at a time and is how you check that a grouping change did what you
 * meant it to.
 *
 * WORTH KNOWING before changing anything:
 *   · 91% of faces sit on planes, cylinders, cones, tori or spheres, which
 *     invert into (u,v) in closed form. The rest are B-spline patches, nearly
 *     all fillets, inverted numerically. 174 faces — 1.2% — fail and are
 *     skipped; that is the number to watch if the model is ever re-exported.
 *   · Stock fasteners are KEPT, at a coarse tolerance of their own. Dropping
 *     them was an early mistake: between 48% and 69% of the frame pixels in
 *     NaviNetics' own photographs are bare metal, because the knobs, the
 *     screws and the microdrive column are steel, and an all-blue assembly did
 *     not look like the object. Their threads are still most of the geometry —
 *     1.7M triangles of 2.13M — which is what the separate tolerance is for.
 *   · Materials and lamp intensities are measured off those photographs, not
 *     chosen. The notes are in d1/trace-worker.mjs.
 *   · The accessory tray is dropped. It sits at y < 0 in assembly space while
 *     every frame part's centroid is y > 0, which is the whole test.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '');
const CAD = `${ROOT}src/assets/d1/`;
const WORK = `${ROOT}tools/.d1/`;

const TOL = 0.3;          // chord tolerance, mm, for the structure
const QUALITY = 0.9;
/* Traced large and encoded down. Supersampling a 1700px trace to ~1030 is both
   sharper and quieter than tracing 1030 directly: the sample noise averages
   away in the downscale instead of needing a denoiser. */
const ENCODE_SCALE = 0.7;
/* width, height, primary spp, hemisphere rays, reflection rays, name, yaw, pitch */
const VIEWS = [
  [1700, 2430, 6, 48, 18, 'hero', 38, -18],
  [1300, 1750, 6, 44, 16, 'detail', -34, -6],
];

/* The turntable the scroll scrubs. Traced like everything else, but smaller
   and with fewer samples: it is only ever seen in motion, and the frame the
   reader actually stops on is hero.webp at full resolution, swapped in at the
   end of the travel. Paying full price for 32 frames nobody stops on was the
   mistake the first version of this page made. */
const TURN = {
  n: 32, w: 940, h: 1345, spp: 4, diff: 30, spec: 12, q: 0.75, scale: 0.62,
};
const HERO_YAW = 38;
const HERO_PITCH = -18;
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2);

const step = readdirSync(CAD).find((f) => /\.step$/i.test(f));
if (!step) {
  console.log(`\n  No STEP file in ${CAD}`);
  console.log('  The CAD is gitignored on purpose. Put 20186_D003 REV2.STEP there and re-run.');
  console.log('  The committed renders in src/assets/d1/ are untouched.\n');
  process.exit(0);
}
console.log(`\n  source: ${step}`);
mkdirSync(WORK, { recursive: true });

const run = (file, args) => new Promise((resolve, reject) => {
  const p = spawn(process.execPath, ['--max-old-space-size=14336', `${ROOT}tools/d1/${file}`, ...args], {
    stdio: 'inherit',
  });
  p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${file} exited ${code}`))));
});

console.log('\n── 1 · tessellate ────────────────────────────────────────────');
await run('tessellate.mjs', [String(TOL)]);

for (const v of VIEWS) {
  console.log(`\n── 2 · trace ${v[5]} ──────────────────────────────────────────`);
  /* Drop the previous PNG first, so a failed trace cannot leave the last good
     render sitting there to be silently re-encoded as if it were new. */
  if (readdirSync(WORK).includes(`${v[5]}.png`)) rmSync(`${WORK}${v[5]}.png`);
  await run('trace.mjs', v.map(String));
}

/* One full revolution, decelerating into the hero pose, so the last frame and
   hero.webp are the same camera and the swap at the end is a change of
   resolution rather than a jump. */
const TURN_NAMES = [];
for (let i = 0; i < TURN.n; i++) {
  const e = easeInOut(i / (TURN.n - 1));
  const yaw = HERO_YAW - 360 * (1 - e);
  const pitch = HERO_PITCH + (1 - e) * -16;
  const name = `t${String(i).padStart(2, '0')}`;
  TURN_NAMES.push(name);
  process.stdout.write(`\r── 2b · turntable ${i + 1}/${TURN.n} ──────────────────────`);
  if (readdirSync(WORK).includes(`${name}.png`)) rmSync(`${WORK}${name}.png`);
  await run('trace.mjs', [TURN.w, TURN.h, TURN.spp, TURN.diff, TURN.spec, name,
    yaw.toFixed(3), pitch.toFixed(3), 'spin'].map(String));
}

console.log('\n── 3 · encode ────────────────────────────────────────────────');
await run('encode.mjs', [String(QUALITY), String(ENCODE_SCALE), 'tight', ...VIEWS.map((v) => v[5])]);
await run('encode.mjs', [String(TURN.q), String(TURN.scale), 'union', ...TURN_NAMES]);

const made = [...VIEWS.map((v) => v[5]), ...TURN_NAMES]
  .map((n) => `${n}.webp`).filter((f) => readdirSync(CAD).includes(f));
const bytes = made.reduce((s, f) => s + statSync(CAD + f).size, 0);
console.log(`\n  ${made.length} renders in src/assets/d1/, ${(bytes / 1024).toFixed(0)} kB total\n`);
