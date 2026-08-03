import { useEffect, useRef } from 'react';
import { hero, FRAME } from '../data/d1.js';
import { usePrefersReducedMotion } from '../lib/motion.js';

/**
 * The D1 opening: one image of the instrument.
 *
 * It used to be a 36-frame turntable the scroll scrubbed through. That bought
 * rotation at the cost of the thing that actually mattered — no single frame
 * could carry enough render quality once it had to be paid for 36 times, and
 * 36 mediocre frames read worse than one good picture. So the turntable is
 * gone, and what is left is a single ray-traced render at full resolution:
 * real occlusion, real reflections, and the measured anodised blue. See
 * tools/d1/trace.mjs for how it is made.
 *
 * WHAT THE SCROLL DOES NOW. The image drifts and grows very slightly as the
 * hero leaves — parallax, not animation. There is nothing to settle into any
 * more, so the hero is correct from the first paint and legible before anyone
 * touches the wheel. It is also one ~300 kB image rather than 1.8 MB of
 * frames, with no decode work at all while scrolling.
 *
 * NOTHING IS LABELLED. The renderer can still light any one group on its own —
 * see the `groups` mode in tools/d1/render.mjs — but the page names no part of
 * the instrument, because every mapping from the CAD's internal drawing
 * numbers to a component name would be an inference rather than something
 * NaviNetics has stated.
 */
export function D1Hero() {
  const reduced = usePrefersReducedMotion();
  const hostRef = useRef(null);
  const artRef = useRef(null);
  const copyRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const art = artRef.current;
    if (!host || !art || reduced) return undefined;

    let raf = 0;
    let ticking = false;

    /* Transform only — no layout property is touched, so this stays on the
       compositor and scrolling never blocks on it. */
    const apply = () => {
      ticking = false;
      const r = host.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
      art.style.transform = `translate3d(0, ${(-42 * p).toFixed(1)}px, 0) scale(${(1 + 0.05 * p).toFixed(4)})`;
      if (copyRef.current) copyRef.current.style.transform = `translate3d(0, ${(30 * p).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  return (
    <header ref={hostRef} className="relative overflow-hidden bg-[var(--mv-bay)] text-nn-50">
      <div
        className="relative mx-auto flex min-h-[100svh] max-w-[110rem] flex-col justify-end gap-10
          px-6 pb-16 pt-28 lg:grid lg:grid-cols-[minmax(0,46%)_minmax(0,1fr)] lg:items-center
          lg:gap-8 lg:px-10 lg:pb-20 lg:pt-24"
      >
        {/* ── the instrument ─────────────────────────────────────────────── */}
        {/* Source order puts it first so it is the first thing fetched; on a
            wide screen it belongs on the right, which is what `order` does. */}
        <div className="order-first lg:order-last lg:justify-self-center">
          <img
            ref={artRef}
            src={hero}
            width={FRAME.w}
            height={FRAME.h}
            /* This image IS the largest contentful paint. Nothing about it
               should be deferred, and it must not be lazy. */
            fetchPriority="high"
            decoding="async"
            alt="The D1 stereotactic frame: an anodised blue arc-centred head frame with two
              curved rails, a targeting stage, and a bare-steel mechanical microdrive rising from
              its centre."
            /* Sized by HEIGHT once there is a column to stand in. The render is
               tall and narrow (1027 × 1565), so capping its width instead puts
               the wheels through the bottom of the viewport on any laptop. */
            className="mx-auto block h-auto w-full max-w-[14rem] will-change-transform
              sm:max-w-[17rem] lg:h-[66svh] lg:w-auto lg:max-w-none xl:h-[72svh]"
          />
        </div>

        {/* ── the words ──────────────────────────────────────────────────── */}
        <div ref={copyRef} className="flex flex-col gap-4 will-change-transform">
          <span className="eyebrow text-sg-300">Products — D1 Stereotactic Frame</span>
          <h1 className="whitespace-pre-line text-d1">
            {'Robust. Low complexity.\nRadically comfortable.'}
          </h1>
          <p className="max-w-prose text-lead leading-[1.55] text-nn-200">
            Arc-centred targeting with a skull anchor key in place of a base ring. Three linear
            degrees of freedom, two angles of rotation.
          </p>
        </div>
      </div>
    </header>
  );
}
