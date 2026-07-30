import { motion } from 'framer-motion';
import { cn } from '../lib/cn.js';
import { fadeUp, reveal, revealProps, usePrefersReducedMotion } from '../lib/motion.js';

/** Page section with the standard vertical rhythm. `band` recesses it. */
export function Section({
  as: As = 'section',
  band = false,
  dark = false,
  className,
  innerClassName,
  wide = false,
  children,
  ...props
}) {
  return (
    <As
      className={cn(
        'px-6 py-24 md:py-32 lg:py-40 lg:px-8',
        band && 'bg-sunk',
        dark && 'bg-nn-950 text-nn-50',
        className,
      )}
      {...props}
    >
      <div className={cn('mx-auto', wide ? 'max-w-7xl' : 'max-w-5xl', innerClassName)}>
        {children}
      </div>
    </As>
  );
}

/** Mono, uppercase, wide-tracked. Reserved for measured or categorical labels. */
export function Eyebrow({ className, children, ...props }) {
  return (
    <span className={cn('eyebrow text-action', className)} {...props}>
      {children}
    </span>
  );
}

/** Tick-marked hairline that opens a section. */
export function TickLine({ className }) {
  return (
    <div className={cn('nn-tick relative mb-1 h-px bg-hairline', className)} aria-hidden="true" />
  );
}

/** Standard section opener: rule, eyebrow, heading, lead. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'left',
  tick = true,
  level: Level = 'h2',
  className,
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      variants={reveal(reduced, fadeUp)}
      {...revealProps}
      className={cn(
        'flex flex-col gap-3.5',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {tick && align !== 'center' && <TickLine />}
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {title && <Level className="text-d2">{title}</Level>}
      {lead && (
        <p
          className={cn(
            'text-lead font-normal leading-[1.55] tracking-[-0.015em] text-ink-2 max-w-prose',
            align === 'center' && 'mx-auto',
          )}
        >
          {lead}
        </p>
      )}
    </motion.div>
  );
}

/** Scroll-reveal wrapper so pages don't hand-write the four motion props. */
export function Reveal({ as = 'div', variant, delay = 0, className, children, ...props }) {
  const reduced = usePrefersReducedMotion();
  const MotionTag = motion[as] ?? motion.div;
  return (
    <MotionTag
      variants={reveal(reduced, variant)}
      {...revealProps}
      transition={delay ? { delay } : undefined}
      className={className}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
