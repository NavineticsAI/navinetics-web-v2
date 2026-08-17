/**
 * Dev-facing language that reached the page.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort
 *   node tools/check-copy.mjs
 *
 * WHY. This codebase is careful about not publishing claims it cannot support,
 * and it keeps meticulous notes about what is missing and why. The failure mode
 * is not sloppiness — it is that those notes kept ending up in the page copy: a
 * closing section headed "What is still open", a "Still to come" checklist of
 * everything NaviNetics had not documented, alt text reading "Placeholder image
 * — visuals pending", photo-shoot briefs rendered as dashed boxes on a public
 * education page.
 *
 * A surgeon or a purchasing manager did not ask about our editorial process.
 * Publishing the gaps does not make a page more honest; it makes it read as
 * unfinished and hands a competitor a list of what we cannot substantiate.
 *
 * Grepping the source cannot answer this, because the same words appear in
 * comments — which are exactly where they SHOULD be. So this reads the RENDERED
 * text of every route and flags only what a visitor can actually see.
 */
import { webkit } from 'playwright';

const BASE = (process.argv[2] || 'http://localhost:4319') + '/navinetics-web-v2';

const ROUTES = [
  '/', '/company/who-we-are', '/company/our-founders', '/company/partners',
  '/company/community', '/products/d1-stereotactic-frame',
  '/products/carbon-fiber-surgical-tables', '/products/maven-neuromodulation',
  '/technology/stereotactic-devices', '/technology/neuromodulation',
  '/technology/navinetics-ai', '/resources/media', '/resources/careers',
  '/resources/publications', '/contact', '/does-not-exist',
];

/* Phrases that betray a note to ourselves. Split by confidence so a reviewer
   can tell a certainty from a prompt to look. */
const CERTAIN = [
  'placeholder', 'lorem ipsum', 'todo', 'tbd', 'fixme',
  'pending from', 'content pending', 'copy pending', 'visuals pending',
  'still to come', 'what is still open', "what's outstanding", 'what is outstanding',
  'studio shoot', 'clinical photography, consented', 'unbranded',
  'not been supplied', 'has not supplied', 'sign-off', 'signoff',
  'stand-in', 'dummy', 'sample text', 'internal use', 'do not ship',
];

const SUSPECT = [
  'deliberately', 'is not stated', 'are not stated', 'no figure is published',
  'we have not', 'needs content', 'outstanding', 'awaiting', 'to be confirmed',
  'not yet documented', "isn't documented", "isn't specified", 'as it names them',

  /* A SHAPE THIS CHECK USED TO MISS: a sentence that cites one of our own
     internal artefacts. Two got through to the live page and neither used any
     word above — "The existing product record puts patient experience first
     among its improvements", and "Named in the range sheet without a
     specification behind them". Both are true, both are useful in a comment,
     and both are meaningless to a surgeon who has never seen the document being
     referred to. It reads as a company quoting its own paperwork. */
  'product record', 'range sheet', 'the brochure', 'the deck', 'existing site',
  'our records', 'as supplied', 'source material',

  /* And the other half of the same problem: our editorial restraint, published.
     Being careful about claims is right; narrating that care to the reader is
     not, and it reads as a company hedging about its own catalogue. */
  'nothing is claimed', 'no claim is made', 'we do not claim',
];

/* Words that are legitimate site copy and must not be flagged. Checked before
   SUSPECT so a real sentence is not reported as a leak. */
const ALLOW = [
  'in development',          // a real, stated product status
  'preclinical research',    // MAVEN's actual framing
  'no submission has been made',   // the AI status ladder, deliberately public
  'no clearance is claimed',
  'nothing posted right now',      // careers, a real state
];

const browser = await webkit.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

let hits = 0;
console.log('');

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1800);

  /* Visible text only — skip anything hidden, plus the alt text and aria
     labels a screen reader would read out, which are page copy too. */
  const text = await page.evaluate(() => {
    const out = [];
    const walk = (n) => {
      for (const el of n.children) {
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') continue;
        const alt = el.getAttribute?.('alt');
        const aria = el.getAttribute?.('aria-label');
        if (alt) out.push(`[alt] ${alt}`);
        if (aria) out.push(`[aria-label] ${aria}`);
        walk(el);
      }
    };
    walk(document.body);
    out.push(document.body.innerText);
    out.push(`[title] ${document.title}`);
    const desc = document.querySelector('meta[name="description"]');
    if (desc) out.push(`[meta] ${desc.content}`);
    return out.join('\n');
  });

  const lower = text.toLowerCase();
  const found = [];

  for (const p of CERTAIN) {
    if (lower.includes(p)) found.push({ level: 'LEAK', phrase: p });
  }
  for (const p of SUSPECT) {
    if (!lower.includes(p)) continue;
    // Pull the sentence around it so an allowed phrase can be recognised.
    const i = lower.indexOf(p);
    const ctxStr = text.slice(Math.max(0, i - 90), i + 110).replace(/\s+/g, ' ');
    if (ALLOW.some((a) => ctxStr.toLowerCase().includes(a))) continue;
    found.push({ level: 'look', phrase: p, ctx: ctxStr });
  }

  if (found.length === 0) {
    console.log(` ok  ${route}`);
    continue;
  }
  hits += found.filter((f) => f.level === 'LEAK').length;
  console.log(`${found.some((f) => f.level === 'LEAK') ? 'LEAK' : 'look'} ${route}`);
  for (const f of found) {
    console.log(`       ${f.level}  "${f.phrase}"`);
    if (f.ctx) console.log(`             …${f.ctx}…`);
  }
}

await browser.close();
console.log(`\n${hits === 0 ? 'no dev-facing copy on the rendered site' : `${hits} certain leak(s)`}`);
console.log('"look" lines are prompts to read the sentence, not failures.\n');
process.exit(hits === 0 ? 0 : 1);
