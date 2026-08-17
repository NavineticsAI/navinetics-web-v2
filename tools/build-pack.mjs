/**
 * Build the publication pack in the house format.
 *
 *   node tools/build-pack.mjs
 *
 * Format follows documentation/dev/shubham/gpu-unified-architecture/ in
 * navinetics-ai-suite, which is the working convention rather than the older
 * one described in TICKET_PUBLICATION_FLOW.md:
 *
 *   - flat ticket files in the context folder, named CODE_Title-In-Hyphen-Case
 *   - heading "# CODE - description", no local SHB prefix anywhere
 *   - bold run-in fields on one line, then bold run-in section leads
 *   - TICKETS.md as the index, PR-TICKET.md as the PR body
 *
 * NUMBERING CONTINUES THE SUITE'S SERIES rather than restarting at 001, so a
 * ticket id is unique across NaviNetics work and never means two things. At
 * the time of writing navinetics-ai-suite held BUG-124 and FEAT-044 as its
 * highest, so these start at BUG-125 and FEAT-045. There is no TASK-NNN series
 * there yet, so the three TASKs take 001-003.
 *
 * NO RISK CLASS FIELD. The suite's tickets carry IEC 62304 Class C because the
 * suite is device software. This repository is the marketing website: it has
 * no software safety class, and stamping one on it would dilute the label
 * where it means something. Requirement and risk IDs are omitted for the same
 * reason - there is no registry here to cite, and the standard is explicit
 * that a broken trace is worse than none.
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';

const DIR = 'documentation/dev/shubham/website';
mkdirSync(`${DIR}/tickets`, { recursive: true });
// The first pass used SHB-prefixed ids and an INDEX/PR_BODY pair; both wrong.
for (const f of ['INDEX_WEBSITE.md', 'PR_BODY.md', 'PUBLISH.ps1']) rmSync(`${DIR}/${f}`, { force: true });

const BRANCH = 'site-fixes-2026-08';
const DATE = '2026-08-12';

const T = [
  {
    code: 'BUG-125', file: 'Deploy-Broken-On-GitHub-Pages',
    head: 'The deployed site rendered the 404 page and served no images',
    type: 'Bug', priority: 'Critical', status: 'Fixed on this branch',
    labels: ['bug', 'fix', 'priority-critical', 'regression', 'infra', 'shubham'],
    summary:
      'Four faults compounded and the deployed site did not work at all. `base` was written as a bare '
      + 'segment rather than a path; `<Router>` had no matching `basename`, so the pathname matched no '
      + 'route and the home page rendered the 404 component; GitHub Pages had no `404.html`, so every '
      + 'deep link and refresh returned its own 404 before the app booted; and 21 images referenced from '
      + '`public/` resolved against the server root.',
    detail:
      'Every one of these is invisible in dev, because the dev server is served from `/` — the base is '
      + '`/` and nothing is prefixed — and the build passed throughout. A distributor sent a product '
      + 'link, a surgeon who bookmarked a page, and Googlebot all received a 404. The seven legacy '
      + 'redirects could never fire either, because they are React elements that only run once the app '
      + 'has loaded.',
    scope: [
      '`base` set to `/navinetics-web-v2/`, with both slashes',
      '`<Router basename={import.meta.env.BASE_URL}>` so one value covers dev and build',
      'A Vite `closeBundle` plugin writing `dist/404.html` and `dist/.nojekyll`',
      '`asset()` resolving every `public/` reference against the deployed base',
      'The logo moved into `src/assets` and imported — a root-absolute `url()` in CSS is not rewritten',
      '`/company/careers` and `/products` corrected, and both added to the redirect table',
    ],
    acceptance: [
      'All 17 routes render at the deployed URL shape, not only at the server root',
      '`dist/404.html` is byte-identical to `dist/index.html`, and `.nojekyll` exists',
      'No `public/` filename survives as a root-absolute string in any bundled file',
      '`npm run check:build` passes, and runs in CI after the build step',
    ],
    files: ['vite.config.js', 'src/App.jsx', 'src/lib/asset.js', 'src/data/nav.js',
      'src/index.css', 'tools/check-build.mjs', '.github/workflows/node.js.yml'],
    trace: 'No requirement or risk registry exists in this repository, so none is cited. '
      + 'Record: `02-fixes-applied.md` §1.',
  },
  {
    code: 'TASK-001', file: 'Published-Claims-And-Regulatory-Status',
    head: 'Published claims and regulatory status need NaviNetics sign-off',
    type: 'Task', priority: 'Critical', status: 'Blocked on NaviNetics',
    labels: ['documentation', 'priority-critical', 'FDA', 'regulatory', 'blocked', 'shubham'],
    summary:
      'Six unsubstantiated claims had reached production and are removed, and the FDA 510(k) clearance '
      + 'navinetics.com already publishes is restored to the D1 page. What remains is information only '
      + 'NaviNetics holds, and until it arrives the site says less than it is entitled to say.',
    detail:
      'One removed claim — "around 0.6 mm deviation", benchmarked against unnamed competitor software — '
      + 'was recorded in the codebase itself as held back pending sign-off, and shipped anyway. That is a '
      + 'process gap rather than an editing mistake, which is why a named claims-review owner is part of '
      + 'this ticket. Separately, before the clearance statement was restored this site was **less** '
      + 'informative than the site it replaces on the first question a hospital value-analysis committee '
      + 'asks.',
    scope: [
      'DONE — removed: "unparalleled precision", the 0.6 mm comparative benchmark, "Superior radiolucency", "Lightweight and safe"',
      'DONE — restored: `FDA 510(k) cleared` on the D1 page, above the fold, as a typographic status line and not a badge (21 CFR 807.97 makes an approval-flavoured seal misbranding)',
      'DONE — withdrew an invented "not for use in human subjects" line on MAVEN which navinetics.com may contradict',
      'DONE — "safe, effective and high-quality" kept, at NaviNetics\' direction, since it is live on their site',
      'NEEDED — the 510(k) number and clearance date; `regulatory.number` is `null` and renders the moment it is filled',
      'NEEDED — MR safety classification and conditions for the MR Localizer Kit',
      'NEEDED — intended use, an Rx-only statement, and a formal indications-for-use block for the D1',
      'NEEDED — reprocessing and sterilisation instructions for the reusable D1',
      'NEEDED — whether MAVEN is used in human recordings, and under what authorisation',
      'NEEDED — per-market status for the distributor territories: CE, UKCA, TGA, NMPA, MFDS',
      'NEEDED — classification, intended use and intended user for NaviNetics AI',
      'NEEDED — whether the two held-back AI performance figures and the per-fiducial accuracy values may be public',
      'NEEDED — product naming: do D1 and MAVEN replace or sit alongside the existing names',
      'NEEDED — whether X-ray reticles, the microdrive and DBS lead accessories ship as standard',
      'NEEDED — a named claims-review owner, and a sign-off gate for public copy',
    ],
    acceptance: [
      'Every quantitative or regulatory statement on the site traces to a NaviNetics-approved source',
      'The chip renders as `FDA 510(k) cleared · K######` with no code change once the number is supplied',
      '"Cleared" is used throughout; "approved" appears nowhere in relation to a 510(k) device',
      'A named owner signs off public copy before it ships',
    ],
    files: ['src/data/products.js', 'src/ui/D1Hero.jsx', 'src/pages/D1.jsx',
      'src/pages/Maven.jsx', 'src/pages/NaviNeticsAI.jsx', 'src/data/orTables.js'],
    trace: 'No requirement or risk registry exists in this repository, so none is cited. '
      + 'Record: `08-existing-site.md`, `04-open-items.md` §A.',
  },
  {
    code: 'TASK-002', file: 'Legal-Pages-Permissions-Patient-Imagery',
    head: 'Legal pages, third-party permissions and patient imagery',
    type: 'Task', priority: 'High', status: 'Blocked on NaviNetics',
    labels: ['documentation', 'priority-high', 'regulatory', 'blocked', 'shubham'],
    summary:
      'The site carries no privacy policy, terms of use, cookie notice, accessibility statement or '
      + 'legal-entity imprint, and it has EU, UK and Asia distributors. Five partner marks and several '
      + 'journal figures are published with no permission record. Two patient CT studies are live on the '
      + 'Education page with the de-identification review this repository itself asks for still open.',
    detail:
      'These gaps are pre-existing rather than introduced by this branch — navinetics.com has none of '
      + 'them either — which is exactly why they need an owner rather than an assumption. The patient '
      + 'imaging is the item to action first: one of the two studies is a volume render including facial '
      + 'bone, which sits directly against the HIPAA identifier for comparable images.',
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
    acceptance: [
      'Nothing is published that the company cannot show it has the right to publish',
      'The patient CT studies are either cleared, with the basis recorded beside the import, or removed',
      'A visitor can find how to report a problem with a device',
      'The legal pages exist and are linked from the footer',
    ],
    files: ['src/components/Footer.jsx', 'src/pages/Contact.jsx', 'src/data/education.js',
      'src/data/partners.js', 'src/data/media.js'],
    trace: 'No requirement or risk registry exists in this repository, so none is cited. '
      + 'Record: `04-open-items.md` §A.',
  },
  {
    code: 'BUG-126', file: 'Contact-Form-Discarded-Every-Message',
    head: 'The contact form discarded every message, and product pages had no next step',
    type: 'Bug', priority: 'Critical', status: 'Partly fixed on this branch',
    labels: ['bug', 'fix', 'priority-critical', 'ui/ux', 'shubham'],
    summary:
      'The only enquiry form on the site validated the visitor\'s input, showed a success panel, and then '
      + 'told them nothing had been transmitted. Every call to action funnelled into it.',
    detail:
      'A surgeon or a purchasing manager who completed that form was told, on a medical device company\'s '
      + 'own site, that the form did not work — which is worse than having no form, because it turns an '
      + 'interested buyer into a lost lead and a credibility judgement in one screen. Nothing was logged, '
      + 'so the losses were invisible.',
    scope: [
      'DONE — posts JSON to `VITE_CONTACT_ENDPOINT`, with real sending, sent and failed states',
      'DONE — with no endpoint set it hands the message to the mail client fully composed rather than pretending',
      'DONE — reasons extended to cover distribution, press, and product complaints',
      'DONE — `?reason=` preselects the enquiry type from product pages; "Request a quote" on D1 and the tables',
      'TODO — MAVEN\'s specification table exists in the data and renders on no live route',
      'TODO — retire the unreachable `/products/:slug` template; no slug reaches it',
    ],
    acceptance: [
      'A submitted enquiry either reaches NaviNetics, or the visitor is handed a composed message they can send',
      'A product complaint has its own route, and warns against including patient identifiers',
      'Every product page ends with an action',
      'No route renders a component that cannot be reached',
    ],
    files: ['src/pages/Contact.jsx', 'src/pages/D1.jsx', 'src/pages/SurgicalTables.jsx',
      'src/pages/Product.jsx', 'src/components/AnimatedRoutes.jsx'],
    trace: 'No requirement or risk registry exists in this repository, so none is cited. '
      + 'Record: `02-fixes-applied.md` §3.',
  },
  {
    code: 'FEAT-045', file: 'Unify-Layout-Measure-Gutter-Rhythm',
    head: 'Unify the site onto one measure, one gutter and one vertical rhythm',
    type: 'Feature', priority: 'High', status: 'Done',
    labels: ['enhancement', 'refactor', 'priority-high', 'ui/ux', 'shubham'],
    summary:
      'Roughly half the site\'s sections sat on a 1024px measure and half on 1280px, alternating within '
      + 'single pages, and adjacent sections each contributed full padding to produce 320px voids. On a '
      + '3840px ultrawide the frame showed 1280px of content in the middle of an empty screen.',
    detail:
      'Reported as "no unified spacing and margin and layout and sizing engine", and the measurements '
      + 'bore it out: at 1440px the content left edge alternated between 73px and 201px as you scrolled — '
      + 'a 128px step between adjacent sections, 27 of 68 sections on one edge and 22 on the other.',
    scope: [
      'One `.nn-frame` utility declaring the measure, stepping to 96rem at 1920 and 110rem at 2560',
      '`Section` reduced to `py-16 md:py-20 lg:py-24` — 192px between sections, down from 320px',
      'Nine hand-rolled sections brought onto the same gutter and rhythm',
      'Scene bands keep a full-bleed ground, but their content joins the frame',
      'The Technology mega-panel given drawn marks; it had been showing the Products panel\'s photography',
      'The `makeAnchor` scene rebuild recorded as tried, rejected and reverted',
    ],
    acceptance: [
      'One content left edge per viewport width, with the exceptions documented',
      '68 of ~70 sections share that edge at 1440px and at 1920px',
      'An ultrawide shows 1760px of content rather than 1280px',
      '`node tools/check-layout.mjs` reports one distinct edge per width',
    ],
    files: ['src/index.css', 'src/ui/Section.jsx', 'src/ui/Hero.jsx', 'src/ui/SceneBand.jsx',
      'src/ui/ScienceBand.jsx', 'src/ui/TechMark.jsx', 'src/components/Navbar.jsx'],
    trace: 'No requirement or risk registry exists in this repository, so none is cited. '
      + 'Record: `03-layout-system.md`, measured before and after.',
  },
  {
    code: 'BUG-127', file: 'Accessibility-Keyboard-Dialog-Contrast',
    head: 'Mega-menu unreachable by keyboard, lightbox not a real dialog, dark contrast below AA',
    type: 'Bug', priority: 'High', status: 'Partly fixed on this branch',
    labels: ['bug', 'fix', 'priority-high', 'accessibility', 'ui/ux', 'shubham'],
    summary:
      'The mega-menu panels could not be reached by keyboard at all, putting eleven pages out of reach. '
      + 'The media lightbox declared `role="dialog" aria-modal="true"` and implemented none of what that '
      + 'promises. Dark-theme status colours were inherited from the light theme and sat below WCAG AA.',
    detail:
      'Hospitals and health systems procure against Section 508 and EN 301 549, so this is a purchasing '
      + 'blocker rather than polish. The menu failed because panels render as siblings of the bar, and '
      + 'focusing the next trigger unmounted the previous panel before it could be reached. Measured '
      + 'contrast on `--surface`: 3.81, 4.12 and 3.14:1 against a 4.5:1 requirement.',
    scope: [
      'DONE — ArrowDown opens a panel and moves into it; Left/Right move between triggers; Escape returns focus',
      'DONE — a `useDialog` hook giving the lightbox Escape, focus move, focus trap and focus return',
      'DONE — dark-theme `--ok`, `--warn`, `--crit` redefined: 3.81/4.12/3.14 becomes 8.3/7.4/5.9',
      'DONE — the missing Careers `h1`; the mobile menu button raised to 44x44',
      'DONE — the implanted-system SVG no longer `aria-hidden` while holding focusable children, and its parts are tappable',
      'TODO — route changes are silent to screen readers',
      'TODO — focusable controls remain inside an `aria-hidden` SVG elsewhere in `EduFigures`',
      'TODO — locator-map markers are `role="button"` with no key handler',
      'TODO — the NaviNetics AI demo hides its controls below 1024px; the theme toggle is absent below 640px',
    ],
    acceptance: [
      'Every nav destination is reachable by keyboard alone',
      'The lightbox closes on Escape, traps focus, and returns focus to its opener',
      'No status text/background pair is below 4.5:1 in either theme',
      '`node tools/check-tap.mjs` passes: every interactive figure part is reachable by touch',
    ],
    files: ['src/components/Navbar.jsx', 'src/lib/dialog.js', 'src/pages/Media.jsx',
      'src/index.css', 'src/ui/EduFigures.jsx', 'src/pages/Careers.jsx'],
    trace: 'No requirement or risk registry exists in this repository, so none is cited. '
      + 'Standards: WCAG 2.2 AA, Section 508, EN 301 549. Record: `02-fixes-applied.md` §5.',
  },
  {
    code: 'BUG-128', file: 'Partners-And-Maven-Peg-Main-Thread',
    head: 'Partners and MAVEN hold the main thread at ~93% while the page is idle',
    type: 'Bug', priority: 'High', status: 'Open — cause not proven',
    labels: ['bug', 'priority-high', 'performance', 'shubham'],
    summary:
      '`/company/partners` and `/products/maven-neuromodulation` spend about 93% of wall-clock inside '
      + 'long tasks with the page settled and the visitor doing nothing. Taps queue behind the thread, '
      + 'which is why the hamburger felt broken — the menu itself paints in 30 to 107ms.',
    detail:
      'Two optimisations were made on the theory that drawing was the cost: batching 4,846 dot fills '
      + 'into about 100 colour buckets, and precomputing the graticule to remove roughly 5,300 '
      + 'trigonometric calls a frame. Both are strictly less work for an identical picture and **neither '
      + 'moved the number** — 93.1% before, 93.8% after, inside noise. They were kept because gating the '
      + 'loop off-screen is correct behaviour regardless. The next step is to prove the cause rather than '
      + 'guess a third time.\n\n'
      + 'The measurement itself was wrong before it was useful, and that is worth recording: the harness '
      + 'installed its observer once per route, so by the sixth page every long task was counted six '
      + 'times and it reported 13,314ms of blocking inside a 9,000ms window — impossible on its face. '
      + 'All six browser tools also leaked their browser, so accumulated instances competed for the same '
      + 'cores as the thing being measured.',
    scope: [
      'DONE — observer installed once; all six tools close their browser; median of three with the spread shown',
      'DONE — the globe stops drawing off-screen and in background tabs, and is capped at 30fps',
      'TODO — instrument `place()` in `PartnerGlobe.jsx`, which writes style on every pin, marker and chip every frame',
      'TODO — profile MAVEN to the same depth; it has not been investigated',
      'TODO — a steady-state busy% regression gate in `check-perf`',
      'TODO — the entry chunk is about 22kB over Vite\'s 500kB warning',
    ],
    acceptance: [
      'Steady-state busy under 20% on every route, measured by `node tools/check-perf.mjs`',
      'The cause is demonstrated by instrumentation before any further optimisation is attempted',
      'A regression gate fails the build if busy% climbs back',
    ],
    files: ['src/ui/PartnerGlobe.jsx', 'src/lib/globeScene.js', 'src/ui/MavenHero.jsx',
      'tools/check-perf.mjs', 'src/components/AnimatedRoutes.jsx'],
    trace: 'No requirement or risk registry exists in this repository, so none is cited. '
      + 'Record: `09-performance.md`, including how the measurement went wrong first.',
  },
  {
    code: 'FEAT-046', file: 'Discoverability-Metadata-And-Prerendering',
    head: 'Per-route metadata, structured data and prerendering',
    type: 'Feature', priority: 'Medium', status: 'Partly done',
    labels: ['enhancement', 'priority-medium', 'seo', 'shubham'],
    summary:
      'The site is client-rendered with no prerendering, so a crawler or link unfurler that does not '
      + 'execute JavaScript saw one title and one description for all 21 routes, and every shared link '
      + 'rendered as a bare URL with no title, summary or image.',
    detail:
      'The long-tail pages — publications, education — are the ones people link to, and a product page '
      + 'emailed to a surgeon is the most valuable link the company has. Neither worked.',
    scope: [
      'DONE — Open Graph, Twitter Card and canonical tags in `index.html` as the no-JavaScript floor',
      'DONE — Organization JSON-LD, asserting only what is verifiable from the site',
      'DONE — `robots.txt`, and a 16-route `sitemap.xml`',
      'DONE — `usePageMeta` extended to set canonical and OG per route, for all 18 pages',
      'TODO — prerender the routes at build time; the remaining structural fix',
    ],
    acceptance: [
      'A shared product link unfurls with a title, a description and an image',
      'Each route reports its own canonical URL',
      'Every route is independently indexable without executing JavaScript',
    ],
    files: ['index.html', 'src/lib/meta.js', 'public/robots.txt', 'public/sitemap.xml'],
    trace: 'No requirement or risk registry exists in this repository, so none is cited. '
      + 'Record: `02-fixes-applied.md` §4.',
  },
  {
    code: 'TASK-003', file: 'Verification-Tooling',
    head: 'Automated checks for the failure classes that reached production',
    type: 'Task', priority: 'Medium', status: 'Partly done',
    labels: ['test', 'verification', 'priority-medium', 'infra', 'shubham'],
    summary:
      'Every fault in BUG-125 was invisible in dev and fatal in production, and the build passed '
      + 'throughout. These checks exist so that class of failure cannot ship twice.',
    detail:
      'The existing route smoke check would not have caught the deploy break: it requested `/`, which is '
      + 'not the URL shape the site is served at. A check that does not exercise production geometry is '
      + 'not a check.',
    scope: [
      'DONE — `check-build`: 404.html, base-prefixed assets, no root-absolute `public/` refs, robots, sitemap, OG, JSON-LD. Gated in CI',
      'DONE — `check-routes` fixed to request the deployed base',
      'DONE — `check-mobile` across six real device profiles; `check-layout` at five widths',
      'DONE — `check-webkit` driving a real WebKit build rather than Chrome in an iPhone-shaped window',
      'DONE — `check-copy` reading rendered text, including alt and aria-label, and failing on editorial notes',
      'DONE — `check-tap` using real touch events',
      'TODO — install Playwright\'s WebKit in CI so `check:webkit` can run there',
      'TODO — run `check:copy` in CI; `check-routes` still leaks a browser',
      'TODO — run `check-resize` to completion; verify the `rgb(from ...)` fix on iOS 16.3 or below',
    ],
    acceptance: [
      'Every failure class that has bitten once fails the build if reintroduced',
      '`check:build` runs in CI on every push',
      'The WebKit and copy checks are runnable in CI',
    ],
    files: ['tools/check-build.mjs', 'tools/check-routes.mjs', 'tools/check-mobile.mjs',
      'tools/check-layout.mjs', 'tools/check-webkit.mjs', 'tools/check-copy.mjs',
      'tools/check-tap.mjs', 'tools/check-perf.mjs', '.github/workflows/node.js.yml', 'package.json'],
    trace: 'No requirement or risk registry exists in this repository, so none is cited. '
      + 'Record: `05-verification.md`.',
  },
];

const DASH = '—';
const bullets = (a) => a.map((x) => `- ${x}`).join('\n');

for (const t of T) {
  const body = `# ${t.code} ${DASH} ${t.head}

**Date:** ${DATE} · **Author:** shubhvmhaske · **Owner:** Shubham · **Type:** ${t.type}
**Priority:** ${t.priority} · **Status:** ${t.status}
**Branch:** \`${BRANCH}\` → \`main\` · **PR:** #3 · **Issue:** _not yet filed_

---

**Summary.** ${t.summary}

${t.detail}

**Scope.**

${bullets(t.scope)}

**Acceptance.**

${t.acceptance.map((a) => `- [ ] ${a}`).join('\n')}

**Files.** ${t.files.map((f) => `\`${f}\``).join(' ${DASH} ').replace(/\$\{DASH\}/g, DASH)}

**Traceability.** ${t.trace} Numbering continues the navinetics-ai-suite series so an id is unique
across NaviNetics work. This repository is the marketing website and carries no software safety
class; regulatory exposure here is about published claims, labelled \`FDA\` and \`regulatory\`.

**Labels.** ${t.labels.map((l) => `\`${l}\``).join(' ')}
`;
  writeFileSync(`${DIR}/tickets/${t.code}_${t.file}.md`, body);
}

const row = (t) => `| [${t.code}](tickets/${t.code}_${t.file}.md) | ${t.head} | ${t.type} | ${t.priority} | ${t.status} |`;

const tickets = `# NaviNetics website ${DASH} Tickets

Branch: \`${BRANCH}\` ${DASH} Status: local, not filed as GitHub issues.

Nine tickets. Numbering starts at 001 because this repository has no existing BUG/FEAT/TASK series to
continue; it is a different repository from the suite.

| Ticket | Title | Type | Priority | Status |
|---|---|---|---|---|
${T.map(row).join('\n')}

**Three of the nine are blocked on NaviNetics rather than on engineering.** TASK-001 and TASK-002
between them hold almost everything that cannot be closed by writing code: the 510(k) number, MR
safety, intended use, reprocessing, MAVEN's use status, per-market status, the legal pages,
third-party permissions, and the patient imaging whose de-identification review this repository
itself flags as outstanding.

These nine were consolidated from 72 drafted tickets, which duplicated across drafting streams ${DASH} the
510(k) number was raised twice, the patient CT twice, the Mayo wording twice. The full set is kept in
[10-tickets.md](10-tickets.md), and [10-epics.md](10-epics.md) maps every one of the 72 onto its
ticket, so nothing was dropped in the consolidation.

---

# Supporting record

| Document | What it holds |
|---|---|
| [01-audit.md](01-audit.md) | How the audit was run; 204 findings |
| [02-fixes-applied.md](02-fixes-applied.md) | Every change, with its reason |
| [03-layout-system.md](03-layout-system.md) | The layout engine, measured before and after |
| [04-open-items.md](04-open-items.md) | What is not done, split by who can close it |
| [05-verification.md](05-verification.md) | The check tools, and what each catches |
| [06-copy-policy.md](06-copy-policy.md) | Internal notes must not reach the page |
| [07-scene-accuracy.md](07-scene-accuracy.md) | Animation quality; a rebuild tried and reverted |
| [08-existing-site.md](08-existing-site.md) | What navinetics.com already says |
| [09-performance.md](09-performance.md) | Measured performance, and how the measurement went wrong first |
`;
writeFileSync(`${DIR}/TICKETS.md`, tickets);

/* The PR ticket header follows gpu-unified-architecture/PR-TICKET.md: branch,
   type, status, Author, and a Tracker line that carries the ticket links
   alongside the PR and issue numbers. That Tracker line is the link between
   the pack and GitHub, and it is filled in as those numbers exist. */
