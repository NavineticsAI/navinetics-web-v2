import { useEffect, useRef } from 'react';
import { cn } from '../lib/cn.js';
import { attachLens, canRefract, LENS_DEFAULTS } from '../lib/lens.js';

const TIERS = { chrome: 14, surface: 26, modal: 40 };

/**
 * FROSTED glass. Heavy blur, opaque-ish tint, no displacement.
 * Tuned so text sitting ON the glass stays crisp: navigation, toolbars,
 * modals, captions. For looking THROUGH glass, use <Lens>.
 */
export function Glass({ tier = 'surface', as: As = 'div', className, style, children, ...props }) {
  const ref = useRef(null);

  // The pointer-tracked sheen (L4). Cheap — two custom properties.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    return () => el.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <As
      ref={ref}
      className={cn('nn-glass rounded-lg', className)}
      style={{ '--gb': `${TIERS[tier] ?? TIERS.surface}px`, ...style }}
      {...props}
    >
      {children}
    </As>
  );
}

/**
 * LENS glass. Lightly blurred, barely tinted, hard refracting — it physically
 * displaces the page content behind it, hard at the bevel and not at all
 * through the middle, with a second lens that follows the pointer.
 *
 * Budget: at most three on screen at once, and never on the sticky navbar.
 * Chromium-only; elsewhere it degrades to frosted glass plus a bevel ring.
 */
export function Lens({
  as: As = 'div',
  className,
  style,
  children,
  bevel = LENS_DEFAULTS.bevel,
  edge = LENS_DEFAULTS.edge,
  pointer = LENS_DEFAULTS.pointer,
  chroma = LENS_DEFAULTS.chroma,
  blur = LENS_DEFAULTS.blur,
  ...props
}) {
  const ref = useRef(null);

  useEffect(
    () => attachLens(ref.current, { bevel, edge, pointer, chroma, blur }),
    [bevel, edge, pointer, chroma, blur],
  );

  return (
    <As
      ref={ref}
      className={cn('nn-glass nn-lens rounded-lg', className)}
      style={{ '--gb': `${blur}px`, ...style }}
      {...props}
    >
      {/* Bevel ring for browsers without SVG-filter backdrops. Hidden by CSS
          once the capability probe passes. */}
      {!canRefract() && <span className="nn-glass-edge" aria-hidden="true" />}
      {children}
    </As>
  );
}
