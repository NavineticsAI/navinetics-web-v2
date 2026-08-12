/**
 * Every route at phone size, in a real browser, with the layout measured.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort
 *   node tools/check-mobile.mjs
 *
 * WHY THIS EXISTS. Desktop verification cannot see a phone bug. The failures
 * that matter here are all geometric, and all invisible at 1440px:
 *
 *   · horizontal overflow — one element wider than the viewport makes the whole
 *     page pan sideways, which on a phone reads as broken rather than as a
 *     wide element.
 *   · tap targets under 44 × 44 CSS px, the size a finger can reliably hit.
 *   · text under 12px, and anything clipped out of its own container.
 *   · canvases and scenes that collapse to zero height when the grid they were
 *     laid out in stacks.
 *
 * It reports the offending elements by selector so the fix is not a hunt, and
 * writes a screenshot per route to tools/.mobile/ so the design can be judged
 * rather than only measured — the point is that it still looks like itself at
 * 390px, not merely that nothing overflows.
 *
 * Exits non-zero if any route has overflow, a broken image, or a console error.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '');
const DIR = `${ROOT}tools/.mobile/`;
const PORT = 9542;
const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Real devices, by CSS viewport — not round numbers.
 *
 * Chosen to bracket the range rather than to enumerate it: the narrowest phone
 * still in use, the two most common iOS sizes, a mainstream Samsung, the
 * narrowest folding phone in its closed state, and the tablet breakpoint where
 * the layout stops stacking.
 *
 * IMPORTANT: these are all BLINK. Emulating an iPhone viewport in Chrome is not
 * Safari — see the note at the top of this file about WebKit.
 */
const DEVICES = [
  { name: 'iPhone-SE',        width: 375, height: 667,  dpr: 2 },
  { name: 'iPhone-15',        width: 390, height: 844,  dpr: 3 },
  { name: 'iPhone-15-ProMax', width: 430, height: 932,  dpr: 3 },
  { name: 'Galaxy-S23',       width: 360, height: 780,  dpr: 3 },
  { name: 'Galaxy-Fold-shut', width: 344, height: 882,  dpr: 2.5 },
  { name: 'iPad-Mini',        width: 744, height: 1133, dpr: 2 },
];

const ROUTES = [
  '/',
  '/company/who-we-are', '/company/our-founders', '/company/partners', '/company/community',
  '/products/d1-stereotactic-frame', '/products/carbon-fiber-surgical-tables',
  '/products/maven-neuromodulation',
  '/technology/stereotactic-devices', '/technology/neuromodulation', '/technology/navinetics-ai',
  '/resources/media', '/resources/careers', '/resources/education', '/resources/publications',
  '/contact',
];

mkdirSync(DIR, { recursive: true });
spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--no-first-run', '--hide-scrollbars',
  /* Outside the project: a profile under tools/ is inside Vite's watched
     tree and kills the dev server with EBUSY on Chrome's cache db. */
  `--user-data-dir=${join(tmpdir(), 'nn-chrome-mobile')}`, 'about:blank'], { stdio: 'ignore' });

let pg;
for (let i = 0; i < 80 && !pg; i++) {
  try { pg = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); }
  catch { /* not up yet */ }
  if (!pg) await sleep(250);
}
if (!pg) { console.error('could not attach to Chrome'); process.exit(1); }

const ws = new WebSocket(pg.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map(); let logs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    logs.push('EXC ' + (d.exception?.description || d.text || '').split('\n')[0].slice(0, 140));
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    logs.push('ERR ' + m.params.args.map((a) => a.description || a.value).join(' ').split('\n')[0].slice(0, 140));
  }
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
};
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send('Page.enable'); await send('Runtime.enable');

