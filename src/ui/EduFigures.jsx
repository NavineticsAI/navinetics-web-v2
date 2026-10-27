import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn.js';
import { usePrefersReducedMotion } from '../lib/motion.js';
import { drawArc } from '../lib/arcScene.js';
import localiserSrc from '../assets/education/02.3.a.webp';
import sliceSrc from '../assets/education/02.3.b.webp';
import frameVideo from '../assets/education/02.1.web.mp4';
import framePoster from '../assets/education/02.1.web.poster.webp';

/**
 * The education page's figures.
 *
 * Each one is here because it is teaching a relationship a still picture can
 * state but not demonstrate — an arc whose trajectories all end in the same
 * place, a signal that is invisible until its background is removed, two
 * methods that recover different halves of the same truth.
 *
 * All of them are drawn rather than illustrated, so they cost nothing to keep
 * accurate and they follow the theme.
 */

/* ── shared shell ───────────────────────────────────────────────────────── */
function Figure({ title, hint, children, caption }) {
  return (
    <figure className="mt-9">
      <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
        {/* THE HEADER BAR IS OPTIONAL. It used to render unconditionally, so a
            figure with no title still drew the bar, its bottom border and its
            padding - a grey empty strip above the picture. Three of the
            stereotaxy figures lost their titles on 2026-10-21 and need the bar
            to go with them. */}
        {(title || hint) && (
          <div className="flex flex-wrap items-center gap-3 border-b border-hairline-soft bg-surface-2 px-5 py-3">
            {title && <span className="text-sm font-semibold">{title}</span>}
            {hint && <span className="eyebrow ml-auto text-ink-3">{hint}</span>}
          </div>
        )}
        <div className="px-5 py-5">{children}</div>
      </div>
      {caption && <figcaption className="mt-3 max-w-prose text-xs text-ink-3">{caption}</figcaption>}
    </figure>
  );
}

/**
 * Theme tokens, re-read whenever the theme actually changes.
 *
 * Watches the `data-theme` attribute rather than the value from useTheme().
 * ThemeProvider writes that attribute from an effect of its own, and a parent's
 * effect runs AFTER its children's — so reading on the context change samples
 * the OUTGOING theme's colors, and because the dependency never fires again it
 * keeps them for good. Measured: toggling to dark left two of these canvases
 * byte-for-byte identical, still carrying light-theme ink on a dark page.
 *
 * The attribute is what decides the colors, so the attribute is what to watch.
 */
function usePalette() {
  const [pal, setPal] = useState(null);
  useEffect(() => {
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const v = (n) => s.getPropertyValue(n).trim();
      setPal({
        bg: v('--surface'), line: v('--hairline'), soft: v('--hairline-soft'),
        action: v('--action'), ink: v('--ink'), sub: v('--ink-3'),
        /* The species in the electrode figure. The target is the only saturated
           one; the rest are held down so green reads as "the one being looked
           for" rather than as one of four equals. */
        target: v('--edu-target'),
        'other-1': v('--ink-3'),
        'other-2': v('--color-nn-400'),
        'other-3': v('--warn'),
      });
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return pal;
}

/**
 * Canvas sized to its box in CSS pixels, redrawn on resize and on palette.
 *
 * Takes an already-memoized painter rather than a function plus a dependency
 * array: a hook that forwards someone else's deps cannot be checked, and the
 * checker is right to complain about it.
 */
function useCanvas(cb) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    let raf = 0;
    const paint = () => {
      const w = cv.clientWidth;
      // A fixed height when one was given, otherwise the box the aspect
      // ratio produced. Reading it here, on every paint, is what lets the
      // drawing follow a width change on resize.
      const h = cv.dataset.h ? +cv.dataset.h : cv.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cb(ctx, w, h);
    };
    paint();
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    });
    ro.observe(cv);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [cb]);
  return ref;
}

/* `height` fixes the canvas at a pixel height; omit it and give an
   aspect-[..] class instead, and the canvas takes its height from its width.
   useCanvas reads the drawn height from data-h when it is set and from the
   laid-out box when it is not. */
const Canvas = ({ inner, height, className, ...rest }) => (
  <canvas
    ref={inner}
    data-h={height}
    style={height ? { height } : undefined}
    className={cn('mx-auto block w-full max-w-[740px]', className)}
    {...rest}
  />
);

