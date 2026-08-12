/**
 * Keep src/assets/partners in shape.
 *
 * The folder holds one PNG master per organisation, named after the
 * organisation. Replacing a mark means dropping a new PNG over the old one and
 * re-running this — nothing else refers to the artwork by any other name.
 *
 * Run with:  node tools/partner-logos.mjs
 *
 * Three jobs, in order, and all of them skip work that is already done:
 *
 *   1. Any master that is missing gets created — pulled out of info.pptx if the
 *      deck has that mark, otherwise drawn as a labelled placeholder. A master
 *      that already exists is never touched, so a mark you have replaced by
 *      hand survives every future run.
 *   2. Every master is trimmed to its own ink and written as a WebP beside it.
 *      The page imports the .webp; the .png stays as the source of truth.
 *   3. A manifest is printed, so it is obvious at a glance which marks are
 *      still placeholders.
 *
 * Zero dependencies: the deck is unzipped with node:zlib and the images are
 * decoded and re-encoded by a headless Chrome over the DevTools protocol, the
 * same way tools/education-images.mjs does it.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { dir, fileUrl } from './lib/paths.mjs';

const ROOT = dir('../', import.meta.url);
const DIR = ROOT + 'src/assets/partners/';
const DECK = DIR + 'info.pptx';
const PORT = 9425;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p));

/**
 * Every mark the partners page can show.
 *
 * `from` names the file inside info.pptx that carries it. `supplied` records a
 * mark that arrived some other way — someone dropped the artwork in by hand.
 *
 * A mark with neither is a placeholder: no artwork exists for it anywhere, one
 * is drawn from its name, and the manifest says so on every run. That is the
 * only thing the "still placeholders" line means, so both fields have to be
 * kept honest or it starts lying in the safe direction.
 */
const MARKS = [
  { id: 'abbott', name: 'Abbott', from: 'ppt/media/image5.svg' },
  { id: 'paragon-care', name: 'Paragon Care', from: 'ppt/media/image6.png' },
  { id: 'lituo-medical', name: 'Lituo Medical', from: 'ppt/media/image7.png' },
  /* The deck's own CBH mark, at 200×126. Nothing imports it — the page reads
     navinetics-asia, which now carries the same mark at seven times the size.
     Kept as the deck's record of what was in the deck. */
  { id: 'cbh', name: 'CBH', from: 'ppt/media/image22.png' },
  { id: 'elim-dmp', name: 'ELIM DMP', from: 'ppt/media/image23.png' },
  {
    id: 'delta-medical',
    name: 'Delta Medical',
    from: null,
    supplied: 'dropped in by NaviNetics — the wordmark with its diamond and the Portuguese tagline',
  },
  {
    /* Deliberately its own file rather than an alias of cbh: this slot is what
       South Korea shows, and what it shows is a decision. It currently holds
       the CBH mark at high resolution — see the note in data/partners.js. */
    id: 'navinetics-asia',
    name: 'NaviNetics Asia',
    from: null,
    supplied: 'dropped in by NaviNetics — the CBH mark at 1485×944',
  },
];

const MASTER_W = 1200;   // masters are rendered/kept this wide at most
const WEB_W = 520;       // what the page actually loads
const QUALITY = 0.94;

