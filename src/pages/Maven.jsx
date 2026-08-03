import { Link } from 'react-router-dom';
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
 * full-luminance colour scale, and neither survives a pale ground. The other
 * two bands and the close follow the site theme, so the page breathes instead
 * of running as one long tunnel, and it hands the reader back to the rest of
 * the site at the end. The scenes on the light bands are redrawn in ink rather
 * than being the same colours turned down; see palette() in lib/mavenScenes.
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
      + 'neuromodulation. Neurochemical and electrophysiological recording, synchronised with '
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
      <section className="border-t border-hairline-soft bg-canvas px-6 py-24 md:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal className="flex flex-col items-center gap-6 text-center">
            <span className="eyebrow text-action">Where it stands</span>
            <h2 className="text-d2">A research instrument.</h2>
            <p className="max-w-prose text-lead leading-[1.55] text-ink-2">
              MAVEN is used in preclinical research. Its purpose is to let the chemistry, the
              electrophysiology and the stimulation be observed together, so the mechanisms behind
              neuromodulation can be studied rather than inferred.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Button to="/contact" size="lg" arrow>
                Talk to the team
              </Button>
              <Button to="/resources/publications" size="lg" variant="secondary">
                Read the research
              </Button>
            </div>
            <p className="mt-4 max-w-prose text-[0.8125rem] leading-relaxed text-ink-3">
              Sensing and stimulating electrodes are placed through the same stereotactic route as
              the rest of our work — the{' '}
              <Link to="/products/d1-stereotactic-frame" className="text-action underline-offset-4 hover:underline">
                D1 frame
              </Link>{' '}
              and{' '}
              <Link to="/technology/navinetics-ai" className="text-action underline-offset-4 hover:underline">
                NaviNetics AI
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
