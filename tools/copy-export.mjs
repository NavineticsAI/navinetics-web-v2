/**
 * Every word on the website, out to a manifest a Word document is built from.
 *
 *   node tools/copy-export.mjs [--out copy/]
 *
 * WHY THIS EXISTS. The people who own the words — marketing, regulatory, the
 * founders — do not read JSX, and asking them to review copy by scrolling the
 * site loses the review the moment they close the tab. They want a document
 * they can edit with Track Changes on and mail to three colleagues. This is the
 * first half of getting that document back into the site without anyone
 * retyping it.
 *
 * WHAT IT PRODUCES.
 *   copy/copy-manifest.json   every string, its id, and the exact bytes it
 *                             occupies in source. The import side needs this
 *                             and nothing else.
 *
 * The manifest is COMMITTED. It is the record of what the document was built
 * from, and an import that cannot find the manifest its document was made
 * against has no safe way to write anything back.
 *
 * ORDER. Strings are grouped the way a visitor meets them — site-wide chrome,
 * then one part per route in nav order, then the shared content libraries —
 * because a stakeholder's first question about any sentence is "where does this
 * appear", and a document ordered by filename cannot answer it.
 */
import { mkdirSync, readFileSync, writeFileSync, globSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { extractFile, idFor, sha } from './copy-lib.mjs';

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const rel = (p) => relative(ROOT, p).split('\\').join('/');

const outDir = (() => {
  const i = process.argv.indexOf('--out');
  return i > -1 ? process.argv[i + 1] : 'copy';
})();

/* ── the site's own shape ──────────────────────────────────────────────────
   Route order is NAV order, not the order routes happen to be declared in.
   The document is read top to bottom by someone who thinks in menus. */
const ROUTES = [
  { path: '/', title: 'Home', file: 'src/pages/Home.jsx' },
  { path: '/company/who-we-are', title: 'Who We Are', file: 'src/pages/WhoWeAre.jsx' },
  { path: '/company/our-founders', title: 'Our Founders', file: 'src/pages/Founders.jsx' },
  { path: '/company/partners', title: 'Partners', file: 'src/pages/Partners.jsx', unlisted: true },
  { path: '/company/community', title: 'Community', file: 'src/pages/Community.jsx' },
  { path: '/products/d1-stereotactic-frame', title: 'D1 Stereotactic Frame', file: 'src/pages/D1.jsx' },
  { path: '/products/carbon-fiber-surgical-tables', title: 'Carbon-Fiber Surgical Tables', file: 'src/pages/SurgicalTables.jsx' },
  { path: '/products/maven-neuromodulation', title: 'MAVEN Neuromodulation', file: 'src/pages/Maven.jsx' },
  { path: '/technology/stereotactic-devices', title: 'Stereotactic Devices', file: 'src/pages/Technology.jsx' },
  { path: '/technology/neuromodulation', title: 'Neuromodulation', file: 'src/pages/Neuromodulation.jsx' },
  { path: '/technology/navinetics-ai', title: 'NaviNetics AI', file: 'src/pages/NaviNeticsAI.jsx' },
  { path: '/technology/education', title: 'Education', file: 'src/pages/Education.jsx' },
  { path: '/resources/media', title: 'Media', file: 'src/pages/Media.jsx' },
  { path: '/resources/careers', title: 'Careers', file: 'src/pages/Careers.jsx' },
  { path: '/resources/publications', title: 'Publications', file: 'src/pages/Publications.jsx' },
  { path: '/contact', title: 'Contact', file: 'src/pages/Contact.jsx' },
  { path: '(any unknown URL)', title: 'Page Not Found', file: 'src/pages/NotFound.jsx' },
];

// Chrome: on every page, so it leads the document rather than being buried.
const CHROME = [
  { file: 'src/components/Navbar.jsx', title: 'Navigation bar' },
  { file: 'src/data/nav.js', title: 'Menu labels' },
  { file: 'src/components/Footer.jsx', title: 'Footer' },
];

/* ── which pages does a shared file reach? ─────────────────────────────────
   A one-word change in src/data/products.js can alter text on four routes at
   once, and a stakeholder editing it deserves to be told that BEFORE they edit.
   Resolved by following imports from each page. */
function importGraph() {
  const files = globSync('src/**/*.{js,jsx}', { cwd: ROOT })
    .map((f) => f.split('\\').join('/'));
  const deps = new Map();
  for (const f of files) {
    const src = readFileSync(resolve(ROOT, f), 'utf8');
    const found = new Set();
    for (const m of src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
      const target = rel(resolve(ROOT, dirname(f), m[1]));
      const hit = files.find((c) => c === target
        || c === `${target}.js` || c === `${target}.jsx`
        || c === `${target}/index.js` || c === `${target}/index.jsx`);
      if (hit) found.add(hit);
    }
    deps.set(f, found);
  }
  // Transitive closure from each route's page file.
  const reach = new Map();
  for (const r of ROUTES) {
    const seen = new Set();
    const stack = [r.file];
    while (stack.length) {
      const cur = stack.pop();
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const d of deps.get(cur) || []) stack.push(d);
    }
    for (const f of seen) {
      if (!reach.has(f)) reach.set(f, []);
      reach.get(f).push(r.title);
    }
  }
  return { files, reach };
}

