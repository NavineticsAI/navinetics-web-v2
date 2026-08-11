# Dev documentation — NaviNetics website

Working notes kept as the site is repaired and unified. Written to be useful to
whoever picks this up next, including future us: every entry says what was
wrong, what changed, and how to tell if it regresses.

Started 2026-08-11 against `main` at `e20b6ef`.

## Contents

| Doc | What is in it |
|---|---|
| [01-audit.md](01-audit.md) | The full site audit — how it was run, what it found, the numbers |
| [02-fixes-applied.md](02-fixes-applied.md) | Every change made, with the reason and the file |
| [03-layout-system.md](03-layout-system.md) | The layout engine: measure, gutter, rhythm — measured before and after |
| [04-open-items.md](04-open-items.md) | What is NOT done, and what only NaviNetics can decide |
| [05-verification.md](05-verification.md) | The check tools, how to run them, what each one catches |
| [06-copy-policy.md](06-copy-policy.md) | Internal reasoning stays in the code, never on the page |
| [07-scene-accuracy.md](07-scene-accuracy.md) | Which animations are built from the science and which are texture; `makeAnchor` rebuild tried and reverted |
| [08-existing-site.md](08-existing-site.md) | What navinetics.com already says — including the FDA clearance the rebuild dropped |

## The one-paragraph summary

The site was broken in production: it deployed to a GitHub Pages sub-path but
the router had no matching basename, so the home page rendered the 404
component and every deep link died. Nineteen images referenced from `public/`
resolved against the server root and 404'd. That is fixed and gated in CI.
Alongside it: unsubstantiated performance and regulatory claims were removed,
the contact form — which validated input and then discarded it — was wired up,
and the layout was unified onto one measure and one vertical rhythm.

## Ground rules being followed

1. **No invented claims.** Nothing that asserts a regulatory status, a
   certification, a customer, or a performance number gets written into the
   site. Where one was found unsubstantiated it was removed, not softened.
2. **Every fix is verifiable.** If a bug class could ship once it can ship
   again, so it gets a check in `tools/` and, where it is cheap, a CI gate.
3. **The existing design is the client.** This codebase is careful — bespoke
   scene rendering, a considered palette, deliberate prose. Changes are surgical
   and explained in-place with comments; nothing is rewritten for taste.
4. **Internal reasoning stays internal.** Notes about what is missing, unsigned
   or unsourced belong in code comments and in these docs — never in page copy,
   and never in alt text. See [06-copy-policy.md](06-copy-policy.md).
