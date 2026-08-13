import { cn } from '../lib/cn.js';
import logo from '../assets/logo.png';
import logoReversed from '../assets/logo-reversed.png';

/**
 * The NaviNetics lockup.
 *
 * The artwork itself, drawn as an image — the same file navinetics.com serves,
 * byte for byte.
 *
 * It used to be a CSS mask: this PNG supplied the silhouette, and a single flat
 * `--logo-ink` was poured through it, lit by a travelling highlight and drifted
 * in hue. That treatment could recolour itself per theme, but a mask reads only
 * the alpha channel — so it discarded the gradient across the ribbon, the fold
 * shading, and the fact that the mark and the wordmark are two different blues
 * (#196184 and #164f6a). Every placement rendered one flat colour that matched
 * neither, and the light-mode footer did not even match the light-mode navbar.
 * An image cannot get the colour wrong, because it is the colour.
 *
 * The trade is that an image cannot recolour itself for a dark ground, which is
 * what `reversed` is for. src/assets/logo-reversed.png is derived from the same
 * master — lightness remapped onto a light band, hues held — so the gradient and
 * the folds survive. It is not a white silhouette.
 *
 * @param {number}  height    rendered height in px; width follows the artwork
 * @param {boolean} reversed  use the light lockup, for dark grounds
 */
export function Logo({ height = 28, className, reversed = false }) {
  return (
    <img
      src={reversed ? logoReversed : logo}
      alt="NaviNetics"
      /* Intrinsic size of the artwork. Both are 375×74; giving the browser the
         ratio up front means the header does not reflow as the logo loads. */
      width={375}
      height={74}
      className={cn('block w-auto', className)}
      style={{ height }}
    />
  );
}
