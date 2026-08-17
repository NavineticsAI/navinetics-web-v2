# PR: Add a fourth co-founder, settle the product names, and rebuild the portraits

**Branch:** `founders-portraits-and-copy-consistency` → `main`
**Type:** Content + copy + assets + performance
**Status:** Local only. **Not pushed.** Ten commits landed, six more to make from the working tree.
**Author:** shubhvmhaske

**Tickets**

| Ticket | Relationship |
|---|---|
| `BUG-129` — MAVEN and NaviNetics AI hold the main thread at ~95% | **Opened by this PR.** §11 fixes the rest of the phone problem; these two routes remain. Supersedes `BUG-128`, which named four routes — two are fixed here. |
| `TASK-004` — Facts needed from NaviNetics before launch | **Opened by this PR.** The 17 gaps §12 found that cannot be written without inventing them. |
| `BUG-128` — Partners and MAVEN peg the main thread | **Superseded** by `BUG-129`. |
| `TASK-001` — Published claims and regulatory status | **Advanced.** The FDA line is settled (withheld), comparative claims are at zero, and the accuracy decision is recorded. Still open for the rest. |
| `BUG-127` — Accessibility: keyboard, dialog, contrast | **Advanced.** Both `h1 → h3` heading skips fixed; the site now has zero structural faults. |

---

## 0. STATUS (2026-08-17) — read this first

- Everything here came from NaviNetics directly, in session, between 12 and 17 August. Several items
  **close open questions the codebase had recorded as blocked** — the NRSS name and the
  CBH/NaviNetics Asia mismatch were both written into source comments as "needs the company to
  decide". They have decided. Those comments are updated in place rather than deleted, so each
  decision is traceable to the file that asked the question.
- **Three working sessions.** The first added Dr Oh and settled the product naming. The second
  applied the company's written copy review (§2.8). The third ran a full editorial read-through as
  three named buyers, acted on it (§12), fixed the phone frame rate (§11), moved Education into the
  technology pages (§2.9), and replaced all four portraits (§2.7).
- **Two regressions were introduced and fixed inside this branch**, both recorded rather than
  quietly patched: recategorising publications took `/technology/neuromodulation` to a blank page
  (§6), and the base-ring sweep degraded a surgeon's quote from a specific complaint to a vague one
  (§2.8).
- **Two tickets are opened by this PR** — `BUG-129` and `TASK-004`. Neither blocks the merge; both
  record what is left and why.
- Verification: build clean, `oxlint` clean, all 17 routes render with no console errors, mobile
  clean across sizes. Six checks written in this PR all pass — §7.

## 1. Summary

Yoonbae Oh joins the founders and all four portraits are replaced. The frame becomes the **NaviNetics
Reusable Stereotactic System (NRSS)**, **MAVEN** is capitalised everywhere, ring terminology is gone,
and the footer draws the real logo instead of a typographic imitation of it.

The company's written copy review is applied in full: no superlatives, no "radically", no
"subsidiary", and MAVEN no longer names two neurochemicals it cannot substantiate. **The site now
carries zero comparative or superlative claims, zero comparisons by implication, and zero dev-facing
copy — all measured, all re-runnable.**

An editorial read-through as three buyers then found what the word-level pass could not: a claim
contradicting itself on one screen, an adjective standing where a published number belongs, a
factual error about which devices carry which technology, and a partner count that does not survive
checking. Those are fixed. It also found the site telling four separate stories with no sentence
joining them — and that the joining sentence already existed, at the bottom of the third product
page. It now leads the home page.

Education stops being a page nobody reached under Resources and becomes the substance of the two
technology pages that own its topics.

And the phone was slow because of an animated blur, not because of anything anyone had guessed:
**`/` went from 3 frames per second to 61.7.**

## 2. What changed — before and after

### 2.1 People

| | Before | After |
|---|---|---|
| Founders listed | 3 | **4** — Yoonbae Oh, Ph.D., Co-Founder |
| Bennet's portrait | old site export, 500×400 | 2026 original, 1200×960 |
| Oh's portrait | — | 2026 original, 1200×960 |
| `/who-we-are` grid | `lg:grid-cols-3` | `sm:grid-cols-2 xl:grid-cols-4` — a fourth card would otherwise sit alone on its own row |
| Publications author lists | `K.H. Lee`, `K.E. Bennet`, `S.J. Goerss` bolded | `Y. Oh` added — he is senior author on the whole Neurochemistry line |
| Neuromodulation, 36-author paper | "Including **both** of NaviNetics' scientific founders" | "**Three of them** are NaviNetics founders" — Bennet, Oh and Lee are all on that byline |

Dr Oh's biography is **only** the three appointments NaviNetics supplied plus the publication record
already on this site. Nothing is inferred. It is three paragraphs where the others run four or five;
that is visible and deliberate, and the file says so.

### 2.2 Product names

| | Before | After |
|---|---|---|
| The frame | "NaviNetics D1 Stereotactic Frame System" | **"NaviNetics Reusable Stereotactic System (NRSS)"** |
| Its slug and route | `/products/d1-stereotactic-frame` | **unchanged** — no link breaks, no redirect needed |
| MAVEN | `name`/`shortName`/`family` in title case | **`MAVEN`** — the last title-case holdouts, and the fields nav, catalogue and page heading all read |
| "base ring" / "head ring" | 12 occurrences | **0** |

