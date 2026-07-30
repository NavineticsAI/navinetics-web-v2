import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/cn.js';
import { Badge } from './Badge.jsx';

/** Base surface card. `lift` adds the hover elevation. */
export function Card({ as: As = 'div', lift = false, className, children, ...props }) {
  return (
    <As
      className={cn(
        'rounded-lg border border-hairline-soft bg-surface p-6 md:p-7',
        'transition-[transform,box-shadow,border-color] duration-[420ms] ease-out',
        lift && 'hover:-translate-y-1 hover:border-hairline hover:shadow-e3',
        className,
      )}
      {...props}
    >
      {children}
    </As>
  );
}

/**
 * Product plate.
 *
 * INTERIM TREATMENT. Product shots still rely on mix-blend-multiply, which
 * only works over a light ground — on the dark theme they would become black
 * mush. The plate stays light in both themes so the images survive. Replace
 * with transparent-background cutouts when they exist; this is the only place
 * mix-blend-multiply is permitted.
 */
export function ProductPlate({ src, alt = '', fit = 'contain', className, imgClassName, children }) {
  return (
    <div
      className={cn(
        'nn-plate relative flex items-center justify-center overflow-hidden rounded-xl',
        className,
      )}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            'h-full w-full transition-transform duration-700 ease-out',
            fit === 'cover' ? 'object-cover' : 'object-contain p-8',
            imgClassName,
          )}
        />
      )}
      {children}
    </div>
  );
}

/** Catalogue card. Driven by a record from data/products.js. */
export function ProductCard({ product, className }) {
  return (
    <Link
      to={product.path}
      className={cn(
        'group/pc flex flex-col overflow-hidden rounded-lg border border-hairline-soft bg-surface',
        'transition-[transform,box-shadow,border-color] duration-[420ms] ease-out',
        'hover:-translate-y-1.5 hover:border-hairline hover:shadow-e3',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductPlate
          src={product.hero}
          alt={product.heroAlt}
          className="h-full w-full rounded-none"
          imgClassName="group-hover/pc:scale-105"
        />
        {product.tag && (
          <Badge tone={product.tag.tone} className="absolute left-3 top-3">
            {product.tag.label}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5 md:p-6">
        <h3 className="text-lg tracking-[-0.025em]">{product.family}</h3>
        <p className="flex-1 text-sm leading-relaxed text-ink-2">{product.summary}</p>
        <div className="mt-2 flex items-center justify-between border-t border-hairline-soft pt-3.5">
          <span className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
            {product.shortName}
          </span>
          <span
            className={cn(
              'grid h-7 w-7 place-items-center rounded-full bg-action-soft text-action',
              'transition-[background-color,color,transform] duration-200 ease-out',
              'group-hover/pc:bg-action group-hover/pc:text-on-action group-hover/pc:translate-x-0.5',
            )}
            aria-hidden="true"
          >
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Metric tile. `value` is set in tabular figures. */
export function StatTile({ label, value, unit, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-md border border-hairline-soft bg-surface p-5',
        className,
      )}
    >
      <span className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
        {label}
      </span>
      <b className="text-[clamp(1.5rem,3vw,2.125rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums">
        {value}
      </b>
      {unit && <span className="text-[0.8125rem] text-ink-2">{unit}</span>}
    </div>
  );
}

/** Inline metric row for hero and section anchors. */
export function MetricRow({ metrics, className, tone = 'default' }) {
  return (
    <div className={cn('flex flex-wrap gap-8', className)}>
      {metrics.map((m) => (
        <div key={m.label}>
          <div
            className={cn(
              'font-data text-[0.6875rem] uppercase tracking-[0.14em]',
              tone === 'dark' ? 'text-nn-300' : 'text-ink-3',
            )}
          >
            {m.label}
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{m.value}</div>
          {m.unit && (
            <div className={cn('text-xs', tone === 'dark' ? 'text-nn-200/70' : 'text-ink-3')}>
              {m.unit}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