/* Measured in the page. Kept as one expression so it is one round trip. */
const PROBE = `(() => {
  const vw = window.innerWidth;
  const label = (el) => {
    const cls = (el.className && typeof el.className === 'string')
      ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.') : '';
    return (el.tagName.toLowerCase() + cls).slice(0, 90);
  };
  const all = [...document.querySelectorAll('body *')];

  // Elements that stick out past the right edge. Ignore anything inside a
  // deliberate horizontal scroller — a wide table that scrolls in its own box
  // is correct, a page that pans is not.
  const inScroller = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === 'auto' || o === 'scroll') return true;
    }
    return false;
  };
  const overflow = [];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1 && !inScroller(el)) {
      overflow.push({ sel: label(el), right: Math.round(r.right), w: Math.round(r.width) });
    }
  }

  // Tap targets. Links and buttons a finger has to hit.
  const small = [];
  for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select, textarea')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (getComputedStyle(el).visibility === 'hidden') continue;
    if (r.width < 44 || r.height < 44) {
      small.push({ sel: label(el), w: Math.round(r.width), h: Math.round(r.height),
                   text: (el.textContent || '').trim().slice(0, 24) });
    }
  }

  // Body copy that dropped below 12px.
  const tiny = [];
  for (const el of all) {
    if (!el.childNodes.length) continue;
    const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 12);
    if (!direct) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs && fs < 12) tiny.push({ sel: label(el), px: +fs.toFixed(1) });
  }

  // Canvases that collapsed when their grid stacked.
  const flatCanvas = [...document.querySelectorAll('canvas, svg')]
    .filter((c) => { const r = c.getBoundingClientRect(); return r.width > 0 && r.height < 24; })
    .map((c) => label(c));

  return {
    scrollW: Math.round(document.scrollingElement.scrollWidth),
    vw,
    rootLen: document.getElementById('root')?.innerHTML.length ?? 0,
    h1: (document.querySelector('h1')?.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40),
    h1Count: document.querySelectorAll('h1').length,
    brokenImg: [...document.images].filter((i) => i.complete && !i.naturalWidth).length,
    overflow: overflow.slice(0, 6),
    overflowCount: overflow.length,
    small: small.slice(0, 6),
    smallCount: small.length,
    tiny: tiny.slice(0, 4),
    tinyCount: tiny.length,
    flatCanvas: flatCanvas.slice(0, 4),
  };
})()`;

let bad = 0;
for (const dev of DEVICES) {
  console.log(`\n━━ ${dev.name}  ${dev.width}×${dev.height} @${dev.dpr}x ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  await send('Emulation.setDeviceMetricsOverride', {
    width: dev.width, height: dev.height, deviceScaleFactor: dev.dpr, mobile: true,
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  for (const path of ROUTES) {
    logs = [];
    await send('Page.navigate', { url: BASE + path });
    await sleep(2400);
    // Settle scroll-driven sections, then come back to the top for the shot.
    await ev('window.scrollTo(0, document.body.scrollHeight * 0.5)');
    await sleep(600);
    await ev('window.scrollTo(0, 0)');
    await sleep(400);

    const m = await ev(PROBE);
    const pans = m.scrollW > m.vw + 1;
    const dead = m.rootLen < 2000;
    const err = logs.filter((l) => !/ERR_ABORTED/.test(l));
    const problem = pans || dead || m.brokenImg > 0 || err.length > 0;
    if (problem) bad++;

    const mark = dead ? 'DEAD' : pans ? 'PANS' : m.brokenImg ? 'IMG ' : err.length ? 'ERR ' : ' ok ';
    console.log(`${mark} ${path.padEnd(40)} scrollW ${String(m.scrollW).padStart(5)}/${m.vw}`
      + `  h1:${m.h1Count}  tap<44:${m.smallCount}  <12px:${m.tinyCount}`);
    if (pans) {
      console.log(`       widest offenders:`);
      for (const o of m.overflow) console.log(`         ${o.sel}  right=${o.right} w=${o.w}`);
    }
    if (m.flatCanvas.length) console.log(`       collapsed canvas: ${m.flatCanvas.join(', ')}`);
    for (const l of err.slice(0, 2)) console.log(`       ${l}`);
    if (m.smallCount && dev.name === DEVICES[0].name) {
      for (const s of m.small.slice(0, 3)) console.log(`       tap ${s.w}×${s.h}  ${s.sel}  "${s.text}"`);
    }

    // A picture, so the design can be judged and not only measured.
    const shot = await send('Page.captureScreenshot', { format: 'webp', quality: 82 });
    const data = shot.result?.result?.data ?? shot.result?.data;
    if (data) {
      const name = path === '/' ? 'home' : path.slice(1).replace(/\//g, '-');
      writeFileSync(`${DIR}${dev.name}-${name}.webp`, Buffer.from(data, 'base64'));
    }
  }
}

console.log(`\n${bad === 0 ? 'all routes clean on mobile' : `${bad} route/device combination(s) with problems`}`);
console.log(`screenshots in tools/.mobile/`);
// Shut Chrome down — leaked instances pile up and skew every later run.
await send('Browser.close').catch(() => {});
process.exit(bad === 0 ? 0 : 1);
