import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePageMeta } from '../lib/meta.js';
import { topics } from '../data/education.js';
import { Hero, Reveal, Section } from '../ui/index.js';
import { EduFigure } from '../ui/EduFigures.jsx';
import { cn } from '../lib/cn.js';

/**
 * Education.
 *
 * Five topics on one page, and a rail that never leaves — it marks where you
 * are, fills in behind you, and jumps anywhere in one click. The page this
 * replaced put an anchor list at the top that scrolled away and was never seen
 * again, which is not navigation so much as a table of contents you pass once.
 *
 * Every topic runs the same shape, so the second one teaches you how to read
 * the third: a one-sentence answer, the explanation, three key ideas, a
 * figure, then the technical paragraph folded away. Someone who wants the gist
 * gets it in fifteen seconds a topic; a researcher opens every panel.
 */
export default function Education() {
  usePageMeta({
    title: 'Education',
    description:
      'The science behind NaviNetics — deep brain stimulation, stereotactic neurosurgery, and '
      + 'neurochemical recording, explained with working diagrams.',
  });

  const { active, progress } = useScrollSpy(topics);

  return (
    <>
      <Hero
        eyebrow="Resources — Education"
        title="The science behind the devices."
        lead="Five topics, in the order they build on each other: what deep brain stimulation is, how a
          target is reached, and how what happens at that target is measured. Written for a curious
          reader first, with the technical detail one click away."
      />

      <Section wide className="!pt-10 md:!pt-12">
        {/* The rail is horizontal below lg, where a 250px column would eat the
            reading measure. Same five stops either way. */}
        <nav
          aria-label="Topics"
          className="sticky top-[4.5rem] z-30 -mx-6 mb-8 overflow-x-auto border-b border-hairline-soft bg-canvas px-6 py-2.5 lg:hidden"
        >
          <ol className="flex gap-2">
            {topics.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  aria-current={active === t.id ? 'true' : undefined}
                  className={cn(
                    'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                    active === t.id
                      ? 'border-action font-semibold text-action'
                      : 'border-hairline text-ink-2',
                  )}
                >
                  <span className="font-data text-[0.6875rem]">{t.n}</span>
                  {t.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid items-start gap-x-16 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <Rail active={active} progress={progress} />
          <div>
            {topics.map((t) => (
              <Topic key={t.id} t={t} />
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

/* ── the rail ───────────────────────────────────────────────────────────── */
function Rail({ active, progress }) {
  const idx = topics.findIndex((t) => t.id === active);
  return (
    <aside className="sticky top-28 hidden pb-16 lg:block">
      <p className="eyebrow mb-4 text-ink-3">Topics</p>
      <nav aria-label="On this page">
        <ol className="relative">
          <span
            className="absolute left-[0.8125rem] top-1.5 bottom-1.5 w-0.5 rounded bg-hairline"
            aria-hidden="true"
          />
          <span
            className="absolute left-[0.8125rem] top-1.5 w-0.5 rounded bg-action transition-[height] duration-150"
            style={{ height: `calc(${progress}% - 0.75rem)` }}
            aria-hidden="true"
          />
          {topics.map((t, i) => {
            const on = t.id === active;
            return (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  aria-current={on ? 'true' : undefined}
                  className={cn(
                    'flex items-start gap-3.5 py-2.5 text-[0.9375rem] leading-snug transition-colors',
                    on ? 'font-semibold text-ink' : 'text-ink-3 hover:text-ink',
                  )}
                >
                  <span
                    className={cn(
                      'relative z-10 -mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-canvas font-data text-[0.6875rem] font-semibold transition-[box-shadow,color,background-color] duration-300',
                      on
                        ? 'bg-action text-on-action shadow-[inset_0_0_0_2px_var(--color-action)]'
                        : i < idx
                          ? 'text-action shadow-[inset_0_0_0_2px_var(--color-action)]'
                          : 'text-ink-3 shadow-[inset_0_0_0_2px_var(--color-hairline)]',
                    )}
                  >
                    {t.n}
                  </span>
                  <span>{t.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}

/* ── one topic ──────────────────────────────────────────────────────────── */
function Topic({ t }) {
  return (
    <section id={t.id} className="scroll-mt-28 pb-24">
      <Reveal>
        <div className="flex items-center gap-3.5 border-b border-ink pb-3">
          <span className="font-data text-[0.8125rem] font-semibold tracking-[0.08em] text-action">{t.n}</span>
          {/* Not text-d2: five of these on one page at 2.75rem would compete
              with the hero. There is no d3 in the scale, so this is explicit. */}
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] tracking-[-0.03em]">{t.title}</h2>
        </div>
      </Reveal>

      <Reveal>
        <p className="mt-6 max-w-[40ch] text-lead leading-[1.45] tracking-[-0.018em]">{t.definition}</p>
        {t.body && <p className="mt-5 max-w-prose leading-[1.72] text-ink-2">{t.body}</p>}
      </Reveal>

      {t.keys && (
        <Reveal>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-3">
            {t.keys.map(([head, body]) => (
              <div key={head} className="bg-surface p-5">
                <h3 className="text-[0.9375rem] tracking-[-0.015em]">{head}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* A topic that has to be worked through in order carries parts instead
          of one body: each states its problem, then shows it. */}
      {t.parts?.map((p) => (
        <Part key={p.key} part={p} />
      ))}

      {t.lists && (
        <Reveal className="mt-6 flex flex-col gap-4">
          {t.lists.map((l) => (
            <div key={l.label}>
              <p className="eyebrow text-ink-3">{l.label}</p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {l.items.map((item) => (
                  <li
                    key={item}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs',
                      l.tone === 'action' ? 'bg-action-soft text-action' : 'bg-hairline-soft text-ink-3',
                    )}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      )}

      {/*
        The last figure and a lone picture share a row.
        ─────────────────────────────────────────────────────────────────────
        The interactive figures are wide cards that do not fill their width —
        the implanted-system diagram is a body outline with three labelled
        nodes, and the right third of it is empty. Meanwhile a topic with one
        picture left that picture alone in a three-column grid, using a third
        of its own dedicated band.

        Two half-empty rows, one after the other. So the picture moves up
        beside the figure and both rows become one. Only when there is a
        single picture: two or more still want their own row, and three fill
        the grid the grid was built for.
      */}
      {(() => {
        const figures = t.figures ?? [];
        const shots = t.shots ?? [];
        const inlineShot = figures.length > 0 && shots.length === 1;

        if (!inlineShot) {
          return figures.map((f) => <EduFigure key={f} name={f} />);
        }

        const last = figures[figures.length - 1];
        return (
          <>
            {figures.slice(0, -1).map((f) => <EduFigure key={f} name={f} />)}
            {/* Proportional, not a fixed sidebar. At a fixed 17rem the picture
                sat beside a card three times its size and read as an
                afterthought pinned to the edge. Two thirds / one third makes
                them peers — the diagram still leads, the photograph is still
                clearly a photograph, and neither looks like a leftover. */}
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
              <EduFigure name={last} />
              {/* Pushed down by the figure's own mt-9 so their tops align. */}
              <div className="lg:mt-9">
                <Shot shot={shots[0]} label={`${t.n}.1`} />
              </div>
            </div>
          </>
        );
      })()}

      {/*
        The deep-dive, and any pictures the figure row did not already take.
        ─────────────────────────────────────────────────────────────────────
        A single picture has gone up beside the last figure. What is left here
        is two pictures — which pair with the deep-dive panel and fill the row
        — or three, which keep the grid that arrangement was built for.
      */}
      {(() => {
        const figures = t.figures ?? [];
        const all = t.shots ?? [];
        // Already rendered beside the figure; do not draw it twice.
        const shots = figures.length > 0 && all.length === 1 ? [] : all;
        const paired = shots.length > 0 && shots.length < 3;

        const deep = (
          /* A chevron, because without one this reads as a card rather than as
             something you can open. */
          <details className="group overflow-hidden rounded-lg border border-hairline-soft bg-surface">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3.5 text-[0.9375rem] font-semibold marker:content-none">
              {t.deep.label}
              <ChevronDown
                size={16}
                aria-hidden="true"
                className="ml-auto shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="max-w-prose px-5 pb-4 leading-[1.7] text-ink-2">{t.deep.body}</p>
          </details>
        );

        if (!paired) {
          return (
            <>
              <Reveal className="mt-6">{deep}</Reveal>
              {shots.length > 0 && (
                <Reveal>
                  <div className="mt-10 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {shots.map((s, i) => (
                      <Shot key={s.title} shot={s} label={`${t.n}.${i + 1}`} />
                    ))}
                  </div>
                </Reveal>
              )}
            </>
          );
        }

        return (
          <Reveal>
            <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
              {deep}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {shots.map((s, i) => (
                  <Shot key={s.title} shot={s} label={`${t.n}.${i + 1}`} />
                ))}
              </div>
            </div>
          </Reveal>
        );
      })()}
    </section>
  );
}

/** One step of a topic that has to be read in order: A, then B, then C. */
function Part({ part }) {
  return (
    <div className="mt-14">
      <Reveal>
        <div className="flex items-baseline gap-3 border-b border-hairline pb-2.5">
          <span className="font-data text-xs font-semibold tracking-[0.1em] text-action">{part.key}</span>
          <h3 className="text-lg tracking-[-0.025em]">{part.title}</h3>
        </div>
        {/* Authored with blank lines between paragraphs rather than as an
            array — it reads as prose in the data file, which is what it is. */}
        {part.body.split('\n\n').map((para) => (
          <p key={para.slice(0, 40)} className="mt-5 max-w-prose leading-[1.72] text-ink-2">
            {para}
          </p>
        ))}
      </Reveal>

      {part.axes && (
        <Reveal>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-3">
            {part.axes.map(([label, value, note]) => (
              <div key={label} className="bg-surface p-5">
                <p className="eyebrow text-ink-3">{label}</p>
                <p className="mt-2 font-data text-lg tracking-[0.02em] text-action">{value}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{note}</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {part.figures?.map((f) => (
        <EduFigure key={f} name={f} />
      ))}
    </div>
  );
}

/**
 * One image slot: the picture if it exists, the brief if it does not.
 *
 * Both sit in the same grid cell at the same size, so filling a slot later
 * changes nothing else on the page.
 */
function Shot({ shot, label }) {
  if (shot.src) {
    return (
      <figure className="flex flex-col">
        {/* `natural` is for a source too small to enlarge — shown at its own
            size, capped at twice its pixels so it stays sharp on a 2× display
            and is only ever downscaled on a 1×. Everything else fills the
            standard slot. */}
        <img
          src={shot.src}
          alt={shot.caption}
          loading="lazy"
          className={cn(
            'rounded-lg border border-hairline bg-nn-950',
            shot.natural
              ? 'block h-auto w-full max-w-[402px]'
              : 'aspect-[5/4] w-full object-cover',
          )}
        />
        <figcaption className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-2">
          <span className="font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
            {label}
          </span>{' '}
          {shot.caption}
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="flex min-h-[10.5rem] flex-col gap-2 rounded-lg border border-dashed border-hairline bg-surface-2 p-4">
      <p className="font-data text-[0.625rem] uppercase tracking-[0.12em] text-action">
        {label} <span className="text-ink-3">· {shot.source}</span>
      </p>
      <h4 className="text-[0.9375rem] tracking-[-0.012em]">{shot.title}</h4>
      <p className="text-[0.8125rem] leading-relaxed text-ink-2">{shot.brief}</p>
    </div>
  );
}

/**
 * Which topic the reader is in, and how far through the set they are.
 *
 * Read on a rAF off the scroll event rather than with an IntersectionObserver:
 * the rail needs a continuous fill, not a set of enter/leave events, and these
 * sections are tall enough that an observer threshold would sit still for
 * whole screens at a time.
 */
function useScrollSpy(items) {
  const [state, setState] = useState({ active: items[0].id, progress: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const read = () => {
      raf.current = 0;
      const line = window.scrollY + window.innerHeight * 0.32;
      const els = items.map((t) => document.getElementById(t.id)).filter(Boolean);
      if (els.length !== items.length) return;

      let idx = 0;
      els.forEach((el, i) => { if (el.offsetTop <= line) idx = i; });

      const first = els[0].offsetTop;
      const last = els[els.length - 1];
      const span = last.offsetTop + last.offsetHeight * 0.4 - first;
      const p = span > 0 ? Math.max(0, Math.min(1, (line - first) / span)) : 0;

      setState((s) => (s.active === items[idx].id && Math.abs(s.progress - p * 100) < 0.4
        ? s
        : { active: items[idx].id, progress: p * 100 }));
    };
    const onScroll = () => { if (!raf.current) raf.current = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, [items]);

  return state;
}
