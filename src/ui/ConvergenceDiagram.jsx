import { useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn.js';

/**
 * Six disciplines on an arc, each an approach trajectory converging on a single
 * iso-centre — the same geometry the Frame System uses to reach a target.
 *
 * The diagram doubles as the section's navigation: selecting a node drives the
 * detail panel, so the page needs no long scroll of near-identical role cards.
 *
 * Geometry lives in one place. VB crops the empty band above the topmost node,
 * and node positions are expressed as percentages derived from VB, so the SVG
 * viewBox and the HTML overlay can never drift apart.
 */
const CX = 280;
const CY = 392;
const R = 278;
const A0 = -74;
const A1 = 74;
const VB = { x: 0, y: 88, w: 560, h: 392 };

export function ConvergenceDiagram({ items, className }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  const nodes = useMemo(
    () =>
      items.map((d, i) => {
        const t = items.length === 1 ? 0.5 : i / (items.length - 1);
        const deg = A0 + (A1 - A0) * t;
        const rad = (deg * Math.PI) / 180;
        const x = CX + R * Math.sin(rad);
        const y = CY - R * Math.cos(rad);
        return { ...d, x, y, left: ((x - VB.x) / VB.w) * 100, top: ((y - VB.y) / VB.h) * 100 };
      }),
    [items],
  );

  const onKeyDown = (e, i) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (i + dir + nodes.length) % nodes.length;
    setActive(n);
    refs.current[n]?.focus();
  };

  const d = nodes[active];

  return (
    <div className={className}>
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="relative mx-auto mt-6 aspect-[560/392] w-full max-w-[640px] min-h-[300px]">
          <svg
            viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
            className="absolute inset-0 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <path
              d={`M${nodes[0].x.toFixed(1)} ${nodes[0].y.toFixed(1)} A${R} ${R} 0 0 1 ${nodes[
                nodes.length - 1
              ].x.toFixed(1)} ${nodes[nodes.length - 1].y.toFixed(1)}`}
              fill="none"
              stroke="var(--color-sg-400)"
              strokeWidth="1"
              opacity="0.22"
            />
            {nodes.map((n, i) => (
              <line
                key={n.id}
                x1={n.x.toFixed(1)}
                y1={n.y.toFixed(1)}
                x2={CX}
                y2={CY}
                stroke="var(--color-sg-400)"
                strokeWidth={i === active ? 2 : 1}
                className="transition-[opacity,stroke-width] duration-300 ease-out"
                opacity={i === active ? 1 : 0.1}
              />
            ))}
            <circle cx={CX} cy={CY} r="34" fill="none" stroke="var(--color-sg-300)" opacity=".5" />
            <circle cx={CX} cy={CY} r="19" fill="none" stroke="var(--color-sg-300)" opacity=".5" />
            <circle cx={CX} cy={CY} r="4.5" fill="var(--color-sg-300)" />
            <path
              d={`M${CX} ${CY - 52}v-16M${CX} ${CY + 52}v16M${CX - 68} ${CY}h-16M${CX + 68} ${CY}h16`}
              stroke="var(--color-sg-300)"
              strokeWidth="1"
              opacity=".5"
            />
          </svg>

          {nodes.map((n, i) => (
            <button
              key={n.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              aria-pressed={i === active}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="group/node absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center gap-1.5"
              style={{ left: `${n.left}%`, top: `${n.top}%` }}
            >
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full border-[1.5px] border-sg-400 transition-all duration-300 ease-out',
                  i === active
                    ? 'scale-125 bg-sg-300 shadow-[0_0_0_5px_rgb(130_186_217/0.18)]'
                    : 'bg-nn-800 group-hover/node:scale-125 group-hover/node:bg-sg-300',
                )}
              />
              <span
                className={cn(
                  'whitespace-nowrap font-[family-name:var(--font-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-300',
                  i === active ? 'text-sg-100' : 'text-nn-300 group-hover/node:text-sg-100',
                )}
              >
                {n.short}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel — full-bleed band beneath the diagram */}
      <div className="mt-11 border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-5xl gap-7 px-6 pb-16 pt-9 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <div>
            <span className="eyebrow !text-sg-300">{d.role}</span>
            <h3 className="mt-2 text-[clamp(1.6rem,3vw,2.25rem)]">{d.title}</h3>
            <p className="mt-3.5 max-w-[56ch] leading-relaxed text-nn-200">{d.body}</p>
            <div className="mt-6 border-l-2 border-sg-400 pl-4">
              <div className="font-[family-name:var(--font-mono)] text-[0.625rem] uppercase tracking-[0.14em] text-nn-300">
                A real problem from this desk
              </div>
              <p className="mt-1.5 max-w-[48ch] text-[1.0625rem] leading-relaxed text-nn-50">
                {d.problem}
              </p>
            </div>
          </div>

          <div>
            <div className="font-[family-name:var(--font-mono)] text-[0.625rem] uppercase tracking-[0.14em] text-nn-300">
              Owns
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.owns.map((o) => (
                <span
                  key={o}
                  className="rounded-full border border-white/15 px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[0.625rem] uppercase tracking-[0.1em] text-nn-100"
                >
                  {o}
                </span>
              ))}
            </div>

            <div className="mt-7 font-[family-name:var(--font-mono)] text-[0.625rem] uppercase tracking-[0.14em] text-nn-300">
              Works next to
            </div>
            <ul className="mt-3 flex flex-col gap-3">
              {d.with.map(([who, what]) => (
                <li key={who} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-nn-200">
                  <span className="shrink-0 pt-0.5 font-[family-name:var(--font-mono)] text-[0.625rem] text-sg-300">
                    {who}
                  </span>
                  <span>{what}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