const { files, reach } = importGraph();

const PAGE_FILES = new Set(ROUTES.map((r) => r.file));
const CHROME_FILES = new Set(CHROME.map((c) => c.file));

/* Scene and geometry modules hold no copy — they hold coordinates, easing
   curves and shader constants. Excluded by path rather than by heuristic
   because a stray prose-shaped constant in one of them is a distraction in a
   document meant for a marketing lead. */
/* ReviewStamp is the review build's own footer. Its words are addressed to
   the reviewer, not to a visitor, and a row reading "build" in a document of
   website copy is the sort of thing that makes a reader distrust the rest. */
const SKIP = /^src\/(lib|data\/(worldDots|locatorMap)|ui\/ReviewStamp)/;

/* ── naming a string for someone who has never seen the code ───────────────
   `founders[0].bio[2]` is precise and useless to a marketing lead. The document
   has to say "Founders — item 1 — Biography, paragraph 3", or every reviewer's
   first question is "where does this one appear?" and the document has failed
   at the only job it has. */
const TAG_NAMES = {
  h1: 'Heading', h2: 'Heading', h3: 'Sub-heading', h4: 'Sub-heading',
  p: 'Paragraph', li: 'List item', a: 'Link', button: 'Button',
  span: 'Text', strong: 'Bold text', em: 'Italic text', figcaption: 'Caption',
  th: 'Table header', td: 'Table cell', label: 'Form label', option: 'Dropdown option',
  summary: 'Expander label', blockquote: 'Quote', dt: 'Term', dd: 'Definition',
};
const FIELD_NAMES = {
  title: 'Title', name: 'Name', lead: 'Intro paragraph', eyebrow: 'Eyebrow (small label above)',
  summary: 'Summary', body: 'Body text', description: 'Description', label: 'Label',
  caption: 'Caption', alt: 'Image alt text (screen readers)', role: 'Role',
  tagline: 'Tagline', quote: 'Quote', question: 'Question', answer: 'Answer',
  'aria-label': 'Accessibility label (screen readers)', placeholder: 'Placeholder text',
  note: 'Note', unit: 'Unit', value: 'Value', suffix: 'Suffix', point: 'Bullet point',
  statement: 'Statement', status: 'Status', source: 'Source', line: 'One-line summary',
};

