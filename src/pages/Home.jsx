import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta.js';
import { isPlaceholder, products } from '../data/products.js';
import { publications } from '../data/publications.js';
import {
  Button,
  Card,
  Hero,
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
      'NaviNetics designs stereotactic and neuromodulation devices for functional neurosurgery, born from the Neural Engineering and Precision Surgery Laboratories at Mayo Clinic.',
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
        targeting
        eyebrow="NaviNetics"
        /* The company slogan, which is what navinetics.com leads with. It
           replaced "Innovate. Elevate.", which was the rebuild's own line and
           said less. Set in sentence case rather than the live site's caps: at
           display size this is the same face every other page heading uses, and
           caps here would read as a different typographic system. */
        title={'Targeting the future.\nImproving today.'}
        lead="Stereotactic frames, neuromodulation instruments and carbon-fiber operating tables for functional neurosurgery — designed with the clinicians who use them, out of the Neural Engineering and Precision Surgery Laboratories at Mayo Clinic."
      >
        <div className="flex flex-wrap gap-3">
          <Button to={products[0].path} size="lg" arrow>
            Discover the NRSS
          </Button>
          <Button to="/company/who-we-are" size="lg" variant="secondary">
            Who we are
          </Button>
        </div>
      </Hero>

      {/* Product features — alternating plate and copy. Products still in
          development are excluded: a half-empty feature section reads worse
          than absence. They still appear in the nav, the footer and product
          cross-sell. */}
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
                {/* `tone` is forwarded because these are cut-outs with
                    transparent backgrounds and each record says which ground
                    it needs. Home was ignoring that and putting all three on
                    the pale plate — on the one page most people see first. */}
                <ProductPlate
                  src={product.hero}
                  alt={product.heroAlt}
                  tone={product.heroTone}
                  className="aspect-square w-full"
                />
                {/* The floating lens panel that used to sit over each plate is
                    gone, at NaviNetics' request — "DEGREES OF FREEDOM 3 + 2" on
                    the NRSS plate and the equivalent first metric on the other
                    two. It covered the bottom-left of the product it was
                    labeling. The figures are not lost: `metrics` still feeds
                    the spec table on each product page. */}
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
          title="Targeting, measurement and access."
          lead="Surgical workflow, patient comfort, and exceptional accuracy — from a team that has spent decades in the operating room and the laboratory."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal className="sm:col-span-2">
            <Card lift className="nn-retic relative h-full min-h-56 overflow-hidden">
              <span className="eyebrow text-action">Unprecedented access</span>
              <h3 className="mt-3 text-2xl tracking-[-0.03em]">
                Fixation by a small skull anchor key
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
                  Born from the Neural Engineering and Precision Surgery Laboratories, on decades of clinical experience.
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
                  Browse {publications.length} papers
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
                  Synchronized neurochemical and electrophysiological measurement, engineered so
                  stimulation artifact never contaminates the recording.
                </p>
              </div>
              <LinkAction to="/products/maven-neuromodulation" className="mt-5">
                See how MAVEN measures
              </LinkAction>
            </Card>
          </Reveal>
        </div>
      </Section>

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
