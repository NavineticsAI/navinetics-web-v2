import { cn } from '../lib/cn.js';
import { Badge } from './Badge.jsx';
import { Button } from './Button.jsx';
import { Reticle } from './Reticle.jsx';
import { Reveal } from './Section.jsx';

/**
 * Honest placeholder for a page whose content doesn't exist yet.
 *
 * The alternative — inventing specifications to fill a template — is exactly
 * the failure mode to avoid on a medical device site, where numbers are
 * regulated claims. This states plainly that the page is incomplete and, in
 * development, lists what is outstanding so it can't be quietly forgotten.
 */
export function ComingSoon({ title, body, needs: _needs, action = true, badge = true, className }) {
  return (
    <Reveal>
      <Reticle
        className={cn(
          'rounded-lg border border-hairline-soft bg-surface p-8 md:p-12',
          className,
        )}
      >
        <div className="flex flex-col items-start gap-4">
          {/* Opt-out rather than removal: three other pages still rely on this
              chip to state their status. */}
          {badge && (
            <Badge tone="warn" dot>
              In development
            </Badge>
          )}
          <h2 className="text-d2">{title}</h2>
          {body && <p className="max-w-prose text-lead leading-[1.55] text-ink-2">{body}</p>}
        </div>

        {/* `needs` is NO LONGER RENDERED.
            It used to print a "Still to come" checklist — entries like
            "Regulatory status", "Imaging-system compatibility", "Radiolucency
            characteristics — no attenuation figure is published". That is a
            project-management list about what NaviNetics has not documented,
            shown to a surgeon or a purchasing manager who asked what the
            product does. Publishing the gaps does not make the page more
            honest; it makes it read as unfinished, and it hands a competitor a
            list of what we cannot substantiate.

            The prop is deliberately still accepted, and callers still pass it,
            so the record of what is outstanding stays with the product data
            where it is useful — see data/products.js and data/technology.js,
            and docs/shubham/04-open-items.md. */}

        {action && (
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="mailto:info@navinetics.com" arrow>
              Ask us about it
            </Button>
            <Button to="/products/d1-stereotactic-frame" variant="secondary">
              See what's available now
            </Button>
          </div>
        )}
      </Reticle>
    </Reveal>
  );
}
