# Fixes applied

Chronological, grouped by the problem each one solves. Nothing here is
committed yet — all changes are in the working tree on `main`.

---

## 1 · The site did not work in production

Four faults compounding. Any one of them alone would have broken the deploy.

### 1.1 `base` was not a valid base path

`vite.config.js` had `base: "navinetics-web-v2"` — no leading or trailing
slash. Vite requires both; written as a bare segment it warns on every build
and the value is concatenated rather than joined.

**Now:** `base: '/navinetics-web-v2/'`, with a comment saying this string is the
single place the deployment path is declared, and what to change for a custom
domain.

### 1.2 The router did not know about the sub-path

`<Router>` in `src/App.jsx` had no `basename`. On the deployed site React Router
read `location.pathname` as `/navinetics-web-v2/`, matched no route, and fell
through to the catch-all — so **the home page rendered the 404 component**.
Every `<Link to="/products/…">` then pushed to a URL outside the deployed base.

**Now:** `<Router basename={import.meta.env.BASE_URL}>`. `BASE_URL` is `/` in
dev and the configured base in a build, so one value covers both.

### 1.3 No SPA fallback on GitHub Pages

GitHub Pages is a static file server with no rewrite rules. A request for
`/products/d1-stereotactic-frame` found no file and returned GitHub's own 404 —
the app never booted. Consequences: every deep link, bookmark, refresh and crawl
was dead, and all seven legacy redirects in `src/data/nav.js` could never fire,
because they are React elements that only run once the app has loaded.

**Now:** a `spaFallback()` Vite plugin in `vite.config.js` copies
`dist/index.html` to `dist/404.html` and writes `dist/.nojekyll` at
`closeBundle`. Pages serves `404.html` for unmatched paths, which hands the URL
back to the router.

### 1.4 Nineteen `public/` files referenced at the server root

Anything under `public/` is copied verbatim and is **not** rewritten by Vite, so
a literal like `/DSC05397-1024x695.jpg` asks for that file at the server root —
which is not where it is under a sub-path deploy. Broken in production: all
three founder portraits, the D1 photography, the entire media library, the
`/products/:slug` hero and gallery, two technology heroes, and — because
`data/technology.js` feeds `hero` into the mega-panel — **two thumbnails in the
global navigation on every page**.

**Now:** `src/lib/asset.js` exports `asset(path)`, which prefixes
`import.meta.env.BASE_URL` and is a no-op for already-resolved URLs, absolute
URLs and data URIs. Applied at the 21 data-definition sites so every consumer
gets a correct URL without needing to know which kind it is holding.

The logo was a special case: it was referenced from CSS as
`url("/logo-378x75-1.png")`, and a root-absolute `url()` is not rewritten
either. It was moved to `src/assets/logo.png` and is now imported — by
`index.css` via a relative `url()`, and by `data/partners.js` via a real import.

### 1.5 Two dead internal routes

`/company/careers` and `/products` were linked from five places and were never
routes. The "Work with us" and "Open roles" CTAs — the only outbound links on
two Company pages — both 404'd.

**Now:** targets corrected to `/resources/careers` and
`/products/d1-stereotactic-frame`, and both old paths added to the `redirects`
table so anything already shared keeps working.

**Verified:** all 17 routes render clean in real Chrome at the deployed URL
shape — no dead roots, no console errors, no broken images.

---

## 2 · Claims that should not have been published

Every one of these was removed rather than softened, and each edit carries a
comment saying why so it does not come back.

| Claim | Where | Why it went |
|---|---|---|
| "unparalleled precision" | Home hero lead | Comparative accuracy claim about a targeting device, in the first sentence on the site, with no accuracy figure anywhere to substantiate it — `products.js` withholds those on purpose |
| "around 0.6 mm deviation" vs "industry-standard planning software" | `NaviNeticsAI.jsx` status ladder | Quantitative **and** comparative claim, no comparator named, no method, no n — for software the same page states has had no submission and no clearance. The codebase's own comments recorded it as held back pending sign-off; it shipped anyway |
| "safe, effective" ×2 | `WhoWeAre.jsx` hero + meta description | FDA's terms of art for a device it has authorised, asserted about our own products on a site that states no regulatory status anywhere |
| "safe, effective, high-quality" | `Contact.jsx` hero lead | Same |
| "Superior radiolucency" | `orTables.js` strengths | Comparative performance claim with no comparator, on the one property that file explicitly states it has no figure for |
| "Lightweight and safe" | `orTables.js` strengths | Unsubstantiated safety assertion |