/* ── controls ───────────────────────────────────────────────────────────── */
function Slider({ label, value, onChange, min, max, format }) {
  return (
    <label className="flex items-center gap-3 text-sm text-ink-2">
      <span className="eyebrow w-14 shrink-0 text-ink-3">{label}</span>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="nn-edu-range w-36"
        aria-label={label}
      />
      <output className="w-12 font-data text-xs">{format(value)}</output>
    </label>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <span className="inline-flex overflow-hidden rounded-full border border-hairline">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            'cursor-pointer px-3.5 py-1.5 text-xs transition-colors',
            value === o.id ? 'bg-action font-semibold text-on-action' : 'text-ink-2 hover:text-action',
          )}
        >
          {o.label}
        </button>
      ))}
    </span>
  );
}

/* ══ 02 · arc-centered targeting, in three dimensions ═════════════════════ */
/* The frozen view and angles.

   This figure was INTERACTIVE and is now static, on NaviNetics' instruction
   2026-10-21: "remove sliders and title bar from interactive, make it static,
   clear, explaining figure". What came off:

     · two sliders, Arc (-80..80) and Collar (-90..90)
     · a "Show other trajectories" checkbox
     · pointer drag and arrow-key control of the camera
     · a slow idle drift, which existed so a reader would discover the drag
     · the title bar "Arc-centered targeting", the hint "Drag to turn - move
       the angles", and the caption "Schematic, and interactive. Whatever the
       two angles are, the trajectory ends at the same point - which is the
       property the whole instrument is built around."

   The angles are frozen at the values the sliders used to open on, and the
   other trajectories stay ON: they are the entire argument of the figure,
   since what it exists to show is that every one of them ends at the same
   focus. With the caption gone that point is now made only by the picture.

   drawArc is untouched and still takes the same three arguments, so restoring
   the controls means putting the state and handlers back around it. */
/* zoom was 1, which drew the instrument at about a quarter of the figure's
   width with the rest white. It no longer has to share the box with sliders
   or a caption, so it takes the room. */
const ARC_VIEW = { az: -0.52, el: 0.24, dist: 430, zoom: 1.5 };
const ARC_SET = { arc: -30, collar: 34, ghosts: true };

function ArcFigure() {
  const pal = usePalette();

  const ref = useCanvas(useCallback(
    (ctx, w, h) => { if (pal) drawArc(ctx, w, h, ARC_VIEW, ARC_SET, pal); },
    [pal],
  ));

  return (
    <Figure>
      {/* SIZED TO MATCH THE VIDEO BELOW IT. This was a fixed 430px canvas
          at every width: at 1440 it sat between a 672x262 localizer pair and
          a 1238x696 video, three figures in one subsection at three unrelated
          sizes. All three now share the 740px column. At lg and up this is
          16:9 - exactly the video's shape, so the two read as a matched pair.
          Below lg it is 10:9: the drawing is about 380x340 at unit scale and
          is limited by WIDTH on a phone, so 16:9 there would shrink it to
          about half, while 10:9 keeps it the size it was and drops the dead
          space the fixed 430 left above and below it. */}
      <Canvas
        inner={ref}
        className="aspect-[10/9] rounded lg:aspect-[16/9]"
        role="img"
        aria-label="Three-dimensional diagram of an arc-centered stereotactic frame. Every trajectory passes through one focus."
      />
    </Figure>
  );
}

/* ══ 01 · the implanted system ══════════════════════════════════════════ */
const DBS_PARTS = [
  ['lead', 'Lead', 'Several electrode contacts on a thin insulated wire, placed at the target.'],
  ['ext', 'Extension', 'Tunnelled under the skin from the skull to the chest. Nothing crosses the skin.'],
  ['ipg', 'Pulse generator', 'Battery and electronics below the collarbone. Programmed from outside the body.'],
];

