/**
 * The supplied photograph of the frame on a head model, cut out.
 *
 * `node tools/d1-photo.mjs` turns src/assets/d1/head.png into head.webp with
 * the black studio background keyed to transparent, so the figure sits on the
 * band's own dark ground instead of on a white plate — the same treatment the
 * traced renders get, and the reason the two read as one page.
 *
 * WHY A FLOOD FILL AND NOT A THRESHOLD. The frame is photographed against
 * black, but the subject contains black too: the shadowed side of the head,
 * the gaps between the arc's graduations, the inside of the wheels. A
 * luminance threshold punches holes straight through all of them. Filling
 * inward from the four corners only removes black that is *connected to the
 * edge*, which is exactly the definition of "background" here.
 *
 * The master PNG is committed beside the WebP — it is a supplied asset rather
 * than something this tool can regenerate, so losing it would be losing the
 * original.
 */
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync, statSync } from 'node:fs';
import { dir, fileUrl } from './lib/paths.mjs';

const ROOT = dir('../', import.meta.url);
const DIR = `${ROOT}src/assets/d1/`;
const SRC = `${DIR}head.png`;
const PORT = 9600 + (process.pid % 300);
const Q = 0.86;
const SCALE = 0.8;
/* Anything under this luminance, reachable from an edge, is background. Well
   above the measured noise floor of the black and well below the darkest part
   of the head model. */
const CUT = 26;

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!existsSync(SRC)) {
  console.log(`\n  ${SRC} is not here — nothing to do.\n`);
  process.exit(0);
}

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader',
  '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, '--window-size=400,300',
  '--no-first-run', '--allow-file-access-from-files',
  `--user-data-dir=${ROOT}tools/.d1/.chrome-photo-${process.pid}`, 'about:blank'], { stdio: 'ignore' });
let pg;
for (let i = 0; i < 120 && !pg; i++) {
  try { pg = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); }
  catch { /* not up yet */ }
  if (!pg) await sleep(250);
}
if (!pg) { console.error(`  Chrome never came up on ${PORT}`); chrome.kill(); process.exit(1); }
const bye = () => { try { chrome.kill(); } catch { /* already gone */ } };
process.on('exit', bye);

const ws = new WebSocket(pg.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });
const ev = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result?.result?.value;
};
await send('Page.enable'); await send('Runtime.enable');
writeFileSync(`${ROOT}tools/.d1/.photo.html`, '<body style="margin:0"></body>');
await send('Page.navigate', { url: fileUrl(ROOT + 'tools/.d1/.photo.html') });
await sleep(700);

const out = await ev(`(async () => {
  const im = new Image();
  im.src = ${JSON.stringify(fileUrl(SRC))};
  await im.decode();
  const W = im.width, H = im.height;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0);
  const img = x.getImageData(0, 0, W, H);
  const p = img.data;
  const lum = (i) => 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];

  const corners = [[0,0],[W-1,0],[0,H-1],[W-1,H-1]].map(([sx,sy]) => Math.round(lum((sy*W+sx)*4)));

  /* Flood fill inward from every edge pixel that is dark enough. Iterative
     with an explicit stack — a recursive fill on 1.5M pixels blows the JS
     stack immediately. */
  const seen = new Uint8Array(W * H);
  const st = [];
  const push = (px, py) => {
    const q = py * W + px;
    if (seen[q]) return;
    if (lum(q * 4) > ${CUT}) return;
    seen[q] = 1; st.push(q);
  };
  for (let px = 0; px < W; px++) { push(px, 0); push(px, H - 1); }
  for (let py = 0; py < H; py++) { push(0, py); push(W - 1, py); }
  let filled = 0;
  while (st.length) {
    const q = st.pop(); filled++;
    const px = q % W, py = (q / W) | 0;
    if (px > 0) push(px - 1, py);
    if (px < W - 1) push(px + 1, py);
    if (py > 0) push(px, py - 1);
    if (py < H - 1) push(px, py + 1);
  }

  /* Feathered rather than binary: the studio black falls off gradually around
     the frame's edges, and a hard cut leaves a dark fringe on every rail. */
  for (let q = 0; q < W * H; q++) {
    if (seen[q]) { p[q * 4 + 3] = 0; continue; }
    const L = lum(q * 4);
    if (L < ${CUT} * 2.6) p[q * 4 + 3] = Math.round(255 * (L / (${CUT} * 2.6)));
  }
  x.putImageData(img, 0, 0);

  // crop to what is left
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    if (p[(py * W + px) * 4 + 3] > 8) {
      if (px < x0) x0 = px; if (px > x1) x1 = px;
      if (py < y0) y0 = py; if (py > y1) y1 = py;
    }
  }
  const pad = 6;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
  const bw = Math.min(W - x0, x1 - x0 + pad * 2);
  const bh = Math.min(H - y0, y1 - y0 + pad * 2);

  const o = document.createElement('canvas');
  o.width = Math.round(bw * ${SCALE}); o.height = Math.round(bh * ${SCALE});
  const g = o.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(c, x0, y0, bw, bh, 0, 0, o.width, o.height);
  return {
    data: o.toDataURL('image/webp', ${Q}).split(',')[1],
    W, H, corners, filled, pct: +(filled / (W * H) * 100).toFixed(1),
    crop: [bw, bh], w: o.width, h: o.height,
  };
})()`);

const buf = Buffer.from(out.data, 'base64');
writeFileSync(`${DIR}head.webp`, buf);
console.log(`\n  source      ${out.W} × ${out.H}, ${(statSync(SRC).size / 1024).toFixed(0)} kB`);
console.log(`  corners     ${out.corners.join(', ')} (luminance; all should be near 0)`);
console.log(`  keyed out   ${out.filled.toLocaleString()} px — ${out.pct}% of the image`);
console.log(`  cropped to  ${out.crop.join(' × ')}`);
console.log(`  head.webp   ${out.w} × ${out.h}, ${(buf.length / 1024).toFixed(0)} kB\n`);
bye();
process.exit(0);
