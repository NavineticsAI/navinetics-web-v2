/**
 * How long the mobile menu takes to appear, in REAL WebKit — and why.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort
 *   node tools/check-menu-webkit.mjs
 *
 * WHY NOT THE CHROME ONE. tools/check-perf.mjs already times this and reports
 * 58ms to first paint, which says the menu is fine. It was still reported from
 * an iPhone as taking a moment and feeling frozen. Both can be true: the thing
 * measured in Blink is not the thing that is slow in WebKit.
 *
 * The panel is `.nn-glass` at `--gb: 30px`, and it opens underneath a navbar
 * pill that is also `.nn-glass`, at 16px. So tapping the button asks for a
 * 30px blur of everything behind a panel up to 75vh tall, while a second
 * blurred surface sits over the top of it. Blink resolves that cheaply. WebKit
 * is where backdrop-filter is expensive, and stacking them is its worst case.
 *
 * THE A/B IS THE POINT. A slow number on its own invites a guess about the
 * cause, and the last guess here — that the tap was queueing behind a busy
 * main thread — was wrong. So each route is measured twice in the same
 * session: once as shipped, and once with every backdrop-filter forced off and
 * nothing else changed. If the second run is fast, the blur is the cause and
 * there is no more to argue about. If both are slow, it is not, and the blur
 * should be left alone.
 *
 * Timed from inside the page rather than by polling screenshots: an earlier
 * version compared screenshot bytes in a loop, and the cost of taking them
 * dominated the reading it was meant to produce.
 */
import { webkit, devices } from 'playwright';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
const ROUTES = ['/', '/company/partners', '/products/maven-neuromodulation'];
const RUNS = 3;

const browser = await webkit.launch();
const median = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

/* Nothing else changes: same build, same viewport, same route, same taps. */
const KILL_BLUR = `
  *, *::before, *::after {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }`;

async function measure(route, noBlur) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const out = [];

  for (let i = 0; i < RUNS; i++) {
    await page.goto(BASE + route, { waitUntil: 'load' });
    if (noBlur) await page.addStyleTag({ content: KILL_BLUR });
    await page.waitForTimeout(2000);

    const btn = page.locator('button[aria-label="Open menu"]').first();
    if (!(await btn.count())) break;

    /* The whole measurement happens inside the page, including the press.
       ────────────────────────────────────────────────────────────────────
       An earlier version started a clock, then called Playwright's click()
       and measured after it returned. That reports the driver, not the
       browser: click() first waits for the element to be actionable, which
       includes waiting for it to hold still. The navbar is sticky and moves
       as the page settles, so on / the wait was seconds long and the reading
       was of Playwright being careful — the identical 3.1s with blur on and
       off should have been the giveaway, since nothing about the page had
       changed between them.

       Dispatching from in here means the clock starts on the event itself.
       Two rAFs is the first frame the browser has put together in response. */
    const ms = await page.evaluate(() => new Promise((res) => {
      const b = document.querySelector('button[aria-label="Open menu"]');
      if (!b) { res({ js: -1, paint: -1, total: -1 }); return; }
      const t0 = performance.now();
      b.click();
      /* Split, because "514ms" does not say what to fix. Everything up to
         here is synchronous: the handler, React's re-render, the commit. What
         follows is the engine's — style, layout, paint, composite. */
      const js = performance.now() - t0;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const total = performance.now() - t0;
        res({ js: Math.round(js), paint: Math.round(total - js), total: Math.round(total) });
      }));
    }));
    out.push(ms);

    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
  }

  await ctx.close();
  if (!out.length) return null;
  return {
    js: median(out.map((o) => o.js)),
    paint: median(out.map((o) => o.paint)),
    total: median(out.map((o) => o.total)),
  };
}

console.log('\nMobile menu in WebKit (iPhone 13). Click to composited frame, '
  + `median of ${RUNS}, ms.\n`);
console.log('  route                            js  paint  total   blur off');

for (const route of ROUTES) {
  const a = await measure(route, false);
  const b = await measure(route, true);
  if (a === null) { console.log(`  ${route.padEnd(34)} no menu button found`); continue; }
  const flag = a.total > 400 ? 'SLOW' : ' ok ';
  console.log(`${flag} ${route.padEnd(28)} ${String(a.js).padStart(5)} ${String(a.paint).padStart(6)} `
    + `${String(a.total).padStart(6)} ${String(b?.total ?? '-').padStart(10)}`);
}

console.log('\n  A large drop in the second column means backdrop-filter is the cause.\n');
await browser.close();
