import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../lib/motion.js';
import { worldDots } from '../data/worldDots.js';
import { HOME } from '../data/partners.js';
import { decodeDots, drawGlobe, drawRoute, project, unit } from '../lib/globeScene.js';

/**
 * The partners globe.
 *
 * Dots are real geography — Natural Earth country polygons, baked to an
 * equal-area grid by tools/world-dots.mjs and shipped as ~1.3 kB gzipped. That
 * is smaller than the request a map library would make before drawing anything,
 * and it means territory membership is already in the data, which is what lets
 * a country light up as its own shape.
 *
 * Everything you can click is a real <button> positioned over the canvas rather
 * than a shape hit-tested inside it, so the whole thing works from a keyboard
 * and reads correctly to a screen reader. The list underneath the globe carries
 * the same records for anyone who would rather not spin a sphere at all.
 */

const DOTS = decodeDots(worldDots);
const HOME_V = unit(HOME.lat, HOME.lon);
const SPIN = 3.1;          // degrees per second, ~two minutes for a full turn
const BEAD_PERIOD = 2600;  // ms for one pass of the route marker

/**
 * The globe's colours.
 *
 * Every token read here is theme-independent — the globe is a lit sphere in
 * both themes — so `--terr-*-lit` rather than `--terr-*`, which stays
 * theme-aware for the ledger further down the page. See :root in index.css.
 *
 * The observer stays anyway, and deliberately. It watches the `data-theme`
 * attribute rather than the value from useTheme(): ThemeProvider writes that
 * attribute from an effect of its own, and a parent's effect runs AFTER its
 * children's, so reading on the context change samples the OUTGOING theme's
 * colours — and because the dependency never fires again, keeps them for good.
 * Measured when this component had that bug: one toggle later the tokens read
 * #03121b and the canvas was still painting #d2e1ea. Nothing here is
 * theme-dependent today, so the observer is currently a no-op; it is four
 * lines of insurance against the day one of these tokens becomes theme-aware
 * again and nobody remembers this happened.
 */
