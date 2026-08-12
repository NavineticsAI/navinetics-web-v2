/**
 * Build the publication pack in the house format.
 *
 *   node tools/build-pack.mjs
 *
 * Follows documentation/dev/shubham/TICKET_PUBLICATION_FLOW.md and
 * ticket-templates/TICKET-AND-LABEL-STANDARD.md from navinetics-ai-suite:
 * a pack under documentation/dev/shubham/<context>/ containing issue-ready
 * tickets, INDEX_<CONTEXT>.md and PR_BODY.md.
 *
 * ONE DEVIATION FROM THE STANDARD, deliberately. That standard is written for
 * navinetics-ai-suite, which is IEC 62304 Class C device software, and it says
 * to label every ticket class-c by default. This repository is the marketing
 * website: it is not device software and carries no software safety class, so
 * applying class-c here would put a safety classification on work that has
 * none and dilute the label where it means something. Regulatory exposure on
 * this repo is about PUBLISHED CLAIMS, not software failure modes, so tickets
 * that touch claims carry `FDA` and `regulatory` instead.
 *
 * Traceability IDs are also omitted rather than invented — the standard is
 * explicit that a broken trace is worse than none, and this repo has no
 * requirement or risk registry to cite.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const CONTEXT = 'WEBSITE';
const DIR = 'documentation/dev/shubham/website';
mkdirSync(`${DIR}/tickets`, { recursive: true });

const BRANCH = 'site-fixes-2026-08';
const BASE = 'main';

const T = [
  {
    n: 1, code: 'BUG-001', slug: 'deploy-broken-on-github-pages',
    title: 'Deployed site rendered the 404 page and served no images',
    type: 'Bug', status: 'Fixed on this branch', priority: 'priority-critical',
    labels: ['bug', 'fix', 'priority-critical', 'regression', 'infra', 'shubham'],
    source: '02-fixes-applied.md §1',
    summary:
      'Four faults compounded and the deployed site did not work at all: `base` was written as a bare '
      + 'segment rather than a path, `<Router>` had no matching `basename` so the home page matched no '
      + 'route and rendered the 404 component, GitHub Pages had no `404.html` so every deep link and '
      + 'refresh returned its own 404 before the app booted, and 21 images referenced from `public/` '
      + 'resolved against the server root.',
    why:
      'Every one of these is invisible in dev — the dev server is served from `/`, so the base is `/` and '
      + 'nothing is prefixed — and every one of them broke production. The build passed throughout. A '
      + 'distributor sent a product link, a surgeon who bookmarked a page, and Googlebot all received a '
      + '404, and the seven legacy redirects could never fire because they are React elements that only '
      + 'run once the app has loaded.',
    scope: [
      '`base` set to `/navinetics-web-v2/` with both slashes',
      '`<Router basename={import.meta.env.BASE_URL}>` so one value covers dev and build',
      'A Vite `closeBundle` plugin writing `dist/404.html` and `dist/.nojekyll`',
      '`asset()` helper resolving every `public/` reference against the deployed base',
      'The logo moved into `src/assets` and imported, since a root-absolute `url()` in CSS is not rewritten',
      '`/company/careers` and `/products` corrected and added to the redirect table',
    ],
    files: ['vite.config.js', 'src/App.jsx', 'src/lib/asset.js', 'src/data/nav.js',
      'src/index.css', 'tools/check-build.mjs', '.github/workflows/node.js.yml'],
    ac: [
      'All 17 routes render at the deployed URL shape, not only at the server root',
      '`dist/404.html` is byte-identical to `dist/index.html` and `.nojekyll` exists',
      'No `public/` filename appears as a root-absolute string in any bundled file',
      '`npm run check:build` passes and runs in CI after the build step',
    ],
  },
  {
    n: 2, code: 'TASK-001', slug: 'published-claims-and-regulatory-status',
    title: 'Published claims and regulatory status need NaviNetics sign-off',
    type: 'Task', status: 'Blocked on NaviNetics', priority: 'priority-critical',
    labels: ['documentation', 'priority-critical', 'FDA', 'regulatory', 'blocked', 'shubham'],
    source: '08-existing-site.md · 04-open-items.md §A',
    summary:
      'Six unsubstantiated claims had reached production and are removed, and the FDA 510(k) clearance '
      + 'navinetics.com already publishes is restored to the D1 page. What remains is information only '
      + 'NaviNetics holds. Until it arrives the site says less than it is entitled to say.',
    why:
      'One removed claim — "around 0.6 mm deviation" benchmarked against unnamed competitor software — was '
      + 'recorded in the codebase itself as held back pending sign-off and shipped anyway. That is a process '
      + 'gap rather than an editing mistake, which is why a named claims-review owner is part of this ticket. '
      + 'Separately, the site is currently LESS informative than the site it replaces on the first question a '
      + 'hospital value-analysis committee asks.',
    scope: [
      'DONE — removed: "unparalleled precision", the 0.6 mm comparative benchmark, "Superior radiolucency", "Lightweight and safe"',
      'DONE — restored: `FDA 510(k) cleared` on the D1 page, above the fold, as a typographic status line rather than a badge',
      'DONE — withdrew an invented "not for use in human subjects" line on MAVEN that navinetics.com may contradict',
      'DONE — "safe, effective and high-quality" kept, at NaviNetics\' direction, since it is live on navinetics.com',
      'NEEDED — the 510(k) number and clearance date (`regulatory.number` is `null` and waiting)',
      'NEEDED — MR safety classification and conditions for the MR Localizer Kit',
      'NEEDED — intended use, Rx-only statement and a formal indications-for-use block for the D1',
      'NEEDED — reprocessing and sterilisation instructions for the reusable D1',
      'NEEDED — whether MAVEN is used in human recordings, and under what authorisation',
      'NEEDED — per-market status for the distributor territories (CE, UKCA, TGA, NMPA, MFDS)',
      'NEEDED — classification, intended use and intended user for NaviNetics AI',
      'NEEDED — whether the two held-back AI performance figures and the per-fiducial accuracy values may be published',
      'NEEDED — product naming: do D1 and MAVEN replace or sit alongside the existing names',
      'NEEDED — whether X-ray reticles, the microdrive and DBS lead accessories ship as standard',
      'NEEDED — a named claims-review owner and a sign-off gate for public copy',
    ],
    files: ['src/data/products.js', 'src/ui/D1Hero.jsx', 'src/pages/D1.jsx',
      'src/pages/Maven.jsx', 'src/pages/NaviNeticsAI.jsx', 'src/data/orTables.js'],
    ac: [
      'Every quantitative or regulatory statement on the site traces to a NaviNetics-approved source',
      'The 510(k) chip renders as `FDA 510(k) cleared · K######` with no code change once the number is supplied',
      '"Cleared" is used throughout and "approved" appears nowhere in relation to a 510(k) device',
      'A named owner signs off public copy before it ships',
    ],
  },
  {
    n: 3, code: 'TASK-002', slug: 'legal-pages-permissions-patient-imagery',
    title: 'Legal pages, third-party permissions and patient imagery',
    type: 'Task', status: 'Blocked on NaviNetics', priority: 'priority-high',
    labels: ['documentation', 'priority-high', 'regulatory', 'blocked', 'shubham'],
    source: '04-open-items.md §A · 08-existing-site.md',
    summary:
      'The site carries no privacy policy, terms of use, cookie notice, accessibility statement or '
      + 'legal-entity imprint, and it has EU, UK and Asia distributors. Five partner marks and several '
      + 'journal figures are published with no permission record. Two patient CT studies are live on the '
      + 'Education page with the de-identification review the repository itself asks for still outstanding.',
    why:
      'These gaps are pre-existing rather than introduced by this branch — navinetics.com has none of them '
      + 'either — which is exactly why they need an owner rather than an assumption. The patient imaging is '
      + 'the item to action first: one of the two studies is a volume render including facial bone, which '
      + 'sits directly against the HIPAA identifier for comparable images.',
    scope: [
      'NEEDED — privacy policy, terms of use, cookie notice, accessibility statement, legal-entity imprint',
      'NEEDED — a complaint intake route and an adverse-event reporting path',
      'NEEDED — written permission for the five partner marks',
      'NEEDED — clearance for the journal figures used across three pages',
      'NEEDED — Mayo Clinic attribution wording and an endorsement disclaimer',
      'NEEDED — confirmation or withdrawal of the two patient CT studies on the Education page',
      'DONE — `NaviNetics, Inc.` and the registered address are in the footer',
      'DONE — the contact form carries a plain-language data notice, which is a floor and not a policy',
    ],
    files: ['src/components/Footer.jsx', 'src/pages/Contact.jsx', 'src/data/education.js',
      'src/data/partners.js', 'src/data/media.js'],
    ac: [
      'Nothing is published the company cannot show it has the right to publish',
      'The patient CT studies are either cleared with the basis recorded beside the import, or removed',
      'A visitor can find how to report a problem with a device',
      'The legal pages exist and are linked from the footer',
    ],
  },
  {
    n: 4, code: 'BUG-002', slug: 'contact-form-discarded-every-message',
    title: 'Contact form discarded every message, and product pages had no next step',
    type: 'Bug', status: 'Partly fixed on this branch', priority: 'priority-critical',
    labels: ['bug', 'fix', 'priority-critical', 'ui/ux', 'shubham'],
    source: '02-fixes-applied.md §3',
    summary:
      'The only enquiry form on the site validated the visitor\'s input, showed a success panel, and then '
      + 'told them nothing had been transmitted. Every call to action on the site funnelled into it.',
    why:
      'A surgeon or a purchasing manager who completed that form was told, on a medical device company\'s own '
      + 'site, that the form did not work — which is worse than having no form, because it converts an '
      + 'interested buyer into a lost lead and a credibility judgement in one screen. Nothing was logged, so '
      + 'the losses were invisible.',
    scope: [
      'DONE — posts JSON to `VITE_CONTACT_ENDPOINT` with real sending/sent/failed states',
      'DONE — with no endpoint set it hands the message to the mail client fully composed rather than pretending',
      'DONE — reasons extended to cover distribution, press and product complaints',
      'DONE — `?reason=` preselects the enquiry type from product pages',
      'DONE — "Request a quote" on the D1 and surgical tables pages',
      'TODO — MAVEN\'s specification table exists in the data and renders on no live route',
      'TODO — retire the unreachable `/products/:slug` template, which no slug reaches',
    ],
    files: ['src/pages/Contact.jsx', 'src/pages/D1.jsx', 'src/pages/SurgicalTables.jsx',
      'src/pages/Product.jsx', 'src/components/AnimatedRoutes.jsx'],
    ac: [
      'A submitted enquiry either reaches NaviNetics or the visitor is handed a composed message they can send',
      'A product complaint has its own route and warns against including patient identifiers',
      'Every product page ends with an action',
      'No route renders a component that cannot be reached',
    ],
  },
  {
    n: 5, code: 'FEAT-001', slug: 'unify-layout-and-design-system',
    title: 'Unify the site onto one measure, one gutter and one vertical rhythm',
    type: 'Feature', status: 'Fixed on this branch', priority: 'priority-high',
    labels: ['enhancement', 'refactor', 'priority-high', 'ui/ux', 'shubham'],
    source: '03-layout-system.md',
    summary:
      'Roughly half the site\'s sections sat on a 1024px measure and half on 1280px, alternating within '
      + 'single pages, and adjacent sections each contributed full padding to produce 320px voids. On a '
      + '3840px ultrawide the frame showed 1280px of content in the middle of an empty screen.',
    why:
      'Reported as "no unified spacing and margin and layout and sizing engine", and the measurements bore '
      + 'it out: at 1440px the left edge alternated between 73px and 201px as you scrolled, a 128px step '
      + 'between adjacent sections.',
    scope: [
      'One `.nn-frame` utility declaring the measure, stepping to 96rem at 1920 and 110rem at 2560',
      '`Section` reduced to `py-16 md:py-20 lg:py-24` — 192px between sections, down from 320px',
      'Nine hand-rolled sections brought onto the same gutter and rhythm',
      'Scene bands keep a full-bleed ground but their content joins the frame',
      'Technology mega-panel given drawn marks instead of the Products panel\'s photography',
      'The `makeAnchor` scene rebuild recorded as tried, rejected and reverted',
    ],
    files: ['src/index.css', 'src/ui/Section.jsx', 'src/ui/Hero.jsx', 'src/ui/SceneBand.jsx',
      'src/ui/ScienceBand.jsx', 'src/ui/TechMark.jsx', 'src/components/Navbar.jsx'],
    ac: [
      'One content left edge per viewport width, exceptions documented',
      '68 of ~70 sections share that edge at 1440px and at 1920px',
      'An ultrawide shows 1760px of content rather than 1280px',
      '`node tools/check-layout.mjs` reports one distinct edge per width',
    ],
  },
  {
    n: 6, code: 'BUG-003', slug: 'accessibility-defects',
    title: 'Mega-menu unreachable by keyboard; lightbox not a real dialog; dark contrast below AA',
    type: 'Bug', status: 'Partly fixed on this branch', priority: 'priority-high',
    labels: ['bug', 'fix', 'priority-high', 'accessibility', 'ui/ux', 'shubham'],
    source: '02-fixes-applied.md §5 · 04-open-items.md §B1',
    summary:
      'The mega-menu panels could not be reached by keyboard at all, putting eleven pages out of reach. The '
      + 'media lightbox declared `role="dialog" aria-modal="true"` and implemented none of what that promises. '
      + 'Dark-theme status colours were inherited from the light theme and sat below WCAG AA.',
    why:
      'Hospitals and health systems procure against Section 508 and EN 301 549, so this is a purchasing '
      + 'blocker rather than polish. The menu failed because panels render as siblings of the bar and '
      + 'focusing the next trigger unmounted the previous panel before it could be reached.',
    scope: [
      'DONE — ArrowDown opens a panel and moves into it; Left/Right move between triggers; Escape returns focus',
      'DONE — `useDialog` hook giving the lightbox Escape, focus move, focus trap and focus return',
      'DONE — dark-theme `--ok`/`--warn`/`--crit` redefined; measured 3.81/4.12/3.14 → 8.3/7.4/5.9 on `--surface`',
      'DONE — the missing Careers `h1`, and the mobile menu button raised to 44×44',
      'DONE — the implanted-system SVG no longer `aria-hidden` while holding focusable children, and its parts are tappable',
      'TODO — route changes are silent to screen readers',
      'TODO — focusable controls still inside an `aria-hidden` SVG elsewhere in `EduFigures`',
      'TODO — locator-map markers are `role="button"` with no key handler',
      'TODO — the NaviNetics AI demo hides its controls below 1024px; the theme toggle is absent below 640px',
    ],
    files: ['src/components/Navbar.jsx', 'src/lib/dialog.js', 'src/pages/Media.jsx',
      'src/index.css', 'src/ui/EduFigures.jsx', 'src/pages/Careers.jsx'],
    ac: [
      'Every nav destination is reachable by keyboard alone',
      'The lightbox closes on Escape, traps focus, and returns focus to its opener',
      'No text/background pair used for status is below 4.5:1 in either theme',
      '`node tools/check-tap.mjs` passes — every interactive figure part is reachable by touch',
    ],
  },
  {
    n: 7, code: 'BUG-004', slug: 'two-pages-peg-the-main-thread',
    title: 'Partners and MAVEN hold the main thread at ~93% while the page is idle',
    type: 'Bug', status: 'Open — cause not yet proven', priority: 'priority-high',
    labels: ['bug', 'priority-high', 'performance', 'shubham'],
    source: '09-performance.md',
    summary:
      '`/company/partners` and `/products/maven-neuromodulation` spend ~93% of wall-clock inside long tasks '
      + 'with the page settled and the visitor doing nothing. Taps queue behind the thread, which is why the '
      + 'hamburger felt broken — the menu itself paints in 30–107ms.',
    why:
      'Two optimisations were made on the theory that drawing was the cost — batching 4,846 dot fills into '
      + '~100 colour buckets, and precomputing the graticule to remove ~5,300 trigonometric calls a frame. '
      + 'Both are strictly less work for an identical picture and **neither moved the number** (93.1% → 93.8%). '
      + 'The next step is therefore to prove the cause rather than guess a third time.',
    scope: [
      'DONE — measurement made trustworthy: the observer was being installed once per route, so later pages '
        + 'counted every long task six times and reported 13,314ms of blocking inside a 9,000ms window',
      'DONE — all six browser tools now close their browser; leaked instances were competing for the same cores',
      'DONE — `check-perf` reports a median of three runs with the spread shown',
      'DONE — the globe stops drawing off-screen and in background tabs, and is capped at 30fps',
      'TODO — instrument `place()` in `PartnerGlobe.jsx`, which writes style on every pin, marker and chip every frame',
      'TODO — profile MAVEN to the same depth; it has not been investigated',
      'TODO — a steady-state busy% regression gate in `check-perf`',
      'TODO — the entry chunk is ~22kB over Vite\'s 500kB warning',
    ],
    files: ['src/ui/PartnerGlobe.jsx', 'src/lib/globeScene.js', 'src/ui/MavenHero.jsx',
      'tools/check-perf.mjs', 'src/components/AnimatedRoutes.jsx'],
    ac: [
      'Steady-state busy under 20% on every route, measured by `node tools/check-perf.mjs`',
      'The cause is demonstrated by instrumentation before any further optimisation is attempted',
      'A regression gate fails the build if busy% climbs back',
    ],
  },
  {
    n: 8, code: 'FEAT-002', slug: 'discoverability-and-sharing',
    title: 'Per-route metadata, structured data and prerendering',
    type: 'Feature', status: 'Partly fixed on this branch', priority: 'priority-medium',
    labels: ['enhancement', 'priority-medium', 'seo', 'shubham'],
    source: '02-fixes-applied.md §4',
    summary:
      'The site is client-rendered with no prerendering, so a crawler or link unfurler that does not execute '
      + 'JavaScript saw one title and one description for all 21 routes, and every shared link rendered as a '
      + 'bare URL with no title, summary or image.',
    why:
      'The long-tail pages — publications, education — are the ones people link to, and a product page emailed '
      + 'to a surgeon is the most valuable link the company has. Neither worked.',
    scope: [
      'DONE — Open Graph, Twitter Card and canonical tags in `index.html` as the no-JavaScript floor',
      'DONE — Organization JSON-LD asserting only what is verifiable from the site',
      'DONE — `robots.txt` and a 16-route `sitemap.xml`',
      'DONE — `usePageMeta` extended to set canonical and OG per route for all 18 pages',
      'TODO — prerender the routes at build time; this is the remaining structural fix',
    ],
    files: ['index.html', 'src/lib/meta.js', 'public/robots.txt', 'public/sitemap.xml'],
    ac: [
      'A shared product link unfurls with a title, description and image',
      'Each route reports its own canonical URL',
      'Every route is independently indexable without executing JavaScript',
    ],
  },
  {
    n: 9, code: 'TASK-003', slug: 'verification-tooling',
    title: 'Automated checks for the failure classes that reached production',
    type: 'Task', status: 'Partly fixed on this branch', priority: 'priority-medium',
    labels: ['test', 'verification', 'priority-medium', 'infra', 'shubham'],
    source: '05-verification.md · 09-performance.md',
    summary:
      'Every fault in BUG-001 was invisible in dev and fatal in production, and the build passed throughout. '
      + 'These checks exist so that class of failure cannot ship twice.',
    why:
      'The existing route smoke check would not have caught the deploy break: it requested `/`, which is not '
      + 'the URL shape the site is served at. A check that does not exercise production geometry is not a check.',
    scope: [
      'DONE — `check-build` (404.html, base-prefixed assets, no root-absolute `public/` refs, robots/sitemap/OG/JSON-LD), gated in CI',
      'DONE — `check-routes` fixed to request the deployed base',
      'DONE — `check-mobile` across six real device profiles',
      'DONE — `check-layout` measuring edge, measure and rhythm at five widths',
      'DONE — `check-webkit` driving a real WebKit build rather than Chrome in an iPhone-shaped window',
      'DONE — `check-copy` reading rendered text and failing on editorial notes that reach the page',
      'DONE — `check-tap` using real touch events',
      'TODO — install Playwright\'s WebKit in CI so `check:webkit` can run there',
      'TODO — run `check:copy` in CI; `check-routes` still leaks a browser',
      'TODO — run `check-resize` to completion; verify the `rgb(from …)` fix on iOS 16.3 or below',
    ],
    files: ['tools/check-build.mjs', 'tools/check-routes.mjs', 'tools/check-mobile.mjs',
      'tools/check-layout.mjs', 'tools/check-webkit.mjs', 'tools/check-copy.mjs',
      'tools/check-tap.mjs', 'tools/check-perf.mjs', '.github/workflows/node.js.yml', 'package.json'],
    ac: [
      'Every failure class that has bitten once fails the build if reintroduced',
      '`check:build` runs in CI on every push',
      'The WebKit and copy checks are runnable in CI',
    ],
  },
];

const id = (t) => `SHB-${CONTEXT}-${String(t.n).padStart(3, '0')}`;
const file = (t) => `${id(t)}_${t.code}_${t.slug}.md`;

for (const t of T) {
  const body = `# ${id(t)} — ${t.code} ${t.title}

**Type:** ${t.type}
**Owner:** Shubham
**Author:** shubhvmhaske
**Status:** ${t.status}
**Source Document:** \`documentation/dev/shubham/website/${t.source.split(' ')[0]}\`
**PR Link:** _pending_
**Branch:** \`${BRANCH}\` → \`${BASE}\`

---

## Summary

${t.summary}

## Why this ticket exists

${t.why}

## Scope (implemented)

${t.scope.map((s) => `- ${s}`).join('\n')}

## Affected Files

${t.files.map((f) => `- \`${f}\``).join('\n')}

## Traceability

No \`REQ-*\` / \`RISK-*\` registry exists in this repository, so none is cited. The standard is
explicit that a broken trace is worse than none, and inventing IDs here would be exactly that.
This repository is the marketing website, not device software, so it carries no IEC 62304 software
safety class; regulatory exposure here is about published claims and is labelled \`FDA\` /
\`regulatory\` where it applies.

Supporting record: \`documentation/dev/shubham/website/\` — audit, fixes, layout, open items,
verification, copy policy, performance.

## Acceptance Criteria

${t.ac.map((a) => `- [ ] ${a}`).join('\n')}

## Suggested Labels

${t.labels.map((l) => `\`${l}\``).join(' · ')}
`;
  writeFileSync(`${DIR}/tickets/${file(t)}`, body);
}

const index = `# INDEX_${CONTEXT}

**Author:** shubhvmhaske
**Branch:** \`${BRANCH}\` → \`${BASE}\`
**Status:** ready to publish

Publication pack for the website repair and audit work. Format follows
\`documentation/dev/shubham/TICKET_PUBLICATION_FLOW.md\` in \`navinetics-ai-suite\`.

The drafting run produced 72 tickets, which is too many to run a project from and duplicated across
streams. They are consolidated here into nine and kept in full in [10-tickets.md](10-tickets.md);
[10-epics.md](10-epics.md) maps every one of the 72 onto its ticket, so nothing was dropped.

| Local ID | Published title | Type | Status | Priority |
|---|---|---|---|---|
${T.map((t) => `| \`${id(t)}\` | ${t.code} ${t.title} | ${t.type} | ${t.status} | ${t.priority.replace('priority-', '')} |`).join('\n')}

**Three of the nine are blocked on NaviNetics, not on engineering** — TASK-001 and TASK-002 hold
almost everything that cannot be closed by writing code.

## Publication rule

Never publish the local \`SHB-${CONTEXT}-NNN —\` prefix in the live issue title. Publish
\`<ISSUE-CODE> <title>\`, e.g. \`BUG-001 Deployed site rendered the 404 page and served no images\`.

## Supporting documents

| Document | What it holds |
|---|---|
| [01-audit.md](01-audit.md) | How the audit was run; 204 findings |
| [02-fixes-applied.md](02-fixes-applied.md) | Every change, with its reason |
| [03-layout-system.md](03-layout-system.md) | The layout engine, measured before and after |
| [04-open-items.md](04-open-items.md) | What is not done, split by who can close it |
| [05-verification.md](05-verification.md) | The check tools and what each catches |
| [06-copy-policy.md](06-copy-policy.md) | Internal notes must not reach the page |
| [07-scene-accuracy.md](07-scene-accuracy.md) | Animation quality; a rebuild tried and reverted |
| [08-existing-site.md](08-existing-site.md) | What navinetics.com already says |
| [09-performance.md](09-performance.md) | Measured performance, and how the measurement went wrong first |
| [10-epics.md](10-epics.md) · [10-tickets.md](10-tickets.md) | The 72 drafted tickets and their mapping |
`;
writeFileSync(`${DIR}/INDEX_${CONTEXT}.md`, index);

const prBody = `## Summary

The deployed site did not work. \`base\` was written as a bare segment, \`<Router>\` had no matching
\`basename\` so the home page matched no route and rendered the 404 component, GitHub Pages had no
\`404.html\` so every deep link and refresh died before the app booted, and 21 images referenced from
\`public/\` resolved against the server root. The build passed throughout, and every one of these is
invisible in dev.

That is fixed and gated in CI. Alongside it: six unsubstantiated claims are removed and the FDA
510(k) clearance navinetics.com already publishes is restored, the contact form now transmits
instead of discarding every message, the layout is unified onto one measure and one rhythm, and
three accessibility defects are closed — one of which put eleven pages out of reach of a keyboard.

Two pages still hold the main thread at ~93% while idle. That is **not** fixed, and is stated as
such below rather than left for a reviewer to discover.

## Linked issues

To be filled with real numbers after issue publication:

${T.map((t) => `- \`${t.code}\` ${t.title} — _pending_`).join('\n')}

## What changed

### Deploy — \`BUG-001\`
\`base: '/navinetics-web-v2/'\` · \`<Router basename={import.meta.env.BASE_URL}>\` · a Vite
\`closeBundle\` plugin emitting \`404.html\` and \`.nojekyll\` · an \`asset()\` helper resolving 21
\`public/\` references · two dead internal routes repaired and redirected.

### Claims and regulatory — \`TASK-001\`
Removed: "unparalleled precision", a comparative "0.6 mm deviation" benchmark the codebase itself
recorded as held back pending sign-off, "Superior radiolucency", "Lightweight and safe". Restored:
\`FDA 510(k) cleared\` on the D1 page, above the fold, as a typographic status line rather than a
badge — 21 CFR 807.97 makes an approval-flavoured seal misbranding. Withdrawn: an invented
"not for use in human subjects" line on MAVEN which navinetics.com may contradict. Kept at
NaviNetics' direction: "safe, effective and high-quality", which is live on their site.

### Conversion — \`BUG-002\`
The contact form validated input and then told the visitor nothing was sent. It now posts to
\`VITE_CONTACT_ENDPOINT\`, or hands the message to the mail client fully composed, and carries a
product-complaint route.

### Layout — \`FEAT-001\`
One \`.nn-frame\` measure stepping at 1920 and 2560; \`Section\` rhythm reduced so the gap between
sections is 192px rather than 320px. Sections sharing one left edge at 1440px went from 27 of 68 to
68 of ~70. The Technology mega-panel had been showing the same photographs as the Products panel.

### Accessibility — \`BUG-003\`
Mega-menu panels were unreachable by keyboard, putting eleven pages out of reach. The media lightbox
declared \`aria-modal\` and implemented none of it. Dark-theme status colours were inherited from the
light theme at 3.81 / 4.12 / 3.14:1. The implanted-system figure said "Hover or tap a part" and
tapping did nothing — its parts were 2.4px strokes.

### Discoverability — \`FEAT-002\`
Open Graph, Twitter Card, canonical, Organization JSON-LD, \`robots.txt\`, \`sitemap.xml\`, and
per-route canonical/OG for all 18 pages.

### Performance — \`BUG-004\`, not fixed
\`/company/partners\` and \`/products/maven-neuromodulation\` sit at ~93% busy while idle. Two
optimisations were made on the theory that drawing was the cost and neither moved the number, so the
cause is stated as unproven and the next step is instrumentation. The measurement harness itself was
wrong first — it counted long tasks up to six times over and reported 13,314ms of blocking inside a
9,000ms window — and is fixed.

## Validation

| Check | Result |
|---|---|
| \`npm run lint\` | clean in \`src/\` (one pre-existing fast-refresh warning) |
| \`npm run build\` | clean; entry chunk 552 → 522 kB |
| \`npm run check:build\` | 10/10 — runs in CI |
| \`node tools/check-routes.mjs\` | 17/17 routes render at the deployed URL shape |
| \`node tools/check-mobile.mjs\` | 6 devices × 16 routes, no panning, no console errors |
| \`node tools/check-webkit.mjs\` | WebKit 26.5, 16 routes × desktop and iPhone, all clean |
| \`node tools/check-copy.mjs\` | 17/17 — no editorial notes reaching the page |
| \`node tools/check-tap.mjs\` | every interactive figure part reachable by touch |
| \`node tools/check-layout.mjs\` | one content edge per viewport width |

## Documentation

\`documentation/dev/shubham/website/\` — audit method and findings, every fix with its reason, the
layout system measured before and after, open items split by who can close them, the check tools,
the copy policy, a scene rebuild that was tried and reverted, a comparison against navinetics.com,
and the performance record including how the measurement went wrong before it was useful.

## Suggested QA

1. Load a deep link directly — \`/products/d1-stereotactic-frame\` — and refresh it.
2. Tab to **Company** in the nav and press ArrowDown; check focus enters the panel and Escape returns it.
3. Open an image on \`/resources/media\`, press Escape, and confirm focus returns to the tile.
4. Switch to dark theme and submit the contact form empty; check the error text is legible.
5. On a phone, open \`/resources/education\` and tap each part of the implanted-system figure.
6. Scroll \`/company/who-we-are\` and confirm the left edge does not step in and out.
7. Drag the window between a laptop panel and an ultrawide.
`;
writeFileSync(`${DIR}/PR_BODY.md`, prBody);

console.log(`${DIR}/`);
console.log(`  INDEX_${CONTEXT}.md`);
console.log(`  PR_BODY.md`);
for (const t of T) console.log(`  tickets/${file(t)}`);
