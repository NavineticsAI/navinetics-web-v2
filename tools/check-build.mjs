/**
 * Assertions about dist/ that no browser is needed to make.
 *
 *   npm run build && node tools/check-build.mjs
 *
 * WHY THIS EXISTS. The site deployed with `base` written as a bare segment,
 * `<Router>` with no matching basename, no 404.html, and nineteen public/ files
 * referenced at the server root. Every one of those is invisible in dev — dev
 * serves from '/', so the base is '/' and nothing is prefixed — and every one
 * of them broke the deployed site. The build succeeded throughout.
 *
 * These are the cheap checks that would have caught it. They run on any
 * platform with no Chrome, so CI can gate on them.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url);
const dist = (p) => new URL(p, DIST);
const read = (p) => readFileSync(dist(p), 'utf8');

const BASE = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).homepageBase
  ?? '/navinetics-web-v2/';

let failed = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? ' ok ' : 'FAIL'} ${label}${ok || !detail ? '' : `\n       ${detail}`}`);
  if (!ok) failed++;
};

check('dist/ exists', existsSync(dist('index.html')), 'run npm run build first');
if (!existsSync(dist('index.html'))) process.exit(1);

const index = read('index.html');

// 1. The GitHub Pages SPA fallback. Without it every deep link is a hard 404.
check(
  '404.html exists and matches index.html',
  existsSync(dist('404.html')) && read('404.html') === index,
  'GitHub Pages serves 404.html for unmatched paths; it must re-mount the app',
);

// 2. Jekyll would eat directories starting with an underscore.
check('.nojekyll exists', existsSync(dist('.nojekyll')));

// 3. Entry assets must carry the deployed base, or nothing loads at all.
const entryRefs = [...index.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
const unprefixed = entryRefs.filter((u) => u.startsWith('/') && !u.startsWith(BASE));
check('every asset in index.html carries the base path', unprefixed.length === 0, unprefixed.join(', '));

// 4. Root-absolute public/ paths that survived into the bundle. These resolve
//    against the server root, not the deployed sub-path, and 404 in production
//    while working perfectly in dev.
const publicFiles = readdirSync(new URL('../public/', import.meta.url), { withFileTypes: true })
  .filter((e) => e.isFile() && !/^(favicon\.svg|icons\.svg|CNAME|robots\.txt|sitemap\.xml)$/.test(e.name))
  .map((e) => e.name);
const jsDir = join(new URL('../dist/assets/', import.meta.url).pathname.replace(/^\//, ''), '');
const bundles = readdirSync(jsDir).filter((f) => f.endsWith('.js') || f.endsWith('.css'));
const leaked = [];
for (const file of bundles) {
  const src = readFileSync(join(jsDir, file), 'utf8');
  for (const name of publicFiles) {
    if (src.includes(`"/${name}"`) || src.includes(`'/${name}'`) || src.includes(`url(/${name})`)) {
      leaked.push(`${file} → /${name}`);
    }
  }
}
check(
  'no public/ file is referenced at the server root',
  leaked.length === 0,
  `wrap these with asset() from src/lib/asset.js:\n       ${leaked.join('\n       ')}`,
);

// 5. Crawler basics. A client-rendered SPA gives crawlers nothing else to go on.
check('robots.txt is published', existsSync(dist('robots.txt')));
check('sitemap.xml is published', existsSync(dist('sitemap.xml')));
check('index.html carries an Open Graph title', /property="og:title"/.test(index));
check('index.html carries a canonical URL', /rel="canonical"/.test(index));
check('index.html carries Organization JSON-LD', /application\/ld\+json/.test(index));

console.log(`\n${failed === 0 ? 'build output clean' : `${failed} check(s) failed`}`);
process.exit(failed === 0 ? 0 : 1);
