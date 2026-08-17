import { useEffect, useState } from 'react';

export const EASE_OUT = [0.16, 1, 0.3, 1];
export const EASE_INOUT = [0.65, 0, 0.35, 1];
export const EASE_SPRING = [0.34, 1.4, 0.64, 1];

export const D = { d1: 0.12, d2: 0.22, d3: 0.42, d4: 0.72, cine: 1.1 };

/** True when the user has asked the OS to reduce motion. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: D.d3, ease: EASE_OUT } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: D.d3, ease: EASE_OUT } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: D.d4, ease: EASE_OUT } },
};

/** Container that staggers its children. */
export const stagger = (gap = 0.06, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/**
 * The standard scroll-reveal bundle. Use this instead of hand-writing the four
 * props — that is how the previous build ended up with six different timings.
 * Entrances fire once; re-animating on every scroll-back is exhausting.
 */
export const revealProps = {
  initial: 'hidden',
  whileInView: 'show',
  /* A PRE-TRIGGER, AND IT USED TO BE THE OPPOSITE.
     It was `-80px`, which SHRINKS the observer root: a block had to travel 80px
     past the edge of the screen before it was allowed to start fading, and then
     took another 420ms to arrive. Reported from a phone as the header loading
     but "the rest of the content once we scroll takes a bit to load" — which is
     exactly what it was, since a thumb-flick covers a screen height in a few
     hundred milliseconds and the reader outruns the animation.

     A positive margin GROWS the root, so the reveal starts while the block is
     still a screen below the fold and has finished by the time it is looked at.
     Same variants, same duration, same easing; only the moment it begins moves.

     Asymmetric on purpose, and nothing horizontal — a wide inline margin would
     arm carousels and side-scrollers nowhere near the screen. */
  viewport: { once: true, margin: '20% 0px 60% 0px' },
};

/** Pick the right variant set for the user's motion preference. */
export function reveal(reduced, variant = fadeUp) {
  return reduced ? fadeIn : variant;
}
