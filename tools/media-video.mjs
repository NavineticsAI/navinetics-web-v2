/**
 * Publish a supplied clip, and cut a poster for it.
 *
 *   node tools/media-video.mjs <source.mp4> <out-name> <poster-seconds>
 *   node tools/media-video.mjs <source.mp4> <out-name> <poster-s> <width> <kbps>
 *
 * With no width given it COPIES the master and only cuts a poster. With a
 * width it re-encodes down to that size. Writes <out-name>.mp4 and
 * <out-name>.poster.webp beside the source; the master keeps its own name and
 * stays gitignored.
 *
 * COPY IS THE DEFAULT, AND USUALLY RIGHT. These masters are already what a
 * browser wants: H.264 in MP4 at 720x1280. Running one through the canvas
 * recorder below cannot improve on that and always costs something — the
 * first pass on this page went out at 608x1080 and 900 kbps, which was
 * visibly softer than the source and, less obviously, SILENT, because
 * canvas.captureStream carries no audio track. A copy has none of those
 * problems and is smaller than a re-encode of the same quality would be.
 *
 * Re-encode when the master is genuinely too big to serve, not by reflex.
 *
 * WHY NOT tools/education-video.mjs. That one seeks every frame, holds each as
 * a WebP, then plays them out on a strict timer — because its source is a 15
 * fps render whose frames MediaRecorder would otherwise space unevenly. These
 * clips are 30 fps phone footage of a real scene, where the decoder's own
 * pacing is already even, and the frame-exact path would mean seeking and
 * re-encoding some 3,600 frames for two minutes of video. Real-time capture is
 * both faster and, here, no worse.
 *
 * POSTER CHOICE IS EDITORIAL. Whatever frame is named on the command line is
 * the still every visitor sees before deciding to play. For clinical footage
 * that means choosing a frame that shows the instrument rather than the field.
 */
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { dir, fileUrl } from './lib/paths.mjs';

const ROOT = dir('../', import.meta.url);
const WORK = `${ROOT}tools/.media/`;
const PORT = 9750 + (process.pid % 200);

const SRC = process.argv[2];
const OUTNAME = process.argv[3];
const POSTER_AT = Number(process.argv[4] ?? 1);
/* No width on the command line means copy the master through untouched. */
const COPY = process.argv[5] === undefined;
const OUT_W = Number(process.argv[5] ?? 0);
const KBPS = Number(process.argv[6] ?? 900);

