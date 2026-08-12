/**
 * Re-encode the education page's video for the web.
 *
 * The master is a 3458×1946 render, 15.6 s, 25 MB. That is a fine source and
 * an impossible thing to put on a page. This plays it once through a canvas,
 * re-records it at a sane size and bitrate, and writes a poster still beside
 * it.
 *
 * Run with:  node tools/education-video.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync, statSync, writeFileSync } from 'node:fs';
import { dir, fileUrl } from './lib/paths.mjs';

const ROOT = dir('../', import.meta.url);
const DIR = ROOT + 'src/assets/education/';
const NAME = '02.1.vid';        // the master, left untouched
const OUT = '02.1.web';         // what the page imports
const PORT = 9413;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p));

/* The master runs at 15 fps — measured, median frame gap exactly 1/15.
 *
 * An earlier version tried to synthesise the missing frames by cross-dissolving
 * between each pair. Do not put that back. A dissolve between two views of a
 * rotating rigid body is a double image, so every fast part of the turn came
 * out ghosted — worse to watch than the judder it was meant to cure.
 *
 * This is a faithful transcode instead: one output frame per source frame,
 * nothing invented. It cannot be smoother than the master. The fix for that is
 * a re-render at a higher rate, after which SRC_FPS below is the only thing
 * that changes.
 */
const OUT_W = 1280;
const SRC_FPS = 15;
const BITRATE = 2_000_000;
const POSTER_AT = 12.7;          // the frame that shows the arc on the head best

const sleep = (m) => new Promise((r) => setTimeout(r, m));

spawn(CHROME, ['--headless=new', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--window-size=1400,900', '--no-first-run',
  '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required',
  '--user-data-dir=' + ROOT + 'tools/.chrome-edu', 'about:blank'], { stdio: 'ignore' });

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

writeFileSync(ROOT + 'tools/.edu.html', '<body style="margin:0;background:#111"></body>');
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: fileUrl(ROOT + 'tools/.edu.html') });
await sleep(1000);

/* H.264 in MP4 if this Chrome can record it — every browser plays that, and
   VP9/WebM leaves older Safari with nothing. WebM is the fallback. */
const mime = await ev(`(() => {
  const want = ['video/mp4;codecs=avc1.4d002a', 'video/mp4;codecs=avc1', 'video/mp4',
                'video/webm;codecs=vp9', 'video/webm;codecs=vp8'];
  return want.find((m) => MediaRecorder.isTypeSupported(m)) || null;
})()`);
if (!mime) throw new Error('no supported recording format');
const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
console.log(`encoding as ${mime}`);

const meta = await ev(`(async () => {
  const v = document.createElement('video');
  v.src = ${JSON.stringify(fileUrl(DIR + NAME + '.mp4'))};
  v.muted = true; v.playsInline = true;
  document.body.appendChild(v);
  await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = () => rej(new Error('decode failed')); });
  window.__v = v;
  return { w: v.videoWidth, h: v.videoHeight, d: v.duration };
})()`);
const outH = Math.round((OUT_W * meta.h) / meta.w / 2) * 2;
console.log(`source ${meta.w}×${meta.h}, ${meta.d.toFixed(2)}s @ ${SRC_FPS}fps`
  + `  →  ${OUT_W}×${outH}, one frame in one frame out`);

/* Rendered first, then played out on a clock.
 *
 * Everything simpler than this was tried and failed the same way: MediaRecorder
 * stamps frames when they arrive, and nothing overrides that — not
 * captureStream's own sampling rate, and not a VideoFrame's explicit timestamp
 * through a MediaStreamTrackGenerator, which Chrome accepts and then ignores.
 *
 * So a seek loop encoded at the speed of the loop and turned a 15.60 s source
 * into 19.85 s. Real-time playback fixed the total but not the spacing, because
 * presenting a 3.4K source headless is not evenly paced: the result had a
 * median frame gap of 0.081 s where 1/15 is 0.067, so some frames held half
 * again as long as others. That unevenness is what reads as clunky.
 *
 * The only thing MediaRecorder will honour is real elapsed time, so it gets
 * real elapsed time. Pass one seeks every frame and keeps it as a WebP — slow,
 * exact, and off the clock entirely. Pass two decodes and emits them on a
 * strict 1/15 s timer, which takes as long as the clip lasts and produces the
 * even spacing the recorder then writes down.
 */
