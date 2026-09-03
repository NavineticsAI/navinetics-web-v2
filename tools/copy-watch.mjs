/**
 * Save the Word document, see it on the local site.
 *
 *   npm run dev          # in one terminal — the local site, on http://localhost:5173
 *   npm run copy:watch   # in another — this
 *
 * Then edit the document in Word and press Ctrl+S. The words change in the
 * browser a second later.
 *
 * THIS ONLY EVER TOUCHES YOUR OWN MACHINE. It writes to files under src/ and
 * nothing else. It runs no git command, and the published site at
 * navineticsai.github.io cannot change until somebody commits and pushes on
 * purpose. Undo everything it has done with:  git checkout -- src/
 *
 * Use `npm run dev`, not `npm run preview`. Preview serves an already-built
 * copy of the site and will not notice; dev watches the files and reloads.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, globSync, statSync, watch } from 'node:fs';
import { basename, dirname } from 'node:path';

// Skip Word's ~$<name> lock file: it is not a document, and '~' sorts after
// every letter, so `.sort().pop()` finds it whenever the document is open.
const DOCX = process.argv[2]
  || (globSync('copy/*.docx').filter((f) => !/[\/]~\$/.test(f)).sort().pop() || '');
const TMP = 'copy/.watching.docx';
const CHANGES = 'copy/.watch-changes.json';

if (!existsSync(DOCX)) {
  console.error(`\n  Cannot find ${DOCX}\n  Run  npm run copy:export  first.\n`);
  process.exit(1);
}

const py = process.platform === 'win32' ? 'python' : 'python3';
const run = (cmd, args) => spawnSync(cmd, args, { encoding: 'utf8' });

let busy = false;
let timer = null;
let lastSize = -1;

/**
 * Word does not write the file you are watching. It writes a new one beside it
 * and renames, holding a lock across the swap — so a read the instant the event
 * arrives gets a half-written file or an EBUSY. Copying it aside, with a few
 * retries, is what makes this reliable rather than intermittent.
 */
function snapshot() {
  for (let i = 0; i < 8; i += 1) {
    try {
      copyFileSync(DOCX, TMP);
      return true;
    } catch {
      const until = Date.now() + 250;
      while (Date.now() < until) { /* Word still has it */ }
    }
  }
  return false;
}

function sync() {
  if (busy) return;
  busy = true;
  try {
    if (!snapshot()) {
      console.log('  … Word still has the file open, will try again on the next save');
      return;
    }

    const imported = run(py, ['tools/copy-import.py', TMP, '--json', CHANGES, '--quiet']);
    if (imported.status !== 0) {
      console.log(`\n  Could not read the document:\n${imported.stderr || imported.stdout}`);
      return;
    }

    const result = JSON.parse(run('node', ['-e',
      `process.stdout.write(require('fs').readFileSync(${JSON.stringify(CHANGES)},'utf8'))`]).stdout);
    const n = result.changes.length;
    const problems = result.problems || [];

    if (!n) {
      console.log(`  no wording changes yet${problems.length ? ` · ${problems.length} need a person` : ''}`);
      return;
    }

    // --force: after the first save src/ is dirty by definition, and the guard
    // that protects a one-shot review would block every save after it.
    const applied = run('node', ['tools/copy-apply.mjs', '--changes', CHANGES, '--apply', '--force']);
    if (applied.status !== 0) {
      console.log(`\n  Could not write the changes:\n${applied.stderr || applied.stdout}`);
      return;
    }

    console.log(`\n  ${n} change${n === 1 ? '' : 's'} written — the browser should reload`);
    for (const c of result.changes.slice(0, 8)) {
      console.log(`    ${c.page} · ${c.label}`);
      console.log(`      ${c.after.slice(0, 96)}`);
      if ((c.appears_on || []).length > 1) {
        console.log(`      (also changes: ${c.appears_on.filter((p) => p !== c.page).join(', ')})`);
      }
    }
    if (n > 8) console.log(`    … and ${n - 8} more`);

    for (const p of problems.slice(0, 5)) {
      console.log(`\n  NOT applied — ${p.kind}: ${p.label}\n    ${p.detail}`);
    }
    for (const [, cs] of Object.entries(result.comments || {})) {
      for (const c of cs) console.log(`\n  comment from ${c.author}: ${c.text.slice(0, 140)}`);
    }
  } finally {
    busy = false;
  }
}

console.log(`\n  Watching ${DOCX}`);
console.log('  Save in Word (Ctrl+S) and the local site updates.');
console.log('  Local only — the published site cannot change from here.');
console.log('  Undo everything:  git checkout -- src/\n');

// Watch the folder, not the file: the file is replaced on every save, and a
// watch on the old inode stops firing after the first one.
watch(dirname(DOCX), (_evt, name) => {
  if (!name) return;
  const f = basename(name);
  if (f !== basename(DOCX)) return;
  if (f.startsWith('~$')) return; // Word's own lock file
  try {
    const s = statSync(DOCX).size;
    if (s === lastSize) return; // a touch with no edit
    lastSize = s;
  } catch { return; }
  clearTimeout(timer);
  timer = setTimeout(sync, 900); // let Word finish the swap
});
