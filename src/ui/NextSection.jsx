import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { D, EASE_OUT, revealProps, usePrefersReducedMotion } from '../lib/motion.js';
import { Eyebrow } from './Section.jsx';
import { makeNext } from '../lib/nextScene.js';

/**
 * The page's last word: a quiet counterpart to the hero.
 *
 * Same construction as the hero in its settled state — dark ground, a scene
 * on the right, copy held left over a scrim — but shorter, not sticky, and
 * far dimmer. It closes the page the way the hero opened it, so the two book
 * -end rather than compete.
 *
 * The scene is capped at 30fps and only runs while the section is on screen;
 * it is the sixth canvas on this page and the least important of them.
 */
export function NextSection({ eyebrow, title, lead }) {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;

    const ctx = cv.getContext('2d');
    const draw = makeNext();
    let w = 0;
    let h = 0;
    let raf = 0;
    let start = null;
    let visible = false;
    let painted = 0;
    const MIN_MS = 1000 / 30;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now) => {
      if (start === null) start = now;
      if (visible && w > 4 && now - painted >= MIN_MS) {
        painted = now;
        draw(ctx, w, h, (now - start) / 1000);
      }
      raf = requestAnimationFrame(frame);
    };

    size();
    if (reduced) {
      // One composed frame, taken where the surface has assembled.
      draw(ctx, w, h, 16);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);

    const onResize = () => {
      size();
      if (reduced) draw(ctx, w, h, 16);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [reduced]);

  const step = (i) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    /* Borrowed, not restated. This block needs its own transition for the
       per-step delay, but the trigger point is not its business — hand-writing
       -80px here is how this one stayed late-firing after the shared bundle was
       fixed. */
    viewport: revealProps.viewport,
    transition: { duration: D.d3, delay: reduced ? 0 : i * 0.08, ease: EASE_OUT },
  });

  return (
    <section className="relative flex min-h-[min(60vh,560px)] items-center overflow-hidden bg-nn-950 px-6 py-16 text-nn-50 md:py-20 lg:px-8 lg:py-24">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(96deg,rgb(4 20 29/.93) 0%,rgb(4 20 29/.8) 36%,'
            + 'rgb(4 20 29/.28) 64%,rgb(4 20 29/.42) 100%)',
        }}
      />

      <div className="relative nn-frame mx-auto w-full">
        <div className="max-w-[min(38rem,100%)]">
          <motion.div {...step(0)}>
            <Eyebrow className="!text-nn-300">{eyebrow}</Eyebrow>
          </motion.div>
          <motion.h2
            {...step(1)}
            className="mt-5 whitespace-pre-line text-[clamp(1.6rem,3.4vw,2.9rem)] !tracking-[-0.04em]"
          >
            {title}
          </motion.h2>
          {lead && (
            <motion.p
              {...step(2)}
              className="mt-6 text-lead leading-[1.6] tracking-[-0.015em] text-nn-200"
            >
              {lead}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
