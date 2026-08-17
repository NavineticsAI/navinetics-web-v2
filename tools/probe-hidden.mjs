/**
 * What, exactly, is still invisible on a settled page.
 *
 *   node tools/probe-hidden.mjs [route] [baseUrl]
 *
 * check-reveal.mjs reports that blocks stay at opacity 0 and, on several
 * routes, never become readable. That number alone does not say whether the
 * cause is a stalled scroll-reveal or an element that is simply meant to be
 * semi-transparent — a scrim, a disabled control, a decorative wash. Acting on
 * the first reading without separating those two would mean rewriting the
 * animation layer to fix something that might be a CSS gradient.
 *
 * So this prints the offenders: tag, classes, size, position relative to the
 * viewport, computed opacity, and whether framer-motion is driving it (an
 * inline opacity or a translate in the style attribute). A motion-driven block
 * at opacity 0 is a bug. A `.nn-scrim` at 0.4 is the design.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROUTE = process.argv[2] || '/';
const BASE = (process.argv[3] || 'http://localhost:4319') + '/navinetics-web-v2';
const CPU = Number(process.env.CPU ?? 4);
const PORT = 9551;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader',
  '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, '--no-first-run',
  '--hide-scrollbars', `--user-data-dir=${join(tmpdir(), 'nn-chrome-probe')}`,
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
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setCPUThrottlingRate', { rate: CPU });
await send('Page.navigate', { url: BASE + ROUTE });
await sleep(5000);

const rows = await ev(`(() => {
  const out = [];
  for (const el of document.querySelectorAll('main *')) {
    const r = el.getBoundingClientRect();
    if (r.height < 12) continue;
    const cs = getComputedStyle(el);
    const op = parseFloat(cs.opacity);
    if (op >= 0.99) continue;
    out.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') || '').slice(0, 52),
      op: op.toFixed(2),
      /* framer-motion writes opacity and transform inline. If neither is
         present the transparency comes from a stylesheet and is intentional. */
      inlineOp: el.style.opacity || '-',
      inlineTf: (el.style.transform || '-').slice(0, 30),
      h: Math.round(r.height),
      top: Math.round(r.top),
      /* Distance below the fold. The reveal uses viewport margin -80px, so an
         element that never gets 80px inside the viewport never triggers. */
      belowFold: r.top > innerHeight - 80,
    });
  }
  return { docH: Math.round(document.body.scrollHeight), vh: innerHeight, rows: out };
})()`);

console.log(`\n${ROUTE}   document ${rows.docH}px, viewport ${rows.vh}px, ${CPU}x CPU\n`);
console.log('  op   inline-op  inline-transform          h    top   tag  class');
for (const r of rows.rows.slice(0, 24)) {
  console.log(`  ${r.op}  ${String(r.inlineOp).padEnd(9)}  ${r.inlineTf.padEnd(24)} ${String(r.h).padStart(4)} ${String(r.top).padStart(6)}   ${r.tag.padEnd(4)} ${r.cls}`);
}
console.log(`\n  ${rows.rows.length} element(s) below full opacity; ${rows.rows.filter((r) => r.inlineOp !== '-').length} driven by motion.\n`);

await send('Browser.close').catch(() => {});
process.exit(0);
