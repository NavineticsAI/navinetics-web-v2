import { useParams } from 'react-router-dom';
import { usePageMeta } from '../lib/meta.js';
import { getTechnology, isTechPlaceholder } from '../data/technology.js';
import { getProduct } from '../data/products.js';
import {
  ComingSoon,
  Hero,
  LinkAction,
  ProductCard,
  ProductPlate,
  Reveal,
  Section,
  SectionHead,
} from '../ui/index.js';
import NotFound from './NotFound.jsx';
import { EducationTopics } from './Education.jsx';
import { topics } from '../data/education.js';

/**
 * The technology template — HOW it works.
 *
 * Kept deliberately at platform level: principles, the products it's applied
 * in, then hand-offs to Education for the deep science and Publications for
 * evidence. Products pages cover WHAT you buy, so neither restates the other.
 */
export default function Technology() {
  const { slug } = useParams();
  const tech = getTechnology(slug);

  usePageMeta({ title: tech?.name, description: tech?.summary });

  if (!tech) return <NotFound />;

  // `.filter(!hidden)` as well as Boolean: appliedIn names products by slug,
  // and getProduct finds a hidden one perfectly well.
  const products = (tech.appliedIn ?? []).map(getProduct).filter(Boolean).filter((x) => !x.hidden);

  return (
    <>
      <Hero
        size="lg"
        tone="dark"
        eyebrow={tech.eyebrow}
        title={tech.tagline}
        lead={tech.summary}
      />

      {isTechPlaceholder(tech) ? (
        <Section>
          {/* The body used to end "…rather than fill this page with
              plausible-sounding claims, here's what's outstanding", and the
              title said the page "isn't documented yet". Both explain our
              editorial process to a visitor who did not ask about it. The
              restraint they describe stays; the commentary about it does not.
              `needs` is still passed — ComingSoon no longer renders it to the
              page, but it stays as the internal record of what is missing. */}
          <ComingSoon
            title={`${tech.name} is in development.`}
            body="Automated landmark localization for neuronavigation is published work. The software built on it is in development, and we would rather talk to you about it than publish specifications before they are settled."
            needs={tech.needsContent}
          />
        </Section>
      ) : (
        <>
          <Section wide>
            <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
              <Reveal className="lg:w-1/2">
                <SectionHead eyebrow="How it works" title="The principle." />
                <div className="mt-8 flex flex-col gap-7">
                  {tech.principles.map((p, i) => (
                    <div key={p.title} className="flex gap-4">
                      <span className="font-data mt-1 shrink-0 text-[0.6875rem] text-action">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="text-lg tracking-[-0.025em]">{p.title}</h3>
                        <p className="mt-1.5 max-w-prose leading-relaxed text-ink-2">{p.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal className="w-full lg:w-1/2">
                <ProductPlate
                  src={tech.hero}
                  alt={tech.heroAlt}
                  className="aspect-square w-full"
                />
              </Reveal>
            </div>
          </Section>

          {/* The teaching topics that belong to this platform, embedded rather
              than linked. This page ran to 261 words and pointed at an
              Education page that explained the same principle far better and
              interactively — a hand-off that asked the reader to leave in order
              to understand what they had just been told. The topic named on the
              record is now rendered here, in place, between the principle and
              the products it is built into. */}
          <EducationTopics topics={topics.filter((t) => (tech.teaches ?? []).includes(t.id))} />

          {/* PRODUCTS AND HAND-OFFS IN ONE SECTION.
              ─────────────────────────────────────────────────────────────
              These were two consecutive sections, and both were nearly empty:
              a three-column grid holding a single product card, then a whole
              section wrapped around a single link. Two thin sections back to
              back read as a page running out of things to say. Side by side
              they read as a close — and it matches how the neuromodulation
              page ends, which is the same job. */}
          {(products.length > 0 || tech.readMore?.length > 0) && (
            <Section band wide>
              <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
                {products.length > 0 && (
                  <div>
                    <SectionHead
                      eyebrow="Applied in"
                      title="Where you'll find it."
                      lead="The devices this technology is built into."
                    />
                    {/* Capped at two columns: `appliedIn` is one product today
                        and a single card stretched across a three-column grid
                        looked like two had failed to load. */}
                    <div className="mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
                      {products.map((p) => (
                        <Reveal key={p.slug}>
                          <ProductCard product={p} />
                        </Reveal>
                      ))}
                    </div>
                  </div>
                )}
                {tech.readMore?.length > 0 && (
                  <div>
                    <SectionHead eyebrow="Go deeper" title="The science, and the evidence." tick={false} />
                    <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-2">
                      This page stays at platform level on purpose. The detail lives where it
                      belongs.
                    </p>
                    <div className="mt-6 flex flex-col gap-4">
                      {tech.readMore.map((r) => (
                        <Reveal key={r.to}>
                          <LinkAction to={r.to}>{r.label}</LinkAction>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}
        </>
      )}

      {/* A placeholder technology has no products section to sit beside, so
          the hand-offs keep a section of their own on that branch only. */}
      {isTechPlaceholder(tech) && tech.readMore?.length > 0 && (
        <Section band>
          <SectionHead
            eyebrow="Go deeper"
            title="The science, and the evidence."
            lead="This page stays at platform level on purpose. The detail lives where it belongs."
          />
          <div className="mt-8 flex flex-col gap-4">
            {tech.readMore.map((r) => (
              <Reveal key={r.to}>
                <LinkAction to={r.to}>{r.label}</LinkAction>
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

