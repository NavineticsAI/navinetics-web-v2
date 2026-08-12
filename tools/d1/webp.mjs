/* Stage of tools/d1-frame.mjs. Run that, not this. */
/* PNG -> WebP through Chrome, cropped to one bounding box shared by every
   frame so the object cannot jump between them. */
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync, readdirSync } from 'node:fs';
import { dir, fileUrl } from '../lib/paths.mjs';

const ROOT = dir('../../', import.meta.url);
const DIR = ROOT + 'tools/.d1/';
const OUTDIR = ROOT + 'src/assets/d1/turn/';
const PORT = 9462;
const Q = +(process.argv[2] || 0.82);
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SCALE = +(process.argv[3] || 1);
const STRIDE = +(process.argv[4] || 1);
const all = readdirSync(`${DIR}turn`).filter((f) => f.endsWith('.png')).sort();
/* Every STRIDE-th turntable frame, but never a highlight still: those are the
   settled pose and all four are needed. */
const files = all.filter((f, i) => !f.startsWith('f') || all.filter((x) => x.startsWith('f')).indexOf(f) % STRIDE === 0);

spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--window-size=400,300', '--no-first-run',
  '--allow-file-access-from-files', `--user-data-dir=${DIR}.chrome-webp`, 'about:blank'], { stdio: 'ignore' });
let pg;
for (let i = 0; i < 80 && !pg; i++) {
  try { pg = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); }
  catch { /* not up */ }
  if (!pg) await sleep(250);
}
const ws = new WebSocket(pg.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });
const ev = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result?.result?.value;
};
await send('Page.enable'); await send('Runtime.enable');
writeFileSync(`${DIR}.webp.html`, '<body style="margin:0"></body>');
await send('Page.navigate', { url: fileUrl(DIR + '.webp.html') });
await sleep(700);

const list = JSON.stringify(files);
const box = await ev(`(async () => {
  window.__imgs = {};
  let x0=1e9,y0=1e9,x1=-1,y1=-1;
  for (const f of ${list}) {
    const im = new Image();
    im.src = ${JSON.stringify(fileUrl(DIR + 'turn/'))} + f;
    await im.decode();
    window.__imgs[f] = im;
    const c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    const x = c.getContext('2d'); x.drawImage(im,0,0);
    const d = x.getImageData(0,0,c.width,c.height).data;
    for (let y=0;y<c.height;y++) for (let px=0;px<c.width;px++) {
      if (d[(y*c.width+px)*4+3] > 8) {
        if (px<x0)x0=px; if (px>x1)x1=px; if (y<y0)y0=y; if (y>y1)y1=y;
      }
    }
  }
  return {x0,y0,x1,y1,w:window.__imgs[${JSON.stringify(files[0])}].width};
})()`);
const pad = 6;
const bx = Math.max(0, box.x0 - pad); const by = Math.max(0, box.y0 - pad);
const bw = Math.min(box.w - bx, box.x1 - box.x0 + pad * 2);
const bh = Math.min(box.w - by, box.y1 - box.y0 + pad * 2);
console.log(`union alpha box ${bw}×${bh} at ${bx},${by} (from ${box.w}²)`);

let total = 0;
for (const f of files) {
  const data = await ev(`(() => {
    const im = window.__imgs[${JSON.stringify(f)}];
    const c = document.createElement('canvas');
    c.width = ${Math.round(bw * SCALE)}; c.height = ${Math.round(bh * SCALE)};
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(im, ${bx}, ${by}, ${bw}, ${bh}, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', ${Q}).split(',')[1];
  })()`);
  const buf = Buffer.from(data, 'base64');
  writeFileSync(`${OUTDIR}${f.replace('.png', '.webp')}`, buf);
  total += buf.length;
}
console.log(`${files.length} webp, ${(total / 1024).toFixed(0)} kB total, ${(total / files.length / 1024).toFixed(1)} kB each`);
process.exit(0);
