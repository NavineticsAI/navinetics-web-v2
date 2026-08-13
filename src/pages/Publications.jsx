import { ArrowUpRight } from 'lucide-react';
import { usePageMeta } from '../lib/meta.js';
import {
  doiLink,
  founders,
  publicationLineBlurbs,
  publicationLines,
  publications,
} from '../data/publications.js';
import { Badge, Hero, Reveal, Section } from '../ui/index.js';

/**
 * Publications.
 *
 * Nine papers, so there is no search box, no filter chips and no pagination.
 * That machinery exists for a list nobody can read in one sitting; on a list
 * this size it is furniture between the reader and the work.
 *
 * The three sections are the site's three technology lines, so the categories
 * here are the same ones /technology uses. NaviNetics AI has no papers yet and
 * still gets its heading — see `publicationLines` in data/publications.js.
 *
 * There is no featured paper. The 2025 Operative Neurosurgery paper, the only
 * one whose title names the NaviNetics system, used to be lifted out into a
 * card above these sections; it was removed on NaviNetics' instruction and now
 * sits in Stereotactic Devices with the rest, in year order.
 */
export default function Publications() {
  usePageMeta({
    title: 'Publications',
    description:
      'Peer-reviewed research by the NaviNetics founders and their laboratory, across '
      + 'stereotactic systems and intraoperative neurochemical sensing.',
  });

  return (
    <>
      <Hero
        eyebrow="Resources — Publications"
        title="Highlighted research."
        lead="Peer-reviewed work by our founders and their laboratory, from the first compact
          stereotactic system in 2020 to a clinical evaluation of the NaviNetics system in 2025."
      />

      <Section wide className="!pt-14 md:!pt-16">
        {publicationLines.map((line, i) => (
          <LineSection key={line} line={line} first={i === 0} />
        ))}

        <p className="mt-16 max-w-[70ch] border-t border-hairline-soft pt-6 text-sm text-ink-3">
          A selection, not the whole record. Every citation was taken from the published DOI
          rather than transcribed, and each title links to the paper.
        </p>
      </Section>
    </>
  );
}

/* ── a line of work ─────────────────────────────────────────────────────── */
function LineSection({ line, first }) {
  const rows = publications.filter((p) => p.line === line);

  /* Rendered even with no rows. A line with nothing under it is a fact about
     the record — NaviNetics AI has published none — and hiding the heading
     would make the page disagree with /technology about how many lines exist. */
  return (
    <div className={first ? '' : 'mt-20'}>
      <Reveal>
        <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3.5">
          <h2 className="text-xl tracking-[-0.025em]">{line}</h2>
          <span className="font-data text-xs text-ink-3">
            {rows.length === 1 ? '1 paper' : `${rows.length} papers`}
          </span>
        </div>
        <p className="mt-3.5 max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-2">
          {publicationLineBlurbs[line]}
        </p>
      </Reveal>

      <ul className="mt-2">
        {rows.map((p) => (
          <li key={p.doi}>
            <Reveal>
              <Row p={p} />
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* One row per paper, all the same weight. The year sits in its own column so
   the whole list reads down a single spine. */
function Row({ p }) {
  return (
    <a
      href={doiLink(p)}
      target="_blank"
      rel="noreferrer"
      className="group/row grid grid-cols-1 gap-x-7 gap-y-1 border-b border-hairline-soft py-7 transition-colors duration-200 hover:bg-action-soft sm:grid-cols-[5.5rem_1fr_auto]"
    >
      <span className="pt-1 font-data text-[1.0625rem] font-semibold text-ink-3 transition-colors group-hover/row:text-action">
        {p.year}
      </span>

      <div>
        <h3 className="text-xl leading-[1.3] tracking-[-0.028em] transition-colors group-hover/row:text-action md:text-2xl">
          {p.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="text-sm font-medium text-action">{p.journal}</span>
          <span className="font-data text-xs text-ink-3">
            <Citation p={p} />
          </span>
          {p.nnAffiliation && <Badge>NaviNetics affiliation</Badge>}
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-2">
          <Authors names={p.authors} />
        </p>
      </div>

      <span
        className="hidden h-8 w-8 shrink-0 self-center place-items-center rounded-full text-ink-3 transition-[background-color,color,transform] duration-300 group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 group-hover/row:bg-action group-hover/row:text-on-action sm:grid"
        aria-hidden="true"
      >
        <ArrowUpRight size={16} />
      </span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function Citation({ p }) {
  return [p.volume && `vol ${p.volume}`, p.pages && `pp ${p.pages}`].filter(Boolean).join(' · ');
}

/**
 * Author lists here run to thirty-six names. Showing the first few and the
 * last two keeps the people who carry meaning — the lead authors and the
 * senior authors at the end, where the founders sit — and counts the rest
 * rather than dropping them silently.
 */
function Authors({ names }) {
  const mark = (n) =>
    founders.includes(n) ? (
      <strong key={n} className="font-semibold text-ink">
        {n}
      </strong>
    ) : (
      <span key={n}>{n}</span>
    );

  if (names.length <= 6) {
    return names.map((n, i) => (
      <span key={n}>
        {i > 0 && ', '}
        {mark(n)}
      </span>
    ));
  }

  const head = names.slice(0, 3);
  const tail = names.slice(-2);
  return (
    <>
      {head.map((n, i) => (
        <span key={n}>
          {i > 0 && ', '}
          {mark(n)}
        </span>
      ))}
      <span className="text-ink-3">{` … +${names.length - 5} more … `}</span>
      {tail.map((n, i) => (
        <span key={n}>
          {i > 0 && ', '}
          {mark(n)}
        </span>
      ))}
    </>
  );
}
