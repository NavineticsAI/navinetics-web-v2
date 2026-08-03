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
 * The structure is the data's own. These are two threads — getting a probe to
 * a target, and measuring what happens once it is there — and one paper names
 * the NaviNetics system in its title, which is why it carries the top of the
 * page.
 */
export default function Publications() {
  usePageMeta({
    title: 'Publications',
    description:
      'Peer-reviewed research by the NaviNetics founders and their laboratory, across '
      + 'stereotactic systems and intraoperative neurochemical sensing.',
  });

  const featured = publications.find((p) => p.namesSystem);

  return (
    <>
      <Hero
        eyebrow="Resources — Publications"
        title="Highlighted research."
        lead="Peer-reviewed work by our founders and their laboratory, from the first compact
          stereotactic system in 2020 to a clinical evaluation of the NaviNetics system in 2025."
      />

      <Section wide className="!pt-14 md:!pt-16">
        {featured && <Featured p={featured} />}

        {publicationLines.map((line) => (
          <LineSection key={line} line={line} skip={featured} />
        ))}

        <p className="mt-16 max-w-[70ch] border-t border-hairline-soft pt-6 text-sm text-ink-3">
          A selection, not the whole record. Every citation was taken from the published DOI
          rather than transcribed, and each title links to the paper.
        </p>
      </Section>
    </>
  );
}

/* ── one paper, given the top of the page ───────────────────────────────────
   The only one whose title names the system. Its abstract also reports
   figures; they are deliberately not quoted here — see the note in
   data/publications.js.                                                    */
function Featured({ p }) {
  return (
    <Reveal>
      <a
        href={doiLink(p)}
        target="_blank"
        rel="noreferrer"
        className="group/feat block rounded-lg border border-hairline bg-surface p-8 transition-[border-color,box-shadow] duration-[420ms] ease-out hover:border-action hover:shadow-e2 md:p-10"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Badge>NaviNetics system</Badge>
          <span className="font-data text-xs text-ink-3">
            {p.year} · <Citation p={p} />
          </span>
        </div>

        {/* 32ch, not 22: at 22 this title set five lines deep and the card
            became a wall of display type. */}
        <h2 className="mt-5 max-w-[32ch] text-d2 transition-colors group-hover/feat:text-action">
          {p.title}
        </h2>

        {p.excerpt && (
          <p className="mt-5 max-w-[66ch] leading-[1.7] text-ink-2">
            &ldquo;{p.excerpt}&rdquo;
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-baseline gap-x-8 gap-y-4 border-t border-hairline-soft pt-6">
          <p className="min-w-[18rem] flex-1 text-sm leading-relaxed text-ink-2">
            <Authors names={p.authors} />
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-action">
            Read the paper
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </div>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </Reveal>
  );
}

/* ── a line of work ─────────────────────────────────────────────────────── */
function LineSection({ line, skip }) {
  const rows = publications.filter((p) => p.line === line && p !== skip);
  if (!rows.length) return null;

  return (
    <div className="mt-20">
      <Reveal>
        {/* No count on the rule. The featured paper is lifted out of its own
            line, so any number here would be one short of the truth. */}
        <div className="border-b border-ink pb-3.5">
          <h2 className="text-xl tracking-[-0.025em]">{line}</h2>
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
