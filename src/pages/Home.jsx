import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta.js';
import { isPlaceholder, products } from '../data/products.js';
import { publications } from '../data/publications.js';
import {
  Button,
  Card,
  Hero,
  Lens,
  LinkAction,
  ProductPlate,
  Reveal,
  Section,
  SectionHead,
  Badge,
} from '../ui/index.js';

export default function Home() {
  usePageMeta({
    title: 'Precision stereotactic and neuromodulation devices',
    description:
      'NaviNetics designs stereotactic and neuromodulation devices for functional neurosurgery, born from the Neural Engineering Laboratories at Mayo Clinic.',
  });

  return (
    <>
      <Hero
        size="lg"
        targeting
        eyebrow="NaviNetics"
        title={'Innovate.\nElevate.'}
        lead="Transforming the future of neurosurgery through unparalleled precision and patient comfort."
      >
        <div className="flex flex-wrap gap-3">
          <Button to={products[0].path} size="lg" arrow>
            Discover the Frame System
          </Button>
          <Button to="/company/who-we-are" size="lg" variant="secondary">
            Who we are
          </Button>
        </div>
      </Hero>

      {/* Product features — alternating, one Lens panel each (budget: 3 max).
          Products still in development are excluded: they have no metrics to
          show, and a half-empty feature section reads worse than absence. They
          still appear in the nav, the footer and product cross-sell. */}
      {products.filter((p) => !isPlaceholder(p)).map((product, i) => (
        <Section key={product.slug} wide band={i % 2 === 1}>
          <div
            className={`flex flex-col items-center gap-12 lg:gap-20 ${
              i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
            }`}
          >
            <Reveal className="lg:w-1/2">
              <h2 className="text-d2">{product.family}</h2>
              <p className="mt-5 max-w-prose text-lead leading-[1.55] tracking-[-0.015em] text-ink-2">
                {product.summary}
              </p>
              <LinkAction to={product.path} className="mt-7">
                Explore {product.shortName}
              </LinkAction>
            </Reveal>

            <Reveal className="w-full lg:w-1/2">
              <div className="relative">
                <ProductPlate
                  src={product.hero}
                  alt={product.heroAlt}
                  className="aspect-square w-full"
                />
                {/* One lens panel floating over the plate — the showcase moment */}
                <Lens className="absolute bottom-5 left-5 right-5 rounded-md p-4 md:bottom-6 md:left-6 md:right-auto md:max-w-[18rem] md:p-5">
                  <span className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-action">
                    {product.metrics[0].label}
                  </span>
                  <div className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                    {product.metrics[0].value}
                  </div>
                  <div className="text-xs text-ink-3">{product.metrics[0].unit}</div>
                </Lens>
              </div>
            </Reveal>
          </div>
        </Section>
      ))}

      {/* Bento */}
      <Section wide>
        <SectionHead
          align="center"
          eyebrow="Designed for the future"
          title="Built to improve the whole workflow."
          lead="Surgical workflow, patient comfort, and exceptional accuracy — from a team that has spent decades in the operating room and the laboratory."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal className="sm:col-span-2">
            <Card lift className="nn-retic relative h-full min-h-56 overflow-hidden">
              <span className="eyebrow text-action">Unprecedented access</span>
              <h3 className="mt-3 text-2xl tracking-[-0.03em]">
                The anchor key replaces the head ring
              </h3>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-ink-2">
                Leaving the patient's face completely unobstructed and giving the surgical team full
                access to the field.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.06}>
            <Card
              lift
              className="flex h-full min-h-56 flex-col justify-between border-transparent bg-action text-on-action"
            >
              <div>
                <span className="font-data text-[0.6875rem] uppercase tracking-[0.14em] opacity-75">
                  Origin
                </span>
                <h3 className="mt-3 text-2xl tracking-[-0.03em]">Mayo Clinic roots</h3>
                <p className="mt-2.5 text-sm leading-relaxed opacity-85">
                  Born from the Neural Engineering Laboratories, on decades of clinical experience.
                </p>
              </div>
              <Link
                to="/company/our-founders"
                className="mt-5 inline-flex w-fit rounded-full bg-on-action px-4 py-2 text-[0.8125rem] font-semibold text-action"
              >
                Meet the founders
              </Link>
            </Card>
          </Reveal>

          <Reveal delay={0.12}>
            <Card lift className="flex h-full min-h-56 flex-col justify-between">
              <span className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
                Research
              </span>
              <div>
                <div className="text-5xl font-semibold leading-none tracking-[-0.045em] tabular-nums">
                  100+
                </div>
                <p className="mt-2 text-sm text-ink-2">
                  peer-reviewed publications spanning decades
                </p>
                <LinkAction to="/resources/publications" className="mt-4 !text-sm">
                  Browse {publications.length} selected
                </LinkAction>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.18} className="sm:col-span-2">
            <Card lift className="flex h-full min-h-56 flex-col justify-between">
              <div>
                <Badge>Neuromodulation</Badge>
                <h3 className="mt-3.5 text-2xl tracking-[-0.03em]">Closed-loop, one day</h3>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-ink-2">
                  Synchronised neurochemical and electrophysiological measurement, engineered so
                  stimulation artefact never contaminates the recording.
                </p>
              </div>
              <LinkAction to="/products/maven-neuromodulation" className="mt-5">
                Discover neuromodulation
              </LinkAction>
            </Card>
          </Reveal>
        </div>
      </Section>

      <Section band>
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-d2">Let's talk.</h2>
          <p className="max-w-prose text-lead leading-[1.55] text-ink-2">
            Whether you're a surgeon, a researcher, or a prospective colleague — we'd like to hear
            from you.
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
