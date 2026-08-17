/**
 * What is actually saturating the main thread, per route, in Chrome.
 *
 *   node tools/check-busy-cause.mjs
 *
 * WHY. check-perf reports a steady-state busy% and two routes sit near 100%.
 * That number says a page is pegged but never says by what, and guessing has
 * been expensive here: backdrop-filter and the canvases were both confidently
 * blamed and both cleared by an A/B. It has also swung between 23% and 99% for
 * the same build, which means it must not be quoted without knowing whether a
 * suspect moves it.
 *
 * So each route is measured four times in one session: as shipped, with the
 * navbar logo's animations stopped, with the canvases hidden, and with both.
 * Same page, same throttle, same window — only the suspect changes.
 *
 * Reported as the share of a 5s idle window spent inside long tasks. It can
 * read slightly over 100%: a task straddling the end of the window is counted
 * whole. That is a rounding artefact, not a bug, and anything at that end of
 * the scale means the same thing — the thread never goes idle, so every tap
 * waits for it.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
const CPU = Number(process.env.CPU ?? 4);
const PORT = 9553;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ROUTES = ['/company/partners', '/products/maven-neuromodulation',
  '/resources/education', '/technology/navinetics-ai', '/'];

const VARIANTS = [
  ['shipped', () => {}],
  ['no logo', () => {
    const s = document.createElement('style');
    s.textContent = '[class*="nn-logo"]{animation:none!important}';
    document.head.appendChild(s);
  }],
  ['no canvas', () => {
    for (const c of document.querySelectorAll('canvas')) c.style.display = 'none';
  }],
  ['neither', () => {
    const s = document.createElement('style');
    s.textContent = '[class*="nn-logo"]{animation:none!important}';
    document.head.appendChild(s);
    for (const c of document.querySelectorAll('canvas')) c.style.display = 'none';
  }],
];

const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader',
  '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, '--no-first-run',
  '--hide-scrollbars', `--user-data-dir=${join(tmpdir(), 'nn-chrome-busy')}`,
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

await send('Page.enable'); await send('Runtime.enable');
/* Installed on every new document rather than after each navigation: two
   observers on one document double-count every long task, which is the one way
   this metric can exceed 100% for a reason that is not real. */
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `window.__long = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__long.push(e.duration);
    }).observe({ type: 'longtask', buffered: true });`,
});
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setCPUThrottlingRate', { rate: CPU });

console.log(`\nShare of a 5s idle window spent in long tasks. ${CPU}x CPU, iPhone viewport.`);
console.log('Lower is better. The column that drops is the cause.\n');
console.log('  route                          ' + VARIANTS.map((v) => v[0].padStart(11)).join(''));

for (const route of ROUTES) {
  const cells = [];
  for (const [, apply] of VARIANTS) {
    await send('Page.navigate', { url: BASE + route });
    await sleep(7000);
    await ev(`(${apply.toString()})()`);
    await sleep(800);
    const pct = await ev(`(async () => {
      window.__long.length = 0;
      const t0 = performance.now();
      await new Promise((r) => setTimeout(r, 5000));
      const ms = window.__long.reduce((a, d) => a + d, 0);
      return +(100 * ms / (performance.now() - t0)).toFixed(1);
    })()`);
    cells.push(pct);
  }
  const flag = cells[0] > 30 ? 'BUSY' : cells[0] > 5 ? 'warn' : ' ok ';
  console.log(`${flag} ${route.padEnd(30)} ` + cells.map((c) => `${c}%`.padStart(11)).join(''));
}

await send('Browser.close').catch(() => {});
proc.kill();
console.log('');
process.exit(0);
