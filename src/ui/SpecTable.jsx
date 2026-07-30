import { cn } from '../lib/cn.js';
import { Rule } from './Reticle.jsx';

/**
 * Specification table. Tabular figures, mono values, a graduated header rule.
 * Surgeons and regulators read these closely — they get typographic care, not
 * a bulleted list.
 */
export function SpecTable({ rows, caption, className }) {
  return (
    <div className={cn('overflow-hidden rounded-md border border-hairline-soft bg-surface', className)}>
      <Rule />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.k}
                className={cn(
                  'transition-colors duration-100 hover:bg-action-soft',
                  i < rows.length - 1 && 'border-b border-hairline-soft',
                )}
              >
                <th scope="row" className="w-[42%] px-4 py-3 text-left font-normal text-ink-2">
                  {r.k}
                </th>
                <td className="px-4 py-3 font-data text-ink">{r.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Comparison grid.
 *
 * Comparative claims about competing devices are regulated. `comparison.published`
 * in data/products.js gates this out of the live site until content is approved.
 */
export function ComparisonTable({ columns, rows, highlight = 0, className }) {
  return (
    <div className={cn('overflow-x-auto rounded-md border border-hairline-soft bg-surface', className)}>
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr>
            <th className="bg-surface-2 px-4 py-3 text-left text-eyebrow text-ink-3">Attribute</th>
            {columns.map((c, i) => (
              <th
                key={c}
                className={cn(
                  'bg-surface-2 px-4 py-3 text-left text-eyebrow',
                  i === highlight ? 'bg-action-soft text-action' : 'text-ink-3',
                )}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r.k} className={cn(ri < rows.length - 1 && 'border-b border-hairline-soft')}>
              <th scope="row" className="px-4 py-3 text-left font-normal text-ink-2">
                {r.k}
              </th>
              {r.v.map((v, i) => (
                <td
                  key={`${r.k}-${i}`}
                  className={cn('px-4 py-3 font-data', i === highlight && 'bg-action-soft')}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * System contents — the bill of materials. Numbering is meaningful here: it is
 * an enumerated list the reader traverses completely.
 */
export function ComponentList({ items, className }) {
  return (
    <ul className={cn('grid gap-2 sm:grid-cols-2', className)}>
      {items.map((item, i) => (
        <li
          key={item}
          className="flex items-center gap-3 rounded-sm border border-hairline-soft bg-surface px-3.5 py-3"
        >
          <span className="font-data text-[0.6875rem] font-semibold text-action">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="text-sm leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}
