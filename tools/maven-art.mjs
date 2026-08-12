/**
 * Keep src/assets/maven in shape.
 *
 * Run with:  node tools/maven-art.mjs
 *
 * Two files are what the page ships, and neither arrived in a form a browser
 * can use well:
 *
 *   device.png               the whole unit at 1061x1483, on pure black
 *   product-drawing/Picture11.emf   a vector drawing at 600 dpi
 *
 * The rest of the folder is reference. product-drawing/2.png was the hero
 * until device.png arrived; it is a third of the resolution and it is standing
 * on a slab of table, so nothing uses it now.
 *
 * Three jobs, all idempotent:
 *
 *   1. The EMF is rendered to a PNG master through Windows' own GDI+, which is
 *      the only renderer on the machine that reads Enhanced Metafile. That is
 *      where the one high-resolution image on this page comes from — see the
 *      note on the render step for what it does and does not contain.
 *   2. Every master is trimmed to its own ink and written as a WebP beside it.
 *      The page imports the .webp; the .png stays as the source of truth.
 *   3. A manifest is printed, including the resolution each image can actually
 *      carry, because that is the constraint the layout was built around.
 *
 * Zero dependencies: GDI+ is reached through PowerShell, and the images are
 * decoded and re-encoded by a headless Chrome over the DevTools protocol, the
 * same way tools/partner-logos.mjs does it.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, statSync, rmSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { dir, fileUrl } from './lib/paths.mjs';

const ROOT = dir('../', import.meta.url);
const DIR = ROOT + 'src/assets/maven/';
const PORT = 9427;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p));

/**
 * `w` is the widest the WebP is allowed to be. It is never an upscale — every
 * master here is smaller than its slot, so the number is a ceiling that only
 * bites on the EMF render.
 *
 * Trimming is on alpha alone. Both masters are cutouts whose subject is
 * largely white, so counting near-white as background would trim into the
 * product.
 *
 * `key` lifts the render's table top and cast shadow off the unit — see the
 * note on the key step below for why that is a flood fill and not a crop.
 */
const ART = [
  {
    id: 'device',
    from: 'device.png',
    /* Displayed about 360 CSS px tall at the largest, so 620 wide is already
       three times what a 2x display asks for. There is no reason to ship the
       full 1061. */
    w: 620,
    key: { t: 16, feather: 4 },
    note: 'the whole unit, on black',
  },
  {
    id: 'detail',
    from: 'detail.png',
    w: 1400,
    note: 'front panel, from the vector drawing',
  },
];

/* ── Cutting the unit out of its background ───────────────────────────────────
   The supplied render stands on pure black: the border's mean luminance is
   0.17 and its brightest pixel is 7, while the darkest pixel anywhere inside
   the product is 54. The histogram has a floor between them — around fifteen,
   fewer than eighty pixels at any level — so the two do not overlap at all and
   a threshold in that gap separates them exactly.

   A flood fill from the four corners rather than a plain threshold, because a
   threshold is a claim about every pixel in the image and a fill is a claim
   only about pixels connected to the outside. If a future render puts a black
   recess inside the product, the fill leaves it alone and a threshold would
   punch a hole through it.

   Then one pass of feathering. The edge resolves in one or two pixels — 37,
   193, 255 across a typical silhouette — and those in-between pixels are the
   product blended with black by the renderer. Giving them alpha proportional
   to their own brightness un-blends them, near enough, and stops the cutout
   showing a hard dark rim on a ground that is dark but not black.

   Runs before the trim, so the trim then tightens to the product. That is what
   sets `deviceNative` in src/data/maven.js. */
