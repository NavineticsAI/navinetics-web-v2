import { useEffect, useRef } from 'react';
import { cn } from '../lib/cn.js';
import { usePrefersReducedMotion } from '../lib/motion.js';
import { Eyebrow, Reveal } from './Section.jsx';
import * as SCENES from '../lib/mavenScenes.js';

const BUILDERS = {
  sweep: SCENES.makeSweep,
  spikes: SCENES.makeSpikes,
  stim: SCENES.makeStim,
  stack: SCENES.makeStack,
};

/**
 * One domain, explained: copy, an animated ground, and a figure.
 *
 * The same three-column arrangement as the feature bands on the software page
 * — text, then a deliberately empty column that is the window the animation
 * shows through, then the figure. The scene is canvas, sized to its element,
 * driven by one rAF loop that only runs while the band is on screen.
 *
 * Not shared with SceneBand: that component owns the software page's scene
 * registry and its four bands, and the two would have to grow a props-shaped
 * plugin system to sit in one file. The layout is worth repeating; the wiring
 * is not worth generalising for two callers.
 */
export function MavenBand({ scene, tone, ground = 'bay', eyebrow, title, lead, points = [], meta = [], figure }) {
  const light = ground === 'light';
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;

    const ctx = cv.getContext('2d');
    const draw = BUILDERS[scene](light);
    let w = 0;
    let h = 0;
    let visible = false;
    let raf = 0;
    let start = null;

    const size = () => {
      // Out-of-focus grounds behind text, drawn in hairlines. Full device
      // ratio on a dense display is a great deal of fill for no visible gain.
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
    // One composed frame, picked well into the cycle so nothing is mid-build.
    if (reduced) draw(ctx, w, h, 5.4);
    else raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    /* ResizeObserver rather than a window listener: the band's height is set
       by its figure, and a lazily decoded image changes it long after mount
       without the window ever resizing. */
    const ro = new ResizeObserver(() => { size(); if (reduced) draw(ctx, w, h, 5.4); });
    ro.observe(cv);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [scene, light, reduced]);

  return (
    <section
      /* A hairline at the top of every band. Two consecutive sections'
         padding otherwise reads as one void and the page loses its joints.
         The light bands follow the page theme; the bay ones never do. */
      className={cn(
        'relative overflow-hidden border-t px-6 py-24 md:py-28 lg:py-32 lg:pl-8 lg:pr-5',
        light
          ? 'border-hairline-soft bg-canvas text-ink'
          : 'border-[var(--mv-rule-2)] bg-[var(--mv-bay)] text-nn-50',
      )}
      /* The tint is the domain's own colour, in the variant that survives the
         ground it is standing on — see the note beside the tokens. */
      style={{ '--tint': `var(--mv-${tone}${light ? '-ink' : ''})` }}
    >
      {/* Capped, not inset-0: when the layout stacks this section runs past
          2500px, and a canvas spanning it repaints four megapixels a frame. */}
      <canvas
        ref={canvasRef}
        className="absolute inset-x-0 top-1/2 h-full max-h-[1040px] w-full -translate-y-1/2"
        aria-hidden="true"
      />
      {/* Holds the copy readable, and lifts almost clear through the middle so
          the scene reads between the two columns rather than only behind them.
          The middle stop is low on purpose: at .22 the animation measured 13%
          of the canvas lit and was still invisible on the page. */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: light
            ? 'linear-gradient(96deg,var(--canvas) 0%,rgb(from var(--canvas) r g b/.88) 30%,'
              + 'rgb(from var(--canvas) r g b/.06) 52%,rgb(from var(--canvas) r g b/.34) 100%)'
            : 'linear-gradient(96deg,rgb(3 16 26/.95) 0%,rgb(3 16 26/.84) 30%,'
              + 'rgb(3 16 26/.08) 52%,rgb(3 16 26/.3) 100%)',
        }}
      />

      <div className="relative mx-auto grid max-w-[96rem] items-center gap-12 lg:grid-cols-[minmax(0,28%)_minmax(190px,1fr)_minmax(0,46%)] lg:gap-10">
        <div className="max-w-[min(52ch,100%)]">
          <Eyebrow style={{ color: 'var(--tint)' }}>{eyebrow}</Eyebrow>
          <h2 className="mt-4 whitespace-pre-line text-d1 !tracking-[-0.04em]">{title}</h2>
          {lead && (
            <p className={cn('mt-5 text-lead leading-[1.6] tracking-[-0.015em]', light ? 'text-ink-2' : 'text-nn-200')}>{lead}</p>
          )}

          {points.length > 0 && (
            <ul className="mt-7 grid list-none gap-3.5 p-0">
              {points.map((p) => (
                <li key={p.label} className={cn('flex gap-3 text-[0.925rem] leading-relaxed', light ? 'text-ink-2' : 'text-nn-200')}>
                  <i
                    className="mt-[0.5em] block h-1.5 w-1.5 shrink-0 rounded-full not-italic"
                    style={{ background: 'var(--tint)' }}
                    aria-hidden="true"
                  />
                  <span>
                    <b className={cn('font-semibold', light ? 'text-ink' : 'text-nn-50')}>{p.label}</b> {p.body}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {meta.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
              {meta.map((m) => (
                <span key={m.label}>
                  {m.label} <b className="font-semibold" style={{ color: 'var(--tint)' }}>{m.value}</b>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* the animation's window */}
        <div aria-hidden="true" className="hidden lg:block" />

        {figure && (
          <Reveal>
            <figure className="m-0 lg:-mr-3">
              {/* Scientific figures are drawn on white. Rather than pretend
                  otherwise, they sit on a plate — which is what keeps a figure
                  with fine black annotation legible on either ground. */}
              <div className={cn(
                'overflow-hidden rounded-xl border bg-white p-3 shadow-e3 sm:p-5',
                light ? 'border-hairline' : 'border-nn-300/25',
              )}>
                <img
                  src={figure.src}
                  alt={figure.alt}
                  width={figure.w}
                  height={figure.h}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
                {figure.caption}
              </figcaption>
            </figure>
          </Reveal>
        )}
      </div>
    </section>
  );
}
