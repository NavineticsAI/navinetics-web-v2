import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn.js';
import { SERIES, headQ } from '../lib/volume.js';
import {
  anglesFromDir,
  buildGeometry,
  dirFromAngles,
  fromFrame,
  norm,
  scalpHit,
  toFrame,
} from '../lib/stereo.js';
import {
  draw3DOverlay,
  drawOverlay,
  insideBrain,
  paneMap,
  render3D,
  renderSlice,
} from '../lib/viewport.js';

/**
 * A working simulation of the NaviNetics AI planning workspace.
 *
 * Not a screenshot: the volume is generated and re-sliced live, so the
 * controls genuinely drive the anatomy and the probe's-eye plane is
 * reconstructed perpendicular to the current track.
 *
 * The interaction is the application's, not a convenience:
 *   · clicking a slice moves the CURSOR only — it retargets nothing
 *   · the three orthogonal planes re-slice around the cursor, which is why
 *     the red dot always sits at pane centre
 *   · "Update Target" and "Update Entry" then assign the cursor
 *   · entry, target and the track between them are all draggable, and the
 *     three do different things: an endpoint moves that point alone, while
 *     the shaft rotates about the target at constant length — the arc's own
 *     motion. The track is dashed while a drag is in flight and solid once
 *     committed, as it is in the application
 *   · Collar and Arc are DERIVED from entry and target; stepping them swings
 *     the entry around the target at the current track length
 *
 * Everything shown is synthetic and nothing here is a claim about the product.
 */

const ORTHO = [
  { view: 'coronal', title: 'Coronal View', thumb: '#05cc06' },
  { view: 'sagittal', title: 'Sagittal View', thumb: '#c62d2d' },
  { view: 'axial', title: 'Axial View', thumb: '#4e78d8' },
  { view: 'probe', title: "Probe's Eye View", thumb: '#ffdb4f' },
];

const DEFAULT_PLAN = {
  target: [-13.4, -6.3, -6.6],
  entry: scalpHit([-13.4, -6.3, -6.6], dirFromAngles(106.3, 40.9)),
  cursor: [-13.4, -6.3, -6.6],
  pos: 0.345,
};

const SLICE_DIV = 2;
const f1 = (v) => v.toFixed(1);

