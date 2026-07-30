import { usePageMeta } from '../lib/meta.js';
import { jobs } from '../data/jobs.js';
import { Badge, Button, Hero, Reveal, Section, SectionHead, Statement } from '../ui/index.js';

export default function Careers() {
  usePageMeta({
    title: 'Careers',
    description:
      'A career at NaviNetics means growing your skills in a highly collaborative environment, making a meaningful difference in people’s lives.',
  });

  return (
    <>
      <Hero
        eyebrow="Careers"
        title="Innovators and problem-solvers."
        lead="NaviNetics is a design and development company with a core of engineers and regulatory specialists bringing medical devices to market. Our partnerships reach from the research laboratory to the bedside."
      />

      <Section>
        {/* Renders the job list the moment data/jobs.js is non-empty —
            no page work needed when the first opening posts. */}
        {jobs.length > 0 ? (
          <>
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
          </>
        ) : (
          <Statement
            eyebrow="No open roles right now"
            title="We still want to hear from you."
            actions={
              <Button href="mailto:info@navinetics.com?subject=Careers%20at%20NaviNetics" arrow>
                Get in touch about careers
              </Button>
            }
          >
            <p>
              A career at NaviNetics gives opportunities to grow and develop your skills in a highly
              collaborative and supportive environment. We have a passion for making a meaningful
              difference in people's lives and are always seeking fellow innovators and
              problem-solvers.
            </p>
          </Statement>
        )}
      </Section>
    </>
  );
}
