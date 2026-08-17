# Copy review — status, and what the words are doing

Branch `founders-portraits-and-copy-consistency`. Reviewed against NaviNetics'
notes of 2026-08-13; **copy applied and re-measured 2026-08-17**.

For how the site *reads* — flow, message, and what each kind of buyer fails to
find — see **`14-editorial-review.md`**. This document is the word-level status.

Everything below is measured from the **rendered** site, not from the source.
Four checks do it, all re-runnable:

```
node tools/check-verbiage.mjs    # agreed terms, claims, implicit comparison, negative framing
node tools/check-outline.mjs     # heading structure and the <=9-word house rule
node tools/check-copy.mjs        # dev-facing language that reached the page
node tools/dump-copy.mjs a.json  # every visible block per route; diff-copy.mjs compares two
```

## Where it stands, in numbers

| | On `main` | Now |
| --- | --- | --- |
| Superlative / comparative claims | 2 | **0** |
| Comparison by implication (product-positioning) | 6 | **0** |
| Dev-facing copy on the rendered site | 2 | **0** |
| Agreed review terms outstanding | 23 | **10** |
| Negative framing, site-wide | 11 | 10 — all explanatory, no action proposed |
| Hedged phrases | 1 | 1 |

139 lines of visible text removed, 143 added, across 15 of 16 routes.

That distinction matters here. This repository keeps careful notes in comments
about what it cannot yet substantiate, and those comments use exactly the words
the review asked us to remove. Grepping the source conflates a correct note to a
maintainer with a sentence published to a surgeon, and it reported findings on
pages that were already clean.

---

## 1 · Where the review list stands

**23 agreed terms still on the page; 1 thing asked for and still missing.**
Counted by route, not by mention.

### Already done on this branch

Verified absent from every rendered route:

| Asked for | State |
| --- | --- |
| Remove "base ring" everywhere | gone |
| Remove "head ring" | gone |
| "collar", not "ring angle" | gone |
| Remove "FDA cleared" | gone — the line is withheld |
| "China", not "Greater China" | done |
| Remove Abbott from partners | gone |
| Add Taiwan | present |
| Add Singapore | present |
| Academic / scientific collaborators section | present |
| Official name **NRSS** on the D1 page | present |
| Patient comfort on the D1 page | present |
| Pre-clinical framing on the MAVEN page | present |
| **MAVEN** in all caps | correct everywhere |
| **NaviNetics** capitalisation | correct everywhere |
| Slogan on the front page | present as the h1 |
| Add Yoonbae Oh as co-founder | present, four portraits |

### Applied 2026-08-14 to 08-17

All of the following were outstanding on 13 August and are now done.

