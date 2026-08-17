/**
 * The words on the website, audited.
 *
 *   npm run build && npx vite preview --port 4319 --strictPort
 *   node tools/check-verbiage.mjs
 *
 * WHY A TOOL AND NOT A READ-THROUGH. Three of these categories are the kind of
 * thing a human reviewer misses precisely because the words are unremarkable in
 * isolation — "unprecedented" reads as enthusiasm, not as a claim, until you
 * notice it is a comparative assertion about competitors' products on a medical
 * device manufacturer's website. And a read-through cannot be re-run after the
 * next edit, which is the whole point: this is a list that has to STAY empty.
 *
 * Like check-copy.mjs it reads RENDERED text, not source. The same words appear
 * in code comments, where they are correct and useful, and grepping the
 * repository conflates a careful note to a future maintainer with a sentence
 * published to a surgeon.
 *
 * WHAT IT FLAGS, and why each category is its own problem:
 *
 *   AGREED   Terms the company has decided against, from the review of
 *            2026-08-13: "base ring", "head ring", "FDA cleared", "radically",
 *            "D1" in place of the system's real name, and so on. Nothing here
 *            is a judgement call — each one is a decision already taken, so
 *            this section is a progress report rather than an opinion.
 *
 *   CLAIM    Superlatives and comparative assertions. For a device
 *            manufacturer these are regulated speech, not style: a comparative
 *            claim needs substantiation held on file, and "unprecedented",
 *            "unmatched" or "the only" are claims about other companies'
 *            products made without naming them. The safe form is a specific,
 *            attributable fact.
 *
 *   NEGATIVE Language that frames surgery, patients or the field in terms of
 *            what goes wrong. Some of it is unavoidable and correct — a page
 *            about accuracy has to be able to say "error". What is worth
 *            seeing is the density and where it falls, because a product page
 *            that opens on trauma, burden and failure sells the problem
 *            rather than the instrument.
 *
 *   HEDGE    "Aims to", "designed to", "may help". Individually fine and
 *            sometimes legally necessary; in quantity they read as a company
 *            that will not commit to what its own product does.
 *
 * Anatomical vocabulary is deliberately excluded. "Superior", "inferior",
 * "anterior" and "posterior" are directions in this domain, not comparisons,
 * and flagging them would bury every real finding under sixty false ones.
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

/* ── 1. Decisions already taken ───────────────────────────────────────────
   Each entry is [pattern, what the review asked for]. These are not
   suggestions; they are the outstanding half of a list the company signed
   off, which is why the note says what to do rather than what is wrong. */
const AGREED = [
  [/\bbase ring\b/i, 'drop the base ring entirely'],
  [/\bhead ring\b/i, 'drop "head ring"'],
  [/\bring angle\b/i, 'use "collar", not "ring angle"'],
  [/\bradical(ly)?\b/i, 'replace "radically"'],
  [/\bunprecedented\b/i, 'remove the unprecedented-access claim'],
  [/\bFDA[- ]?(510\(k\))?[- ]?cleared\b/i, 'the FDA line is withheld for now'],
  [/\bgreater china\b/i, '"China", not "Greater China"'],
  [/\bpercutaneous\b/i, 'drop the percutaneous screw passage'],
  [/\bpremium\b/i, 'remove "Premium" positioning'],
  [/\bmade[- ]to[- ]order\b/i, 'remove "Made to Order"'],
  [/\bin development\b/i, 'remove the "In Development" tag'],
  [/\bsubsidiary\b/i, 'drop "subsidiary" from CBH'],
  [/\bAbbott\b/, 'Abbott comes off the partners list'],
  [/\btheater\b/i, 'US English review asked for "theatre"'],
  [/\bdeep brain stimulation\b|\bDBS\b/, 'MAVEN says "electrical stimulation"'],
  [/\bglutamate\b|\bacetylcholine\b/i, 'name dopamine and adenosine; "other" for the rest'],
  [/\bindirect targeting\b/i, 'drop indirect targeting, keep direct'],
  [/\bNeural Engineering Laborator/i, 'full name: Neural Engineering and Precision Surgery Laboratories'],
  /* Proper noun, so it is capitalised everywhere it appears — it is the name of
     a component, not a description of one. It was found in five different
     forms: "skull anchor key", "Skull anchor key", "anchor key", "Anchor Key"
     and "Skull Anchor Key". The lower-case forms are what this catches.
     Negative lookahead so the correct form does not report itself. */
  [/\b(?:skull )?anchor key\b(?<!Skull Anchor Key)/, 'Skull Anchor Key — proper noun, capitalised'],
  [/\bNavinetics\b/, 'NaviNetics — capital N'],
  [/\bMaven\b/, 'MAVEN in all caps'],
];