/* ── The deck, as a zip ───────────────────────────────────────────────────── */
function unzip(buf, want) {
  // end of central directory, scanned backwards past any trailing comment
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && eocd < 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) eocd = i;
  }
  if (eocd < 0) throw new Error('info.pptx is not a zip');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out = new Map();
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory');
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (want.has(name)) {
      // the local header repeats the name and extra field at its own lengths
      const lNameLen = buf.readUInt16LE(local + 26);
      const lExtraLen = buf.readUInt16LE(local + 28);
      const start = local + 30 + lNameLen + lExtraLen;
      const raw = buf.subarray(start, start + csize);
      out.set(name, method === 0 ? raw : inflateRawSync(raw));
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

/* ── Chrome ───────────────────────────────────────────────────────────────── */
const sleep = (m) => new Promise((r) => setTimeout(r, m));
writeFileSync(ROOT + 'tools/.partners.html', '<body style="margin:0"></body>');
spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--window-size=900,600', '--no-first-run',
  '--allow-file-access-from-files', '--user-data-dir=' + ROOT + 'tools/.chrome-partners',
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
await send('Page.navigate', { url: fileUrl(ROOT + 'tools/.partners.html') });
await sleep(1000);

const png = (uri, path) => writeFileSync(path, Buffer.from(uri.split(',')[1], 'base64'));

/* ── 1 · masters ──────────────────────────────────────────────────────────────
   A missing master is normally a mark that has never been supplied. It is not
   always: someone replacing a logo may reasonably drop the .webp over the top,
   since that is the file the page actually imports, and delete the .png.

   That used to be destructive. The old order was "master missing → draw a
   placeholder → regenerate the webp from it", which quietly overwrote the new
   artwork with a wordmark. So a webp with no master beside it is now read as
   the replacement it is: it becomes the master, and the contract — the .png is
   the source of truth, the .webp is built from it — is restored rather than
   enforced by deleting someone's work.

   Dropping in a .png is still the documented way to do it. This is the safety
   net for the other way round.                                             */
let missing = MARKS.filter((m) => !existsSync(DIR + m.id + '.png'));
const orphans = missing.filter((m) => existsSync(DIR + m.id + '.webp'));
for (const m of orphans) {
  const bytes = readFileSync(DIR + m.id + '.webp').toString('base64');
  const uri = await ev(`(async () => {
    const img = await new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej;
      i.src = 'data:image/webp;base64,${bytes}';
    });
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/png');
  })()`);
  png(uri, DIR + m.id + '.png');
  console.log(`  recovered  ${m.id}.png from the webp beside it — that webp was newer than any master`);
}
missing = missing.filter((m) => !orphans.includes(m));

let deck = new Map();
if (missing.some((m) => m.from)) {
  if (!existsSync(DECK)) throw new Error('info.pptx is missing and some masters need extracting from it');
  deck = unzip(readFileSync(DECK), new Set(missing.map((m) => m.from).filter(Boolean)));
}

for (const m of missing) {
  if (m.from) {
    const bytes = deck.get(m.from);
    if (!bytes) throw new Error(`${m.from} not found inside info.pptx`);
    const mime = m.from.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    const uri = await ev(`(async () => {
      const img = await new Promise((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej;
        i.src = 'data:${mime};base64,${bytes.toString('base64')}';
      });
      const k = Math.min(1, ${MASTER_W} / img.naturalWidth);
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.naturalWidth * k));
      c.height = Math.max(1, Math.round(img.naturalHeight * k));
      const x = c.getContext('2d');
      x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/png');
    })()`);
    png(uri, DIR + m.id + '.png');
    console.log(`  extracted  ${m.id}.png  (${m.from})`);
  } else {
    /* A placeholder shaped like a wordmark, not like a notice.
     *
     * The first version of this was a bordered card with PLACEHOLDER across
     * the top and an instruction underneath. It read perfectly when opened as
     * a file and was an illegible grey smear in the page, because a mark is
     * shown about 18 CSS pixels tall — a 900×260 card scaled to that height
     * puts its 54px type at under four pixels.
     *
     * So it is set as the organisation's name at wordmark proportions, which
     * survives the scale, over a dashed rule that says it is standing in for
     * something. Both readings work: legible in the page, obviously
     * provisional when you open it. */
    const uri = await ev(`(() => {
      const c = document.createElement('canvas');
      const x = c.getContext('2d');
      const FONT = '600 72px system-ui, "Segoe UI", sans-serif';
      x.font = FONT;
      const w = Math.ceil(x.measureText(${JSON.stringify(m.name)}).width);
      c.width = w + 48; c.height = 128;
      const g = c.getContext('2d');
      g.font = FONT;
      g.textBaseline = 'alphabetic';
      g.fillStyle = '#0b384d';
      g.fillText(${JSON.stringify(m.name)}, 24, 84);
      g.strokeStyle = '#8aa5b3'; g.lineWidth = 4; g.setLineDash([10, 8]);
      g.beginPath(); g.moveTo(24, 108); g.lineTo(c.width - 24, 108); g.stroke();
      return c.toDataURL('image/png');
    })()`);
    png(uri, DIR + m.id + '.png');
    console.log(`  placeholder ${m.id}.png`);
  }
}
if (!missing.length && !orphans.length) console.log('  all masters present');

/* ── 2 · web copies ───────────────────────────────────────────────────────── */
console.log('');
const manifest = [];
for (const m of MARKS) {
  const master = DIR + m.id + '.png';
  const bytes = readFileSync(master).toString('base64');
  const d = await ev(`(async () => {
    const img = await new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej;
      i.src = 'data:image/png;base64,${bytes}';
    });
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const p = x.getImageData(0, 0, w, h).data;
    /* Trim to the ink. Masters arrive with different amounts of slack around
       the artwork and a logo row only looks level if each is trimmed first.
       Transparent and near-white both count as background. */
    const bg = (i) => p[i + 3] < 12 || (p[i] > 247 && p[i + 1] > 247 && p[i + 2] > 247);
    let x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      if (bg((yy * w + xx) * 4)) continue;
      if (xx < x0) x0 = xx; if (xx > x1) x1 = xx;
      if (yy < y0) y0 = yy; if (yy > y1) y1 = yy;
    }
    if (x1 < 0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }   // fully blank
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
    const k = Math.min(1, ${WEB_W} / cw);
    const o = document.createElement('canvas');
    o.width = Math.round(cw * k); o.height = Math.round(ch * k);
    const ox = o.getContext('2d');
    ox.imageSmoothingQuality = 'high';
    ox.drawImage(img, x0, y0, cw, ch, 0, 0, o.width, o.height);
    return { uri: o.toDataURL('image/webp', ${QUALITY}), w, h, ow: o.width, oh: o.height };
  })()`);
  png(d.uri, DIR + m.id + '.webp');
  const kb = statSync(DIR + m.id + '.webp').size / 1024;
  manifest.push({ id: m.id, w: d.ow, h: d.oh, kb, real: !!(m.from || m.supplied) });
  console.log(`  ${m.id.padEnd(16)} ${String(d.w).padStart(4)}×${String(d.h).padEnd(4)} png`
    + ` → ${String(d.ow).padStart(3)}×${String(d.oh).padEnd(3)} webp ${kb.toFixed(1)} kB`);
}

/* ── 3 · manifest ─────────────────────────────────────────────────────────── */
const holes = manifest.filter((m) => !m.real);
console.log(`\n  ${manifest.length} marks, ${(manifest.reduce((a, m) => a + m.kb, 0)).toFixed(0)} kB of WebP total`);
if (holes.length) {
  console.log(`  still placeholders: ${holes.map((h) => h.id).join(', ')}`);
}
process.exit(0);
