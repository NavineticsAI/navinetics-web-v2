# Editorial review — how the site reads, 2026-08-17

A full read-through of all sixteen routes as three named readers, done against the
**rendered** text rather than the source. Reproduce the inputs with:

```
node tools/dump-copy.mjs out.json      # every visible text block, per route, in order
node tools/check-outline.mjs           # heading hierarchy and word count, per route
```

The three readers, because "does it read well" is not answerable in the abstract:

| | Who | What they are deciding |
| --- | --- | --- |
| **A** | Functional neurosurgeon, DBS practice | Whether to trial the NRSS |
| **B** | Neuroscience research director | Whether to buy MAVEN for their lab |
| **C** | Distributor / business development | Whether NaviNetics is a real partner |

Nothing in this document is a copy edit that has been applied. It is the finding
list. What has already been fixed is in `13-copy-review-status.md`.

---

## 1 · What is genuinely working

Recorded first, because the rest of this document is critical and the length is
not proportional to the state of the site.

- **`Low complexity is a safety property, not a cost saving.`** The single best
  positioning line on the site. It converts a modest-sounding attribute into a
  clinical argument and names no competitor.
- **The NaviNetics AI status ladder** — `COMPLETE / IN PROGRESS / NEXT / PLANNED`,
  closing on *"No submission has been made, and no clearance is claimed."* This is
  the best regulatory writing in the repository and should be the template for
  every product page.
- **`NaviNetics AI — 0 papers — No peer-reviewed work has been published under
  this line yet.`** Publishing an empty category buys more credibility than
  hiding it ever would.
- **The device-complaint pathway on `/contact`**, including the instruction to
  telephone if a patient was harmed. Unusual on a marketing site, and it signals
  a real quality system to reader C.
- **`/resources/education`** in full — self-sequencing, interactive, and the only
  place the site teaches rather than asserts.
- **The NRSS page's section order** — fix, target, advance, work. That is the
  procedure in the order a surgeon performs it.
- **The homepage subhead**, which is the best sentence on the site.

---

## 2 · The first ten seconds

The homepage's visible text, in order:

```
NAVINETICS
Targeting the future. / Improving today.
Stereotactic frames, neuromodulation instruments and carbon-fiber operating
tables for functional neurosurgery — designed with the clinicians who use them,
out of the Neural Engineering and Precision Surgery Laboratories at Mayo Clinic.
Discover the NRSS · Who we are
```

**The subhead does all the work and the h1 does none.** Line 3 gives every reader
what they need — category, field, method, provenance — and it sits *below* a
slogan set in the largest type on the page. The first second is spent on a pun.

Four faults, in order of cost:

1. **`engineered so stimulation artifact never contaminates the recording`**
   (proof tile) contradicts **`engineered to minimize stimulation artifact`**
   (product card) — on the same screen, about the same feature. "Minimize" is the
   house position and is what the MAVEN page says. **"Never contaminates" is an
   absolute claim and is the most exposed sentence on the site.**
2. **MAVEN is presented as a peer product with no preclinical qualifier.** The
   disclosure *"MAVEN is used in preclinical research"* is the last section of the
   MAVEN page. Reader A leaves the homepage believing we sell an intraoperative
   recording device.
3. **`Discover the NRSS` appears above the line that defines NRSS.** The primary
   CTA uses an acronym the visitor has not yet been given.
4. **`100+ peer-reviewed publications` sits directly above `Browse 9 selected`.**
   The 100+ is uncited anywhere; the 9 are meticulously cited. Adjacency invites
   the reader to notice the gap rather than the credibility.

---

## 3 · Flow, per route

### `/products/d1-stereotactic-frame`
Best structure on the site — `Anchored to the skull.` → `Arc-centered.` →
`Down the trajectory.` → `Room to work.` **Leave the spine alone.** But:

- **The intended use is the last paragraph, in past tense, under "Where it came
  from".** *"The brief was a device robust enough for daily use…"* is the only
  place the site says what the NRSS is *for*, and it arrives after the reader has
  decided.
