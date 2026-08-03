import { useId, useMemo, useState } from 'react';
import { locatorMap, places } from '../data/locatorMap.js';

/**
 * Where Rochester is.
 *
 * SVG rather than canvas on purpose. The globe on /company/partners is canvas
 * because it redraws ~4,800 dots sixty times a second; this is two hundred
 * static points and two labels, where markup wins outright — it inherits the
 * theme through currentColor and CSS variables with no palette plumbing, the
 * places are real focusable elements, and it stays sharp at any zoom.
 *
 * The outline replaces a photograph of downtown Rochester that was hotlinked
 * from a third-party image CDN with no licence on file. Natural Earth is
 * public domain and the whole thing is a few kilobytes.
 */

/**
 * Equirectangular, with longitude squeezed by cos(mid-latitude).
 *
 * At the scale of one American state the difference between this and a proper
 * conic projection is a fraction of a pixel, and it keeps the whole thing to
 * three lines of arithmetic. Latitude is negated because SVG's y axis points
 * down and north does not.
 */
function useProjection(pad = 0.14, aspect = 1.5) {
  return useMemo(() => {
    let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
    for (const r of locatorMap.home) {
      for (const [x, y] of r) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    const k = Math.cos(((y0 + y1) / 2) * (Math.PI / 180));
    const project = ([lon, lat]) => [lon * k, -lat];

    // frame the home state, then widen or heighten to the target aspect
    const c = [project([x0, y1]), project([x1, y0])];
    let w = (c[1][0] - c[0][0]) * (1 + pad * 2);
    let h = (c[1][1] - c[0][1]) * (1 + pad * 2);
    /* Minnesota is very nearly square in this projection, and a square map in a
       half-width column stands taller than the fold. Growing the short side to
       a fixed 3:2 keeps the block landscape and lets the neighbouring states
       show, which is what makes it read as a location rather than a shape. */
    if (w / h < aspect) w = h * aspect; else h = w / aspect;
    const mx = (c[0][0] + c[1][0]) / 2;
    const my = (c[0][1] + c[1][1]) / 2;
    const box = { x: mx - w / 2, y: my - h / 2, w, h };

    const path = (ring) => `${ring.map((p, i) => `${i ? 'L' : 'M'}${project(p).map((n) => n.toFixed(3)).join(' ')}`).join('')}Z`;
    return { project, box, path };
  }, [pad, aspect]);
}

export function LocatorMap({ className }) {
  const { project, box, path } = useProjection();
  const [active, setActive] = useState('roc');
  const gid = useId();

  // stroke widths are in user units, so they must scale with the viewBox
  const u = box.w / 620;

  return (
    <figure className={className}>
      <svg
        viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
        className="block w-full text-ink-3"
        role="img"
        aria-label="Rochester, Minnesota, shown against the surrounding states"
      >
        <defs>
          <radialGradient id={`${gid}-halo`}>
            <stop offset="0%" stopColor="var(--action)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--action)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* neighbours, quiet */}
        {locatorMap.context.map((c) => (
          <g key={c.name}>
            {c.rings.map((r, i) => (
              <path
                key={i}
                d={path(r)}
                fill="var(--hairline-soft)"
                stroke="var(--hairline)"
                strokeWidth={u * 0.8}
                strokeLinejoin="round"
              />
            ))}
          </g>
        ))}

        {/* Minnesota */}
        {locatorMap.home.map((r, i) => (
          <path
            key={i}
            d={path(r)}
            fill="var(--action-soft)"
            stroke="var(--action)"
            strokeWidth={u * 1.6}
            strokeLinejoin="round"
          />
        ))}

        {places.map((p) => {
          const [x, y] = project([p.lon, p.lat]);
          const on = active === p.id;
          /* The two places are ~124 km apart, which at this scale is close
             enough that same-side labels would collide. Rochester's sits
             below its point, the Twin Cities' above. */
          const below = !!p.home;
          return (
            <g key={p.id}>
              {p.home && <circle cx={x} cy={y} r={u * 34} fill={`url(#${gid}-halo)`} />}
              <circle
                cx={x}
                cy={y}
                r={u * (p.home ? 5.5 : 4)}
                fill={p.home ? 'var(--action)' : 'var(--surface)'}
                stroke={p.home ? 'var(--surface)' : 'var(--ink-3)'}
                strokeWidth={u * 1.8}
              />
              <text
                x={x}
                y={y + u * (below ? 22 : -13)}
                textAnchor="middle"
                fill={p.home ? 'var(--action)' : 'var(--ink-3)'}
                style={{ font: `${on ? 600 : 500} ${u * 11}px var(--font-mono)`, letterSpacing: `${u * 0.8}px` }}
              >
                {p.name}
              </text>
              {/* the hit target: generous, invisible, and focusable */}
              <circle
                cx={x}
                cy={y}
                r={u * 22}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={p.name}
                onMouseEnter={() => setActive(p.id)}
                onFocus={() => setActive(p.id)}
                className="cursor-pointer outline-none"
              />
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-4 font-data text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
        {/* 124 km is the great-circle distance between the two civic
            coordinates, computed in tools/locator-map.mjs — not an estimate. */}
        Rochester, Minnesota · 124 km from Minneapolis–Saint Paul
      </figcaption>
    </figure>
  );
}
