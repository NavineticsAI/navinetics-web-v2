# What the live site already says

Reviewed 2026-08-11 against **https://navinetics.com/** (live, fetched) and
`extracted_content.md` in the repo root (an earlier scrape of eight pages).
Both agree; the live fetch is authoritative where they differ.

**The headline:** the live site answers several questions the rebuild lists as
open — and the rebuild is *less* informative than the live site on the single
most important one a buyer asks.

---

## 1 · The live site states FDA clearance. The rebuild does not.

On `/what-we-do/navinetics-frame-system/`, verbatim:

> "NaviNetics has developed an **FDA cleared system** to reduce the burden of
> establishing the stereotactic coordinate system for both the surgeon and the
> patient."

That is the only regulatory statement anywhere on the live site. There is no
510(k) number, no clearance date, no CE/UKCA/TGA/NMPA status, no Rx-only
statement and no indications-for-use block.

**This is a regression in the rebuild.** The audit recorded "no regulatory
status is stated for any product, on any page" as a high-severity gap and
marked it *needs a company decision*. It does not need one: the company already
makes this claim publicly, today. Restoring it is matching an existing public
statement, not inventing one.

**Recommended:** put the clearance statement back on the D1 page in the
company's own words, and ask for the 510(k) number to go with it — a bare
"FDA cleared" with no number is weaker than it needs to be, and the number is
public record once someone confirms it.

## 2 · Two legal entities exist

From `/investment-opportunities/`:

> "**NaviNetics, Inc.** and **NaviNetics NeuroModulation, Inc.** are both seeking
> investment to further our mission…"

That answers the "no legal-entity imprint" open item as far as naming goes. A
footer imprint can name them without waiting on anyone.

## 3 · The components list is fuller than ours — and includes sterilisation

Live site, Frame System components:

| Live site | In our `products.js`? |
|---|---|
| Stereotactic head frame | yes |
| Skull anchor key | yes |
| MR localizer | yes |
| CT localizer | yes |
| X-ray reticles | yes |
| Mechanical microdrive | yes |
| DBS lead implantation accessories | yes |
| **Key sterilization tray** | **no** |
| **Frame sterilization tray** | **no** |
| **Ground truth fixture kit** | **no** |
| **Key placement guide** | **no** |
| **Screw kits** | **no** |

The two sterilisation trays partly answer the "no sterilisation/reprocessing
information for a reusable device" finding — the company already publishes that
the system ships with sterilisation trays. That is not a reprocessing
instruction, but it is more than nothing and it is already public.

"Ground truth fixture kit" is also notable: the live site says "Frame accuracy
verification accessories provided", which is an accuracy-adjacent statement the
rebuild does not carry.

## 4 · Neuromodulation is described as preclinical, by the company

`/what-we-do/neuromodulation/` calls it "Preclinical research for understanding
brain mechanisms" and describes WINCS as a research platform. It makes no
regulatory claim and no human-use claim.

That supports adding a research-use framing to the MAVEN page — again, in the
company's own established language rather than invented.

## 5 · A quote route already exists as a concept

The live contact page carries a **"Quote Request"** block: *"Interested in
learning more about NaviNetics? Drop us a note."* So "request a quote" is not a
new idea to introduce; it is an existing route the rebuild dropped.

---

## Verbiage: live site vs rebuild

| Subject | Live site | Rebuild | Note |
|---|---|---|---|
| The frame | "NaviNetics Frame System"; "NaviNetics Reusable Stereotactic System" | "D1 Stereotactic Frame" | **Naming divergence.** Anyone who has seen the product under the old name will not find it. Needs a deliberate decision, and if D1 is the new name, the old one should appear at least once as an alias |
| Neuromodulation | "NaviNetics NeuroModulation"; "WINCS"; "WINCS Harmoni" | "MAVEN" | Same problem, and WINCS is the name on the published papers |
| Regulatory | "FDA cleared system" | *nothing* | See §1 |
| Home tagline | "TARGETING THE FUTURE" / "IMPROVING TODAY" | "Innovate. Elevate." | Both are abstract; neither says what is made |
| About | "…translate these conversations into **safe, effective and high-quality** device offerings" | "…into instruments built to a quality standard we can stand behind" | **See below** |
| Investors | Dedicated Investment Opportunities page | redirected to `/contact` | The live page is thin (one paragraph + an email), so the redirect loses little — but investors are a named audience the rebuild no longer addresses |
| Careers | Page exists, no roles listed | Page exists, no roles listed | Consistent |
| Legal pages | none | none | The gap is **pre-existing**, not introduced by the rebuild |
| Mayo disclaimer | none | none | Also pre-existing |
| Accuracy figures | none | none | Both sites withhold them — the rebuild's restraint matches company practice |

