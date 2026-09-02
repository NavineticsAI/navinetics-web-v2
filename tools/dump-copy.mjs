/**
 * Every word a visitor can read, per route, to a JSON file.
 *
 *   node tools/dump-copy.mjs <outfile.json> [baseUrl]
 *
 * WHY. To answer "what actually changed on the page between two branches",
 * which a source diff cannot do. The branch under review touches eighty files,
 * and most of that is portrait tooling, a logo rewrite and scene code — none of
 * which a reader sees. Meanwhile a single word change in a data file can alter
 * text on four routes at once, because the pages are data-driven.
 *
 * So: build each branch, dump the rendered text, and diff the two dumps. What
 * comes out is the visible change and nothing else.
 *
 * Everything is scrolled first — almost every section is behind a scroll-reveal
 * and an unscrolled page yields a fraction of its own copy.
 */
import { writeFileSync } from 'node:fs';
import { webkit } from 'playwright';

const OUT = process.argv[2];
if (!OUT) { console.error('usage: node tools/dump-copy.mjs <outfile.json> [baseUrl]'); process.exit(1); }
const BASE = (process.argv[3] || 'http://localhost:4319') + '/navinetics-web-v2';

const ROUTES = [
  '/', '/company/who-we-are', '/company/our-founders', '/company/partners',
  '/company/community', '/products/d1-stereotactic-frame',
  '/products/carbon-fiber-surgical-tables', '/products/maven-neuromodulation',
  '/technology/stereotactic-devices', '/technology/neuromodulation',
  '/technology/navinetics-ai', '/technology/education',
  '/resources/media', '/resources/careers',
  '/resources/publications', '/contact', '/no-such-page',
];

const browser = await webkit.launch();
const page = await (await browser.newContext()).newPage();
const out = {};

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      scrollTo(0, y); await new Promise((r) => setTimeout(r, 40));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  out[route] = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    /* One line per readable block rather than one blob: a blob diffs as a
       single enormous change the moment anything moves, and the point of this
       is to see WHICH sentence changed. */
    return main.innerText
      .split('\n')
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  });
  console.error(`  ${route} — ${out[route].length} blocks`);
}

await browser.close();
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.error(`\nwrote ${OUT}`);
