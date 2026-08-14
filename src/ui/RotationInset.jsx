import { useEffect, useRef } from 'react';
import { cn } from '../lib/cn.js';
import { usePrefersReducedMotion } from '../lib/motion.js';
import { useTheme } from '../lib/theme.jsx';
import { makeRotation } from '../lib/d1Scenes.js';

/**
 * The rotation inset on the home page's NRSS plate.
 *
 * Replaces the lens panel that read "DEGREES OF FREEDOM · 3 + 2 · linear +
 * rotational". That panel stated a number; this draws what the number means —
 * the collar turns, the arc turns inside it, and the probe arrives from a
 * different direction each pass while the target does not move. See
 * `makeRotation` in lib/d1Scenes.js for the geometry.
 *
 * Same lifecycle as SceneBand, for the same reasons: device ratio capped at
 * 1.5 because this is hairlines rather than photography, one rAF loop that
 * only runs while the canvas is on screen, and 30fps — nothing here moves fast
 * enough to need more, and the home page has three product plates to scroll.
 *
 * Under reduced motion it draws one composed frame rather than disappearing.
 * The frame is picked at t=4.1, part-way through a collar turn, so the arc is
 * off-axis and the drawing still reads as a mechanism rather than a symbol.
 */
export function RotationInset({ className }) {
  const reduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');

    /* The plate behind this is dark in BOTH themes — see `heroTone: 'bay'` on
       the NRSS record — so the scene always takes its dark-ground palette,
       regardless of the page theme. Passing `light` here would make the ink
       navy on near-black every time someone chose the light theme. */
    const draw = makeRotation(false);

    let w = 0;
    let h = 0;
    let visible = false;
    let raf = 0;
    let start = null;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const MIN_MS = 1000 / 30;
    let painted = 0;
    const frame = (now) => {
      if (start === null) start = now;
      if (visible && w > 4 && now - painted >= MIN_MS) {
        painted = now;
        draw(ctx, w, h, (now - start) / 1000);
      }
      raf = requestAnimationFrame(frame);
    };

    size();
    if (reduced) draw(ctx, w, h, 4.1);
    else raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);

    const onResize = () => {
      size();
      if (reduced) draw(ctx, w, h, 4.1);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [reduced, theme]);

  return (
    <div
      className={cn(
        /* Wide enough for the caption to sit on one line — at 8.5rem it broke
           across two and the block stopped reading as a single unit. */
        `pointer-events-none absolute bottom-5 left-5 w-[11.5rem] rounded-md border
         border-sg-300/25 bg-nn-950/55 p-2.5 backdrop-blur-sm sm:w-[13rem]`,
        className,
      )}
    >
      <canvas ref={ref} className="block h-[6.5rem] w-full sm:h-[7.5rem]" aria-hidden="true" />
      <span
        className="mt-1.5 block text-center font-data text-[0.5625rem] uppercase
          tracking-[0.1em] text-sg-300/85"
      >
        Every angle, one point
      </span>
    </div>
  );
}
