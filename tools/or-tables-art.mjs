/**
 * Pull the carbon table artwork out of the PDFs.
 *
 * Run with:  node tools/or-tables-art.mjs
 *
 * NaviNetics supplied two PDFs in src/assets/or-tables:
 *
 *   CBH_Brochure_2026yr.pdf     261 MB, 11 pages, 98 image XObjects
 *   Carbon Tables _ Commercialized & Under development.pdf   the line-up sheet
 *
 * Both are gitignored — `*.pdf` — so a fresh clone has the WebPs and not the
 * source, and this tool skips extraction when the PDFs are absent. The masters
 * it writes ARE committed, because nothing else can reproduce them.
 *
 * WHY THIS PARSES PDF BY HAND. No renderer is installed on this machine and
 * none of the usual extractors are either: pdfimages, pdftoppm, pdftopng,
 * mutool and ghostscript are all missing, and the pdftotext that is here is
 * Xpdf's, which has no image support at all. So the images come out the only
 * way left — reading the PDF's own object table.
 *
 * The pictures are Flate-compressed CMYK with a separate greyscale /SMask, so
 * each one is: inflate, convert CMYK to RGB, inflate the mask, use it as
 * alpha. That is why the table arrives already cut out of its background.
 *
 * ONE THING NOT TO REPEAT. `pdftotext -layout` reads the specification tables
 * with the values one row out of step with their labels, silently — it puts
 * the CXR-701's table weight against "load capacity" and its load capacity
 * against "Control Switch". `-table` reads them correctly. The numbers in
 * src/data/orTables.js came from `-table`, and anyone re-deriving them should
 * use the same flag and check a row they already know.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { deflateSync, inflateSync } from 'node:zlib';

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '');
const DIR = ROOT + 'src/assets/or-tables/';
const BROCHURE = DIR + 'CBH_Brochure_2026yr.pdf';
const PORT = 9429;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p));

/**
 * What to take, by PDF object number.
 *
 * Object numbers rather than page-and-position because that is what the file
 * actually keys on; if the brochure is re-exported these will move, and the
 * tool says so loudly rather than writing the wrong picture.
 *
 * EVERY ONE OF THESE WAS LOOKED AT FULL SIZE BEFORE IT WAS USED, and that is
 * not fussiness. Chosen off a 300px contact sheet, two of them were wrong in
 * ways that still produced a plausible page: object 822 reads as a tabletop at
 * thumbnail size and is a tight crop of C-arm hardware, and object 229 reads
 * as "a top lit across its width" and is a lighting wipe from a video
 * transition — a white smear on black, a picture of nothing. A wrong object
 * number does not crash; it publishes a confident caption over the wrong
 * image. Look at them.
 *
 * Deliberately left behind: the twenty-odd frames of a C-arm animation, the
 * video stills with their own captions burned in ("Height Range 300mm",
 * "Lifting Capacity 230kg", "Accurate shooting is possible only by moving the
 * table without moving C-arm"), and every page carrying Quantum Hunex Korea /
 * ParagonCare Korea's address and telephone number. A distributor's contact
 * block is not NaviNetics' to publish.
 */
const ART = [
  { id: 'table', obj: 35, w: 1500, note: 'the unit, cut out — hero' },
  { id: 'table-alt', obj: 2450, w: 1500, note: 'the same table, three-quarter' },
  { id: 'table-side', obj: 1140, w: 1400, note: 'CXR-70F in side elevation, top clear' },
  { id: 'table-motion', obj: 1141, w: 1400, note: 'the same table with its tilt positions ghosted' },
];

/* ── The PDF, as an object table ──────────────────────────────────────────── */
function images(buf) {
  const s = buf.toString('latin1');
  const out = new Map();
  const re = /(\d+)\s+(\d+)\s+obj\b/g;
  let m;
  while ((m = re.exec(s))) {
    const streamAt = s.indexOf('stream', m.index);
    if (streamAt < 0) continue;
    const dict = s.slice(m.index, streamAt);
    if (dict.length > 4000 || !/\/Subtype\s*\/Image/.test(dict)) continue;
    let p = streamAt + 6;
    if (s[p] === '\r') p++;
    if (s[p] === '\n') p++;
    const n = (k) => {
      const r = new RegExp(`/${k}\\s+(\\d+)`).exec(dict);
      return r ? Number(r[1]) : null;
    };
    out.set(Number(m[1]), {
      w: n('Width'),
      h: n('Height'),
      filter: /\/Filter\s*(\[[^\]]*\]|\/\w+)/.exec(dict)?.[1] ?? '',
      /* An inverted /Decode is how a CMYK image says its samples are stored
         the other way up. Rare, but silent and catastrophic if missed. */
      invert: /\/Decode\s*\[\s*1/.test(dict),
      smask: n('SMask'),
      start: p,
      len: n('Length'),
    });
  }
  return out;
}

const bytes = (buf, o) => {
  let d = buf.subarray(o.start, o.start + o.len);
  if (/FlateDecode/.test(o.filter)) d = inflateSync(d);
  return d;
};

