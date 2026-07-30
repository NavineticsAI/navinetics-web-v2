import { Navigate, useParams } from 'react-router-dom';
import { usePageMeta } from '../lib/meta.js';
import { comparison, getProduct, otherProducts } from '../data/products.js';
import {
  Button,
  ComparisonTable,
  ComponentList,
  Gallery,
  Hero,
  MetricRow,
  ProductCard,
  ProductPlate,
  Reveal,
  ScrollSequence,
  Section,
  SectionHead,
  SpecTable,
} from '../ui/index.js';
import NotFound from './NotFound.jsx';

/**
 * The product template. Everything on this page comes from a single record in
 * data/products.js — adding a product publishes a page here with no new code.
 */
export default function Product() {
  const { slug } = useParams();
  const product = getProduct(slug);

  usePageMeta({
    title: product?.name,
    description: product?.summary,
  });

  if (!product) return <NotFound />;

  const others = otherProducts(slug);

  return (
    <>
      <Hero
        size="lg"
        tone="dark"
        eyebrow={`What we do — ${product.shortName}`}
        title={product.tagline}
        lead={product.intro}
      >
        <MetricRow metrics={product.metrics} tone="dark" />
      </Hero>

      <ScrollSequence
        steps={product.sequence}
        image={product.hero}
        imageAlt={product.heroAlt}
      />

      {/* Detail */}
      <Section wide>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          <Reveal className="lg:w-1/2">
            <h2 className="text-d2">{product.detail.title}</h2>
            <div className="mt-6 flex flex-col gap-5 text-lead leading-[1.55] tracking-[-0.015em] text-ink-2">
              {product.detail.paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal className="w-full lg:w-1/2">
            <ProductPlate
              src={product.detail.image}
              alt={product.detail.imageAlt}
              fit={product.detail.fit}
              className="aspect-[4/3] w-full"
            />
          </Reveal>
        </div>
      </Section>

      {/* Specs + gallery */}
      <Section band wide>
        <SectionHead
          eyebrow="Specification"
          title="Numbers, set like instruments."
          lead="Tabular figures, mono values, a graduated header rule. Surgeons and regulators read these closely."
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <SpecTable rows={product.specs} caption={`${product.name} specifications`} />
          </Reveal>
          <Reveal delay={0.06}>
            <Gallery items={product.gallery} />
          </Reveal>
        </div>
      </Section>

      {/* Highlights — numbering is meaningful: an enumerated set */}
      <Section dark wide>
        <Reveal>
          <h2 className="text-center text-d1">Engineered for excellence.</h2>
        </Reveal>
        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {product.highlights.map((h, i) => (
            <Reveal key={h} delay={i * 0.05}>
              <div className="h-full rounded-lg border border-white/10 bg-white/[0.04] p-7 transition-colors duration-[420ms] hover:bg-white/[0.07]">
                <div className="font-data text-2xl font-semibold text-sg-300">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <p className="mt-4 leading-relaxed text-nn-100">{h}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Components */}
      <Section wide>
        <SectionHead
          eyebrow="System contents"
          title="Everything in the case."
          lead="Each entry carries a model reference, so the list survives growing."
        />
        <Reveal className="mt-12">
          <ComponentList items={product.components} />
        </Reveal>
      </Section>

      {/*
        Comparison grid is gated behind `comparison.published`. Comparative
        claims about competing devices are regulated and need sign-off.
      */}
      {comparison.published && (
        <Section band wide>
          <SectionHead eyebrow="Comparison" title="How it differs." />
          <Reveal className="mt-10">
            <ComparisonTable columns={comparison.columns} rows={comparison.rows} />
          </Reveal>
        </Section>
      )}

      {/* Cross-sell */}
      {others.length > 0 && (
        <Section band={!comparison.published} wide>
          <SectionHead eyebrow="Also from NaviNetics" title="The rest of the system." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <Reveal key={p.slug}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-d2">Want the full specification?</h2>
          <p className="max-w-prose text-lead leading-[1.55] text-ink-2">
            We'll put you in touch with the engineers who built it.
          </p>
          <Button to="/contact" size="lg" arrow>
            Contact us
          </Button>
        </Reveal>
      </Section>
    </>
  );
}

/** Redirect helper kept for any legacy link that lands on the bare section. */
export function ProductIndexRedirect() {
  return <Navigate to="/what-we-do/navinetics-frame-system" replace />;
}
