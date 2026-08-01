import { cn } from '../lib/cn.js';

/**
 * The NaviNetics lockup.
 *
 * Not an `<img>`. The same file the site has always shipped is used as a
 * mask, which is what lets the artwork be filled with one flat brand colour
 * and lit from underneath without a single shape being redrawn — the
 * letterforms, the weights and the spacing are the file's own.
 *
 * The mark is two ribbon strokes, and a light runs each of them in turn every
 * eight seconds; the word answers with a pass of its own and a slow hue
 * drift. All of it is styling — see `.nn-logo` in index.css — so this
 * component is only the boxes those rules need.
 *
 * @param {number} height  rendered height in px; everything else scales from it
 */
export function Logo({ height = 28, className }) {
  return (
    <span
      role="img"
      aria-label="NaviNetics"
      className={cn('nn-logo', className)}
      style={{ '--h': height }}
    >
      <span className="nn-logo-stage">
        <span className="nn-logo-piece nn-logo-mark">
          <span className="nn-logo-lay">
            <i className="nn-logo-fx nn-logo-run nn-logo-run-1" />
          </span>
          <span className="nn-logo-lay">
            <i className="nn-logo-fx nn-logo-run nn-logo-run-2" />
          </span>
        </span>
        <span className="nn-logo-piece nn-logo-word">
          <span className="nn-logo-lay">
            <i className="nn-logo-fx nn-logo-wave" />
          </span>
          <span className="nn-logo-lay nn-logo-lay-hue">
            <i className="nn-logo-fx nn-logo-hue" />
          </span>
        </span>
      </span>
    </span>
  );
}
