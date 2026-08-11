import { copyFileSync, writeFileSync } from 'node:fs'
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
export default defineConfig({
  base: '/navinetics-web-v2/',
  plugins: [react(), spaFallback()],
})

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
      copyFileSync(`${dist}index.html`, `${dist}404.html`)
      // Jekyll would otherwise strip directories that begin with an underscore.
      writeFileSync(`${dist}.nojekyll`, '')
    },
  }
}