export function Workstation({ live = false, className }) {
  const rootRef = useRef(null);
  // Initialised once so the ref callbacks only ever assign a field. Rebuilding
  // these objects per render loses whichever ref fired first.
  const paneRefs = useRef(
    Object.fromEntries(ORTHO.map(({ view }) => [view, { el: null, slice: null, ovl: null, w: 0, h: 0 }])),
  );
  const vp3dRef = useRef({ el: null, slice: null, ovl: null, w: 0, h: 0 });

  // Plan and camera live in refs, not state: they change on every pointer
  // move and every change repaints canvases directly. Routing them through
  // React state would re-render the whole tree at pointer rate for nothing.
  const plan = useRef({ ...DEFAULT_PLAN });
  const cam = useRef({ az: 58, el: 15 });
  const geo = useRef(buildGeometry(plan.current));
  const draft = useRef(false);
  const dirty = useRef({ slices: true, probe: true, three: true });
  const queued = useRef(false);

  const [series, setSeries] = useState('mr');
  const seriesRef = useRef(SERIES.mr);
  const [touched, setTouched] = useState(false);

  // Readouts DO go through state — they are text, they change at most once a
  // frame, and React is the right tool for keeping them in sync.
  const [read, setRead] = useState(() => readout(geo.current, DEFAULT_PLAN, { az: 58, el: 15 }));

  const sizeCanvases = useCallback(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const { view } of ORTHO) {
      const p = paneRefs.current[view];
      if (!p.el || !p.slice || !p.ovl) continue;
      const r = p.el.getBoundingClientRect();
      p.w = Math.max(1, Math.round(r.width));
      p.h = Math.max(1, Math.round(r.height));
      p.slice.width = Math.max(1, Math.round(p.w / SLICE_DIV));
      p.slice.height = Math.max(1, Math.round(p.h / SLICE_DIV));
      p.ovl.width = Math.round(p.w * dpr);
      p.ovl.height = Math.round(p.h * dpr);
    }
    const v = vp3dRef.current;
    if (v.el && v.slice && v.ovl) {
      const r = v.el.getBoundingClientRect();
      v.w = r.width;
      v.h = r.height;
      /* One raster pixel per CSS pixel, unlike the slice panes. Those show
         soft volume data that survives being halved; this one is hard-edged
         geometry — thin rods, straight rails — and halving it is exactly
         where the staircase came from. Supersampling inside the renderer
         does the rest. */
      v.slice.width = Math.max(1, Math.round(r.width));
      v.slice.height = Math.max(1, Math.round(r.height));
      v.ovl.width = Math.max(1, Math.round(r.width * dpr));
      v.ovl.height = Math.max(1, Math.round(r.height * dpr));
    }
  }, []);

  const flush = useCallback(() => {
    queued.current = false;
    const g = buildGeometry(plan.current);
    geo.current = g;
    const tis = seriesRef.current;
    const need = dirty.current;

    for (const { view } of ORTHO) {
      const p = paneRefs.current[view];
      if (!p.el || !p.slice || !p.ovl) continue;
      if (need.slices || (need.probe && view === 'probe')) {
        renderSlice(p.slice, view, g, tis, draft.current);
      }
      drawOverlay(p.ovl, view, g, p.w, p.h, active.current, preview.current);
    }

    const v = vp3dRef.current;
    if (v.el && v.slice && v.ovl) {
      // Draft only while the orbit is actually in hand; the release re-renders
      // at full quality, which is the state anyone actually looks at.
      if (need.three) render3D(v.slice, v.w, v.h, cam.current, tis, orbit.current !== null);
      draw3DOverlay(v.ovl, g, cam.current, v.w, v.h);
    }

    dirty.current = { slices: false, probe: false, three: false };
    setRead(readout(g, plan.current, cam.current));
  }, []);

  const invalidate = useCallback((what) => {
    Object.assign(dirty.current, what);
    if (queued.current) return;
    queued.current = true;
    requestAnimationFrame(flush);
  }, [flush]);

  useEffect(() => {
    sizeCanvases();
    invalidate({ slices: true, probe: true, three: true });
    const onResize = () => {
      sizeCanvases();
      invalidate({ slices: true, probe: true, three: true });
    };
    window.addEventListener('resize', onResize);
    // Fonts land after first layout and the overlays draw text.
    document.fonts?.ready.then(onResize).catch(() => {});
    return () => window.removeEventListener('resize', onResize);
  }, [sizeCanvases, invalidate]);

  const pickSeries = (key) => {
    seriesRef.current = SERIES[key];
    setSeries(key);
    setTouched(true);
    invalidate({ slices: true, probe: true, three: true });
  };

  /* ── the panes: three things to grab, or click to move the cursor ─────────
     Modelled on the application, which distinguishes three drag origins on a
     trajectory and gives each different geometry:

       · the TARGET endpoint  — moves the target; the entry stays where it is
       · the ENTRY endpoint   — moves the entry; the target stays where it is
       · the SHAFT            — rotates about the target at CONSTANT LENGTH,
                                which is the arc's own motion

     Picking is decided in DISPLAY space, against the same mapping the overlay
     draws with. The application learned this the hard way: testing proximity
     by dropping a voxel axis leaves a marker ungrabbable once it sits a few
     millimetres off the displayed plane, and the press silently demotes to a
     shaft drag. Its threshold is in millimetres too, so the grab radius means
     the same thing whatever the pane is showing. */
  const grab = useRef(null);          // { which, len } | null
  // Which handle is lit, in a ref for the renderer and in state for the
  // cursor. Both, because one is read inside a draw call and the other has
  // to survive a re-render.
  const active = useRef(null);
  const preview = useRef(false);      // dragging → dashed track, as in the app
  const [hover, setHover] = useState(null);        // { view, which } | null
  const HANDLE_MM = 7;                // endpoint grab radius
  const SHAFT_MM = 4;                 // narrower: the endpoints must win

  const light = (view, which) => {
    active.current = which;
    setHover((h) => (h?.view === view && h?.which === which ? h : (which ? { view, which } : null)));
  };

  const paneHandlers = (view) => {
    if (view === 'probe' || !live) return {};

    const at = (e) => {
      const p = paneRefs.current[view];
      const r = p.el.getBoundingClientRect();
      return { r, x: e.clientX - r.left, y: e.clientY - r.top };
    };

    // What is under this point: an endpoint, the shaft, or nothing. Radii are
    // in millimetres and converted through the pane's own scale, with a pixel
    // floor so a small pane stays usable with a finger.
    const handleAt = (x, y, r) => {
      const { toPx, mm } = paneMap(view, geo.current, r.width, r.height);
      const px = (v) => Math.max(v / mm, v === HANDLE_MM ? 11 : 5);
      const pT = toPx(geo.current.T);
      const pE = toPx(geo.current.E);
      // Endpoints first, and the target ahead of the entry: on a short track
      // the two overlap, and the target is the point of the exercise.
      if (Math.hypot(pT[0] - x, pT[1] - y) <= px(HANDLE_MM)) return 'target';
      if (Math.hypot(pE[0] - x, pE[1] - y) <= px(HANDLE_MM)) return 'entry';
      // Then the shaft — distance to the segment, with the endpoint zones
      // already claimed above.
      const vx = pT[0] - pE[0], vy = pT[1] - pE[1];
      const L2 = vx * vx + vy * vy;
      if (L2 > 1) {
        const t = Math.max(0, Math.min(1, ((x - pE[0]) * vx + (y - pE[1]) * vy) / L2));
        const cxp = pE[0] + vx * t, cyp = pE[1] + vy * t;
        if (Math.hypot(cxp - x, cyp - y) <= px(SHAFT_MM)) return 'shaft';
      }
      return null;
    };

    const moveCursor = (x, y, r) => {
      plan.current.cursor = paneMap(view, geo.current, r.width, r.height).toWorld(x, y);
      invalidate({ slices: true });
    };

    /* Angles are held to the band an arc can actually reach — an entry below
       the equator is not a burr hole. Collar comes back signed, and a negative
       one is the same approach seen from under the head, so it is mirrored
       rather than flattened: dragging past the equator slides along it. */
    const aim = (d, m) => {
      const a = anglesFromDir([d[0] / m, d[1] / m, d[2] / m]);
      return dirFromAngles(
        Math.max(15, Math.min(165, a.arc)),
        Math.max(5, Math.min(175, Math.abs(a.collar))),
      );
    };

    const dragHandle = (x, y, r) => {
      const g = grab.current;
      /* Dragged against the point's own depth, and against the depth it had
         when the drag STARTED — not its live position. Re-reading it each
         tick lets the out-of-plane component walk as the point is rescaled,
         and the track slowly drifts out of the plane you are working in. */
      const w = paneMap(view, geo.current, r.width, r.height).toWorldAt(x, y, g.ref);
      const T = plan.current.target;

      if (g.which === 'target') {
        // Moves the target alone. The entry stays put, so arc, collar and
        // depth all re-derive — which is what the application does, and what
        // makes the readout worth watching.
        if (!insideBrain(headQ(w[0], w[1], w[2]))) return;
        plan.current.target = w;
      } else if (g.which === 'entry') {
        // Moves the entry alone, at whatever length that implies.
        const d = [w[0] - T[0], w[1] - T[1], w[2] - T[2]];
        const m = norm(d);
        if (m < 6) return;
        const u = aim(d, m);
        plan.current.entry = [T[0] + u[0] * m, T[1] + u[1] * m, T[2] + u[2] * m];
      } else {
        /* Shaft: rotate about the target, preserving the length captured when
           the drag began. This is the arc's own motion — the entry travels,
           the target does not, and the distance between them cannot change. */
        const d = [w[0] - T[0], w[1] - T[1], w[2] - T[2]];
        const m = norm(d);
        if (m < 6) return;
        const u = aim(d, m);
        plan.current.entry = [T[0] + u[0] * g.len, T[1] + u[1] * g.len, T[2] + u[2] * g.len];
      }
      /* Not `three`. The 3-D raster is the head and the localiser, and moving
         a trajectory changes neither — only its overlay, which is redrawn
         every flush regardless. Re-raytracing it per drag tick would put a
         ray-traced frame between every pointer move and the screen. */
      invalidate({ slices: true, probe: true });
    };

    return {
      onPointerDown: (e) => {
        const { r, x, y } = at(e);
        const h = handleAt(x, y, r);
        setTouched(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        e.preventDefault();
        if (h) {
          /* Length and depth are captured now, not read per tick: a shaft
             drag has to preserve the length it started with, and reading
             either live would let rounding walk them. `ref` is whichever
             point this drag moves — the shaft moves the entry. */
          grab.current = {
            which: h,
            len: geo.current.len,
            ref: h === 'target' ? [...plan.current.target] : [...plan.current.entry],
          };
          preview.current = true;
          light(view, h);
          invalidate({});           // only the halo and the dash — overlay work
        } else {
          draft.current = true;
          moveCursor(x, y, r);
        }
      },
      onPointerMove: (e) => {
        const { r, x, y } = at(e);
        if (grab.current) { dragHandle(x, y, r); return; }
        if (draft.current) { moveCursor(x, y, r); return; }
        const h = handleAt(x, y, r);
        if (h !== active.current) { light(view, h); invalidate({}); }
      },
      onPointerUp: () => {
        if (grab.current) {
          /* Commit. The application previews at sub-voxel precision and then
             commits a rounded position; here the plan is in millimetres and
             the panel steps at a tenth, so it settles on the same grid the
             fields can express. */
          const q = (p) => p.map((v) => Math.round(v * 10) / 10);
          plan.current.target = q(plan.current.target);
          plan.current.entry = q(plan.current.entry);
          grab.current = null;
          preview.current = false;
          // Not `three`, for the same reason the drag itself does not: the
          // committed plan moves the slices, never the head or the localiser.
          // Asking for it here put a full-quality raytrace between releasing
          // the pointer and seeing the result — a 58ms hitch on every drop.
          invalidate({ slices: true, probe: true });
          return;
        }
        if (!draft.current) return;
        draft.current = false;
        invalidate({ slices: true });     // re-render at full resolution
      },
      onPointerCancel: () => {
        grab.current = null;
        draft.current = false;
        preview.current = false;
        invalidate({ slices: true, probe: true });
      },
      onPointerLeave: () => {
        if (grab.current || draft.current) return;
        light(view, null);
        invalidate({});
      },
      style: {
        cursor: hover?.view === view
          ? (grab.current ? 'grabbing' : (hover.which === 'shaft' ? 'move' : 'grab'))
          : 'crosshair',
      },
    };
  };

  /* ── orbit the 3D pane ────────────────────────────────────────────────── */
  const orbit = useRef(null);
  const orbitHandlers = live ? {
    onPointerDown: (e) => {
      orbit.current = [e.clientX, e.clientY];
      e.currentTarget.setPointerCapture(e.pointerId);
      setTouched(true);
      e.preventDefault();
    },
    onPointerMove: (e) => {
      if (!orbit.current) return;
      cam.current.az -= (e.clientX - orbit.current[0]) * 0.45;
      cam.current.el = Math.max(-70, Math.min(70, cam.current.el + (e.clientY - orbit.current[1]) * 0.35));
      orbit.current = [e.clientX, e.clientY];
      invalidate({ three: true });
    },
    // Releasing re-renders once at full quality. Without this the pane keeps
    // whatever the last draft frame was, which is the blurry one.
    onPointerUp: () => { orbit.current = null; invalidate({ three: true }); },
    onPointerCancel: () => { orbit.current = null; invalidate({ three: true }); },
  } : {};

  /* ── controls ─────────────────────────────────────────────────────────── */
  const bump = (key, dir) => {
    setTouched(true);
    const g = geo.current;
    if (key === 'x' || key === 'y' || key === 'z') {
      // The fields show the target, so stepping them moves the target — and
      // the cursor rides along, or the views stop following the plan.
      const f = toFrame(plan.current.target);
      f[{ x: 0, y: 1, z: 2 }[key]] += dir;
      const w = fromFrame(f);
      if (insideBrain(headQ(w[0], w[1], w[2]))) {
        plan.current.target = w;
        plan.current.cursor = [...w];
      }
      invalidate({ slices: true });
    } else {
      const a = { arc: g.arc, collar: g.collar };
      a[key] += dir;
      // Collar 0 is anterior and 180 posterior, so the usable band is the
      // upper half — an entry below the equator is not a burr hole.
      a.arc = Math.max(15, Math.min(165, a.arc));
      a.collar = Math.max(5, Math.min(175, a.collar));
      const u = dirFromAngles(a.arc, a.collar);
      const T = plan.current.target;
      plan.current.entry = [T[0] + u[0] * g.len, T[1] + u[1] * g.len, T[2] + u[2] * g.len];
      invalidate({ probe: true });
    }
  };

  const [flashed, setFlashed] = useState(null);
  const assign = (which) => {
    plan.current[which] = [...plan.current.cursor];
    setFlashed(which);
    setTimeout(() => setFlashed(null), 260);
    setTouched(true);
    invalidate({ probe: true });
  };

  const setPos = (v) => {
    plan.current.pos = Math.max(0, Math.min(1, v));
    setTouched(true);
    invalidate({ probe: true });
  };

  const reset = () => {
    plan.current = {
      target: [...DEFAULT_PLAN.target],
      entry: [...DEFAULT_PLAN.entry],
      cursor: [...DEFAULT_PLAN.cursor],
      pos: DEFAULT_PLAN.pos,
    };
    invalidate({ slices: true });
  };

  return (
    <div
      ref={rootRef}
      data-touched={touched || undefined}
      className={cn(
        'flex h-full w-full flex-col overflow-hidden bg-ws-chassis text-[12px] text-ws-ink select-none',
        className,
      )}
    >
      {/* title bar */}
      <div className="flex h-[38px] shrink-0 items-center gap-4 border-b border-ws-line bg-ws-bg px-3">
        <span className="flex items-center gap-2 whitespace-nowrap text-[12.5px] font-semibold tracking-[-0.02em]">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.2" stroke="#4e78d8" strokeWidth="1.2" />
            <path d="M8 1.4v3.1M8 11.5v3.1M1.4 8h3.1M11.5 8h3.1" stroke="#4e78d8" strokeWidth="1.2" />
            <circle cx="8" cy="8" r="1.5" fill="#03a1bd" />
          </svg>
          NaviNetics AI <span className="font-medium text-ws-ink-3">· Planning</span>
        </span>

        <span className="ml-auto flex items-center gap-3 font-data text-[10px] uppercase tracking-[0.07em] text-ws-ink-3">
          <span className="hidden rounded-[3px] border border-ws-amber px-1.5 py-px font-semibold text-ws-amber sm:inline">
            Synthetic dataset
          </span>
          <span
            className="inline-flex gap-0.5 rounded-[5px] border border-ws-line-2 bg-ws-panel p-0.5"
            role="group"
            aria-label="Displayed series"
          >
            {Object.values(SERIES).map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => pickSeries(s.key)}
                aria-pressed={series === s.key}
                disabled={!live}
                className={cn(
                  'rounded-[3px] px-2 py-0.5 font-data text-[9.5px] font-semibold uppercase tracking-[0.07em]',
                  series === s.key ? 'bg-ws-blue text-white' : 'text-ws-ink-3 hover:text-ws-ink-2',
                )}
              >
                {s.label}
              </button>
            ))}
          </span>
          <span className="hidden items-center gap-1.5 text-ws-green md:inline-flex">
            <i className="block h-[5px] w-[5px] rounded-full bg-current" aria-hidden="true" />
            Registered
          </span>
        </span>
      </div>

      {/* body */}
      <div className="grid min-h-0 flex-1 gap-px bg-ws-line-2 [grid-template-columns:1fr] lg:[grid-template-columns:270px_1fr_252px]">
        {/* 3D */}
        <section className="hidden min-h-0 min-w-0 flex-col bg-ws-panel lg:flex">
          <PaneTitle title="3D" meta={read.cam} />
          <div
            ref={(el) => { vp3dRef.current.el = el; }}
            className={cn('relative min-h-0 flex-1 overflow-hidden bg-ws-bg', live && 'cursor-grab active:cursor-grabbing')}
            {...orbitHandlers}
          >
            <canvas
              ref={(el) => { vp3dRef.current.slice = el; }}
              className="absolute inset-0 h-full w-full"
            />
            <canvas
              ref={(el) => { vp3dRef.current.ovl = el; }}
              className="absolute inset-0 h-full w-full"
            />
            <span className="pointer-events-none absolute bottom-2 left-2 font-data text-[9px] uppercase tracking-[0.09em] text-ws-ink-3">
              Drag to orbit
            </span>
          </div>
        </section>

        {/* 2 × 2 */}
        <div className="grid min-h-0 min-w-0 grid-cols-2 grid-rows-2 gap-px bg-ws-line-2">
          {ORTHO.map(({ view, title, thumb }) => (
            <section key={view} className="flex min-h-0 min-w-0 flex-col bg-ws-panel">
              <PaneTitle title={title} meta={read.slice[view]} />
              <div
                ref={(el) => { paneRefs.current[view].el = el; }}
                className={cn(
                  'relative min-h-0 flex-1 overflow-hidden bg-ws-vp',
                  live && view !== 'probe' && 'cursor-crosshair',
                )}
                {...paneHandlers(view)}
              >
                <canvas
                  ref={(el) => { paneRefs.current[view].slice = el; }}
                  className="absolute inset-0 h-full w-full"
                />
                <canvas
                  ref={(el) => { paneRefs.current[view].ovl = el; }}
                  className="absolute inset-0 h-full w-full"
                />
                <i
                  className="pointer-events-none absolute right-[3px] top-[calc(50%-9px)] h-[18px] w-[7px] rounded-[2px] opacity-80"
                  style={{ background: thumb }}
                  aria-hidden="true"
                />
              </div>
            </section>
          ))}
        </div>

        {/* planning panel */}
        <aside className="hidden min-h-0 flex-col overflow-hidden bg-ws-elev lg:flex">
          <div className="flex h-[22px] shrink-0 items-center border-b border-ws-line-2 bg-ws-chassis px-2.5 font-data text-[9.5px] font-semibold uppercase tracking-[0.13em] text-ws-ink-2">
            Planning
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
            <div className="rounded-md border border-ws-plan-rim bg-ws-panel p-2.5">
              <div className="flex items-center gap-2 text-[11.5px] font-semibold">
                Plan 2
                <span className="ml-auto rounded-full border border-ws-green px-1.5 py-px font-data text-[8.5px] font-semibold tracking-[0.1em] text-ws-green">
                  Ready
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                <PlanButton
                  rim="entry"
                  on={flashed === 'entry'}
                  disabled={!live}
                  onClick={() => assign('entry')}
                >
                  Update Entry
                </PlanButton>
                <PlanButton
                  rim="target"
                  on={flashed === 'target'}
                  disabled={!live}
                  onClick={() => assign('target')}
                >
                  Update Target
                </PlanButton>
              </div>

              <p className="mb-1.5 mt-3.5 font-data text-[9px] font-semibold uppercase tracking-[0.14em] text-ws-ink-3">
                Stereotactic targeting
              </p>
              <p className="mb-1.5 text-[9.5px] text-ws-ink-3">Editable stereotactic coordinates</p>

              <div className="rounded-[5px] border border-ws-line-2 p-1.5">
                <Coord label="X:" tone="x" value={read.x} unit="mm" onStep={(d) => bump('x', d)} live={live} />
                <Coord label="Y:" tone="y" value={read.y} unit="mm" onStep={(d) => bump('y', d)} live={live} />
                <Coord label="Z:" tone="z" value={read.z} unit="mm" onStep={(d) => bump('z', d)} live={live} />
                <Coord label="Collar:" tone="y" value={read.collar} unit="°" onStep={(d) => bump('collar', d)} live={live} />
                <Coord label="Arc:" tone="x" value={read.arc} unit="°" onStep={(d) => bump('arc', d)} live={live} last />
              </div>

              <p className="mb-1.5 mt-3.5 font-data text-[9px] font-semibold uppercase tracking-[0.14em] text-ws-ink-3">
                Trajectory position
              </p>
              <div className="rounded-[5px] border border-ws-line-2 p-2">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span>
                    <MetaLabel>Length</MetaLabel>
                    <span className="font-data text-[17px] font-semibold tabular-nums">{read.len}</span>
                  </span>
                  <span>
                    <MetaLabel>To target</MetaLabel>
                    <span className="font-data text-[11px] tabular-nums text-ws-ink-2">{read.toTarget}</span>
                  </span>
                  <span className="ml-auto text-right">
                    <MetaLabel>Step</MetaLabel>
                    <span className="font-data text-[11px] tabular-nums text-ws-ink-2">1.0</span>
                  </span>
                </div>

                <div className="my-2 grid grid-cols-3 gap-1.5">
                  <TransportButton disabled={!live} onClick={() => setPos(0)} label="Jump to entry">⏮</TransportButton>
                  <TransportButton
                    disabled={!live}
                    onClick={() => setPos(plan.current.pos + 1 / Math.max(1, geo.current.len))}
                    label="Step toward target"
                  >
                    ⏵
                  </TransportButton>
                  <TransportButton disabled={!live} onClick={() => setPos(1)} label="Jump to target">⏭</TransportButton>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={read.pos}
                  disabled={!live}
                  onChange={(e) => setPos(parseFloat(e.target.value))}
                  aria-label="Trajectory position, entry to target"
                  className="nn-ws-range"
                  style={{ '--fill': `${(read.pos * 100).toFixed(1)}%` }}
                />
                <div className="mt-0.5 flex justify-between text-[9.5px]">
                  <span className="text-ws-green">Entry</span>
                  <span className="text-ws-amber">Target</span>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-ws-line-2 p-2.5">
            <button
              type="button"
              onClick={reset}
              disabled={!live}
              className="w-full rounded border border-ws-blue/60 bg-ws-blue/25 py-1.5 text-[10px] text-[#b3c8f2] hover:bg-ws-blue/35"
            >
              Reset plan
            </button>
          </div>
        </aside>
      </div>

      {/* status bar */}
      <div className="flex h-[25px] shrink-0 items-center overflow-hidden whitespace-nowrap border-t border-ws-line bg-ws-bg px-3 font-data text-[10px] tabular-nums text-ws-ink-3">
        <Status k="Target" v={read.targetTriplet} />
        <Status k="Entry" v={read.entryTriplet} />
        <Status k="Collar / Arc" v={`${read.collar}° / ${read.arc}°`} />
        <Status k="Length" v={read.len} last />
      </div>
    </div>
  );
}

