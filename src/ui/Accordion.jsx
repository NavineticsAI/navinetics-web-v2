import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn.js';

/**
 * Progressive disclosure for dense technical content.
 *
 * Height animates via grid-template-rows 0fr → 1fr, which needs no content
 * measurement and is cheaper than animating max-height.
 *
 * items: [{ id, label, body, index? }]
 */
export function Accordion({ items, className }) {
  const [open, setOpen] = useState(() => new Set());

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={cn('overflow-hidden rounded-md border border-hairline-soft bg-surface', className)}>
      {items.map((item, i) => {
        const isOpen = open.has(item.id);
        return (
          <div key={item.id} className={cn(i > 0 && 'border-t border-hairline-soft')}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left',
                'text-sm font-semibold text-ink transition-colors duration-100 hover:bg-action-soft',
              )}
            >
              {item.index && (
                <span className="font-data text-[0.6875rem] text-ink-3">{item.index}</span>
              )}
              <span className="flex-1">{item.label}</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={cn(
                  'shrink-0 transition-transform duration-[420ms] ease-out',
                  isOpen ? 'rotate-180 text-action' : 'text-ink-3',
                )}
              />
            </button>
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-[420ms] ease-out',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pl-11 text-sm leading-relaxed text-ink-2">
                  {item.body}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
