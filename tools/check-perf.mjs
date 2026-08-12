/**
 * How long each page takes to become useful on a phone, and how long the
 * hamburger takes to open after it is tapped.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort
 *   node tools/check-perf.mjs                        # preview, throttled
 *   node tools/check-perf.mjs http://localhost:5173  # dev server
 *
 * WHY THROTTLING. A desktop running the dev server locally makes everything
 * look instant; it is the least representative machine in the building. These
 * runs apply a 4x CPU slowdown and Fast-3G-ish network, which is roughly a
 * mid-range Android on hospital wifi — the actual audience. Numbers without
 * throttling are not evidence of anything.
 *
 * WHAT IS MEASURED
 *   FCP   first contentful paint — when anything appears
 *   LCP   largest contentful paint — when the page looks loaded
 *   TBT   total blocking time, the part of long tasks over 50ms. This is what
 *         "laggy, unresponsive" actually is: the main thread is busy and taps
 *         queue behind it.
 *   long  count of tasks over 50ms
 *   js    script bytes transferred
 *
 * The menu test is separate and deliberately crude: dispatch a real tap on the
 * hamburger, then poll until the panel is on screen. It measures what a thumb
 * measures.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
const PORT = 9546;
const CPU = 4;          // 4x slowdown ≈ a mid-range phone against this desktop
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ROUTES = [
  '/', '/products/d1-stereotactic-frame', '/products/maven-neuromodulation',
  '/technology/navinetics-ai', '/resources/education', '/company/partners', '/contact',
];

spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader',
  '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, '--no-first-run',
  '--hide-scrollbars', `--user-data-dir=${join(tmpdir(), 'nn-chrome-perf')}`,
  'about:blank'], { stdio: 'ignore' });

let pg;
for (let i = 0; i < 80 && !pg; i++) {
  try { pg = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); }
  catch { /* not up */ }
  if (!pg) await sleep(250);
}
if (!pg) { console.error('could not attach to Chrome'); process.exit(1); }

const ws = new WebSocket(pg.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');

/** Installed before navigation so nothing is missed. */
const OBSERVERS = `
  window.__perf = { lcp: 0, long: [], cls: 0 };
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__perf.lcp = e.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__perf.long.push(e.duration);
  }).observe({ type: 'longtask', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value;
  }).observe({ type: 'layout-shift', buffered: true });
`;

/* Installed ONCE. Called per route it stacks: by the sixth page there were six
   copies of the script, six PerformanceObservers, and every long task counted
   six times — which reported 13,314ms of blocking inside a 9,000ms window, a
   number that is impossible on its face and should have been caught the moment
   it was read. If a measurement exceeds its own wall clock, the instrument is
   wrong, not the subject. */
await send('Page.addScriptToEvaluateOnNewDocument', { source: OBSERVERS });

async function measure(path, label, quiet = false) {
  await send('Network.clearBrowserCache');
  await send('Emulation.setCPUThrottlingRate', { rate: CPU });
  await send('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8,
  });
  await send('Page.navigate', { url: BASE + path });
  await sleep(9000);

  const m = await ev(`(() => {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
    const nav = performance.getEntriesByType('navigation')[0] ?? {};
    const res = performance.getEntriesByType('resource');
    const js = res.filter((r) => r.name.endsWith('.js')).reduce((a, r) => a + (r.transferSize || 0), 0);
    const tbt = (window.__perf?.long ?? []).reduce((a, d) => a + Math.max(0, d - 50), 0);
    return {
      fcp: Math.round(fcp),
      lcp: Math.round(window.__perf?.lcp ?? 0),
      dcl: Math.round(nav.domContentLoadedEventEnd ?? 0),
      tbt: Math.round(tbt),
      long: (window.__perf?.long ?? []).length,
      worst: Math.round(Math.max(0, ...(window.__perf?.long ?? [0]))),
      cls: +(window.__perf?.cls ?? 0).toFixed(3),
      js: Math.round(js / 1024),
    };
  })()`);

  if (!quiet) {
    const slow = m.lcp > 4000 || m.tbt > 600;
    console.log(`${slow ? 'SLOW' : ' ok '} ${label.padEnd(34)}`
      + `FCP ${String(m.fcp).padStart(5)}  LCP ${String(m.lcp).padStart(5)}  `
      + `TBT ${String(m.tbt).padStart(5)}  longtasks ${String(m.long).padStart(3)} (worst ${m.worst})  `
      + `CLS ${m.cls}  js ${m.js}kB`);
  }
  return m;
}

/**
 * MEDIAN OF THREE, and this is not optional.
 *
 * A single run of this on a machine also hosting a dev server, a preview
 * server and headless Chrome measured /company/partners at 828ms, 2615ms and
 * 1654ms on IDENTICAL code. The run-to-run spread was three times larger than
 * the change being measured, which makes any single-run before/after comparison
 * worthless — worse than worthless, because it looks like evidence.
 *
 * Three runs, median reported, spread shown. If the spread is wide, the number
 * is not trustworthy and the report should say so rather than quote the middle
 * of it as fact.
 */
