/* Crop the traced PNGs to their own alpha and encode WebP, through headless
   Chrome because it is the only encoder on this machine. One file in, one file
   out — unlike the turntable this replaces, nothing has to share a crop box. */
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync, statSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/^\//, '');
const WORK = `${ROOT}tools/.d1/`;
const OUT = `${ROOT}src/assets/d1/`;
const PORT = 9497;
const Q = +(process.argv[2] || 0.9);
const SCALE = +(process.argv[3] || 0.7);
const NAMES = process.argv.slice(4);

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--window-size=400,300', '--no-first-run',
  '--allow-file-access-from-files', `--user-data-dir=${WORK}.chrome`, 'about:blank'], { stdio: 'ignore' });
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
writeFileSync(`${WORK}.enc.html`, '<body style="margin:0"></body>');
await send('Page.navigate', { url: `file:///${WORK}.enc.html` });
await sleep(700);

for (const name of NAMES) {
  const src = `${WORK}${name}.png`;
  if (!existsSync(src)) { console.log(`  ${name}.png missing — skipped`); continue; }
  const out = await ev(`(async () => {
    const im = new Image(); im.src = 'file:///${WORK}${name}.png'; await im.decode();
    const c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let px = 0; px < c.width; px++) {
      if (d[(y * c.width + px) * 4 + 3] > 6) {
        if (px < x0) x0 = px; if (px > x1) x1 = px;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    const pad = 4;
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
    const bw = Math.min(c.width - x0, x1 - x0 + pad * 2);
    const bh = Math.min(c.height - y0, y1 - y0 + pad * 2);
    const o = document.createElement('canvas');
    o.width = Math.round(bw * ${SCALE}); o.height = Math.round(bh * ${SCALE});
    const q = o.getContext('2d');
    q.imageSmoothingQuality = 'high';
    q.drawImage(im, x0, y0, bw, bh, 0, 0, o.width, o.height);
    return { data: o.toDataURL('image/webp', ${Q}).split(',')[1], w: o.width, h: o.height, sw: bw, sh: bh };
  })()`);
  const buf = Buffer.from(out.data, 'base64');
  writeFileSync(`${OUT}${name}.webp`, buf);
  console.log(`  ${name}.webp  ${out.w}x${out.h} (from ${out.sw}x${out.sh})  ${(buf.length / 1024).toFixed(0)} kB`);
}
process.exit(0);
