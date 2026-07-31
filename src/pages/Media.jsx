import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { usePageMeta } from '../lib/meta.js';
import { mediaCategories, mediaItems } from '../data/media.js';
import { cn } from '../lib/cn.js';
import { Badge, Hero, ProductPlate, Reveal, Section, SectionHead } from '../ui/index.js';

/**
 * Media gallery — a filterable image and video library.
 *
 * Currently populated from existing site assets so it works today; real
 * photography and footage replace them in src/data/media.js without touching
 * this file. Filter chips derive from the data.
 */
export default function Media() {
  usePageMeta({
    title: 'Media',
    description:
      'Image and video library — NaviNetics devices, research and surgical technology.',
  });

  const [category, setCategory] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const shown = useMemo(
    () => (category === 'all' ? mediaItems : mediaItems.filter((m) => m.category === category)),
    [category],
  );

  return (
    <>
      <Hero
        eyebrow="Resources — Media"
        title="The library."
        lead="Devices, research and the work behind them. For press enquiries or higher-resolution files, get in touch."
      />

      <Section wide>
        <SectionHead eyebrow="Gallery" title="Browse the collection." />

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </Chip>
          {mediaCategories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
          <span
            className="ml-auto font-data text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3"
            aria-live="polite"
          >
            {shown.length} {shown.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((m, i) => (
            <Reveal key={m.id} delay={(i % 3) * 0.05}>
              <button
                type="button"
                onClick={() => setLightbox(m)}
                className="group/m block w-full cursor-pointer overflow-hidden rounded-lg border border-hairline-soft bg-surface text-left transition-[transform,box-shadow,border-color] duration-[420ms] ease-out hover:-translate-y-1 hover:border-hairline hover:shadow-e2"
              >
                <ProductPlate
                  src={m.src}
                  alt={m.title}
                  fit={m.fit}
                  className="aspect-[4/3] w-full rounded-none"
                  imgClassName="group-hover/m:scale-105"
                />
                <div className="flex flex-col gap-1.5 p-5">
                  <Badge tone="line">{m.category}</Badge>
                  <h2 className="mt-1 text-[1.0625rem] tracking-[-0.025em]">{m.title}</h2>
                  <p className="text-sm leading-relaxed text-ink-2">{m.caption}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </Section>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-nn-950/80 p-6 backdrop-blur-md"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute right-5 top-5 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/10 text-nn-50"
          >
            <X size={18} />
          </button>
          <figure
            className="max-h-full w-full max-w-4xl overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductPlate
              src={lightbox.src}
              alt={lightbox.title}
              fit={lightbox.fit}
              className="aspect-[16/10] w-full"
            />
            <figcaption className="bg-surface p-5">
              <h2 className="text-lg tracking-[-0.025em]">{lightbox.title}</h2>
              <p className="mt-1 text-sm text-ink-2">{lightbox.caption}</p>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150',
        active
          ? 'border-transparent bg-action text-on-action'
          : 'border-hairline text-ink-2 hover:border-action hover:text-action',
      )}
    >
      {children}
    </button>
  );
}