function usePalette(ids) {
  const [pal, setPal] = useState(null);
  useEffect(() => {
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const v = (n) => s.getPropertyValue(n).trim();
      setPal({
        sky1: v('--globe-sky-1'),
        sky2: v('--globe-sky-2'),
        rim: v('--globe-rim'),
        land: v('--globe-land'),
        ghost: v('--globe-ghost'),
        grid: v('--globe-grid'),
        action: v('--action'),
        terr: Object.fromEntries(ids.map((id) => [id, v(`--terr-${id}-lit`)])),
      });
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, [ids]);
  return pal;
}

export function PartnerGlobe({ territories, selected, onSelect }) {
  const reduced = usePrefersReducedMotion();
  const ids = useMemo(() => territories.map((t) => t.id), [territories]);
  const pal = usePalette(ids);

  const canvasRef = useRef(null);
  const pins = useRef(new Map());
  const sites = useRef(new Map());
  const chips = useRef(new Map());

  /* Anchors and site markers as unit vectors, computed once. */
  const anchors = useMemo(
    () => Object.fromEntries(territories.map((t) => [t.id, unit(t.anchor[0], t.anchor[1])])),
    [territories],
  );
  const siteVecs = useMemo(
    () => Object.fromEntries(
      territories.map((t) => [t.id, (t.sites ?? []).map((s) => unit(s[0], s[1]))]),
    ),
    [territories],
  );

  /* Scene state lives in a ref: it changes sixty times a second and none of it
     belongs in React's render path. Only `selected` is state, because only
     `selected` changes what is on the page. */
  const sc = useRef({
    lon0: -40, lat0: 16, vel: 0, drag: null, tween: null,
    bias: 0, glow: {}, last: 0,
    view: { cx: 0, cy: 0, R: 200, w: 0, h: 0, wide: true },
  });
  const selRef = useRef(selected);
  selRef.current = selected;

  if (!Object.keys(sc.current.glow).length) {
    for (const id of ids) sc.current.glow[id] = 0;
  }

  /* Measured off the canvas itself, not off a parent. The canvas is inset-0
     inside the stage, so its box is the stage's box — and taking it from here
     means the component does not need a handle on an element it does not own. */
  const fit = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
    cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    /* Wide screens put the globe left of centre so the detail panel has room
       to open beside it. Narrow ones have no such room: the panel becomes a
       sheet and the globe slides up out from under it — see `bias` below. */
    const wide = r.width >= 900;
    const v = sc.current.view;
    v.w = r.width;
    v.h = r.height;
    v.wide = wide;
    v.cx = wide ? r.width * 0.4 : r.width * 0.5;
    v.cyBase = r.height * 0.5 + (wide ? 0 : 14); // clear of the mobile rail
    v.R = Math.min(wide ? r.width * 0.3 : r.width * 0.355, r.height * 0.4);
  }, []);

  useEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [fit]);

  /* Bring a territory round to face the viewer. */
  const easeTo = useCallback((id) => {
    const t = territories.find((x) => x.id === id);
    if (!t) return;
    const s = sc.current;
    const delta = ((t.anchor[1] - s.lon0 + 540) % 360) - 180;  // shortest way round
    s.tween = {
      u: 0,
      dur: reduced ? 0.001 : 0.9,
      lon: s.lon0,
      delta,
      lat: s.lat0,
      toLat: Math.max(-25, Math.min(45, t.anchor[0] * 0.55)),
    };
  }, [territories, reduced]);

  useEffect(() => {
    if (selected) easeTo(selected);
  }, [selected, easeTo]);

  /* ── The loop ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!pal) return undefined;
    const cv = canvasRef.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    let raf = 0;

    const place = (r) => {
      const { view } = sc.current;
      const sel = selRef.current;
      const placed = [];
      for (const t of territories) {
        const p = project(anchors[t.id], r, view);
        const front = p.z > 0.02;
        const colour = pal.terr[t.id];

        const pin = pins.current.get(t.id);
        if (pin) {
          pin.style.setProperty('--pc', colour);
          pin.style.left = `${p.x}px`;
          pin.style.top = `${p.y}px`;
          pin.style.opacity = front ? 1 : 0;
          pin.style.pointerEvents = front ? 'auto' : 'none';
        }
        (sites.current.get(t.id) ?? []).forEach((el, i) => {
          if (!el) return;
          const q = project(siteVecs[t.id][i], r, view);
          const vis = q.z > 0.02;
          el.style.setProperty('--pc', colour);
          el.style.left = `${q.x}px`;
          el.style.top = `${q.y}px`;
          el.style.opacity = vis ? 0.9 : 0;
          el.style.pointerEvents = vis ? 'auto' : 'none';
        });

        /* The chip is pushed radially outward from the globe's centre, then
           nudged off anything already placed. Anchoring it to the pin's own
           direction is what keeps five chips from stacking on one side. */
        let dx = p.x - view.cx;
        let dy = p.y - view.cy;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 24) { dx = 0; dy = -1; } else { dx /= d; dy /= d; }
        let cxp = Math.max(76, Math.min(view.w - 76, view.cx + dx * (view.R + 52)));
        let cyp = Math.max(34, Math.min(view.h - 34, view.cy + dy * (view.R + 52)));
        for (const q of placed) {
          if (Math.abs(cxp - q.x) < 150 && Math.abs(cyp - q.y) < 48) {
            cyp = Math.max(34, Math.min(view.h - 34, q.y + (cyp >= q.y ? 50 : -50)));
          }
        }
        placed.push({ x: cxp, y: cyp });

        const chip = chips.current.get(t.id);
        if (chip) {
          chip.style.left = `${cxp}px`;
          chip.style.top = `${cyp}px`;
          // a selection quiets the other chips rather than hiding them
          chip.style.opacity = front ? (sel && sel !== t.id ? 0.45 : 1) : 0;
          chip.style.pointerEvents = front ? 'auto' : 'none';
        }

        if (front) {
          ctx.beginPath();
          ctx.moveTo(cxp, cyp);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = sel === t.id ? colour : pal.land;
          ctx.globalAlpha = sel === t.id ? 0.85 : 0.4;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const s = sc.current;
      /* Nothing to draw until the canvas has been measured. Without this, a
         zero-size or not-yet-laid-out box feeds NaN straight into
         createRadialGradient, which throws once per frame forever. */
      if (!s.view.R) return;
      const dt = Math.min(0.05, (now - s.last) / 1000 || 0);
      s.last = now;
      const sel = selRef.current;

      if (s.tween) {
        s.tween.u += dt / s.tween.dur;
        const u = Math.min(1, s.tween.u);
        const k = 1 - (1 - u) ** 3;
        s.lon0 = s.tween.lon + s.tween.delta * k;
        s.lat0 = s.tween.lat + (s.tween.toLat - s.tween.lat) * k;
        if (u >= 1) s.tween = null;
      } else if (s.drag) {
        /* held by the pointer */
      } else if (Math.abs(s.vel) > 0.02) {
        s.lon0 += s.vel * dt;
        s.vel *= 0.02 ** dt;
      } else if (!reduced && !sel) {
        s.lon0 += SPIN * dt;
      }
      s.lon0 = (((s.lon0 + 180) % 360) + 360) % 360 - 180;

      for (const id of ids) {
        const want = sel === id ? 1 : 0;
        s.glow[id] += (want - s.glow[id]) * Math.min(1, dt * 7);
      }
      const wantBias = !s.view.wide && sel ? -s.view.h * 0.2 : 0;
      s.bias += (wantBias - s.bias) * Math.min(1, dt * 6);
      s.view.cy = s.view.cyBase + s.bias;

      const r = drawGlobe(ctx, s.view, DOTS, {
        lon0: s.lon0, lat0: s.lat0, glow: s.glow, anchors, ids, ghost: true,
      }, pal);

      if (sel && sel !== 'us') {
        drawRoute(ctx, s.view, HOME_V, anchors[sel], r, pal.terr[sel], s.glow[sel],
          reduced ? null : (now / BEAD_PERIOD) % 1);
      }
      place(r);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [pal, territories, anchors, siteVecs, ids, reduced]);

  /* ── Drag ───────────────────────────────────────────────────────────────── */
  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const s = sc.current;
    s.drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
    s.tween = null;
    s.vel = 0;
  };
  const onMove = (e) => {
    const s = sc.current;
    if (!s.drag) return;
    const dx = e.clientX - s.drag.x;
    const dy = e.clientY - s.drag.y;
    const k = 140 / s.view.R;
    s.lon0 -= dx * k * 0.55;
    s.lat0 = Math.max(-62, Math.min(72, s.lat0 + dy * k * 0.45));
    const now = performance.now();
    s.vel = (-dx * k * 0.55) / (Math.max(1, now - s.drag.t) / 1000);
    s.drag = { x: e.clientX, y: e.clientY, t: now, moved: s.drag.moved + Math.abs(dx) + Math.abs(dy) };
  };
  const onUp = () => {
    const s = sc.current;
    if (!s.drag) return;
    if (s.drag.moved < 4) s.vel = 0;   // a tap should not fling it
    s.drag = null;
  };

  const pick = (id) => onSelect(id === selected ? null : id);

  return (
    <>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
        aria-hidden="true"
      />

      {territories.map((t) => (
        <button
          key={t.id}
          type="button"
          ref={(el) => { pins.current.set(t.id, el); }}
          onClick={() => pick(t.id)}
          aria-pressed={selected === t.id}
          className={`nn-pin${t.home ? ' nn-pin-home' : ''}`}
        >
          <i />
          <span className="sr-only">{`${t.label} — ${t.summary}`}</span>
        </button>
      ))}

      {territories.flatMap((t) => (t.sites ?? []).map((s, i) => (
        <button
          key={`${t.id}-${s[2]}`}
          type="button"
          ref={(el) => {
            const list = sites.current.get(t.id) ?? [];
            list[i] = el;
            sites.current.set(t.id, list);
          }}
          onClick={() => pick(t.id)}
          className="nn-pin nn-pin-site"
        >
          <i />
          <span className="sr-only">{`${s[2]} — covered by ${t.orgs[0].name}`}</span>
        </button>
      )))}

      {/* Chips orbit the globe on wide screens. Below 900px there is no room
          for five of them without landing on each other and on the pins, so
          they become the rail below and the pins carry the geography alone. */}
      {territories.map((t) => (
        <button
          key={t.id}
          type="button"
          ref={(el) => { chips.current.set(t.id, el); }}
          onClick={() => pick(t.id)}
          aria-label={`${t.label} — ${t.orgs[0].name}`}
          className={`nn-chip hidden items-center gap-2 rounded-sm border bg-surface px-2.5 py-2
            shadow-e2 lg:flex ${selected === t.id ? 'border-action' : 'border-hairline'}`}
        >
          <Mark org={t.orgs[0]} h={18} />
          {t.orgs.length > 1 && (
            <span className="font-data text-[0.6875rem] tracking-[0.1em] text-ink-3">
              {`+${t.orgs.length - 1}`}
            </span>
          )}
        </button>
      ))}

      <div className="absolute inset-x-0 top-0 z-[6] flex gap-1.5 overflow-x-auto px-3 py-3 lg:hidden
        [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {territories.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t.id)}
            aria-pressed={selected === t.id}
            aria-label={t.label}
            className={`flex flex-none items-center rounded-sm border bg-surface px-2 py-1.5 shadow-e1
              ${selected === t.id ? 'border-action' : 'border-hairline'}`}
          >
            <Mark org={t.orgs[0]} h={15} />
          </button>
        ))}
      </div>

      {/* No colour key. The chips already name each territory and sit in its
          colour, so a legend restated what the globe was showing rather than
          explaining it. */}
      <span className="eyebrow absolute bottom-5 right-5 z-[5] hidden text-ink-3 opacity-75 lg:block">
        Drag to turn · click a mark
      </span>
    </>
  );
}

/** A partner's mark on a white plate, or its name set in mono if it has none. */
export function Mark({ org, h = 18 }) {
  if (!org.logo) {
    return (
      <span
        className="nn-mark flex items-center rounded-[5px] px-2 font-data text-[0.6875rem]
          font-semibold tracking-[0.06em] text-nn-800"
        style={{ height: h + 8 }}
      >
        {org.name}
      </span>
    );
  }
  return (
    <span
      className="nn-mark flex items-center justify-center rounded-[5px] px-0.5"
      style={{ height: h + 8 }}
    >
      <img src={org.logo} alt={org.name} style={{ height: h }} className="block w-auto" />
    </span>
  );
}

