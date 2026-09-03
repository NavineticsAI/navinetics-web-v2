/**
 * A reviewed document, published to the live site. One command.
 *
 *   npm run copy:publish -- reviewed.docx              # show what would happen
 *   npm run copy:publish -- reviewed.docx --publish    # do it
 *
 * Reads the document, writes the edits into the site, checks it still builds,
 * commits, pushes. GitHub Pages deploys from the push.
 *
 * WITHOUT --publish IT WRITES NOTHING AND TOUCHES NO GIT. That is the default
 * on purpose: the point of a review is that somebody looks at the change before
 * it is public, and a command that publishes by accident is worse than three
 * commands that cannot.
 *
 * It stops at the first failure rather than continuing. A build that breaks
 * halfway through leaves the working tree edited but unpushed, which `git
 * checkout -- src/` undoes completely.
 */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const docx = args.find((a) => !a.startsWith('--'));
const PUBLISH = args.includes('--publish');

if (!docx || !existsSync(docx)) {
  console.error('\n  usage: npm run copy:publish -- <reviewed.docx> [--publish]\n');
  process.exit(1);
}

const py = process.platform === 'win32' ? 'python' : 'python3';
const step = (n, what) => console.log(`\n  ${n}. ${what}`);
const run = (cmd, cmdArgs, label) => {
  const r = spawnSync(cmd, cmdArgs, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(`\n  STOPPED at: ${label}\n`);
    console.error((r.stderr || r.stdout || '').split('\n').slice(-25).join('\n'));
    console.error('\n  Nothing was pushed. Undo any edits with:  git checkout -- src/\n');
    process.exit(1);
  }
  return r.stdout || '';
};

// ── 1. read the document ────────────────────────────────────────────────────
step(1, `Reading ${docx}`);
run(py, ['tools/copy-import.py', docx, '--json', 'copy/copy-changes.json', '--quiet'],
  'reading the document');
const { changes, problems, comments } = JSON.parse(
  execSync(`node -e "process.stdout.write(require('fs').readFileSync('copy/copy-changes.json','utf8'))"`,
    { encoding: 'utf8' }),
);

console.log(`     ${changes.length} text change${changes.length === 1 ? '' : 's'}`);
for (const c of changes.slice(0, 15)) {
  console.log(`       ${c.page} — ${c.label}`);
  console.log(`         was: ${c.before.replace(/\n/g, ' ').slice(0, 88)}`);
  console.log(`         now: ${c.after.replace(/\n/g, ' ').slice(0, 88)}`);
}
if (changes.length > 15) console.log(`       … and ${changes.length - 15} more`);

const notApplied = (problems || []).filter((p) => p.kind !== 'row missing');
if (notApplied.length) {
  console.log(`\n     ${notApplied.length} NOT applied — these need a person:`);
  for (const p of notApplied.slice(0, 10)) console.log(`       [${p.kind}] ${p.label}\n         ${p.detail}`);
}
const nComments = Object.values(comments || {}).reduce((a, b) => a + b.length, 0);
if (nComments) {
  console.log(`\n     ${nComments} comment${nComments === 1 ? '' : 's'} from reviewers:`);
  for (const [, cs] of Object.entries(comments)) {
    for (const c of cs.slice(0, 8)) console.log(`       ${c.author}: ${c.text.slice(0, 110)}`);
  }
}

if (!changes.length) {
  console.log('\n  No wording changes to publish.\n');
  process.exit(0);
}

if (!PUBLISH) {
  console.log('\n  ── nothing was written ──');
  console.log('  Re-run with --publish to write these, build, commit and push:\n');
  console.log(`      npm run copy:publish -- "${docx}" --publish\n`);
  process.exit(0);
}

// ── 2. write them into the site ─────────────────────────────────────────────
step(2, 'Writing the edits into the site');
run('node', ['tools/copy-apply.mjs', '--changes', 'copy/copy-changes.json', '--apply'],
  'writing the edits');
console.log('     written');

// ── 3. prove the site still works ───────────────────────────────────────────
step(3, 'Building and linting');
run('npm', ['run', 'build'], 'the build');
run('npx', ['oxlint', 'src'], 'the lint');
console.log('     clean');

// ── 4. re-export, so the manifest matches what was just written ─────────────
// Otherwise the next review is built against positions that have moved, and
// every one of its edits is refused as "the file changed since export".
step(4, 'Re-recording where every sentence now lives');
run('node', ['tools/copy-export.mjs'], 're-exporting the manifest');
console.log('     done');

// ── 5. commit and push ──────────────────────────────────────────────────────
step(5, 'Committing and pushing');
const lines = changes.slice(0, 20).map((c) => `  ${c.page} — ${c.label}`);
const body = `Apply reviewed copy from ${docx.split(/[\\/]/).pop()}\n\n`
  + `${changes.length} text change${changes.length === 1 ? '' : 's'} from the review document.\n\n`
  + `${lines.join('\n')}${changes.length > 20 ? `\n  … and ${changes.length - 20} more` : ''}\n`
  + (notApplied.length
    ? `\nNot applied, reported for a person: ${notApplied.map((p) => p.kind).join(', ')}.\n` : '');

run('git', ['add', 'src', 'copy/copy-manifest.json'], 'staging');
run('git', ['commit', '-m', body], 'committing');
run('git', ['push'], 'pushing');

const sha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
console.log(`     pushed as ${sha}`);
console.log('\n  Published. GitHub Pages will rebuild in a minute or two:');
console.log('      https://navineticsai.github.io/navinetics-web-v2/\n');
