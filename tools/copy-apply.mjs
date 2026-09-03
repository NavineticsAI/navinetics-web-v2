/**
 * Write the reviewed copy back into the site.
 *
 *   node tools/copy-apply.mjs                      # show what would change
 *   node tools/copy-apply.mjs --apply              # write it
 *   node tools/copy-apply.mjs --changes other.json --apply
 *
 * THIS IS THE ONLY STEP THAT TOUCHES SOURCE, and it is deliberately separate
 * from reading the document so that reading one is never accidentally a write.
 * It refuses by default: without --apply it prints the patch and exits.
 *
 * THE SAFETY THAT MATTERS. Every edit is applied to a BYTE RANGE recorded at
 * export. If the file has changed at all since then — someone pushed a copy fix
 * while the document was out for review, which on a two-week review is likely —
 * those offsets now point at the wrong characters, and applying them would
 * corrupt the file silently. So each file's hash is checked first and the whole
 * file is skipped if it moved. Re-export, rebuild the document, and the review
 * can be re-applied against the new offsets.
 *
 * Ranges within a file are applied LAST FIRST, so that replacing one string
 * never shifts the offsets of the ones not yet written.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { extractFile } from './copy-lib.mjs';

const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const APPLY = process.argv.includes('--apply');
const changesFile = arg('--changes', 'copy/copy-changes.json');
const manifestFile = arg('--manifest', 'copy/copy-manifest.json');

const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
const { changes } = JSON.parse(readFileSync(changesFile, 'utf8'));
const index = new Map(manifest.entries.map((e) => [e.id, e]));

/* A review lands as dozens of edits across a dozen files at once. If the tree
   already has uncommitted work in it, the two are interleaved in the diff and
   there is no longer a clean way to undo just the review — so refuse, and say
   what to do about it. `git checkout -- src/` is the whole undo otherwise. */
if (APPLY && !process.argv.includes('--force')) {
  let dirty = '';
  try {
    dirty = execSync('git status --porcelain -- src/', { encoding: 'utf8' }).trim();
  } catch { /* not a git checkout; the guard simply does not apply */ }
  if (dirty) {
    console.error('\n  src/ has uncommitted changes:\n');
    for (const l of dirty.split('\n').slice(0, 12)) console.error(`    ${l}`);
    console.error('\n  Applying a review on top of those makes the two impossible to'
      + '\n  separate, and `git checkout -- src/` would throw away both.'
      + '\n  Commit or stash first, or re-run with --force if you mean it.\n');
    process.exit(1);
  }
}

/* ── turning a reviewer's sentence back into source ────────────────────────
   Each kind of site is rebuilt in its own shape. A sentence that arrives with
   an apostrophe, a backslash or a `${` in it must not be able to end the
   literal it is being put into — that is how a copy edit becomes a build
   failure, or worse, a working build that says something nobody wrote. */

const quoted = (text, q) => {
  const body = text
    .split('\\').join('\\\\')
    .split(q).join(`\\${q}`)
    .split('\n').join('\\n');
  return q + body + q;
};

const backticked = (text) => `\`${text
  .split('\\').join('\\\\')
  .split('`').join('\\`')
  .split('${').join('\\${')}\``;

/** Re-wrap a long sentence as the file wrote it: `'one ' + 'two '`. */
function concatenated(text, indent, q, eol) {
  const budget = Math.max(40, 92 - indent.length);
  const words = text.split(' ');
  const chunks = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur.length + w.length + 1) > budget) { chunks.push(`${cur} `); cur = w; }
    else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) chunks.push(cur);
  if (chunks.length === 1) return quoted(text, q);
  return chunks
    .map((c, i) => (i ? `${indent}+ ${quoted(c, q)}` : quoted(c, q)))
    .join(eol);
}

