/**
 * Look at a video before it goes on the site.
 *
 *   node tools/media-review.mjs "src/assets/media/CLIP.mp4" [seconds...]
 *
 * Writes a contact sheet of frames to tools/.media/ so a human can audit what
 * is actually in a clip. Video is the one asset type nobody checks frame by
 * frame, and it is the one most likely to carry something that must not ship.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REVIEW OF THE TWO CLIPS SUPPLIED 2026-08-18
 *
 * Both are 720x1280 vertical phone recordings that arrived with the same
 * timestamp in the filename. They are NOT two copies of one recording — they
 * are different footage, and the "(1)" suffix does not mean what it usually
 * means.
 *
 * "VIDEO-2026-08-04-11-35-11 (1).mp4" — 52.7 s. NOT PUBLISHED.
 *   Live human neurosurgery. At 7 s and 31 s a patient's head is handled in
 *   the frame, partly uncovered and identifiable. At 44 s the surgical field
 *   is open, with exposed tissue. At 22 s an OEC fluoroscopy monitor is on
 *   screen carrying handwritten annotation in Portuguese ("OBSERVAÇÕES ...")
 *   that may be patient-identifying. Several clinicians' faces are visible.
 *
 *   Three separate things have to be true before any of this could be used:
 *   patient consent for publication, an interstitial for graphic content, and
 *   consent from the identifiable staff. There is also a fourth problem —
 *   the frame in this clip is BLACK and its arc is engraved "COLLAR ANG",
 *   where the NRSS is anodized blue. It may not be our device at all, and
 *   featuring another manufacturer's instrument would misrepresent it.
 *
 * "VIDEO-2026-08-04-11-35-11.mp4" — 68.2 s. NOT PUBLISHED.
 *   A NaviNetics launch or congress event, in Portuguese. Product close-ups
 *   on NaviNetics-branded cases, a speaker presenting, and the blue NRSS held
 *   up at 60 s and 66 s. Far more suitable as a highlight than the clip above
 *   — but at 44 s and 52 s the slides on screen read "3D SURFACE SCANS CREATE
 *   GEOMETRIC REPRESENTATIONS WITH ULTRA-HIGH PRECISION" and "CT & 3DSS image
 *   fusion / CT & 3DSS & CAD model (N-Bar) co-registration". Surface scanning
 *   is the one subject this site is under standing instruction never to
 *   mention, and a legible slide is a mention. Those seconds would have to be
 *   cut, or the instruction relaxed.
 *
 * Neither is encoded for the web yet. Both are far too large as supplied —
 * 8.4 MB and 18.0 MB — and would need the treatment in tools/education-video.mjs
 * (play through a canvas, re-record at a sane size and bitrate, write a poster)
 * before they could be shipped.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { dir, fileUrl } from './lib/paths.mjs';

const ROOT = dir('../', import.meta.url);
const WORK = `${ROOT}tools/.media/`;
const PORT = 9700 + (process.pid % 250);
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SRC = process.argv[2];
if (!SRC || !existsSync(SRC)) {
  console.log('\n  usage: node tools/media-review.mjs <video> [seconds...]');
  console.log('  The review of the clips supplied on 2026-08-18 is in the header of this file.\n');
  process.exit(SRC ? 1 : 0);
}
const TIMES = process.argv.slice(3).map(Number).filter((n) => Number.isFinite(n));

mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}.review.html`, '<body style="margin:0;background:#111"></body>');

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader',
  '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, '--no-first-run',
  '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required',
  `--user-data-dir=${WORK}.chrome-${process.pid}`, 'about:blank'], { stdio: 'ignore' });
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
const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result?.result?.value;
};
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: fileUrl(`${WORK}.review.html`) });
await sleep(800);

const meta = JSON.parse(await ev(`(async () => {
  window.__v = document.createElement('video');
  __v.src = ${JSON.stringify(pathToFileURL(SRC).href)};
  __v.muted = true; __v.preload = 'auto';
  await new Promise((res, rej) => {
    __v.onloadeddata = res;
    __v.onerror = () => rej(new Error('cannot decode'));
    setTimeout(() => rej(new Error('timeout')), 30000);
  });
  return JSON.stringify({ w: __v.videoWidth, h: __v.videoHeight, d: +__v.duration.toFixed(2) });
})()`));
console.log(`\n  ${SRC.split(/[\\/]/).pop()}  ${meta.w}x${meta.h}  ${meta.d}s`);

/* Evenly spaced unless asked otherwise: an even sweep is what catches the one
   second of a clip that should not be published. */
const times = TIMES.length ? TIMES : Array.from({ length: 12 }, (_, i) => +((i + 0.5) * meta.d / 12).toFixed(1));
const COLS = 4;
const CW = 320;
const CH = Math.round(CW * meta.h / meta.w);

const data = await ev(`(async () => {
  const times = ${JSON.stringify(times)};
  const cols = ${COLS}, cw = ${CW}, ch = ${CH};
  const c = document.createElement('canvas');
  c.width = cols * cw;
  c.height = Math.ceil(times.length / cols) * ch;
  const x = c.getContext('2d');
  x.fillStyle = '#111'; x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < times.length; i++) {
    await new Promise((res) => { __v.onseeked = res; __v.currentTime = times[i]; });
    await new Promise((r) => setTimeout(r, 120));
    x.drawImage(__v, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch);
    x.fillStyle = '#0f0'; x.font = '18px monospace';
    x.fillText(times[i] + 's', (i % cols) * cw + 10, Math.floor(i / cols) * ch + 24);
  }
  return c.toDataURL('image/png').split(',')[1];
})()`);

const out = `${WORK}${SRC.split(/[\\/]/).pop().replace(/\.[^.]+$/, '')}.sheet.png`;
writeFileSync(out, Buffer.from(data, 'base64'));
console.log(`  ${times.length} frames -> ${out.replace(ROOT, '')}\n`);
bye();
process.exit(0);