/* Terms whose ABSENCE is the finding. The review asked for these to appear, so
   a route that should carry one and does not is as much an open item as a
   route still carrying a word that was meant to go. */
const EXPECTED = [
  ['/products/d1-stereotactic-frame', /NRSS|Reusable Stereotactic System/i, 'the system\'s official name'],
  ['/products/d1-stereotactic-frame', /comfort/i, 'something about patient comfort'],
  ['/products/maven-neuromodulation', /pre-?clinical/i, 'a pre-clinical research framing'],
  ['/company/who-we-are', /pre-?clinical/i, 'pre-clinical in the MAVEN description'],
  ['/company/partners', /academic|scientific collaborat/i, 'the academic / scientific collaborators section'],
  ['/company/partners', /taiwan/i, 'Taiwan'],
  ['/company/partners', /singapore/i, 'Singapore'],
];

/* Comparison by implication — the shape that survives a superlative sweep.
   ─────────────────────────────────────────────────────────────────────────
   None of these is a superlative and none names a competitor, so the CLAIM
   list below never saw them. But "a key at the skull rather than a frame
   around the head" is a comparative claim: it describes the instrument by what
   it is not, and only means anything to a reader who already knows the
   alternative. It also puts the alternative in their head, which is a strange
   thing for us to spend a sentence doing.

   NOT automatically wrong, which is why it reports separately. "Models the
   capacitive current rather than subtracting a neighbouring sweep" and "the
   transform is solved rather than guessed at" distinguish two real methods —
   that is precision, and flattening it would make the science vaguer. The test
   is whether the thing on the other side of "rather than" is a technique or a
   competitor's product. */
const IMPLICIT = [
  /\brather than\b/i, /\binstead of\b/i, /\bin place of\b/i,
  /\bas opposed to\b/i, /\bunlike\b/i, /\bnothing (?:crosses|encircles|surrounds)\b/i,
];

const CLAIM = [
  /\bunprecedented\b/i, /\bunmatched\b/i, /\bunrivall?ed\b/i, /\bunparalleled\b/i,
  /\brevolutionar/i, /\bbreakthrough\b/i, /\bgame[- ]chang/i, /\bcutting[- ]edge\b/i,
  /\bstate[- ]of[- ]the[- ]art\b/i, /\bworld[- ]class\b/i, /\bbest[- ]in[- ]class\b/i,
  /\bindustry[- ]leading\b/i, /\bthe (?:only|first) \w+(?: \w+)? (?:system|device|platform|frame|company)\b/i,
  /\bbetter than\b/i, /\bfaster than\b/i, /\bmore accurate than\b/i, /\boutperform/i,
  /\bsurpass/i, /\bthe most\b/i, /\bthe best\b/i, /\bno other\b/i, /\bnothing else\b/i,
];

const NEGATIVE = [
  /\btrauma(tic)?\b/i, /\bpainful\b/i, /\bsuffer/i, /\bburden/i, /\bstruggl/i,
  /\bfail(ure|s|ed)?\b/i, /\bproblem/i, /\bdifficult/i, /\bpoor(ly)?\b/i,
  /\blimitation/i, /\bcompromis/i, /\bsacrific/i, /\bworse\b/i, /\bwrong\b/i,
  /\black(s|ing)?\b/i, /\bunfortunate/i, /\bcrude\b/i, /\bblunt\b/i,
  /\bcumbersome\b/i, /\bawkward\b/i, /\btedious\b/i, /\bfrustrat/i,
  /* Added 17 August. "Constraint" was reported as reading badly and this list
     did not have it — nor the rest of the family it belongs to. They are the
     words that describe a difficulty rather than a capability, and on a product
     page the difficulty is usually the competitor's or the patient's. Kept
     separate in the report so the technical uses can be dismissed quickly:
     "constrained" is legitimate inside a description of a mechanism, and
     "obstruction" is legitimate when the sentence is saying there is none. */
  /\bconstraint?s?\b/i, /\bconstrain(ed|ing|s)?\b/i, /\brestrict/i,
  /\bobstruct/i, /\bhinder/i, /\bimpede/i,
  /* Not preceded by "non-" or "minimally". "Non-invasive" is a capability and
     "minimally invasive" is the whole point of this field — flagging either
     reports the opposite of what the sentence says. */
  /(?<!non[- ])(?<!minimally )\binvasive\b/i,
  /\bcomplication/i, /\bdeficit/i, /\bexpensive\b/i, /\bcostly\b/i,
];

