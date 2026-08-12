import { motion } from 'framer-motion';
import { cn } from '../lib/cn.js';
import { fadeUp, reveal, revealProps, usePrefersReducedMotion } from '../lib/motion.js';

/**
 * Page section: the one place the site's gutter, measure and vertical rhythm
 * are declared. Anything that builds its own <section> re-declares all three
 * and drifts — docs/shubham/03-layout-system.md has what that measured out to.
 *
 * THE MEASURE. One frame, max-w-7xl (1280px), for every section on every page.
 * It used to be two: max-w-5xl by default, max-w-7xl behind a `wide` prop. That
 * put about half the site's sections on a 1024px measure and half on 1280px,
 * alternating within single pages — a 128px jump in the left edge between
 * adjacent sections at 1440px, which is the whole reason the site read as
 * unaligned. Long-form text stays readable through max-w-prose on the text
 * itself, which is the right place for it: the frame should not narrow because
 * a paragraph is inside it.
 *
 * `wide` is still accepted so existing callers keep working, but it no longer
 * changes anything. Drop it from call sites as they are touched.
 *
 * THE RHYTHM. py-16 md:py-20 lg:py-24 — 96px a side at desktop. Sections stack,
 * so the gap between two of them is TWICE the padding: 192px here, where the
 * previous lg:py-40 gave 320px — about a third of a laptop screen with nothing
 * in it. `band` recesses a section onto the sunk ground.
 */
export function Section({
  as: As = 'section',
  band = false,
  dark = false,
  className,
  innerClassName,
  wide: _wide = false,
  children,
  ...props
}) {
  return (
    <As
      className={cn(
        'px-6 py-16 md:py-20 lg:px-8 lg:py-24',
        band && 'bg-sunk',
        dark && 'bg-nn-950 text-nn-50',
        className,
      )}
      {...props}
    >
      <div className={cn('nn-frame mx-auto', innerClassName)}>{children}</div>
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
