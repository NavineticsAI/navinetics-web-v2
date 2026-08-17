/**
 * What a visitor actually sees differently between two copy dumps.
 *
 *   node tools/dump-copy.mjs before.json     # on one branch, after building it
 *   node tools/dump-copy.mjs after.json      # on the other
 *   node tools/diff-copy.mjs before.json after.json
 *
 * WHY NOT `git diff`. The branch under review touches eighty files and around
 * 2,500 lines, nearly all of it portrait tooling, a logo rewrite and scene
 * code that changes no words at all. At the same time the pages are
 * data-driven, so one edit in src/data can move text on four routes and a
 * source diff shows it once, in a file whose name names none of them.
 *
 * The question being answered is "did the right words change on the right
 * pages", so the comparison has to be of the pages.
 *
 * Blocks are matched by exact text; anything unmatched is reported as removed
 * or added. That means a one-word edit shows as a removal plus an addition
 * rather than as an inline change — which is the honest representation here,
 * since these are usually rewrites rather than tweaks.
 */
import { readFileSync } from 'node:fs';

const [, , A, B] = process.argv;
if (!A || !B) { console.error('usage: node tools/diff-copy.mjs <before.json> <after.json>'); process.exit(1); }

const before = JSON.parse(readFileSync(A, 'utf8'));
const after = JSON.parse(readFileSync(B, 'utf8'));
const routes = [...new Set([...Object.keys(before), ...Object.keys(after)])];

let removed = 0; let added = 0; let touched = 0;

for (const route of routes) {
  const a = before[route] ?? [];
  const b = after[route] ?? [];
  const setA = new Set(a);
  const setB = new Set(b);
  const gone = a.filter((s) => !setB.has(s));
  const came = b.filter((s) => !setA.has(s));
  if (!gone.length && !came.length) continue;

  touched++;
  removed += gone.length;
  added += came.length;

  console.log(`\n${'═'.repeat(78)}`);
  console.log(route);
  console.log('═'.repeat(78));
  for (const s of gone) console.log(`  - ${s}`);
  for (const s of came) console.log(`  + ${s}`);
}

console.log(`\n${routes.length} routes, ${touched} with visible changes: `
  + `${removed} lines removed, ${added} added.\n`);
