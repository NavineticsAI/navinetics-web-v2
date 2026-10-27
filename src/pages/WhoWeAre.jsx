import { Link } from 'react-router-dom';
import { cn } from '../lib/cn.js';
import { usePageMeta } from '../lib/meta.js';
import { numbers, principles, timeline } from '../data/company.js';
import { isPlaceholder, visibleProducts } from '../data/products.js';
import { asset } from '../lib/asset.js';
import { Card, Hero, Reveal, Section, SectionHead } from '../ui/index.js';
import { Timeline } from '../ui/Timeline.jsx';

/**
 * The lineage timeline is built, working and deliberately not rendered.
 *
 * Flip this to true to bring it back — nothing else has to change. The
 * component is src/ui/Timeline.jsx and its content is `timeline` in
 * src/data/company.js, both kept intact on purpose.
 */
const SHOW_TIMELINE = false;

/* `focus` is the portrait's CSS object-position, and it is the same value the
   full biography page uses — see the note above `founders` in
   src/pages/Founders.jsx. It has no visible effect in this 4:3 card, which
   crops these landscape frames vertically rather than horizontally, but the two
   pages should not disagree about where a face is if either box changes shape.

   This card shows the full width and the top 93.75% of each file, so the equal
   face size and equal eye height the crops are solved for carry over to it
   unchanged — and it trims the bottom edge, where Lee's crop is padded. */
const FOUNDERS = [
  { name: 'Kendall H. Lee', suffix: 'M.D., Ph.D.', role: 'Co-Founder',
    line: 'Neurosurgeon at Mayo Clinic. Deep brain stimulation for Parkinson’s, tremor, depression, OCD and epilepsy.',
    image: asset('/kendall-lee-150-500x400-1.jpg'), focus: '50% 0%' },
  { name: 'Kevin E. Bennet', suffix: 'MBA, Ph.D.', role: 'Co-Founder',
    line: 'Thirty years in technology development. Patents in neurosurgery, diamond, semiconductor and optical technology.',
    image: asset('/kevin-bennet.jpg'), focus: '50% 0%' },
  { name: 'Stephan J. Goerss', suffix: '', role: 'Co-Founder',
    line: 'Forty years designing neurosurgical devices and stereotactic instrumentation. 51 peer-reviewed papers.',
    image: asset('/stephan-goerss-150.jpg'), focus: '50% 0%' },
  { name: 'Yoonbae Oh', suffix: 'Ph.D.', role: 'CEO & Co-Founder',
    line: 'Associate Professor of Neurosurgery, Mayo Clinic. Associate Director of the Neural Engineering Laboratories. Associate Professor of Brain and Cognitive Engineering, Korea University',
    image: asset('/yoonbae-oh.jpg'), focus: '50% 0%' },
];

/**
 * Who we are.
 *
 * The page used to be a quote and two links to other pages. It now answers the
 * question it is named after: where the company came from, who is behind it,
 * what it makes, and what it holds itself to — with every dated claim traceable
 * to something already published elsewhere on the site. See the claims notice
 * in src/data/company.js.
 */
