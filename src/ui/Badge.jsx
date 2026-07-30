import { cn } from '../lib/cn.js';

const TONES = {
  action: 'bg-action-soft text-action border-transparent',
  line: 'bg-transparent text-ink-2 border-hairline',
  ok: 'bg-ok-soft text-ok border-transparent',
  warn: 'bg-warn-soft text-warn border-transparent',
  crit: 'bg-crit-soft text-crit border-transparent',
};

/**
 * Status pill. Semantic tones sit outside the blue family on purpose, so a
 * status never reads as brand emphasis and never reads as a link.
 */
export function Badge({ tone = 'action', dot = false, className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-eyebrow !tracking-[0.11em]',
        TONES[tone] ?? TONES.action,
        className,
      )}
      {...props}
    >
      {dot && <i className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