function DbsFigure() {
  const [on, setOn] = useState('lead');
  const active = DBS_PARTS.find((p) => p[0] === on);
  const stroke = (id) =>
    cn('transition-[stroke,stroke-width] duration-200', on === id ? 'stroke-action' : 'stroke-ink-3');
  const width = (id) => (on === id ? 3.4 : 2.4);
  const hit = (id) => ({
    onPointerEnter: () => setOn(id),
    onFocus: () => setOn(id),
    onClick: () => setOn(id),
    tabIndex: 0,
    role: 'button',
    'aria-label': DBS_PARTS.find((p) => p[0] === id)[1],
    className: 'cursor-pointer outline-none',
    /* `pointer-events: all` rather than relying on a transparent fill being
       treated as painted. Under the default `visiblePainted`, WebKit does not
       hit-test a fully transparent fill — probed on this figure, the topmost
       element at the generator's own center was the <svg>, not the <rect>
       inside it. `all` hit-tests the geometry regardless of paint, which is
       what an invisible hit area needs. */
    style: { pointerEvents: 'all' },
  });

  return (
    <Figure title="The implanted system" hint="Hover or tap a part">
      {/*
        REDRAWN. The previous version had a 620 × 300 viewBox with nothing left
        of x=150 — a quarter of the figure was empty by construction — and it
        showed a head, a long wire, and a rectangle floating in the corner with
        no body between them. The drawing is the point of this figure: where
        these three parts sit RELATIVE to each other is the whole explanation.

        Now it is anatomical: cranium at the left, neck, and a chest wall
        running right, with the generator sitting on it below the collarbone.
        That is also the answer to the question the deep-dive below asks — why
        the generator is in the chest and not the head.

        NOT aria-hidden any more. The three groups are role="button" with
        labels, and burying focusable controls inside an aria-hidden subtree
        told screen readers they did not exist while leaving them tabbable.
      */}
      <svg
        viewBox="0 0 620 340"
        className="mx-auto block w-full max-w-[740px]"
        role="group"
        aria-label="The three implanted parts: lead, extension and pulse generator"
      >
        {/* Head in profile, facing left — brow, nose and jaw, so it reads as a
            head rather than a circle. The generator is on the chest, so the
            person has to be facing away from it for the anatomy to make sense. */}
        <path
          d="M100 138C100 78 142 40 184 40c44 0 76 38 76 88 0 32-8 52-15 68l-9 24
             c-4 12-15 18-28 18h-38c-10 0-18-4-24-11l-14-16-16-6c-5-2-6-8-2-12l12-13
             c-6-14-10-28-10-42Z"
          className="fill-none stroke-hairline" strokeWidth="2"
        />
        {/* Neck, shoulder and chest wall. The body is the reason this figure
            exists — where the parts sit relative to each other IS the lesson. */}
        <path
          d="M216 232c2 12 6 20 14 26 26 20 74 30 128 32h262"
          className="fill-none stroke-hairline" strokeWidth="2"
        />
        <path
          d="M156 240c-4 24 10 44 40 56 40 16 96 24 160 26h264"
          className="fill-none stroke-hairline-soft" strokeWidth="1.6"
        />
        {/* the region the target sits in */}
        <ellipse
          cx="180" cy="128" rx="52" ry="44"
          className="fill-none stroke-hairline-soft" strokeWidth="1.4" strokeDasharray="3 4"
        />

        {/*
          HIT AREAS, invisible and wide.
          ───────────────────────────────────────────────────────────────────
          The parts are drawn as 2.4px strokes, and a 2.4px stroke is the only
          thing that was hit-testable — so "Hover or tap a part" was a lie on
          any touchscreen: a fingertip is roughly 9mm and there was nothing
          within a fingertip's reach to hit. It worked with a mouse, which is
          exactly why it survived.

          `stroke="transparent"` rather than no stroke: SVG hit-testing under
          the default `visiblePainted` needs the geometry to be PAINTED, and
          transparent counts as painted while none does not. Same for the
          generator's fill.
        */}
        <g {...hit('ext')}>
          <path
            d="M190 46c34 10 58 44 62 84 4 38-4 72-12 92-8 22 4 40 32 50 46 16 96 24 146 26"
            fill="none" stroke="transparent" strokeWidth="26" strokeLinecap="round"
          />
          <path
            d="M190 46c34 10 58 44 62 84 4 38-4 72-12 92-8 22 4 40 32 50 46 16 96 24 146 26"
            className={cn('fill-none', stroke('ext'))}
            strokeWidth={width('ext')} strokeLinecap="round"
          />
        </g>

        {/* lead — anchored at the burr hole, down to the target */}
        <g {...hit('lead')}>
          <path d="M170 44h30M184 46c1 30-2 58-4 80"
            fill="none" stroke="transparent" strokeWidth="30" strokeLinecap="round" />
          <path
            d="M184 46c1 30-2 58-4 80"
            className={cn('fill-none', stroke('lead'))}
            strokeWidth={width('lead')} strokeLinecap="round"
          />
          <path
            d="M170 44h30"
            className={cn('fill-none', stroke('lead'))}
            strokeWidth={width('lead')} strokeLinecap="round"
          />
        </g>

        {/* pulse generator — below the collarbone, on the chest wall */}
        <g {...hit('ipg')}>
          {/* Padded hit area. The generator draws at 80×46 in a 620-wide
              viewBox, which lands at about 40×24 CSS px on a phone — level
              with the WCAG 2.2 AA minimum and well under the 44px iOS asks
              for. The invisible rect gives a finger somewhere to land. */}
          <rect x="396" y="256" width="124" height="86" fill="transparent" />
          <rect
            x="418" y="276" width="80" height="46" rx="11"
            className={stroke('ipg')} fill="transparent" strokeWidth={width('ipg')}
          />
        </g>

        <circle cx="180" cy="128" r="4.5" className="fill-action" />
        <text x="192" y="124" className="fill-ink-3 font-data" fontSize="11">TARGET</text>
        <text x="300" y="272" className="fill-ink-3 font-data" fontSize="11">EXTENSION</text>
        <text x="512" y="304" className="fill-ink-3 font-data" fontSize="11">GENERATOR</text>
      </svg>
      <p className="mt-3.5 min-h-[3em] text-sm text-ink-2">
        <strong className="font-semibold text-ink">{active[1]}.</strong> {active[2]}
      </p>
    </Figure>
  );
}

