/**
 * Resize the window under a live page and see what breaks.
 *
 *   node tools/check-resize.mjs [baseUrl]
 *
 * WHY THIS EXISTS. Every other check in this folder loads a page fresh at a
 * fixed size, so none of them exercises a viewport that CHANGES. Dragging a
 * window between a scaled laptop panel and a 3840 × 1600 ultrawide changes
 * both the CSS width and devicePixelRatio underneath a page that is already
 * running — and this site has ten canvases sizing themselves off clientWidth
 * and DPR, several rAF loops, and a navbar that measures element positions.
 *
 * Reported symptom: the tab crashed on a monitor change.
 *
 * WHAT IT DOES. Loads a route, then steps the viewport through real display
 * sizes — including DPR changes in both directions and a couple of extreme
 * jumps — pausing at each. It reports thrown exceptions, console errors, the
 * canvas backing-store area after each step (an OOM here is usually a canvas
 * that grew unbounded), and whether the app is still mounted at the end.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
const PORT = 9547;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The two real displays on this machine, plus the jumps between them. */
const STEPS = [
  { w: 1536, h: 960, dpr: 2.5, label: 'laptop 1536x960 @2.5' },
  { w: 3840, h: 1600, dpr: 1, label: 'ultrawide 3840x1600 @1' },
  { w: 1536, h: 960, dpr: 2.5, label: 'back to laptop' },
  { w: 3840, h: 1600, dpr: 2, label: 'ultrawide @2 (scaled)' },
  { w: 375, h: 812, dpr: 3, label: 'phone 375x812 @3' },
  { w: 3840, h: 1600, dpr: 1, label: 'phone -> ultrawide' },
  { w: 800, h: 600, dpr: 1, label: 'small window' },
  { w: 2560, h: 1440, dpr: 1.5, label: 'QHD @1.5' },
];

const ROUTES = ['/', '/company/partners', '/products/maven-neuromodulation',
  '/technology/navinetics-ai', '/products/d1-stereotactic-frame'];

spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader',
  '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, '--no-first-run',
  '--hide-scrollbars', `--user-data-dir=${join(tmpdir(), 'nn-chrome-resize')}`,
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
let id = 0; const pend = new Map(); let logs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    logs.push('EXC ' + (d.exception?.description || d.text || '').split('\n').slice(0, 2).join(' | ').slice(0, 220));
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    logs.push('ERR ' + m.params.args.map((a) => a.description || a.value).join(' ').split('\n')[0].slice(0, 220));
  }
  if (m.method === 'Inspector.targetCrashed') logs.push('*** RENDERER CRASHED ***');
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
};
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send('Page.enable'); await send('Runtime.enable'); await send('Inspector.enable');

const PROBE = `(() => {
  const cs = [...document.querySelectorAll('canvas')];
  let px = 0, biggest = 0, big = '';
  for (const c of cs) {
    const a = c.width * c.height;
    px += a;
    if (a > biggest) { biggest = a; big = c.className.slice(0, 40); }
  }
  return {
    canvases: cs.length,
    mpx: +(px / 1e6).toFixed(1),
    biggestMpx: +(biggest / 1e6).toFixed(1),
    biggest: big,
    mounted: (document.getElementById('root')?.innerHTML.length ?? 0) > 2000,
    pans: document.scrollingElement.scrollWidth > window.innerWidth + 1,
  };
})()`;

let failed = 0;
for (const route of ROUTES) {
  console.log(`\n━━ ${route} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  logs = [];
  await send('Emulation.setDeviceMetricsOverride', { width: 1536, height: 960, deviceScaleFactor: 2.5, mobile: false });
  await send('Page.navigate', { url: BASE + route });
  await sleep(3500);

  for (const s of STEPS) {
    logs = [];
    await send('Emulation.setDeviceMetricsOverride', {
      width: s.w, height: s.h, deviceScaleFactor: s.dpr, mobile: s.w < 768,
    });
    // Long enough for ResizeObservers, rAF and any debounce to settle.
    await sleep(1400);
    let m;
    try { m = await ev(PROBE); } catch { m = null; }

    const dead = !m || !m.mounted;
    const errs = logs.filter((l) => !/ERR_ABORTED|favicon/.test(l));
    const bad = dead || errs.length > 0;
    if (bad) failed++;

    console.log(`${dead ? 'DEAD' : errs.length ? 'ERR ' : ' ok '} ${s.label.padEnd(24)}`
      + (m ? `canvases ${String(m.canvases).padStart(2)}  backing ${String(m.mpx).padStart(6)} Mpx  `
           + `largest ${String(m.biggestMpx).padStart(5)} Mpx${m.pans ? '  PANS' : ''}` : 'no probe response'));
    for (const l of errs.slice(0, 3)) console.log(`       ${l}`);
    if (dead) break;
  }
}

console.log(`\n${failed === 0 ? 'survived every resize' : `${failed} step(s) with problems`}`);
process.exit(failed === 0 ? 0 : 1);
