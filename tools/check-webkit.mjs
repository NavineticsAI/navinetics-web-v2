/**
 * The site in REAL WebKit — the engine Safari uses — not Chrome in a costume.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort
 *   node tools/check-webkit.mjs                        # preview
 *   node tools/check-webkit.mjs http://localhost:5173  # dev
 *
 * WHY THIS EXISTS. Every other check in this folder drives headless Chrome.
 * Setting an iPhone viewport in Chrome changes the size of the window and
 * nothing else: it is still Blink. The things that actually break on iOS —
 * backdrop-filter, mask-composite, svh units, relative colour syntax, form
 * controls, sticky behaviour, canvas edge cases — are precisely the things
 * Blink cannot tell you about. Playwright ships a genuine WebKit build that
 * runs on Windows, so this is the closest thing to Safari without a Mac.
 *
 * WHAT IT REPORTS
 *   · every route, desktop and iPhone, for exceptions, console errors,
 *     broken images and horizontal overflow
 *   · whether the CSS features this codebase actually depends on are
 *     supported by the engine in front of it — and whether they RESOLVED on
 *     the elements that use them, which is the part CSS.supports() cannot say
 *   · screenshots to tools/.webkit/ for eyeballing against the Chrome set
 *
 * A caveat worth keeping: Playwright's WebKit is not Safari. It is Safari's
 * engine without Safari's UI, its extensions, or iOS's particular build. It
 * catches engine bugs, not "it looked odd on my phone".
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { webkit, devices } from 'playwright';
import { dir } from './lib/paths.mjs';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
const DIR = dir('./.webkit/', import.meta.url);
mkdirSync(DIR, { recursive: true });

const ROUTES = [
  '/', '/company/who-we-are', '/company/our-founders', '/company/partners',
  '/company/community', '/products/d1-stereotactic-frame',
  '/products/carbon-fiber-surgical-tables', '/products/maven-neuromodulation',
  '/technology/stereotactic-devices', '/technology/neuromodulation',
  '/technology/navinetics-ai', '/resources/media', '/resources/careers',
  '/resources/publications', '/contact',
];

/* The features this codebase leans on, and where. Support alone is not the
   question — a feature can be supported and still not resolve, e.g. a custom
   property that never gets defined. Both are checked. */
const FEATURES = [
  ['backdrop-filter', 'backdrop-filter: blur(4px)', 'the frosted navbar and every .nn-glass panel'],
  ['mask-composite', '-webkit-mask-composite: xor', 'the glass rim highlight'],
  ['relative colour', 'color: rgb(from #fff r g b / 0.5)', 'the light ScienceBand scrim — was a real bug'],
  ['svh units', 'height: 100svh', 'D1, MAVEN and brain heroes'],
  ['text-wrap balance', 'text-wrap: balance', 'headings'],
  ['scrollbar-gutter', 'scrollbar-gutter: stable', 'stops layout jump when a dialog opens'],
  ['color-mix', 'color: color-mix(in srgb, red, blue)', 'deliberately avoided; checked anyway'],
  ['aspect-ratio', 'aspect-ratio: 1/1', 'product plates'],
  [':has()', 'color: red', 'n/a — probed separately'],
];

const browser = await webkit.launch();
console.log(`WebKit ${browser.version()}\n`);

let problems = 0;