/* ══ 03 · what the electrode measures ═══════════════════════════════════
   Tissue is a soup. Molecules of every kind reach the electrode; only the one
   whose oxidation potential the electrode is held at gives up an electron
   there. So the drift is crowded and multicoloured, and the trace answers to
   the green arrivals alone — which is the whole idea of selectivity, and the
   thing a still diagram of one molecule cannot say.

   The particles and the trace are computed from the same arrival schedule, so
   a spike on the graph is the green dot you just watched land, not a loop
   playing next to it. */
const SPECIES = [
  { key: 'target', tone: 'target', r: 3.4, n: 7 },
  { key: 'a', tone: 'other-1', r: 2.6, n: 6 },
  { key: 'b', tone: 'other-2', r: 3.2, n: 5 },
  { key: 'c', tone: 'other-3', r: 2.2, n: 6 },
];

/* Deterministic, so nothing has to be stored between frames. */
const SWARM = SPECIES.flatMap((s, si) =>
  Array.from({ length: s.n }, (_, i) => {
    const seed = si * 131 + i * 37;
    return {
      tone: s.tone,
      target: s.tone === 'target',
      r: s.r,
      angle: ((seed * 2654435761) % 1000) / 1000 * Math.PI * 2,
      period: 2.1 + (((seed * 40503) % 1000) / 1000) * 3.4,
      offset: (((seed * 69621) % 1000) / 1000) * 4,
    };
  }));

const ARRIVALS = SWARM.filter((p) => p.target);

/** Current at time u: a decaying pulse per green arrival, summed. */
function currentAt(u) {
  let s = 0;
  for (const g of ARRIVALS) {
    const k = Math.floor((u - g.offset) / g.period);
    for (let j = 0; j < 3; j++) {
      const d = u - (g.offset + (k - j) * g.period);
      if (d >= 0) s += Math.exp(-d / 0.5) * (1 - Math.exp(-d / 0.07));
    }
  }
  return s;
}