const KEY_JS = `
  const lum = (i) => 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];
  const cleared = new Uint8Array(w * h);
  const st = [];
  const skipped = [];
  for (const [sx, sy] of [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]) {
    if (lum((sy * w + sx) * 4) > KEY.t) { skipped.push(sx + ',' + sy + ' is not background'); continue; }
    st.push(sy * w + sx);
  }
  while (st.length) {
    const q = st.pop();
    if (cleared[q]) continue;
    if (p[q * 4 + 3] > 8 && lum(q * 4) > KEY.t) continue;
    cleared[q] = 1;
    const x = q % w, y = (q - x) / w;
    if (x > 0) st.push(q - 1);
    if (x < w - 1) st.push(q + 1);
    if (y > 0) st.push(q - w);
    if (y < h - 1) st.push(q + w);
  }
  let back = 0;
  for (let i = 0; i < w * h; i++) if (cleared[i]) { back++; p[i * 4 + 3] = 0; }

  let rim = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const q = y * w + x;
    if (cleared[q]) continue;
    let open = false;
    for (const d of [-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1]) if (cleared[q + d]) { open = true; break; }
    if (!open) continue;
    const a = Math.min(255, Math.round(lum(q * 4) * KEY.feather));
    if (a < p[q * 4 + 3]) { p[q * 4 + 3] = a; rim++; }
  }
  x.putImageData(new ImageData(p, w, h), 0, 0);
  keyed = { back, rim, skipped };
`;

/**
 * Figures lifted out of info.pptx.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE DECK IS AN INVESTOR DECK AND SEVERAL OF ITS SLIDES ARE STAMPED
 * CONFIDENTIAL. Almost none of it belongs on a public website. What is taken
 * here is four figures that explain how the instrument works. What is
 * deliberately left behind:
 *
 *   · every market, patent and investment slide
 *   · every drug study — cocaine, fentanyl, oxycodone, nicotine, alcohol —
 *     and the traces that go with them
 *   · the surgical photography and the animal imaging
 *   · image42.png, which is a render of the base unit stamped
 *     "© 2014 MFMER · Mayo Clinic" — third-party artwork, not NaviNetics'
 *   · anything comparing the device to what is or is not FDA cleared
 *
 * Of the four that are taken, two are drawn in the deck itself and two look
 * like figures from published papers. Journals normally hold the copyright on
 * those even when the authors are your own people, so `check` marks the ones
 * that need a permissions answer before the page goes public. See the claims
 * notice in src/data/maven.js.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const FIGURES = [
  {
    id: 'fig-fscv',
    from: 'image9.tiff',
    w: 1000,
    check: 'looks like a journal figure — confirm permission',
    note: 'FSCV: the colour plot, the concentration trace above it, the voltammogram inset',
  },
  {
    id: 'fig-sensor',
    from: 'image91.png',
    w: 1400,
    check: null,
    note: 'the carbon-fibre microelectrode, drawn and photographed in the deck',
  },
  {
    id: 'fig-field',
    from: 'image60.PNG',
    w: 1000,
    check: null,
    note: 'a raw square-wave voltammogram — no axis, no scale, no number on it',
  },
  {
    id: 'fig-waveform',
    from: 'image30.png',
    w: 1400,
    check: 'looks like a journal figure — confirm permission',
    note: 'how the cyclic square waveform is built: staircase plus square wave',
  },
];

const DECK = DIR + 'info.pptx';
const MASTER = DIR + 'detail.png';
const EMF = DIR + 'product-drawing/Picture11.emf';

/* ── The deck, as a zip ───────────────────────────────────────────────────────
   Same hand-written reader as tools/partner-logos.mjs, with zip64 added: this
   deck is 152 MB and its central directory carries 64-bit offsets, which the
   32-bit fields of the original spec cannot hold. */
function unzip(buf, want) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && eocd < 0; i--) if (buf.readUInt32LE(i) === 0x06054b50) eocd = i;
  if (eocd < 0) throw new Error('info.pptx is not a zip');
  let count = buf.readUInt16LE(eocd + 10);
  let cd = buf.readUInt32LE(eocd + 16);
  if (cd === 0xffffffff || count === 0xffff) {
    for (let i = eocd - 20; i >= 0; i--) {
      if (buf.readUInt32LE(i) === 0x07064b50) {
        const z64 = Number(buf.readBigUInt64LE(i + 8));
        count = Number(buf.readBigUInt64LE(z64 + 32));
        cd = Number(buf.readBigUInt64LE(z64 + 48));
        break;
      }
    }
  }
  const out = new Map();
  let p = cd;
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = buf.readUInt16LE(p + 10);
    let csize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    let local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    let e = p + 46 + nameLen;
    const end = e + extraLen;
    while (e + 4 <= end) {
      const tag = buf.readUInt16LE(e);
      const sz = buf.readUInt16LE(e + 2);
      if (tag === 0x0001) {
        let o = e + 4;
        // usize first, then csize, then the local header offset
        o += 8;
        if (csize === 0xffffffff) { csize = Number(buf.readBigUInt64LE(o)); o += 8; }
        if (local === 0xffffffff) { local = Number(buf.readBigUInt64LE(o)); o += 8; }
      }
      e += 4 + sz;
    }
    if (want.has(name.toLowerCase())) {
      const lNameLen = buf.readUInt16LE(local + 26);
      const lExtraLen = buf.readUInt16LE(local + 28);
      const start = local + 30 + lNameLen + lExtraLen;
      const raw = buf.subarray(start, start + csize);
      out.set(name.toLowerCase(), method === 0 ? raw : inflateRawSync(raw));
    }
    p = end + commentLen;
  }
  return out;
}
/* 6x the metafile's own 337x435 frame. Past this GDI+ is redrawing curves it
   has already resolved and the file grows without getting sharper. */
