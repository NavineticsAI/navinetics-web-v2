import { usePageMeta } from '../lib/meta.js';
import { jobs } from '../data/jobs.js';
import { disciplines, expectations } from '../data/disciplines.js';
import { cn } from '../lib/cn.js';
import {
  Badge,
  Button,
  ConvergenceDiagram,
  Eyebrow,
  Reveal,
  Rule,
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
 *
 * With both off the page is the Open roles block alone, which is intentional.
 */
const SHOW_DISCIPLINE_DIAGRAM = false;
const SHOW_EXPECTATIONS = false;

export default function Careers() {
  usePageMeta({
    title: 'Careers',
    description:
      'Six disciplines converging on one target. Neurosurgery, neurology, mechanical and software engineering, research, and regulatory — building stereotactic navigation systems at NaviNetics.',
  });

  return (
    <>
      {/* ── 1 · Open roles ─────────────────────────────────────────────────
          Deliberately first. With nothing posted, "no roles" would normally be
          a dead end; here it is the primary call to action. */}
      <Section wide className="pt-36">
        {jobs.length > 0 ? (
          <>
            <SectionHead
              eyebrow="Open roles"
              level="h1"
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
          </>
        ) : (
          <>
            {/* Careers has no Hero, so this is the page's only top-level
                heading — without level it rendered an h2 and the document
                outline started at 2 with no h1 above it. */}
            <SectionHead
              eyebrow="Open roles"
              level="h1"
              title="Nothing posted right now."
              lead={
                'Which is not the same as "don\'t write." We hire against the trajectories below ' +
                'whenever the right person appears — so tell us which one is yours.'
              }
            />

            <Reveal className="mt-10">
              <div className="overflow-hidden rounded-lg border border-hairline-soft bg-surface">
                <Rule />
                <div className="px-8 py-11 text-center">
                  {/* h2, not h3. The h1 above is the page's only other heading,
                      so this jumped a level — and a screen reader announcing the
                      outline tells the listener they have missed a section.
                      Size is unchanged; only the tag is. */}
                  <h2 className="text-[clamp(1.4rem,2.6vw,1.9rem)]">
                    Tell us which angle you'd come in from.
                  </h2>
                  <p className="mx-auto mt-3 max-w-[52ch] leading-relaxed text-ink-2">
                    One paragraph on what you'd want to own here, and something you've built or
                    published. No cover letter. It goes to the founders, not a portal.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <Button href="mailto:info@navinetics.com?subject=Open%20application" arrow>
                      Write to us
                    </Button>
                  </div>
                </div>

                <div className="grid gap-px border-t border-hairline-soft bg-hairline-soft [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
                  {disciplines.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-col gap-1 bg-surface px-5 py-4 transition-colors duration-200 hover:bg-action-soft"
                    >
                      <span className="text-[0.9375rem] font-semibold tracking-[-0.02em]">
                        {d.short}
                      </span>
                      <span className="font-[family-name:var(--font-mono)] text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
                        {d.group}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </>
        )}
      </Section>

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
