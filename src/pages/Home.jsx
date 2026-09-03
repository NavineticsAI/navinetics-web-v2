import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta.js';
import { RotationInset } from '../ui/RotationInset.jsx';
import { isPlaceholder, visibleProducts } from '../data/products.js';
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
        lead="Stereotactic frames and neuromodulation instruments for functional neurosurgery — designed with the clinicians who use them, out of the Neural Engineering Laboratories at Mayo Clinic. One route to a target: plan it, reach it, and measure what changed."
      >
        <div className="flex flex-wrap gap-3">
          {/* "Discover the NRSS" used an acronym that is first defined further
              down this same page, so the primary call to action named a thing
              the visitor had not been told about yet. */}
          <Button to={visibleProducts[0].path} size="lg" arrow>
            Discover the system
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
      {visibleProducts.filter((p) => !isPlaceholder(p)).map((product, i) => (
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
                    two. The figures are not lost: `metrics` still feeds the
                    spec table on each product page.

                    In its place, on the NRSS plate only, a drawing of what that
                    number means — the collar and the arc turning while the
                    target holds still. Only this product is arc-centred, so
                    only this plate gets it. */}
                {product.slug === 'd1-stereotactic-frame' && (
                  <RotationInset className="hidden md:block" />
                )}
              </div>
            </Reveal>
          </div>
        </Section>
      ))}

      {/* Bento */}
      <Section wide>
        {/* "exceptional accuracy" came out of the lead. It is an adjective
            standing where a figure belongs, on the one attribute a surgeon
            checks first, and this site's own rule is that claims which cannot
            be cited do not appear on it. The accuracy work IS published — two
            validation papers on /resources/publications — but until a figure
            from them is stated here, an adjective is the weakest possible
            stand-in. Workflow and comfort stay: the pages behind them show the
            mechanism. */}
        <SectionHead
          align="center"
          eyebrow="How we build"
          title="Targeting, measurement and access."
          /* Was "Surgical workflow, patient comfort, and exceptional accuracy".
             "Exceptional accuracy" is the same comparative claim the note at the
             top of this file records removing from the hero, and no accuracy
             figure exists anywhere on the site to support it — data/products.js
             withholds those on purpose. The eyebrow was "Designed for the
             future", which said nothing above a section about present work. */
          lead="Surgical workflow and patient comfort, from a team that has spent decades in the operating room and the laboratory."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal className="sm:col-span-2">
            <Card lift className="nn-retic relative h-full min-h-56 overflow-hidden">
              {/* Was "Unprecedented access" — a superlative with no comparator,
                  removed on instruction. The eyebrow now names the mechanism,
                  which is the term NaviNetics wants carried. */}
              <span className="eyebrow text-action">Skull Anchor Key</span>
              <h3 className="mt-3 text-2xl tracking-[-0.03em]">
                The frame anchors to a key on the skull
              </h3>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-ink-2">
                The patient's face stays clear, and the surgical team keeps full access to the
                field.
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
              {/* The number is the one we can stand behind. "100+" was uncited
                  anywhere on the site and sat directly above a link reading
                  "Browse 9 selected" — putting an unsupported figure next to a
                  much smaller supported one, which invites the reader to notice
                  the gap rather than the record. The nine are cited to their
                  DOIs, so they are the stronger claim. */}
              <div>
                <div className="text-5xl font-semibold leading-none tracking-[-0.045em] tabular-nums">
                  {publications.length}
                </div>
                <p className="mt-2 text-sm text-ink-2">
                  peer-reviewed papers by our founders and their laboratory, each one cited
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
                {/* "Closed-loop, one day" left a reader unable to tell product
                    from roadmap, above a link that reads as availability. And the
                    body claimed artifact "never contaminates the recording" where
                    data/products.js says "engineered to minimize" it — the home
                    page was escalating a hedged engineering statement into an
                    absolute, for a preclinical instrument. */}
                <h3 className="mt-3.5 text-2xl tracking-[-0.03em]">
                  Stimulation for pre-clinical research
                </h3>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-ink-2">
                  Synchronized neurochemical and electrophysiological measurement, engineered to
                  minimize stimulation artifact.
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
