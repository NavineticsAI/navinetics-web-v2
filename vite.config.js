import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// `base` needs both slashes. Written as a bare segment it is not a valid base:
// Vite warns, and the value ends up concatenated rather than joined, so every
// hashed asset URL comes out malformed. The router reads the same value through
// import.meta.env.BASE_URL (see src/App.jsx), so this string is the single
// place the deployment path is declared.
//
// Deploying to a custom domain instead? Set this to '/' and add public/CNAME.
/* The review build's footer carries exactly what Kevin Bennet asked for and
   nothing else: "Pages have no page identifiers, version or date."

   A git commit was in the first version. It is engineering convenience —
   useful for tracing a marked-up printout back to source, meaningless to the
   person holding the paper, and beside a version number it reads as a second,
   competing version. Gone.

   The version is a REVIEW ROUND, set in .env.review and bumped by hand when a
   round goes out. That is bookkeeping, and it is the point: a reviewer
   marking up round 2 must never be confusable with round 1. A build hash
   changes on every save and answers a different question.

   The date carries a TIME as well. Two review builds can go out on one day,
   and "Review 1, 3 September" on both of them is no better than nothing. */
const reviewDate = (() => {
  const d = new Date()
  const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  // The zone is named because a marked-up printout can travel: NaviNetics is
  // in Rochester, CBH is in South Korea, and "14:32" alone settles nothing.
  const zone = new Intl.DateTimeFormat('en-GB', { timeZoneName: 'short' })
    .formatToParts(d).find((x) => x.type === 'timeZoneName')?.value || ''
  return `${day}, ${time}${zone ? ` ${zone}` : ''}`
})()

export default defineConfig({
  define: {
    __REVIEW_DATE__: JSON.stringify(reviewDate),
  },
  server: {
    /* copy/ holds the website-copy review working files — a 800KB manifest,
       a Word document, and temp files the watcher rewrites on every save.
       None of it is imported by the site, but the dev server watches the
       whole project by default, so a save there reloaded the page. */
    watch: { ignored: ['**/copy/**'] },
  },
  base: '/navinetics-web-v2/',
  plugins: [react(), spaFallback(), perfBeacon()],
})

/**
 * Live telemetry from whatever device is looking at the site.
 *
 * `apply: 'serve'` — this NEVER ships. It exists only on the dev and preview
 * servers, and the script it injects is added by transformIndexHtml at serve
 * time, so nothing enters dist/.
 *
 * WHY. "It is laggy on my phone" has two possible causes that feel identical
 * from the sofa: the network is slow, or the page is burning the CPU. Guessing
 * between them wastes a day. This reports both from the real handset —
 * navigator.connection for the link, and long-task busy% for the main thread —
 * and prints them in the terminal running the server.
 *
 * Read the numbers like this:
 *   downlink/rtt poor + busy low   → the network. Not our problem to fix here.
 *   downlink fine   + busy high    → the page. Ours.
 *   both bad                       → both; fix the page, the network is theirs.
 */
function perfBeacon() {
  const SCRIPT = `
<script>
(() => {
  const P = { lcp: 0, long: [], nav: null };
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) P.lcp = e.startTime; })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) P.long.push(e.duration); })
      .observe({ type: 'longtask', buffered: true });
  } catch {}

  let lastSent = performance.now();
  const send = () => {
    const now = performance.now();
    const window_ms = now - lastSent;
    const busy = P.long.reduce((a, d) => a + d, 0);
    const c = navigator.connection || {};
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const body = JSON.stringify({
      path: location.pathname.replace(${JSON.stringify('/navinetics-web-v2')}, '') || '/',
      ua: /iPhone|iPad/.test(navigator.userAgent) ? 'iOS'
        : /Android/.test(navigator.userAgent) ? 'Android' : 'desktop',
      w: innerWidth, h: innerHeight, dpr: devicePixelRatio,
      fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0),
      lcp: Math.round(P.lcp),
      ttfb: Math.round(nav.responseStart || 0),
      dcl: Math.round(nav.domContentLoadedEventEnd || 0),
      busyPct: +(100 * busy / Math.max(1, window_ms)).toFixed(1),
      longTasks: P.long.length,
      worst: Math.round(Math.max(0, ...P.long, 0)),
      effectiveType: c.effectiveType || '?',
      downlinkMbps: c.downlink ?? null,
      rttMs: c.rtt ?? null,
      saveData: !!c.saveData,
      mem: navigator.deviceMemory ?? null,
      cores: navigator.hardwareConcurrency ?? null,
    });
    P.long.length = 0;
    lastSent = now;
    try { navigator.sendBeacon('/__perf', body); }
    catch { fetch('/__perf', { method: 'POST', body, keepalive: true }); }
  };

  addEventListener('load', () => setTimeout(send, 2500));
  setInterval(send, 5000);
  addEventListener('pagehide', send);
})();
</script>`

  const middleware = (server) => {
    server.middlewares.use('/__perf', (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; return res.end() }
      let raw = ''
      req.on('data', (c) => { raw += c })
      req.on('end', () => {
        try {
          const d = JSON.parse(raw)
          const net = d.downlinkMbps == null
            ? `net ${d.effectiveType}`
            : `net ${d.effectiveType} ${d.downlinkMbps}Mbps rtt ${d.rttMs}ms`
          const flag = d.busyPct > 40 ? 'BUSY' : d.busyPct > 10 ? 'warn' : ' ok '
          console.log(
            `[perf] ${flag} ${d.ua} ${d.w}x${d.h}@${d.dpr}  ${String(d.path).padEnd(34)}`
            + ` busy ${String(d.busyPct).padStart(5)}%  tasks ${String(d.longTasks).padStart(3)}`
            + ` (worst ${d.worst}ms)  ttfb ${d.ttfb}  fcp ${d.fcp}  lcp ${d.lcp}`
            + `  ${net}  cores ${d.cores} mem ${d.mem}GB${d.saveData ? '  SAVE-DATA' : ''}`,
          )
        } catch { /* ignore malformed */ }
        res.statusCode = 204
        res.end()
      })
    })
  }

  return {
    name: 'perf-beacon',
    apply: 'serve',
    configureServer: middleware,
    configurePreviewServer: middleware,
    transformIndexHtml: (html) => html.replace('</body>', `${SCRIPT}\n</body>`),
  }
}

/**
 * GitHub Pages is a static file server with no rewrite rules, so a request for
 * /products/d1-stereotactic-frame finds no file and returns GitHub's own 404 —
 * the app never boots. Pages does serve 404.html for unmatched paths, so a copy
 * of index.html under that name hands the URL back to the router.
 *
 * Without this, every deep link, bookmark, refresh and crawl is dead, and the
 * legacy redirects in src/data/nav.js can never fire because they are React
 * elements that only run once the app has loaded.
 */
function spaFallback() {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const dist = fileURLToPath(new URL('./dist/', import.meta.url))
      // `closeBundle` fires even when the build FAILED, and index.html is then
      // absent — so copying it unconditionally threw ENOENT, and that error
      // replaced the real one in the output. A genuine failure in rendering
      // chunks was reported as "cannot copy dist/index.html", which sends you
      // looking at the deploy config instead of at the code that broke.
      if (!existsSync(`${dist}index.html`)) {
        console.warn('[spa-404-fallback] no dist/index.html — build failed; skipping 404.html')
        return
      }
      copyFileSync(`${dist}index.html`, `${dist}404.html`)
      // Jekyll would otherwise strip directories that begin with an underscore.
      writeFileSync(`${dist}.nojekyll`, '')
    },
  }
}