const REPEATS = 3;
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

console.log(`\n═══ PAGE LOAD — ${CPU}x CPU throttle, ~1.6Mbps/150ms, median of ${REPEATS} ═══`);
console.log('    LCP under 2500 is good, over 4000 is poor. TBT under 200 is good, over 600 is poor.\n');

for (const r of ROUTES) {
  const runs = [];
  for (let i = 0; i < REPEATS; i++) runs.push(await measure(r, r, true));
  const tbt = runs.map((m) => m.tbt);
  const lcp = runs.map((m) => m.lcp);
  const spread = Math.max(...tbt) - Math.min(...tbt);
  const mTbt = median(tbt);
  const slow = median(lcp) > 4000 || mTbt > 600;
  console.log(`${slow ? 'SLOW' : ' ok '} ${r.padEnd(34)}`
    + `LCP ${String(median(lcp)).padStart(5)}  TBT ${String(mTbt).padStart(5)}`
    + `  (runs ${tbt.join('/')}, spread ${spread})`
    + `  longtasks ${median(runs.map((m) => m.long))}`);
}

/* ── the hamburger ─────────────────────────────────────────────────────────
   Loaded at phone width, then tapped, then timed until the panel is painted
   and has stopped moving. */
/* ── steady state ──────────────────────────────────────────────────────────
   The metric that actually describes "it feels laggy".

   TBT measures the load. But the complaint here is about a page sitting still
   with an animation running: the main thread never goes idle, so every tap
   waits. That is a BUSY RATIO — what fraction of wall-clock the thread spends
   inside long tasks once the page has settled — and unlike load-time TBT it is
   stable run to run, because it is not competing with parsing and layout.

   Under 5% is a page you can interact with. Over 30% is one that fights back. */
console.log(`\n═══ STEADY STATE — 5s after settle, ${CPU}x CPU, median of ${REPEATS} ═══`);
console.log('    busy% = share of wall-clock spent in long tasks with the page idle.\n');

for (const path of ['/', '/company/partners', '/products/maven-neuromodulation', '/resources/education']) {
  const runs = [];
  for (let i = 0; i < REPEATS; i++) {
    await send('Page.navigate', { url: BASE + path });
    await sleep(8000);
    const busy = await ev(`(async () => {
      window.__perf.long.length = 0;
      const t0 = performance.now();
      await new Promise((r) => setTimeout(r, 5000));
      const ms = window.__perf.long.reduce((a, d) => a + d, 0);
      return { pct: +(100 * ms / (performance.now() - t0)).toFixed(1), n: window.__perf.long.length };
    })()`);
    runs.push(busy);
  }
  const pcts = runs.map((r) => r.pct);
  const m = median(pcts);
  console.log(`${m > 30 ? 'BUSY' : m > 5 ? 'warn' : ' ok '} ${path.padEnd(34)}`
    + `busy ${String(m).padStart(5)}%   (runs ${pcts.join('/')})   long tasks/5s ${median(runs.map((r) => r.n))}`);
}

console.log(`\n═══ HAMBURGER — 375px, ${CPU}x CPU ═══\n`);
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

for (const path of ['/', '/technology/navinetics-ai']) {
  await send('Page.navigate', { url: BASE + path });
  await sleep(8000);
  const r = await ev(`(async () => {
    const btn = [...document.querySelectorAll('button')]
      .find((b) => /menu/i.test(b.getAttribute('aria-label') || ''));
    if (!btn) return { err: 'no hamburger found' };
    const t0 = performance.now();
    btn.click();
    // Poll for the panel: a lg:hidden overlay that is on screen and settled.
    let painted = 0, settled = 0, lastH = -1, stable = 0;
    for (let i = 0; i < 240; i++) {
      await new Promise((res) => requestAnimationFrame(res));
      const p = document.querySelector('[class*="lg:hidden"][class*="nn-glass"]');
      const h = p ? p.getBoundingClientRect().height : 0;
      if (h > 40 && !painted) painted = performance.now() - t0;
      if (painted) {
        if (Math.abs(h - lastH) < 0.5) stable++; else stable = 0;
        lastH = h;
        if (stable > 4) { settled = performance.now() - t0; break; }
      }
    }
    return { painted: Math.round(painted), settled: Math.round(settled) };
  })()`);
  if (r?.err) console.log(`  ${path}: ${r.err}`);
  else {
    const bad = r.settled > 500 || r.painted > 200;
    console.log(`${bad ? 'SLOW' : ' ok '} ${path.padEnd(34)}first paint ${r.painted}ms   settled ${r.settled}ms`);
  }
}

/* CLOSE THE BROWSER.
   Every tool in here spawned a headless Chrome and none of them ever shut one
   down. After a session's worth of runs there were nine of them alive, having
   burned 257 CPU-seconds between them, competing for the same cores as the
   thing being measured — which made each successive run look worse than the
   last no matter what the code did. A performance harness that degrades the
   machine it measures on is worse than no harness. */
console.log('');
await send('Browser.close').catch(() => {});
process.exit(0);