`products.js` carried a comment saying the NRSS name was *deliberately not used* because it might
belong to an earlier generation and needed NaviNetics to confirm it. That comment is replaced with
the decision, and records that "D1" survives as slug, route, component and asset folder.

On the ring terminology: those phrases were almost always comparisons against conventional frames
("in place of the typical head ring…"). NaviNetics chose to **delete the comparisons**, not reword
them, so the copy now describes the anchor key on its own terms. Two comparison-table cells could not
be cut without leaving holes in a row and are reworded instead.

### 2.3 Logo

Full spec: **`documentation/dev/shubham/website/12-logo.md`**.

| | Before | After |
|---|---|---|
| Navbar | masked PNG, flat `--logo-ink` `#185273` | **the artwork itself** |
| **Footer** | `Navi<span>Netics</span>` **set in the body typeface** | the artwork, `reversed` |
| Partners tile | raw `logo.png` | the artwork |
| CSS | ~200 lines of mask, stage, blend layers and animation | **removed**, with 4 theme tokens |

Two problems, one cause. The footer was drawing a *typographic imitation* of the wordmark, so every
page showed one mark above the fold and a different one below it. And the lockup everywhere else was
a **CSS mask** — this PNG supplying the silhouette, flooded with one flat colour.

A mask reads only the alpha channel, so the colour was discarded: the gradient across the ribbon,
the fold shading, and the fact that **the mark (`#196184`) and the wordmark (`#164f6a`) are two
different blues**. The flat value matched neither — `#185273`, **ΔE 6.4** against the mark, past the
threshold where a difference is visible. And because the footer had to pin a light ink to stay
legible on its dark band, the light-mode footer did not match the light-mode navbar.

`src/assets/logo.png` was verified **byte-identical to the file navinetics.com serves** (same MD5),
so it is the authoritative master and is now rendered as an `<img>` — the colour cannot drift,
because it is the colour. `nn-600` in `design-language-info/01-foundations.md` is already labelled
"Logo core" at `#164f6a`, which corroborates the measurement.

The footer takes `src/assets/logo-reversed.png`, derived from the same master in CIELAB — lightness
remapped onto a light band, hues held — so the gradient and folds survive. Its band is near-black in
*both* themes, which is why it cannot take the master.

**Given up:** the travelling highlight and hue drift, which only the mask could carry. A rebuild
invention rather than brand, traded for an exact logo. **Worth replacing:** the reversed lockup is
our derivation — an official one from the designer should supersede it.

### 2.4 Home page

| | Before | After |
|---|---|---|
| H1 | "Innovate. Elevate." | **"Targeting the future. Improving today."** — the company's own slogan, which navinetics.com leads with |
| Closing text | "Whether you're a surgeon, a researcher, or a prospective colleague — we'd like to hear from you." | **"We would like to hear from you."** |
| Hero readout | live `X / Y / Z / ◎ ISO-CENTER` coordinates | **removed** — crosshair reticle kept |
| Product plates | floating lens panel, e.g. "DEGREES OF FREEDOM 3 + 2" | **removed** on all three |

Set in sentence case, not the live site's caps: at display size this is the same face every other
heading uses, and caps would read as a different typographic system.

### 2.5 Partners

| | Before | After |
|---|---|---|
| United States | NaviNetics HQ + **Abbott** | NaviNetics HQ |
| Greater China & Singapore | one territory, **Lituo Medical**, covering China + Taiwan + Singapore | **split** — `China` and `Singapore`, no organisation named, Taiwan no longer claimed |
| South Korea | "NaviNetics Asia" + **ELIM DMP** | **CBH** |
| Territories | 5 | 6 |
| Scientific collaborators | — | **10 institutions** |
| Lead paragraph | "The organisations we work with, and the territories they cover." | removed |

**The CBH rename closes a flagged inconsistency.** `partners.js` recorded that the "NaviNetics Asia"
slot was showing the CBH mark — a name and a logo that did not match — and asked for a decision
either way. The name now follows the logo.

China and Singapore each carry a `note` saying the organisation is still to be named. `<Mark>` gained
a `leadOrg()` fallback because four call sites indexed `orgs[0]` blindly and would have crashed on a
territory with none.

The globe was rebaked: `tools/world-dots.mjs` and `src/data/worldDots.js` regenerated together, plus
new `--terr-sg` colour tokens. Singapore is smaller than one dot at 1.5° and bakes to zero, so it
carries a point marker instead.

Collaborator marks are **set in type, not as logos** — Mayo Clinic, Toronto, UT El Paso, Melbourne,
Deakin, Korea, Hanyang, Queensland, Stanford, Samsung Medical Center. The plate fixes the height, so
they are a consistent size by construction. See §8 for why no artwork.

### 2.6 Publications

| | Before | After |
|---|---|---|
| Highlighted paper | the 2025 Operative Neurosurgery paper, lifted into a card above the list | **removed** — it now sits in year order with the rest |
| Categories | 2, derived from the records (Stereotaxy, Neurochemistry) | **3, fixed** — Stereotactic Devices, Neuromodulation, NaviNetics AI |
| Empty category | could not exist | renders with a paper count and an explanatory blurb |

Category names come from `data/technology.js`, so they match the Technology nav exactly. NaviNetics AI
has no papers; NaviNetics chose to show the heading anyway. The section list had to become a fixed
array — derived from the records, a line with no papers did not exist.

