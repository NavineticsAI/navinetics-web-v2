/**
 * One screenshot of one route, at a size and a scroll position.
 *
 *   node tools/shot.mjs <path> [width] [height] [scrollPx] [name] [baseUrl]
 *   node tools/shot.mjs /products/d1-stereotactic-frame 1440 900 900 anchor
 *
 * For looking at a change rather than measuring it — check-mobile.mjs walks
 * every route and reports numbers; this is for "did that one band come out
 * right". Writes to tools/.shots/<name>.webp.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dir } from './lib/paths.mjs';

const [path = '/', width = 1440, height = 900, scroll = 0, name = 'shot',
  base = 'http://localhost:5173'] = process.argv.slice(2);

const DIR = dir('./.shots/', import.meta.url);
const PORT = 9544;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(DIR, { recursive: true });
spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader',
  '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, '--no-first-run',
  '--hide-scrollbars',
  // Outside the project: a profile under tools/ kills the Vite dev server.
  `--user-data-dir=${join(tmpdir(), 'nn-chrome-shot')}`, 'about:blank'], { stdio: 'ignore' });

let pg;
for (let i = 0; i < 80 && !pg; i++) {
  try { pg = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((x) => x.type === 'page'); }
  catch { /* not up */ }
  if (!pg) await sleep(250);
}
if (!pg) { console.error('could not attach to Chrome'); process.exit(1); }

const ws = new WebSocket(pg.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: +width, height: +height, deviceScaleFactor: 1, mobile: +width < 768,
});
await send('Page.navigate', { url: `${base}/navinetics-web-v2${path}` });
await sleep(2600);
await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${+scroll})` });
// Long enough for the reveal to finish and the scene to be somewhere useful.
await sleep(2600);

const shot = await send('Page.captureScreenshot', { format: 'webp', quality: 88 });
const data = shot.result?.result?.data ?? shot.result?.data;
if (!data) { console.error('no image returned'); process.exit(1); }
writeFileSync(`${DIR}${name}.webp`, Buffer.from(data, 'base64'));
console.log(`tools/.shots/${name}.webp  ${width}x${height}  ${path}  scroll=${scroll}`);
// Shut Chrome down — leaked instances pile up and skew every later run.
await send('Browser.close').catch(() => {});
process.exit(0);
