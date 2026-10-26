import { usePageMeta } from '../lib/meta.js';
import { getTechnology } from '../data/technology.js';
import { chapters, evidence, gap, paperFor } from '../data/neuromodulation.js';
import { doiLink } from '../data/publications.js';
import { Hero, LinkAction, Reveal, Section, SectionHead } from '../ui/index.js';
import { ScienceBand } from '../ui/ScienceBand.jsx';

/**
 * Neuromodulation — the research behind it.
 *
 * Its own route rather than the technology template for the same reason the
 * other two exceptions have one: the template is three principles beside a
 * photograph, and this subject is an arc of published work that wants figures
 * and room.
 *
 * Every chapter is one paper. The citation under each is read out of
 * data/publications.js by DOI rather than retyped, so this page and the
 * publications page cannot disagree about a year, a journal or an author list.
 * See the claims notice in data/neuromodulation.js for what is deliberately
 * not asserted.
 */
export default function Neuromodulation() {
  const tech = getTechnology('neuromodulation');

  usePageMeta({
    title: 'Neuromodulation',
    description:
      'The research behind measuring what stimulation changes: tonic and phasic neurochemical '
      + 'recording, resolved analytes, and both signals on one platform. Four published papers.',
  });

  return (
    <>
      <Hero
        size="lg"
        tone="dark"
        eyebrow={tech.eyebrow}
        title={tech.tagline}
        lead={tech.summary}
      />

      {/* The question everything after this is a step toward. */}
      <Section>
        <SectionHead eyebrow={gap.eyebrow} title={gap.title} />
        <Reveal className="mt-8 flex flex-col gap-6">
          <p className="max-w-prose text-lead leading-[1.6] tracking-[-0.015em] text-ink-2">
            {gap.body}
          </p>
        </Reveal>
      </Section>

      {chapters.map((c) => (
        <div key={c.id}>
          <ScienceBand {...c} />
          <Citation chapter={c} />
        </div>
      ))}

      {/* The four, together, so the arc is visible as a list and not only as a
          scroll. Same records the publications page renders. */}
      <Section wide band>
        {/* EYEBROW AND LEAD WITHDRAWN - 2026-10-22. The eyebrow read "The
            evidence"; the lead read "Peer-reviewed and resolved from Crossref
            against their DOIs - the same records the publications page
            carries." The title was "The published record." and is reworded on
            the same instruction. */}
        <SectionHead title="The published work behind it." />
        <div className="mt-10 flex flex-col divide-y divide-hairline-soft border-y border-hairline-soft">
          {evidence.map((p) => (
            <Reveal key={p.doi}>
              <a
                href={doiLink(p)}
                target="_blank"
                rel="noreferrer"
                className="group/p grid gap-x-8 gap-y-2 py-6 transition-colors hover:bg-surface
                  sm:grid-cols-[4rem_1fr_10rem]"
              >
                <span className="font-data text-sm tabular-nums text-action">{p.year}</span>
                <span>
                  <span className="block text-[0.9375rem] font-semibold leading-snug tracking-[-0.02em]
                    group-hover/p:text-action">
                    {p.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-3">
                    {/* NO FOUNDER HIGHLIGHTING - 2026-10-22. Each author
                        whose name appeared in `founders` was set in
                        font-semibold text-ink-2 against the rest. Every author
                        now reads the same. The author list is otherwise
                        unchanged, and /resources/publications still
                        highlights - only this page was asked to stop. */}
                    {p.authors.join(', ')}
                  </span>
                </span>
                <span className="font-data text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
                  {p.journal}
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        {/* ONE WAY OUT. Removing the two closing sections on 2026-10-22 left
            this page with no internal links at all - every remaining link was
            an external DOI, so a reader finishing the page had nowhere to go
            inside the site. Restored as a single link on 2026-10-26 rather
            than as the section it came from. */}
        <Reveal className="mt-10">
          <LinkAction to="/resources/publications">
            The full publication record
          </LinkAction>
        </Reveal>
      </Section>

      {/* THE CLOSING SECTION IS WITHDRAWN - both of its columns, on
         NaviNetics' instruction 2026-10-22.

         Left column: "Applied in" / "The instrument it became." / "Why it
         records chemistry and electrophysiology together.", over a ProductCard
         for MAVEN.

         Right column: "Go deeper" / "The evidence." / "This page is what the
         work established. The papers themselves, and the rest of the
         laboratory's published record, are listed in full.", over two links -
         "Voltammetry method papers" (from tech.readMore) and "How the
         electrode is placed" (to /technology/stereotactic-devices).

         WHAT THIS COSTS: this page no longer links to MAVEN or to the
         stereotactic page at all, and the only route from here to
         /resources/publications is the per-paper DOI links in the record
         section above, which open externally rather than going there. The page
         now ends on that list. */}
      {/* THE METHOD SECTION IS WITHDRAWN - "The method" / "From first
         principles." / "What deep brain stimulation is, how a neurochemical is
         detected at all, and the two recording methods this work introduced",
         over an index of the education topics named on the technology record.
         Off on NaviNetics' instruction 2026-10-22.

         The topics themselves are untouched in data/education.js and still
         render on /technology/education. This page simply no longer indexes
         them, so `teaches` on the neuromodulation record is now read by
         nothing. */}
    </>
  );
}

/**
 * The paper a band was built on, set immediately under it.
 *
 * Its own strip rather than a line inside the band: the bands alternate ground
 * and this has to read the same under both, and a citation belongs to the
 * section above it rather than inside its argument.
 */
function Citation({ chapter }) {
  const p = paperFor(chapter.doi);
  /* ONE LINK, ON THE PAPER ITSELF - 2026-10-22. This strip used to carry the
     title as plain text with two links beside it: the chapter's `readMore`
     ("Absolute concentration recording, explained" and the like) and a
     "DOI 10.xxxx/yyyy" link. Both are gone and the title is now the link,
     which is what "make the paper clickable" asked for.

     The DOI is no longer printed here. It is still what the href is built from
     (doiLink), and it is still shown in full on /resources/publications. */
  return (
    <div className="border-b border-hairline-soft bg-sunk px-6 py-4 lg:px-8">
      <div className="nn-frame mx-auto flex flex-wrap items-baseline gap-x-8 gap-y-2">
        <p className="text-[0.8125rem] leading-relaxed text-ink-2">
          <span className="font-data text-[0.625rem] uppercase tracking-[0.14em] text-ink-3">
            {'Paper · '}
          </span>
          <a
            href={doiLink(p)}
            target="_blank"
            rel="noreferrer"
            className="text-action underline-offset-4 hover:underline"
          >
            {p.title}
          </a>
          {'. '}
          <i className="not-italic text-ink-3">{`${p.journal} ${p.volume}, ${p.pages} (${p.year}).`}</i>
        </p>
      </div>
    </div>
  );
}
