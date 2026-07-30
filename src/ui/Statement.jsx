import { cn } from '../lib/cn.js';
import { Reticle } from './Reticle.jsx';
import { Eyebrow, Reveal } from './Section.jsx';

/**
 * Short copy plus one action. Replaces the four different centred cards the
 * original build used — each in a different accent colour (slate on Careers,
 * emerald on the since-removed Investment page, emerald again on Community).
 * One component, one accent.
 */
export function Statement({ eyebrow, title, children, actions, framed = true, className }) {
  const Wrap = framed ? Reticle : 'div';
  return (
    <Reveal>
      <Wrap
        className={cn(
          'rounded-lg border border-hairline-soft bg-surface p-8 text-center md:p-12',
          className,
        )}
      >
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {title && <h2 className="mt-3.5 text-d2">{title}</h2>}
        <div className="mx-auto mt-4 max-w-prose text-lead leading-[1.55] tracking-[-0.015em] text-ink-2">
          {children}
        </div>
        {actions && <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
      </Wrap>
    </Reveal>
  );
}

/** Pull-quote for founder and long-form pages. */
export function PullQuote({ children, attribution, detail, className }) {
  return (
    <Reticle
      className={cn('rounded-lg border border-hairline-soft bg-surface p-7 md:p-8', className)}
    >
      <p className="text-2xl font-semibold leading-[1.35] tracking-[-0.028em]">{children}</p>
      {attribution && (
        <div className="mt-5 flex items-center gap-3">
          <div className="h-6 w-0.5 bg-action" aria-hidden="true" />
          <div>
            <div className="text-sm font-semibold">{attribution}</div>
            {detail && (
              <div className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
                {detail}
              </div>
            )}
          </div>
        </div>
      )}
    </Reticle>
  );
}