const HEDGE = [
  /\baims? to\b/i, /\bdesigned to\b/i, /\bintended to\b/i, /\bseeks? to\b/i,
  /\bmay help\b/i, /\bcan help\b/i, /\bhopes? to\b/i, /\battempts? to\b/i,
  /\bstrives? to\b/i, /\bworks? toward/i,
];

const browser = await webkit.launch();
const page = await (await browser.newContext()).newPage();

const found = { AGREED: [], EXPECTED: [], CLAIM: [], NEGATIVE: [], HEDGE: [], IMPLICIT: [] };

/** The sentence a match sits in, so a reviewer can judge it without opening the page. */
function context(text, index, span = 90) {
  const from = Math.max(0, index - span / 2);
  return text.slice(from, from + span).replace(/\s+/g, ' ').trim();
}

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  /* Scroll the whole page: most sections are behind a scroll-reveal and a
     route measured at the top would report a fraction of its own copy. */
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 45));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(500);

  const text = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText.replace(/ /g, ' ');
  });

  for (const [re, note] of AGREED) {
    const m = re.exec(text);
    if (m) found.AGREED.push({ route, term: m[0], note, ctx: context(text, m.index) });
  }
  for (const [r, re, note] of EXPECTED) {
    if (r === route && !re.test(text)) found.EXPECTED.push({ route, note });
  }
  for (const group of [['CLAIM', CLAIM], ['NEGATIVE', NEGATIVE], ['HEDGE', HEDGE],
    ['IMPLICIT', IMPLICIT]]) {
    const [name, list] = group;
    for (const re of list) {
      const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
      let m;
      while ((m = g.exec(text)) !== null) {
        found[name].push({ route, term: m[0], ctx: context(text, m.index) });
        if (found[name].length > 400) break;
      }
    }
  }
}

await browser.close();

const rule = (s) => `\n${'═'.repeat(78)}\n${s}\n${'═'.repeat(78)}`;

console.log(rule('1 · DECISIONS ALREADY TAKEN — still present on the page'));
if (!found.AGREED.length) console.log('\n  none — every agreed term is gone.\n');
for (const f of found.AGREED) {
  console.log(`\n  ${f.route}`);
  console.log(`    "${f.term}"  →  ${f.note}`);
  console.log(`    … ${f.ctx} …`);
}

console.log(rule('2 · ASKED FOR, NOT YET ON THE PAGE'));
if (!found.EXPECTED.length) console.log('\n  none — everything expected is present.\n');
for (const f of found.EXPECTED) console.log(`  ${f.route.padEnd(42)} missing: ${f.note}`);

console.log(rule('3 · SUPERLATIVE AND COMPARATIVE CLAIMS'));
console.log('  For a device manufacturer these need substantiation on file.\n');
if (!found.CLAIM.length) console.log('  none.\n');
for (const f of found.CLAIM) {
  console.log(`  ${f.route}`);
  console.log(`    "${f.term}" — … ${f.ctx} …`);
}

const byRoute = (arr) => arr.reduce((a, f) => { (a[f.route] ??= []).push(f); return a; }, {});

console.log(rule('4 · NEGATIVE FRAMING — density by route'));
console.log('  Not all wrong. Worth seeing where the page sells the problem.\n');
for (const [r, list] of Object.entries(byRoute(found.NEGATIVE))) {
  console.log(`  ${r.padEnd(42)} ${String(list.length).padStart(3)}  ${[...new Set(list.map((f) => f.term.toLowerCase()))].slice(0, 8).join(', ')}`);
}

console.log(rule('5b · COMPARISON BY IMPLICATION'));
console.log('  Read each one: is the other side a TECHNIQUE (keep — that is precision)');
console.log('  or a COMPETITOR\'S PRODUCT (rewrite — describe ours on its own terms)?\n');
for (const f of found.IMPLICIT) {
  console.log(`  ${f.route}`);
  console.log(`    "${f.term}" — … ${f.ctx} …`);
}

console.log(rule('5 · HEDGED LANGUAGE'));
for (const [r, list] of Object.entries(byRoute(found.HEDGE))) {
  console.log(`  ${r.padEnd(42)} ${String(list.length).padStart(3)}  ${[...new Set(list.map((f) => f.term.toLowerCase()))].slice(0, 6).join(', ')}`);
}

console.log(`\n  agreed-terms outstanding ${found.AGREED.length}`
  + `   asked-for missing ${found.EXPECTED.length}`
  + `   claims ${found.CLAIM.length}`
  + `   negative ${found.NEGATIVE.length}`
  + `   hedges ${found.HEDGE.length}\n`);
