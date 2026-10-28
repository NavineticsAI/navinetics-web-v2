import { useEffect, useRef, useState } from 'react';
import { art, channels, domains, expansion } from '../data/maven.js';
import { GROUND, R, VIEW, arcFlipped, arcPath, makeField, pt, sideOf, wirePath } from '../lib/mavenScene.js';
import { usePrefersReducedMotion } from '../lib/motion.js';
import { Eyebrow } from './Section.jsx';

/**
 * The MAVEN opening.
 *
 * The instrument sits in a ring of everything it is wired to, on a field that
 * is a voltammogram in all but the labels. The header is taller than the
 * viewport and the layer inside it is sticky, so the whole sequence is paid
 * for with ordinary scrolling — nothing is captured.
 *
 * What the scroll drives, in order:
 *
 *   the ring unwinds from three-quarters of a turn and stops
 *   the copy leaves, because the ring is about to need the room
 *   the wires draw outward and straighten as they go
 *   the channels arrive and are named
 *   the field's noise falls away and its peaks come up
 *
 * ONE LOOP, NO REACT STATE. Everything above is written straight onto the DOM
 * from a single requestAnimationFrame — `d`, `transform` and `opacity` are
 * never JSX props, so a re-render cannot clobber a frame. The only state on
 * the whole component is which channel the pointer is over, which changes at
 * human rate.
 *
 * THE BAY IS DARK IN BOTH THEMES. The unit's artwork is a white cutout and the
 * field is a full-luminance color scale; on a pale ground the first vanishes
 * and the second shouts. This is a lit object on a bench, the same call the
 * workstation on /technology/navinetics-ai makes.
 */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (v, a, b) => clamp01((v - a) / (b - a));
const outQuint = (t) => 1 - (1 - t) ** 5;
const outCubic = (t) => 1 - (1 - t) ** 3;

