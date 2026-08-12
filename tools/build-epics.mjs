/**
 * Collapse the 72 drafted tickets into nine epics.
 *
 *   node tools/build-epics.mjs <journal.jsonl> <outDir>
 *
 * Four agents drafted in parallel and each split its own area finely, so the
 * raw output was 72 tickets with real duplication across streams — the 510(k)
 * number was raised twice, the patient CT twice, the Mayo wording twice. That
 * is too many to run a project from.
 *
 * This maps every drafted ticket onto one of nine epics by ID. The mapping is
 * explicit rather than inferred, because the grouping is a judgement about how
 * the work should be sequenced, not something to guess from keywords. Nothing
 * is discarded: every original becomes a checklist line under its epic, and
 * 10-tickets.md keeps the full detail.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const [journal, outDir = 'docs/shubham'] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

/* Rebuild the same numbering 10-tickets.md used, so the IDs line up. */
const records = readFileSync(journal, 'utf8').split('\n').filter(Boolean)
  .map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .filter((r) => r && r.type === 'result').map((r) => r.result);

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const seen = new Map();
for (const s of records.filter((r) => r && Array.isArray(r.tickets))) {
  for (const t of s.tickets) {
    const k = norm(t.title);
    const prev = seen.get(k);
    if (!prev) { seen.set(k, t); continue; }
    const merged = { ...prev, ...t };
    merged.acceptance = [...new Set([...(prev.acceptance || []), ...(t.acceptance || [])])];
    merged.files = [...new Set([...(prev.files || []), ...(t.files || [])])];
    seen.set(k, merged);
  }
}
const PRIO = { P0: 0, P1: 1, P2: 2, P3: 3 };
const ORDER = { blocked: 0, ready: 1, done: 2 };
const all = [...seen.values()].sort((a, b) =>
  (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9)
  || (PRIO[a.priority] ?? 9) - (PRIO[b.priority] ?? 9)
  || String(a.title).localeCompare(String(b.title)));
all.forEach((t, i) => { t.key = `NAV-${String(i + 1).padStart(3, '0')}`; });
const byKey = Object.fromEntries(all.map((t) => [t.key, t]));

const num = (list) => list.map((n) => `NAV-${String(n).padStart(3, '0')}`);