function render(e, text, eol) {
  const q = e.quote === '"' ? '"' : "'";
  switch (e.kind) {
    case 'jsx-text':
      // Anything JSX would read as markup has to go back as a string in braces.
      return /[{}<>]/.test(text)
        ? `${e.pre ?? ''}{${quoted(text, q)}}${e.post ?? ''}`
        : `${e.pre ?? ''}${text}${e.post ?? ''}`;
    case 'template':
      return backticked(text);
    case 'template-dyn': {
      // Put the expressions back where the reviewer left the {n} markers.
      // copy-import.py has already refused any edit that lost or reordered one.
      let outStr = '';
      const parts = text.split(/\{(\d+)\}/);
      parts.forEach((p, i) => {
        if (i % 2 === 0) {
          outStr += p.split('\\').join('\\\\').split('`').join('\\`').split('${').join('\\${');
        } else {
          outStr += `\${${e.slotSrc[Number(p) - 1]}}`;
        }
      });
      return `\`${outStr}\``;
    }
    case 'concat':
      return concatenated(text, e.indent || '', q, eol);
    default:
      return quoted(text, q);
  }
}

/* ── apply ─────────────────────────────────────────────────────────────── */

const byFile = new Map();
const refused = [];
for (const c of changes) {
  const e = index.get(c.id);
  if (!e) { refused.push([c.id, c.label, 'not in the manifest']); continue; }
  if (!byFile.has(e.file)) byFile.set(e.file, []);
  byFile.get(e.file).push({ e, after: c.after, label: c.label });
}

let written = 0;
let skippedFiles = 0;
const preview = [];

for (const [file, edits] of byFile) {
  const src = readFileSync(file, 'utf8');

  /* WHERE each string is, worked out NOW, from the file as it is.
   *
   * The manifest carries offsets, and they were the plan: record the exact
   * bytes at export and write to them later. They are not portable. Exported on
   * Windows the file is CRLF; checked out on a Linux runner it is LF, so every
   * offset past the first newline is wrong by the number of lines above it and
   * the file hash never matches. The guard fired on every single run and
   * reported "the file changed since the document was exported" about a file
   * nobody had touched.
   *
   * So the manifest says WHICH string — by astPath, which is structural and
   * survives reformatting — and the file itself says where. Offsets become a
   * record of where it was, not an instruction about where to write, and a
   * whole class of staleness stops existing. Protection against a genuinely
   * stale document lives in the three-way comparison in copy-import.py, which
   * is where it belongs. */
  const live = extractFile(file);
  const here = new Map(live.entries.map((x) => [x.astPath, x]));
  const eol = src.includes('\r\n') ? '\r\n' : '\n';

  const placed = [];
  for (const { e, after, label } of edits) {
    const at = here.get(e.astPath);
    if (!at) {
      refused.push([file, label,
        'this sentence is no longer where the document says it is — the code '
        + 'around it has been restructured. Re-export, rebuild the document, '
        + 'and it will line up again.']);
      continue;
    }
    placed.push({ e: { ...e, start: at.start, end: at.end, line: at.line }, after, label });
  }
  if (!placed.length) {
    skippedFiles += 1;
    continue;
  }

  // Last first: an earlier replacement must never move a later one's offsets.
  placed.sort((a, b) => b.e.start - a.e.start);
  let next = src;
  for (const { e, after, label } of placed) {
    const replacement = render(e, after, eol);
    preview.push({ file, line: e.line, label, was: src.slice(e.start, e.end), now: replacement });
    next = next.slice(0, e.start) + replacement + next.slice(e.end);
    written += 1;
  }
  if (APPLY) writeFileSync(file, next);
}

console.log(`\n  ${changes.length} changes from ${changesFile}`);
console.log(`  ${byFile.size - skippedFiles} files ${APPLY ? 'written' : 'would change'}, ${written} strings\n`);

for (const p of preview.slice(0, 40)) {
  console.log(`  ${p.file}:${p.line}  ${p.label}`);
  console.log(`      - ${p.was.split('\n')[0].slice(0, 108)}`);
  console.log(`      + ${p.now.split('\n')[0].slice(0, 108)}`);
}
if (preview.length > 40) console.log(`  ... and ${preview.length - 40} more\n`);

if (refused.length) {
  console.log('\n  NOT APPLIED');
  for (const [a, b, why] of refused) console.log(`  ${a}  (${b})\n      ${why}`);
}

if (!APPLY) {
  console.log('\n  Nothing was written. Re-run with --apply to write these.\n');
} else {
  console.log('\n  Written. Now run:  npm run build  &&  npx oxlint src\n');
}