for (const [label, dev] of [['desktop', { viewport: { width: 1440, height: 900 } }],
  ['iPhone 15', devices['iPhone 15']]]) {
  console.log(`━━ ${label} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  const ctx = await browser.newContext(dev);
  const page = await ctx.newPage();

  const logs = [];
  page.on('pageerror', (e) => logs.push(`EXC ${String(e.message).split('\n')[0].slice(0, 180)}`));
  page.on('console', (m) => {
    if (m.type() === 'error') logs.push(`ERR ${m.text().split('\n')[0].slice(0, 180)}`);
  });

  for (const route of ROUTES) {
    logs.length = 0;
    try {
      await page.goto(BASE + route, { waitUntil: 'load', timeout: 30000 });
    } catch (e) {
      console.log(`DEAD ${route.padEnd(40)} ${String(e.message).split('\n')[0].slice(0, 70)}`);
      problems++;
      continue;
    }
    await page.waitForTimeout(2200);

    const m = await page.evaluate(() => ({
      mounted: (document.getElementById('root')?.innerHTML.length ?? 0) > 2000,
      h1: document.querySelectorAll('h1').length,
      title: (document.querySelector('h1')?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 34),
      broken: [...document.images].filter((i) => i.complete && !i.naturalWidth).length,
      pans: document.scrollingElement.scrollWidth > window.innerWidth + 1,
      over: document.scrollingElement.scrollWidth - window.innerWidth,
    }));

    const errs = logs.filter((l) => !/ERR_ABORTED|favicon|Failed to load resource/i.test(l));
    const bad = !m.mounted || m.broken > 0 || m.pans || errs.length > 0;
    if (bad) problems++;

    const mark = !m.mounted ? 'DEAD' : m.pans ? 'PANS' : m.broken ? 'IMG ' : errs.length ? 'ERR ' : ' ok ';
    console.log(`${mark} ${route.padEnd(40)} h1:${m.h1}  ${m.title}`
      + (m.pans ? `  (+${m.over}px wide)` : '') + (m.broken ? `  broken img:${m.broken}` : ''));
    for (const l of errs.slice(0, 2)) console.log(`       ${l}`);

    const name = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-');
    const shot = await page.screenshot({ type: 'jpeg', quality: 80 });
    writeFileSync(`${DIR}${label.replace(/\s/g, '')}-${name}.jpg`, shot);
  }

  await ctx.close();
}

/* ── engine support, and whether it actually took effect ─────────────────── */
console.log(`\n━━ CSS features this codebase depends on ━━━━━━━━━━━━━━━━━━━━━`);
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/products/carbon-fiber-surgical-tables', { waitUntil: 'load' });
await page.waitForTimeout(2500);

const support = await page.evaluate((feats) => {
  const out = feats.map(([name, decl, why]) => {
    const [prop, ...rest] = decl.split(':');
    let ok = false;
    try { ok = CSS.supports(prop.trim(), rest.join(':').trim()); } catch { ok = false; }
    return { name, ok, why };
  });
  out.push({ name: ':has()', ok: CSS.supports('selector(:has(a))'), why: 'not currently used' });
  return out;
}, FEATURES);

for (const f of support) {
  console.log(`${f.ok ? ' ok ' : 'MISS'} ${f.name.padEnd(18)} ${f.why}`);
  if (!f.ok) problems++;
}

/* The scrim that was actually broken: confirm the gradient resolved to real
   colour stops rather than being dropped as an invalid declaration. */
const scrim = await page.evaluate(() => {
  const el = [...document.querySelectorAll('div[aria-hidden="true"]')]
    .find((d) => getComputedStyle(d).backgroundImage.includes('gradient'));
  if (!el) return { found: false };
  const bg = getComputedStyle(el).backgroundImage;
  return {
    found: true,
    resolved: !bg.includes('from ') && bg.includes('gradient'),
    sample: bg.slice(0, 120),
  };
});
console.log(`\n━━ the ScienceBand scrim (the bug that was fixed) ━━━━━━━━━━━━`);
if (!scrim.found) console.log('  no gradient overlay found on this page');
else console.log(`${scrim.resolved ? ' ok ' : 'FAIL'} gradient resolved in WebKit\n       ${scrim.sample}`);
if (scrim.found && !scrim.resolved) problems++;

/* backdrop-filter is the one most likely to differ visibly. */
const glass = await page.evaluate(() => {
  const el = document.querySelector('.nn-glass');
  if (!el) return { found: false };
  const s = getComputedStyle(el);
  return {
    found: true,
    webkit: s.webkitBackdropFilter || '(none)',
    std: s.backdropFilter || '(none)',
  };
});
console.log(`\n━━ .nn-glass backdrop-filter ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
if (!glass.found) console.log('  no .nn-glass element on this page');
else console.log(`  -webkit-backdrop-filter: ${glass.webkit}\n  backdrop-filter:         ${glass.std}`);

await browser.close();
console.log(`\n${problems === 0 ? 'WebKit: clean' : `${problems} problem(s) in WebKit`}`);
console.log(`screenshots in tools/.webkit/`);
process.exit(problems === 0 ? 0 : 1);
