import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePrefersReducedMotion } from '../lib/motion.js';

/**
 * The company's lineage.
 *
 * A rail down the left whose fill tracks how far through the entries you have
 * read, and a year column that doubles as navigation. Entries with no recorded
 * year show a dash rather than a guess — see the claims notice in
 * src/data/company.js for why one of them has none.
 */
export function Timeline({ entries }) {
  const reduced = usePrefersReducedMotion();
  const wrap = useRef(null);
  const marks = useRef([]);
  const [seen, setSeen] = useState(() => new Set());
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        setSeen((prev) => {
          let next = prev;
          for (const e of es) {
            if (!e.isIntersecting) continue;
            const i = Number(e.target.dataset.i);
            if (next.has(i)) continue;
            if (next === prev) next = new Set(prev);
            next.add(i);
          }
          return next;
        });
      },
      /* Shallow on purpose. At -35% an entry stayed invisible until it was well
         up the viewport, so the middle of the list read as blank page. */
      { rootMargin: '0px 0px -12% 0px' },
    );
    marks.current.filter(Boolean).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [entries]);

  /* The rail fills to the last entry that has scrolled past the reading line,
     which is what makes it read as progress rather than decoration. */
  useEffect(() => {
    if (reduced) { setFill(1); return undefined; }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const box = wrap.current?.getBoundingClientRect();
        if (!box) return;
        const line = window.innerHeight * 0.62;
        setFill(Math.max(0, Math.min(1, (line - box.top) / box.height)));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  return (
    <div ref={wrap} className="relative mt-12">
      {/* the rail */}
      <div
        className="absolute bottom-0 left-[4.25rem] top-2 w-px bg-hairline sm:left-[5.5rem]"
        aria-hidden="true"
      >
        <div
          className="w-px bg-action transition-[height] duration-300 ease-out"
          style={{ height: `${fill * 100}%` }}
        />
      </div>

      <ol className="flex flex-col gap-12 sm:gap-14">
        {entries.map((e, i) => {
          const on = seen.has(i);
          return (
            <li
              key={e.title}
              ref={(el) => { marks.current[i] = el; }}
              data-i={i}
              className="relative grid grid-cols-[4.25rem_1fr] gap-x-6 sm:grid-cols-[5.5rem_1fr] sm:gap-x-9"
            >
              {/* pr-3.5 keeps the year clear of the node, which is centered on
                  this column's right edge — without it the dot sits on the
                  last digit. */}
              <div className="pr-3.5 pt-0.5 text-right">
                <span
                  className={`font-data text-sm tabular-nums transition-colors duration-500
                    ${on ? 'text-action' : 'text-ink-3'}`}
                >
                  {e.year ?? '—'}
                </span>
              </div>

              {/* the node, centered on the rail */}
              <span
                aria-hidden="true"
                className={`absolute left-[4.25rem] top-[0.55rem] h-2.5 w-2.5 -translate-x-1/2
                  rounded-full border-2 transition-colors duration-500 sm:left-[5.5rem]
                  ${on ? 'border-action bg-action' : 'border-hairline bg-canvas'}`}
              />

              <div
                className={`transition-[opacity,transform] duration-700 ease-out
                  ${on || reduced ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
              >
                <h3 className="text-lg tracking-[-0.03em]">{e.title}</h3>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-2">{e.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
                    {e.source}
                  </span>
                  {e.to && (
                    <Link
                      to={e.to}
                      className="font-data text-[0.625rem] uppercase tracking-[0.12em] text-action
                        underline-offset-4 hover:underline"
                    >
                      See it
                    </Link>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
