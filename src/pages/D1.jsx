import { usePageMeta } from '../lib/meta.js';
import { getProduct } from '../data/products.js';
import { bands } from '../data/d1.js';
import { asset } from '../lib/asset.js';
import * as D1_SCENES from '../lib/d1Scenes.js';
import { Button, Reveal, Section, SectionHead } from '../ui/index.js';
import { D1Hero } from '../ui/D1Hero.jsx';
import { ScienceBand } from '../ui/ScienceBand.jsx';

const BUILDERS = {
  anchor: D1_SCENES.makeAnchor,
  arc: D1_SCENES.makeArc,
  drive: D1_SCENES.makeDrive,
  access: D1_SCENES.makeAccess,
};

const TESTIMONIALS = [
  {
    name: 'Dr. Erich Fonoff',
    role: 'Neurosurgeon, Professor (Livre-Docente) at the University of São Paulo School of Medicine, and Director of Instituto Parkinson Hoje, São Paulo, Brazil',
    image: asset('/erich-fonoff.jpg'),
    /* Top-aligned. The photo is portrait (1153 × 1600) and the avatar is a
       circle, so only a square of it shows and all the slack is vertical.
       Centred, that square started at 14% of the height and cut off the top
       of his head, leaving his face at the rim with the suit below it. At 0%
       the whole head is in and his eyes sit just above the middle. */
    imagePosition: '50% 0%',
    quote: [
      'The NaviNetics stereotactic system unequivocally represents a solid and well-founded evolution in contemporary stereotaxy and, by extension, in traditional neurosurgical techniques. Far from proposing the replacement of established stereotactic systems, the device offers a conceptual and operational refinement, preserving the precision inherent to classic arc-based stereotactic systems while eliminating relevant practical limitations of those devices.',
      'One of the main innovations lies in replacing the traditional circular halo with a compact, skull-mounted system built around a "key" structure, combined with a tower that organizes and centralizes the coordinate system. This configuration allows the procedure to be performed around and in front of the system, keeping the skull free of bulky structures. As a result, access to the face and the lateral regions of the head is improved. In addition, the absence of the stereotactic arc makes it easier to extend the surgical field to the thoracic region, particularly in single-stage procedures. This feature is especially advantageous in surgeries under general anesthesia, as it allows the procedure to continue seamlessly, from electrode implantation through tunneling to pulse generator implantation, without the need for a new surgical preparation or new sterile draping.',
      'The system also offers relevant advantages in awake procedures. The absence of the classic stereotactic arc significantly increases patient comfort, reducing the physical discomfort and psychological stress associated with rigid head fixation, as the head can remain free without compromising safety. It also provides better access to the face during surgery, which is very important for intraoperative neurological assessment. This favors more direct and natural interaction between the neurologist and the patient, allowing a more accurate evaluation of motor responses, speech, and other key clinical parameters during electrode placement.',
      'Beyond the technical and operational aspects, the concept of "arc-free" stereotactic surgery contributes to a broader perception of reduced invasiveness. Although deep brain stimulation remains a complex neurosurgical procedure, eliminating a bulky external device significantly changes how the procedure is perceived and experienced by the patient. Patients report a lower sense of mechanical restraint, less visual impact, and less contact with potentially intimidating external structures. Together, these factors help reduce anxiety and perceived distress, both before and during the procedure.',
      'In this context, the traditional perception of deep brain stimulation as a highly uncomfortable procedure, often associated with rigid structures and prolonged wakefulness, tends to be gradually replaced by a more patient-centered experience, with a lighter burden of suffering and closer alignment with contemporary principles of minimally invasive care. This is a relevant benefit, even if it is sometimes underestimated.',
      'From a surgical workflow standpoint, the system offers clear advantages by simplifying operative logistics without compromising precision. The results presented demonstrate accuracy within established standards, showing that this more streamlined approach does not entail a loss of clinical performance. Moreover, the good results obtained even without microelectrode recording in selected cases suggest the feasibility of more efficient and less complex surgical protocols.',
      'In practical terms, this innovation stands out for addressing concrete demands of clinical practice: greater efficiency, an improved patient experience, and maintained technical reliability. It is particularly attractive for centers seeking to optimize their deep brain stimulation workflows without substantial investment in highly complex infrastructure.',
      'The concept presented is therefore consistent and promising. By increasing procedural comfort without compromising precision, this system has the potential to contribute significantly to the evolution of deep brain stimulation practice.',
      'Overall, it can be considered a pragmatic and well-targeted advance, one that respects the fundamentals of classic stereotaxy while adapting them to the demands of contemporary functional neurosurgery, promoting greater patient comfort and reinforcing the perception of a less invasive procedure.',
    ],
  },
  {
    name: 'Dr. Wilson Morikawa Jr.',
    role: 'Neurosurgeon, São Paulo, Brazil',
    image: asset('/wilson-morikawa.jpg'),
    imagePosition: '50% 32%',
    quote: [
      'I recently had the opportunity to use the NaviNetics stereotactic system, and the experience was very positive. What stands out right away is the design of the frame, which is quite different from what we are used to. The key advantage is that the patient does not have a halo "in their face" and does not see the structure the whole time, which completely changes the game in terms of comfort. The surgical experience is much lighter for the patient, reducing the stress of feeling "trapped" in the equipment.',
      'On the technical side, the Key fixation system introduces an innovative approach based on anchoring with percutaneous screws directly into the cranial vault. Although it requires a more careful installation step, with absolute rigor regarding screw angulation and depth, it is easily understood and can be replicated by any functional neurosurgeon. The mechanical stability achieved makes the system comparable to the traditional stereotactic halo in terms of rigidity and precision.',
      'For neurosurgeons already experienced in DBS procedures and classic stereotaxy, handling the system is extremely intuitive. Although these are new technologies, the coordinate logic and the workflow are familiar, requiring only an additional technical refinement that is quickly absorbed.',
      'In short, the NaviNetics and Key set is not just a new piece of equipment, but a tactical enhancement that offers a high-performance, safe, and much more patient-friendly alternative to conventional methods.',
    ],
  },
];

