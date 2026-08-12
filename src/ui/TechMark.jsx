import { cn } from '../lib/cn.js';

/**
 * Marks for the Technology mega-panel.
 *
 * WHY DRAWN AND NOT PHOTOGRAPHED. The panel slot is 64 × 56 CSS px — about
 * 3,600 pixels. Three attempts at photography failed there and the failures
 * were instructive: the panel first showed the SAME pictures as the Products
 * panel (it read `hero`, and the D1 photograph appeared in both), then the full
 * science figures, which at that size became a brown blob, a white box with a
 * smudge in it, and a field of noise. Cropping helped and was still not good.
 *
 * No photograph survives 3,600 pixels. A mark drawn FOR the size does, and it
 * is sharp at any density, follows the theme, weighs nothing, and needs no
 * permission from anyone.
 *
 * THE LANGUAGE is IsoMark's, in Reticle.jsx: one stroke weight, no fills except
 * the point being marked, geometry that means something rather than decorating.
 * Each of these is the subject of its page reduced to the fewest strokes that
 * still say which one it is:
 *
 *   stereotaxy  an arc, and the one point every approach along it reaches
 *   neuro       the triangular FSCV sweep, and the response it draws out
 *   ai          four planning panes with a crosshair through them
 *
 * `currentColor` throughout, so the caller sets the colour and dark mode is
 * automatic.
 */
const MARKS = {
  /* Arc-centred targeting. The arc, a probe running down it to the focus, and
     the focus itself — which is the whole of what arc-centred means. */
  stereotaxy: (
    <>
      <path d="M10 40a22 22 0 0 1 44 0" />
      <path d="M32 18v22" />
      <circle cx="32" cy="40" r="7" />
      <circle cx="32" cy="40" r="2" fill="currentColor" stroke="none" />
      <path d="M32 47v5M25 40h-5M44 40h5" opacity="0.55" />
    </>
  ),

  /* Fast-scan cyclic voltammetry: the potential ramps up and back down in a
     triangle, and the current that comes out peaks on the way. Two lines,
     which is genuinely what the instrument does. */
  neuro: (
    <>
      <path d="M6 22h8l9-13 9 26 9-13h9" />
      <path d="M6 46h9c4 0 5-11 9-11s5 11 9 11h20" opacity="0.55" />
      <circle cx="32" cy="35" r="2" fill="currentColor" stroke="none" />
    </>
  ),

  /* The planning workspace: orthogonal panes with one target running through
     all of them, which is the thing the software is for. */
  ai: (
    <>
      <rect x="7" y="11" width="22" height="17" rx="2" />
      <rect x="35" y="11" width="22" height="17" rx="2" />
      <rect x="7" y="32" width="22" height="17" rx="2" />
      <rect x="35" y="32" width="22" height="17" rx="2" />
      <path d="M18 5v50M2 30h60" opacity="0.45" />
      <circle cx="18" cy="30" r="3.5" />
      <circle cx="18" cy="30" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
};

/**
 * One mark, sized to the mega-panel slot by default.
 *
 * Decorative: the entry's title and summary sit beside it and carry the
 * meaning, so this is aria-hidden rather than given a label nobody needs read
 * aloud twice.
 */
export function TechMark({ name, className }) {
  const art = MARKS[name];
  if (!art) return null;
  return (
    <span
      className={cn(
        'grid h-14 w-16 shrink-0 place-items-center rounded-sm',
        'border border-hairline-soft bg-sunk text-action',
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 60"
        width="40"
        height="38"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {art}
      </svg>
    </span>
  );
}