export default function WhoWeAre() {
  usePageMeta({
    title: 'About NaviNetics',
    description:
      'NaviNetics makes medical devices that change lives, by listening to patients and physicians '
      + 'and translating those conversations into safe, effective and high-quality device '
      + 'offerings. Out of the Neural Engineering Laboratories at Mayo Clinic.',
  });

  const shipping = visibleProducts.filter((p) => !isPlaceholder(p));

  return (
    <>
      {/* "Safe, effective and high-quality" is NaviNetics' own established
          wording — it is on navinetics.com and has been since 2021. It was
          briefly removed here on the reasoning that "safe and effective" is
          FDA's phrase for a device it has authorized. NaviNetics reviewed that
          and kept the wording, which is their call to make: it is their claim,
          on their products, and the D1 is in fact cleared. Restored verbatim so
          both sites say the same thing. */}
      <Hero
        eyebrow="Company — Who we are"
        title="Devices that change lives."
        lead="We strive to make medical devices that change people's lives. We do this by listening to the patient and physician, and translating these conversations into safe, effective and high-quality device offerings."
      />

      {/* The counts are computed from the same files the rest of the site
          renders, so they cannot drift from what those pages say. */}
      <Section wide className="!pt-0">
        <Reveal>
          <div className="grid gap-px overflow-hidden rounded-lg border border-hairline
            bg-hairline sm:grid-cols-3">
            {/* `to` is optional. A tile without one renders as a plain panel
                rather than a Link, because <Link to={undefined}> throws — and
                a tile that looks clickable and is not is worse than one that
                never offered. */}
            {numbers().map((n) => {
              const Tile = n.to ? Link : 'div';
              return (
                <Tile
                  key={n.label}
                  {...(n.to ? { to: n.to } : {})}
                  className={cn(
                    'group/n flex flex-col gap-1 bg-surface p-6',
                    n.to && 'transition-colors hover:bg-surface-2',
                  )}
                >
                  <span className="text-4xl font-semibold leading-none tracking-[-0.045em] tabular-nums
                    text-action">
                    {n.value}
                  </span>
                  <span className="mt-1.5 text-sm font-semibold">{n.label}</span>
                  <span className="text-xs leading-relaxed text-ink-3">{n.unit}</span>
                </Tile>
              );
            })}
          </div>
        </Reveal>
      </Section>

      {SHOW_TIMELINE && (
        <Section wide band>
          <SectionHead
            eyebrow="Where this came from"
            title="A neurosurgeon and an engineer, in the same building as the operating theater."
            lead="NaviNetics did not start as a company. It started as instruments built inside a
              neurosurgery department, for the people using them down the corridor."
          />
          <Timeline entries={timeline} />
        </Section>
      )}

      <Section wide>
        {/* The eyebrow already says "founders", so the heading names the three
            fields instead of restating it. Same noun-phrase pattern as "Two
            lines of work." and "Five territories." elsewhere on the site. */}
        <SectionHead
          eyebrow="The founders"
          title="Neurosurgery, engineering, and device design."
        />
        {/* Four founders: 2×2 from sm, one row from xl. Three columns would
            strand the fourth card alone on a second row. */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {FOUNDERS.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.06}>
              <Link
                to="/company/our-founders"
                className="group/f flex h-full flex-col overflow-hidden rounded-lg border
                  border-hairline-soft bg-surface transition-[transform,box-shadow,border-color]
                  duration-[420ms] ease-out hover:-translate-y-1 hover:border-hairline
                  hover:shadow-e3"
              >
                {/* People are not targets — no reticle on portraits. */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-sunk">
                  <img
                    src={f.image}
                    alt={`Portrait of ${f.name}`}
                    loading="lazy"
                    style={{ objectPosition: f.focus }}
                    className="h-full w-full object-cover object-top transition-transform
                      duration-[1200ms] ease-out group-hover/f:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <span className="eyebrow text-action">{f.role}</span>
                  <h3 className="text-lg tracking-[-0.03em]">
                    {f.name}
                    {f.suffix && <span className="text-ink-3">{` ${f.suffix}`}</span>}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-2">{f.line}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Centred on review, and the metric chips under each card ("Degrees of
          freedom 3 + 2", "Localizers MR · CT", and MAVEN's two) removed. The
          grid was three columns from lg for two cards, which left the right
          third of the row empty; two columns across the full width keeps the
          pair centred under the heading, and at that width the NRSS text no
          longer runs short of MAVEN's and leaves a gap at the foot of its
          card. */}
      <Section wide band>
        <SectionHead align="center" eyebrow="What we make" title="Two lines of work." />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {shipping.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <Card lift as={Link} to={p.path} className="flex h-full flex-col gap-3">
                <span className="eyebrow text-action">{p.family}</span>
                <h3 className="text-xl tracking-[-0.03em]">{p.tagline.replace('\n', ' ')}</h3>
                <p className="text-sm leading-relaxed text-ink-2">{p.summary}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        {/* Heading centred on review, and the list with it. Centring the list
            as a box was not enough: titles in a fixed left column and ragged
            text on the right still put the weight left of the heading. So the
            rows are set on the page's centre line instead — titles ranged right
            up to it, text ranged left from it — and stacked and centred on a
            phone. */}
        <SectionHead align="center" eyebrow="How we work" title="Three things we hold to." />
        <div className="mx-auto mt-10 flex max-w-4xl flex-col divide-y divide-hairline-soft border-y border-hairline-soft">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <div className="grid gap-2 py-7 text-center sm:grid-cols-2 sm:gap-x-10 sm:text-left">
                <h3 className="text-base tracking-[-0.025em] sm:text-right">{p.title}</h3>
                <p className="text-sm leading-relaxed text-ink-2">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* The "Come and find us." closing band — downtown Rochester, with
          buttons to /company/community and /resources/careers — was removed
          on review. */}
    </>
  );
}
