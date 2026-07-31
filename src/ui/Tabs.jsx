import { useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn.js';
import { EASE_OUT, usePrefersReducedMotion } from '../lib/motion.js';

/**
 * Keyboard-accessible tablist. Arrow keys move between tabs with a roving
 * tabIndex, per the WAI-ARIA tabs pattern.
 *
 * items: [{ id, label, content }]
 */
export function Tabs({ items, className, panelClassName }) {
  const [active, setActive] = useState(items[0]?.id);
  const uid = useId();
  const refs = useRef([]);
  const reduced = usePrefersReducedMotion();

  const onKeyDown = (e, i) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + items.length) % items.length;
    setActive(items[next].id);
    refs.current[next]?.focus();
  };

  const activeItem = items.find((t) => t.id === active);

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Sections"
        className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-hairline-soft bg-sunk p-1"
      >
        {items.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              id={`${uid}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-[0.8125rem] font-semibold',
                'transition-[color,background-color,box-shadow] duration-200 ease-out',
                selected ? 'bg-surface text-action shadow-e1' : 'text-ink-2 hover:text-ink',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {activeItem && (
        <motion.div
          key={activeItem.id}
          role="tabpanel"
          id={`${uid}-panel-${activeItem.id}`}
          aria-labelledby={`${uid}-tab-${activeItem.id}`}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: EASE_OUT }}
          className={cn('pt-6', panelClassName)}
        >
          {activeItem.content}
        </motion.div>
      )}
    </div>
  );
}
