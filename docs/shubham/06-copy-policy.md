# Copy policy: internal reasoning stays in the code

**Rule, set 2026-08-11:**

> Keep all the comments internal in codebase like that, not on the webpage.

## What the rule is

This codebase is unusually disciplined about not publishing claims it cannot
substantiate — that discipline is correct and stays. But the *record* of that
discipline had leaked onto the pages. Visitors were being shown notes about the
state of our content: which figures were missing from which supplier document,
what NaviNetics had not yet signed off, what was still outstanding.

A surgeon or a purchasing manager reading a product page wants to know what the
product does and what to do next. They did not ask about our editorial process.
Publishing the gaps does not make a page more honest — it makes it read as
unfinished, and it hands a competitor a list of what we cannot substantiate.

**So:** the reasoning lives in code comments and in these docs. The page carries
only what a visitor came for. Every removal below left a comment in place saying
what was there and why it went, so the discipline is not lost with the copy.

## What was removed from the pages

### The surgical tables close — an entire section

```
What is still open
Regulatory status is not stated.

The dimensions, motions and load figures on this page are transcribed
from the manufacturer's own specification. Regulatory status and
imaging-system compatibility are not stated in either document, so they
are not stated here.
```

`src/pages/SurgicalTables.jsx`. A page-closing section explaining our sourcing
to a buyer. Replaced with a next step — "Find the table for your room" — keeping
both CTAs that were already there. The sourcing note still exists in full, as
the claims notice at the top of `src/data/orTables.js`.

### The `ComingSoon` "Still to come" checklist

`src/ui/ComingSoon.jsx` rendered the `needs` array as a bulleted list under a
"Still to come" heading. Entries included *"Regulatory status"*, *"Imaging-system
compatibility"*, *"Radiolucency characteristics — no attenuation figure is
published"*, and *"Sign-off on the body copy, which is currently derived from
the application repository"*.

That last one is a note to ourselves, published.

**The prop is still accepted and callers still pass it** — it is simply no
longer rendered. The record stays with the product data where it is useful, and
in [04-open-items.md](04-open-items.md).

### Body copy that narrated the editorial process

| File | Was | Now |
|---|---|---|
| `pages/Technology.jsx` | "…What isn't settled is how to describe the software itself, so rather than fill this page with plausible-sounding claims, here's what's outstanding." | "Automated landmark localisation for neuronavigation is published work. The software built on it is in development, and we would rather talk to you about it than publish specifications before they are settled." |
| `pages/Product.jsx` | "…so rather than fill a spec table with plausible numbers, here's what's outstanding." | "…we will publish them once they are settled — until then, ask us and we will tell you where it stands." |

Titles changed with them: *"X isn't specified yet"* and *"X isn't documented
yet"* both became *"X is in development"*. The status is the same fact; one
states it, the other apologises for it.

### Alt text that announced the backlog

`src/data/technology.js` had
`heroAlt: 'Placeholder image — NaviNetics AI visuals pending'`.

Alt text is read aloud by screen readers and shown when an image fails — so the
one visitor who cannot see the picture was told about our content backlog
instead of what the picture shows. Now describes the photograph. That the
artwork is a stand-in remains as a comment beside it.

## What was NOT touched

All the `NOT HERE, deliberately:` blocks in `src/data/*.js` — `d1.js`,
`orTables.js`, `maven.js`, `neuromodulation.js`, `partners.js`,
`publications.js`. These are **JSDoc comments and never render**. They are the
best documentation in the repository of what was deliberately withheld and why,
and they are exactly where this reasoning is supposed to live.

## How to check this stays true

Before adding copy, ask: *would a surgeon, a purchasing manager or a distributor
have asked this question?* If it is about the state of our content rather than
about the product, it is a comment, not a paragraph.

Grep that surfaces the pattern — note it hits code comments too, which are fine;
what matters is whether a hit is inside a rendered string or JSX:

```bash
rg "still open|isn't specified|is not stated|outstanding|pending|placeholder|not been supplied" src --glob '*.jsx'
```
