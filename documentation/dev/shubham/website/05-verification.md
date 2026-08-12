# Verification

Four check tools. Between them they cover the failure classes that shipped to
production and were invisible in dev.

## Running them

Everything except `check-build` needs a server. Either works:

```bash
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort   # dev, with HMR + LAN
npx vite preview --port 4319 --strictPort                # the built artefact
```

```bash
npm run build && npm run check:build          # no server needed
node tools/check-routes.mjs http://localhost:5173
node tools/check-layout.mjs http://localhost:5173
node tools/check-mobile.mjs                   # defaults to preview on 4319
```

Omit the URL argument to use the preview server on 4319.

## What each one catches

### `check-build.mjs` — runs in CI

No browser. Asserts about `dist/`:

- `404.html` exists and is byte-identical to `index.html`
- `.nojekyll` exists
- every asset URL in `index.html` carries the deployed base
- **no `public/` file is referenced at the server root** — it scans every
  bundled `.js` and `.css` for `"/filename"` literals
- `robots.txt`, `sitemap.xml`, an OG title, a canonical, and JSON-LD are present

This is the gate. It is wired into `.github/workflows/node.js.yml` immediately
after the build step.

### `check-routes.mjs`

Loads every route in real headless Chrome and fails on an empty root, a thrown
exception, a console error, or an image that failed to decode.

It pre-dates this work — it was written after the home page shipped blank for
several commits — but it was requesting `/`, the URL shape that does not exist
in production. That is precisely why it never caught the missing router
basename. It now requests the deployed base.

### `check-layout.mjs`

Measures content left edge, inner container width and section padding at 375,
768, 1024, 1440 and 1920px across all 16 routes, and prints the distinct values.

One value per width under "CONTENT LEFT EDGE" means the site aligns. See
[03-layout-system.md](03-layout-system.md) for the deliberate exceptions.

### `check-mobile.mjs`

Two real phone profiles (iPhone SE 375×667, Pixel 7 412×915) with touch
emulation. Per route it reports horizontal overflow **with the offending
elements named**, tap targets under 44×44, text under 12px, collapsed canvases,
`h1` count, broken images and console errors — and writes a screenshot per
route to `tools/.mobile/`, so the design can be judged and not only measured.

## Results as of 2026-08-11

| Check | Result |
|---|---|
| `npm run lint` | clean (7 pre-existing warnings in `tools/`, none in `src/`) |
| `npm run build` | clean; one chunk-size warning, pre-existing |
| `check:build` | 10/10 pass |
| `check-routes` | 17/17 clean |
| `check-mobile` | 16 routes × 2 devices — no horizontal panning, one `h1` each, no broken images, no console errors |
| `check-layout` | 49 of 68 sections on one edge; remainder are documented exceptions |

## The trap that cost two dev-server crashes

**A headless Chrome profile must not live inside the project.** Vite watches the
tree; Chrome writes to `Sessions/Tabs_*` and `GPUPersistentCache/*/cache.db`
constantly; Vite's watcher hits `EBUSY` and the dev server **exits**. It looks
like the site is down when what actually happened is that the test harness shot
the server.

All three browser tools now put their profile in `os.tmpdir()`. If a new tool is
added, do the same.

## Not covered yet

- **Resize.** Every check loads fresh at a fixed size, so nothing exercises a
  viewport that *changes*. Components that measure once at mount and never
  re-measure would not be caught. Several already use `ResizeObserver`; a few
  use a `resize` listener; the coverage has not been audited.
- **Real devices.** Emulation is not a phone. The dev server binds to
  `0.0.0.0`, so `http://<lan-ip>:5173/navinetics-web-v2/` works from a handset
  on the same Wi-Fi, with HMR.
- **Keyboard paths.** The audit found the mega-menu is largely
  keyboard-unreachable and the Media lightbox claims `aria-modal` with no
  Escape, focus move or trap. Neither is fixed, and neither has a check.
