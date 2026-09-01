/**
 * The table motion explorer, driven through the two states that used to break it.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort
 *   node tools/check-table-motion.mjs
 *
 * WHY. Picking a model that has Float, choosing the Float chip, then switching
 * to a model that has none rendered `model.float.x` on an undefined float and
 * threw. RouteBoundary caught it and replaced the whole product page with the
 * generic error screen, so the failure read as a broken PAGE rather than a
 * broken control — and nothing in the build, the route check or the copy checks
 * could see it, because the page renders perfectly until you touch it.
 *
 * The mirror case is quieter and worse: chip Slide, then switch to a model with
 * no slide, and `undefined / 2` puts x1="NaN" into an SVG line. No error, no
 * boundary — the travel markers just silently stop drawing.
 *
 * Two cases rather than the full matrix. Every model x chip x model is 80
 * combinations with a reload after each failure and does not finish in sensible
 * time; these two are the shapes that actually differ.
 */
import { webkit } from 'playwright';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
const b = await webkit.launch();
const p = await (await b.newContext()).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).split('\n')[0]));

await p.goto(`${BASE}/products/carbon-fiber-surgical-tables`, { waitUntil: 'load' });
await p.waitForTimeout(1500);

/* Indices, not names: a model button's text is the whole card — id, motion
   count and blurb run together — so a name selector built from it matches
   nothing. Index 3 is the float-only model, 0 is slide-only. */
const M = p.locator('button').filter({ hasText: /^CXR-/ });
const n = await M.count();

let bad = 0;
for (const [from, chip, to] of [[3, 'Float', 0], [0, 'Slide', 3]]) {
  await M.nth(from).click();
  await p.waitForTimeout(250);
  const c = p.getByRole('button', { name: chip, exact: true }).first();
  if (await c.count()) { await c.click(); await p.waitForTimeout(200); }
  await M.nth(to).click();
  await p.waitForTimeout(400);

  const dead = await p.locator('text=Something went wrong').count();
  const nan = await p.locator('line[x1="NaN"], line[x2="NaN"]').count();
  const ok = !dead && !nan && !errs.length;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  model#${from} -> [${chip}] -> model#${to}`
    + (dead ? '  ERROR SCREEN' : '') + (nan ? '  NaN coords' : '')
    + (errs.length ? `  ${errs[0]}` : ''));
  if (!ok) bad++;
  errs.length = 0;
  await p.goto(`${BASE}/products/carbon-fiber-surgical-tables`, { waitUntil: 'load' });
  await p.waitForTimeout(900);
}

console.log(`\n${n} models. ${bad ? `${bad} FAILED` : 'both reported crash paths pass'}.`);
await b.close();
process.exit(bad ? 1 : 0);