/* ── small parts ──────────────────────────────────────────────────────────── */

function PaneTitle({ title, meta }) {
  return (
    <h4 className="flex h-[22px] shrink-0 items-center border-b border-ws-line-2 bg-ws-chassis px-2 text-[10.5px] font-medium text-ws-ink-2">
      {title}
      <em className="ml-auto font-data text-[9.5px] not-italic tabular-nums text-ws-ink-3">{meta}</em>
    </h4>
  );
}

const TONE = { x: 'text-ws-ax-x', y: 'text-ws-ax-y', z: 'text-ws-ax-z' };

function Coord({ label, tone, value, unit, onStep, live, last }) {
  return (
    <div className={cn('grid grid-cols-[44px_20px_1fr_18px_20px] items-center gap-[5px]', !last && 'mb-[5px]')}>
      <span className={cn('text-[10.5px] font-semibold', TONE[tone])}>{label}</span>
      <StepButton disabled={!live} onClick={() => onStep(-1)} label={`Decrease ${label}`}>−</StepButton>
      <span className="rounded-[3px] border border-ws-line-2 bg-ws-chassis px-1.5 py-0.5 text-right font-data text-[13px] font-semibold tabular-nums">
        {value}
      </span>
      <span className="text-center font-data text-[9px] text-ws-ink-3">{unit}</span>
      <StepButton disabled={!live} onClick={() => onStep(1)} label={`Increase ${label}`}>+</StepButton>
    </div>
  );
}

