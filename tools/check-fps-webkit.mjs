/**
 * What frame rate each route actually runs at, in REAL WebKit.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort
 *   node tools/check-fps-webkit.mjs
 *
 * WHY. Two symptoms reported from an iPhone — content arriving late when
 * scrolling, and the menu button feeling frozen — kept failing to reproduce as
 * the things they sounded like. The menu's handler runs in 1ms; React is not
 * slow. The blur was ruled out by an A/B. What was left, once the menu timing
 * was split into script and paint, was 600ms of paint on / and ~180ms
 * elsewhere, with no script behind it.
 *
 * That is the signature of a slow frame CLOCK rather than slow work in
 * response to the tap. Nothing can appear until the next frame; if frames are
 * a third of a second apart, then every interaction on the page inherits that
 * delay no matter how cheap it is, and a scroll-reveal that needs a run of
 * frames inherits it several times over. It also explains why the same page
 * measures fine under Chrome with a 4x CPU throttle: the throttle slows script,
 * and this is not script.
 *
 * So: park the page, let it settle, and time the gaps between frames.
 * `worst` matters more than the mean — a page that mostly holds 60fps and
 * stalls for 400ms at a time is exactly the one that feels broken.
 */
import { webkit, devices } from 'playwright';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';
const ROUTES = ['/', '/company/partners', '/products/maven-neuromodulation',
  '/products/d1-stereotactic-frame', '/technology/navinetics-ai',
  '/resources/education', '/contact'];

const browser = await webkit.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();

/* Absolute numbers here are pessimistic and should not be quoted as iPhone
   figures: Playwright's WebKit on Windows has no GPU, so everything a phone
   hands to hardware is done in software. What survives that caveat is the
   comparison — same engine, same conditions, one route against another, and
   the same route with a suspect removed. */
const sample = () => new Promise((res) => {
    const gaps = [];
    let last = performance.now();
    const stop = last + 3000;
    const tick = (now) => {
      gaps.push(now - last);
      last = now;
      if (now < stop) requestAnimationFrame(tick);
      else {
        const sorted = gaps.slice().sort((a, b) => a - b);
        res({
          n: gaps.length,
          med: Math.round(sorted[Math.floor(sorted.length / 2)]),
          worst: Math.round(sorted[sorted.length - 1]),
          fps: Math.round((gaps.length / 3) * 10) / 10,
        });
      }
    };
    requestAnimationFrame(tick);
});

console.log('\nFrame cadence in WebKit (iPhone 13), page idle at the top, 3s sample.');
console.log('Software-rendered, so read the columns against each other, not as iPhone fps.\n');
/* One suspect each, applied to the settled page and measured again. Canvas and
   backdrop-filter were the first two guesses and both were wrong — / stayed at
   2.7fps with each removed — so the list is the rest of what makes a
   compositor work hard: a plain `filter: blur()` on a decorative glow, which
   is a separate and much heavier thing than backdrop-filter in software;
   blend modes, which force the layer beneath to be read back; and CSS
   animations, which keep the clock running whether or not anything is on
   screen. Whichever column moves is the answer, and none of them moving is
   also worth knowing. */
const SUSPECTS = [
  ['canvas', null, (d) => { for (const c of d.querySelectorAll('canvas')) c.style.display = 'none'; }],
  ['blur', '*,*::before,*::after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'],
  ['filter', '*,*::before,*::after{filter:none!important}'],
  ['blend', '*,*::before,*::after{mix-blend-mode:normal!important;isolation:auto!important}'],
  ['anim', '*,*::before,*::after{animation:none!important;transition:none!important}'],
  /* Split of the `anim` column, because "CSS animations cost 30fps" is not
     something anyone can act on. Only two things on this site animate in CSS:
     the logo, which runs four infinite animations in a sticky navbar and is
     therefore on screen on every route at all times, and the scroll cue under
     a hero. Naming which one it is decides whether this is a brand question or
     a one-line change. */
  ['logo', '[class*="nn-logo"]{animation:none!important}'],
  ['drop', '.nn-drop,.nn-drop::before,.nn-drop::after{animation:none!important}'],
];

/* Sampled while actually scrolling, which is the state the reader complained
   about and the one an idle sample cannot see. It is also the only way to
   check the logo pause: that fix does nothing at rest by design, so a page
   that improves here and not above is the fix working, not a regression. */
const sampleScrolling = () => new Promise((res) => {
  const gaps = [];
  let last = performance.now();
  const stop = last + 3000;
  /* Whether the pause actually engaged, rather than assumed. The logo yields
     via an `nn-scrolling` class on <html>, and a fix that silently fails to
     apply looks identical in the fps column to a fix that applied and did not
     help — those are opposite conclusions and must not be confused. */
  let armed = 0;
  const tick = (now) => {
    scrollBy(0, 14);
    if (scrollY + innerHeight >= document.body.scrollHeight - 4) scrollTo(0, 0);
    if (document.documentElement.classList.contains('nn-scrolling')) armed++;
    gaps.push(now - last);
    last = now;
    if (now < stop) requestAnimationFrame(tick);
    else {
      const s = gaps.slice().sort((a, b) => a - b);
      res({
        med: Math.round(s[Math.floor(s.length / 2)]),
        worst: Math.round(s[s.length - 1]),
        fps: Math.round((gaps.length / 3) * 10) / 10,
        armed: Math.round((armed / gaps.length) * 100),
      });
    }
  };
  requestAnimationFrame(tick);
});

const ISOLATE = !!process.env.ISOLATE;
console.log('  route                        idle  scrolling  worst-gap  paused'
  + (ISOLATE ? '  ' + SUSPECTS.map((s) => s[0].padStart(7)).join('') : ''));

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const base = await page.evaluate(sample);

  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(400);
  const scrolled = await page.evaluate(sampleScrolling);

  const cols = [];
  if (ISOLATE) {
    for (const [, css, fn] of SUSPECTS) {
      // Reload between suspects so each is measured against the same page
      // rather than the accumulated effect of the ones before it.
      await page.goto(BASE + route, { waitUntil: 'load' });
      await page.waitForTimeout(2500);
      if (fn) await page.evaluate(`(${fn.toString()})(document)`);
      else await page.addStyleTag({ content: css });
      await page.waitForTimeout(600);
      cols.push((await page.evaluate(sample)).fps);
    }
  }

  const flag = scrolled.fps < 24 || scrolled.worst > 250 ? 'SLOW' : ' ok ';
  console.log(`${flag} ${route.padEnd(28)} ${String(base.fps).padStart(5)} `
    + `${String(scrolled.fps).padStart(10)} ${String(scrolled.worst).padStart(8)}ms`
    + `${String(scrolled.armed).padStart(7)}%`
    + (ISOLATE ? '  ' + cols.map((c) => String(c).padStart(7)).join('') : ''));
}

console.log('\n  A low fps with the page doing nothing is a scene that never stops drawing.\n');
await browser.close();
