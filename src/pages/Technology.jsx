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

  const products = (tech.appliedIn ?? []).map(getProduct).filter(Boolean);

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
            body="Automated landmark localisation for neuronavigation is published work. The software built on it is in development, and we would rather talk to you about it than publish specifications before they are settled."
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

          {products.length > 0 && (
            <Section band wide>
              <SectionHead
                eyebrow="Applied in"
                title="Where you'll find it."
                lead="The devices this technology is built into."
              />
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <Reveal key={p.slug}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      {tech.readMore?.length > 0 && (
        <Section band={isTechPlaceholder(tech)}>
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

