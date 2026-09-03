/**
 * What has changed since the copy was signed off.
 *
 *   node tools/copy-diff-reference.mjs
 *
 * Reviewers edit a Word document and their changes reach the site with nobody
 * reading them first. copy/reference/original-copy.json is the wording as it
 * stood before that began, and never moves. This is the whole of the drift
 * since, in one place, which is the thing somebody will want in six months when
 * a regulator asks what the site used to say.
 */
import { readFileSync } from 'node:fs';

const ref = JSON.parse(readFileSync('copy/reference/original-copy.json', 'utf8'));
const now = JSON.parse(readFileSync('copy/copy-manifest.json', 'utf8'));
const live = new Map(now.entries.map((e) => [e.id, e]));

const changed = [];
const gone = [];
for (const [id, was] of Object.entries(ref.entries)) {
  const is = live.get(id);
  if (!is) { gone.push(was); continue; }
  if (is.text !== was.text) changed.push({ was, is });
}
const added = now.entries.filter((e) => !ref.entries[e.id]);

console.log(`\n  Signed off ${ref.taken}, at ${ref.commit.slice(0, 7)}`);
console.log(`  ${Object.keys(ref.entries).length} pieces of text then, ${now.entries.length} now\n`);

for (const { was, is } of changed) {
  console.log(`  ${is.label}`);
  console.log(`    was: ${was.text.replace(/\n/g, ' ').slice(0, 100)}`);
  console.log(`    now: ${is.text.replace(/\n/g, ' ').slice(0, 100)}`);
}
if (gone.length) console.log(`\n  ${gone.length} no longer on the site`);
if (added.length) console.log(`  ${added.length} added since`);
if (!changed.length && !gone.length && !added.length) console.log('  Nothing has changed.');
console.log('');
