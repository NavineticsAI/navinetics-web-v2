import { cn } from '../lib/cn.js';
import { Badge } from './Badge.jsx';
import { Button } from './Button.jsx';
import { Reticle } from './Reticle.jsx';
import { Eyebrow, Reveal } from './Section.jsx';

/**
 * Honest placeholder for a page whose content doesn't exist yet.
 *
 * The alternative — inventing specifications to fill a template — is exactly
 * the failure mode to avoid on a medical device site, where numbers are
 * regulated claims. This states plainly that the page is incomplete and, in
 * development, lists what is outstanding so it can't be quietly forgotten.
 */
export function ComingSoon({ title, body, needs, action = true, className }) {
  return (
    <Reveal>
      <Reticle
        className={cn(
          'rounded-lg border border-hairline-soft bg-surface p-8 md:p-12',
          className,
        )}
      >
        <div className="flex flex-col items-start gap-4">
          <Badge tone="warn" dot>
            In development
          </Badge>
          <h2 className="text-d2">{title}</h2>
          {body && <p className="max-w-prose text-lead leading-[1.55] text-ink-2">{body}</p>}
        </div>

        {needs?.length > 0 && (
          <div className="mt-9 border-t border-hairline-soft pt-7">
            <Eyebrow className="!text-ink-3">Still to come</Eyebrow>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {needs.map((n) => (
                <li key={n} className="flex items-start gap-3 text-sm text-ink-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warn"
                    aria-hidden="true"
                  />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        )}

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