### 2.7 Portraits — all four replaced, none of them graded

Full spec and every parameter: **`documentation/dev/shubham/website/11-founder-portraits.md`**.

**The final state is the simplest one, and it took three attempts to get there.** All four portraits
now come from a single retouching pass done outside this repository, delivered at 1402×1122 — already
5:4 — and the pipeline applies **geometry only**: crop, reframe, resize, encode at q92.

| | Before | After |
|---|---|---|
| Lee | 500×400 web export, upscaled **2.34×** on the page | retouched source, 1200×960 native |
| Bennet | 2026 camera original, graded here | retouched source, ungraded |
| Oh | 2026 camera original, graded here | retouched source, ungraded |
| Goerss | 1000×800 web export, **flash-lit and flat** | retouched source, window-lit like the others |
| Colour operations | exposure, white balance, de-glow, S-curve, skin chroma, de-blue | **none** |
| Head height in frame | 0.36 to 0.47 | **~0.495 on all four** |

**Why no grading is now correct rather than merely instructed.** This file exists because the four
portraits came from two eras and did not belong to each other — faces differing by 68 luminance
points, eye lines by 11 points of frame height, Bennet cyan and Oh yellow. That is no longer true.
The four sources are internally consistent: same window, same light, same treatment. **Goerss is no
longer the flash-lit outlier that §9 said only a reshoot could fix.** There is nothing left for the
colour pipeline to correct, and running it anyway would overwrite decisions someone made
deliberately.

**The crops solve for one thing: equal head size.** Measured in the sources, heads ran 384px (Lee),
520 (Bennet), 523 (Oh), 468 (Goerss) — Lee sits noticeably further from the camera. Each box is sized
so the head lands at ~49.5% of the output, the largest common value the four can reach.

**Headroom cannot also be equalised, and that is a property of the sources.** Lee's crown is 29px
from the top edge and Goerss's is 19px, against Bennet's 174px and Oh's 145px. There is nothing above
the first two to crop to. Head size is the difference a reader sees on a row of four cards; headroom
is not, so head size won.

**All four `focus` values were recomputed** — Lee 56%, Bennet 76%, Oh 64%, Goerss 60%. Per §5,
`focus = (faceX − 0.32) / 0.36`, and every faceX changed with its crop. Leaving them would slide each
card's window off the face.

#### Two mistakes worth recording, because both cost time

**Grading a source that was already graded.** The first rebuild ran Lee through §6's recipe — written
for Bennet and Oh — when §7 says plainly *"They are the reference; do not grade them toward the other
two."* It took his face from R/B 1.52 to 1.36 and skin a\* 12.7 to 7.0, and de-glow read the
correctly-exposed Plummer Building as window bloom, dropping the background from L\* 85.9 to 58.8. It
was reported as "blue, dull and weirdly dark", which is precisely what those three numbers describe.

**Measuring the wrong pixels, twice.** `measure-portraits.py` held Lee's face at x=0.62 — the old
export's position — while the recrop had moved it to 0.50, so it sampled the beige building beside
his head and produced numbers about the wrong part of the picture. The same trap caught Oh's
automatic face detection later, which reported his face at x=0.247 — again the building. §8 of the
spec warns about exactly this and it still happened twice. **The crops are hand-measured for that
reason.**

#### One thing for NaviNetics to decide

**The sources are AI-assisted retouches of real people** on a medical device company's website. Each
founder should sign off on their own image before launch. The unaltered originals are kept.

`tools/founder-portraits.py` rebuilds all four in one pass and gained `--only <name>`, because it
previously refused to run unless *every* founder's camera original was on the machine — those files
live on whichever laptop imported the shoot, so in practice it could not run on a second machine.
`tools/measure-portraits.py` is new and checks the shipped files against the spec's targets,
including background colour.

### 2.8 The copy review — the company's written list

Applied from NaviNetics' written review. Every one of these was a decision already taken; none is an
editorial suggestion.

| Page | Before | After |
|---|---|---|
| Home | `UNPRECEDENTED ACCESS` | `SKULL ANCHOR KEY`, card heading up to `sm:text-3xl` |
| Home, Who We Are, NRSS | "Robust. Low complexity. **Radically** comfortable." | "Robust. Low complexity. **Comfortable.**" |
| NRSS | "giving the surgical team **unprecedented space** to work" | "nothing encircles the head — so the face stays clear and the surgical team keeps the field" |
| NRSS | "affixed to the skull with **percutaneous screws**" ×3 | "fixed to the skull" |
| Tables | "**Premium, and made to order.**" | "Also in the range." |
| Tables | "Built by our Korean **subsidiary** — see **NaviNetics Asia**" | "Built by **CBH** in South Korea" |
| Partners, US | "Direct from Rochester." | "**Sold direct by NaviNetics.**" |
| Partners, Korea | "**A subsidiary, not a distributor** — …" | "Manufacturing and R&D as well as sales." |
| Who We Are | "covered by partners **or a subsidiary**" | "covered by partners" |
| Timeline | "NaviNetics Asia — integrated as a **subsidiary**" | "**CBH joins**" |
| MAVEN | channels **Glutamate** and **Acetylcholine** | one **"Other"** channel |
| MAVEN | stimulation channel **DBS** | **"Electrical stimulation"** |
| NaviNetics AI | "It is **in development**…" | removed, and from the page meta |

