import { useEffect, useRef } from 'react';
import { hero, FRAME } from '../data/d1.js';
import { usePrefersReducedMotion } from '../lib/motion.js';

/**
 * The D1 opening: one render, brought into focus.
 *
 * The host is taller than the viewport and the layer inside it is sticky, so
 * the arrival is paid for with ordinary scrolling and nothing is captured. The
 * travel is one screen — one flick of the wheel and it has settled.
 *
 * NO ROTATION. This went through a 36-frame rasterised turntable and then a
 * 32-frame traced one, and both divided the quality budget across frames that
 * only ever exist in motion. The instrument now arrives by translating and
 * scaling into place instead, which costs one image and puts the whole budget
 * into it: 1027 × 1565, ray traced, and pixel-exact because it is an <img>
 * rather than something redrawn into a canvas every frame.
 *
 * The scroll writes nothing but `transform` and `opacity`, so the whole
 * sequence stays on the compositor and never triggers layout.
 *
 * WHAT IS BEING DRAWN. Not a model — a picture of one. tools/d1-frame.mjs
 * tessellates the assembly CAD to 1.7M triangles and ray traces it: real
 * occlusion from a cosine-weighted hemisphere per pixel, GGX reflections, and
 * an anodised blue measured off NaviNetics' own photographs. No geometry goes
 * over the wire and no WebGL is needed.
 *
 * NOTHING IS LABELLED, deliberately — see the notice in data/d1.js.
 */
export function D1Hero() {
  const reduced = usePrefersReducedMotion();
  const hostRef = useRef(null);
  const stickyRef = useRef(null);
  const artRef = useRef(null);
  const copyRef = useRef(null);
  const cueRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const art = artRef.current;
    if (!host || !art || reduced) return undefined;

    let raf = 0;
    let ticking = false;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

    const apply = () => {
      ticking = false;
      const sticky = stickyRef.current;
      const travel = Math.max(1, host.offsetHeight - (sticky?.offsetHeight || 0));
      const top = host.getBoundingClientRect().top + window.scrollY;
      const s = ease(Math.max(0, Math.min(1, (window.scrollY - top) / travel)));

      /* Comes from below and behind: down the page, smaller, and dim. Nothing
         here rotates — the render is a fixed camera. */
      const scale = 0.70 + 0.30 * s;
      const y = 14 * (1 - s);
      art.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0) scale(${scale.toFixed(4)})`;
      art.style.opacity = (0.22 + 0.78 * Math.min(1, s * 1.6)).toFixed(3);

      if (copyRef.current) {
        copyRef.current.style.opacity = (0.35 + 0.65 * Math.min(1, s * 2.1)).toFixed(3);
        copyRef.current.style.transform = `translate3d(0, ${(22 * (1 - s)).toFixed(1)}px, 0)`;
      }
      if (cueRef.current) cueRef.current.style.opacity = (1 - Math.min(1, s / 0.22)).toFixed(3);
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
    <header
      ref={hostRef}
      className="relative bg-[var(--mv-bay)] text-nn-50"
      /* One screen of travel: the brief was one scroll, not three. */
      style={reduced ? undefined : { height: 'calc(100svh + 85vh)' }}
    >
      <div
        ref={stickyRef}
        className={reduced ? 'relative' : 'sticky top-0 h-[100svh] overflow-hidden'}
      >
        <div
          className="mx-auto flex h-full max-w-[110rem] flex-col justify-end gap-8 px-6 pb-16
            pt-28 lg:grid lg:grid-cols-[minmax(0,48%)_minmax(0,1fr)] lg:items-center lg:gap-8
            lg:px-10 lg:pb-20 lg:pt-24"
        >
          {/* ── the instrument ───────────────────────────────────────────── */}
          {/* Source order first so it is fetched first; on a wide screen it
              belongs on the right, which is what `order` does. */}
          <div className="order-first min-h-0 flex-1 lg:order-last lg:flex-none lg:justify-self-center">
            <img
              ref={artRef}
              src={hero}
              width={FRAME.w}
              height={FRAME.h}
              /* This image IS the largest contentful paint. It must not be
                 lazy and nothing about it should be deferred. */
              fetchPriority="high"
              decoding="async"
              alt="The D1 stereotactic frame: an anodised blue arc-centred head frame with two
                curved rails, a targeting stage, and a bare-steel mechanical microdrive rising
                from its centre."
              /* Sized by HEIGHT once there is a column to stand in. The render
                 is tall and narrow, so capping its width instead puts the
                 wheels through the bottom of a laptop viewport. */
              className="mx-auto block h-full w-auto max-w-full object-contain
                will-change-transform lg:h-[68svh] lg:max-w-none xl:h-[74svh]"
              style={reduced ? undefined : { opacity: 0.22, transform: 'translate3d(0,14%,0) scale(0.7)' }}
            />
          </div>

          {/* ── the words ────────────────────────────────────────────────── */}
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

        {!reduced && (
          <span
            ref={cueRef}
            className="pointer-events-none absolute inset-x-0 bottom-5 text-center font-data
              text-[0.625rem] uppercase tracking-[0.14em] text-ink-3"
          >
            Scroll — the frame settles
          </span>
        )}
      </div>
    </header>
  );
}
