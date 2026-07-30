import { useMemo, useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { usePageMeta } from '../lib/meta.js';
import {
  publications,
  publicationTopics,
  publicationYears,
} from '../data/publications.js';
import { Badge, Button, Hero, Reveal, Section } from '../ui/index.js';
import { cn } from '../lib/cn.js';

const PAGE = 8;

export default function Publications() {
  usePageMeta({
    title: 'Publications',
    description:
      'Selected research from the NaviNetics team spanning neurostimulation, advanced stereotactics and neurochemical monitoring.',
  });

  const [query, setQuery] = useState('');
  const [year, setYear] = useState('all');
  const [topic, setTopic] = useState('all');
  const [shown, setShown] = useState(PAGE);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications.filter((p) => {
      if (year !== 'all' && String(p.year) !== year) return false;
      if (topic !== 'all' && !p.topics.includes(topic)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.journal.toLowerCase().includes(q)
      );
    });
  }, [query, year, topic]);

  const filtered = year !== 'all' || topic !== 'all' || query.trim() !== '';
  const clear = () => {
    setQuery('');
    setYear('all');
    setTopic('all');
    setShown(PAGE);
  };

  return (
    <>
      <Hero
        eyebrow="Resources — Publications"
        title="The work behind the devices."
        lead={`Our team actively contributes to scientific advancement. ${publications.length} selected papers below, from over 100 spanning decades of research.`}
      />

      <Section band wide className="!py-16">
        {/* Controls — a flat list does not survive "100+ more publications" */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShown(PAGE);
              }}
              placeholder="Search titles, authors, journals…"
              aria-label="Search publications"
              className="w-full rounded-full border border-hairline bg-surface py-3 pl-11 pr-4 text-sm transition-[border-color,box-shadow] duration-200 placeholder:text-ink-3 hover:border-ink-3 focus:border-action focus:outline-none focus:ring-[3px] focus:ring-action-soft"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterGroup
              label="Topic"
              value={topic}
              onChange={(v) => {
                setTopic(v);
                setShown(PAGE);
              }}
              options={publicationTopics}
            />
            <span className="mx-1 hidden h-5 w-px bg-hairline sm:block" aria-hidden="true" />
            <FilterGroup
              label="Year"
              value={year}
              onChange={(v) => {
                setYear(v);
                setShown(PAGE);
              }}
              options={publicationYears.map(String)}
            />
            {filtered && (
              <button
                type="button"
                onClick={clear}
                className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:bg-action-soft hover:text-action"
              >
                <X size={12} aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>

          <p className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3" aria-live="polite">
            {results.length} {results.length === 1 ? 'publication' : 'publications'}
            {filtered && ` of ${publications.length}`}
          </p>
        </div>
      </Section>

      <Section wide className="!pt-4">
        {results.length === 0 ? (
          <div className="rounded-lg border border-hairline-soft bg-surface p-12 text-center">
            <h2 className="text-xl">No publications match those filters.</h2>
            <p className="mt-2 text-ink-2">Try a broader search, or clear the filters.</p>
            <Button onClick={clear} variant="secondary" className="mt-6">
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {results.slice(0, shown).map((p) => (
                <li key={p.link}>
                  <Reveal>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="group/pub flex flex-col gap-5 rounded-lg border border-hairline-soft bg-surface p-6 transition-[transform,box-shadow,border-color] duration-[420ms] ease-out hover:-translate-y-1 hover:border-hairline hover:shadow-e2 md:flex-row md:items-center md:p-8"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge tone="line">{p.year}</Badge>
                          <span className="text-sm font-medium text-action">{p.journal}</span>
                        </div>
                        <h2 className="mt-3 text-xl leading-snug tracking-[-0.028em] transition-colors group-hover/pub:text-action md:text-2xl">
                          {p.title}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-ink-2">{p.authors}</p>
                      </div>
                      <span
                        className="hidden h-12 w-12 shrink-0 place-items-center rounded-full bg-sunk text-ink-3 transition-[background-color,color,transform] duration-300 group-hover/pub:scale-110 group-hover/pub:bg-action group-hover/pub:text-on-action md:grid"
                        aria-hidden="true"
                      >
                        <ArrowUpRight size={20} />
                      </span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>

            {shown < results.length && (
              <div className="mt-10 flex justify-center">
                <Button variant="secondary" onClick={() => setShown((s) => s + PAGE)}>
                  Show {Math.min(PAGE, results.length - shown)} more
                </Button>
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}

function FilterGroup({ label, value, onChange, options }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 eyebrow text-ink-3">{label}</span>
      <Chip active={value === 'all'} onClick={() => onChange('all')}>
        All
      </Chip>
      {options.map((o) => (
        <Chip key={o} active={value === o} onClick={() => onChange(o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-150',
        active
          ? 'border-transparent bg-action text-on-action'
          : 'border-hairline text-ink-2 hover:border-action hover:text-action',
      )}
    >
      {children}
    </button>
  );
}