if (!SRC || !existsSync(SRC) || !OUTNAME) {
  console.log('\n  usage: node tools/media-video.mjs <source.mp4> <out-name> <poster-s> [width] [kbps]\n');
  process.exit(SRC ? 1 : 0);
}
const OUTDIR = SRC.replace(/[^\\/]+$/, '');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}.encode.html`, '<body style="margin:0;background:#111"></body>');

const chrome = spawn(CHROME, ['--headless=new', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--window-size=900,700', '--no-first-run',
  '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required',
  `--user-data-dir=${WORK}.chrome-enc-${process.pid}`, 'about:blank'], { stdio: 'ignore' });
let pg;
for (let i = 0; i < 140 && !pg; i++) {
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
const ev = async (expr, ms = 600000) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout: ms });
  if (r.result?.exceptionDetails) {
    throw new Error(r.result.exceptionDetails.exception?.description
      || JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  }
  return r.result?.result?.value;
};
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: fileUrl(`${WORK}.encode.html`) });
await sleep(900);

/* H.264 in MP4 where this Chrome can record it — every browser plays that, and
   VP9/WebM leaves older Safari with nothing. */
const mime = await ev(`(() => {
  const want = ['video/mp4;codecs=avc1.4d002a', 'video/mp4;codecs=avc1', 'video/mp4',
                'video/webm;codecs=vp9', 'video/webm;codecs=vp8'];
  return want.find((m) => MediaRecorder.isTypeSupported(m)) || null;
})()`);
if (!mime) throw new Error('no supported recording format');
const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';

const meta = await ev(`(async () => {
  const v = document.createElement('video');
  v.src = ${JSON.stringify(pathToFileURL(SRC).href)};
  v.muted = true; v.playsInline = true; v.preload = 'auto';
  document.body.appendChild(v);
  await new Promise((res, rej) => {
    v.onloadeddata = res;
    v.onerror = () => rej(new Error('cannot decode source'));
    setTimeout(() => rej(new Error('timeout loading source')), 60000);
  });
  window.__v = v;
  return { w: v.videoWidth, h: v.videoHeight, d: +v.duration.toFixed(2) };
})()`);
const outW = COPY ? meta.w : Math.round(OUT_W / 2) * 2;
const outH = COPY ? meta.h : Math.round((outW * meta.h) / meta.w / 2) * 2;
console.log(`\n  ${SRC.split(/[\\/]/).pop()}`);
if (COPY) {
  console.log(`  source ${meta.w}x${meta.h} ${meta.d}s  ->  copied as-is, poster only`);
} else {
  console.log(`  source ${meta.w}x${meta.h} ${meta.d}s  ->  ${outW}x${outH} @ ${KBPS} kbps, ${mime}`);
  console.log(`  recording in real time, so this takes about ${Math.ceil(meta.d)}s`);
}

const b64 = COPY ? null : await ev(`(async () => {
  const v = window.__v;
  const c = document.createElement('canvas');
  c.width = ${outW}; c.height = ${outH};
  const cx = c.getContext('2d');
  cx.imageSmoothingQuality = 'high';

  /* captureStream(0) plus an explicit requestFrame per decoded frame: the
     canvas emits exactly when the source does, so the recorder writes the
     source's own pacing rather than the compositor's. */
  const stream = c.captureStream(0);
  const track = stream.getVideoTracks()[0];
  const rec = new MediaRecorder(stream, {
    mimeType: ${JSON.stringify(mime)},
    videoBitsPerSecond: ${KBPS * 1000},
  });
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const done = new Promise((res) => { rec.onstop = res; });
  rec.start();

  await new Promise((res) => {
    const draw = () => {
      cx.drawImage(v, 0, 0, c.width, c.height);
      track.requestFrame();
      if (!v.ended) v.requestVideoFrameCallback(draw);
    };
    v.onended = () => setTimeout(res, 350);
    v.currentTime = 0;
    v.play().then(() => v.requestVideoFrameCallback(draw));
  });

  rec.stop();
  await done;
  const blob = new Blob(chunks, { type: ${JSON.stringify(mime)} });
  const buf = await blob.arrayBuffer();
  let s = '';
  const b = new Uint8Array(buf);
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
})()`);

const outFile = `${OUTDIR}${OUTNAME}.${COPY ? SRC.split('.').pop() : ext}`;
if (COPY) copyFileSync(SRC, outFile);
else writeFileSync(outFile, Buffer.from(b64, 'base64'));

const poster = await ev(`(async () => {
  const v = window.__v;
  v.pause();
  await new Promise((res) => { v.onseeked = res; v.currentTime = ${POSTER_AT}; });
  await new Promise((r) => setTimeout(r, 200));
  const c = document.createElement('canvas');
  c.width = ${outW}; c.height = ${outH};
  const cx = c.getContext('2d');
  cx.imageSmoothingQuality = 'high';
  cx.drawImage(v, 0, 0, c.width, c.height);
  return c.toDataURL('image/webp', 0.92).split(',')[1];
})()`);
const posterFile = `${OUTDIR}${OUTNAME}.poster.webp`;
writeFileSync(posterFile, Buffer.from(poster, 'base64'));

const mb = (p) => (statSync(p).size / 1048576).toFixed(2);
const kb = (p) => (statSync(p).size / 1024).toFixed(0);
console.log(`  ${outFile.split(/[\\/]/).pop()}  ${mb(outFile)} MB  (from ${mb(SRC)} MB)`);
console.log(`  ${posterFile.split(/[\\/]/).pop()}  ${kb(posterFile)} kB  @ ${POSTER_AT}s\n`);
bye();
process.exit(0);
