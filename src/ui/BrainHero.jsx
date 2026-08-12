import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn.js';
import { D, EASE_OUT, usePrefersReducedMotion } from '../lib/motion.js';
import { Eyebrow } from './Section.jsx';
import { makeBrainHero } from '../lib/brainHeroScene.js';

/**
 * The page opening.
 *
 * The scene starts as the full background and, over the first half-screen of
 * scroll, shrinks and settles to one side before the header releases and the
 * page carries on. The header is taller than the viewport to give that move
 * somewhere to happen; the layer inside it is sticky, so nothing is captured —
 * scrolling is ordinary scrolling, it just has something to look at.
 *
 * The view itself never rotates. The pointer swings a trajectory instead, and
 * every trajectory lands on the same focus.
 */
export function BrainHero({ eyebrow, title, lead, facts = [] }) {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef(null);
  const hostRef = useRef(null);
  const cueRef = useRef(null);
  // The pointer is read in the frame loop, never in React state — it changes
  // at pointer rate and drives a canvas, so a re-render would buy nothing.
  const pointer = useRef(null);
  const eased = useRef({ x: 0.55, y: -0.2 });

  useEffect(() => {
    const cv = canvasRef.current;
    const host = hostRef.current;
    if (!cv || !host) return undefined;

    const ctx = cv.getContext('2d');
    const draw = makeBrainHero();
    let w = 0;
    let h = 0;
    let raf = 0;
    let start = null;
    let last = null;
    let visible = true;
    let travel = 1;
    let hostTop = 0;

    const size = () => {
      // A full-viewport canvas repainted every frame is the most expensive
      // thing on this page; capping the ratio costs almost nothing visually
      // at these dot sizes and saves a lot of fill on dense displays.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      hostTop = host.offsetTop;
      travel = Math.max(1, host.offsetHeight - window.innerHeight);
    };

    // scrollY is free to read and never forces layout, so progress is taken
    // in the frame loop rather than from a scroll listener
    const progress = () => {
      const v = (window.scrollY - hostTop) / travel;
      return v < 0 ? 0 : v > 1 ? 1 : v;
    };

    const frame = (now) => {
      if (start === null) start = now;
      const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) {
        // ease toward the pointer, so a fast flick swings rather than snaps
        if (pointer.current) {
          const g = Math.min(1, dt * 3.2);
          eased.current.x += (pointer.current.x - eased.current.x) * g;
          eased.current.y += (pointer.current.y - eased.current.y) * g;
        }
        const p = progress();
        draw(ctx, w, h, (now - start) / 1000, pointer.current ? eased.current : null, p);
        if (cueRef.current) cueRef.current.style.opacity = String(Math.max(0, 1 - p * 3));
      }
      raf = requestAnimationFrame(frame);
    };

    size();
    if (reduced) {
      // A single composed frame, part-settled, where the surface is closing.
      draw(ctx, w, h, 4.2, { x: 0.55, y: -0.2 }, 0.55);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onMove = (e) => {
      // The canvas fills a `sticky top-0` layer, so during the whole move its
      // viewport top is 0 — client coordinates convert without a layout read.
      pointer.current = {
        x: (e.clientX / w - 0.5) * 2,
        y: (e.clientY / h - 0.5) * 2,
      };
    };
    const onLeave = () => { pointer.current = null; };
    if (!reduced) {
      host.addEventListener('pointermove', onMove, { passive: true });
      host.addEventListener('pointerleave', onLeave, { passive: true });
    }

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(host);

    const onResize = () => {
      size();
      if (reduced) draw(ctx, w, h, 4.2, { x: 0.55, y: -0.2 }, 0.55);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  const step = (i) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: D.d3, delay: reduced ? 0 : i * 0.09, ease: EASE_OUT },
  });

  return (
    <header
      ref={hostRef}
      className="relative bg-nn-950 text-nn-50"
      // Extra height below the fold is the room the scene shrinks into. Under
      // reduced motion there is no move to make, so it is a plain screen.
      style={{ height: reduced ? '100svh' : 'calc(100svh + 58vh)' }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden px-6 pb-20 pt-32 lg:px-8">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

        {/* Keeps the copy readable over whatever the scene is doing. */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(96deg,rgb(4 20 29/.92) 0%,rgb(4 20 29/.74) 34%,'
              + 'rgb(4 20 29/.1) 62%,rgb(4 20 29/.3) 100%)',
          }}
        />

        <div className="relative nn-frame mx-auto w-full">
          {/* Wide enough, and sized small enough, that each authored line of
              the headline stays on one line. The break points are in the
              string; if the type outgrows the column the browser adds its own
              and the section runs past the fold — which is exactly what
              happened at `text-hero` in a 46ch column. The current headline is
              28 characters a line, so the cap is set from that. */}
          <div className="max-w-[min(60rem,100%)]">
            <motion.div {...step(0)}>
              <Eyebrow className="!text-nn-300">{eyebrow}</Eyebrow>
            </motion.div>
            <motion.h1
              {...step(1)}
              className="mt-5 whitespace-pre-line text-[clamp(1.65rem,5vw,4.3rem)] !tracking-[-0.045em]"
            >
              {title}
            </motion.h1>
            {lead && (
              <motion.p
                {...step(2)}
                className="mt-6 max-w-prose text-lead leading-[1.55] tracking-[-0.015em] text-nn-200"
              >
                {lead}
              </motion.p>
            )}
            {facts.length > 0 && (
              <motion.div
                {...step(3)}
                className="mt-9 flex flex-wrap gap-x-7 gap-y-2 font-data text-[0.6875rem] uppercase tracking-[0.09em] text-ink-3"
              >
                {facts.map((f) => (
                  <span key={f.label}>
                    {f.label} <b className="font-semibold text-nn-200">{f.value}</b>
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {!reduced && (
          <div
            ref={cueRef}
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2',
              'font-data text-[0.625rem] uppercase tracking-[0.18em] text-ink-3',
            )}
          >
            Scroll
            <span className="nn-drop block h-7 w-px bg-gradient-to-b from-transparent to-ink-3" />
          </div>
        )}
      </div>
    </header>
  );
}
