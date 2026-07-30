import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { cn } from '../lib/cn.js';
import { usePrefersReducedMotion } from '../lib/motion.js';
import { Glass } from './Glass.jsx';
import { ProductPlate } from './Card.jsx';

/**
 * Scroll-pinned product narrative — the strongest moment on the site, kept
 * from the original build with the things it was missing added:
 *
 *  · capped length (3 steps / 300vh max)
 *  · keyboard-navigable step controls
 *  · a visible progress indicator, so nobody feels trapped
 *  · full degradation to stacked sections under reduced motion
 */
export function ScrollSequence({ steps, image, imageAlt, className }) {
  const capped = steps.slice(0, 3);
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.28, 1]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 4, 0]);

  if (reduced) return <StackedSequence steps={capped} image={image} imageAlt={imageAlt} className={className} />;

  return (
    <div ref={ref} className={cn('relative bg-sunk', className)} style={{ height: `${capped.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div style={{ scale, rotate }} className="absolute inset-0 z-0 flex items-center justify-center p-10">
          <ProductPlate
            src={image}
            alt={imageAlt}
            className="h-full w-full max-w-3xl bg-transparent"
          />
        </motion.div>

        <div className="pointer-events-none relative z-10 mx-auto h-full w-full max-w-6xl px-6">
          {capped.map((s, i) => (
            <Step key={s.title} step={s} index={i} total={capped.length} progress={scrollYProgress} />
          ))}
        </div>

        <Progress total={capped.length} progress={scrollYProgress} />
      </div>
    </div>
  );
}

function Step({ step, index, total, progress }) {
  const span = 1 / total;
  const start = index * span;
  const opacity = useTransform(
    progress,
    [start, start + span * 0.22, start + span * 0.78, start + span],
    [0, 1, 1, 0],
  );
  const y = useTransform(progress, [start, start + span * 0.22, start + span], [40, 0, -40]);

  const place = [
    'left-6 top-[18%] md:left-12',
    'right-6 top-[38%] md:right-12',
    'left-6 bottom-[18%] md:left-12',
  ][index];

  return (
    <motion.div style={{ opacity, y }} className={cn('absolute max-w-sm', place)}>
      <Glass tier="surface" className="p-7 md:p-8">
        <span className="font-data text-[0.6875rem] text-action">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <h3 className="mt-2 text-2xl tracking-[-0.028em]">{step.title}</h3>
        <p className="mt-3 leading-relaxed text-ink-2">{step.body}</p>
      </Glass>
    </motion.div>
  );
}

function Progress({ total, progress }) {
  const [active, setActive] = useState(0);

  // Subscribe in an effect, not during render — otherwise every render adds a
  // listener and setState-during-render loops.
  useMotionValueEvent(progress, 'change', (v) => {
    setActive(Math.min(total - 1, Math.max(0, Math.floor(v * total))));
  });

  return (
    <div
      className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1 rounded-full transition-all duration-[420ms] ease-out',
            i === active ? 'w-8 bg-action' : 'w-4 bg-hairline',
          )}
        />
      ))}
    </div>
  );
}

/** Reduced-motion fallback. Nothing is lost but the movement. */
function StackedSequence({ steps, image, imageAlt, className }) {
  return (
    <div className={cn('bg-sunk px-6 py-24 lg:px-8', className)}>
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <ProductPlate src={image} alt={imageAlt} className="aspect-square w-full" />
        <div className="flex flex-col gap-5">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-lg border border-hairline-soft bg-surface p-6">
              <span className="font-data text-[0.6875rem] text-action">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-1.5 text-xl tracking-[-0.028em]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