**"Direct from Rochester" was collateral.** Removing Abbott left the United States row reading as a
shipping origin rather than a sales model — the row exists to say *who sells into this territory*.

**Two changes are not on the review list**, and both are corrections rather than additions:

- **`/company/community`** said the laboratories are "where the **first** reusable stereotactic system
  was prototyped". That is a priority claim, and as written a reader takes it as *first anywhere*
  rather than *first of ours* — the reading we cannot support. Now "where the **NRSS** was
  prototyped", which says the same true thing and claims nothing.
- **The surgeon quote had been degraded by this branch's own base-ring sweep.** It originally read
  "saying the **base ring** is in the way of their hands"; replacing the ring with "the hardware"
  turned a concrete complaint into a vague one. The ring cannot come back, so the specificity is
  restored the other way: "telling you there is **metal where their hands need to be**."

**DBS is changed on MAVEN and nowhere else.** The phrase also appears in Dr Lee's biography, inside
published paper titles on `/resources/publications`, and on the two teaching pages. In those it is
the correct name of a clinical procedure, not product positioning — changing them would misquote the
literature and stop the founders page naming the field Dr Lee actually works in.

### 2.9 Education moves into the technology pages

| | Before | After |
|---|---|---|
| Where it lived | `/resources/education`, third-level nav behind Media and Careers | rendered **into** the two technology pages |
| `/technology/stereotactic-devices` | **261 words** | **791** |
| `/technology/neuromodulation` | 1,079 words | **1,890** |
| Route | its own page | **removed**; both old paths redirect |

It was 1,432 words of the best technical writing on the site — five topics, each with a figure you
can drive — sitting where the reader most likely to want it would never look. Meanwhile
`/technology/stereotactic-devices` ran to 261 words and explained the same arc-centered principle
worse than the education topic did.

**Split by subject, not by page.** `stereotaxy` goes to the stereotactic page; `dbs`,
`neurochemical`, `phasic` and `absolute` go to neuromodulation. Each technology record declares what
it teaches:

```js
teaches: ['stereotaxy'],                                    // stereotactic-devices
teaches: ['dbs', 'neurochemical', 'phasic', 'absolute'],    // neuromodulation
```

**No copy is duplicated.** `EducationTopics` is one component reading one data file; the topic list
is a prop. The scroll-spy rail adapts — four topics get a four-stop rail, one topic gets none,
because a one-stop rail is the heading repeated.

Every internal anchor was repointed to the page that now owns the topic
(`#neurochemical` → `/technology/neuromodulation#neurochemical`), both old paths redirect, and all
twelve check tools were updated.

## 3. New files

| File | Why |
|---|---|
| `documentation/dev/shubham/website/11-founder-portraits.md` | The portrait spec. Not recoverable from the images. |
| `documentation/dev/shubham/website/12-logo.md` | The logo spec — the two official colours, and why masking was removed. |
| `src/assets/logo-reversed.png` | Reversed lockup for the footer's dark band. |
| `tools/founder-portraits.py` | Runnable rebuild. `--check` reports without writing; `--only <name>` rebuilds one. |
| `tools/portraits-src/{lee,goerss}-graded.jpg` | Goerss's is irreplaceable — no original exists. Lee's is now superseded. |
| `public/kevin-bennet.jpg`, `public/yoonbae-oh.jpg` | 2026 portraits. |
| `documentation/dev/shubham/website/13-copy-review-status.md` | The copy review: what the words are doing, and where the review list stands. |
| `documentation/dev/shubham/website/14-editorial-review.md` | How the site reads to three named buyers — flow, message, voice, and the gaps each one hits. Read before sign-off. |
| `tools/measure-portraits.py` | Measures the shipped portraits against the spec's targets — face luminance, R/B, skin a\*/b\*, and background colour. |
| `tools/check-verbiage.mjs` | Audits rendered copy: agreed terms, superlative and comparative claims, negative framing, hedges. |
| `tools/check-outline.mjs` | The heading structure of all 16 routes; flags missing or skipped levels. |
| `tools/dump-copy.mjs`, `tools/diff-copy.mjs` | Dump rendered text per route and diff two dumps — how the before/after tables in §2.8 were produced. |

The old `public/kevin-bennet-150-500x400-1.jpg` is now unreferenced. Left in place deliberately —
deleting it is a separate call.

**All four new checks read RENDERED text, not source.** That distinction is the reason they work: this
repository keeps careful notes in code comments about what it cannot yet substantiate, and those
comments use the exact words the review asked us to remove. Grepping the repository conflates a
correct note to a maintainer with a sentence published to a surgeon, and reported findings on pages
that were already clean.

## 4. Commits

| | |
|---|---|
| `5b1c8cc` | Add Yoonbae Oh as co-founder; re-shoot and re-centre portraits |
| `d800aa9` | Site-wide naming: NRSS, MAVEN, no ring terminology, one logo |
| `f5dd607` | Zoom the 2026 portraits out to full frame |
| `4a03181` | Home: lead with the slogan, drop the instrument overlays |
| `c1f1f44` | Publications: three technology lines, no highlighted paper |
| `071e14f` | Partners: three organisations out, CBH named, China and Singapore split |
| `3f4f4ad` | Portraits: one specification for all four founders |
| `39506aa` | Logo: draw the artwork instead of masking it |
| `80987d3` | Document the branch as a PR ticket |
| `38150fd` | US English, the laboratory's full name, Taiwan, and the FDA line withheld |
| *working tree* | Lee's portrait; the copy review pass; the editorial pass; the performance work; the Education move; audit tooling; three documents |

