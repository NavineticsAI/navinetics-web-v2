import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn.js';
import { D, EASE_OUT, usePrefersReducedMotion } from '../lib/motion.js';
import { Eyebrow } from './Section.jsx';
import { IsoMark } from './Reticle.jsx';

/**
 * Page hero.
 *
 * The one orchestrated moment on the site: eyebrow, headline, lead and actions
 * stagger in, then the targeting reticle settles. Everything else is a single
 * reveal — the sequence is what makes this read as an opening.
 */
export function Hero({
  eyebrow,
  title,
  lead,
  children,
  tone = 'light',
  targeting = false,
  isoMark = true,
  className,
  size = 'md',
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0, z: 41 });
  const dark = tone === 'dark';

  // Live targeting readout — literally what the product does.
  useEffect(() => {
    const el = ref.current;
    if (!el || !targeting || reduced) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--px', `${(px * 100).toFixed(2)}%`);
      el.style.setProperty('--py', `${(py * 100).toFixed(2)}%`);
      setCoords({ x: (px - 0.5) * 80, y: (0.5 - py) * 60, z: 41 + px * py * 8 });
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    return () => el.removeEventListener('pointermove', onMove);
  }, [targeting, reduced]);

  const step = (i) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: D.d3, delay: reduced ? 0 : i * 0.09, ease: EASE_OUT },
  });

  const pad = size === 'lg' ? 'min-h-[min(84vh,760px)]' : 'min-h-[52vh]';

  return (
    <header
      ref={ref}
      className={cn(
        'relative flex flex-col justify-center overflow-hidden px-6 pb-20 pt-36 lg:px-8',
        pad,
        dark ? 'bg-nn-950 text-nn-50' : 'bg-canvas',
        className,
      )}
    >
      {/* ambient field */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full bg-action-glow blur-[90px]" />
        <div className="absolute -bottom-40 right-[8%] h-80 w-80 rounded-full bg-action-glow blur-[100px]" />
        {isoMark && (
          <IsoMark
            className={cn(
              'absolute -right-16 bottom-[-15%] w-72 md:w-96',
              dark ? 'text-nn-300 opacity-20' : 'opacity-[0.16]',
            )}
          />
        )}
      </div>

      {/* targeting crosshair */}
      {targeting && !reduced && (
        <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
          <i
            className="absolute left-0 right-0 h-px bg-[var(--retic)]"
            style={{ top: 'var(--py,50%)' }}
          />
          <i
            className="absolute bottom-0 top-0 w-px bg-[var(--retic)]"
            style={{ left: 'var(--px,50%)' }}
          />
          <span
            className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--retic)]"
            style={{ left: 'var(--px,50%)', top: 'var(--py,50%)' }}
          />
        </div>
      )}

      <div className="relative z-[2] mx-auto w-full max-w-5xl">
        {eyebrow && (
          <motion.div {...step(0)}>
            <Eyebrow className={dark ? '!text-sg-300' : undefined}>{eyebrow}</Eyebrow>
          </motion.div>
        )}
        <motion.h1
          {...step(1)}
          className={cn(
            'mt-5 whitespace-pre-line',
            size === 'lg' ? 'text-hero !tracking-[-0.045em]' : 'text-d1',
          )}
        >
          {title}
        </motion.h1>
        {lead && (
          <motion.p
            {...step(2)}
            className={cn(
              'mt-6 max-w-prose text-lead leading-[1.55] tracking-[-0.015em]',
              dark ? 'text-nn-200' : 'text-ink-2',
            )}
          >
            {lead}
          </motion.p>
        )}
        {children && (
          <motion.div {...step(3)} className="mt-9">
            {children}
          </motion.div>
        )}
      </div>

      {targeting && !reduced && (
        <div
          className="absolute bottom-7 right-6 z-[2] hidden gap-4 font-data text-[0.6875rem] tabular-nums text-ink-3 md:flex lg:right-8"
          aria-hidden="true"
        >
          <span>
            X <b className="font-medium text-ink-2">{fmt(coords.x)}</b>
          </span>
          <span>
            Y <b className="font-medium text-ink-2">{fmt(coords.y)}</b>
          </span>
          <span>
            Z <b className="font-medium text-ink-2">{coords.z.toFixed(1)}</b>
          </span>
          <span className="text-action">◎ ISO-CENTER</span>
        </div>
      )}
    </header>
  );
}

function fmt(v) {
  const s = Math.abs(v).toFixed(1).padStart(5, '0');
  return `${v < 0 ? '−' : '+'}${s}`;
}
