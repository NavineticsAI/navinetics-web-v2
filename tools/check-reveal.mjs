/**
 * How long content stays invisible after a page is otherwise ready.
 *
 *   node tools/check-reveal.mjs [baseUrl]
 *
 * WHY. Reported as "slow to load content on each page" on a phone. The page
 * metrics do not show it: FCP and LCP are fine, and a route change measured in
 * WebKit on localhost takes 50-400ms. The complaint is about something those
 * numbers cannot see.
 *
 * Almost every block on this site is wrapped in <Reveal>, which starts at
 * `opacity: 0` and animates in on `whileInView`. So markup can be present,
 * laid out and counted as painted while being literally invisible. If the main
 * thread is busy - and on two routes it is ~93% busy - the IntersectionObserver
 * callback and the animation frames that follow are starved, and the reveal
 * that should take 420ms takes far longer. On a desktop that is imperceptible.
 * On a phone it reads as the page loading slowly.
 *
 * This measures, under CPU throttling, the gap between "the block exists" and
 * "the block is actually readable", which is the thing being complained about.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
const CPU = Number(process.env.CPU ?? 4);
const PORT = 9549;
const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ROUTES = ['/', '/products/d1-stereotactic-frame', '/company/partners',
  '/products/maven-neuromodulation', '/resources/education',
  '/technology/navinetics-ai', '/contact'];

spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=swiftshader',
  '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, '--no-first-run',
  '--hide-scrollbars', `--user-data-dir=${join(tmpdir(), 'nn-chrome-reveal')}`,
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
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

console.log(`\niPhone-sized viewport, ${CPU}x CPU throttle.`);
console.log('  hidden = blocks present in the DOM but at opacity 0 once the page has settled.');
console.log('  scroll = ms from scrolling a block into view until it is readable.\n');
console.log('  route                                  blocks  hidden   scroll-to-readable');

for (const route of ROUTES) {
  await send('Emulation.setCPUThrottlingRate', { rate: CPU });
  await send('Page.navigate', { url: BASE + route });
  await sleep(5000);

  const m = await ev(`(async () => {
    /* Scroll-reveals ONLY, and identifying one takes more than "is it
       transparent". Three versions of this filter reported routes as broken
       that were not:

         - inline opacity alone found nothing anywhere, and the site looked
           clean. That was the probe reading the wrong property.
         - computed opacity alone caught a decorative wash sitting at 0.16 by
           design. It never reaches 1 because it is not meant to, so timing it
           reported "never" on five routes.
         - inline opacity caught two more things that write opacity from an
           animation loop rather than from a reveal: the globe pins, which sit
           at 0 whenever they are on the far side of the sphere, and MAVEN's
           opening, which is scroll-driven and only reaches 1 at one offset.
           Those gave 13.9s on /company/partners and "never" on MAVEN, both of
           which described this file rather than the page.

       A Reveal is fadeUp: opacity 0 AND a translateY. Nothing else that moves
       on this site has that pair, which is what makes it worth matching.

       And it must be IN FLOW. The last false positive was MAVEN's scroll cue,
       which does carry both — but it is pinned to the bottom of the opening
       and its opacity is a function of how far the hero has been scrolled, so
       it reaches 1 only between 62% and 86% of that travel and never at all
       from being scrolled to the middle of the screen. Scroll-reveals are
       ordinary content blocks; the things that are driven by scroll position
       are overlays, and every one of them is positioned. */
    const all = [...document.querySelectorAll('main *')];
    const revealed = all.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.height < 12) return false;
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) >= 0.99) return false;
      if (cs.position === 'absolute' || cs.position === 'fixed') return false;
      return el.style.opacity !== '' && (el.style.transform || '').startsWith('translateY(');
    });
    const total = all.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.height >= 12;
    }).length;

    // Take the first still-hidden block, scroll it in, and time the reveal.
    let ms = null;
    const target = revealed[0];
    if (target) {
      const t0 = performance.now();
      target.scrollIntoView({ block: 'center' });
      for (let i = 0; i < 900; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        if (parseFloat(getComputedStyle(target).opacity) > 0.95) { ms = performance.now() - t0; break; }
      }
      if (ms === null) ms = -1;
    }
    return { total, hidden: revealed.length, ms: ms === null ? null : Math.round(ms) };
  })()`);

  const slow = m.ms === -1 || (m.ms ?? 0) > 700;
  const shown = m.ms === null ? '  n/a' : m.ms === -1 ? ' never' : `${String(m.ms).padStart(5)}ms`;
  console.log(`${slow ? 'SLOW' : ' ok '} ${route.padEnd(38)} ${String(m.total).padStart(5)}  ${String(m.hidden).padStart(6)}  ${shown}`);
}

await send('Browser.close').catch(() => {});
console.log('');
process.exit(0);