The working tree should land as **six commits**, in this order, so any one can be reverted alone:

| | Commit | Contains |
|---|---|---|
| 1 | **Rebuild Lee's portrait from the retouched source** | `tools/founder-portraits.py` (`--only`, per-subject grade, geometry-only path), `tools/measure-portraits.py`, `public/kendall-lee-*.jpg`, and the two `focus` values that move with the crop. Docs: `11-founder-portraits.md`. |
| 2 | **Apply the company's copy review** | The 23 agreed terms, across `products.js`, `d1.js`, `maven.js`, `partners.js`, `company.js`, `disciplines.js`, `media.js`, `orTables.js`, `Home.jsx`, `D1.jsx`, `SurgicalTables.jsx`, `Community.jsx`, `NaviNeticsAI.jsx`, `Publications.jsx`. |
| 3 | **Move Education into the technology pages** | `Education.jsx` (`EducationTopics` export, parameterised rail), `Technology.jsx`, `Neuromodulation.jsx`, `technology.js` (`teaches`), `nav.js` (redirects), `AnimatedRoutes.jsx`. |
| 4 | **Act on the editorial review** | Partners and Founders CTAs, the tables section swap, the neuromodulation chronology, the promoted differentiator and unifying sentence, the heading-level fixes, the stat corrections. |
| 5 | **Fix the phone frame rate** | `index.css` (`.nn-glow`), `Hero.jsx`, `motion.js`, `NextSection.jsx`, `MavenHero.jsx`, `PartnerGlobe.jsx`, `SceneBand.jsx`, `ScienceBand.jsx`, `mavenScene.js`, `scrollState.js`, `main.jsx`, `RouteBoundary.jsx`, `AnimatedRoutes.jsx`, `vite.config.js`. |
| 6 | **Add the verification tooling and the review documents** | `check-verbiage`, `check-outline`, `check-copy` additions, `dump-copy`, `diff-copy`, `check-fps-webkit`, `check-busy-cause`, `check-menu-webkit`, `probe-hidden`, `13-copy-review-status.md`, `14-editorial-review.md`, and this file. |

Commit 5 is the one to revert first if anything visual looks wrong on a phone, and it touches no
copy. Commit 3 is the only one that changes URLs.

## 5. Decisions this PR records

Each of these was an open question in the source, and each is now answered in the file that asked it.

| Question | Answer | Recorded in |
|---|---|---|
| Is the frame the NRSS? | Yes. D1 stays as slug/route/component only. | `products.js` |
| Is the Korean subsidiary CBH or NaviNetics Asia? | **CBH** — the name follows the supplied mark. | `partners.js` |
| Should ring terminology be reworded or removed? | **Removed**, comparisons deleted. | `products.js`, `d1.js`, `disciplines.js` |
| What are the publication categories? | The three technology lines, even where one is empty. | `publications.js` |
| Dr Oh's role? | **Co-Founder**. | `Founders.jsx` |
| Does the FDA 510(k) line stay? | **Withheld.** Confirmed 14 August, against an earlier instruction to restore it. | `products.js`, `d1.js` |
| "theatre" or "theater"? | **"theater"** — US English, confirmed 14 August. The review said both. | `Community.jsx` |
| What replaces "radically"? | **Nothing** — "Comfortable." The other two sentences are flat by design. | `products.js`, `D1Hero.jsx` |
| What replaces "unprecedented access"? | A statement of fact, not a softer superlative. | `Home.jsx` |
| How far does the DBS change go? | **MAVEN only.** Not the bio, the paper titles, or the teaching pages. | `maven.js` |
| Is Lee's portrait graded? | **No.** Retouched by hand upstream; the pipeline does geometry only. | `founder-portraits.py` |

## 6. The regression, and what should catch it

`publications.js` renamed its `line` values. `neuromodulation.js:53` still filtered on the old
`'Neurochemistry'`, matched nothing, and `paperFor()` threw on the first chapter — taking
`/technology/neuromodulation` to a **blank white screen**. It rendered 1 word.

Fixed, and the page is back to 1,079 words across 8.6 screens.

**The build passed the entire time.** A filter that silently returns `[]` is invisible to it, and
nothing asserts that a route rendered anything. The cheapest guard is a smoke check that walks every
route and fails if `<main>` holds less than a threshold of text — `tools/check-routes.mjs` already
walks the route list and is the natural home for it. **Not written in this PR.**

## 7. Verification

- `npm run build` clean. `oxlint` clean — two pre-existing `react(only-export-components)` warnings
  in `SceneBand.jsx` and `PartnerGlobe.jsx`, neither introduced here.
- All **16 routes** render, no console errors, checked in Chromium at 1440×900.
- Light and dark both checked on the pages this touches — the footer and partner-tile logo work is
  theme-sensitive by construction.
- Portrait tool reproduces both shipped 2026 files byte-identical.
- **The Node version problem is resolved** (v26.7.0). The Playwright checks run.

