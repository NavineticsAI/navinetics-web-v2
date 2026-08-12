# PR: Fix the broken deploy, unify the layout, and correct published claims

**Branch:** `site-fixes-2026-08` → `main`
**Type:** Bug fix + hardening
**Status:** PR #3 open against `main` (pushed)
**Author:** shubhvmhaske
**Tracker:** [BUG-125](tickets/BUG-125_Deploy-Broken-On-GitHub-Pages.md), [TASK-001](tickets/TASK-001_Published-Claims-And-Regulatory-Status.md), [TASK-002](tickets/TASK-002_Legal-Pages-Permissions-Patient-Imagery.md), [BUG-126](tickets/BUG-126_Contact-Form-Discarded-Every-Message.md), [FEAT-045](tickets/FEAT-045_Unify-Layout-Measure-Gutter-Rhythm.md), [BUG-127](tickets/BUG-127_Accessibility-Keyboard-Dialog-Contrast.md), [BUG-128](tickets/BUG-128_Partners-And-Maven-Peg-Main-Thread.md), [FEAT-046](tickets/FEAT-046_Discoverability-Metadata-And-Prerendering.md), [TASK-003](tickets/TASK-003_Verification-Tooling.md) · PR #3 · Issues: _not yet filed_

---

## 0. STATUS (2026-08-12) — read this first

- The deploy break is **fixed and gated in CI**; all 17 routes render at the deployed URL shape.
- Six unsubstantiated claims removed; the FDA 510(k) clearance navinetics.com already publishes is
  **restored** to the D1 page.
- Three of the nine tickets are **blocked on NaviNetics**, not on engineering — TASK-001 and TASK-002
  hold almost everything that cannot be closed by writing code.
- **Not fixed:** `/company/partners` and `/products/maven-neuromodulation` hold the main thread at
  ~93% while idle (BUG-128). Two optimisations produced no measured gain; the cause is stated as
  unproven and the next step is instrumentation rather than a third guess.
- Verification: lint clean in `src/`, build clean, `check:build` 10/10, routes 17/17, mobile 6x16
  clean, WebKit 26.5 32/32 clean, copy sweep 17/17 clean.

## 1. Summary

The deployed site did not work. `base` was written as a bare segment, `<Router>` had no matching
`basename` so the home page matched no route and rendered the 404 component, GitHub Pages had no
`404.html` so every deep link and refresh died before the app booted, and 21 images referenced from
`public/` resolved against the server root. The build passed throughout, and every one of these is
invisible in dev.

That is fixed and gated in CI. Alongside it: six unsubstantiated claims are removed and the FDA
510(k) clearance navinetics.com already publishes is restored; the contact form now transmits instead
of discarding every message; the layout is unified onto one measure and one rhythm; and three
accessibility defects are closed, one of which put eleven pages out of reach of a keyboard.

Two pages still hold the main thread at ~93% while idle. That is **not** fixed, and is stated as such
below rather than left for a reviewer to find.

## 2. Linked issues

Not yet filed. On publication each ticket becomes one issue titled `<CODE> <title>`, assigned to
**shubhvmhaske**, and this block becomes `Closes #N` / `Fixes #N` lines so they auto-close on merge.
The **Tracker** line above carries the same numbers, and each issue gets a backlink comment to this PR.

| Ticket | Would-be issue title | Type |
|---|---|---|
| [BUG-125](tickets/BUG-125_Deploy-Broken-On-GitHub-Pages.md) | BUG-125 The deployed site rendered the 404 page and served no images | Bug |
| [TASK-001](tickets/TASK-001_Published-Claims-And-Regulatory-Status.md) | TASK-001 Published claims and regulatory status need NaviNetics sign-off | Task |
| [TASK-002](tickets/TASK-002_Legal-Pages-Permissions-Patient-Imagery.md) | TASK-002 Legal pages, third-party permissions and patient imagery | Task |
| [BUG-126](tickets/BUG-126_Contact-Form-Discarded-Every-Message.md) | BUG-126 The contact form discarded every message, and product pages had no next step | Bug |
| [FEAT-045](tickets/FEAT-045_Unify-Layout-Measure-Gutter-Rhythm.md) | FEAT-045 Unify the site onto one measure, one gutter and one vertical rhythm | Feature |
| [BUG-127](tickets/BUG-127_Accessibility-Keyboard-Dialog-Contrast.md) | BUG-127 Mega-menu unreachable by keyboard, lightbox not a real dialog, dark contrast below AA | Bug |
| [BUG-128](tickets/BUG-128_Partners-And-Maven-Peg-Main-Thread.md) | BUG-128 Partners and MAVEN hold the main thread at ~93% while the page is idle | Bug |
| [FEAT-046](tickets/FEAT-046_Discoverability-Metadata-And-Prerendering.md) | FEAT-046 Per-route metadata, structured data and prerendering | Feature |
| [TASK-003](tickets/TASK-003_Verification-Tooling.md) | TASK-003 Automated checks for the failure classes that reached production | Task |