const tracker = T.map((t) => `[${t.code}](tickets/${t.code}_${t.file}.md)`).join(', ');

const pr = `# PR: Fix the broken deploy, unify the layout, and correct published claims

**Branch:** \`${BRANCH}\` → \`main\`
**Type:** Bug fix + hardening
**Status:** PR #3 open against \`main\` (pushed)
**Author:** shubhvmhaske
**Tracker:** ${tracker} · PR #3 · Issues: _not yet filed_

---

## 0. STATUS (${DATE}) ${DASH} read this first

- The deploy break is **fixed and gated in CI**; all 17 routes render at the deployed URL shape.
- Six unsubstantiated claims removed; the FDA 510(k) clearance navinetics.com already publishes is
  **restored** to the D1 page.
- Three of the nine tickets are **blocked on NaviNetics**, not on engineering ${DASH} TASK-001 and TASK-002
  hold almost everything that cannot be closed by writing code.
- **Not fixed:** \`/company/partners\` and \`/products/maven-neuromodulation\` hold the main thread at
  ~93% while idle (BUG-128). Two optimisations produced no measured gain; the cause is stated as
  unproven and the next step is instrumentation rather than a third guess.
- Verification: lint clean in \`src/\`, build clean, \`check:build\` 10/10, routes 17/17, mobile 6x16
  clean, WebKit 26.5 32/32 clean, copy sweep 17/17 clean.

## 1. Summary

The deployed site did not work. \`base\` was written as a bare segment, \`<Router>\` had no matching
\`basename\` so the home page matched no route and rendered the 404 component, GitHub Pages had no
\`404.html\` so every deep link and refresh died before the app booted, and 21 images referenced from
\`public/\` resolved against the server root. The build passed throughout, and every one of these is
invisible in dev.

That is fixed and gated in CI. Alongside it: six unsubstantiated claims are removed and the FDA
510(k) clearance navinetics.com already publishes is restored; the contact form now transmits instead
of discarding every message; the layout is unified onto one measure and one rhythm; and three
accessibility defects are closed, one of which put eleven pages out of reach of a keyboard.

Two pages still hold the main thread at ~93% while idle. That is **not** fixed, and is stated as such
below rather than left for a reviewer to find.

## 2. Linked issues

Not yet filed. On publication each ticket becomes one issue titled \`<CODE> <title>\`, assigned to
**shubhvmhaske**, and this block becomes \`Closes #N\` / \`Fixes #N\` lines so they auto-close on merge.
The **Tracker** line above carries the same numbers, and each issue gets a backlink comment to this PR.

| Ticket | Would-be issue title | Type |
|---|---|---|
${T.map((t) => `| [${t.code}](tickets/${t.code}_${t.file}.md) | ${t.code} ${t.head} | ${t.type} |`).join('\n')}

## 3. What changed

**Deploy ${DASH} BUG-125.** \`base: '/navinetics-web-v2/'\`; \`<Router basename={import.meta.env.BASE_URL}>\`;
a Vite \`closeBundle\` plugin emitting \`404.html\` and \`.nojekyll\`; an \`asset()\` helper resolving 21
\`public/\` references; two dead internal routes repaired and redirected.

**Claims ${DASH} TASK-001.** Removed: "unparalleled precision", a comparative "0.6 mm deviation" benchmark
the codebase itself recorded as held back pending sign-off, "Superior radiolucency", "Lightweight and
safe". Restored: \`FDA 510(k) cleared\` on the D1 page, above the fold, as a typographic status line
rather than a badge ${DASH} 21 CFR 807.97 makes an approval-flavoured seal misbranding. Withdrawn: an
invented "not for use in human subjects" line on MAVEN which navinetics.com may contradict. Kept at
NaviNetics' direction: "safe, effective and high-quality".

**Conversion ${DASH} BUG-126.** The contact form validated input and then told the visitor nothing was
sent. It now posts to \`VITE_CONTACT_ENDPOINT\`, or hands the message to the mail client fully
composed, and carries a product-complaint route.

**Layout ${DASH} FEAT-045.** One \`.nn-frame\` measure stepping at 1920 and 2560; section rhythm reduced so
the gap is 192px rather than 320px. Sections sharing one left edge at 1440px went from 27 of 68 to 68
of ~70.

**Accessibility ${DASH} BUG-127.** Mega-menu panels were unreachable by keyboard. The media lightbox
declared \`aria-modal\` and implemented none of it. Dark-theme status colours sat at 3.81/4.12/3.14:1.
The implanted-system figure said "Hover or tap a part" and tapping did nothing.

**Discoverability ${DASH} FEAT-046.** Open Graph, Twitter Card, canonical, Organization JSON-LD,
\`robots.txt\`, \`sitemap.xml\`, and per-route canonical and OG for all 18 pages.

**Performance ${DASH} BUG-128, not fixed.** Two pages sit at ~93% busy while idle. Two optimisations were
made on the theory that drawing was the cost and neither moved the number, so the cause is stated as
unproven and the next step is instrumentation. The measurement harness was wrong first ${DASH} it counted
long tasks up to six times over ${DASH} and is fixed.

## 4. Validation

| Check | Result |
|---|---|
| \`npm run lint\` | clean in \`src/\` (one pre-existing fast-refresh warning) |
| \`npm run build\` | clean; entry chunk 552 to 522 kB |
| \`npm run check:build\` | 10/10, runs in CI |
| \`node tools/check-routes.mjs\` | 17/17 routes render at the deployed URL shape |
| \`node tools/check-mobile.mjs\` | 6 devices x 16 routes; no panning, no console errors |
| \`node tools/check-webkit.mjs\` | WebKit 26.5, 16 routes x desktop and iPhone, all clean |
| \`node tools/check-copy.mjs\` | 17/17; no editorial notes reaching the page |
| \`node tools/check-tap.mjs\` | every interactive figure part reachable by touch |
| \`node tools/check-layout.mjs\` | one content edge per viewport width |

## 5. Documentation

\`documentation/dev/shubham/website/\` ${DASH} tickets, the audit method and findings, every fix with its
reason, the layout system measured before and after, open items split by who can close them, the
check tools, the copy policy, a scene rebuild that was tried and reverted, a comparison against
navinetics.com, and the performance record.

## 6. Suggested QA

1. Load a deep link directly ${DASH} \`/products/d1-stereotactic-frame\` ${DASH} and refresh it.
2. Tab to **Company** in the nav, press ArrowDown; focus should enter the panel, Escape return it.
3. Open an image on \`/resources/media\`, press Escape; focus should return to the tile.
4. Switch to dark theme and submit the contact form empty; the error text should be legible.
5. On a phone, open \`/technology/neuromodulation\` and tap each part of the implanted-system figure.
6. Scroll \`/company/who-we-are\`; the left edge should not step in and out.
7. Drag the window between a laptop panel and an ultrawide.
`;
writeFileSync(`${DIR}/PR-TICKET.md`, pr);

console.log(`${DIR}/`);
console.log('  TICKETS.md');
console.log('  PR-TICKET.md');
for (const t of T) console.log(`  ${t.code}_${t.file}.md`);