Measured after the copy pass, with `tools/check-verbiage.mjs`:

| | Before | After |
|---|---|---|
| Superlative / comparative claims | 2 | **0** |
| Comparison by implication (product-positioning) | 6 | **0** |
| Dev-facing copy on the rendered site | 2 | **0** |
| Agreed review terms still on the page | 23 | **10** |
| Negative-framing instances, site-wide | 11 | 10 — see below |
| Hedged phrases, site-wide | 1 | 1 |
| Spellings of "Skull Anchor Key" | 5 | **1** |

139 lines of visible text removed, 143 added, across 15 of 16 routes — measured by rendering both
branches and diffing, not by reading the source diff.

**Eleven negative instances across sixteen routes is a good result and no action is proposed.** No
page opens on trauma, burden or failure. The only cluster — four on `/technology/neuromodulation` —
is a page explaining what is hard about measuring neurochemistry, which is the argument rather than
pessimism.

Of the 15 outstanding, several are the checker over-firing by design: "deep brain stimulation" in
paper titles and Dr Lee's biography (4 routes), "theater" (kept, by decision), and "skull anchor key"
in running prose where lower case is correct English. The real remainder is §10.

`tools/check-outline.mjs` also found two structural faults, **not fixed here**: `/company/partners`
and `/resources/careers` both skip a heading level, `h1 → h3`. A screen reader announces the outline,
so a skipped level tells someone navigating by heading that they have missed a section.

- `package-lock.json` was reverted after a local `npm install` rewrote it — npm 10.7 strips `libc`
  fields that Linux CI needs. Do not commit a lockfile written by this Node version.

## 8. Deliberately not in this PR

- **Collaborator logos.** Ten institutional marks were attempted and the sourcing was unreliable —
  of four probes, three returned error stubs and the fourth gave Stanford's *athletics* logo rather
  than the university wordmark. These are also third-party trademarks: Mayo Clinic, Stanford and
  Samsung all restrict use by companies, because a logo on a commercial site reads as endorsement.
  Type-set names ship instead. Adding artwork later is one `logo` field each.
- **Everything in the 13 August site audit.** The contact form transmits nothing
  (`VITE_CONTACT_ENDPOINT` is set nowhere, so every enquiry — and every device complaint — falls to a
  `mailto:` handoff); no product states an indication for use; a reusable Class II instrument has no
  reprocessing information; the generic product template is reachable by no route, stranding six NRSS
  highlights and all of MAVEN's specs. **None of it is touched here.** It wants its own tickets.
- **Deleting the superseded Bennet portrait.**
- **A route smoke test** (§6).

## 9. Known limitations

**Everything §9 previously listed is resolved.** The 2.34× upscale on Lee, the flash-versus-window
lighting mismatch, and Goerss needing a reshoot were all fixed by the retouched sources. What
remains:

- **Headroom differs across the four portraits** and cannot be equalised — Lee's crown sits 29px from
  his source's top edge and Goerss's 19px, against Bennet's 174px and Oh's 140px. Bennet and Oh are
  cropped down to meet them; the other two have nothing above to crop to. All four crowns now land
  within a few points of each other, which is as close as the sources allow.
- **The portraits are AI-assisted retouches of real people.** Each founder should sign off on their
  own image before launch. See §2.7.
- **`/products/maven-neuromodulation` and `/technology/navinetics-ai` are still canvas-bound** —
  `BUG-129`, opened by this PR.
- **The comparison grid in `data/products.js` stays unpublished.** `published: false`,
  `needsReview: true`. It contains direct comparative claims against traditional and frameless
  systems and needs regulatory sign-off before that flag moves.

## 10. What the review still asks for, and is not here

**All three items that were blocked on a decision have been decided** (2026-08-17):

| Item | Decision |
|---|---|
| "Remove Indirect Targeting, keep Direct below it" | **Keep both.** Indirect finds a target that is invisible on the scan by measuring from landmarks that are not; direct aims at the tract itself. Deleting either leaves the other meaningless. |
| MAVEN's pre-clinical framing on Who We Are | **"A pre-clinical research device:"**, leading the product summary — which feeds the home page card, Who We Are and the catalogue tile at once. |
| The `In development` badge | **Removed everywhere**, all four call sites and both nav panels, not only the page the review named. |

What is left of the review is **visual**: animations, GIF quality, figure redesigns, the NBAR rods,
video, and the reported table-variant bug. None of it is in this PR and none of it is measurable by
reading text.

## 11. Performance — the phone problem, and what fixed it

Reported as: on a phone the header appears but scrolled content "takes a bit to load", and the
hamburger "seems frozen". Both were real and neither was what they looked like.

**The diagnosis took four wrong guesses first**, and the wrong ones matter because each was
confidently held: the menu's own handler (1ms — not it), `backdrop-filter` (A/B'd with the blur
forced off — no change), the canvases (hidden — no change), CPU contention (home measured 0% busy).

What it actually was: **frame cadence**. Measured in real WebKit with the page idle, `/` ran at
**3fps**. Nothing can appear before the next frame, so at 400ms per frame every interaction on the
page inherits that wait — a menu whose handler takes 1ms still takes 400ms to show, and a
scroll-reveal needing a run of frames inherits it several times over. It also explains why Chrome
with a 4× CPU throttle showed nothing: the throttle slows *script*, and this was not script.

