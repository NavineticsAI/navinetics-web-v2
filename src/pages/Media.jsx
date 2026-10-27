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
      {/* The title says what the page holds rather than repeating the
          eyebrow. It read "Media." under "Resources - Media" - the same word
          twice in a row - and then the band below opened with "Watch / In the
          operating room", a second title for the same one clip. Now the clip's
          own title is the page title, and the band carries only the clip. */}
      <Hero eyebrow="Resources — Media" title="In the operating room." />

      {/* ── the video, up front ──────────────────────────────────────────── */}
      {featured && (
        <Section wide className="!bg-[var(--mv-bay)] text-nn-50">
          {/* No section heading: "Watch / In the operating room" was the
              page's second title for the same clip, and is now the hero's
              h1. */}

          {/* THE CAPTION COLUMN IS WITHDRAWN - 2026-10-26. To the right of the
              video sat the "Surgical footage" note, the caption "A stereotactic
              frame in use.", and the running time and pixel dimensions
              ("0:53", "720 x 1280"). With it gone the clip is the whole
              section, so the figure now hugs the video and centres in the
              frame rather than filling a column beside an empty one - the
              layout audit measured the old arrangement as 286px of black on
              each side of a portrait clip.

              The caption is not lost to assistive technology: it is still the
              video's aria-label below. */}
          <Reveal className="flex justify-center">
            <figure className="m-0 w-fit overflow-hidden rounded-xl border border-[var(--mv-rule-2)] bg-black">
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
