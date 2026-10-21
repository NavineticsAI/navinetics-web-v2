import { ArrowRight } from 'lucide-react';
import { usePageMeta } from '../lib/meta.js';
import { jobs } from '../data/jobs.js';
import { disciplines, expectations } from '../data/disciplines.js';
import { cn } from '../lib/cn.js';
import {
  Badge,
  ConvergenceDiagram,
  Eyebrow,
  Hero,
  Reveal,
  Section,
  SectionHead,
  TickLine,
} from '../ui/index.js';

/**
 * Sections built and working, but held back from the live page. Flip either to
 * `true` to publish it — the components, data and styles all stay compiled and
 * linted meanwhile, so they cannot rot the way commented-out JSX does.
 *
 *   SHOW_DISCIPLINE_DIAGRAM → src/ui/ConvergenceDiagram.jsx + data/disciplines.js
 *   SHOW_EXPECTATIONS       → `expectations` in data/disciplines.js
 */
const SHOW_DISCIPLINE_DIAGRAM = false;
const SHOW_EXPECTATIONS = false;

const CAREERS_MAIL = 'mailto:info@navinetics.com?subject=Careers';

/**
 * The content is navinetics.com/careers, verbatim, on review: the heading from
 * its "Join Our Team" banner, its three paragraphs, and the address they all
 * point to. It replaced "No open postings today." over a grid of the six
 * disciplines, which the company site does not have and the review did not
 * keep.
 *
 * Open roles still list themselves: add one to data/jobs.js and it appears
 * under the introduction with no page work.
 */
export default function Careers() {
  usePageMeta({
    title: 'Careers',
    description:
      'NaviNetics is a design and development company with a core of engineers and regulatory specialists bringing medical devices to market. For careers, contact info@navinetics.com.',
  });

  return (
    <>
      {/* The paragraphs below continue the hero's lead, so the hero gives up
          its half-screen minimum height and the section-sized bottom padding
          that came with it — on review, the gap between the first paragraph
          and the second read as a break in the text. */}
      <Hero
        className="min-h-0 pb-8 md:pb-8 lg:pb-10"
        eyebrow="Careers"
        title="Join our team."
        lead="NaviNetics is a design and development company with a core of engineers and regulatory specialists bringing medical devices to market. Our partnerships reach from the research laboratory to the bedside with access to cutting-edge technology and worldwide resources."
      />

      <Section wide className="!pt-0">
        <div className="grid items-start gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <Reveal className="flex flex-col gap-6 text-lead leading-[1.55] tracking-[-0.015em] text-ink-2">
            <p className="max-w-prose">
              A career at NaviNetics gives opportunities to grow and develop your skills in a highly
              collaborative and supportive environment. We have a passion for making a meaningful
              difference in people’s lives and are always seeking fellow innovators and
              problem-solvers.
            </p>
            <p className="max-w-prose">
              For more information on available careers, contact us at{' '}
              <a href={CAREERS_MAIL} className="font-semibold text-action hover:text-action-hi">
                info@navinetics.com
              </a>
              .
            </p>
          </Reveal>

          {/* Stands where the company site has its "Join Our Team" banner,
              which is an image of text linking to the same address. Real text
              here, so it reads, scales and translates. */}
          <Reveal delay={0.06}>
            <div className="flex flex-col gap-5 rounded-lg bg-action p-8 text-on-action md:p-10">
              <span className="font-data text-[0.6875rem] uppercase tracking-[0.14em] opacity-75">
                Contact us
              </span>
              <a
                href={CAREERS_MAIL}
                className="w-fit text-[clamp(1.375rem,2.4vw,1.75rem)] font-semibold tracking-[-0.03em]
                  underline-offset-4 hover:underline"
              >
                info@navinetics.com
              </a>
              <a
                href={CAREERS_MAIL}
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-on-action px-5 py-2.5
                  text-sm font-semibold text-action transition-transform duration-200 hover:-translate-y-px"
              >
                Write to us
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </Section>

      {jobs.length > 0 && (
        <Section wide band>
          <SectionHead
            eyebrow="Open roles"
            title={`${jobs.length} ${jobs.length === 1 ? 'opening' : 'openings'}`}
          />
          <ul className="mt-10 flex flex-col gap-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <Reveal>
                  <a
                    href={`mailto:info@navinetics.com?subject=${encodeURIComponent(job.title)}`}
                    className="group/job flex flex-col gap-4 rounded-lg border border-hairline-soft bg-surface p-6 transition-[transform,box-shadow,border-color] duration-[420ms] ease-out hover:-translate-y-1 hover:border-hairline hover:shadow-e2 md:flex-row md:items-center"
                  >
                    <div className="flex-1">
                      <h3 className="text-xl tracking-[-0.028em] group-hover/job:text-action">
                        {job.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-ink-2">{job.summary}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="line">{job.team}</Badge>
                      <Badge tone="line">{job.location}</Badge>
                      <Badge>{job.type}</Badge>
                    </div>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── 2 · Careers at NaviNetics ──────────────────────────────────────
          Arc-centered stereotaxy reaches one point from many angles. So does the
          team. The diagram is the company's own geometry, used as an org chart.
          Currently hidden — see SHOW_DISCIPLINE_DIAGRAM above. */}
      {SHOW_DISCIPLINE_DIAGRAM && (
        <section className="bg-nn-950 pt-20 text-nn-50">
          <div className="nn-frame mx-auto px-6 lg:px-8">
            <TickLine className="!bg-white/15" />
            <Eyebrow className="!text-sg-300">Careers at NaviNetics</Eyebrow>
          </div>
          <ConvergenceDiagram items={disciplines} />
        </section>
      )}

      {/* ── 3 · Before you apply ───────────────────────────────────────────
          Naming what the job is NOT filters badly-matched applicants and reads
          as confidence. Almost no medical-device careers page does this.
          Currently hidden — see SHOW_EXPECTATIONS above. */}
      {SHOW_EXPECTATIONS && (
        <Section band wide id="honest">
          <SectionHead
            eyebrow="Before you apply"
            title="What this job is, and isn't."
            lead="Class II/III medical devices are not a startup sprint. We'd rather you know that now than three months in."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {expectations.map((e, i) => (
              <Reveal key={e.title} delay={i * 0.05}>
                <div className="h-full rounded-md border border-hairline-soft bg-surface p-6">
                  <span
                    className={cn(
                      'font-[family-name:var(--font-mono)] text-[0.625rem] uppercase tracking-[0.14em]',
                      e.tone === 'no' ? 'text-warn' : 'text-ok',
                    )}
                  >
                    {e.label}
                  </span>
                  <h3 className="mt-1.5 text-[1.0625rem] tracking-[-0.025em]">{e.title}</h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-2">{e.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

    </>
  );
}