const EMF_SCALE = 6;

/* ── 1 · the vector drawing, through GDI+ ─────────────────────────────────────
   Enhanced Metafile is a Windows format and Windows is the only thing here
   that reads it. System.Drawing.Imaging.Metafile plays the records back into a
   bitmap at whatever scale we ask for, so this is a true vector render rather
   than an upscale of a raster.

   WHAT THIS IMAGE IS. The metafile's own frame is a crop: it holds the unit
   from just below the indicator windows down to the base, and clips the top.
   That is in the file, not in the playback — drawing it at an offset, into a
   larger frame, or through a destination rectangle all clip in the same place.
   So this is the product's front panel at high resolution, and it is used as a
   detail image. The only artwork of the COMPLETE unit is 2.png at 334x382,
   which is what caps how large the device can be shown in the hero.        */
if (!existsSync(MASTER)) {
  if (process.platform !== 'win32') throw new Error('detail.png is missing and only Windows can render the EMF');
  const ps = `
    Add-Type -AssemblyName System.Drawing
    $mf = New-Object System.Drawing.Imaging.Metafile('${EMF.replace(/\//g, '\\')}')
    $s = ${EMF_SCALE}
    $bmp = New-Object System.Drawing.Bitmap([int]($mf.Width * $s), [int]($mf.Height * $s), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bmp.SetResolution($mf.HorizontalResolution, $mf.VerticalResolution)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.SmoothingMode = 'AntiAlias'
    $g.PixelOffsetMode = 'HighQuality'
    $g.ScaleTransform($s, $s)
    $g.DrawImage($mf, 0, 0)
    $g.Dispose()
    $bmp.Save('${MASTER.replace(/\//g, '\\')}', [System.Drawing.Imaging.ImageFormat]::Png)
    "$($bmp.Width)x$($bmp.Height)"
    $bmp.Dispose(); $mf.Dispose()`;
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('GDI+ render failed:\n' + (r.stderr || r.stdout));
  console.log(`  rendered   detail.png  ${r.stdout.trim()}  (EMF at ${EMF_SCALE}x)`);
} else {
  console.log('  detail.png already rendered');
}

/* ── 1b · figures out of the deck ─────────────────────────────────────────────
   Only the ones that are missing, and only if the deck is here at all — it is
   152 MB and gitignored, so a fresh clone has the WebPs and not the source.
   TIFF goes back through GDI+ because no browser decodes it. */