/** CMYK, RGB or grey samples plus an optional soft mask → RGBA. */
function toRGBA(buf, objs, o) {
  const d = bytes(buf, o);
  const px = o.w * o.h;
  const comps = Math.round(d.length / px);
  if (comps < 1 || comps > 4) throw new Error(`${comps} components — not a plain raster`);
  const rgba = Buffer.alloc(px * 4, 255);
  for (let i = 0; i < px; i++) {
    let r;
    let g;
    let b;
    if (comps === 4) {
      let c = d[i * 4];
      let mm = d[i * 4 + 1];
      let y = d[i * 4 + 2];
      let k = d[i * 4 + 3];
      if (o.invert) { c = 255 - c; mm = 255 - mm; y = 255 - y; k = 255 - k; }
      r = ((255 - c) * (255 - k)) / 255;
      g = ((255 - mm) * (255 - k)) / 255;
      b = ((255 - y) * (255 - k)) / 255;
    } else if (comps === 3) {
      r = d[i * 3]; g = d[i * 3 + 1]; b = d[i * 3 + 2];
    } else {
      r = d[i]; g = d[i]; b = d[i];
    }
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b;
  }
  if (o.smask && objs.has(o.smask)) {
    const sm = objs.get(o.smask);
    if (sm.w === o.w && sm.h === o.h) {
      const a = bytes(buf, sm);
      if (a.length >= px) for (let i = 0; i < px; i++) rgba[i * 4 + 3] = a[i];
    }
  }
  return rgba;
}

/* ── PNG out, so Chrome has something to open ─────────────────────────────── */
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return (b) => {
    let c = -1;
    for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();
function png(path, w, h, rgba) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(CRC(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  writeFileSync(path, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]));
}
/* ── 1 · masters ──────────────────────────────────────────────────────────── */
const missing = ART.filter((a) => !existsSync(DIR + a.id + '.png'));
if (missing.length) {
  if (!existsSync(BROCHURE)) {
    console.log(`  ${missing.length} master(s) missing and the brochure is not here — skipping`);
  } else {
    const buf = readFileSync(BROCHURE);
    const objs = images(buf);
    console.log(`  brochure: ${(buf.length / 1048576).toFixed(0)} MB, ${objs.size} image objects`);
    for (const a of missing) {
      const o = objs.get(a.obj);
      if (!o) throw new Error(`object ${a.obj} is not an image in this brochure — it has been re-exported, and the object numbers in ART need redoing`);
      png(DIR + a.id + '.png', o.w, o.h, toRGBA(buf, objs, o));
      console.log(`  extracted  ${a.id}.png  obj ${a.obj}  ${o.w}×${o.h}${o.smask ? ' +mask' : ''}`);
    }
  }
} else {
  console.log('  all masters present');
}

/* ── 2 · web copies, through Chrome ───────────────────────────────────────── */
const present = ART.filter((a) => existsSync(DIR + a.id + '.png'));
if (!present.length) process.exit(0);

const sleep = (m) => new Promise((r) => setTimeout(r, m));
writeFileSync(ROOT + 'tools/.ortables.html', '<body style="margin:0"></body>');
spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--window-size=900,600', '--no-first-run',
  '--allow-file-access-from-files', '--user-data-dir=' + ROOT + 'tools/.chrome-ortables',
  'about:blank'], { stdio: 'ignore' });

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
await send('Page.navigate', { url: 'file:///' + ROOT + 'tools/.ortables.html' });
await sleep(900);

console.log('');
let total = 0;
for (const a of present) {
  const b64 = readFileSync(DIR + a.id + '.png').toString('base64');
  const d = await ev(`(async () => {
    const img = await new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej;
      i.src = 'data:image/png;base64,${b64}';
    });
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const p = x.getImageData(0, 0, w, h).data;
    /* Alpha only: these arrived as cutouts and the subject is a dark table on
       nothing, so near-white is not background here — it is the top's specular. */
    let x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      if (p[(yy * w + xx) * 4 + 3] < 8) continue;
      if (xx < x0) x0 = xx; if (xx > x1) x1 = xx;
      if (yy < y0) y0 = yy; if (yy > y1) y1 = yy;
    }
    if (x1 < 0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
    const k = Math.min(1, ${a.w} / cw);
    const o = document.createElement('canvas');
    o.width = Math.round(cw * k); o.height = Math.round(ch * k);
    const ox = o.getContext('2d');
    ox.imageSmoothingQuality = 'high';
    ox.drawImage(c, x0, y0, cw, ch, 0, 0, o.width, o.height);
    return { uri: o.toDataURL('image/webp', 0.9), w, h, ow: o.width, oh: o.height };
  })()`);
  writeFileSync(DIR + a.id + '.webp', Buffer.from(d.uri.split(',')[1], 'base64'));
  const kb = statSync(DIR + a.id + '.webp').size / 1024;
  total += kb;
  console.log(`  ${a.id.padEnd(11)} ${String(d.w).padStart(4)}×${String(d.h).padEnd(4)}`
    + ` → ${String(d.ow).padStart(4)}×${String(d.oh).padEnd(4)} webp ${kb.toFixed(1)} kB   ${a.note}`);
}
console.log(`\n  ${present.length} images, ${total.toFixed(0)} kB of WebP total`);
console.log('  Specification figures are transcribed with `pdftotext -table`, never -layout.');
process.exit(0);
