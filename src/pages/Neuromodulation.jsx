import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta.js';
import { getTechnology } from '../data/technology.js';
import { getProduct } from '../data/products.js';
import { chapters, evidence, gap, paperFor } from '../data/neuromodulation.js';
import { doiLink, founders } from '../data/publications.js';
import { Hero, LinkAction, ProductCard, Reveal, Section, SectionHead } from '../ui/index.js';
import { ScienceBand } from '../ui/ScienceBand.jsx';

/**
 * Neuromodulation — the research behind it.
 *
 * Its own route rather than the technology template for the same reason the
 * other two exceptions have one: the template is three principles beside a
 * photograph, and this subject is an arc of published work that wants figures
 * and room.
 *
 * Every chapter is one paper. The citation under each is read out of
 * data/publications.js by DOI rather than retyped, so this page and the
 * publications page cannot disagree about a year, a journal or an author list.
 * See the claims notice in data/neuromodulation.js for what is deliberately
 * not asserted.
 */
export default function Neuromodulation() {
  const tech = getTechnology('neuromodulation');
  const product = getProduct('maven-neuromodulation');

  usePageMeta({
    title: 'Neuromodulation',
    description:
      'The research behind measuring what stimulation changes: tonic and phasic neurochemical '
      + 'recording, resolved analytes, and both signals on one platform. Four published papers.',
  });

  return (
    <>
      <Hero
        size="lg"
        tone="dark"
        eyebrow={tech.eyebrow}
        title={tech.tagline}
        lead={tech.summary}
      />

      {/* The question everything after this is a step toward. */}
      <Section>
        <SectionHead eyebrow={gap.eyebrow} title={gap.title} />
        <Reveal className="mt-8 flex flex-col gap-6">
          <p className="max-w-prose text-lead leading-[1.6] tracking-[-0.015em] text-ink-2">
            {gap.body}
          </p>
          <p className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
            {gap.note}
          </p>
        </Reveal>
      </Section>

      {chapters.map((c) => (
        <div key={c.id}>
          <ScienceBand {...c} />
          <Citation chapter={c} />
        </div>
      ))}

      {/* The four, together, so the arc is visible as a list and not only as a
          scroll. Same records the publications page renders. */}
      <Section wide band>
        <SectionHead
          eyebrow="The evidence"
          title="The published record."
          lead="Peer-reviewed and resolved from Crossref against their DOIs — the same records the
            publications page carries."
        />
        <div className="mt-10 flex flex-col divide-y divide-hairline-soft border-y border-hairline-soft">
          {evidence.map((p) => (
            <Reveal key={p.doi}>
              <a
                href={doiLink(p)}
                target="_blank"
                rel="noreferrer"
                className="group/p grid gap-x-8 gap-y-2 py-6 transition-colors hover:bg-surface
                  sm:grid-cols-[4rem_1fr_10rem]"
              >
                <span className="font-data text-sm tabular-nums text-action">{p.year}</span>
                <span>
                  <span className="block text-[0.9375rem] font-semibold leading-snug tracking-[-0.02em]
                    group-hover/p:text-action">
                    {p.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-3">
                    {p.authors.map((a, i) => (
                      <span key={a}>
                        {i > 0 && ', '}
                        <span className={founders.includes(a) ? 'font-semibold text-ink-2' : undefined}>
                          {a}
                        </span>
                      </span>
                    ))}
                  </span>
                </span>
                <span className="font-data text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
                  {p.journal}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Where the work ended up, and where the detail lives. */}
      <Section wide>
        <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div>
            <SectionHead
              eyebrow="Applied in"
              title="The instrument it became."
              lead="Why it records chemistry and electrophysiology together."
            />
            <div className="mt-10 max-w-sm">
              {product && <ProductCard product={product} />}
            </div>
          </div>
          <div>
            <SectionHead eyebrow="Go deeper" title="The method itself." tick={false} />
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-2">
              This page is what the work established. How the measurement actually works — the
              redox chemistry, the sweep, the background problem — is written out from first
              principles on the education pages.
            </p>
            <div className="mt-6 flex flex-col gap-4">
              {(tech.readMore ?? []).map((r) => (
                <LinkAction key={r.to} to={r.to}>{r.label}</LinkAction>
              ))}
              <LinkAction to="/technology/stereotactic-devices">
                How the electrode is placed
              </LinkAction>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

/**
 * The paper a band was built on, set immediately under it.
 *
 * Its own strip rather than a line inside the band: the bands alternate ground
 * and this has to read the same under both, and a citation belongs to the
 * section above it rather than inside its argument.
 */
function Citation({ chapter }) {
  const p = paperFor(chapter.doi);
  return (
    <div className="border-b border-hairline-soft bg-sunk px-6 py-4 lg:px-8">
      <div className="nn-frame mx-auto flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <p className="text-[0.8125rem] leading-relaxed text-ink-2">
          <span className="font-data text-[0.625rem] uppercase tracking-[0.14em] text-ink-3">
            {'Paper · '}
          </span>
          {p.title}
          {'. '}
          <i className="not-italic text-ink-3">{`${p.journal} ${p.volume}, ${p.pages} (${p.year}).`}</i>
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <Link
            to={chapter.readMore.to}
            className="font-data text-[0.625rem] uppercase tracking-[0.12em] text-action
              underline-offset-4 hover:underline"
          >
            {chapter.readMore.label}
          </Link>
          <a
            href={doiLink(p)}
            target="_blank"
            rel="noreferrer"
            className="font-data text-[0.625rem] uppercase tracking-[0.12em] text-action
              underline-offset-4 hover:underline"
          >
            {`DOI ${p.doi}`}
          </a>
        </div>
      </div>
    </div>
  );
}