## 3. What changed

**Deploy — BUG-125.** `base: '/navinetics-web-v2/'`; `<Router basename={import.meta.env.BASE_URL}>`;
a Vite `closeBundle` plugin emitting `404.html` and `.nojekyll`; an `asset()` helper resolving 21
`public/` references; two dead internal routes repaired and redirected.

**Claims — TASK-001.** Removed: "unparalleled precision", a comparative "0.6 mm deviation" benchmark
the codebase itself recorded as held back pending sign-off, "Superior radiolucency", "Lightweight and
safe". Restored: `FDA 510(k) cleared` on the D1 page, above the fold, as a typographic status line
rather than a badge — 21 CFR 807.97 makes an approval-flavoured seal misbranding. Withdrawn: an
invented "not for use in human subjects" line on MAVEN which navinetics.com may contradict. Kept at
NaviNetics' direction: "safe, effective and high-quality".

**Conversion — BUG-126.** The contact form validated input and then told the visitor nothing was
sent. It now posts to `VITE_CONTACT_ENDPOINT`, or hands the message to the mail client fully
composed, and carries a product-complaint route.

**Layout — FEAT-045.** One `.nn-frame` measure stepping at 1920 and 2560; section rhythm reduced so
the gap is 192px rather than 320px. Sections sharing one left edge at 1440px went from 27 of 68 to 68
of ~70.

**Accessibility — BUG-127.** Mega-menu panels were unreachable by keyboard. The media lightbox
declared `aria-modal` and implemented none of it. Dark-theme status colours sat at 3.81/4.12/3.14:1.
The implanted-system figure said "Hover or tap a part" and tapping did nothing.

**Discoverability — FEAT-046.** Open Graph, Twitter Card, canonical, Organization JSON-LD,
`robots.txt`, `sitemap.xml`, and per-route canonical and OG for all 18 pages.

**Performance — BUG-128, not fixed.** Two pages sit at ~93% busy while idle. Two optimisations were
made on the theory that drawing was the cost and neither moved the number, so the cause is stated as
unproven and the next step is instrumentation. The measurement harness was wrong first — it counted
long tasks up to six times over — and is fixed.

## 4. Validation

| Check | Result |
|---|---|
| `npm run lint` | clean in `src/` (one pre-existing fast-refresh warning) |
| `npm run build` | clean; entry chunk 552 to 522 kB |
| `npm run check:build` | 10/10, runs in CI |
| `node tools/check-routes.mjs` | 17/17 routes render at the deployed URL shape |
| `node tools/check-mobile.mjs` | 6 devices x 16 routes; no panning, no console errors |
| `node tools/check-webkit.mjs` | WebKit 26.5, 16 routes x desktop and iPhone, all clean |
| `node tools/check-copy.mjs` | 17/17; no editorial notes reaching the page |
| `node tools/check-tap.mjs` | every interactive figure part reachable by touch |
| `node tools/check-layout.mjs` | one content edge per viewport width |

## 5. Documentation

`documentation/dev/shubham/website/` — tickets, the audit method and findings, every fix with its
reason, the layout system measured before and after, open items split by who can close them, the
check tools, the copy policy, a scene rebuild that was tried and reverted, a comparison against
navinetics.com, and the performance record.

## 6. Suggested QA

1. Load a deep link directly — `/products/d1-stereotactic-frame` — and refresh it.
2. Tab to **Company** in the nav, press ArrowDown; focus should enter the panel, Escape return it.
3. Open an image on `/resources/media`, press Escape; focus should return to the tile.
4. Switch to dark theme and submit the contact form empty; the error text should be legible.
5. On a phone, open `/resources/education` and tap each part of the implanted-system figure.
6. Scroll `/company/who-we-are`; the left edge should not step in and out.
7. Drag the window between a laptop panel and an ultrawide.