const EPICS = [
  {
    id: 'E1', title: 'Restore the deployed site',
    owner: 'engineering', status: 'done', priority: 'P0',
    why: `The site did not work in production. \`base\` was written as a bare segment, the router
had no matching basename so the home page rendered the 404 component, GitHub Pages had no
404.html so every deep link and refresh died, and 21 images referenced from public/ resolved
against the server root. Two internal links pointed at routes that never existed.`,
    outcome: 'All 17 routes render at the deployed URL shape, gated by `npm run check:build` in CI.',
    ids: num([55, 58, 64]),
  },
  {
    id: 'E2', title: 'Published claims and regulatory status',
    owner: 'navinetics-regulatory', status: 'blocked', priority: 'P0',
    why: `Six unsubstantiated claims had reached production, including a comparative "0.6 mm
deviation" benchmark the codebase itself recorded as held back pending sign-off. Those are
removed and the FDA 510(k) clearance the company already publishes is restored. What remains is
information only NaviNetics holds — and until it arrives the site says less than it could.`,
    outcome: 'Every quantitative or regulatory statement on the site is traceable to a NaviNetics-approved source.',
    ids: num([57, 65, 68, 1, 2, 3, 4, 5, 8, 9, 12, 13, 14, 15, 16, 17, 19, 20, 22, 23, 24, 34, 47]),
  },
  {
    id: 'E3', title: 'Legal pages, permissions and patient imagery',
    owner: 'navinetics-legal', status: 'blocked', priority: 'P1',
    why: `The site carries no privacy policy, terms, cookie notice, accessibility statement or
legal-entity imprint, and has EU/UK/Asia distributors. Five partner marks and several journal
figures are published with no permission record. Two patient CT studies are live on the
Education page with the de-identification review the repo itself asks for still outstanding.`,
    outcome: 'Nothing is published that the company cannot show it has the right to publish.',
    ids: num([10, 11, 18, 25, 26, 32, 36, 45]),
  },
  {
    id: 'E4', title: 'Conversion and commercial content',
    owner: 'engineering', status: 'ready', priority: 'P1',
    why: `The only enquiry form on the site validated input and then discarded it, and every CTA
funnelled into it. That is fixed. Beyond it, a buyer still cannot find specifications,
compatibility, service or warranty, and the MAVEN spec table exists in the data but renders on no
live route.`,
    outcome: 'A surgeon or purchasing manager can find what they need and has somewhere to go next.',
    ids: num([56, 66, 46, 48, 52, 27]),
  },
  {
    id: 'E5', title: 'Layout and design system',
    owner: 'engineering', status: 'done', priority: 'P1',
    why: `Half the site's sections sat on a 1024px measure and half on 1280px, alternating within
single pages, and adjacent sections stacked their full padding into 320px voids. An ultrawide
showed 1280px of content in 3840px of screen.`,
    outcome: 'One measure, one gutter, one rhythm. 68 of ~70 sections share a left edge at every width.',
    ids: num([67, 69, 54, 72]),
  },
  {
    id: 'E6', title: 'Accessibility',
    owner: 'engineering', status: 'ready', priority: 'P1',
    why: `Hospitals procure against Section 508 and EN 301 549, so this is a purchasing blocker
rather than polish. The mega-menu was keyboard-unreachable, putting eleven pages out of reach;
the media lightbox claimed \`aria-modal\` and delivered none of it; dark-theme status colours were
inherited from the light theme and sat below AA. Those are fixed. The rest is outstanding.`,
    outcome: 'The site is operable by keyboard and screen reader throughout, and meets WCAG 2.2 AA.',
    ids: num([61, 62, 30, 37, 40, 41, 53]),
  },
  {
    id: 'E7', title: 'Performance',
    owner: 'engineering', status: 'ready', priority: 'P1',
    why: `Two pages hold the main thread at ~93% while the visitor does nothing, so taps queue and
the hamburger feels broken — the menu itself paints in 30-107ms. Two optimisations were made on
the theory that drawing was the cost and **neither moved the number**, so the next step is to
prove the cause before changing anything else.`,
    outcome: 'Steady-state busy under 20% on every route, with a regression gate to keep it there.',
    ids: num([6, 7, 28, 29, 33, 43, 51, 70, 71, 39, 21, 63, 44]),
  },
  {
    id: 'E8', title: 'Discoverability',
    owner: 'engineering', status: 'ready', priority: 'P2',
    why: `The site is client-rendered, so a crawler that does not execute JavaScript sees one page
for every route. Sharing metadata, canonical URLs, structured data, robots.txt and a sitemap are
in place; prerendering is the remaining structural fix and the largest single SEO item left.`,
    outcome: 'Every route is independently indexable and unfurls correctly when shared.',
    ids: num([59, 35]),
  },
  {
    id: 'E9', title: 'Verification tooling',
    owner: 'engineering', status: 'ready', priority: 'P2',
    why: `Every failure in E1 was invisible in dev and fatal in production, and the build passed
throughout. The checks exist so that class of thing cannot ship twice. Some are not yet wired
into CI, and the WebKit check needs a browser install step.`,
    outcome: 'Every failure class that has bitten once is gated automatically.',
    ids: num([60, 31, 38, 42, 49, 50]),
  },
];

const used = new Set(EPICS.flatMap((e) => e.ids));
const orphans = all.filter((t) => !used.has(t.key));

const line = (k) => {
  const t = byKey[k];
  if (!t) return `- [ ] _${k} — missing_`;
  const box = t.status === 'done' ? 'x' : ' ';
  const who = t.owner.startsWith('navinetics') ? ` — **${t.owner.replace('navinetics-', '')}**` : '';
  return `- [${box}] ${t.title}${who}`;
};

const badge = (e) => e.status === 'done' ? 'DONE'
  : e.status === 'blocked' ? 'BLOCKED' : 'READY';

const doc = `# Epics — NaviNetics website

Nine epics. **Local only** — nothing has been created on GitHub.

The drafting run produced 72 tickets, which is too many to run a project from and contained real
duplication across streams. They are collapsed here and kept in full in
[10-tickets.md](10-tickets.md); every one of them appears below as a checklist line, so nothing
was dropped in the consolidation.

| Epic | Title | Owner | Status | Items |
|---|---|---|---|---|
${EPICS.map((e) => `| **${e.id}** | ${e.title} | ${e.owner} | ${badge(e)} | ${e.ids.length} |`).join('\n')}

**Three of the nine are blocked on NaviNetics, not on engineering.** E2 and E3 between them hold
almost everything that cannot be closed by writing code.

---

${EPICS.map((e) => `
## ${e.id} · ${e.title}

\`${e.priority}\` · owner **${e.owner}** · **${badge(e)}** · ${e.ids.length} items

${e.why.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()}

**Done when** — ${e.outcome}

${e.ids.map(line).join('\n')}
`).join('\n---\n')}
${orphans.length ? `\n---\n\n## Not mapped\n\n${orphans.map((t) => `- ${t.key} ${t.title}`).join('\n')}\n` : ''}`;

writeFileSync(`${outDir}/10-epics.md`, doc);
console.log(`${outDir}/10-epics.md   ${EPICS.length} epics, ${used.size} of ${all.length} tickets mapped`
  + (orphans.length ? `, ${orphans.length} UNMAPPED` : ''));