function humanLabel(e) {
  const bits = [];
  for (const seg of e.astPath.split(/(?=[./[])/)) {
    const t = seg.replace(/^[./]/, '');
    if (!t) continue;
    const arr = /^\[(\d+)\]$/.exec(t);
    if (arr) { bits.push(`item ${Number(arr[1]) + 1}`); continue; }
    const tag = /^([A-Za-z.]+)\[(\d+)\]$/.exec(t);
    if (tag) {
      const friendly = TAG_NAMES[tag[1]];
      if (friendly) bits.push(Number(tag[2]) ? `${friendly} ${Number(tag[2]) + 1}` : friendly);
      continue;
    }
    if (/^(div|section|main|nav|header|footer|ul|ol|figure|Fragment|frag)$/i.test(t)) continue;
    bits.push(t.replace(/@/, ' — ').replace(/#\d+$/, ''));
  }
  const field = FIELD_NAMES[e.key];
  const trail = bits.slice(-3).join(' — ');
  return field ? (trail ? `${trail} — ${field}` : field) : (trail || 'Text');
}

/* The document groups by page and by section, so a row only has to say WHAT it
   is — 'Heading', 'Paragraph 2', 'Button'. Repeating the location on every row
   is the noise that made the first draft unreadable. */
function shortLabel(e) {
  const field = FIELD_NAMES[e.key];
  if (field) return field;
  if (e.key && !/^(aria|data)-/.test(e.key)) {
    const w = e.key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
  const tagName = (t) => TAG_NAMES[t] || TAG_NAMES[t.toLowerCase()];
  const tags = [...e.astPath.matchAll(/([A-Za-z.]+)\[(\d+)\]/g)].filter((m) => tagName(m[1]));
  const last = tags[tags.length - 1];
  if (last) {
    const n = Number(last[2]);
    return n ? `${tagName(last[1])} ${n + 1}` : tagName(last[1]);
  }
  // A bare index means nothing on its own. The array it indexes usually names
  // itself: founders[0].bio[2] is the third paragraph of the biography.
  const named = /([A-Za-z_$][\w$]*)\[(\d+)\]$/.exec(e.astPath.replace(/#\d+$/, ''));
  if (named) {
    const word = named[1].replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    const nice = word.charAt(0).toUpperCase() + word.slice(1);
    return `${nice} — paragraph ${Number(named[2]) + 1}`;
  }
  const arr = [...e.astPath.matchAll(/\[(\d+)\]/g)];
  if (arr.length) return `Item ${Number(arr[arr.length - 1][1]) + 1}`;
  return 'Text';
}

const KIND_NOTE = {
  placeholder: 'EMPTY ON PURPOSE. Every founder has five slots so that no '
    + 'biography reads as shorter than the others. Type here if you have '
    + 'more to add; leave it blank and nothing appears on the page.',
  'template-dyn': 'Contains {1}-style placeholders filled in by the site. Keep every placeholder, in order.',
  'jsx-expr': 'Shown only in a particular state (for example while a form is sending).',
  alt: 'Read aloud by screen readers; not shown on screen.',
};

/* ── what the shared parts are called ─────────────────────────────────────
   The first draft titled these with their FILENAMES — "data/disciplines.js",
   "ui/ConvergenceDiagram.jsx" — and put thirty-six of them in the contents.
   A reviewer opening that has no idea what any of it is, and reasonably asks
   why it is in a document about website copy.

   So the libraries holding real prose get real names, and the two dozen
   components carrying a button label apiece are collected into ONE section
   at the back. Nothing is dropped; it stops being a list of files. */
const LIBRARY = {
  'src/data/publications.js': ['Published papers', 'Titles, authors and journals for every paper listed on the site.'],
  'src/data/products.js': ['Product records', 'Names, summaries and specifications. Feeds the menu, the home page and every product page.'],
  'src/data/education.js': ['Education articles', 'The explainers on the Education and Technology pages.'],
  'src/data/disciplines.js': ['Careers — disciplines', 'The engineering and clinical disciplines listed on Careers and Who We Are.'],
  'src/data/maven.js': ['MAVEN content', 'Copy and figure captions for the MAVEN page.'],
  'src/data/orTables.js': ['Surgical table models', 'The five models and their specifications. Withdrawn from the site pending FDA registration.'],
  'src/data/partners.js': ['Territories and partners', 'Countries, distributors, and what each one does.'],
  'src/data/media.js': ['Media library', 'Titles and captions for every image and video.'],
  'src/data/neuromodulation.js': ['Neuromodulation content', 'The technology page on neurochemical sensing.'],
  'src/data/d1.js': ['D1 frame content', 'Copy for the D1 stereotactic frame page.'],
  'src/data/company.js': ['Company history and principles', 'The timeline, the principles, and the statistics on Who We Are.'],
  'src/data/technology.js': ['Technology records', 'Names and summaries for each technology area.'],
  'src/pages/Product.jsx': ['Product page template', 'Text shared by any product without a page of its own.'],
  'src/ui/SceneBand.jsx': ['NaviNetics AI — diagram labels', 'Labels on the animated diagrams.'],
  'src/ui/Workstation.jsx': ['Planning workstation demo', 'View names and controls in the interactive demo.'],
  'src/ui/EduFigures.jsx': ['Education diagrams', 'Labels and instructions on the interactive figures.'],
  'src/ui/RouteBoundary.jsx': ['Error messages', 'Shown only if a page fails to load.'],
};

const parts = [];
const manifest = { generated_from: '', files: {}, entries: [] };
let dropped = 0;

const collect = (file, part) => {
  const r = extractFile(resolve(ROOT, file));
  if (r.error) {
    console.error(`  ! ${file} — parse failed: ${r.error}`);
    return 0;
  }
  manifest.files[file] = r.hash;
  for (const e of r.entries) {
    const id = idFor({ ...e, file });
    manifest.entries.push({
      id,
      part: part.key,
      file,
      astPath: e.astPath,
      kind: e.kind,
      key: e.key,
      label: shortLabel(e),
      fullPath: humanLabel(e),
      note: KIND_NOTE[e.kind] || KIND_NOTE[e.key] || '',
      line: e.line,
      start: e.start,
      end: e.end,
      indent: e.indent || '',
      slots: e.slots || 0,
      slotSrc: e.slotSrc || [],
      pre: e.pre ?? null,
      post: e.post ?? null,
      quote: e.raw[0],
      text: e.text,
      appears_on: reach.get(file) || [],
    });
    part.count += 1;
  }
  return r.entries.length;
};

// 1. Site-wide chrome.
for (const c of CHROME) {
  const part = { key: `chrome:${c.file}`, group: 'Site-wide', title: c.title, file: c.file, count: 0 };
  collect(c.file, part);
  parts.push(part);
}

// 2. One part per route, in nav order.
for (const r of ROUTES) {
  const part = {
    key: `page:${r.path}`, group: 'Pages', title: r.title, path: r.path,
    file: r.file, unlisted: !!r.unlisted, count: 0,
  };
  collect(r.file, part);
  parts.push(part);
}

// 3. The shared content libraries, busiest first — they are where the bulk of
//    the prose actually lives, and a stakeholder should meet them last.
const libFiles = files
  .filter((f) => !PAGE_FILES.has(f) && !CHROME_FILES.has(f) && !SKIP.test(f))
  .sort();
const scraps = {
  key: 'lib:scraps', group: 'Shared content', title: 'Buttons, labels and messages',
  note: 'Single words and short phrases from shared parts of the site — button '
    + 'labels, error messages, and text read aloud by screen readers. Small, but '
    + 'a visitor sees all of it.',
  file: '', appears_on: [], count: 0,
};
for (const f of libFiles) {
  const named = LIBRARY[f];
  // Anything unnamed is a component carrying a label or two. Thirty-six
  // filenames in the contents is not a document; a dozen named libraries and
  // one collection of odds and ends is.
  const part = named
    ? {
      key: `lib:${f}`, group: 'Shared content', title: named[0], note: named[1],
      file: f, appears_on: reach.get(f) || [], count: 0,
    }
    : scraps;
  const n = collect(f, part);
  if (named) { if (n) parts.push(part); else dropped += 1; } else if (!n) dropped += 1;
}
if (scraps.count) parts.push(scraps);

/* ── grouping the content libraries ────────────────────────────────────────
   A page's sections come from its own markup. A data file has no markup, so a
   record's own name IS its section: every string under `products[0]` belongs
   to whatever `products[0].name` says. Without this the biggest sections in
   the document — 140 strings of product copy — arrive as one undifferentiated
   run, and a reviewer cannot tell where NRSS stops and MAVEN starts. */
const RECORD_NAME = ['name', 'title', 'label', 'question', 'heading'];
const recordOf = (astPath) => {
  // First index only: founders[0].bio[2] belongs to founders[0], not to
  // bio[2]. A greedy match here silently orphans every nested paragraph.
  const m = /^([^[]*\[\d+\])/.exec(astPath);
  return m ? m[1] : '';
};
const nameByRecord = new Map();
for (const e of manifest.entries) {
  const rec = recordOf(e.astPath);
  if (!rec || !RECORD_NAME.includes(e.key)) continue;
  const rank = RECORD_NAME.indexOf(e.key);
  const cur = nameByRecord.get(`${e.file}|${rec}`);
  if (!cur || rank < cur.rank) nameByRecord.set(`${e.file}|${rec}`, { rank, text: e.text });
}
for (const e of manifest.entries) {
  if (e.section) continue;
  const hit = nameByRecord.get(`${e.file}|${recordOf(e.astPath)}`);
  if (hit) e.section = hit.text.split('\n')[0].slice(0, 70);
}

/* ── does this text actually appear on the site? ───────────────────────────
   Some does not, and a document that hides that is worse than useless: a
   reviewer spends an afternoon rewriting a section, the edit applies cleanly,
   and nothing changes on the page. Careers.jsx is the live example — two whole
   sections sit behind SHOW_… flags that are hard-coded false, and its job list
   reads from an empty array.

   Rather than trust a reading of the code, this is measured: dump what a
   browser actually renders (tools/dump-copy.mjs) and check each string against
   it. Anything not found is moved out of the main document and into an
   appendix that says plainly that editing it will not change anything today. */
const norm = (s) => s
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  .replace(/[–—]/g, '-').replace(/ /g, ' ')
  .replace(/\s+/g, ' ').trim().toLowerCase();

let renderedPool = null;
try {
  const dump = JSON.parse(readFileSync(resolve(ROOT, outDir, '.rendered.json'), 'utf8'));
  renderedPool = new Set();
  for (const lines of Object.values(dump)) for (const l of lines) renderedPool.add(norm(l));
} catch { /* no dump on disk; every string is reported as unknown, not as dead */ }

let notRendered = 0;
/* Text a screen reader speaks is real copy that never appears in what a
   browser renders as visible text. Calling it 'not on the site' would tell a
   reviewer to ignore the only label a blind user ever hears. */
const ASSISTIVE = new Set(['alt', 'aria-label', 'title', 'placeholder']);
for (const e of manifest.entries) {
  if (!renderedPool) { e.rendered = null; continue; }
  if (ASSISTIVE.has(e.key)) { e.rendered = true; e.assistive = true; continue; }
  const cand = [norm(e.text), ...e.text.split('\n').map(norm)].filter(Boolean);
  let hit = cand.some((t) => renderedPool.has(t));
  if (!hit) {
    for (const line of renderedPool) {
      // whole-line containment either way, and the label+value case where the
      // browser renders two source strings as one visual line
      if (cand.some((t) => t.length > 6 && (line.includes(t) || t.includes(line)))) { hit = true; break; }
      if (cand.some((t) => line.startsWith(`${t} `) || line.endsWith(` ${t}`))) { hit = true; break; }
    }
  }
  e.rendered = hit;
  if (!hit) notRendered += 1;
}

manifest.parts = parts;
/* ── the export id, and the baseline it names ─────────────────────────────
   A returned document is compared against THREE texts, not two: what it was
   born from, what the reviewer typed, and what is live now. Without the
   first, any row that differs from live reads as an edit — so a document
   made before a correction was published, submitted afterwards untouched,
   silently puts the old wording back. Measured: one change recorded, zero
   refusals, and with nobody in the loop it reaches the site.

   The id is CONTENT-ADDRESSED — a hash of every id:text pair — so it changes
   exactly when the copy changes and never otherwise. The previous value
   hashed the list of filenames, which is the same for two exports six
   months apart. */
manifest.generated_from = sha(manifest.entries.map((e) => `${e.id}:${e.text}`).join(' '));

mkdirSync(resolve(ROOT, outDir, "baselines"), { recursive: true });
writeFileSync(
  resolve(ROOT, outDir, "baselines", `${manifest.generated_from}.json`),
  `${JSON.stringify(Object.fromEntries(manifest.entries.map((e) => [e.id, e.text])))}
`,
);

mkdirSync(resolve(ROOT, outDir), { recursive: true });
const outFile = resolve(ROOT, outDir, 'copy-manifest.json');
writeFileSync(outFile, `${JSON.stringify(manifest, null, 1)}\n`);

const byGroup = {};
for (const p of parts) byGroup[p.group] = (byGroup[p.group] || 0) + p.count;
console.log(`\n  ${manifest.entries.length} editable strings across ${parts.length} sections`);
for (const [g, n] of Object.entries(byGroup)) console.log(`    ${g.padEnd(16)} ${n}`);
console.log(`    (${dropped} files held no copy)`);
if (renderedPool) console.log(`
  ${manifest.entries.length - notRendered} appear on the live site, ${notRendered} do not (they go to an appendix)`);
console.log(`\n  -> ${rel(outFile)}\n`);
