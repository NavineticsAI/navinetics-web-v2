/**
 * Re-encode the education page's images for the web.
 *
 * The masters are 0.4–2.6 MB PNGs — fine as sources, far too heavy to put on a
 * page. This writes a WebP beside each one; the page imports the .webp and the
 * .png stays as the source of truth.
 *
 * Run with:  node tools/education-images.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync, statSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '');
const DIR = ROOT + 'src/assets/education/';
const PORT = 9412;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p));

/* Every master the page imports. Add the name here when a slot is filled. */
const USED = ['01.2', '02.3.a', '02.3.b'];
/* 05 is a TIFF, which Chrome cannot decode. It is converted once with Pillow:
     python -c "from PIL import Image; Image.open('src/assets/education/05.tif')\n       .convert('RGBA').save('src/assets/education/05.webp', lossless=True, method=6)"
   Lossless because it is a line graphic — lossy rings on every stroke. */

/* These are renders and a CT slice — smooth gradients and fine grey detail,
   which ring at low quality. Held high, and wide enough to stay sharp on a 2×
   display at the size the page shows them. */
const MAX_W = 1400;
const QUALITY = 0.84;

writeFileSync(ROOT + 'tools/.edu.html', '<body style="margin:0;background:#111"></body>');

spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--window-size=900,600', '--no-first-run',
  '--allow-file-access-from-files', '--user-data-dir=' + ROOT + 'tools/.chrome-edu', 'about:blank'],
{ stdio: 'ignore' });

const sleep = (m) => new Promise((r) => setTimeout(r, m));
let pg;
for (let i = 0; i < 60 && !pg; i++) {
  try { pg = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); }
  catch { /* not up yet */ }
  if (!pg) await sleep(250);
}
const ws = new WebSocket(pg.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
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
await send('Page.navigate', { url: 'file:///' + ROOT + 'tools/.edu.html' });
await sleep(1200);

let before = 0, after = 0;

for (const n of USED) {
  const d = await ev(`(async () => {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'file:///${DIR}${n}.png'; });
    const k = Math.min(1, ${MAX_W} / img.naturalWidth);
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.naturalWidth * k);
    cv.height = Math.round(img.naturalHeight * k);
    const cx = cv.getContext('2d');
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(img, 0, 0, cv.width, cv.height);
    return { uri: cv.toDataURL('image/webp', ${QUALITY}), w: img.naturalWidth, h: img.naturalHeight, ow: cv.width, oh: cv.height };
  })()`);
  const bytes = Buffer.from(d.uri.split(',')[1], 'base64');
  writeFileSync(DIR + n + '.webp', bytes);
  const src = statSync(DIR + n + '.png').size;
  before += src; after += bytes.length;
  console.log(`  ${n.padEnd(7)} ${d.w}×${d.h} png ${(src / 1024).toFixed(0)}kB  →  ${d.ow}×${d.oh} webp ${(bytes.length / 1024).toFixed(0)}kB`);
}

console.log(`\ntotal ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024).toFixed(0)} kB`);
process.exit(0);
