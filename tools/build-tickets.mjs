/**
 * Turn the drafting run's journal into the two working documents.
 *
 *   node tools/build-tickets.mjs <journal.jsonl> <outDir>
 *
 * The drafting was done by four agents in parallel — a PR body and three
 * ticket streams — and the pass that was meant to merge them ran out of
 * session budget. Their output is all in the journal, so this does the merge
 * mechanically instead: dedupe by normalised title, renumber into one stable
 * scheme, and render both documents in one consistent format.
 *
 * Doing it here rather than by hand keeps the numbering reproducible: re-run
 * it and the same input gives the same IDs.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const [journal, outDir = 'docs/shubham'] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const records = readFileSync(journal, 'utf8')
  .split('\n').filter(Boolean)
  .map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .filter((r) => r && r.type === 'result')
  .map((r) => r.result);

const pr = records.find((r) => r && typeof r.body === 'string' && r.title);
const streams = records.filter((r) => r && Array.isArray(r.tickets));

/* ── dedupe ────────────────────────────────────────────────────────────────
   The same item was often found by two streams — the blocked list and the
   engineering list both raised the 510(k) number, for instance. Keyed on a
   normalised title so near-identical wording collapses. */
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const seen = new Map();
for (const s of streams) {
  for (const t of s.tickets) {
    const k = norm(t.title);
    const prev = seen.get(k);
    if (!prev) { seen.set(k, t); continue; }
    // Keep the richer record; merge acceptance criteria and files.
    const merged = { ...prev, ...t };
    merged.acceptance = [...new Set([...(prev.acceptance || []), ...(t.acceptance || [])])];
    merged.files = [...new Set([...(prev.files || []), ...(t.files || [])])];
    merged.context = (prev.context || '').length > (t.context || '').length ? prev.context : t.context;
    seen.set(k, merged);
  }
}
const all = [...seen.values()];

const STREAM = (t) => {
  const s = `${t.id} ${t.title} ${t.context}`.toLowerCase();
  if (t.owner && t.owner.startsWith('navinetics')) return 'blocked';
  if (/perf|busy|long task|chunk|raf|frame|bundle/.test(s)) return 'perf';
  if (/a11y|accessib|keyboard|focus|screen reader|contrast|tap target/.test(s)) return 'a11y';
  if (/seo|crawl|prerender|metadata|sitemap|open graph/.test(s)) return 'seo';
  if (/copy|placeholder|claim|wording|content/.test(s)) return 'content';
  return 'infra';
};

const PRIO = { P0: 0, P1: 1, P2: 2, P3: 3 };
const STATUS_ORDER = { blocked: 0, ready: 1, done: 2 };

let n = 0;
for (const t of all.sort((a, b) =>
  (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
  || (PRIO[a.priority] ?? 9) - (PRIO[b.priority] ?? 9)
  || String(a.title).localeCompare(String(b.title)))) {
  t.stream = STREAM(t);
  t.key = `NAV-${String(++n).padStart(3, '0')}`;
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();

const render = (t) => `
### ${t.key} · ${t.title}

\`${t.type}\` · **${t.priority}** · owner **${t.owner}** · ${t.estimate} · status **${t.status}**

${t.context}

**Acceptance**
${(t.acceptance || []).map((a) => `- [ ] ${a}`).join('\n') || '- [ ] _none recorded_'}

${(t.files || []).length ? `**Files** — ${t.files.map((f) => `\`${f}\``).join(', ')}\n` : ''}${t.blockedBy ? `**Blocked by** — ${t.blockedBy}\n` : ''}**Verify** — ${t.verify || '_not recorded_'}
`;

const group = (label, list, blurb) => list.length === 0 ? '' : `
## ${label}

${blurb}

${list.map(render).join('\n---\n')}
`;

const blocked = all.filter((t) => t.status === 'blocked');
const ready = all.filter((t) => t.status === 'ready');
const done = all.filter((t) => t.status === 'done');

const table = (list) => `| ID | Title | Owner | Pri | Est |
|---|---|---|---|---|
${list.map((t) => `| ${t.key} | ${esc(t.title)} | ${t.owner} | ${t.priority} | ${t.estimate} |`).join('\n')}`;

const tickets = `# Tickets — NaviNetics website

Generated from the drafting run by \`tools/build-tickets.mjs\`. **Local only** — nothing here
has been created on GitHub. Re-running the generator on the same input produces the same IDs.

${all.length} tickets: **${blocked.length} blocked** on NaviNetics, **${ready.length} ready** to
build, **${done.length} done** in this branch.

Rules this list follows, which are the same rules the site follows:
never invent a regulatory claim, a certification, a clearance number, a customer or a performance
figure; "cleared" and never "approved" for a 510(k) device; and where something failed or was
reverted, say so rather than quietly dropping it.

---

## Blocked on NaviNetics — ${blocked.length}

Nothing here can be closed by engineering. Each names the role that must answer and what happens
to the site once they do.

${table(blocked)}

## Ready to build — ${ready.length}

${table(ready)}

## Done in this branch — ${done.length}

${table(done)}

---
${group('Blocked — detail', blocked, 'Ordered by priority. P0 means a live exposure, not merely important.')}
---
${group('Ready — detail', ready, 'No company input needed; these can start now.')}
---
${group('Done — detail', done, 'Landed on `site-fixes-2026-08`. Listed so a reviewer can see what the branch actually contains.')}
`;

writeFileSync(`${outDir}/10-tickets.md`, tickets);
console.log(`${outDir}/10-tickets.md   ${all.length} tickets (${blocked.length} blocked / ${ready.length} ready / ${done.length} done)`);

if (pr) {
  writeFileSync(`${outDir}/11-pull-request.md`,
    `# Pull request — draft\n\n> Paste into the PR body. **Not** created on GitHub; local only.\n\n`
    + `**Title:** ${pr.title}\n\n---\n\n${pr.body}\n`);
  console.log(`${outDir}/11-pull-request.md   "${pr.title}"`);
}
