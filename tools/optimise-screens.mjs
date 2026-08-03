/**
 * Re-encode the application screenshots for the web.
 *
 * The originals are PNGs up to 3656 px wide and ~7 MB the set — fine as
 * masters, far too heavy to put on a page. This produces WebP at a sensible
 * width alongside them; the page imports the .webp and the .png stays as the
 * source of truth.
 *
 * Run with:  node tools/optimise-screens.mjs
 */
import { spawn } from 'node:child_process';
import { writeFileSync, readdirSync, statSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '');
const DIR = ROOT + 'src/assets/software/';
/* These are screenshots of a UI — fine text and flat panels — so they ring
   badly at the quality that suits a photograph. Held high, and wide enough to
   stay sharp on a 2× display at the size the bands show them. */
const MAX_W = 2400;
const QUALITY = 0.93;
const PORT = 9411;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const names = readdirSync(DIR).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''));
if (!names.length) { console.log('nothing to do'); process.exit(0); }

writeFileSync(ROOT + 'tools/.screens.html',
  '<body style="margin:0">'
  + names.map((n) => `<img id="${n}" src="file:///${DIR}${n}.png">`).join('')
  + '</body>');

spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--window-size=900,600', '--no-first-run',
  '--allow-file-access-from-files', '--user-data-dir=' + ROOT + 'tools/.chrome', 'about:blank'],
{ stdio: 'ignore' });

const sleep = (m) => new Promise((r) => setTimeout(r, m));
let pg;
for (let i = 0; i < 60 && !pg; i++) {
  try { pg = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); }
  catch { /* not up yet */ }
  if (!pg) await sleep(250);
}
const ws = new WebSocket(pg.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });
const ev = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'failed');
  return r.result?.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: 'file:///' + ROOT + 'tools/.screens.html' });
await sleep(3500);

let before = 0;
let after = 0;
const ratios = {};

for (const n of names) {
  const d = await ev(`(() => {
    const img = document.getElementById('${n}');
    const k = Math.min(1, ${MAX_W} / img.naturalWidth);
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.naturalWidth * k);
    cv.height = Math.round(img.naturalHeight * k);
    const cx = cv.getContext('2d');
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(img, 0, 0, cv.width, cv.height);
    return { uri: cv.toDataURL('image/webp', ${QUALITY}),
             w: img.naturalWidth, h: img.naturalHeight, ow: cv.width, oh: cv.height };
  })()`);

  const bytes = Buffer.from(d.uri.split(',')[1], 'base64');
  writeFileSync(DIR + n + '.webp', bytes);
  const src = statSync(DIR + n + '.png').size;
  before += src;
  after += bytes.length;
  ratios[n] = +(d.w / d.h).toFixed(4);
  console.log(`  ${n.padEnd(8)} ${d.w}×${d.h} png ${(src / 1024).toFixed(0)}kB  →  `
    + `${d.ow}×${d.oh} webp ${(bytes.length / 1024).toFixed(0)}kB`);
}

console.log(`\ntotal ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024 / 1024).toFixed(2)} MB `
  + `(${(100 - (after / before) * 100).toFixed(0)}% smaller)`);
console.log('\naspect ratios, for ScreenWall.jsx:');
for (const [k, v] of Object.entries(ratios)) console.log(`  ${k}: ${v}`);

ws.close();
process.exit(0);