| Route | Before | After |
| --- | --- | --- |
| `/` | `UNPRECEDENTED ACCESS` | `SKULL ANCHOR KEY`, card heading up to `sm:text-3xl` |
| `/` | "Let's talk." | "We would like to hear from you." |
| Who We Are, NRSS | "Robust. Low complexity. **Radically** comfortable." | "Robust. Low complexity. **Comfortable.**" |
| Who We Are | "covered by partners **or a subsidiary**" | "covered by partners" |
| Partners | "**A subsidiary, not a distributor** — …" | "Manufacturing and R&D as well as sales." |
| Partners | "Direct from Rochester." (left dangling by Abbott's removal) | "**Sold direct by NaviNetics.**" |
| NRSS | "affixed to the skull with **percutaneous screws**" ×3 | "fixed to the skull" |
| NRSS | `FDA cleared` in `regulatory.statement` | removed — see below |
| Tables | "**Premium, and made to order.**" | "Also in the range." |
| Tables | "our Korean **subsidiary** — see **NaviNetics Asia**" | "Built by **CBH** in South Korea" |
| MAVEN | channels **Glutamate**, **Acetylcholine** | one **"Other"** channel |
| MAVEN | stimulation channel **DBS** | **"Electrical stimulation"** |
| NaviNetics AI | "It is **in development**…" | removed, and from the page meta |
| Timeline | "NaviNetics Asia — integrated as a **subsidiary**" | "**CBH joins**" |
| Sitewide | five spellings of the anchor key | **`Skull Anchor Key`**, 18 instances |

### Found while applying the above, and not on the review list

Each of these is a defect rather than a preference.

| Where | What | Why it mattered |
| --- | --- | --- |
| `/company/community` | "where the **first** reusable stereotactic system was prototyped" | An unsupported priority claim. A reader takes "first" as *first anywhere*. Now "where the **NRSS** was prototyped". |
| `data/products.js` | **`FDA cleared`** still in `regulatory.statement` | Survived every audit because the field feeds the generic product template, which no route reaches — so a rendered-copy check cannot see it. A withheld claim sitting in data publishes itself the moment that template gets a route. |
| `data/products.js` | "Stereotactic procedures are **constrained by the costs and limitations of commercially available stereotactic devices**" | A disparaging comparative claim about every competing device, unnamed and unsubstantiated. The most exposed sentence found. |
| `data/d1.js` | "**The existing product record** puts patient experience first among its improvements" | Dev-facing: cites one of our own documents to a reader who has never seen it. |
| `SurgicalTables.jsx` | "Named in **the range sheet**… and **nothing is claimed about any of them**" | Same fault, plus our editorial restraint published as page copy. |
| `data/products.js` | "Improved patient experience with Skull Anchor Key **in place of a base frame**" | Retired frame terminology surviving inside a highlights array nobody re-read. |
| `data/d1.js` | "close to where the work is, **rather than out at the rim of a ring**" | Put the retired word "ring" back on the page — inside a comparison, where nobody looks for it. |
| `data/d1.js` | `Fitting · **Percutaneous screws**` | Missed by the prose sweep because it is a meta value, not a sentence. |
| Who We Are, disciplines | "saying the **hardware** is in the way of their hands" | Collateral from this branch's own base-ring sweep: it degraded a concrete surgeon's complaint into a vague one. Restored as "there is **metal where their hands need to be**". |

### Two classes of fault the checks could not see, now covered

**Citing our own paperwork.** Two sentences reached the live page quoting
internal artefacts — the product record, the range sheet. Neither used any word
`check-copy.mjs` looked for. It now flags `product record`, `range sheet`,
`the brochure`, `the deck`, `existing site`, `nothing is claimed` and six more.

**Comparison by implication.** After the explicit superlatives were removed, six
sentences still defined the product against an unnamed alternative — "a key at
the skull *rather than* a frame around the head". No superlative, no competitor
named, so the claim check never saw them. `check-verbiage.mjs` now reports these
separately, because **the shape is not automatically wrong**: "models the
capacitive current *instead of* subtracting a neighbouring sweep" distinguishes
two real techniques and must stay. The test is whether the other side of the
comparison is a *technique* or a *competitor's product*. All eleven surviving
instances are the first kind.

### Still outstanding — blocked on a decision, not on work

| Route | Item | What is needed |
| --- | --- | --- |
| `/technology/navinetics-ai` | "Remove Indirect Targeting, keep Direct below it" | This deletes a whole section (the AC–PC band). Removing half of an *indirect vs direct* argument may leave the other half meaningless. |
| `/company/who-we-are` | pre-clinical in the MAVEN description | Wording has to come from NaviNetics. |
| shared component | the `In development` badge in `ComingSoon.jsx` | Three other pages render it to state their own status. |

### Two that need a decision rather than an edit

**"theatre" vs "theater".** The review says both. One note reads
`theatre - US english`, which reads as *change it to US English*; another reads
`Fix spelling: Theatre`, which reads as *make it Theatre*. This branch has
already moved it to **theater** (US English) in commit `38150fd`. It is
currently `theater` on `/company/community`. Flipping it back is one word — but
somebody has to say which.

**"deep brain stimulation" outside MAVEN.** The review asked for DBS to become
"electrical stimulation" *on the MAVEN page*. The phrase also appears in four
other places where it is not marketing language and should almost certainly
stay:

- `/company/our-founders` — Dr Lee's biography, a statement of his research field
- `/resources/publications` — inside published paper titles, which cannot be edited
- `/technology/neuromodulation` — describing the clinical technique itself
- `/resources/education` — teaching what DBS *is*

Only the MAVEN page instance is in scope as written. The checker flags all five
so none is missed; four of them should be dismissed.

---

## 2 · Negative framing

**Eleven instances across sixteen routes, and none of them is a pattern.**

| Route | Count | Words |
| --- | --- | --- |
| `/technology/neuromodulation` | 4 | problem, difficult, wrong |
| `/company/who-we-are` | 1 | wrong |
| `/company/community` | 1 | wrong |
| `/products/d1-stereotactic-frame` | 1 | limitation |
| `/products/carbon-fiber-surgical-tables` | 1 | awkward |
| `/technology/navinetics-ai` | 1 | fails |
| `/resources/education` | 1 | problem |
| `/contact` | 1 | problem |

This is a good result and it is worth saying so plainly: the site does not sell
the problem. There is no page that opens on trauma, burden or failure, and no
route where the negative vocabulary is dense enough to set a tone.

The four on `/technology/neuromodulation` are the only cluster, and they are a
technology page explaining what is hard about measuring neurochemistry — which
is the one context where naming the difficulty is the argument. They read as
scientific framing, not as pessimism. **No action recommended.**

For hedged language the finding is the same shape: one instance site-wide
("strive to", on Who We Are). A site with this little hedging reads as one that
commits to what its products do.

---

## 3 · Comparative and superlative claims

**Two, and one of them is the more serious kind.**

**`/` — "UNPRECEDENTED ACCESS".** Already on the removal list. Worth
understanding *why* it is worth removing beyond the review's say-so: it is a
comparative claim about every other stereotactic system on the market, made
without naming one, and a manufacturer is expected to hold substantiation for
that. The replacement should be a specific fact about the anchor key, not a
softer superlative.

**`/company/community` — "the first reusable stereotactic system was
prototyped".** Not on the review list, and it should be. "First" is a priority
claim. If it means *the first one NaviNetics built*, the sentence needs to say
so. If it means *the first one anyone built*, that needs a citation. As written
a reader takes the second meaning, which is the one we cannot support.

Beyond these two the site is clean. There is no "best", no "leading", no
"revolutionary", no comparison to a named competitor. Against the usual standard
for this industry that is unusually disciplined.

---

## 4 · Page flow

Structure of all sixteen routes, from `check-outline.mjs`.

### The homepage is complete, and it is the right length

227 words, nine headings:

```
h1  Targeting the future. Improving today.        ← the slogan, as asked
  h2  NaviNetics Reusable Stereotactic System (NRSS)   ← official name, as asked
  h2  Carbon Fiber Surgical Tables
  h2  MAVEN Neuromodulation                            ← all caps, as asked
  h2  Built to improve the whole workflow.
    h3  Fixation by a small skull anchor key
    h3  Mayo Clinic roots
    h3  Closed-loop, one day
  h2  Let's talk.
```

Three products, each named the way the review asked, then the argument for the
whole workflow, then a close. Nothing from the review is structurally missing.
The three outstanding items on this page are wording, not shape:
the `UNPRECEDENTED ACCESS` eyebrow, the lowercase skull anchor key, and the
closing line.

At 227 words it is the shortest page on the site apart from the two index pages.
For a company homepage that is a deliberate and defensible choice — it is a
routing page, and every claim it makes is carried on a page that can support it.

### Where the shape is uneven

| Route | Words | Headings | Note |
| --- | --- | --- | --- |
| `/resources/education` | 1432 | 21 | four times the next-longest product page |
| `/technology/neuromodulation` | 1079 | 10 | |
| `/technology/navinetics-ai` | 925 | 16 | |
| `/company/our-founders` | 758 | 5 | 150 words per heading — dense, unbroken |
| `/products/maven-neuromodulation` | 668 | 6 | |
| `/products/carbon-fiber-surgical-tables` | 570 | 6 | |
| `/products/d1-stereotactic-frame` | 556 | 8 | |
| `/technology/stereotactic-devices` | 261 | 9 | 29 words per heading — thin |
| `/resources/media` | 81 | 7 | index page |
| `/resources/careers` | 84 | 2 | index page |

Two observations that the review has not covered:

**The three product pages are consistent with each other** — 556, 570 and 668
words, six to eight headings each. A reader comparing NRSS against the tables
against MAVEN gets the same depth each time. That is worth protecting through
the coming edits, several of which remove text from one product page and not the
others.

**`/technology/stereotactic-devices` is thin at 261 words over nine headings.**
It has the heading structure of a substantial page and about a third of the
copy. It is also the page the review renames to NRSS terminology, so it is
already being opened.

**`/resources/education` at 1432 words is the outlier**, and the review already
addresses it: split into `Tech/stereo` and `Tech/neuromod`. The measurement
supports that — it is carrying two subjects' worth of material.

### Two structural defects

Both are accessibility and search faults rather than editorial ones:

- **`/company/partners`** — heading level jumps `h1 → h3`, skipping `h2`.
- **`/resources/careers`** — same, `h1 → h3`.

A screen reader announces the outline; a skipped level tells someone navigating
by heading that they have missed a section. Both are a one-word tag change.

---

## 5 · What this does not cover

- **The visual and interaction items.** Animations, GIF quality, the table
  variant bug, figure redesigns, the NBAR rods, video. Roughly half the review
  list is visual and none of it is measurable by reading text.
- **Whether the remaining copy is *good*** — only whether it contains the things
  the review named. A sentence can pass every check here and still be worth
  rewriting.
- **`/technology/stereotactic-devices` being thin** is measured, not diagnosed.
  Whether it needs more copy or fewer headings is an editorial call.
