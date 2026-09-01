import { useEffect, useRef, useState } from 'react';
import { motionsOf } from '../data/orTables.js';
import { usePrefersReducedMotion } from '../lib/motion.js';

/**
 * A table, put through its own motions.
 *
 * Side elevation in SVG, drawn to the selected model's real dimensions and
 * animated through the range its own specification gives. Pick a motion and
 * the table performs it; the readout underneath is the figure the brochure
 * prints, not a number chosen to look good next to the drawing.
 *
 * SVG rather than canvas for the same reasons the locator map is: a dozen
 * shapes, no per-pixel work, real text that inherits the page's fonts, and it
 * stays sharp at any size. The only thing driven per-frame is one phase value.
 *
 * WHAT IS TO SCALE AND WHAT IS NOT. The top's length, the column's height
 * range and every angle are the model's own millimetres and degrees, mapped
 * through one scale factor. The base, the column width and the castors are
 * drawn to look like the photograph — they are furniture, not measurements,
 * and no dimension for them is published anywhere in the brochure.
 */

/* The drawing's own frame, in millimetres, so the geometry below reads as the
   dimensions it is. Wide enough for the longest top plus its travel. */
const MM = { w: 2900, h: 1580 };
const FLOOR = 1440;

const EASE = (t) => 0.5 - 0.5 * Math.cos(t * Math.PI * 2);

export function TableMotion({ model, className }) {
  const reduced = usePrefersReducedMotion();
  const motions = motionsOf(model);
  const [active, setActive] = useState(motions[0].id);
  const [phase, setPhase] = useState(reduced ? 0.5 : 0);
  const raf = useRef(0);

  /* The chosen motion may not exist on the next model — a CXR-701 has no
     Trendelenburg — so the selection follows the model rather than stranding
     the diagram on a motion it cannot perform. */
  useEffect(() => {
    /* Keyed on the model's id, not on `motions`: motionsOf() builds a fresh
       array every render, so depending on it runs this after every render for
       no reason. */
    const list = motionsOf(model);
    setActive((cur) => (list.some((m) => m.id === cur) ? cur : list[0].id));
  }, [model]);

  useEffect(() => {
    if (reduced) { setPhase(0.5); return undefined; }
    let start = null;
    const step = (now) => {
      if (start === null) start = now;
      setPhase(((now - start) / 3400) % 1);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [reduced, active]);

  const k = EASE(phase);
  const topL = model.top.w;

  // height: the column extends through the model's own range
  const [hMin, hMax] = model.height;
  const h = active === 'height' ? hMin + (hMax - hMin) * k : (hMin + hMax) / 2;

  // the two tilts, and the two travels
  const tilt = active === 'trend' && model.trendelenburg
    ? (k * 2 - 1) * model.trendelenburg : 0;
  const roll = active === 'lateral' && model.lateral ? (k * 2 - 1) * model.lateral : 0;
  const slide = active === 'slide' && model.slide ? (k * 2 - 1) * (model.slide / 2) : 0;
  const floatX = active === 'float' && model.float ? (k * 2 - 1) * (model.float.x / 2) : 0;

  const cx = MM.w / 2;
  const topY = FLOOR - h;
  const shift = slide + floatX;

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {motions.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActive(m.id)}
            aria-pressed={active === m.id}
            className={`rounded-full border px-3.5 py-1.5 font-data text-[0.625rem] uppercase
              tracking-[0.12em] transition-colors ${
              active === m.id
                ? 'border-action bg-action text-on-action'
                : 'border-hairline text-ink-2 hover:border-action hover:text-action'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${MM.w} ${MM.h}`}
        className="mt-6 block w-full"
        role="img"
        aria-label={`${model.name} shown in side elevation, performing its ${
          motions.find((m) => m.id === active)?.label.toLowerCase()} motion`}
      >
        {/* the floor, and the height the top is currently at */}
        <line x1="0" y1={FLOOR} x2={MM.w} y2={FLOOR} stroke="var(--hairline)" strokeWidth="4" />

        {/* the height envelope, drawn once so the range is visible as a space
            rather than only as a number */}
        {active === 'height' && (
          <g>
            <rect
              x={cx - topL / 2}
              y={FLOOR - hMax}
              width={topL}
              height={hMax - hMin}
              fill="var(--action-soft)"
            />
            {[hMin, hMax].map((v) => (
              <line
                key={v}
                x1={cx - topL / 2}
                y1={FLOOR - v}
                x2={cx + topL / 2}
                y2={FLOOR - v}
                stroke="var(--action)"
                strokeWidth="2"
                strokeDasharray="14 12"
                opacity="0.5"
              />
            ))}
          </g>
        )}

        {/* base and column — furniture, not measurements */}
        <g fill="var(--ink-3)" opacity="0.85">
          <rect x={cx - 430} y={FLOOR - 90} width={860} height={72} rx="26" />
          <circle cx={cx - 380} cy={FLOOR - 26} r="34" />
          <circle cx={cx + 380} cy={FLOOR - 26} r="34" />
        </g>
        <rect
          x={cx - 150}
          y={topY + 40}
          width={300}
          height={FLOOR - 90 - topY - 40}
          fill="var(--ink-3)"
          opacity="0.6"
        />
        <rect x={cx - 210} y={topY + 6} width={420} height={64} rx="10" fill="var(--ink-3)" />

        {/* the top: carbon, and the one thing drawn to scale */}
        <g transform={`translate(${cx + shift} ${topY}) rotate(${tilt})`}>
          {/* lateral tilt is a roll about the long axis, so in this elevation
              it shows as the top's own thickness opening up rather than as a
              rotation — squashing the section is the honest way to draw it */}
          <rect
            x={-topL / 2}
            y={-26 - Math.abs(roll) * 1.6}
            width={topL}
            height={40 + Math.abs(roll) * 3.2}
            rx="14"
            fill="var(--ink)"
          />
          <rect
            x={-topL / 2 + 24}
            y={-18 - Math.abs(roll) * 1.6}
            width={topL - 48}
            height={12}
            rx="6"
            fill="var(--action)"
            opacity="0.45"
          />
        </g>

        {/* travel markers, when a travel is what is being shown */}
        {(active === 'slide' || active === 'float') && (
          <g stroke="var(--action)" strokeWidth="2" opacity="0.6">
            {[-1, 1].map((s) => {
              /* Guarded like its siblings on lines 72-73. `active` can name a
                 motion the current model does not have for exactly one render;
                 unguarded this threw, and the mirror case emitted x1="NaN". */
              const travel = active === 'slide' ? model.slide : model.float?.x;
              if (!travel) return null;
              const span = travel / 2;
              return (
                <line
                  key={s}
                  x1={cx + s * span}
                  y1={topY - 90}
                  x2={cx + s * span}
                  y2={topY + 80}
                  strokeDasharray="12 10"
                />
              );
            })}
          </g>
        )}
      </svg>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2
        border-t border-hairline-soft pt-4">
        <p className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
          {motions.find((m) => m.id === active)?.label}
          <b className="ml-2.5 font-semibold text-action">
            {motions.find((m) => m.id === active)?.value}
          </b>
        </p>
        <p className="font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
          {`Top ${model.top.w} × ${model.top.d} mm`}
        </p>
      </div>
    </div>
  );
}
