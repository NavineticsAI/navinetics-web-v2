/**
 * Where content actually starts, and how far apart sections actually sit,
 * measured in the browser at five widths.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort
 *   node tools/check-layout.mjs
 *
 * WHY THIS EXISTS. Section sets the gutter (px-6 lg:px-8) and the measure
 * (max-w-5xl, or max-w-7xl when wide). Pages that build their own <section>
 * instead of using it re-declare both, and drift: a hand-written px-6 with no
 * lg:px-8 puts its content 8px left of every other section above 1024px, and a
 * hand-written max-w-4xl or max-w-[96rem] puts it somewhere else again.
 *
 * None of that is visible on one page at one width. It is very visible walking
 * the site, as edges that do not line up and gaps that do not repeat. This
 * prints the distinct values so the drift is a list rather than a feeling.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 9543;
/* Defaults to the preview server; pass a base to measure the dev server
   instead, e.g. `node tools/check-layout.mjs http://localhost:5173`. */
const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const WIDTHS = [375, 768, 1024, 1440, 1920];
const ROUTES = [
  '/', '/company/who-we-are', '/company/our-founders', '/company/partners', '/company/community',
  '/products/d1-stereotactic-frame', '/products/carbon-fiber-surgical-tables',
  '/products/maven-neuromodulation',
  '/technology/stereotactic-devices', '/technology/neuromodulation', '/technology/navinetics-ai',
  '/resources/media', '/resources/careers', '/resources/education', '/resources/publications',
  '/contact',
];

spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PORT}`, '--no-first-run', '--hide-scrollbars',
  /* OUTSIDE the project. A Chrome profile under tools/ sits inside Vite's
     watched tree, and Vite dies with EBUSY trying to watch Chrome's cache
     db — which takes the dev server down mid-measurement. */
  `--user-data-dir=${join(tmpdir(), 'nn-chrome-layout')}`,
  'about:blank'], { stdio: 'ignore' });

let pg;
for (let i = 0; i < 80 && !pg; i++) {
  try { pg = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); }
  catch { /* not up */ }
  if (!pg) await sleep(250);
}
if (!pg) { console.error('could not attach to Chrome'); process.exit(1); }
const ws = new WebSocket(pg.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;
await send('Page.enable'); await send('Runtime.enable');

/* Top-level page sections and the inner container each one centres. */
const PROBE = `(() => {
  const main = document.getElementById('main');
  if (!main) return null;
  // The page's own sections: skip the transition wrapper if there is one.
  let host = main;
  while (host.children.length === 1) host = host.children[0];
  const secs = [...host.children].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.height > 40;
  });

  const rows = [];
  let prevBottom = null;
  for (const s of secs) {
    const sr = s.getBoundingClientRect();
    /* The section's own frame: the WIDEST centred, max-width-capped element
       near the top of it. Taking the first match instead reported centred
       max-w-prose blocks (65ch ≈ 1086px) as misaligned containers, which they
       are not — a centred paragraph is a typographic choice inside the frame,
       not the frame. */
    let inner = null;
    for (const el of [s, ...s.querySelectorAll(':scope > *, :scope > * > *')]) {
      const cs = getComputedStyle(el);
      if (cs.marginLeft !== cs.marginRight || cs.maxWidth === 'none') continue;
      const r = el.getBoundingClientRect();
      if (r.width > 100 && (!inner || r.width > inner.width)) inner = r;
    }
    const tag = s.tagName.toLowerCase()
      + (s.className && typeof s.className === 'string'
          ? '.' + s.className.trim().split(/\\s+/).filter((c) => !c.startsWith('bg-')).slice(0, 2).join('.')
          : '');
    rows.push({
      tag: tag.slice(0, 46),
      left: inner ? Math.round(inner.left) : null,
      width: inner ? Math.round(inner.width) : null,
      padTop: Math.round(parseFloat(getComputedStyle(s).paddingTop)),
      padBottom: Math.round(parseFloat(getComputedStyle(s).paddingBottom)),
      gapAbove: prevBottom === null ? null : Math.round(sr.top - prevBottom),
    });
    prevBottom = sr.bottom;
  }
  return rows;
})()`;

const leftsByWidth = new Map();   // width -> Map(left -> count)
const measureByWidth = new Map(); // width -> Map(innerWidth -> count)
const padByWidth = new Map();     // width -> Map(padTop -> count)
const offenders = [];

for (const w of WIDTHS) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768,
  });
  leftsByWidth.set(w, new Map());
  measureByWidth.set(w, new Map());
  padByWidth.set(w, new Map());

  for (const path of ROUTES) {
    await send('Page.navigate', { url: BASE + path });
    await sleep(1500);
    const rows = await ev(PROBE);
    if (!rows) continue;
    for (const r of rows) {
      if (r.left === null) continue;
      const bump = (map, k) => map.set(k, (map.get(k) || 0) + 1);
      bump(leftsByWidth.get(w), r.left);
      bump(measureByWidth.get(w), r.width);
      bump(padByWidth.get(w), r.padTop);
      offenders.push({ w, path, ...r });
    }
  }
}

const fmt = (map) => [...map.entries()].sort((a, b) => b[1] - a[1])
  .map(([k, n]) => `${k}px×${n}`).join('  ');

console.log('\n═══ CONTENT LEFT EDGE — one value per width means the site aligns ═══');
for (const w of WIDTHS) {
  const m = leftsByWidth.get(w);
  const flag = m.size === 1 ? 'ok  ' : 'DRIFT';
  console.log(`${flag} ${String(w).padStart(4)}px viewport → ${m.size} distinct: ${fmt(m)}`);
}

console.log('\n═══ CONTENT MEASURE (inner container width) ═══');
for (const w of WIDTHS) {
  const m = measureByWidth.get(w);
  console.log(`  ${String(w).padStart(4)}px viewport → ${m.size} distinct: ${fmt(m)}`);
}

console.log('\n═══ SECTION TOP PADDING — the vertical rhythm ═══');
for (const w of WIDTHS) {
  const m = padByWidth.get(w);
  console.log(`  ${String(w).padStart(4)}px viewport → ${m.size} distinct: ${fmt(m)}`);
}

/* At 1440 the whole site should agree. Name whatever does not. */
const at = offenders.filter((o) => o.w === 1440);
const common = [...leftsByWidth.get(1440).entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
const bad = at.filter((o) => o.left !== common);
if (bad.length) {
  console.log(`\n═══ MISALIGNED AT 1440px (majority edge is ${common}px) ═══`);
  const seen = new Set();
  for (const o of bad) {
    const key = `${o.path}|${o.tag}|${o.left}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  ${String(o.left).padStart(4)}px  ${o.path.padEnd(38)} ${o.tag}  measure=${o.width}`);
  }
}

const padSet = padByWidth.get(1440);
if (padSet.size > 3) {
  console.log(`\n═══ VERTICAL RHYTHM AT 1440px — ${padSet.size} distinct top paddings ═══`);
  const common2 = [...padSet.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const seen = new Set();
  for (const o of at) {
    if (o.padTop === common2) continue;
    const key = `${o.path}|${o.tag}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  pt=${String(o.padTop).padStart(3)} pb=${String(o.padBottom).padStart(3)}  ${o.path.padEnd(38)} ${o.tag}`);
  }
}

console.log('');
process.exit(0);
