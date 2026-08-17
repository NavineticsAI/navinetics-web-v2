# TASK-004 · Facts needed from NaviNetics before launch

**Author:** shubhvmhaske
**Status:** Open — blocked on the company, not on engineering
**Area:** Website · content
**Related:** TASK-001 (published claims and regulatory status)

---

## Why this exists

The site is deliberately scrupulous about not claiming what it cannot cite, and that discipline is
worth protecting — it is rare on a device manufacturer's site and it is the reason there are now zero
comparative claims on this one. The cost of that discipline is that **every gap stays a gap until
somebody hands over the fact.**

The editorial review read all sixteen routes as three buyers — a functional neurosurgeon, a research
director, and a distributor. Each of the items below is something one of them goes looking for and
does not find. **Most are a single sentence once the fact exists.** None can be written here without
inventing it.

Full reasoning: `documentation/dev/shubham/website/14-editorial-review.md` §6.

---

## For the surgeon evaluating the NRSS

| # | Needed | Why they need it |
|---|---|---|
| 1 | **Reprocessing** — validated method, cycle, parameters, reprocessing lifetime, and what is single-use (the screws in particular) | The frame is labelled `Reusable: Yes` and ships two sterilization trays. Their sterile processing department asks before a trial can start. Currently the site says **nothing**. |
| 2 | **Regulatory status of the NRSS** | Withheld by decision on 2026-08-17, and navinetics.com states none either, so the two agree. But the page is then silent where the NaviNetics AI page is scrupulous, and a reader notices the asymmetry. |
| 3 | **Compatibility** — whose DBS leads the accessories fit; which microdrives and MER systems; whether it works alongside existing navigation | The kit lists "DBS lead implantation accessories" without naming a manufacturer. |
| 4 | **MR conditions** — field strength, MR-safe or MR-conditional | The spec lists MR localizers. Nobody can put a frame in a scanner on that alone. |
| 5 | **Setup** — step count, time, or a photographed sequence | "Low complexity" is the core claim and nothing quantifies or shows it. |
| 6 | **Kit item descriptions** — one line each for the nine items, especially `Ground Truth Fixture Kit` and `Key Placement Guide (KPG)` | They are currently bare names. A buyer cannot tell what is in the box. |

## For the research director evaluating MAVEN

| # | Needed | Why |
|---|---|---|
| 7 | **Specifications** — channel count, sampling rate, FSCV scan rate, temporal resolution, detection limits, electrode dimensions and lifetime | There are none on the page. A laboratory will not shortlist an instrument with no specs. |
| 8 | **What the artifact handling actually is** — blanking, isolation, interleave, subtraction? | The page says artifact is "dealt with where the channels meet". It is the sentence this reader cares most about and it names no mechanism, on a site whose voice otherwise always states the mechanism. |
| 9 | **Which published methods ship** — is the deep-learning discrimination in MAVEN, or only in the paper? | Four papers are presented as an arc leading to the instrument; the page never says which of their methods are in it. |
| 10 | **Wireless — yes or no** | `/company/who-we-are` attributes `Telemetry · Wireless` to MAVEN. The MAVEN page never mentions telemetry. `/resources/media` attributes wireless recording to a "WINCS Harmoni device" that appears nowhere else and is never explained. These cannot all be right. |
| 11 | **Software and data** — OS, file format, export path | Implied by "every sweep is kept as its own column"; never stated. |
| 12 | **Consumables** — supply and cost of the carbon-fiber microelectrodes | They are consumable and there is no cost-of-adoption information anywhere. |

## For the distributor

| # | Needed | Why |
|---|---|---|
| 13 | **Which territories are open** | China, Singapore and Taiwan all read "the organization behind it is still to be named", which cannot be told apart from "taken, and we are not saying". They assume taken and leave. |
| 14 | **Company facts** — legal entity, founding year, ISO 13485, headcount, ownership, the Mayo licensing relationship | A diligence check finds none of it. |
| 15 | **Patents held by the company** | They currently appear only inside two founder biographies, which reads as personal rather than corporate. |
| 16 | **Any traction signal** — units, reference sites, named hospitals, events | None. The `Clinical Evaluation` paper implies real cases; the site never says how many. |

## One decision, not a fact

| # | Decision |
|---|---|
| 17 | **What is public versus available on request.** navinetics.com publishes no specifications at all, so there is no existing precedent to follow. Everything in 1–12 depends on this being settled first. |

---

## The one that is already answered

**Accuracy.** Shin, Scheitler, Sharaf et al., *Operative Neurosurgery* 2025;29(1):93–101 — already
cited on `/resources/publications` — reports mean radial error of 0.71 ± 0.33 mm across 32 leads in
17 patients, and less than 0.1 mm difference between O-arm and CT localization.

It was added to the NRSS page on 2026-08-17 and **removed the same day** on the company's
instruction: no performance numbers on the published site while the work is developing. The paper
stays cited in full, so a surgeon who wants the number can read it in its own context.
`src/data/d1.js` carries a note not to re-add it without the company asking.