- **No reprocessing section exists** on a page that ships `Key Sterilization
  Tray`, `Frame Sterilization Tray` and lists `Reusable · Yes`.
- **`What it is, in figures.` contains almost no figures.** Six rows, four of
  which restate the hero. No dimensions, mass, materials or accuracy — while the
  *tables* page publishes `2353 × 613 mm`, `594–1044 mm`, `220 kg`. The flagship
  is the least-specified product on the site.
- **Nine kit items are bare names.** `Ground Truth Fixture Kit`, `Key Placement
  Guide (KPG)`, `Screw Kits`… Reader A cannot tell what is in the box, and the
  accuracy-verification tool is left unexplained.
- **`Frameless size, frame workflow. The record's own claim: …`** — *what*
  record? Publication, regulatory file, marketing sheet? The most important
  positioning sentence on the page is anonymous.

### `/products/carbon-fiber-surgical-tables`
- **Sections 2 and 3 are the wrong way round.** The reader must choose between
  `FLOAT 3-MOTION` and `FLOAT + TRENDELENBURG` one section *before* float and
  Trendelenburg are explained. Clearest instance on the site of information
  arriving after it was needed.
- **`RANGE 1 TO 6 MOTIONS`** is claimed where the specified maximum is 4-motion;
  the 6-motion `CST-706` sits in the unspecified group.
- **`V1 / V2 · Non-invasive gamma stimulation`** is not a table. It is a therapy
  modality dropped into a table line-up with no explanation.
- **`Built by CBH in South Korea — see our partners`** is a broken
  cross-reference: the partners page does not name CBH.

### `/technology/neuromodulation`
Strongest page for reader B. `Firing is not the same as releasing.` is a real
thesis. Two faults:

- **Framed as `FOUR PAPERS, OVER EIGHT YEARS, EACH ONE A STEP TOWARD IT` and then
  ordered 2018 → 2024 → 2023 → 2026.** The evidence list lower on the same page
  runs correctly. A page arguing a progression contradicts its own order within
  one scroll.
- **It never says which published methods are in the shipping instrument.**
  MCSWV, deep-learning separation, multimodal recording — all presented as
  research results. Reader B's actual question is what ships.

### `/technology/navinetics-ai`
- **The status disclosure is four sections too late.** 700 words of capability,
  then *"No submission has been made, and no clearance is claimed."* The honesty
  is real and, arriving last, reads as a retraction.
- **The h1 `Stereotaxis, revolutionized. Precision, made easier.`** is the most
  marketing sentence on the site, on the least-validated product, four sections
  above the no-clearance line. Worst pairing in the repository.
- **This is a fourth product line and the site says three.** `/company/who-we-are`
  states `3 · Product lines` and `Three lines of work.` NaviNetics AI has a full
  page, a roadmap and a live demo, and appears in neither count.
- **Nothing described on the page is AI.** Staged fusion, N-localizer rod
  detection, AC–PC targeting and DTI tractography are classical geometry and
  image processing. The only machine learning on the site belongs to the
  voltammetry paper, which is a different product. A technical reader will notice
  that the product named AI contains no described AI.

### `/technology/stereotactic-devices`
- **A factual slip.** `Where you'll find it. / The devices this technology is
  built into.` lists the NRSS **and the carbon fiber tables**. The tables do not
  contain arc-centered stereotactic technology. A stereotactic surgeon reads that
  as sloppiness or overreach.
- 261 words is too thin for a top-level nav slot, and it duplicates education
  topic 02, which covers the same ground better.

### `/company/partners`
Highest-value page for reader C, and it converts nothing.

- **No CTA.** The page ends on a list of ten universities. The one reader it
  exists for has no way to raise their hand.
- **Three of seven territories are the same placeholder**, verbatim: *"A market
  we cover. The organization behind it is still to be named."* Ambiguous exactly
  where clarity matters — open, or taken and confidential? Reader C assumes taken
  and leaves.
