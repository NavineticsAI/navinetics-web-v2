import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/cn.js';

const VARIANTS = {
  primary:
    'bg-action text-on-action shadow-e1 hover:bg-action-hi hover:-translate-y-px hover:shadow-e2',
  secondary:
    'bg-transparent text-ink border-hairline hover:border-action hover:text-action hover:bg-action-soft',
  glass:
    'nn-glass text-ink [--gb:18px] rounded-full hover:-translate-y-px',
  ghost: 'bg-transparent text-ink-2 hover:bg-action-soft hover:text-action',
};

const SIZES = {
  sm: 'px-4 py-2 text-[0.8125rem]',
  md: 'px-5.5 py-2.5 text-sm',
  lg: 'px-7.5 py-3.5 text-base',
};

/**
 * One primary action per viewport. Everything else steps down.
 * Renders as <Link>, <a> or <button> depending on the props given.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  className,
  children,
  arrow = false,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border border-transparent',
    'font-semibold tracking-[-0.011em] whitespace-nowrap cursor-pointer',
    'transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-out',
    'active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none',
    'group/btn',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          size={size === 'lg' ? 18 : 15}
          className="transition-transform duration-200 ease-out group-hover/btn:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        {...props}
      >
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}

/** Inline text action with an underline that draws on hover. */
export function LinkAction({ to, href, children, className, ...props }) {
  const classes = cn(
    'group/la inline-flex items-center gap-1.5 font-semibold text-action',
    'rounded-sm transition-colors duration-200 hover:text-action-hi',
    className,
  );
  const content = (
    <>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-no-repeat bg-[position:0_100%] transition-[background-size] duration-[420ms] ease-out group-hover/la:bg-[length:100%_1px]">
        {children}
      </span>
      <ArrowRight
        size={16}
        className="transition-transform duration-200 ease-out group-hover/la:translate-x-1"
        aria-hidden="true"
      />
    </>
  );
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} target="_blank" rel="noreferrer" {...props}>
      {content}
    </a>
  );
}