const srcFrames = Math.round(meta.d * SRC_FPS);
const result = await ev(`(async () => {
  const v = window.__v;
  const out = document.createElement('canvas');
  out.width = ${OUT_W}; out.height = ${outH};
  const cx = out.getContext('2d');
  cx.imageSmoothingQuality = 'high';

  // pass one — every frame, exactly, at whatever speed seeking allows
  const frames = [];
  for (let i = 0; i < ${srcFrames}; i++) {
    v.currentTime = i / ${SRC_FPS};
    await new Promise((res) => { v.onseeked = res; });
    cx.drawImage(v, 0, 0, ${OUT_W}, ${outH});
    frames.push(await new Promise((res) => out.toBlob(res, 'image/webp', 0.95)));
  }

  // pass two — the same frames, on a strict timer
  const stream = out.captureStream(0);
  const track = stream.getVideoTracks()[0];
  const chunks = [];
  const rec = new MediaRecorder(stream, { mimeType: '${mime}', videoBitsPerSecond: ${BITRATE} });
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const PERIOD = 1000 / ${SRC_FPS};
  const late = [];
  rec.start();
  const t0 = performance.now();
  for (let i = 0; i < frames.length; i++) {
    const bmp = await createImageBitmap(frames[i]);   // decode before waiting
    const due = t0 + i * PERIOD;
    const wait = due - performance.now();
    if (wait > 0) await new Promise((res) => setTimeout(res, wait));
    else if (i) late.push(-wait);
    cx.drawImage(bmp, 0, 0);
    track.requestFrame();
    bmp.close();
  }
  await new Promise((res) => setTimeout(res, PERIOD));
  await new Promise((res) => { rec.onstop = res; rec.stop(); });

  window.__blobParts = chunks;
  window.__mime = '${mime}';
  return {
    written: frames.length,
    elapsed: +((performance.now() - t0) / 1000).toFixed(2),
    lateFrames: late.length,
    worstLate: late.length ? +Math.max(...late).toFixed(1) : 0,
  };
})()`);
console.log(`  ${result.written} frames emitted over ${result.elapsed}s`
  + ` (${result.lateFrames} late, worst ${result.worstLate}ms)`);
if (result.lateFrames > result.written * 0.05) {
  console.warn('  WARNING: the timer could not keep up — spacing will be uneven');
}


/* Out in chunks — a few megabytes of base64 through one evaluate is asking
   for a truncated string. */
const size = await ev(`(async () => {
  window.__blob = new Blob(window.__blobParts, { type: window.__mime });
  window.__b64 = await new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.readAsDataURL(window.__blob);
  });
  return window.__b64.length;
})()`);
const parts = [];
const STEP = 800_000;
for (let i = 0; i < size; i += STEP) parts.push(await ev(`window.__b64.slice(${i}, ${i + STEP})`));
writeFileSync(DIR + OUT + '.' + ext, Buffer.from(parts.join(''), 'base64'));

// the poster
await ev(`(async () => {
  const v = window.__v;
  v.currentTime = ${POSTER_AT};
  await new Promise((res) => { v.onseeked = res; });
  const pc = document.createElement('canvas');
  pc.width = ${OUT_W}; pc.height = ${outH};
  const px = pc.getContext('2d');
  px.imageSmoothingQuality = 'high';
  px.drawImage(v, 0, 0, ${OUT_W}, ${outH});
  window.__poster = pc.toDataURL('image/webp', 0.86);
  return 1;
})()`);
writeFileSync(DIR + OUT + '.poster.webp', Buffer.from((await ev('window.__poster')).split(',')[1], 'base64'));

const src = statSync(DIR + NAME + '.mp4').size;
const enc = statSync(DIR + OUT + '.' + ext).size;
const post = statSync(DIR + OUT + '.poster.webp').size;
console.log(`\n  master  ${(src / 1024 / 1024).toFixed(1)} MB`);
console.log(`  encoded ${(enc / 1024).toFixed(0)} kB  (${OUT}.${ext})`);
console.log(`  poster  ${(post / 1024).toFixed(0)} kB`);
process.exit(0);