export function MavenHero({ product }) {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(null);

  const hostRef = useRef(null);
  const fieldRef = useRef(null);
  const stageRef = useRef(null);
  const stampRef = useRef(null);
  const asmRef = useRef(null);
  const deviceRef = useRef(null);
  const copyRef = useRef(null);
  const cueRef = useRef(null);
  const wireRefs = useRef([]);
  const dotRefs = useRef([]);
  const nodeRefs = useRef([]);
  const labelRefs = useRef([]);

  useEffect(() => {
    const host = hostRef.current;
    const cv = fieldRef.current;
    if (!host || !cv) return undefined;

    const ctx = cv.getContext('2d');
    const drawField = makeField(GROUND);
    let w = 0;
    let h = 0;
    let unit = 1; // viewBox units → CSS pixels
    let travel = 1;
    let hostTop = 0;
    /* Below lg the channel names are not rendered, and the copy has to share
       one screen with the ring instead of sitting beside it. So on a narrow
       screen the ring starts smaller, lower and much fainter — a texture
       behind the headline rather than an object competing with it. */
    let narrow = false;
    let raf = 0;
    let t0 = null;
    let lastTheta = 0;
    let visible = true;
    const MIN_DT = 1000 / 30;
    let lastPaint = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* offsetWidth, not getBoundingClientRect: the stage carries a CSS scale
         and the rect would come back already scaled, which would then be
         applied a second time to every node position. */
      unit = (stageRef.current?.offsetWidth || VIEW.w) / VIEW.w;
      narrow = window.innerWidth < 1024;
      hostTop = host.offsetTop;
      travel = Math.max(1, host.offsetHeight - window.innerHeight);
    };

    /**
     * Paint one frame.
     *
     * `p` is how far through the header we are, `t` is seconds since the first
     * frame. Called from the loop, and once directly when the visitor has
     * asked for reduced motion — with both arguments already at rest, which is
     * why nothing here reads a clock of its own.
     */
    const paint = (p, t) => {
      const settle = outQuint(span(p, 0, 0.62));
      /* The load spin. Two extra turns that ease out over the first couple of
         seconds, so the ring is already in motion when the page arrives rather
         than waiting to be scrolled at. */
      const intro = 1 - outQuint(clamp01((t - 0.15) / 1.9));
      const theta = (300 + 640 * intro) * (1 - settle);
      /* Seven degrees left in at rest. A wire that unwinds to dead straight
         reads as a leader line pointing at a label; a wire that keeps a bend
         reads as a cable, which is what it is. */
      const swing = 7 + 22 * (1 - settle);

      if (asmRef.current) {
        /* Blur from measured angular speed rather than from progress: the same
           number then covers the load spin and the scrub, and a fast flick of
           the wheel smears exactly as much as it should. */
        const speed = Math.abs(theta - lastTheta);
        lastTheta = theta;
        asmRef.current.style.transform = `rotate(${theta.toFixed(2)}deg)`;
        asmRef.current.style.filter = speed > 0.4 ? `blur(${Math.min(5, speed * 0.09).toFixed(2)}px)` : 'none';
      }

      channels.forEach((c, i) => {
        const drawn = span(p, 0.24 + i * 0.026, 0.6 + i * 0.026);
        const named = span(p, 0.58 + i * 0.02, 0.8 + i * 0.02);

        const wire = wireRefs.current[i];
        if (wire) {
          wire.setAttribute('d', wirePath(c.deg, swing));
          wire.style.strokeDashoffset = String(1 - drawn);
        }
        const dot = dotRefs.current[i];
        if (dot) {
          const k = outCubic(span(drawn, 0.8, 1));
          const [x, y] = pt(R.node, c.deg);
          dot.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${k.toFixed(3)})`);
        }
        /* The hit target follows the node round, so it is over the dot during
           the spin as well as after it. */
        const node = nodeRefs.current[i];
        if (node) {
          const [x, y] = pt(R.node * unit, c.deg + theta);
          node.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
          node.style.opacity = String(drawn > 0.85 ? 1 : 0);
          node.style.pointerEvents = drawn > 0.85 ? 'auto' : 'none';
          // Same reason as the globe pins: pointer-events does not remove a
          // button from the tab order, and these are buttons at opacity 0.
          node.style.visibility = drawn > 0.85 ? 'visible' : 'hidden';
        }
        const label = labelRefs.current[i];
        if (label) {
          label.style.opacity = String(named);
          label.style.transform = `translateX(${((1 - named) * (sideOf(c.deg) === 'right' ? 10 : -10)).toFixed(1)}px)`;
        }
      });

      /* Under reduced motion the copy and the ring are stacked in ordinary
         flow rather than layered, so neither of the two handoff writes below
         applies — and the copy fade in particular MUST NOT run: at p = 1 it
         resolves to opacity 0, which would hide the headline outright. */
      if (stageRef.current && !reduced) {
        /* The centering is Tailwind's `translate: -50% -50%`, a separate
           property from `transform`, so writing transform here composes with
           it instead of destroying it. The shift right is what keeps the ring
           clear of the headline while the headline is still there. */
        const rest = 1 - settle;
        /* Unsettled it is BIGGER than at rest, not smaller: the opening should
           arrive as an object close to the glass that draws back into its ring,
           which is the opposite of the usual grow-into-place and reads far
           better against a headline. */
        const s = (narrow ? 0.92 : 1.14) - (narrow ? -0.08 : 0.14) * settle;
        /* 15 -> 33. At 15 the ring settled 107px right of the viewport
           centre, which left the composition hugging the left: a 73px margin
           on one side and 360px of dead space on the other, with the heading
           almost touching the Neurochemistry arc.

           33% of the stage width centres the art in the space to the RIGHT of
           the copy column rather than in the viewport, which is what this
           layout actually is - a text column and an object beside it. Checked
           at 1440 and 1280: the gap between the heading and the ring and the
           margin outside the ring come out within ~5px of each other at both,
           because the copy column is a fixed max-w-xl and the stage is capped
           at 760px, so the two scale together. */
        const dx = narrow ? 0 : 33 * rest;
        /* Settled, the ring rides up to leave the foot of the screen for the
           four domains — the point of the whole opening is that the instrument
           and what it covers are legible at once, without scrolling. */
        const dy = narrow ? 26 * rest - 13 * settle : -7 * settle;
        stageRef.current.style.transform =
          `translate(${dx.toFixed(1)}%, ${dy.toFixed(1)}%) scale(${s.toFixed(3)})`;
        stageRef.current.style.opacity = String((narrow ? 0.34 : 0.62) + (narrow ? 0.66 : 0.38) * settle);

        /* THE STAMP TRACKS THE RING. It is positioned against the section, not
           against the stage, so it sat at the viewport centre while the stage
           translated away from it - at dx 15 that was tolerable, at 33 the
           label ended up under the gap between the heading and the ring
           instead of under the instrument it labels.
           `dx` is a percentage of the stage's own width, so it is converted
           here rather than guessed.

           `translate`, NOT `transform`. Tailwind v4's -translate-x-1/2 sets
           the standalone CSS `translate` property, which composes with
           `transform` rather than being replaced by it. Writing the offset to
           `transform` therefore applied the -50% centring twice - once from the
           class, once from here - and left the stamp exactly half its own width
           (108px) left of the instrument at every viewport. Writing to
           `translate` overrides the class's value instead of stacking on it,
           and the class still centres the stamp before this first runs. */
        if (stampRef.current) {
          const px = (dx / 100) * stageRef.current.offsetWidth;
          stampRef.current.style.translate = `calc(-50% + ${px.toFixed(1)}px) 0`;
        }
      }
      if (deviceRef.current) {
        const k = 1 - span(p, 0, 0.5);
        deviceRef.current.style.transform =
          `translate(-50%, -50%) perspective(1400px) rotateY(${(-15 * k).toFixed(2)}deg)`
          + ` rotateX(${(5 * k).toFixed(2)}deg) scale(${(1 - 0.08 * k).toFixed(3)})`;
        deviceRef.current.style.opacity = String(outCubic(clamp01((t - 0.1) / 0.9)));
      }
      if (copyRef.current && !reduced) {
        const out = span(p, 0.08, 0.34);
        copyRef.current.style.opacity = String(1 - out);
        copyRef.current.style.transform = `translateY(${(-72 * out).toFixed(1)}px)`;
      }
      if (cueRef.current) cueRef.current.style.opacity = String(1 - span(p, 0.02, 0.18));

      if (visible) drawField(ctx, w, h, t, settle);
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (t0 === null) t0 = now;

      /* Do nothing while the opening is off screen.
         ───────────────────────────────────────────────────────────────────
         `visible` used to guard only the canvas, one line inside paint().
         Everything above it — ten style writes across five elements — ran
         every frame for as long as the page was open, including the whole way
         down a long page where none of it can be seen. Each write dirties
         style and layout, and that cost lands on the same thread the blocks
         below need in order to appear. */
      if (!visible || document.hidden) return;

      /* Capped at 30fps. This loop was uncapped, so on a 120Hz phone it
         repainted the voltammogram field and rewrote ten style properties a
         hundred and twenty times a second. The field is a slow diffusion and
         the ring is a slow unwind; neither resolves above 30. Measured at
         98.7% of a throttled CPU before this cap. */
      if (now - lastPaint < MIN_DT) return;
      lastPaint = now;

      const p = clamp01((window.scrollY - hostTop) / travel);
      paint(p, (now - t0) / 1000);
    };

    size();
    if (reduced) {
      // At rest: wires drawn, channels named, field settled, nothing moving.
      paint(1, 4);
    } else {
      raf = requestAnimationFrame(frame);
    }

    /* A margin, because the loop now stops entirely when this goes false. With
       no margin the observer flips exactly as the edge crosses, and scrolling
       back up can show one stale frame before the next lands. */
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; },
      { rootMargin: '150px' });
    io.observe(host);
    const onResize = () => { size(); if (reduced) paint(1, 4); };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [reduced]);

  return (
    <header
      ref={hostRef}
      className="relative bg-[var(--mv-bay)] text-nn-50"
      style={reduced ? undefined : { height: 'calc(100svh + 120vh)' }}
    >
      {/* Layered and pinned normally; stacked and in flow when motion is
          reduced, because there is no handoff to make and both halves have to
          be legible at once. */}
      <div
        className={
          reduced
            /* flex-col-REVERSE: the source order is stage then copy, which is
               the stacking order the layered version needs. Reversing here
               puts the words above the picture without moving either. */
            ? 'relative flex flex-col-reverse gap-14 overflow-hidden px-6 pb-20 pt-32 lg:px-8'
            : 'sticky top-0 h-[100svh] overflow-hidden'
        }
      >
        <canvas ref={fieldRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        {/* Keeps the headline readable over whatever the field is doing, and
            drops the corners so the ring reads as lit from the middle. */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              /* The last band closes the seam. At the end of the scroll the
                 sticky layer's bottom edge IS the join to the next section, so
                 the field has to be gone by the time it gets there. */
              'linear-gradient(to bottom, transparent 76%, var(--mv-bay) 99%),'
              + 'radial-gradient(120% 90% at 52% 48%, rgb(3 16 26/.1) 0%, rgb(3 16 26/.82) 74%),'
              + 'linear-gradient(98deg, rgb(3 16 26/.9) 0%, rgb(3 16 26/.6) 26%,'
              + 'rgb(3 16 26/.06) 52%, rgb(3 16 26/.4) 100%)',
          }}
        />

        {/* PRE-CLINICAL RESEARCH, on the ring itself.
            ─────────────────────────────────────────────────────────────
            NaviNetics asked for a stamp here. It earns its place beyond the
            instruction: this hero looks like a cleared clinical instrument,
            and a screenshot of it passed on without context could be taken
            for one. The page states the status in prose further down, but a
            reader who only sees the ring never gets there.

            Set as a typographic stamp rather than a badge or seal — the same
            reasoning as the regulatory line on the NRSS page: a seal implies
            an approval that has not been granted. This one carries no
            regulatory meaning at all, which is exactly the point. */}
        <div
          ref={stampRef}
          /* Under the ring, not above it — at the top of the section it sat
             behind the fixed navbar and was unreadable. Here it reads as a
             label on the instrument, which is what it is.
             The -translate-x-1/2 is the resting position; the scroll handler
             replaces it with the same offset the stage carries, so the stamp
             stays under the instrument. */
          className="pointer-events-none absolute left-1/2 top-[78%] z-[3] -translate-x-1/2
            whitespace-nowrap rounded-instr border border-sg-300/30 bg-nn-950/55 px-3 py-1.5 backdrop-blur-sm
            sm:top-[80%]"
        >
          <span className="font-data text-[0.6875rem] uppercase tracking-[0.16em] text-sg-300">
            {/* "For preclinical research" - 2026-10-22 asked for the FOR (the stamp
                says what the instrument is for rather than labelling it), and
                2026-10-27 settled the spelling: one word, no hyphen, as on the
                home card ("For preclinical research only") and as FDA and the
                cited papers write it. The site had spelled it both ways.
                Rendered uppercase by the class above. */}
            For preclinical research
          </span>
        </div>

        {/* ── the assembly ─────────────────────────────────────────────── */}
        <div
          ref={stageRef}
          className={
            reduced
              ? 'relative mx-auto'
              : 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          }
          style={{
            /* BACK TO 84svh. It was 70 "because the four domains sit under
               the ring on the same screen, and they need the room" - and that
               strip was withdrawn on 2026-10-22, which left the foot of the
               hero empty. The instrument now fills the space the cards used to
               occupy. If the strip is ever restored, this goes back to 70. */
            width: reduced ? 'min(660px, 100%)' : 'min(84svh, 760px, 92vw)',
            aspectRatio: '1 / 1',
          }}
        >
          {/* What the unit stands on, now that the render's own slab has been
              keyed off — see tools/maven-art.mjs. A shadow rather than a
              surface: it grounds the object without putting a lit plane in a
              ring that has no floor. */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
            aria-hidden="true"
            style={{
              top: '66.5%',
              width: '34%',
              height: '10%',
              background: 'radial-gradient(closest-side, rgb(0 0 0/.7), rgb(0 0 0/0) 78%)',
            }}
          />
          <svg
            viewBox={`${-VIEW.w / 2} ${-VIEW.h / 2} ${VIEW.w} ${VIEW.h}`}
            className="absolute inset-0 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <g ref={asmRef}>
              {/* The circle the unit sits in — a complete one, so the four
                  domain arcs read as segments of a ring rather than as four
                  unrelated strokes. */}
              <circle r={R.bezel} fill="none" stroke="var(--mv-rule)" strokeWidth="1" />
              <circle r={R.arc} fill="none" stroke="var(--mv-rule-2)" strokeWidth="1" />
              {/* graduations, every four degrees — the instrument register the
                  rest of the site sets its rules in */}
              <circle
                r={(R.bezel + R.arc) / 2}
                fill="none"
                stroke="var(--mv-rule)"
                strokeWidth={R.arc - R.bezel}
                strokeDasharray="1 13.1"
                opacity="0.45"
              />

              {domains.map((d) => (
                <g key={d.id}>
                  <path
                    d={arcPath(R.arc, d.a0, d.a1)}
                    fill="none"
                    stroke={`var(--mv-${d.tone})`}
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <path id={`mv-eng-${d.id}`} d={arcPath(R.engrave, d.a0, d.a1, arcFlipped(d.a0, d.a1))} fill="none" />
                  <text
                    fill={`var(--mv-${d.tone})`}
                    fontSize="14"
                    letterSpacing="2.2"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase' }}
                  >
                    <textPath href={`#mv-eng-${d.id}`} startOffset="50%" textAnchor="middle">
                      {d.name.toUpperCase()}
                    </textPath>
                  </text>
                </g>
              ))}

              {channels.map((c, i) => (
                <path
                  key={c.id}
                  ref={(el) => { wireRefs.current[i] = el; }}
                  data-ch={c.id}
                  fill="none"
                  stroke={`var(--mv-${domains.find((d) => d.id === c.domain).tone})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  pathLength="1"
                  strokeDasharray="1 1"
                  className="transition-opacity duration-300"
                  opacity={active && active !== c.id ? 0.26 : 1}
                />
              ))}
              {channels.map((c, i) => (
                <g key={c.id} ref={(el) => { dotRefs.current[i] = el; }}>
                  <circle
                    r="6"
                    fill={`var(--mv-${domains.find((d) => d.id === c.domain).tone})`}
                    stroke="var(--mv-bay)"
                    strokeWidth="3"
                  />
                </g>
              ))}
            </g>
          </svg>

          {/* The unit. A DOM image rather than an SVG one so it can take a real
              perspective transform, and so it is never rasterized at the
              viewBox's scale. */}
          <img
            ref={deviceRef}
            src={art.device}
            alt={art.deviceAlt}
            width={art.deviceNative.w}
            height={art.deviceNative.h}
            className="absolute left-1/2 top-1/2 max-w-none opacity-0"
            style={{
              height: `${(R.deviceH / VIEW.h) * 100}%`,
              width: 'auto',
              filter: 'drop-shadow(0 18px 26px rgb(0 0 0 / 0.55))',
            }}
          />

          {/* ── the channels ───────────────────────────────────────────────
              Real buttons over the ring. Hidden below lg: at that width the
              names cannot be set beside the dots without stacking on top of
              each other, and the grouped list further down the page says the
              same thing with room to breathe. */}
          {channels.map((c, i) => {
            const side = sideOf(c.deg);
            const tone = domains.find((d) => d.id === c.domain).tone;
            return (
              <button
                key={c.id}
                type="button"
                ref={(el) => { nodeRefs.current[i] = el; }}
                className="nn-mv-node left-1/2 top-1/2 hidden opacity-0 lg:block"
                style={{ '--nc': `var(--mv-${tone})` }}
                aria-pressed={active === c.id}
                onPointerEnter={() => setActive(c.id)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(c.id)}
                onBlur={() => setActive(null)}
                onClick={() => setActive((v) => (v === c.id ? null : c.id))}
              >
                <span
                  ref={(el) => { labelRefs.current[i] = el; }}
                  className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-left opacity-0 ${
                    side === 'right' ? 'left-full pl-3' : 'right-full pr-3 text-right'
                  }`}
                >
                  <span className="block text-[0.9375rem] font-semibold tracking-[-0.02em] text-nn-50">
                    {c.short}
                  </span>
                  {/* The abbreviation under the name — DA, 5-HT, LFP — was
                      here. Withdrawn 2026-10-21; `sub` is off the channel
                      records in data/maven.js, where the reasoning is. */}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── the copy ─────────────────────────────────────────────────────
            Leaves as the ring takes the stage. It stays in the document the
            whole time — this is opacity, not a mount. */}
        <div
          ref={copyRef}
          className={
            reduced
              ? 'relative'
              : 'pointer-events-none absolute inset-x-0 top-0 px-6 pt-32 lg:px-8 lg:pt-36'
          }
        >
          <div className="nn-frame mx-auto w-full">
            <div className={reduced ? 'max-w-2xl' : 'max-w-lg'}>
              <Eyebrow className="!text-sg-300">{`Products — ${product.shortName}`}</Eyebrow>
              {/* THE ACROSTIC IS THE TITLE.
                  ---------------------------------------------------------
                  `expansion` in data/maven.js is five entries for a five-letter
                  acronym, so set one line per entry the coloured capitals read
                  M A V E N straight down the left edge - the heading spells the
                  product while expanding it.

                  There is no separate "MAVEN" above it. There was, briefly, on
                  2026-10-26, and NaviNetics took it out as repetitive: the
                  eyebrow already says "Products - MAVEN" and the initials spell
                  it, so a third MAVEN in 64px said nothing the page had not.
                  The name is still the first thing in the heading for anyone
                  who is not looking at it - the visually hidden "MAVEN: " means
                  a screen reader and a search engine read "MAVEN: Multifunctional
                  Apparatus for Voltammetry, Electrophysiology and
                  Neuromodulation."

                  SIZE: AS LARGE AS FITS BESIDE THE RING, NOT A SCALE STEP. The
                  band headings below are text-d1 (64px at 1440), and that is
                  the size this was asked to match. It cannot reach it here:
                  each line has to start on its capital, so "Electrophysiology
                  and" can never wrap, and at 64px/600 that one line is 618px -
                  past the ring's left edge at 1280 and below. 4.25vw is the
                  largest fluid size that clears the ring by about 50px at 1024,
                  1280 and 1440 alike (measured 2026-10-26), which puts it at
                  about 61px on a 1440 screen against the bands' 64. The 1.75rem
                  floor keeps that line inside the 327px phone column. Weight
                  600 matches the bands; the capitals differ by colour alone. */}
              <h1 className="mt-5 text-[clamp(1.75rem,4.25vw,3.8rem)] font-semibold leading-[1.1]
                !tracking-[-0.04em] text-nn-50">
                <span className="sr-only">{product.shortName}: </span>
                {/* whitespace-nowrap: a line must never wrap, or the capital
                    that starts the next row is no longer a capital. At 1280 and
                    up "Electrophysiology and" is wider than the 512px copy
                    column and broke as "Electrophysiology / and", so the
                    initials read M-A-V-E-a-N - shipped in 3f6c9bc and caught by
                    the animation audit. Held to one row, it runs past the
                    column into the space before the ring, which it clears. */}
                {expansion.map(([cap, rest], i) => (
                  <span key={cap + rest} className="block whitespace-nowrap">
                    <span className="text-sg-300">{cap}</span>
                    {rest}
                    {i === expansion.length - 1 ? '.' : ''}
                  </span>
                ))}
              </h1>
              {/* Held to the copy column (max-w-lg, set on the wrapper above)
                  rather than max-w-prose: at prose width the second line ran
                  out past the acrostic and finished against the green
                  Neurochemistry arc. text-wrap: pretty stops "it." being left
                  alone on the last line at 1440. */}
              {/* min(32rem, 42vw), not a fixed max-w-lg. The title above
                  scales with the viewport, so its longest line shrinks toward
                  1024; this paragraph did not, and at 1024 its first line ran
                  "...and its electrical" into the green Neurochemistry arc.
                  42vw keeps it inside the title's measure all the way down to
                  lg, and the 32rem cap is the old width from about 1220 up. */}
              <p className="mt-6 lg:max-w-[min(32rem,42vw)] text-lead leading-[1.55] tracking-[-0.015em] text-nn-200 [text-wrap:pretty]">
                A research platform that reads the brain&rsquo;s chemistry and its electrical
                activity at the same instant, while stimulating it.
              </p>
              {/* THE TECHNIQUE PILLS ARE GONE — FSCV, MCSWV and Amperometry,
                  set as three small capsules under the paragraph. Withdrawn
                  2026-10-21. `modes` is still exported from data/maven.js and
                  the first two are named in full in the Neurochemistry band's
                  points, so nothing is lost by taking the abbreviations off
                  the opening. */}
            </div>
          </div>
        </div>

        {/* THE FOUR DOMAIN CARDS ARE WITHDRAWN - off on NaviNetics'
            instruction 2026-10-22. The strip under the ring carried the four
            domain names, each with its colored dot and its channel list:

              Neurochemistry       Dopamine / Serotonin / Adenosine / Other neurochemicals
              Electrophysiology    LFP / Single-unit
              Software & analysis  Intuitive GUI / Advanced analysis
              Neuromodulation      Electrical stimulation

            (their one-line descriptions had already gone on 2026-10-21.)

            WHAT THIS COSTS, because the original note is worth repeating:
            below the lg breakpoint the ring carries NO names of its own, so
            this strip was the only place the four domains and their channels
            were written down. On a phone the opening is now an unlabelled
            instrument in an unlabelled ring. The names return at lg, set
            around the rim, where they can only be read a word at a time.

            ALSO: the ring is sized min(70svh, 760px, 92vw) rather than 84svh
            specifically to leave this strip room - see the note on stageRef's
            style below. With the strip gone that reasoning no longer holds and
            the foot of the hero is now empty. Raising it back is a one-value
            change, and it is a visual decision rather than this file's.

            `domains` is still imported - the ring's own rim labels, wires and
            tones all read from it. `channelsIn` was used only here. */}

        {!reduced && (
          <div
            ref={cueRef}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col
              items-center gap-2 font-data text-[0.625rem] uppercase tracking-[0.18em] text-ink-3"
          >
            Scroll
            <span className="nn-drop block h-7 w-px bg-gradient-to-b from-transparent to-ink-3" />
          </div>
        )}
      </div>
    </header>
  );
}
