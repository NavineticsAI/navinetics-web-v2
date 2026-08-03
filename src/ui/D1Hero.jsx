import { useEffect, useRef, useState } from 'react';
import { callouts, turntable, FRAME } from '../data/d1.js';
import { usePrefersReducedMotion } from '../lib/motion.js';

/**
 * The D1 opening: the frame turns, settles, and names itself.
 *
 * The host is taller than the viewport and the layer inside it is sticky, so
 * the turn is paid for with ordinary scrolling — the same arrangement as
 * MavenHero, and nothing is captured. The travel is deliberately short: about
 * one screen, so one flick of the wheel settles it rather than three.
 *
 * WHAT IS BEING DRAWN. Not a model — pictures of one. tools/d1-frame.mjs
 * tessellates the assembly CAD, lights it and renders a turntable offline, and
 * the scroll position picks a frame. That buys a render quality no browser
 * would pay for per-frame (three lights, occlusion, 2x supersampling), costs
 * no GPU work here, needs no WebGL, and puts no geometry on the wire.
 *
 * The cost is weight: the turntable is about 1.5 MB. So the settled frame is
 * fetched on its own first and everything else follows once it lands, and any
 * frame not yet decoded falls back to the nearest one that is. The opening
 * paints against a single image.
 */
export function D1Hero() {
  const reduced = usePrefersReducedMotion();
  const hostRef = useRef(null);
  const stickyRef = useRef(null);
  const cvRef = useRef(null);
  const copyRef = useRef(null);
  const cueRef = useRef(null);
  const imgs = useRef([]);
  const stills = useRef({});
  const activeRef = useRef(null);
  const mixRef = useRef(0);
  const [active, setActive] = useState(null);
  const [settled, setSettled] = useState(reduced);

  useEffect(() => { activeRef.current = active; }, [active]);

  /* ── fetch: the settled frame alone, then the rest ──────────────────────── */
  useEffect(() => {
    const last = turntable.length - 1;
    const load = (src, i) => {
      const im = new Image();
      im.decoding = 'async';
      im.src = src;
      if (i != null) imgs.current[i] = im;
      return im;
    };
    const first = load(turntable[last], last);
    const rest = () => {
      turntable.forEach((src, i) => { if (i !== last) load(src, i); });
      for (const c of callouts) stills.current[c.id] = load(c.src);
    };
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

    /* A frame that has not decoded yet is not a blank hero: walk outwards for
       the nearest one that has. */
    const pick = (i) => {
      for (let d = 0; d < turntable.length; d++) {
        const a = imgs.current[i - d];
        if (a?.complete && a.naturalWidth) return a;
        const b = imgs.current[i + d];
        if (b?.complete && b.naturalWidth) return b;
      }
      return null;
    };

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

    const paint = (p) => {
      const s = reduced ? 1 : ease(clamp01(p));
      const idx = Math.min(turntable.length - 1, Math.round(s * (turntable.length - 1)));
      const base = pick(idx);
      ctx.clearRect(0, 0, w, h);

      /* A portrait render on a landscape stage. Fit to height, then clamp to a
         width budget — without the clamp a phone gets an object wider than the
         screen, and a wide desktop gets one that runs through the headline.
         The budget is the half of the stage the copy does not use. */
      const narrow = w < 900;
      let dh = h * (reduced ? 0.7 : 0.56 + 0.13 * s);
      const maxW = w * (narrow ? 0.74 : 0.42);
      if ((FRAME.w / FRAME.h) * dh > maxW) dh = (maxW * FRAME.h) / FRAME.w;
      const dw = (FRAME.w / FRAME.h) * dh;
      const dx = w * (narrow || reduced ? 0.5 : 0.5 + 0.17 * s) - dw / 2;
      const dy = h * (narrow ? 0.32 : 0.46) - dh / 2;

      if (base) {
        ctx.globalAlpha = 0.28 + 0.72 * clamp01(s * 2.4);
        ctx.drawImage(base, dx, dy, dw, dh);
      }

      // the highlight still, crossfaded in over the settled frame
      const target = s > 0.94 && activeRef.current ? 1 : 0;
      mixRef.current += (target - mixRef.current) * 0.16;
      const still = activeRef.current ? stills.current[activeRef.current] : null;
      if (still?.complete && still.naturalWidth && mixRef.current > 0.004) {
        ctx.globalAlpha = mixRef.current;
        ctx.drawImage(still, dx, dy, dw, dh);
      }
      ctx.globalAlpha = 1;

      if (copyRef.current && !reduced) {
        const out = clamp01((s - 0.72) / 0.28);
        copyRef.current.style.opacity = String(1 - out * 0.12);
      }
      if (cueRef.current) cueRef.current.style.opacity = String(1 - clamp01(s / 0.22));
      return s;
    };

    const frame = () => {
      const p = (window.scrollY - hostTop) / travel;
      const s = paint(p);
      setSettled((cur) => (cur === s > 0.62 ? cur : s > 0.62));
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
          className={reduced ? 'h-[60svh] w-full' : 'absolute inset-0 h-full w-full'}
          role="img"
          aria-label="The D1 stereotactic frame, rendered from its assembly CAD and turning to a
            three-quarter view."
        />

        {/* Hairlines through letterforms are unreadable, so the copy carries
            its own scrim rather than dimming the whole stage. */}
        <div
          className={reduced ? 'contents' : 'pointer-events-none absolute inset-x-0 bottom-0'}
          aria-hidden={reduced ? undefined : 'true'}
          style={reduced ? undefined : {
            height: '62%',
            background:
              'linear-gradient(to top, var(--mv-bay) 0%, rgb(3 16 26/.86) 34%, rgb(3 16 26/0) 100%)',
          }}
        />

        <div
          ref={copyRef}
          className={
            reduced
              ? 'flex flex-col gap-4'
              /* Capped at 46% on wide stages: the object occupies the other
                 half, and an uncapped headline runs straight through it. 50%
                 is the width at which the authored two-line break still holds. */
              : 'absolute inset-x-0 bottom-0 flex flex-col gap-4 px-6 pb-32 lg:max-w-[50%] lg:px-10 lg:pb-20'
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

        {/* ── what it is made of ─────────────────────────────────────────── */}
        <ul
          /* Down the right on a wide stage, where the object leaves a column
             free. On a phone there is no free column — the object fills the
             width — so they drop to a row along the bottom instead of floating
             over the frame. */
          className={
            reduced
              ? 'flex flex-wrap gap-2'
              : 'absolute z-10 flex gap-2 inset-x-4 bottom-4 flex-row flex-wrap justify-center'
                + ' lg:inset-x-auto lg:bottom-auto lg:right-10 lg:top-1/2 lg:-translate-y-1/2'
                + ' lg:flex-col lg:items-end lg:justify-start'
          }
        >
          {callouts.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActive((cur) => (cur === c.id ? null : c.id))}
                aria-pressed={active === c.id}
                className={`flex items-center gap-2.5 rounded-full border px-4 py-2
                  text-left text-[0.8125rem] transition-colors ${
                  active === c.id
                    ? 'border-sg-300 bg-white/[0.12] text-nn-50'
                    : 'border-white/15 bg-white/[0.05] text-nn-200 hover:border-sg-300 hover:text-nn-50'
                }`}
                style={reduced ? undefined : {
                  opacity: settled ? 1 : 0,
                  transform: settled ? 'translateX(0)' : 'translateX(14px)',
                  transitionProperty: 'opacity, transform, color, border-color, background-color',
                  transitionDuration: '.35s',
                  transitionDelay: settled ? `${i * 70}ms` : '0ms',
                  pointerEvents: settled ? 'auto' : 'none',
                }}
              >
                <span
                  className="size-2 flex-none rounded-full bg-sg-300"
                  aria-hidden="true"
                />
                {c.name}
              </button>
            </li>
          ))}
        </ul>

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
