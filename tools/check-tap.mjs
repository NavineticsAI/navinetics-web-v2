/**
 * Can the interactive figures actually be tapped?
 *
 *   node tools/check-tap.mjs [baseUrl]
 *
 * WHY. The implanted-system figure says "Hover or tap a part". Its parts were
 * drawn as 2.4px strokes and only the stroke was hit-testable, so on a
 * touchscreen there was nothing within a fingertip's reach to hit — the hint
 * was a lie on every phone. It worked with a mouse, which is exactly why it
 * survived: a cursor is one pixel, a fingertip is about nine millimetres.
 *
 * This taps each labelled part with a real touch event on a real iPhone
 * profile and checks the caption changed. It also reports the hit box, so a
 * target that is technically hittable but too small still shows up.
 */
import { webkit, devices } from 'playwright';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
/* 44 CSS px is the iOS Human Interface Guidelines minimum; WCAG 2.2 AA asks
   for 24. Anything under 24 is reported as a failure, 24-44 as a warning. */
const MIN = 24;
const GOOD = 44;

const browser = await webkit.launch();
const page = await browser.newPage(devices['iPhone 15']);
await page.goto(`${BASE}/technology/neuromodulation`, { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(2500);

/* Scroll it into view FIRST. The figure sits ~1950px down the page; the first
   version of this check tapped absolute page coordinates against an 844px
   viewport and so tapped nothing at all, then reported the figure as broken.
   A test that cannot reach its subject fails the subject, not itself. */
await page.locator('figure:has-text("The implanted system")').first()
  .scrollIntoViewIfNeeded();
await page.waitForTimeout(600);

const caption = () =>
  page.locator('figure:has-text("The implanted system") p').first().innerText();

let bad = 0;
console.log(`\niPhone 15, real touch events\n`);

for (const label of ['Extension', 'Pulse generator', 'Lead']) {
  const g = page.locator(`g[aria-label="${label}"]`).first();
  const box = await g.boundingBox().catch(() => null);
  if (!box) {
    console.log(`FAIL ${label.padEnd(16)} no hit box at all`);
    bad++;
    continue;
  }
  /* Tap a point ON the geometry, not the centre of its bounding box.
     For a long curve those are different places — the bbox centre of the
     extension is empty space beside the wire, so tapping it proves nothing
     about whether the wire is reachable. getPointAtLength gives a point that
     is genuinely on the path; getScreenCTM puts it in page coordinates. */
  const pt = await page.evaluate((lbl) => {
    const grp = document.querySelector(`g[aria-label="${lbl}"]`);
    if (!grp) return null;
    const shape = grp.querySelector('path, rect');
    if (!shape) return null;
    const m = shape.getScreenCTM();
    if (shape.tagName === 'rect') {
      const x = +shape.getAttribute('x') + +shape.getAttribute('width') / 2;
      const y = +shape.getAttribute('y') + +shape.getAttribute('height') / 2;
      const p = new DOMPoint(x, y).matrixTransform(m);
      return { x: p.x, y: p.y };
    }
    const p = shape.getPointAtLength(shape.getTotalLength() * 0.5);
    const s = new DOMPoint(p.x, p.y).matrixTransform(m);
    return { x: s.x, y: s.y };
  }, label);

  if (!pt) {
    console.log(`FAIL ${label.padEnd(16)} could not resolve a point on the geometry`);
    bad++;
    continue;
  }
  await page.touchscreen.tap(pt.x, pt.y);
  await page.waitForTimeout(350);
  const text = (await caption()).trim();
  const changed = text.toLowerCase().startsWith(label.toLowerCase());
  const small = Math.min(box.width, box.height);
  const mark = !changed ? 'FAIL' : small < MIN ? 'FAIL' : small < GOOD ? 'warn' : ' ok ';
  if (mark === 'FAIL') bad++;
  console.log(`${mark} ${label.padEnd(16)} hit ${Math.round(box.width)}x${Math.round(box.height)}`
    + `  caption ${changed ? 'updated' : 'DID NOT CHANGE'}`);
}

await browser.close();
console.log(`\n${bad === 0 ? 'every part is tappable' : `${bad} part(s) not reachable by touch`}\n`);
process.exit(bad === 0 ? 0 : 1);
