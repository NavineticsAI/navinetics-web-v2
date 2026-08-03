import { useEffect, useRef } from 'react';
import { hero, turntable, FRAME } from '../data/d1.js';
import { usePrefersReducedMotion } from '../lib/motion.js';

/**
 * The D1 opening: the instrument turns as you scroll, and settles.
 *
 * The host is taller than the viewport and the layer inside it is sticky, so
 * the turn is paid for with ordinary scrolling and nothing is captured. The
 * travel is one screen — one flick of the wheel settles it.
 *
 * TWO RESOLUTIONS. The 32 turntable frames are traced small, because they only
 * ever exist in motion. The pose the reader stops on is hero.webp at more than
 * twice the resolution, swapped in at the end of the travel; the last frame is
 * the same camera, so the swap is a change of sharpness rather than a jump.
 * Rotation and quality got traded against each other for two revisions and
 * they never had to be.
 *
 * WHAT IS BEING DRAWN. Not a model — pictures of one. tools/d1-frame.mjs
 * tessellates the assembly CAD to 1.7M triangles and ray traces it: real
 * occlusion from a cosine-weighted hemisphere per pixel, GGX reflections, and
 * a measured anodised blue. That is quality no browser would pay for per
 * frame, it costs no GPU work here, needs no WebGL, and puts no geometry on
 * the wire.
 *
 * LOADING. hero.webp is fetched first and alone, so the opening paints against
 * one image; the turntable follows once it lands. Any frame not yet decoded
 * falls back to the nearest one that is, so an early scroll degrades to a
 * coarser spin rather than to nothing.
 *
 * NOTHING IS LABELLED, deliberately — see the notice in data/d1.js.
 */
export function D1Hero() {
  const reduced = usePrefersReducedMotion();
  const hostRef = useRef(null);
  const stickyRef = useRef(null);
  const cvRef = useRef(null);
  const cueRef = useRef(null);
  const imgs = useRef([]);
  const heroImg = useRef(null);

  /* ── fetch: the settled render first and alone, then the spin ───────────── */
  useEffect(() => {
    const load = (src) => {
      const im = new Image();
      im.decoding = 'async';
      im.src = src;
      return im;
    };
    const first = load(hero);
    heroImg.current = first;
    const rest = () => { turntable.forEach((src, i) => { imgs.current[i] = load(src); }); };
    if (first.complete) rest();
    else first.addEventListener('load', rest, { once: true });
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const cv = cvRef.current;
    if (!host || !cv) return undefined;
    const ctx = cv.getContext('2d');
    let w = 0;
    let h = 0;
    let raf = 0;
    let hostTop = 0;
    let travel = 1;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = (stickyRef.current || cv).getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      hostTop = host.getBoundingClientRect().top + window.scrollY;
      travel = Math.max(1, host.offsetHeight - (stickyRef.current?.offsetHeight || h));
    };

    const ready = (im) => im?.complete && im.naturalWidth > 0;
    /* A frame that has not decoded yet is not a blank hero: walk outwards for
       the nearest one that has. */
    const pick = (i) => {
      for (let d = 0; d < turntable.length; d++) {
        if (ready(imgs.current[i - d])) return imgs.current[i - d];
        if (ready(imgs.current[i + d])) return imgs.current[i + d];
      }
      return ready(heroImg.current) ? heroImg.current : null;
    };

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

    const paint = (p) => {
      const s = reduced ? 1 : ease(clamp01(p));
      /* Past 0.97 the spin is over: show the full-resolution render. */
      const im = s > 0.97 && ready(heroImg.current)
        ? heroImg.current
        : pick(Math.min(turntable.length - 1, Math.round(s * (turntable.length - 1))));
      ctx.clearRect(0, 0, w, h);
      if (!im) return s;

      /* Sized by HEIGHT: the render is tall and narrow, and fitting it to the
         width puts the wheels through the bottom of a laptop viewport. */
      const narrow = w < 1024;
      let dh = h * (narrow ? 0.44 : 0.62 + 0.08 * s);
      const maxW = w * (narrow ? 0.74 : 0.46);
      const ar = FRAME.w / FRAME.h;
      if (ar * dh > maxW) dh = maxW / ar;
      const dw = ar * dh;
      const dx = w * (narrow ? 0.5 : 0.5 + 0.13 * s) - dw / 2;
      const dy = h * (narrow ? 0.3 : 0.46) - dh / 2;

      ctx.globalAlpha = 0.3 + 0.7 * clamp01(s * 2.4);
      ctx.drawImage(im, dx, dy, dw, dh);
      ctx.globalAlpha = 1;

      if (cueRef.current) cueRef.current.style.opacity = String(1 - clamp01(s / 0.22));
      return s;
    };

    const frame = () => {
      paint((window.scrollY - hostTop) / travel);
      raf = requestAnimationFrame(frame);
    };

    size();
    if (reduced) paint(1);
    else raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => { size(); if (reduced) paint(1); });
    ro.observe(host);
    window.addEventListener('resize', size);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', size);
    };
  }, [reduced]);

  return (
    <header
      ref={hostRef}
      className="relative bg-[var(--mv-bay)] text-nn-50"
      /* One screen of travel: the brief was one scroll, not three. */
      style={reduced ? undefined : { height: 'calc(100svh + 90vh)' }}
    >
      <div
        ref={stickyRef}
        className={
          reduced
            ? 'relative flex flex-col-reverse gap-12 overflow-hidden px-6 pb-20 pt-28 lg:px-8'
            : 'sticky top-0 h-[100svh] overflow-hidden'
        }
      >
        <canvas
          ref={cvRef}
          className={reduced ? 'h-[56svh] w-full' : 'absolute inset-0 h-full w-full'}
          role="img"
          aria-label="The D1 stereotactic frame: an anodised blue arc-centred head frame with two
            curved rails, a targeting stage, and a bare-steel mechanical microdrive rising from its
            centre. It turns to a three-quarter view as the page scrolls."
        />

        {/* Hairlines through letterforms are unreadable, so the copy carries
            its own scrim rather than dimming the whole stage. */}
        {!reduced && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0"
            aria-hidden="true"
            style={{
              height: '62%',
              background:
                'linear-gradient(to top, var(--mv-bay) 0%, rgb(3 16 26/.86) 34%, rgb(3 16 26/0) 100%)',
            }}
          />
        )}

        <div
          className={
            reduced
              ? 'flex flex-col gap-4'
              : 'absolute inset-x-0 bottom-0 flex flex-col gap-4 px-6 pb-20 lg:max-w-[50%] lg:px-10 lg:pb-20'
          }
        >
          <span className="eyebrow text-sg-300">Products — D1 Stereotactic Frame</span>
          <h1 className="whitespace-pre-line text-d1">
            {'Robust. Low complexity.\nRadically comfortable.'}
          </h1>
          <p className="max-w-prose text-lead leading-[1.55] text-nn-200">
            Arc-centred targeting with a skull anchor key in place of a base ring. Three linear
            degrees of freedom, two angles of rotation.
          </p>
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
