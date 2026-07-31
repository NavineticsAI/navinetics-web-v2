import { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../lib/cn.js';

const CONTROL = cn(
  'w-full rounded-sm border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink',
  'transition-[border-color,box-shadow] duration-200',
  'placeholder:text-ink-3 hover:border-ink-3',
  'focus:border-action focus:outline-none focus:ring-[3px] focus:ring-action-soft',
  'aria-[invalid=true]:border-crit aria-[invalid=true]:ring-crit-soft',
  'disabled:opacity-50 disabled:pointer-events-none',
);

/**
 * Labelled form control with full state coverage.
 *
 * Error copy rule: say what to DO, not that something is wrong.
 * "Add the part after the @" beats "Invalid email" every time.
 */
export function Field({
  label,
  as = 'input',
  error,
  hint,
  success,
  className,
  id: idProp,
  children,
  ...props
}) {
  const auto = useId();
  const id = idProp ?? auto;
  const msgId = `${id}-msg`;
  const Tag = as;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="eyebrow !tracking-[0.13em] text-ink-3">
        {label}
      </label>
      <Tag
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint || success ? msgId : undefined}
        className={cn(
          CONTROL,
          as === 'textarea' && 'min-h-[88px] resize-y leading-relaxed',
          as === 'select' && 'cursor-pointer appearance-none pr-9',
          success && !error && 'border-ok',
        )}
        {...props}
      >
        {children}
      </Tag>
      {(error || hint || success) && (
        <span
          id={msgId}
          className={cn(
            'text-xs',
            error ? 'flex items-center gap-1.5 text-crit' : success ? 'text-ok' : 'text-ink-3',
          )}
        >
          {error && <AlertCircle size={12} aria-hidden="true" />}
          {error || success || hint}
        </span>
      )}
    </div>
  );
}

/** Accessible switch. A real role=switch, not a styled div. */
export function Switch({ checked, onChange, label, id: idProp, className }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <label
      htmlFor={id}
      className={cn('flex cursor-pointer items-center gap-3 text-sm text-ink-2', className)}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-out',
          checked ? 'border-action bg-action' : 'border-hairline bg-sunk',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-e1',
            'transition-transform duration-[420ms] ease-[cubic-bezier(.34,1.4,.64,1)]',
            checked && 'translate-x-5',
          )}
        />
      </button>
      {label}
    </label>
  );
}