- **The supporting stat does not survive checking.** `/company/who-we-are` claims
  `7 · Territories · covered by partners`. The US is sold direct, three are
  unnamed, and two organisations are named anywhere (Paragon Care; CBH, on a
  different page). Seven territories is two named partners.
- **A rendering bug leaks into the text layer**: a run-on blob with missing
  spaces — `United States — Sold direct by NaviNetics.South America — Brazil…` —
  repeating every entry. Probably map fallback text.
- `Scientific collaborators.` lists ten institutions with no statement of what any
  collaboration is. As presented it is a logo wall in text form.

### `/company/our-founders`
- **The commercially decisive facts are buried.** The only occurrence of
  "commercialized" on the site is in Goerss's *third* paragraph. That he founded
  and ran COMPASS International — a stereotactic device company — is paragraph
  four.
- **No CTA and no closing.** A BD reader finishes convinced, with nowhere to go.

### `/products/maven-neuromodulation`
Arc is right — what it measures, what else, why together, what you get out, where
it stands. Same fault as NaviNetics AI: **the qualifier lands last.** The hero is
also a taxonomy wall of sixteen labels before the h1, and **`LFP` renders twice
consecutively** — check for a duplicate.

### `/resources/education`
- **The clearest differentiating sentence on the site is buried ~800 words in:**
  *"Historically the frame was a large ring encircling the head; the NaviNetics
  system fixes near the top of the skull instead, leaving the face clear."* It is
  also a model of how to differentiate without a competitive claim — it compares
  against a **historical category**, not a company, exactly as the tables page
  compares against *"the steel or aluminium a table would otherwise be built
  from"*.
- The real technical substance of the company sits under Resources, at third-level
  nav.

### `/resources/publications`
- **Stale intro.** *"…from the first compact stereotactic system in 2020 to a
  clinical evaluation of the NaviNetics system in 2025."* The first paper listed
  is 2026.
- `NAVINETICS AFFILIATION` badges appear on three papers with no key.

