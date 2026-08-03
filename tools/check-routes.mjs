/**
 * Every route, loaded in a real browser, with the console watched.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort &
 *   node tools/check-routes.mjs
 *
 * WHY THIS EXISTS. The home page shipped blank for several commits. The cause
 * was a product record that lost its `status: 'in-development'` flag and so
 * moved into the shipping list, where Home and WhoWeAre both index
 * `product.metrics[0]` — and that record had no `metrics`. Neither lint nor
 * the build can see it: it is a runtime TypeError inside a map, and it takes
 * the whole page down to a blank root.
 *
 * It survived because verification only ever covered the pages being edited.
 * Changing a data record changes every page that reads it, which is usually
 * more pages than you are looking at. So: check all of them, every time.
 *
 * Exits non-zero if any route renders an empty root, throws, or has an image
 * that failed to decode.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '');
const DIR = `${ROOT}tools/.routes/`;
const PORT = 9541;
const BASE = 'http://localhost:4319';
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ROUTES = [
  '/',
  '/company/who-we-are', '/company/our-founders', '/company/partners', '/company/community',
  '/products/d1-stereotactic-frame', '/products/carbon-fiber-surgical-tables',
  '/products/maven-neuromodulation',
  '/technology/stereotactic-devices', '/technology/neuromodulation', '/technology/navinetics-ai',
  '/resources/media', '/resources/careers', '/resources/education', '/resources/publications',
  '/contact', '/products/does-not-exist',
];

mkdirSync(DIR, { recursive: true });
spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--window-size=1440,900', '--no-first-run',
  `--user-data-dir=${DIR}.chrome-all`, 'about:blank'], { stdio: 'ignore' });
let pg;
for (let i = 0; i < 80 && !pg; i++) {
  try { pg = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); }
  catch { /* not up */ }
  if (!pg) await sleep(250);
}
const ws = new WebSocket(pg.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map(); let logs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    logs.push('EXC ' + (d.exception?.description || d.text || '').split('\n')[0].slice(0, 150));
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    logs.push('ERR ' + m.params.args.map((a) => a.description || a.value).join(' ').split('\n')[0].slice(0, 150));
  }
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
};
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;
await send('Page.enable'); await send('Runtime.enable');

let bad = 0;
for (const path of ROUTES) {
  logs = [];
  await send('Page.navigate', { url: BASE + path });
  await sleep(2300);
  const info = await ev(`(() => ({
    len: document.getElementById('root')?.innerHTML.length ?? 0,
    h: (document.querySelector('h1')?.textContent || '').trim().replace(/\\s+/g,' ').slice(0,42),
    broken: [...document.images].filter(i => i.complete && !i.naturalWidth).length,
  }))()`);
  const dead = info.len < 2000;
  const err = logs.filter((l) => !/ERR_ABORTED/.test(l));
  if (dead || err.length || info.broken) bad++;
  const mark = dead ? 'DEAD' : err.length ? 'ERR ' : info.broken ? 'IMG ' : ' ok ';
  console.log(`${mark} ${path.padEnd(42)} ${String(info.len).padStart(6)}  ${info.h}`);
  for (const l of err.slice(0, 2)) console.log(`       ${l}`);
}
console.log(`\n${bad === 0 ? 'all routes clean' : bad + ' route(s) with problems'}`);
process.exit(bad === 0 ? 0 : 1);
