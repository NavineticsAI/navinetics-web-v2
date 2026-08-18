import { useCallback, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDialog } from '../lib/dialog.js';
import { usePageMeta } from '../lib/meta.js';
import { imageCategories, images, videos } from '../data/media.js';
import { cn } from '../lib/cn.js';
import { Badge, Hero, ProductPlate, Reveal, Section, SectionHead } from '../ui/index.js';

/**
 * The media library: the videos first, then every image the site publishes.
 *
 * WHAT MAKES IT A LIBRARY rather than a gallery. Every image says where it is
 * used and links there. A picture of a localizer means very little on its own;
 * two clicks from it is the page that explains what a localizer does, and that
 * is the reason someone browsing images is here at all.
 *
 * VIDEO LOADS NOTHING UNTIL ASKED. `preload="none"` with a poster, so the page
 * costs one small still per clip rather than several megabytes of video that
 * most visitors will never play.
 */
export default function Media() {
  usePageMeta({
    title: 'Media',
    description:
      'Image and video library — NaviNetics devices, software, research and the people behind them.',
  });

  const [category, setCategory] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  /* Stable, so useDialog's effect does not tear down and re-run — which would
     re-move focus on every render while the lightbox is open. */
  const close = useCallback(() => setLightbox(null), []);
  const dialogRef = useDialog(Boolean(lightbox), close);

  const shown = useMemo(
    () => (category === 'all' ? images : images.filter((m) => m.category === category)),
    [category],
  );

  const [featured, ...rest] = videos;

  return (
    <>
      <Hero
        eyebrow="Resources — Media"
        title="The library."
        lead="Devices, software, research and the people behind them. For press inquiries or
          higher-resolution files, get in touch."
      />

      {/* ── the video, up front ──────────────────────────────────────────── */}
      {featured && (
        <Section wide className="!bg-[var(--mv-bay)] text-nn-50">
          <Reveal>
            <div className="flex flex-col gap-3.5">
              <div className="h-px w-full bg-[var(--mv-rule)]" aria-hidden="true" />
              <span className="eyebrow text-sg-300">Watch</span>
              <h2 className="text-d2">{featured.title}</h2>
            </div>
          </Reveal>

          <Reveal className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <figure className="m-0 overflow-hidden rounded-xl border border-[var(--mv-rule-2)] bg-black">
              <video
                src={featured.src}
                poster={featured.poster}
                width={featured.w}
                height={featured.h}
                controls
                playsInline
                preload="none"
                aria-label={featured.caption}
                className="block h-auto w-full"
              />
            </figure>
            <figcaption className="flex flex-col gap-4">
              <p className="text-[0.9375rem] leading-relaxed text-nn-200">{featured.caption}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-data text-[0.625rem]
                uppercase tracking-[0.12em] text-ink-3">
                <span>{featured.length}</span>
                <span>{featured.w} &times; {featured.h}</span>
              </div>
              {featured.page && (
                <Link
                  to={featured.page.to}
                  className="w-fit text-[0.875rem] text-sg-300 underline-offset-4 hover:underline"
                >
                  Seen on {featured.page.label}
                </Link>
              )}
            </figcaption>
          </Reveal>

          {rest.length > 0 && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((v) => (
                <Reveal key={v.id}>
                  <figure className="m-0 flex flex-col gap-3">
                    <div className="overflow-hidden rounded-lg border border-[var(--mv-rule-2)] bg-black">
                      <video
                        src={v.src}
                        poster={v.poster}
                        width={v.w}
                        height={v.h}
                        controls
                        playsInline
                        preload="none"
                        aria-label={v.caption}
                        className="block h-auto w-full"
                      />
                    </div>
                    <figcaption className="flex flex-col gap-1.5">
                      <h3 className="text-[1.0625rem] tracking-[-0.025em] text-nn-50">{v.title}</h3>
                      <p className="text-sm leading-relaxed text-nn-200">{v.caption}</p>
                      {v.page && (
                        <Link
                          to={v.page.to}
                          className="mt-1 w-fit font-data text-[0.625rem] uppercase tracking-[0.12em]
                            text-sg-300 underline-offset-4 hover:underline"
                        >
                          Seen on {v.page.label}
                        </Link>
                      )}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── all images ───────────────────────────────────────────────────── */}
      <Section wide>
        <SectionHead
          eyebrow="All images"
          title="Every picture on the site."
          lead="Each one says where it is used, so a picture is a way in rather than a dead end."
        />

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </Chip>
          {imageCategories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
          <span
            className="ml-auto font-data text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3"
            aria-live="polite"
          >
            {shown.length} {shown.length === 1 ? 'image' : 'images'}
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((m, i) => (
            <Reveal key={m.id} delay={(i % 3) * 0.05}>
              {/* The reference link sits OUTSIDE the button: a link nested in a
                  button is invalid, and it also steals the click that is
                  supposed to open the lightbox. */}
              <figure className="m-0 flex h-full flex-col overflow-hidden rounded-lg border
                border-hairline-soft bg-surface transition-[transform,box-shadow,border-color]
                duration-[420ms] ease-out hover:-translate-y-1 hover:border-hairline hover:shadow-e2">
                <button
                  type="button"
                  onClick={() => setLightbox(m)}
                  aria-label={`Open ${m.title}`}
                  className="group/m block w-full cursor-pointer text-left"
                >
                  <ProductPlate
                    src={m.src}
                    alt={m.title}
                    className="aspect-[4/3] w-full rounded-none"
                    imgClassName="group-hover/m:scale-105"
                  />
                  <figcaption className="flex flex-col gap-1.5 p-5 pb-3">
                    <Badge tone="line">{m.category}</Badge>
                    <h3 className="mt-1 text-[1.0625rem] tracking-[-0.025em]">{m.title}</h3>
                    <p className="text-sm leading-relaxed text-ink-2">{m.caption}</p>
                  </figcaption>
                </button>
                <div className="mt-auto px-5 pb-4">
                  <Link
                    to={m.page.to}
                    className="font-data text-[0.625rem] uppercase tracking-[0.12em] text-action
                      underline-offset-4 hover:underline"
                  >
                    Seen on {m.page.label}
                  </Link>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </Section>

      {lightbox && (
        /* role="dialog" and aria-modal promise Escape, a focus move, a focus
           trap and focus return. useDialog supplies all four. */
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-nn-950/80 p-6
            outline-none backdrop-blur-md"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-5 top-5 grid h-11 w-11 cursor-pointer place-items-center
              rounded-full bg-white/10 text-nn-50 focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-sg-300"
          >
            <X size={18} />
          </button>
          <figure
            className="max-h-full w-full max-w-4xl overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductPlate src={lightbox.src} alt={lightbox.title} className="aspect-[16/10] w-full" />
            <figcaption className="flex flex-col gap-1 bg-surface p-5">
              <h2 className="text-lg tracking-[-0.025em]">{lightbox.title}</h2>
              <p className="text-sm text-ink-2">{lightbox.caption}</p>
              <Link
                to={lightbox.page.to}
                className="mt-2 w-fit font-data text-[0.625rem] uppercase tracking-[0.12em]
                  text-action underline-offset-4 hover:underline"
              >
                Seen on {lightbox.page.label}
              </Link>
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
