import { usePageMeta } from '../lib/meta.js';
import { isPlaceholder, visibleProducts } from '../data/products.js';
import { Button, Hero, ProductPlate, Reveal, Section } from '../ui/index.js';

/* Both product names carry an acronym, in two different shapes —
   "MAVEN: Multifunctional Apparatus for …" and "NaviNetics Reusable
   Stereotactic System (NRSS)". On review both are set the same way here: the
   acronym at heading size, the spelled-out name smaller beneath it, so the
   two cards weigh the same. The colon stays in the accessible name; it is
   only hidden visually. A name in neither shape renders as it is. */
function splitName(name) {
  const colon = name.match(/^([^:]+):\s(.+)$/);
  if (colon) return [colon[1], colon[2]];
  const paren = name.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (paren) return [paren[2], paren[1]];
  return [name];
}

function ProductName({ name }) {
  const [short, expansion] = splitName(name);
  return (
    <h2 className="text-d2">
      {short}
      {expansion && (
        <>
          <span className="sr-only">: </span>
          <span className="mt-2 block text-xl leading-[1.25] tracking-[-0.02em] lg:text-2xl">
            {expansion}
          </span>
        </>
      )}
    </h2>
  );
}

export default function Home() {
  usePageMeta({
    title: 'Precision stereotactic and neuromodulation devices',
    description:
      'NaviNetics designs stereotactic and neuromodulation devices for functional neurosurgery, born from the Neural Engineering Laboratories at Mayo Clinic.',
  });

  return (
    <>
      {/* The lead used to read "Transforming the future of neurosurgery through
          unparalleled precision and patient comfort." That is a comparative
          accuracy claim about a targeting device, in the first sentence on the
          site, with no accuracy figure anywhere to substantiate it — the
          products data file withholds those on purpose. What replaced it says
          what we make and who for, which a cold visitor was not being told
          either. The H1 above it is still brand rather than substance; that is
          a decision for NaviNetics, not a fix to make quietly. */}
      <Hero
        size="lg"
        fill
        targeting
        eyebrow="NaviNetics"
        /* The company slogan, which is what navinetics.com leads with. It
           replaced "Innovate. Elevate.", which was the rebuild's own line and
           said less. Set in sentence case rather than the live site's caps: at
           display size this is the same face every other page heading uses, and
           caps here would read as a different typographic system. */
        title={'Targeting the future.\nImproving today.'}
        /* THE SECOND SENTENCE IS THE THING THAT JOINS THE PRODUCTS.
           It already existed, at the bottom of the third product page, under
           the heading "Placed by the same route." — that everything NaviNetics
           makes serves one act: getting an instrument to a point inside the
           brain, seeing while you do it, and knowing what happened there.
           Without it the site tells three separate stories and never says why
           one company makes a frame, a table and a recording instrument.
           It claims nothing new: every clause is already true on its own page. */
        /* The carbon-fiber tables came out of this sentence when the range was
           withdrawn pending FDA registration (see data/products.js). The
           closing clause lost "see through the table" with them; what is left
           is still the same one-route idea, and every clause is still true on
           its own page. */
        lead="Contempory stereotactic frames design and development along with advanced neuromodulation instruments combine to advance the future for functional neurosurgery — designed with the clinicians who use them, out of the Neural Engineering Laboratories at Mayo Clinic. One route to a target: plan it, reach it, and measure what changed."
      >
        <div className="flex flex-wrap gap-3">
          {/* "Discover the NRSS" used an acronym that is first defined further
              down this same page, so the primary call to action named a thing
              the visitor had not been told about yet. */}
          <Button to={visibleProducts[0].path} size="lg" arrow>
            Discover the frame
          </Button>
          <Button to="/company/who-we-are" size="lg" variant="secondary">
            Who we are
          </Button>
        </div>
      </Hero>

      {/* Product features — side by side, plate over heading over button. This
          was one full-width alternating band per product until review asked
          for NRSS and MAVEN next to each other. Products still in development
          are excluded: a half-empty feature section reads worse than absence.
          They still appear in the nav, the footer and product cross-sell.

          The summary paragraph under each heading came out on review, and the
          Explore link was promoted from an inline text action to a full button
          so it carries the card on its own. The summaries are still in
          data/products.js — they feed the product cards on other pages — so
          this only takes them off the home page.

          The "Every angle, one point" rotation drawing that sat on the NRSS
          plate was removed on review as well. */}
      <Section wide>
        <div className="grid gap-14 md:grid-cols-2 md:gap-8 lg:gap-12">
          {visibleProducts.filter((p) => !isPlaceholder(p)).map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.06} className="flex flex-col">
              {/* `tone` is forwarded because these are cut-outs with transparent
                  backgrounds and each record says which ground it needs. 4:3
                  rather than square, on review — two square plates side by
                  side made the images outweigh everything else on the page. */}
              <ProductPlate
                src={product.hero}
                alt={product.heroAlt}
                tone={product.heroTone}
                className="aspect-[4/3] w-full"
              />
              {/* Button to the right of the title, top-aligned so both sit on
                  the same line across the two cards whatever the title's
                  length. Below xl a column is too narrow to share — at 1024px
                  the MAVEN expansion broke across six lines — so the button
                  drops under the title, and justify-between pins it to the
                  foot of the card so the two still line up. */}
              <div className="mt-8 flex flex-1 flex-col justify-between gap-6 xl:flex-row xl:items-start">
                <div>
                  {/* `name`, not `family`: MAVEN is spelled out in full here on
                      review. For the NRSS the two fields are the same string.
                      The acronym-first layout is this page's only; the records
                      and every other page keep the names as written. */}
                  <ProductName name={product.name} />
                  {product.useNote && (
                    <p className="mt-3 text-lead text-ink-2">{product.useNote}</p>
                  )}
                </div>
                <Button to={product.path} size="lg" arrow className="self-start xl:shrink-0">
                  Explore {product.shortName}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* The "How we build — Targeting, measurement and access." bento that
          sat here (Skull Anchor Key, Mayo Clinic roots, publication count,
          MAVEN research card) was removed on review. */}
      <Section band>
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-d2">Let's talk.</h2>
          <p className="max-w-prose text-lead leading-[1.55] text-ink-2">
            We would like to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/contact" size="lg" arrow>
              Contact us
            </Button>
            <Button to="/resources/publications" size="lg" variant="secondary">
              Read our research
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
