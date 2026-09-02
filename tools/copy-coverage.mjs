/**
 * Does the manifest actually contain what a visitor reads?
 *
 *   node tools/copy-export.mjs
 *   node tools/dump-copy.mjs copy/.rendered.json
 *   node tools/copy-coverage.mjs
 *
 * The extractor decides what counts as copy with a pile of heuristics, and a
 * heuristic that quietly drops a sentence produces a document that looks
 * complete and is not — the worst possible failure here, because nobody
 * reviewing the document can see the hole. So the check is not "do the
 * heuristics look right", it is: render every page, take every line a browser
 * actually shows, and prove each one is in the manifest.
 *
 * Anything reported UNMATCHED is either copy the extractor missed or text the
 * site builds at runtime and no document can own. Both need a human decision,
 * which is why this prints them rather than scoring a percentage.
 */
import { readFileSync } from 'node:fs';

const norm = (s) => s
  .replace(/[‘’]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/[–—]/g, '-')
  .replace(/ /g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const manifest = JSON.parse(readFileSync('copy/copy-manifest.json', 'utf8'));
const rendered = JSON.parse(readFileSync('copy/.rendered.json', 'utf8'));

// A manifest string can render as several lines (a headline with a newline in
// it) or as part of one, so match on both whole strings and their lines.
const pool = new Set();
for (const e of manifest.entries) {
  pool.add(norm(e.text));
  for (const line of e.text.split(/\n+/)) if (line.trim()) pool.add(norm(line));
}

// Text the browser composes and no source string owns: joined lists, counters,
// dates formatted at runtime, and the single characters used as separators.
const RUNTIME = [
  /^[\d\s.,:%+×/-]+$/,
  /^(?:·|•|·|—|–|\|)$/,
  /^\d{4}$/,
];

let total = 0;
const missing = {};
for (const [route, lines] of Object.entries(rendered)) {
  for (const line of lines) {
    const n = norm(line);
    if (!n || RUNTIME.some((r) => r.test(n))) continue;
    total += 1;
    if (pool.has(n)) continue;
    // A spec row renders its label and its value as one visual line — "Top"
    // and "Carbon fiber" come out as "Top Carbon fiber". Both halves are real
    // source strings and neither is missing, so a checker that cannot split a
    // line reports dozens of phantom holes and buries the genuine ones.
    let hit = false;
    for (let i = 1; i < n.length && !hit; i += 1) {
      const a = n.slice(0, i).trim();
      const b = n.slice(i).trim();
      if (a && b && pool.has(a) && pool.has(b)) hit = true;
    }
    // Substring fallback: the browser may wrap one source string across lines.
    if (!hit) {
      for (const p of pool) {
        if (p.length > 10 && (p.includes(n) || n.includes(p))) { hit = true; break; }
      }
    }
    if (!hit) (missing[route] ||= []).push(line);
  }
}

const nMissing = Object.values(missing).reduce((a, b) => a + b.length, 0);
console.log(`\n  rendered lines checked : ${total}`);
console.log(`  matched to a source string: ${total - nMissing}  (${((1 - nMissing / total) * 100).toFixed(1)}%)`);
console.log(`  UNMATCHED                 : ${nMissing}\n`);
for (const [route, lines] of Object.entries(missing)) {
  console.log(`  ${route}`);
  for (const l of lines.slice(0, 12)) console.log(`      ${JSON.stringify(l.slice(0, 96))}`);
  if (lines.length > 12) console.log(`      ... and ${lines.length - 12} more`);
}
console.log('');
