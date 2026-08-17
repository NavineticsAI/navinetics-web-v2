/**
 * The shape of every page: its headings, in order, with their levels.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort
 *   node tools/check-outline.mjs
 *
 * WHY. "Does this page flow" is not answerable by reading the source: the
 * sections are spread across a page component, a data file and three shared
 * band components, and the order they end up in is not the order they are
 * written in. The outline is the page's argument — what it claims first, what
 * it supports that with, what it closes on — and seeing all seventeen at once
 * is the only way to notice that two products open on completely different
 * kinds of sentence, or that a page has nine top-level sections where its
 * neighbour has four.
 *
 * It also catches the structural faults that hurt accessibility and search:
 * more than one h1, a level skipped (h2 straight to h4), or a page with no h1
 * at all. Those are reported rather than merely listed, because they are
 * defects rather than editorial judgement.
 */
import { webkit } from 'playwright';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';

const ROUTES = [
  '/', '/company/who-we-are', '/company/our-founders', '/company/partners',
  '/company/community', '/products/d1-stereotactic-frame',
  '/products/carbon-fiber-surgical-tables', '/products/maven-neuromodulation',
  '/technology/stereotactic-devices', '/technology/neuromodulation',
  '/technology/navinetics-ai', '/resources/media', '/resources/careers',
  '/resources/publications', '/contact',
];

const browser = await webkit.launch();
const page = await (await browser.newContext()).newPage();

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  /* Everything is behind a scroll-reveal, and an unscrolled page reports a
     fraction of its own headings. */
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      scrollTo(0, y); await new Promise((r) => setTimeout(r, 40));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  const o = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const hs = [...main.querySelectorAll('h1,h2,h3')];
    return {
      words: (main.innerText.match(/\S+/g) || []).length,
      heads: hs.map((h) => ({
        lvl: +h.tagName[1],
        text: (h.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 62),
      })).filter((h) => h.text),
    };
  });

  const h1s = o.heads.filter((h) => h.lvl === 1).length;
  const faults = [];
  if (h1s === 0) faults.push('no h1');
  if (h1s > 1) faults.push(`${h1s} h1s`);
  for (let i = 1; i < o.heads.length; i++) {
    if (o.heads[i].lvl - o.heads[i - 1].lvl > 1) {
      faults.push(`h${o.heads[i - 1].lvl}→h${o.heads[i].lvl}`);
      break;
    }
  }

  /* Heading length, because the house voice has a measurable half.
     Sampled across the site: "Arc-centered.", "Room to work.", "Down the
     trajectory.", "Radiolucent by design.", "Prototypes travel by hand.",
     "The same tip hears the tissue." Three to six words, present tense, a
     concrete noun, a full stop. Nine is the longest that reads as belonging.
     Past that a heading stops being a statement and becomes a sentence — which
     is how catalogue register gets in, one heading at a time. Names and product
     titles are exempt: they are as long as they are. */
  const NAMEISH = /Ph\.?D|M\.?D|MBA|NaviNetics|MAVEN|NRSS|Carbon Fiber|University|Clinic|Center|Centre/i;
  const longHeads = o.heads.filter(
    (h) => !NAMEISH.test(h.text) && h.text.split(/\s+/).length > 9,
  );
  if (longHeads.length) faults.push(`${longHeads.length} heading(s) over 9 words`);

  console.log(`\n${'─'.repeat(76)}`);
  console.log(`${route}   ${o.words} words, ${o.heads.length} headings`
    + (faults.length ? `   ⚠ ${faults.join(', ')}` : ''));
  console.log('─'.repeat(76));
  for (const h of o.heads) console.log(`  ${'  '.repeat(h.lvl - 1)}h${h.lvl} ${h.text}`);
}

await browser.close();
console.log('');