function RedoxFigure() {
  const pal = usePalette();
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (reduced) return undefined;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => { setT((now - t0) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const ref = useCanvas(useCallback((ctx, w, h) => {
    if (!pal) return;
    ctx.clearRect(0, 0, w, h);
    const ex = w * 0.30, ey = h * 0.52;
    const REACH = 128;

    // the electrode, tapering to the tip the way a pulled fiber does
    ctx.strokeStyle = pal.sub; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(ex, 8); ctx.lineTo(ex, ey - 26); ctx.stroke();
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(ex, ey - 26); ctx.lineTo(ex, ey); ctx.stroke();

    // how much target has just landed — drives the glow at the tip
    const now = currentAt(t);

    for (const p of SWARM) {
      const phase = ((t - p.offset) / p.period) % 1;
      const f = phase < 0 ? phase + 1 : phase;
      const rad = REACH * (1 - f);
      const x = ex + Math.cos(p.angle) * rad * 1.85;
      const y = ey + Math.sin(p.angle) * rad * 0.74;
      if (y > h - 6 || y < 6) continue;
      /* Everything drifts in. Only the target gives up its electron at the
         surface, so only the target vanishes there — the rest bounce off and
         are drawn carrying on past. */
      const near = 1 - Math.min(1, rad / 20);
      ctx.globalAlpha = p.target ? 0.35 + f * 0.65 : 0.3 + f * 0.4;
      ctx.fillStyle = pal[p.tone];
      ctx.beginPath();
      ctx.arc(x, y, p.r + (p.target ? near * 1.8 : 0), 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // the tip, brightening as target arrives
    const lit = Math.min(1, now / 1.6);
    ctx.fillStyle = pal.target;
    ctx.globalAlpha = 0.22 + lit * 0.5;
    ctx.beginPath(); ctx.arc(ex, ey, 9 + lit * 7, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(ex, ey, 4.2, 0, 7); ctx.fill();

    // the trace — a window of the same arrival schedule
    const gx = w * 0.54, gw = w - gx - 26, gy = 20, gh = h - 58;
    ctx.strokeStyle = pal.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.stroke();

    const WINDOW = 6;
    ctx.strokeStyle = pal.target; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 160; i++) {
      const f = i / 160;
      const v = currentAt(t - WINDOW * (1 - f));
      const x = gx + f * gw;
      const y = gy + gh - Math.min(1, v / 2.6) * gh * 0.88;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();

    ctx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillStyle = pal.sub;
    ctx.fillText('ELECTRODE SURFACE', 10, h - 12);
    ctx.fillStyle = pal.target;
    ctx.fillText('CURRENT — THE TARGET ONLY', gx, h - 12);
  }, [pal, t]));

  return (
    /* No legend and no caption. The green is the only saturated thing on
       screen and the trace is drawn in the same green — the figure says which
       one is being measured by showing it, and a key underneath only repeats
       what the picture already did. */
    <Figure title="What the electrode measures" hint={reduced ? 'Still' : 'Running'}>
      <Canvas
        inner={ref} height={210} role="img"
        aria-label="Molecules of several kinds drifting to an electrode; the measured current responds only to the target species."
      />
    </Figure>
  );
}

/* ══ 04 · one sweep, and what it hides ══════════════════════════════════ */
const V0 = -0.4, V1 = 1.0;
const potential = (f) => (f < 0.5 ? V0 + (V1 - V0) * (f / 0.5) : V1 - (V1 - V0) * ((f - 0.5) / 0.5));

function FscvFigure() {
  const pal = usePalette();
  const [amount, setAmount] = useState(62);
  const [mode, setMode] = useState('sub');
  const subtracted = mode === 'sub';

  const ref = useCanvas(useCallback((ctx, w, h) => {
    if (!pal) return;
    ctx.clearRect(0, 0, w, h);
    const k = amount / 100;
    const faradaic = (f) => {
      const v = potential(f);
      const up = f < 0.5;
      const ox = up ? Math.exp(-(((v - 0.62) / 0.11) ** 2)) : 0;
      const red = up ? 0 : -0.62 * Math.exp(-(((v + 0.21) / 0.12) ** 2));
      return (ox + red) * k;
    };
    /* Capacitive charging: large, and it flips sign with the sweep direction.
       Drawn about five times the faradaic peak. In a real recording it is
       orders larger than that, but at a true ratio the raw trace is a flat
       line and the figure teaches nothing. */
    const background = (f) => (f < 0.5 ? 1 : -1) * (3.6 + 1.5 * Math.sin(potential(f) * 2.1 + 0.4));

    const pad = 30, midx = w * 0.46;
    const ax = pad, aw = midx - pad - 22, ay = 22, ah = h - 66;
    ctx.strokeStyle = pal.line; ctx.lineWidth = 1; ctx.strokeRect(ax, ay, aw, ah);
    ctx.strokeStyle = pal.action; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const f = i / 100;
      const x = ax + f * aw, y = ay + ah - ((potential(f) - V0) / (V1 - V0)) * ah;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = pal.sub;
    ctx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillText('POTENTIAL vs TIME', ax, h - 28);
    ctx.fillText('+1.0 V', ax + 5, ay + 12);
    ctx.fillText('−0.4 V', ax + 5, ay + ah - 5);

    const bx = midx + 22, bw = w - bx - pad, by = 22, bh = h - 66;
    ctx.strokeStyle = pal.line; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
    const cy = by + bh / 2;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(bx, cy); ctx.lineTo(bx + bw, cy); ctx.stroke();
    ctx.setLineDash([]);
    /* Each view is scaled to what it has to hold — the raw trace to the
       background, the subtracted one to the signal. That is what an
       experimenter does after subtracting, and it is why the axis note says
       the scale changed. Clipped as well, so no combination of inputs can put
       a peak outside its own box. */
    const scale = subtracted ? 1.2 : 6.6;
    ctx.save();
    ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
    ctx.strokeStyle = pal.action; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 220; i++) {
      const f = i / 220;
      const cur = faradaic(f) + (subtracted ? 0 : background(f));
      const x = bx + ((potential(f) - V0) / (V1 - V0)) * bw;
      const y = cy - (cur / scale) * (bh / 2) * 0.86;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = pal.sub;
    ctx.fillText('CURRENT vs POTENTIAL', bx, h - 28);
    ctx.fillStyle = subtracted ? pal.action : pal.sub;
    ctx.fillText(subtracted ? 'THE CHEMISTRY · SCALE EXPANDED' : 'MOSTLY CHARGING CURRENT', bx, h - 13);
  }, [pal, amount, subtracted]));

  return (
    <Figure
      title="One sweep, and what it hides"
      hint="Try turning subtraction off"
      caption="With the background left in, the dopamine is still there — it is simply far smaller than
        the current used to charge the electrode. In a real recording the gap is wider than a drawing
        can show and still leave anything to see."
    >
      <Canvas
        inner={ref} height={250} role="img"
        aria-label="A triangular potential sweep, and the cyclic voltammogram it produces."
      />
      <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-4">
        <Slider
          label="Dopamine" min={0} max={100} value={amount} onChange={setAmount}
          format={(v) => (v < 6 ? 'none' : v < 45 ? 'some' : 'lots')}
        />
        <Segmented
          value={mode}
          onChange={setMode}
          options={[{ id: 'raw', label: 'Raw current' }, { id: 'sub', label: 'Background subtracted' }]}
        />
      </div>
    </Figure>
  );
}

/* ══ 05 · two questions about one molecule ══════════════════════════════ */
function CompareFigure() {
  const pal = usePalette();
  const [mode, setMode] = useState('fast');

  const ref = useCanvas(useCallback((ctx, w, h) => {
    if (!pal) return;
    ctx.clearRect(0, 0, w, h);
    const fast = mode === 'fast';
    const pad = 30, midx = w * 0.42;

    const ax = pad, aw = midx - pad - 20, ay = 20, ah = h - 62;
    ctx.strokeStyle = pal.line; ctx.lineWidth = 1; ctx.strokeRect(ax, ay, aw, ah);
    ctx.strokeStyle = pal.action; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 400; i++) {
      const f = i / 400;
      const u = (f * 3) % 1;
      const v = fast
        ? (u < 0.5 ? u * 2 : 2 - u * 2)
        : (u < 0.12 ? 0.06 : u < 0.5 ? 0.92 : u < 0.62 ? 0.06 : 0.34);
      const x = ax + f * aw, y = ay + ah - v * ah * 0.86 - ah * 0.07;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = pal.sub;
    ctx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillText(fast ? 'TRIANGLE SWEEP' : 'SQUARE WAVE + HOLD', ax, h - 26);

    const bx = midx + 20, bw = w - bx - pad, by = 20, bh = h - 62;
    ctx.strokeStyle = pal.line; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
    const slow = (f) => 0.34 + 0.1 * Math.sin(f * 5.5);
    const truth = (f) => slow(f)
      + 0.46 * Math.exp(-(((f - 0.42) / 0.035) ** 2))
      + 0.3 * Math.exp(-(((f - 0.66) / 0.028) ** 2));

    ctx.strokeStyle = pal.line; ctx.lineWidth = 1.4; ctx.setLineDash([3, 4]); ctx.beginPath();
    for (let i = 0; i <= 260; i++) {
      const f = i / 260, x = bx + f * bw, y = by + bh - truth(f) * bh * 0.88;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]);

    ctx.strokeStyle = pal.action; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let i = 0; i <= 260; i++) {
      const f = i / 260;
      const v = fast ? truth(f) - slow(f) + 0.06 : slow(f);
      const x = bx + f * bw, y = by + bh - v * bh * 0.88;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = pal.sub;
    ctx.fillText('TRUE CONCENTRATION — DASHED', bx, h - 26);
    ctx.fillStyle = pal.action;
    ctx.fillText(fast ? 'RECOVERED: THE CHANGE' : 'RECOVERED: THE LEVEL', bx, h - 12);
  }, [pal, mode]));

  return (
    <Figure
      title="Two questions about one molecule"
      hint="Switch the method"
      caption={mode === 'fast'
        ? 'Fast-scan sees the spike, and cannot tell you the level it rose from.'
        : 'Square-wave sees the level, and is too slow for a single release event.'}
    >
      <Canvas
        inner={ref} height={230} role="img"
        aria-label="The same concentration recorded two ways: the change, and the standing level."
      />
      <div className="mt-4">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[{ id: 'fast', label: 'Fast-scan · phasic' }, { id: 'square', label: 'Square wave · tonic' }]}
        />
      </div>
    </Figure>
  );
}

/* ══ 02 · the localizer, and the slice it produces ══════════════════════ */

/* The localizer ring is horizontal in the world, so it projects to an ellipse.
   Measured off the render: center (700, 343), rx 533, ry 147, in its own
   1399×1124 frame. Parallel planes project to the same ellipse translated, so
   sweeping one down the screen sweeps a real axial plane through the head. */
const RING = { cx: 700, rx: 533, ry: 147 };
const PLANE = { from: 430, to: 652 };

/**
 * Two images, and the thing between them.
 *
 * Kept separate rather than composited: one picture of a plane cut into a
 * render says less than watching the plane arrive and the slice resolve as it
 * lands. The reveal is driven by scroll position, so it can be scrubbed back
 * and forth rather than firing once and being gone.
 */
function LocaliserFigure() {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [p, setP] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) { setP(1); return undefined; }
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      /* Runs from the figure's top reaching three-quarters down the viewport
         to its middle reaching the middle — a little under one screen of
         scrolling, which is about one comfortable flick. */
      const start = window.innerHeight * 0.78;
      const end = window.innerHeight * 0.34;
      const t = (start - r.top) / (start - end);
      setP(Math.max(0, Math.min(1, t)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* NO TITLE, NO HINT, NO CAPTION, on NaviNetics' instruction 2026-10-21.
     What came off: the title 'The localizer, and the slice it produces', the
     'Scroll' hint, and the caption 'The rods cross every axial plane at nine
     points. Where those nine points land in the image is what ties the picture
     to the frame - which is how a target seen on a scan becomes three numbers
     on an instrument.'

     The scroll-driven behaviour is KEPT: the plane still descends and the
     slice still resolves as you scroll past. Only the word that advertised it
     is gone, so the figure now animates without announcing that it will. */
  const ease = (v) => v * v * (3 - 2 * v);
  const drop = ease(Math.min(1, p / 0.62));                 // the plane arriving
  const cy = PLANE.from + (PLANE.to - PLANE.from) * drop;

  return (
    <Figure>
      {/* Both panels take the render's aspect so they end up the same size.
          The render fills its box exactly, which is what keeps the plane
          overlay aligned to it; the slice is nearly square, so it sits
          letterboxed on the same dark ground and the bars do not show. */}
      {/* Narrowed on instruction 2026-10-21: the pair used to fill the card's
          full width. max-w-2xl keeps both panels on one row and simply makes
          them smaller. */}
      <div ref={ref} className="mx-auto grid max-w-[740px] items-start gap-5 sm:grid-cols-2">
        <div className="relative aspect-[1399/1124] overflow-hidden rounded-md bg-nn-950">
          <img
            src={localiserSrc}
            alt="A stereotactic localizer mounted around a head phantom, its rods carrying detected fiducial points."
            loading="lazy" width="1399" height="1124"
            className="block h-full w-full object-cover"
          />
          {/* the plane, in the render's own coordinates */}
          <svg
            viewBox="0 0 1399 1124" className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <ellipse
              cx={RING.cx} cy={cy} rx={RING.rx} ry={RING.ry}
              /* A fixed light blue and a heavier line. The render is dark in
                 both themes, so the theme's action colour went low-contrast on
                 it, and at strokeWidth 4 the plane was a hairline at card size. */
              fill="none" stroke="#82bad9" strokeWidth="10"
              opacity={0.35 + drop * 0.55}
            />
            <ellipse
              cx={RING.cx} cy={cy} rx={RING.rx} ry={RING.ry}
              fill="#82bad9" opacity={0.06 + drop * 0.08}
            />
          </svg>
        </div>

        <div className="aspect-[1399/1124] overflow-hidden rounded-md bg-nn-950">
          <img
            src={sliceSrc}
            alt="The axial CT slice at that plane, with the nine localizer fiducials around the skull."
            loading="lazy" width="1280" height="1260"
            className="block h-full w-full object-contain"
            /* No fade or blur-in - 2026-10-27. For the first half of the scroll
               the slice sat at opacity 0.12 behind a 7px blur: a navy box with a
               faint oval, which reads as an image failing to load rather than as
               a slice resolving. The plane still descends on the render beside
               it; the slice is simply always readable. */
          />
        </div>
      </div>
    </Figure>
  );
}

/* ══ 02 · the instrument itself ═════════════════════════════════════════ */

/**
 * The frame turntable.
 *
 * `preload="none"` and a poster, so a visitor who never reaches this topic
 * never fetches the video at all; it starts when it comes into view and stops
 * when it leaves, which also keeps a decode off the main thread while someone
 * is reading three screens further down.
 */
function FrameVideo() {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  /* A pause the visitor chose survives scrolling away and back. The in-view
     watcher below called el.play() every time the video came back into view,
     so Pause only lasted until the next scroll - which undoes the one control
     auto-playing video is required to give (WCAG 2.2.2). */
  const userPaused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!userPaused.current) el.play().then(() => setPlaying(true)).catch(() => {});
        }
        else { el.pause(); setPlaying(false); }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    userPaused.current = !el.paused;
    if (el.paused) el.play().then(() => setPlaying(true)).catch(() => {});
    else { el.pause(); setPlaying(false); }
  };

  return (
    <Figure
      /* 'The instrument, turned' on NaviNetics' instruction 2026-10-21. The
         hint ('A render, not a photograph') and the caption ('Arc, collar,
         instrument carrier and a probe on its trajectory. The head is a model
         - the amber is there so the probe can be seen going where it goes.')
         came off with it.

         RAISED AND DECIDED. The hint was the only thing on the page telling a
         reader this is a render rather than footage of a real device, and the
         figure now carries the product's name instead. That was put to
         NaviNetics on 2026-10-26 with the option of restoring the note, and
         they chose to leave it off. Recorded here because the page is inside
         Keystone Regulatory's review scope and this is the kind of thing an
         FDA inspector with a screenshot would ask about. */
      title="NRSS"
    >
      {/* Narrowed to max-w-2xl on 2026-10-21, then widened again on 2026-10-26
          to match the arc diagram above it: the two figures belong to the same
          subsection and reading at different widths made them look unrelated. */}
      {/* The same 740px column as the arc diagram above and the localizer
          pair in subsection A, so the three figures under "Stereotactic
          Neurosurgery" share one width. Uncapped, this filled the card: at
          1440 it was 1238x696, close to twice either of the other two. */}
      <div className="relative mx-auto max-w-[740px] overflow-hidden rounded-md bg-white">
        <video
          ref={ref}
          src={frameVideo}
          poster={framePoster}
          muted
          loop
          playsInline
          preload="none"
          width="1280"
          height="720"
          aria-label="The stereotactic frame on a head model, turning, with a probe on its trajectory."
          className="block w-full"
        />
        <button
          type="button"
          onClick={toggle}
          /* No aria-pressed. The label already changes between Play and Pause,
             and announcing it as a toggle that is "pressed" while playing as
             well made a screen reader say both. */
          className="eyebrow absolute bottom-3 right-3 rounded-full border border-hairline bg-surface px-3 py-1.5 text-ink-2 transition-colors hover:text-action"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
    </Figure>
  );
}

const FIGURES = {
  dbs: DbsFigure,
  frame: FrameVideo,
  arc: ArcFigure,
  localizer: LocaliserFigure,
  redox: RedoxFigure,
  fscv: FscvFigure,
  compare: CompareFigure,
};

export function EduFigure({ name }) {
  const F = FIGURES[name];
  return F ? <F /> : null;
}
