import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta.js';
import { getProduct } from '../data/products.js';
import { bands } from '../data/d1.js';
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
      'Arc-centred stereotactic targeting with a skull anchor key in place of a base ring — three '
      + 'linear degrees of freedom, two angles of rotation.',
  });

  return (
    <>
      <D1Hero />

      {bands.map((b) => (
        <ScienceBand key={b.scene} builders={BUILDERS} {...b} />
      ))}

      {/* ── what comes in the case ─────────────────────────────────────────── */}
      <Section wide band>
        <Reveal>
          <div className="flex flex-col gap-3.5">
            <span className="eyebrow text-action">The system</span>
            <h2 className="text-d2">What the frame comes with.</h2>
            <p className="max-w-prose text-sm leading-relaxed text-ink-2">
              The components named on the product record, as it names them. Nothing is claimed
              about any of them beyond that.
            </p>
          </div>
        </Reveal>
        {/* The assembly beside the list of what it is made of, rather than
            floating in a band on its own — a contents list wants the thing
            whose contents they are. */}
        <div className="mt-9 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,52%)] lg:gap-14">
          <ul className="grid list-none gap-x-10 gap-y-0 p-0 sm:grid-cols-2 lg:grid-cols-1">
            {product.components.map((c) => (
              <li
                key={c}
                className="border-b border-hairline-soft py-3 text-[0.9375rem] text-ink-2"
              >
                {c}
              </li>
            ))}
          </ul>
          <Reveal>
            <figure className="m-0">
              <div className="overflow-hidden rounded-xl border border-hairline bg-white shadow-e3">
                <img
                  src="/DSC05397-1024x695.jpg"
                  alt="The NaviNetics stereotactic frame assembly."
                  width={1024}
                  height={695}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
                The frame assembly
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Section>

      {/* ── close ──────────────────────────────────────────────────────────── */}
      <Section>
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <span className="eyebrow text-action">Where it came from</span>
          <h2 className="text-d2">Built to answer a constraint.</h2>
          <p className="max-w-prose text-lead leading-[1.55] text-ink-2">
            {product.intro}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button to="/contact" size="lg" arrow>
              Ask about the D1
            </Button>
            <Button to="/technology/stereotactic-devices" size="lg" variant="secondary">
              The technology behind it
            </Button>
          </div>
          <p className="mt-4 max-w-prose text-[0.8125rem] leading-relaxed text-ink-3">
            The frame is shown in{' '}
            <Link to="/resources/media" className="text-action underline-offset-4 hover:underline">
              media
            </Link>
            , and the research behind it is in{' '}
            <Link to="/resources/publications" className="text-action underline-offset-4 hover:underline">
              publications
            </Link>
            .
          </p>
        </Reveal>
      </Section>
    </>
  );
}