function StepButton({ children, label, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="h-5 rounded-[3px] border border-ws-line bg-ws-line-2 p-0 text-[12px] leading-none text-[#b2bcc6] hover:border-ws-blue hover:text-white disabled:opacity-60"
      {...props}
    >
      {children}
    </button>
  );
}

function PlanButton({ rim, on, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={cn(
        'rounded border py-1.5 text-[10px] text-[#c2cad3] transition-colors',
        rim === 'entry' ? 'border-ws-entry-rim' : 'border-ws-target-rim',
        on && (rim === 'entry' ? 'bg-ws-entry-rim/25 text-white' : 'bg-ws-target-rim/25 text-white'),
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TransportButton({ children, label, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="rounded border border-ws-line bg-ws-line-2 py-1 text-[11px] text-[#b2bcc6] hover:border-ws-blue hover:text-white disabled:opacity-60"
      {...props}
    >
      {children}
    </button>
  );
}

function MetaLabel({ children }) {
  return (
    <span className="block font-data text-[8.5px] uppercase tracking-[0.11em] text-ws-ink-3">
      {children}
    </span>
  );
}

function Status({ k, v, last }) {
  return (
    <span className={cn('flex gap-1.5', !last && 'mr-4 border-r border-ws-line pr-4')}>
      <span className="uppercase tracking-[0.09em]">{k}</span>
      <span className="font-semibold text-ws-ink">{v}</span>
    </span>
  );
}

/** Everything the panel and status bar display, derived once per frame. */
function readout(g, plan, cam) {
  const fT = toFrame(g.T);
  const fE = toFrame(g.E);
  return {
    x: f1(fT[0]),
    y: f1(fT[1]),
    z: f1(fT[2]),
    collar: f1(g.collar),
    arc: f1(g.arc),
    len: `${f1(g.len)} mm`,
    toTarget: `${f1(g.len - g.fromEntry)} mm`,
    pos: plan.pos,
    targetTriplet: fT.map(f1).join('  '),
    entryTriplet: fE.map(f1).join('  '),
    cam: `AZ ${Math.round(((cam.az % 360) + 360) % 360)}° / EL ${Math.round(cam.el)}°`,
    slice: {
      // Probe's Eye counts steps along the track, 0 at entry to 100 at target.
      coronal: String(Math.round(180 + g.C[1])),
      sagittal: String(Math.round(128 + g.C[0])),
      axial: String(Math.round(180 + g.C[2])),
      probe: String(Math.round(plan.pos * 100)),
    },
  };
}
