# The audit

Run 2026-08-11 against `main` at `e20b6ef`.

## Method

Ten specialist passes over the codebase, each with one lens, followed by an
adversarial verification pass in which a second agent tried to **refute** each
finding by opening the cited file. Findings that could not be verified in the
code were dropped.

The lenses:

| Lens | Scope |
|---|---|
| Home / Contact / 404 | The entry and exit pages, navbar, footer |
| Company | Who We Are, Founders, Partners, Community |
| Products | The template, D1, MAVEN, surgical tables |
| Technology | The template, NaviNetics AI, Neuromodulation |
| Resources | Media, Careers, Education, Publications |
| SEO | Crawlability, metadata, sharing, the SPA-on-Pages problem |
| Accessibility | WCAG 2.2 AA, measured contrast, keyboard paths |
| Performance | Real build, asset weights, rAF cleanup, splitting |
| Regulatory | Claims, device status, required legal pages, imagery |
| IA / conversion | Seven buyer personas walked through the site |

## Raw numbers

**204 findings.** The run was stopped part-way through verification to conserve
budget; 20 findings completed the adversarial pass at that point, of which 19
were confirmed and 1 refuted.

By severity:

| | Count |
|---|---|
| critical | 24 |
| high | 75 |
| medium | 88 |
| low | 17 |

By category:

| | Count |
|---|---|
| regulatory | 46 |
| accessibility | 40 |
| content | 25 |
| correctness | 21 |
| seo | 17 |
| maintainability | 16 |
| conversion | 13 |
| performance | 12 |
| ia | 7 |
| design | 3 |
| security | 2 |
| messaging | 2 |

Raw data: `scratchpad/findings.json` (session-scoped; copy it somewhere durable
if it is still wanted).

## What it concluded

The dominant theme was not code quality — the codebase is careful — but that
**the deployed artefact did not work**, and that a medical device company's site
was carrying claims it could not substantiate.

Five independent lenses converged on the deploy break from different angles
(correctness, SEO, products, technology, resources), which is what gave
confidence it was real before anything was measured.

`regulatory` being the largest category is the finding a generic web audit would
have missed entirely, and it is the one with the longest tail — most of it needs
NaviNetics to decide something, not for anyone to write code. See
[04-open-items.md](04-open-items.md).

## One correction worth recording

An early claim that "only 8 of 18 pages set per-route metadata" was **wrong** —
it came from a multiline grep that truncated its own results. All 18 pages call
`usePageMeta`. Verified by counting occurrences across `src/pages/`.

The lesson: a grep that returns fewer results than expected is a claim about the
grep, not about the codebase. Count before concluding absence.