Two causes, and isolating them needed both halves removed independently:

| | `/` idle fps |
|---|---|
| As shipped | 3.0 |
| `filter: none` | 36 |
| `animation: none` | 62 |

- **An animated blur.** Two decorative discs in the shared `<Hero>` used `filter: blur(90px)`, which
  must be *rasterised* — not a cheap compositor effect. Replaced with a radial gradient that paints
  straight into the layer. Visually equivalent at 0.1 alpha; free to composite.
- **The navbar logo's four infinite CSS animations**, which forced that blur to re-rasterise every
  frame, forever, on every page. **Already fixed on this branch** by commit `39506aa`, which replaced
  the CSS-masked lockup with the artwork — so half the problem was solved before this work started.

### Also fixed

- **Scroll-reveals fired 80px too late.** `viewport.margin` was `-80px`, which *shrinks* the observer
  root: a block had to travel 80px past the screen edge before it began a 420ms fade. On a phone a
  thumb-flick covers a screen height in a few hundred ms, so the reader outran the animation and
  scrolled into blank space. Now a positive pre-trigger — same animation, earlier start.
- **MAVEN's opening rewrote ten style properties across five elements every frame**, uncapped, for as
  long as the page was open — including the whole way down a long page where none of it is visible.
  Now gated on visibility and capped at 30fps.
- **The partners globe re-projected the world at 30fps forever.** Now 12fps when merely drifting
  (4°/s means 0.33° per frame — nothing resolves either way) and 30fps the moment it is touched.
- **The voltammogram field was rebuilt pixel by pixel every frame** — 30,624 pixels, each looping
  over Gaussian lobes calling `Math.exp`. Three of the four terms never varied: the lobes depend only
  on position, the divider only on the row, and the striation was recomputed 132 times per frame for
  the same 232 values. Hoisted into lookup tables. Arithmetically identical output.
- **Two shared band components painted into hidden tabs.** Now gated on `document.hidden`.

### Measured, real WebKit, page idle

| Route | Before | After |
|---|---|---|
| `/` | **3.0 fps** | **61.7** |
| `/contact` | 4.3 | 57 |
| Education topics | 4.3 | 50.3 |
| `/products/d1-stereotactic-frame` | 34 | 56 |
| `/company/partners` | 20 | 27.7 |
| `/products/maven-neuromodulation` | 9.3 | **5.7 — still bad** |
| `/technology/navinetics-ai` | 19 | **11.7 — still bad** |

Absolute numbers are pessimistic: Playwright's WebKit on Windows has no GPU, so everything a phone
hands to hardware is done in software. The comparison is what holds.

**MAVEN and NaviNetics AI are not fixed.** Both remain canvas-bound — isolating with
`tools/check-busy-cause.mjs` takes MAVEN from 94% of a throttled CPU to 1% with the canvases hidden.
The field optimisation above did not move it, which means the cost is elsewhere on that page and
still unidentified. **`BUG-128` stays open**, narrowed to those two routes.

Also fixed here: `vite.config.js`'s SPA-fallback plugin threw `ENOENT` on `dist/index.html` whenever
a build failed, **replacing the real error with a misleading one about the deploy config**. It now
checks and warns instead.

New tooling, all re-runnable: `check-fps-webkit.mjs` (frame cadence idle and scrolling, with
isolation columns), `check-busy-cause.mjs` (what saturates the thread, per route),
`check-menu-webkit.mjs`, `probe-hidden.mjs`.

## 12. The editorial read-through — what it found

Full document: **`documentation/dev/shubham/website/14-editorial-review.md`**. All sixteen routes,
read as three buyers, against rendered text. **Nothing from it is applied.** It matters here because
it changes what "done" means: the word-level review this PR implements is finished, and what remains
is structural.

### The four findings that are claim or accuracy risks

| Where | Finding |
|---|---|
| `/` | **`engineered so stimulation artifact never contaminates the recording`** sits on the same screen as `engineered to minimize stimulation artifact`. "Minimize" is the house position and what the MAVEN page says. The absolute form is the most exposed sentence on the site. |
| `/` | **`exceptional accuracy`** — an adjective standing where a number was published, on a site whose own rule is *"Claims that cannot be cited do not appear on this site."* Two validation papers are cited by title; their figures are not stated anywhere. |
| `/technology/stereotactic-devices` | Lists the **carbon fiber tables** among "the devices this technology is built into". They do not contain arc-centered stereotactic technology. Factually wrong. |
| `/company/who-we-are` | **`7 · Territories · covered by partners`** — the US is sold direct, three territories are unnamed placeholders, and two organisations are named anywhere. A distributor does that arithmetic in thirty seconds. |

### The structural findings

- **MAVEN is presented on the homepage as a peer product with no preclinical qualifier.** The
  disclosure is the last section of its own page. Reader A leaves the homepage believing we sell an
  intraoperative recording device.
- **NaviNetics AI is a fourth product line the site counts as three**, and — separately — nothing
  described on that page is AI. Staged fusion, N-localizer detection, AC–PC targeting and DTI are
  classical geometry. The only machine learning on the site belongs to a MAVEN paper.
- **The NRSS is the least-specified product on the site.** `What it is, in figures.` has four of six
  rows restating the hero, no dimensions, no mass, no accuracy — while the *tables* page publishes
  `2353 × 613 mm` and `220 kg`. It also ships two sterilization trays and says **nothing about
  reprocessing**, and lists nine kit items as bare names.
