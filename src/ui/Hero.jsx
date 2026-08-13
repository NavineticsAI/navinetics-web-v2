import { useEffect, useRef } from 'react';
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
  const dark = tone === 'dark';

  /* Drives the crosshair only. It used to also feed a coordinate readout,
     which has been removed — see the note at the foot of this component. */
  useEffect(() => {
    const el = ref.current;
    if (!el || !targeting || reduced) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--px', `${(px * 100).toFixed(2)}%`);
      el.style.setProperty('--py', `${(py * 100).toFixed(2)}%`);
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
        /* pt-36 is nav clearance, not rhythm — the navbar is fixed and the
           heading has to clear it. pb matches Section's own padding so the
           gap from hero to first section is the same 192px as every other
           section-to-section gap. */
        'relative flex flex-col justify-center overflow-hidden px-6 pb-16 pt-36 md:pb-20 lg:px-8 lg:pb-24',
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

      {/* nn-frame is the site's single measure — this was max-w-5xl, which put
          every page's hero 128px right of the sections beneath it. */}
      <div className="nn-frame relative z-[2] mx-auto w-full">
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

      {/* The X / Y / Z / ◎ ISO-CENTER readout that used to sit here is gone,
          at NaviNetics' request. The crosshair it belonged to stays: the
          reticle is brand, but live coordinates on a marketing hero read as
          instrument output and invite a precision reading of numbers that were
          generated from the pointer position. */}
    </header>
  );
}