The Home lead was replaced with something that also fixes a separate finding —
a cold visitor could not tell what NaviNetics makes or for whom. It now names
the three product lines and the field.

---

## 3 · The contact form discarded every message

`Contact.jsx` validated input, showed a success panel, and then told the visitor
nothing had been transmitted. This is the **only** conversion point on the site —
the navbar button, the Home close, "Ask about the D1", "Talk to the team", "Ask
about a table" and the 404 all funnel there.

**Now:**

- Posts JSON to `VITE_CONTACT_ENDPOINT` when set (Formspree, Netlify Forms or a
  serverless function — all work from a static host). Real `sending` / `sent` /
  `failed` states.
- With no endpoint configured it does **not** pretend. It hands the message to
  the visitor's mail client fully composed, so the words they wrote survive.
- Reasons extended to cover distribution, press, and **product complaint or
  device issue** — a device company's complaint path should be findable, not a
  line in a footer.
- Selecting the complaint reason surfaces guidance to include device and date
  and **not** to include patient identifiers.
- An organisation field, and a plain-language notice about what happens to what
  they typed, next to where they type it.

---

## 4 · Discoverability

The site is client-rendered with no SSR, so a crawler or link unfurler that does
not execute JavaScript sees only `index.html`.

- **Open Graph, Twitter Card, canonical** added to `index.html`. Before this,
  every shared link — a product page emailed to a surgeon, a page posted to
  LinkedIn — rendered as a bare URL with no title, summary or image.
- **Organization JSON-LD** in `index.html`. States only what is verifiable from
  the site: no certifications, clearances or claims are asserted.
- **`public/robots.txt`** and **`public/sitemap.xml`** (16 routes). The sitemap
  matters more here than on a server-rendered site — nothing in the served HTML
  links anywhere, so without it a crawler can discover exactly one URL.
- **`src/lib/meta.js` upgraded** to set canonical, `og:title`, `og:description`,
  `og:url` and Twitter equivalents **per route**, not just title and
  description. All 18 pages already called `usePageMeta`, so all 18 got this for
  free.

> Note for later: none of this helps a crawler that does not run JS.
> Prerendering the routes at build time is the real fix; this is the correct
> behaviour underneath it.

---

## 5 · Accessibility

- **Dark-theme status colours.** `--ok`, `--warn` and `--crit` were never
  redefined for the dark theme, so they were being read on `--surface`
  (`#0a2231`) at **3.81 : 1**, **4.12 : 1** and **3.14 : 1** — all below AA.
  That put the Contact form's error text and the mega-menu's "In development"
  label below the threshold on every dark page. New values measured on
  `--surface`: **8.3 / 7.4 / 5.9 : 1**.
- **Careers `h1`.** The page has no `Hero`, so its outline started at `h2` with
  no `h1` above it. `SectionHead` already took a `level` prop; both branches now
  pass `level="h1"`.

---

## 6 · Layout unification

See [03-layout-system.md](03-layout-system.md) for the full before/after with
measurements. In short: one measure (`max-w-7xl`), one gutter (`px-6 lg:px-8`),
one rhythm (`py-16 md:py-20 lg:py-24`, giving 192px between sections instead of
320px).

---

## 7 · Tooling and CI

| Added | Catches |
|---|---|
| `tools/check-build.mjs` | Missing 404.html, assets that lost the base path, `public/` files referenced at the server root, missing robots/sitemap/OG/canonical/JSON-LD |
| `tools/check-mobile.mjs` | Horizontal overflow, tap targets under 44px, text under 12px, collapsed canvases — at 375 and 412px, with screenshots |
| `tools/check-layout.mjs` | Content left edge, measure and vertical rhythm at five widths |
| `tools/check-routes.mjs` (fixed) | Was requesting `/` — the URL shape that does not exist in production. Now requests the deployed base, which is what let the basename bug survive it |

`check:build` is wired into `.github/workflows/node.js.yml` after the build step.

### One thing to know about the check tools

They launch headless Chrome. **The Chrome profile must live outside the project
tree.** A profile under `tools/` sits inside Vite's file watcher, and Vite exits
with `EBUSY` the instant Chrome touches its own session or cache database —
killing the dev server the check is pointed at. All three tools now use
`os.tmpdir()`. This bit twice before it was understood.
