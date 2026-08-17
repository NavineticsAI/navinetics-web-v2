import { cn } from '../lib/cn.js';

/**
 * Corner marks, no full border. Frames a subject being TARGETED — a product
 * shot, a key figure, a pull-quote.
 *
 * Restraint rule: one reticle device per viewport. The moment corner marks
 * appear on every card they stop meaning "this is the target" and become
 * wallpaper. Never on interactive controls; never nested.
 */
export function Reticle({ as: As = 'div', className, children, ...props }) {
  return (
    <As className={cn('nn-retic', className)} {...props}>
      {children}
    </As>
  );
}

/** A measurement rule along one edge. Section dividers, panel headers. */
export function Rule({ className, ...props }) {
  return <div className={cn('nn-rule', className)} aria-hidden="true" {...props} />;
}

/**
 * Concentric arcs converging on a point — the iso-center of an arc-centered
 * frame. A background watermark, never a foreground element. Keep opacity
 * between 15% and 25%.
 */
export function IsoMark({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      className={cn('pointer-events-none text-action', className)}
      {...props}
    >
      <circle cx="100" cy="100" r="86" />
      <circle cx="100" cy="100" r="58" />
      <circle cx="100" cy="100" r="30" />
      <path d="M100 4v40M100 156v40M4 100h40M156 100h40" />
      <circle cx="100" cy="100" r="4" fill="currentColor" />
    </svg>
  );
}
