/**
 * Crop the Technology mega-panel thumbnails out of the full figures.
 *
 *   node tools/crop-icons.mjs
 *
 * WHY. The panel renders these at 64 × 56 CSS px. Dropped in whole they were
 * unreadable: nbar.webp became a brown blob, fig-fscv.webp is mostly white
 * space so it became a white box with a smudge in it, and fusion.webp — a
 * 2400 px screenshot of a four-pane UI — became noise. The panel also looked
 * untidy, because two of the three are on dark grounds and one is on white.
 *
 * So each is cropped to the ONE thing that still reads at that size, and each
 * crop is chosen to sit on a dark ground so the three match:
 *
 *   stereotaxy  the localiser rods — blue bars, green fiducials
 *   neuro       the voltammogram colour field, no axes or labels
 *   ai          the 3-D pane: the frame in blue around an orange surface
 *
 * Cropping also removes the synthetic face from the stereotaxy figure, which
 * is a small bonus: a face at thumbnail size is a distraction, and at any size
 * it invites a question about whose head it is.
 *
 * Output: src/assets/icons/*.webp, committed. Re-run only if the sources change.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { webkit } from 'playwright';

const OUT = new URL('../src/assets/icons/', import.meta.url).pathname.replace(/^\//, '');
mkdirSync(OUT, { recursive: true });

/* Crop boxes as fractions of the source, so they survive a re-export at a
   different resolution. Roughly square, because the slot is 64 × 56. */
const JOBS = [
  {
    name: 'tech-stereotaxy',
    src: '../src/assets/software/nbar.webp',
    box: { x: 0.06, y: 0.28, w: 0.40, h: 0.46 },
    note: 'left rod panel + fiducials',
  },
  {
    name: 'tech-neuro',
    src: '../src/assets/maven/fig-fscv.webp',
    box: { x: 0.16, y: 0.52, w: 0.60, h: 0.38 },
    note: 'the colour field only',
  },
  {
    name: 'tech-ai',
    src: '../src/assets/software/fusion.webp',
    box: { x: 0.42, y: 0.44, w: 0.34, h: 0.44 },
    note: 'the 3-D pane',
  },
];

const browser = await webkit.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });

for (const job of JOBS) {
  /* Read the bytes and inline them. A file:// subresource inside a page made
     with setContent has an about:blank origin, and WebKit refuses to load it —
     the image reported complete with a naturalWidth of 0, which then asked for
     a zero-width viewport. Data URIs sidestep the origin entirely. */
  const src = new URL(job.src, import.meta.url);
  const b64src = readFileSync(src).toString('base64');
  await page.setContent(
    `<body style="margin:0;background:#000">
       <img id="i" src="data:image/webp;base64,${b64src}" style="display:block">
     </body>`,
  );
  await page.waitForFunction('!!document.getElementById("i")?.naturalWidth');
  const nat = await page.evaluate(() => {
    const i = document.getElementById('i');
    return { w: i.naturalWidth, h: i.naturalHeight };
  });

  const clip = {
    x: Math.round(nat.w * job.box.x),
    y: Math.round(nat.h * job.box.y),
    width: Math.round(nat.w * job.box.w),
    height: Math.round(nat.h * job.box.h),
  };
  await page.setViewportSize({ width: nat.w, height: nat.h });
  await page.waitForTimeout(120);

  const buf = await page.screenshot({ clip, type: 'png' });
  // Re-encode small: the slot is 64px, so 256 is already 2x on a 2x display.
  await page.setContent(
    `<body style="margin:0"><canvas id="c"></canvas></body>`,
  );
  const b64 = buf.toString('base64');
  const out = await page.evaluate(async ({ data, size }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const c = document.getElementById('c');
    const scale = size / Math.max(img.width, img.height);
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.9).split(',')[1];
  }, { data: b64, size: 256 });

  writeFileSync(`${OUT}${job.name}.webp`, Buffer.from(out, 'base64'));
  console.log(`${job.name}.webp  ${clip.width}x${clip.height} → 256px  (${job.note})`);
}

await browser.close();
process.exit(0);
