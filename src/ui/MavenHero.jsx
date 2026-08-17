import { useEffect, useRef, useState } from 'react';
import { art, channels, channelsIn, domains, expansion, modes } from '../data/maven.js';
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
  const asmRef = useRef(null);
  const deviceRef = useRef(null);
  const copyRef = useRef(null);
  const cueRef = useRef(null);
  const stripRef = useRef(null);
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
        const dx = narrow ? 0 : 15 * rest;
        /* Settled, the ring rides up to leave the foot of the screen for the
           four domains — the point of the whole opening is that the instrument
           and what it covers are legible at once, without scrolling. */
        const dy = narrow ? 26 * rest - 13 * settle : -7 * settle;
        stageRef.current.style.transform =
          `translate(${dx.toFixed(1)}%, ${dy.toFixed(1)}%) scale(${s.toFixed(3)})`;
        stageRef.current.style.opacity = String((narrow ? 0.34 : 0.62) + (narrow ? 0.66 : 0.38) * settle);
      }
      if (stripRef.current) {
        const on = span(p, 0.62, 0.86);
        stripRef.current.style.opacity = String(reduced ? 1 : on);
        stripRef.current.style.transform = `translateY(${((1 - (reduced ? 1 : on)) * 16).toFixed(1)}px)`;
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

        {/* ── the assembly ─────────────────────────────────────────────── */}
        <div
          ref={stageRef}
          className={
            reduced
              ? 'relative mx-auto'
              : 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          }
          style={{
            /* 70svh, not 84: the four domains sit under the ring on the same
               screen, and they need the room. */
            width: reduced ? 'min(660px, 100%)' : 'min(70svh, 760px, 92vw)',
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
                  {c.sub && (
                    <span className="block font-data text-[0.625rem] uppercase tracking-[0.14em] text-ink-3">
                      {c.sub}
                    </span>
                  )}
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
              <h1 className="mt-5 whitespace-pre-line text-d1 !tracking-[-0.045em]">{product.tagline}</h1>
              {/* The name is an acronym and the deck expands it, so the page
                  does too — the initial of each word set in the brand color,
                  which is the only place on the site type is coloured mid-word
                  and is worth it here because the word IS the product. */}
              <p className="mt-6 max-w-prose text-lead leading-[1.55] tracking-[-0.015em] text-nn-200">
                {expansion.map(([cap, rest]) => (
                  <span key={cap + rest}>
                    <b className="font-semibold text-sg-300">{cap}</b>
                    {rest}
                  </span>
                ))}
                . A research platform that reads the brain&rsquo;s chemistry and its electrical
                activity at the same instant, while stimulating it.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2">
                {modes.map((m) => (
                  <span
                    key={m}
                    className="rounded-instr bg-white/[0.06] px-2 py-1 font-data text-[0.625rem]
                      uppercase tracking-[0.14em] text-nn-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── the four domains ─────────────────────────────────────────────
            Arrives as the ring stops, on the same screen as the instrument it
            belongs to. The ring names them round its rim, where they can only
            be read a word at a time; this is the same four with room to say
            what each one is. */}
        <div
          ref={stripRef}
          className={
            reduced
              ? 'relative nn-frame mx-auto w-full'
              : 'absolute inset-x-0 bottom-0 px-6 pb-9 opacity-0 lg:px-8'
          }
        >
          {/* Two columns before lg and four after. Below lg the ring carries
              no names of its own, so this is the only place the four are
              written down — but the channel list under each has to go, or the
              strip grows tall enough to stand on the instrument. */}
          <div className="nn-frame mx-auto grid w-full grid-cols-2 gap-x-6 gap-y-4 border-t
            border-[var(--mv-rule-2)] pt-4 sm:gap-x-8 lg:grid-cols-4 lg:gap-y-5 lg:pt-5">
            {domains.map((d) => (
              <div key={d.id} className="flex flex-col gap-1.5">
                <span className="flex items-center gap-2">
                  <i
                    className="block h-1.5 w-1.5 shrink-0 rounded-full not-italic"
                    style={{ background: `var(--mv-${d.tone})` }}
                    aria-hidden="true"
                  />
                  <span
                    className="font-data text-[0.5625rem] uppercase tracking-[0.14em] lg:text-[0.625rem]
                      lg:tracking-[0.16em]"
                    style={{ color: `var(--mv-${d.tone})` }}
                  >
                    {d.name}
                  </span>
                </span>
                <p className="text-[0.75rem] leading-snug text-nn-200 lg:text-[0.8125rem]">{d.line}</p>
                <p className="hidden text-[0.6875rem] leading-snug text-ink-3 lg:block">
                  {channelsIn(d.id).map((c) => c.short).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </div>

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
