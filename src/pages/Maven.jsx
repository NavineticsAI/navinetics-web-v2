import { usePageMeta } from '../lib/meta.js';
import { getProduct } from '../data/products.js';
import { bands } from '../data/maven.js';
import { Button, Reveal } from '../ui/index.js';
import { MavenHero } from '../ui/MavenHero.jsx';
import { ScienceBand } from '../ui/ScienceBand.jsx';

/**
 * MAVEN.
 *
 * The one product with its own page rather than the data-driven template, for
 * the same reason NaviNetics AI has one: its subject is not a shape you can
 * photograph on a plate. It is a hub with channels running into it, and the
 * page opens by drawing exactly that.
 *
 * Built to the shape of the software page — an opening that settles, then one
 * band per subject with its own animated ground and its own figure, then one
 * place to go next. No specification table, no numbered highlights, no
 * contents list, no gallery: those are the product template's furniture, and
 * this page has something to say instead.
 *
 * GROUND. The hero and two of the four bands are the instrument bay, which is
 * dark in both themes — the unit is a white cutout and the field is a
 * full-luminance color scale, and neither survives a pale ground. The other
 * two bands and the close follow the site theme, so the page breathes instead
 * of running as one long tunnel, and it hands the reader back to the rest of
 * the site at the end. The scenes on the light bands are redrawn in ink rather
 * than being the same colors turned down; see palette() in lib/mavenScenes.
 *
 * Copy is written from NaviNetics' own deck at the level of disclosure the
 * rest of the site already uses. What the deck holds that is deliberately NOT
 * here — and it is a long list — is in the claims notice in data/maven.js.
 */
export default function Maven() {
  const product = getProduct('maven-neuromodulation');

  usePageMeta({
    title: product.name,
    description:
      'MAVEN — a multifunctional apparatus for voltammetry, electrophysiology and '
      + 'neuromodulation. Neurochemical and electrophysiological recording, synchronized with '
      + 'stimulation, for preclinical research.',
  });

  return (
    <>
      <MavenHero product={product} />

      {bands.map((b) => (
        <ScienceBand key={b.id} {...b} />
      ))}

      {/* Closes the page. States what the instrument is for and what it is
          not, then offers one thing to do. The status is the existing
          record's own word — preclinical research — and no date, indication,
          performance figure or regulatory position is added to it. */}
      {/* Light, and it follows the theme. The page ends by coming back to the
          rest of the site rather than leaving the reader in the bay. */}
      {/* Hand-rolled rather than <Section> because of the border-t, but the
          gutter, measure and rhythm are now the same values Section uses. */}
      <section className="border-t border-hairline-soft bg-canvas px-6 py-16 md:py-20 lg:px-8 lg:py-24">
        <div className="nn-frame mx-auto">
          <Reveal className="flex flex-col items-center gap-6 text-center">
            {/* THE STATUS STATEMENT IS WITHDRAWN. On NaviNetics' instruction
                2026-10-21 this section lost its eyebrow ("Where it stands"),
                its heading ("A research instrument.") and its paragraph:

                  "MAVEN is used in preclinical research. Its purpose is to let
                   the chemistry, the electrophysiology and the stimulation be
                   observed together, so the mechanisms behind neuromodulation
                   can be studied rather than inferred."

                The buttons and the electrode-route line below are kept, so the
                page still ends with somewhere to go.

                READ THIS BEFORE THE SITE GOES PUBLIC. That paragraph was the
                only statement of MAVEN's status anywhere on this page, and
                Keystone Regulatory asked on 2026-09-02 for the OPPOSITE of
                removing it — "I would prefer to have a more clear indication of
                the device's market status, especially on a website which
                features commercially-available medical devices". With it gone,
                the page's only remaining status signal is the small
                "For preclinical research" stamp on the hero ring in
                ui/MavenHero.jsx, and the call to action beneath this comment
                reads "Request a Quote".

                That pairing — no status statement, and an invitation to buy —
                is the thing the regulatory review was trying to prevent, and it
                is not a judgement this file can make for NaviNetics. Restoring
                the paragraph is three lines; the record of what it said is
                above so it can be put back verbatim. */}
            {/* NO REGULATORY STATEMENT HERE — deliberately, and it is worth
                knowing why it was removed rather than never written.

                A box was added reading "MAVEN is a preclinical research
                instrument. It is not a cleared medical device and is not for
                use in human subjects." The first sentence is supported —
                navinetics.com calls this work "preclinical research". The last
                clause was not: that site describes the neurochemical sensing
                work as enabling "both research development in preclinical
                studies AND HUMAN RECORDINGS", so a flat no-human-use statement
                may be plainly wrong.

                Writing a restriction onto a product because it looks like the
                cautious thing to do is the same error as writing a claim onto
                one. Nothing goes here until NaviNetics states MAVEN's actual
                use status. The heading and lead below are theirs and are
                accurate, and they already say this is research. */}
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Button to="/contact?reason=maven" size="lg" arrow>
                Request a Quote
              </Button>
              <Button to="/resources/publications" size="lg" variant="secondary">
                Read the research
              </Button>
            </div>

            {/* The closing line is withdrawn - 2026-10-26. It read "Sensing and
                stimulating electrodes are placed through the same stereotactic
                route as the rest of our work - the NRSS.", with NRSS linked to
                /products/d1-stereotactic-frame.

                WHAT GOES WITH IT: that link was the only route from this page
                to the NRSS. The MAVEN page now links out to Contact and to
                Publications and nowhere else - not to the frame its electrodes
                are placed through, and not to /technology/neuromodulation. */}
          </Reveal>
        </div>
      </section>
    </>
  );
}