### On "safe, effective and high-quality"

The rebuild removed this phrase from Who We Are and Contact because "safe and
effective" is FDA's term of art for an authorised device. That reasoning still
holds — **but the same sentence is live on navinetics.com right now**, on at
least three pages, and has been since 2021.

So this is not a page edit. It is a company-wide wording decision that affects
the live site too, and it should be made by whoever owns claims review rather
than settled quietly in a rebuild. Worth noting the phrase is *less* exposed
now than it was: with FDA clearance actually stated, "safe and effective" reads
differently than it does on a page with no regulatory status at all.

---

## What the live site does NOT answer

Still genuinely open, and unchanged by this review:

- The 510(k) number, and the clearance date
- CE / UKCA / TGA / NMPA status for the distributor markets
- Rx-only statement and a formal indications-for-use block
- MR safety — an MR localizer is sold with no MR Conditional statement
- Reprocessing instructions (trays are named; a procedure is not given)
- ISO 13485 or any quality-system statement
- Privacy policy, terms, cookie notice, accessibility statement
- Mayo Clinic endorsement disclaimer
- Partner logo permissions
- Adverse-event / complaint reporting route

---

## CORRECTION: WINCS is not another name for MAVEN

The first version of this review listed `aka: ['WINCS', 'WINCS Harmoni', …]`
on the MAVEN record and shipped a line on the page reading *"Published as
WINCS — the instrument the papers describe."*

**That was wrong. WINCS is an earlier generation**, confirmed by NaviNetics.
The papers describe its predecessor, not MAVEN, and saying otherwise tells a
researcher the wrong thing about what the published work applies to.

Worse, the codebase had already warned against exactly this, at
`src/data/maven.js:61`:

> "If the lineage between MAVEN and WINCS Harmoni is worth stating on the page,
> that is a sentence NaviNetics should supply rather than one to infer from a
> deck."

It was inferred anyway. Both the alias and the page line are removed, and the
reason is recorded in `products.js` so it does not get re-added.

**The general lesson, which applies to the whole of this review:** a name on the
old site is not automatically the same product as a name on the new one. The
D1 equivalence survives that test — `data/nav.js` already redirects
`/what-we-do/navinetics-frame-system` to the D1 page, so the team had already
treated them as one product, and the component list and intro paragraph are that
page's verbatim. "NaviNetics Reusable Stereotactic System" did **not** survive
it: Goerss's biography calls it a "prototype version", so it is not listed.

---

## What was done, 2026-08-11

| # | Change | Files |
|---|---|---|
| 1 | FDA clearance restored to the D1 — status, market, a `number` field left null for the 510(k), and the company's own sentence | `data/products.js`, `pages/D1.jsx` |
| 2 | Five missing components added, including both sterilisation trays | `data/products.js` |
| 3 | `aka: ['NaviNetics Frame System']` on D1, surfaced on the page and in the page description | `data/products.js`, `pages/D1.jsx` |
| 4 | MAVEN stated as a preclinical research instrument, not a cleared device | `data/products.js`, `pages/Maven.jsx` |
| 5 | Legal entity in the footer — **NaviNetics, Inc.**, the single merged entity | `components/Footer.jsx` |
| 6 | Quote route: `?reason=` preselects the enquiry type | `pages/Contact.jsx`, `pages/D1.jsx`, `pages/SurgicalTables.jsx` |

Also removed from the footer: "safe, effective" — it was still there after the
earlier pass. See [06-copy-policy.md](06-copy-policy.md); the phrase remains a
company-wide decision, since it is still live on navinetics.com.

## Actions this review generates

1. **Restore the FDA clearance statement** to the D1 page, in the company's own
   wording. Ask for the 510(k) number to accompany it.
2. **Add the five missing components** to `products.js`, including both
   sterilisation trays and the ground-truth fixture kit.
3. **Add a "NaviNetics Frame System" alias** so the old product name still finds
   the page, and decide whether D1/MAVEN replace or sit alongside the old names.
4. **Add a research framing to MAVEN** using the live site's "preclinical
   research" language.
5. **Name both legal entities** in the footer.
6. **Reinstate a quote route**, which the live site already has.
7. **Escalate "safe and effective"** as a company-wide claims decision, not a
   page edit.