/**
 * D1 Stereotactic Frame.
 *
 * The third product off the data-driven template, for the same reason as the
 * other two: the template's furniture — spec table, numbered highlights,
 * contents list, gallery — is what you reach for when the page has nothing
 * else to say, and this one opens with the instrument itself.
 *
 * The hero is the assembly CAD, tessellated and rendered offline. See the
 * claims notice in data/d1.js for what that does and does not put in public,
 * and D1Hero for why it ships pictures rather than a mesh.
 *
 * Grounds alternate bay / light / bay / light so the page breathes and hands
 * the reader back to the site's own theme at the end, same as MAVEN.
 */
export default function D1() {
  const product = getProduct('d1-stereotactic-frame');

  usePageMeta({
    title: product.name,
    description:
      'The NaviNetics Reusable Stereotactic System (NRSS) — arc-centered stereotactic '
      + 'targeting from a Skull Anchor Key.',
  });

  return (
    <>
      <D1Hero />

      {/* Keyed by title, not scene. A band may have no scene - "Room to work."
          lost its animation on 2026-10-26 - and keying by scene then gave that
          band an undefined key, which React reports as a list child with no
          unique key. Every band has a title, and they are all different. */}
      {bands.map((b) => (
        <ScienceBand key={b.title} builders={BUILDERS} {...b} />
      ))}

      {/* ── what's included ────────────────────────────────────────────────
          On review: the specification section that sat above this (the
          SpecTable of product.specs and an "ask us" line for documentation)
          came off the page, this heading changed from "What the frame comes
          with.", the nine-kit list beside the photograph came off, and so did
          the photograph's caption. The kits are still `components` in
          data/products.js. With the list gone the copy and the assembly share
          the row instead. */}
      <Section wide band>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,52%)] lg:gap-14">
          <Reveal>
            <div className="flex flex-col gap-3.5">
              <span className="eyebrow text-action">The system</span>
              <h2 className="text-d2">What’s included.</h2>
              <p className="max-w-prose text-sm leading-relaxed text-ink-2">
                {/* Was "Everything supplied with the system, including both
                    sterilization trays and the accuracy verification
                    fixture." - a list intro that read as though its list had
                    failed to render, saying "both" trays without naming
                    either, and calling the fixture something the product
                    record does not (it is the Ground Truth Fixture Kit). */}
                Supplied with the system, including the sterilization trays and the Ground
                Truth Fixture Kit used to verify accuracy.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="overflow-hidden rounded-xl border border-hairline bg-white shadow-e3">
              <img
                src={asset('/DSC05397-1024x695.jpg')}
                alt="The NaviNetics stereotactic frame assembly."
                width={1024}
                height={695}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section wide>
        <SectionHead
          align="center"
          title="Neurosurgeon testimonials"
        />
        <div className="mt-10 space-y-6">
          {TESTIMONIALS.map((testimonial) => (
            <Reveal key={testimonial.name}>
              <article className="grid gap-6 rounded-lg border border-hairline-soft bg-surface p-6 md:grid-cols-[200px_minmax(0,1fr)] md:p-8">
                <div className="flex items-start gap-4 md:flex-col">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-hairline-soft bg-sunk md:h-40 md:w-40">
                    <img
                      src={testimonial.image}
                      alt={`Portrait of ${testimonial.name}`}
                      loading="lazy"
                      style={{ objectPosition: testimonial.imagePosition }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold leading-tight tracking-[-0.025em]">
                      {testimonial.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-ink-3">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <blockquote className="border-t border-hairline-soft pt-5 text-sm leading-[1.72] text-ink-2 md:border-l md:border-t-0 md:pt-0 md:pl-8 md:text-[0.9375rem]">
                  {testimonial.quote.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </blockquote>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── close ──────────────────────────────────────────────────────────── */}
      <Section>
        <Reveal className="flex flex-col items-center gap-6 text-center">
          {/* The "How it was made" eyebrow and the product's intro paragraph
              under this heading ("The brief was a device robust enough…") were
              removed on review. */}
          {/* Was "Built to answer a constraint.", then "Built for the constraints
              of the next case." Both named a difficulty, and no other heading on
              this page does — they run "Anchored to the skull.", "Arc-centered.",
              "Down the trajectory.", "Room to work."

              This is the last thing read before the quote button, so its job is
              to say why the four arguments above should be trusted. "By", not
              "with": a co-founder operates at Mayo Clinic and another built
              neurosurgical instruments for forty years and made the prototype,
              so authorship is the true and the stronger claim. */}
          <h2 className="text-d2">Built by the people who use it.</h2>
          {/* Gated with the hero chip on the same `published` flag — this is
              the company's own FDA sentence, and it comes off the site with
              the rest of the clearance statement. See data/products.js. */}
          {product.regulatory?.published && product.regulatory.statement && (
            <p className="max-w-prose text-sm leading-relaxed text-ink-2">
              {product.regulatory.statement}
            </p>
          )}

          {/* THE INSTRUCTIONS FOR USE, 2026-11-18, on NaviNetics' instruction:
              this sentence verbatim, with the IFU it names linked as a PDF
              hosted with the site (public/pdf/). The link is to LABL3001
              rev K, the current revision; when the IFU is revised, replace
              the file and the revision in its name together. */}
          <p className="max-w-prose text-sm leading-relaxed text-ink-2">
            Please refer to the{' '}
            <a
              href={asset('/pdf/LABL3001-NaviNetics-Reusable-Stereotactic-System-Instructions-for-Use-rev-K.pdf')}
              target="_blank"
              rel="noopener"
              className="font-semibold text-action underline decoration-1 underline-offset-2 hover:decoration-2"
            >
              NaviNetics Reusable Stereotactic System Instructions for Use
            </a>{' '}
            for complete information on intended use, intended users, target patient
            population, training recommendations, cleaning and sterilization information, system
            use instructions, and warnings and precautions.
          </p>

          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {/* A quote route, which navinetics.com already has as a "Quote
                Request" block and this site had dropped. The reason is passed
                so the form arrives already set to the right enquiry. */}
            <Button to="/contact?reason=d1" size="lg" arrow>
              Request a quote
            </Button>
            <Button to="/technology/stereotactic-devices" size="lg" variant="secondary">
              The technology behind it
            </Button>
          </div>

          {/* The media/publications footer line is removed on instruction —
              both are one click away in the nav and the footer. */}
        </Reveal>
      </Section>
    </>
  );
}
