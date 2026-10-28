import { useEffect, useRef, useState } from 'react';
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
 * One subject, explained: copy, an animated ground, and a figure.
 *
 * The same three-column arrangement as the feature bands on the software page
 * — text, then a deliberately empty column that is the window the animation
 * shows through, then the figure. The scene is canvas, sized to its element,
 * driven by one rAF loop that only runs while the band is on screen.
 *
 * Shared by the MAVEN product page and the neuromodulation technology page,
 * which is why it is not called MavenBand. The scenes it draws still are
 * MAVEN's — lib/mavenScenes.js — because that is where they came from and both
 * callers are about the same instrument's science.
 *
 * Not shared with SceneBand: that component owns the software page's scene
 * registry and its four bands, and the two would have to grow a props-shaped
 * plugin system to sit in one file. The layout is worth repeating; the wiring
 * is not worth generalizing for three callers.
 */
/* `builders` lets a page bring its own scene registry. The MAVEN scenes are
   the default because they were here first; the carbon tables pass theirs. */
export function ScienceBand({
  scene, builders = BUILDERS, tone, ground = 'bay',
  eyebrow, title, lead, points = [], meta = [], figure,
}) {
  const light = ground === 'light';
  const reduced = usePrefersReducedMotion();
  /* A light-ground band turns dark in dark theme (bg-canvas follows it), but
     the scene and the eyebrow tint were chosen from `light` alone, so on a
     dark page they kept the ink meant for a pale one: dark lines on dark, and
     an eyebrow at about 3.1:1. `inkLight` is whether the band is ACTUALLY pale
     right now.

     Read from the data-theme attribute, not useTheme(): EduFigures measured
     that the hook's value can change before the stylesheet does, and the
     canvas then repaints with the old theme's colours. */
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark',
  );
  useEffect(() => {
    const read = () => setDark(document.documentElement.dataset.theme === 'dark');
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  const inkLight = light && !dark;
  const canvasRef = useRef(null);
  /* A band may carry no scene. The NRSS "Room to work." band lost its
     animation on 2026-10-26, and `builders[scene](light)` below was called
     unconditionally - an absent scene was a TypeError that took the whole page
     down, not a still band. With no scene there is no canvas, no scrim and no
     animation loop; the band is copy and figure on its ground. */
  const animated = Boolean(scene && builders[scene]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !animated) return undefined;

    const ctx = cv.getContext('2d');
    const draw = builders[scene](inkLight);
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
      // `document.hidden` as well as `visible`: an element can be inside the
      // viewport of a tab nobody is looking at, and drawing into it costs the
      // same as drawing into one they are.
      if (visible && !document.hidden && w > 4 && now - painted >= MIN_MS) {
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
  }, [scene, builders, inkLight, reduced, animated]);

  return (
    <section
      /* A hairline at the top of every band. Two consecutive sections'
         padding otherwise reads as one void and the page loses its joints.
         The light bands follow the page theme; the bay ones never do. */
      className={cn(
        /* Full-bleed ground, framed content — same reasoning as SceneBand.
           The canvas and gradient stay inset-0; the copy joins max-w-7xl. */
        'relative overflow-hidden border-t px-6 py-16 md:py-20 lg:px-8 lg:py-24',
        light
          ? 'border-hairline-soft bg-canvas text-ink'
          : 'border-[var(--mv-rule-2)] bg-[var(--mv-bay)] text-nn-50',
      )}
      /* The tint is the domain's own color, in the variant that survives the
         ground it is standing on — see the note beside the tokens. */
      style={{ '--tint': `var(--mv-${tone}${inkLight ? '-ink' : ''})` }}
    >
      {animated && (<>
      {/* Capped, not inset-0: when the layout stacks this section runs past
          2500px, and a canvas spanning it repaints four megapixels a frame. */}
      <canvas
        ref={canvasRef}
        /* hidden below lg - 2026-10-27. Below lg the copy and figure stack
           and the empty middle column the scene was drawn for is gone, but the
           canvas still spanned the full width behind the stacked copy, so on a
           phone every band drew through its text or hid behind its figure. A
           hidden canvas measures 0x0, which the w > 4 check in `frame` already
           skips, and drawing resumes at lg. This also stills Surgical Tables'
           two bands on phones. */
        className="absolute inset-x-0 top-1/2 hidden h-full max-h-[1040px] w-full -translate-y-1/2 lg:block"
        aria-hidden="true"
      />
      {/* Holds the copy readable, and lifts almost clear through the middle so
          the scene reads between the two columns rather than only behind them.
          The middle stop is low on purpose: at .22 the animation measured 13%
          of the canvas lit and was still invisible on the page. */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        aria-hidden="true"
        style={{
          /* Explicit stop tokens rather than rgb(from var(--canvas) …): the
             relative-color form is Safari 16.4+, and below that the whole
             gradient fails to parse and the copy loses its scrim. See the
             tokens in index.css. */
          background: light
            ? 'linear-gradient(96deg,var(--canvas) 0%,var(--band-scrim-1) 30%,'
              + 'var(--band-scrim-2) 52%,var(--band-scrim-3) 100%)'
            : 'linear-gradient(96deg,rgb(3 16 26/.95) 0%,rgb(3 16 26/.84) 30%,'
              + 'rgb(3 16 26/.08) 52%,rgb(3 16 26/.3) 100%)',
        }}
      />
      </>)}

      <div className="nn-frame relative mx-auto grid items-center gap-12 lg:grid-cols-[minmax(0,30%)_minmax(150px,1fr)_minmax(0,46%)] lg:gap-10">
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
                  with fine black annotation legible on either ground.

                  `bare` is for the ones that are not: a cut-out object with its
                  own alpha, which wants the band's ground behind it and reads
                  as mounted on a card if you give it a plate. */}
              <div className={cn(
                figure.bare
                  ? 'overflow-visible'
                  : 'overflow-hidden rounded-xl border bg-white p-3 shadow-e3 sm:p-5',
                figure.bare ? '' : light ? 'border-hairline' : 'border-nn-300/25',
              )}>
                {figure.video ? (
                  /* Plays only while the band is on screen, and only if the
                     reader has not asked for less motion — in which case the
                     poster is the figure and the video never loads at all. */
                  <BandVideo figure={figure} reduced={reduced} />
                ) : (
                  <img
                    src={figure.src}
                    alt={figure.alt}
                    width={figure.w}
                    height={figure.h}
                    loading="lazy"
                    decoding="async"
                    /* A plated figure fills its column. A cut-out object is
                       usually tall and narrow, and filling the column with one
                       makes it two thousand pixels high — so it is capped by
                       height and centered instead. */
                    className={figure.bare
                      ? cn('mx-auto block h-auto w-auto max-w-full', BARE_CAP[figure.cap ?? 'tall'])
                      : 'block h-auto w-full'}
                  />
                )}
              </div>
              {/* Only with a caption: an empty one still took its margin. */}
              {figure.caption && (
                <figcaption className="mt-3 font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
                  {figure.caption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* Height caps for unplated cut-outs. `tall` suits a narrow object like the
   head model. A cut-out with any breadth to it carries far more weight at that
   height than the plated figures in the bands either side, so `plate` caps it
   at about their height instead. */
const BARE_CAP = {
  tall: 'max-h-[26rem] sm:max-h-[32rem] lg:max-h-[38rem]',
  plate: 'max-h-[20rem] sm:max-h-[24rem] lg:max-h-[30rem]',
};

/**
 * A figure that moves.
 *
 * Muted, looping and silent, so it can play without being asked to — but only
 * while the band is actually on screen, because a video decoding behind three
 * screenfuls of other content is pure battery. Under reduced motion it never
 * loads: the poster is the figure, and that is the honest reading of the
 * preference rather than a paused video with a play button.
 */
function BandVideo({ figure, reduced }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;
    /* `rate` slows a clip without re-encoding it. Set as the default too,
       because with preload="none" the media loads on first play and loading
       resets playbackRate to defaultPlaybackRate. */
    if (figure.rate) {
      el.defaultPlaybackRate = figure.rate;
      el.playbackRate = figure.rate;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => { /* autoplay refused; poster stands */ });
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, figure.rate]);

  if (reduced) {
    return (
      <img
        src={figure.poster}
        alt={figure.alt}
        width={figure.w}
        height={figure.h}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    );
  }
  return (
    <video
      ref={ref}
      src={figure.video}
      poster={figure.poster}
      width={figure.w}
      height={figure.h}
      muted
      loop
      playsInline
      preload="none"
      aria-label={figure.alt}
      className="block h-auto w-full"
    />
  );
}
