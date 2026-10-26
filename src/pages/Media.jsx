import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta.js';
import { videos } from '../data/media.js';
import { Hero, Reveal, Section } from '../ui/index.js';

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
      'Image and video library — the NaviNetics instruments and the planning software, photographed and rendered.',
  });

  /* The filter state, the lightbox state and the filtered list all went with
     the image library on 2026-10-26. `videos[0]` is the one thing this page
     still renders. */
  const [featured] = videos;

  return (
    <>
      {/* TITLE AND SUBTEXT WITHDRAWN - 2026-10-26. The title read "The
          library." and the lead "The instruments and the software,
          photographed and rendered. For press enquiries or higher-resolution
          files, get in touch."

          NOTE: that lead was the only place on the site that told press how to
          ask for higher-resolution files. There is no other route now - the
          contact page has no media or press option in its reason list.

          ui/Hero.jsx guards `title` as of this change, so a hero CAN now render
          with the eyebrow alone. This one briefly did, which left the page with
          no <h1> at all - nothing for a search engine or a screen reader to
          take as its heading, since the eyebrow is a <span>. A plain "Media."
          went back on 2026-10-26 to restore that, without the old headline or
          its subtext. The guard stays; it is correct regardless. */}
      <Hero eyebrow="Resources — Media" title="Media." />

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
            {/* Capped by height and centred. These clips are vertical, and a
                608 x 1080 video stretched to the width of this column is over
                1,400px tall — the caption beside it would be off screen before
                the video finished. */}
            <figure className="m-0 flex justify-center overflow-hidden rounded-xl
              border border-[var(--mv-rule-2)] bg-black">
              <video
                src={featured.src}
                poster={featured.poster}
                width={featured.w}
                height={featured.h}
                controls
                playsInline
                preload="none"
                aria-label={featured.caption}
                className="block h-auto max-h-[70svh] w-auto max-w-full"
              />
            </figure>
            <figcaption className="flex flex-col gap-4">
              {featured.note && (
                <span className="w-fit rounded-sm border border-sg-300/35 bg-sg-300/10 px-2.5 py-1
                  font-data text-[0.625rem] uppercase tracking-[0.12em] text-sg-300">
                  {featured.note}
                </span>
              )}
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

          {/* THE OTHER TWO CLIPS ARE WITHDRAWN - 2026-10-26. A
              three-up grid under the featured video carried `rest`, i.e.
              every clip after the first: 'The system, shown' (the launch
              event) and 'NRSS' (the frame turning on a head model), each with
              its title, note, caption and "Seen on" link.

              Both files are still in data/media.js and still shipped - the
              NRSS clip is the same video the stereotaxy figure plays. Only
              this grid is gone, so `rest` is now unused. */}
        </Section>
      )}

      {/* THE IMAGE LIBRARY IS WITHDRAWN - 2026-10-26, on instruction to
          "delete all" the images below the video. That removed:

            · the "Images" / "The instruments, and the software." head and its
              "Every picture links to the page it appears on." lead
            · the category filter chips and the live image count
            · the grid of every image the site publishes
            · the lightbox those thumbnails opened, with its caption and its
              "Seen on" link

          WHAT THE PAGE LOSES, because it was the stated point of it: the note
          at the top of this file says what made this a library rather than a
          gallery was that every image said where it was used and linked there.
          Nothing does that now. /resources/media is one video.

          `images` and `imageCategories` in data/media.js are untouched and
          nothing else reads them. The Chip component below, the lightbox
          state, useDialog, useMemo and ProductPlate all went with the section. */}
    </>
  );
}

/* `Chip` - the category filter pill - was here. Removed with the image
   library on 2026-10-26; nothing else used it. ui/index.js has the site's
   other button variants if one is wanted again. */