const missingFigs = FIGURES.filter((f) => !existsSync(DIR + f.id + '.png'));
if (missingFigs.length) {
  if (!existsSync(DECK)) {
    console.log(`  ${missingFigs.length} figure master(s) missing and info.pptx is not here — skipping`);
  } else {
    const want = new Set(missingFigs.map((f) => `ppt/media/${f.from}`.toLowerCase()));
    const got = unzip(readFileSync(DECK), want);
    for (const f of missingFigs) {
      const bytes = got.get(`ppt/media/${f.from}`.toLowerCase());
      if (!bytes) throw new Error(`${f.from} not found inside info.pptx`);
      if (/\.tiff?$/i.test(f.from)) {
        const tmp = DIR + f.id + '.tif';
        writeFileSync(tmp, bytes);
        const ps = `
          Add-Type -AssemblyName System.Drawing
          $i = [System.Drawing.Image]::FromFile('${tmp.replace(/\//g, '\\')}')
          $b = New-Object System.Drawing.Bitmap($i.Width, $i.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
          $g = [System.Drawing.Graphics]::FromImage($b)
          $g.Clear([System.Drawing.Color]::White)
          $g.DrawImage($i, 0, 0, $i.Width, $i.Height)
          $g.Dispose()
          $b.Save('${(DIR + f.id + '.png').replace(/\//g, '\\')}', [System.Drawing.Imaging.ImageFormat]::Png)
          "$($i.Width)x$($i.Height)"
          $b.Dispose(); $i.Dispose()`;
        const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], { encoding: 'utf8' });
        if (r.status !== 0) throw new Error('TIFF conversion failed:\n' + (r.stderr || r.stdout));
        rmSync(tmp); // the PNG is the master; the TIFF was only a step to it
        console.log(`  extracted  ${f.id}.png  (${f.from} → ${r.stdout.trim()} via GDI+)`);
      } else {
        writeFileSync(DIR + f.id + '.png', bytes);
        console.log(`  extracted  ${f.id}.png  (${f.from})`);
      }
    }
  }
}
for (const f of FIGURES) {
  if (existsSync(DIR + f.id + '.png')) ART.push({ id: f.id, from: f.id + '.png', w: f.w, note: f.note });
}

/* ── Chrome ───────────────────────────────────────────────────────────────── */
const sleep = (m) => new Promise((r) => setTimeout(r, m));
writeFileSync(ROOT + 'tools/.maven.html', '<body style="margin:0"></body>');
spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--window-size=900,600', '--no-first-run',
  '--allow-file-access-from-files', '--user-data-dir=' + ROOT + 'tools/.chrome-maven',
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
await send('Page.navigate', { url: fileUrl(ROOT + 'tools/.maven.html') });
await sleep(900);

/* ── 2 · web copies ───────────────────────────────────────────────────────── */
console.log('');
const manifest = [];
for (const a of ART) {
  const bytes = readFileSync(DIR + a.from).toString('base64');
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
    const KEY = ${JSON.stringify(a.key ?? null)};
    let keyed = null;
    if (KEY) { ${KEY_JS} }

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
    // from the keyed canvas, not the original image, or the slab comes back
    ox.drawImage(KEY ? c : img, x0, y0, cw, ch, 0, 0, o.width, o.height);
    return { uri: o.toDataURL('image/webp', 0.92), w, h, ow: o.width, oh: o.height, keyed };
  })()`);
  writeFileSync(DIR + a.id + '.webp', Buffer.from(d.uri.split(',')[1], 'base64'));
  const kb = statSync(DIR + a.id + '.webp').size / 1024;
  manifest.push({ ...a, ...d, kb });
  console.log(`  ${a.id.padEnd(8)} ${String(d.w).padStart(4)}×${String(d.h).padEnd(4)}`
    + ` → ${String(d.ow).padStart(4)}×${String(d.oh).padEnd(4)} webp ${kb.toFixed(1)} kB   ${a.note}`);
  if (d.keyed) {
    console.log(`           keyed off ${d.keyed.back} px of background, feathered ${d.keyed.rim}`
      + ` px of rim`);
    if (d.keyed.skipped.length) {
      console.log(`           CORNERS NOT BACKGROUND: ${d.keyed.skipped.join('; ')}`
        + ' — this master may not be on black, check the result');
    }
  }
}

/* ── 3 · manifest ─────────────────────────────────────────────────────────── */
const device = manifest.find((m) => m.id === 'device');
console.log(`\n  ${manifest.length} images, ${manifest.reduce((s, m) => s + m.kb, 0).toFixed(0)} kB of WebP total`);
console.log(`  the hero device is ${device.ow}×${device.oh}, capped from ${device.w}×${device.h}.`);
console.log('  Put its trimmed size in `deviceNative` in src/data/maven.js — the ring reads it.');
const check = FIGURES.filter((f) => f.check);
if (check.length) {
  console.log('\n  PERMISSIONS STILL TO CONFIRM:');
  for (const f of check) console.log(`    ${f.id}  (${f.from})  ${f.check}`);
}
process.exit(0);