### `/company/community`, `/resources/careers`, `/contact`
Sound; leave largely alone. Two notes: community's `The clinicians are down the
corridor` restates who-we-are's `Design by listening` in nearly the same words;
and `/contact` gives one email and one phone for sales, complaints, press,
careers and distribution combined.

---

## 4 · The message

**There are four stories and no sentence that joins them.**

1. Surgeons and engineers from Mayo building simple, robust stereotactic
   hardware. Strongest, best evidenced, most consistent.
2. The laboratory that can measure neurochemistry during stimulation, heading
   toward closed loop. Compelling — but preclinical, and carrying more page-weight
   than its commercial readiness warrants.
3. Carbon-fiber radiolucent tables built by CBH. Commercially real, editorially
   orphaned: **the page never explains why a stereotactic company sells tables.**
   The logic is obvious and never written — imaging-guided procedures need the
   table out of the image, and imaging-guided procedures are what this company
   does.
4. NaviNetics AI, which the site does not count as a product line.

**The unifying idea already exists in our own copy and is never promoted.** MAVEN
closes on *"Sensing and stimulating electrodes are placed through the same
stereotactic route as the rest of our work — the NRSS and NaviNetics AI"*, and
carries the heading `Placed by the same route.` That is the thought: everything
NaviNetics makes serves one act — getting an instrument to a point inside the
brain, seeing while you do it, and knowing what happened there. Plan it (AI), see
through the table (tables), get there (NRSS), measure what changed (MAVEN). One
sentence, true of all four lines, **requiring no new claim**, currently sitting at
the bottom of the third product page.

**Differentiation without comparison — what works.** Twice the site does this
well, and both times by the same method: state the mechanism, then the
consequence, comparing against a *material* or a *historical category* rather than
a company. Where differentiation fails it is because an adjective was substituted
for a mechanism — `exceptional accuracy`, `RELIABLE AND DURABLE`. **The fix is not
comparison; it is more of what the site already does well.**

**Does the proposition land?** Reader A: partially — the workflow argument lands
hard, the accuracy argument not at all. Reader B: yes on science, no on product.
Reader C: no.

---

## 5 · Voice

The house voice is real and mostly held: `Arc-centered.` `Room to work.` `Every
sweep is kept.` `Geometry does the work.` `Firing is not the same as releasing.`

**Every place it breaks:**

| Page | Text | Problem |
| --- | --- | --- |
| `/` | `exceptional accuracy` | Adjective where a number is mandatory — and the site's own rule is *"Claims that cannot be cited do not appear on this site."* |
| `/technology/navinetics-ai` | `Stereotaxis, revolutionized. Precision, made easier.` | Most marketing sentence on the site, on the least-validated product |
| `/technology/navinetics-ai` | `The future of stereotaxis is being developed here.` | Claims everything, says nothing |
| `/products/carbon-fiber-surgical-tables` | `RELIABLE AND DURABLE` · `CUSTOM SOLUTIONS` · `GLOBAL SERVICE SUPPORT` | Adjective-only brochure filler. The last is also a service commitment with nothing behind it. |
| `/company/our-founders` | h1 `The visionaries.` | Self-congratulatory on an otherwise plain site |
| `/` | h1 `Targeting the future. Improving today.` | Slogan where the subhead does the work |

**Too terse to be useful:** the nine kit items; `Load capacity 230` with no unit
on who-we-are (the tables page says `230 kg`); `6 · Disciplines · clinical,
engineering, regulatory` — says six, names three; `The library.` for 82 words and
five photographs.

**Too dense:** MAVEN's sixteen-label hero; a 45-word run-on closing
neuromodulation's opening section.

**Would confuse a clinician:** *"Artifact minimized at the integration… dealt with
where the channels meet"* — the sentence reader B cares most about is a
euphemism that names no mechanism, on a site whose voice promises mechanism.

### The terminology fault that matters clinically

The same rotational axis has two names across four pages:

| Page | Word |
| --- | --- |
| `/products/d1-stereotactic-frame` | **ring** — "the ring and the arc choose the trajectory", "Angular rotations 2 — ring, arc" |
| `/technology/stereotactic-devices` | **ring** — "Ring and arc angles then set the approach trajectory" |
| `/resources/education` | **collar** — "TWO ROTATIONS / Collar · Arc" |
| `/technology/navinetics-ai` | **collar** — "Entry, target, collar and arc" |

A surgeon dialling coordinates needs one word. **Note the review already decided
this: "collar", not "ring angle" — so the two `ring` pages are outstanding, and
"ring" is also retired terminology.**

Minor: the route is `/products/d1-stereotactic-frame` while every visible word
says NRSS. Anyone sharing that link shares a legacy internal name.

---

## 6 · Gaps each reader hits

### Reader A — functional neurosurgeon
The workflow writing buys their attention. Then they look for, and do not find:

- **An accuracy number — any number.** `exceptional accuracy`, a `Ground Truth
  Fixture Kit` in the parts list, and two validation papers cited by title only.
  **The numbers were published and the site will not state them. Largest single
  gap on the site.**
- **Reprocessing** — method, cycle, validated parameters, lifetime. Zero words.
- **Regulatory status of the NRSS.** Nowhere — while NaviNetics AI's status is
  scrupulous.
- **Compatibility** — whose DBS leads, which microdrives, which MER systems,
  which navigation.
- **MR conditions** — no field strength, no MR-safe/conditional statement.
- **Patient positioning** — supine/lateral/prone, OR table interface, headrest.
- **Skull fixation specifics** — screw count, torque, thin or pediatric skull,
  single-use vs reusable.
- **Setup** — `Low complexity` is the core claim with no step count and no time.
- **Anyone using it** — no case count, named surgeon, named hospital or site.
- **How to try it** — no demo, loaner, trial, spec sheet, IFU download, or rep.

### Reader B — research director
- **No specifications at all** — channels, sampling rate, scan rate, temporal
  resolution, detection limits, electrode dimensions or lifetime.
- **The artifact answer is a non-answer.**
- **What ships vs what was published** — is the deep-learning discrimination in
  MAVEN or only in the paper?
- **Wireless contradiction.** who-we-are attributes `Telemetry · Wireless` to
  MAVEN; the MAVEN page never mentions telemetry; `/resources/media` attributes
  wireless recording to a `WINCS Harmoni device` that appears nowhere else and is
  never explained.
- **Software** — OS, data format, export path.
- **Preparation** — species, acute vs chronic, freely moving vs head-fixed.
- **Cost of adoption** — no price, quote path, lead time, install, training, or
  consumable cost for the carbon-fiber microelectrodes.

### Reader C — distributor / BD
- **No way to raise a hand** — no distributor CTA, no partner route, one `info@`.
- **Territory availability ambiguous** (three identical placeholders).
- **Partner count does not survive checking** (7 claimed, 2 named).
- **No company facts** — founded when, entity, headcount, ownership, funding, the
  Mayo licensing/equity relationship, or whether the Co-CEOs are full-time.
- **No regulatory position for any shipping product** — no FDA, CE, KFDA, ISO
  13485, while the complaint procedure implies a quality system.
- **Manufacturing is a rumour** — CBH named on the tables page, absent from
  partners.
- **No traction** — units, reference sites, news, events.
- **No IP position** — patents appear only inside two founder bios.
- **No team beyond four founders.**

---

## 7 · Ranked improvements

Impact order. None of these invents a claim; several ask for a claim we already
published to be stated, or for an existing sentence to be moved.

| # | Page | Change | For |
| --- | --- | --- | --- |
| 1 | `/products/d1…`, `/` | Put a real accuracy figure from our own validation papers in the spec table; replace `exceptional accuracy`. If it cannot be stated, say why and link the papers. | A |
| 2 | `/products/d1…` | Add a reprocessing section — method, what is reusable vs single-use, what the two trays are for. | A |
| 3 | `/company/partners`, `/company/who-we-are` | Distribution CTA with a named contact; state which territories are open; name CBH; restate the `7 territories` stat defensibly. | C |
| 4 | `/` | Harmonise `never contaminates` → `minimize`; add a preclinical qualifier to the MAVEN card; cite or reframe `100+`. | All |
| 5 | `/products/maven…` | Name the artifact mechanism in one sentence; add a specification block; resolve the wireless/WINCS contradiction. | B |
| 6 | `/technology/navinetics-ai` | Move the status block under the hero; replace the h1 with a mechanism-first line. Replicate the status pattern on NRSS and MAVEN. | A, C |
| 7 | `/products/carbon-fiber…` | Swap sections 2 and 3; explain or remove `V1 / V2`; replace adjective-only tiles with mechanism. | A |
| 8 | `/products/d1…` | Put real figures in `What it is, in figures.`; describe the nine kit items; move intended use up. | A |
| 9 | `/technology/neuromodulation` | Reorder sections chronologically; state which methods ship in MAVEN today. | B |
| 10 | education → `/products/d1…`, sitewide, `/company/our-founders` | Promote the encircling-ring sentence to the product page; standardise **collar** everywhere; give the founders page a CTA. | A, C |

### Quick corrections, separate from the ten above

Small, unambiguous, and each is a factual or consistency error rather than a
judgement call:

- `/technology/stereotactic-devices` — remove the carbon fiber tables from "the
  devices this technology is built into". It is not true.
- `/resources/publications` — intro says "to 2025"; the first paper is 2026.
- `/company/partners` — the run-on, space-less blob leaking into the text layer.
- `/products/maven…` — `LFP` appears twice consecutively in the hero.
- `/company/who-we-are` — `Load capacity 230` has no unit; `6 Disciplines` names
  three; `3 Product lines` omits NaviNetics AI.
- `ring` → `collar` on the two pages still using the retired word.
