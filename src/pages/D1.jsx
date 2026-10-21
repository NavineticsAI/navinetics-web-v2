import { usePageMeta } from '../lib/meta.js';
import { getProduct } from '../data/products.js';
import { bands } from '../data/d1.js';
import { asset } from '../lib/asset.js';
import * as D1_SCENES from '../lib/d1Scenes.js';
import { Button, Reveal, Section } from '../ui/index.js';
import { D1Hero } from '../ui/D1Hero.jsx';
import { ScienceBand } from '../ui/ScienceBand.jsx';

const BUILDERS = {
  anchor: D1_SCENES.makeAnchor,
  arc: D1_SCENES.makeArc,
  drive: D1_SCENES.makeDrive,
  access: D1_SCENES.makeAccess,
};

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

      {bands.map((b) => (
        <ScienceBand key={b.scene} builders={BUILDERS} {...b} />
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
                Everything supplied with the system, including both sterilization trays and the
                accuracy verification fixture.
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
