import { useRef, useState } from 'react';
import { cn } from '../lib/cn.js';
import { ProductPlate } from './Card.jsx';
import { Reticle } from './Reticle.jsx';

/**
 * Product gallery: main view plus thumbnails.
 * Thumbnails are buttons with aria-current; arrow keys move the selection.
 *
 * items: [{ src, caption, fit }]
 */
export function Gallery({ items, className, framed = true }) {
  const [i, setI] = useState(0);
  const refs = useRef([]);
  const active = items[i];

  const onKeyDown = (e, idx) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (idx + dir + items.length) % items.length;
    setI(next);
    refs.current[next]?.focus();
  };

  const Main = framed ? Reticle : 'div';

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Main className="relative">
        <ProductPlate
          src={active.src}
          alt={active.caption}
          fit={active.fit}
          className="aspect-[16/10] w-full"
        />
        <span
          className={cn(
            'nn-glass absolute bottom-3 left-3 rounded-full px-3 py-1.5 [--gb:14px]',
            'font-data text-[0.6875rem] text-ink-2',
          )}
        >
          {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')} —{' '}
          {active.caption}
        </span>
      </Main>

      {items.length > 1 && (
        <div className="flex gap-2" role="group" aria-label="Gallery thumbnails">
          {items.map((it, idx) => (
            <button
              key={it.src}
              ref={(el) => {
                refs.current[idx] = el;
              }}
              type="button"
              aria-label={it.caption}
              aria-current={idx === i}
              onClick={() => setI(idx)}
              onKeyDown={(e) => onKeyDown(e, idx)}
              className={cn(
                'flex-1 cursor-pointer overflow-hidden rounded-sm border p-0',
                'transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5',
                idx === i ? 'border-action' : 'border-hairline-soft',
              )}
            >
              <ProductPlate
                src={it.src}
                alt=""
                fit={it.fit}
                className={cn('aspect-square w-full rounded-none', idx !== i && 'opacity-60')}
                imgClassName="!p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