- **The rotational axis is called `ring` on two pages and `collar` on two others.** The review
  already decided *collar*, and *ring* is retired terminology — so this is both an inconsistency and
  an outstanding review item. A surgeon dialling coordinates needs one word.
- **`/company/partners` has no CTA**, three identical "still to be named" placeholders, and a
  broken cross-reference — the tables page says "Built by CBH… see our partners" and partners does
  not name CBH. It is the page reader C is here for and it converts nobody.
- **`/technology/neuromodulation` is framed as a progression and ordered 2018 → 2024 → 2023 → 2026**,
  while its own evidence list below runs correctly.
- **Both `/technology/navinetics-ai` and `/products/maven-neuromodulation` put their honest status
  disclosure last**, after the reader has formed a view. Arriving last, honesty reads as retraction.

### The one that is an opportunity rather than a fault

**The unifying sentence already exists in our copy and is never promoted.** MAVEN closes on
*"Sensing and stimulating electrodes are placed through the same stereotactic route as the rest of
our work — the NRSS and NaviNetics AI"*, under the heading `Placed by the same route.` Everything
NaviNetics makes serves one act: get an instrument to a point inside the brain, see while you do it,
know what happened there. Plan it, see through the table, get there, measure what changed. **One
sentence, true of all four lines, requiring no new claim**, currently at the bottom of the third
product page.

Similarly, the clearest differentiating sentence on the site is ~800 words into `/resources/education`:
*"Historically the frame was a large ring encircling the head; the NaviNetics system fixes near the
top of the skull instead, leaving the face clear."* It is also the model for how to differentiate
without a competitive claim — it compares against a **historical category**, not a company.

### What was applied from the review

Everything in categories 2 and 3 below is **done**. What remains needs facts only NaviNetics has.

| From the review | Applied |
|---|---|
| `never contaminates` vs `minimize` on one screen | harmonised to **minimize** |
| `exceptional accuracy` — adjective where a number belongs | **removed**; no figure published, by decision |
| `100+` publications, uncited, above "Browse 9 selected" | now **9, each cited** |
| MAVEN presented as a peer product | **"A pre-clinical research device:"**, leading the sentence |
| `Discover the NRSS` used an acronym defined further down | **"Discover the frame"** |
| `/technology/stereotactic-devices` claimed the tables carry arc-centered targeting | **removed** — it is not true |
| `ring` on two pages, `collar` on two others | **collar**, sitewide |
| `7 Territories covered by partners` (2 named) | **"served, direct and through partners"** |
| `6 Disciplines` naming three · product lines omitting the tables | both units now match their counts |
| Partners had no CTA, and no CBH | **distribution CTA**, and CBH named so the tables cross-reference resolves |
| Founders page dead-ended | **closing CTA** |
| Publications intro said "to 2025" above a 2026 paper | **derived from the records** |
| Tables: models offered before float was explained | **sections swapped** |
| `V1 / V2` unexplained in a table line-up | now says what it is — a gamma stimulation platform |
| `RELIABLE AND DURABLE` · `CUSTOM SOLUTIONS` · `GLOBAL SERVICE SUPPORT` | replaced with properties the page demonstrates; the third was a **service commitment nothing stood behind** |
| Neuromodulation ran 2018 → 2024 → 2023 → 2026 | **chronological** |
| duplicate `LFP` in MAVEN's hero | `sub` cleared |
| `h1 → h3` on Partners and Careers | **both fixed** — zero structural faults remain |
| the differentiator buried ~800 words into the education material | **promoted** to the NRSS fixation section |
| the unifying sentence at the bottom of the third product page | **promoted** to the home page lead |

### Still blocked on NaviNetics

None of these can be written here without inventing facts:

| | Why it blocks |
|---|---|
| **Reprocessing** | The NRSS is `Reusable: Yes` and ships two sterilization trays, and the site says nothing about method, cycle, parameters or lifetime. A hospital's sterile processing department asks before any trial. |
| **NRSS regulatory status** | Withheld by decision — and navinetics.com states none either, so the two agree. But the page is then silent where the AI page is scrupulous. |
| **MAVEN specifications** | Channels, sampling rate, scan rate, temporal resolution, detection limits, electrode lifetime, data format. A laboratory will not shortlist an instrument with no specs. |
| **Compatibility** | Whose DBS leads; which microdrives; MR field strength and MR-safe/conditional status. |
| **Territory availability** | Three territories read "still to be named", which a distributor cannot tell from "taken, and we are not saying". |
| **Company facts** | Entity, founding year, ISO 13485, company-held patents (they appear only inside two founder bios), headcount, the Mayo licensing relationship. |
| **Public vs on-request** | navinetics.com publishes no specifications at all, so there is no existing precedent to follow. |

**The accuracy figure is a special case and worth recording.** It is published and good — Shin,
Scheitler, Sharaf et al., *Operative Neurosurgery* 2025;29(1):93–101 reports mean radial error of
0.71 ± 0.33 mm across 32 leads in 17 patients, already cited on `/resources/publications`. It was
added to the NRSS page and **removed the same day on NaviNetics' instruction**: no performance
numbers on the published site while the work is developing. The code carries a note not to re-add it
without the company asking.
