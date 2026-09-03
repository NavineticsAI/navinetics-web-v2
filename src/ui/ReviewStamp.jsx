import { useLocation } from 'react-router-dom';

/**
 * Page identifier, version and date, in the footer of a review build.
 *
 * WHY, AND WHY EXACTLY THESE THREE. Kevin Bennet, reviewing before sign-off:
 *
 *   "Just on a few pages, there are enough issues for the document to be edited
 *    either on paper or to be able to put information on images of the web
 *    pages. Pages have no page identifiers, version or date."
 *
 * That is the whole requirement. He reviews controlled documents for a living
 * and every page of one carries those three in its footer; a printed page of a
 * website carries nothing, so a marked-up page comes back two weeks later and
 * nobody can say which page it was or whether it has changed since.
 *
 * WHAT IS DELIBERATELY NOT HERE. A git commit was in the first version. It is
 * engineering convenience — meaningless to the person holding the paper, and
 * printed beside a version number it reads as a second, competing version.
 * A status line ("DRAFT — NOT FOR DISTRIBUTION") was in the second. It is
 * defensible on a regulated site and it was not asked for; it belongs to a
 * decision NaviNetics should make rather than one this file makes for them.
 *
 * WHY THE FOOTER AND NOT A CORNER BADGE. The first version floated a chip over
 * the bottom-right, which is what preview deployments do — Vercel, Netlify,
 * Chromatic. NaviNetics' reaction was "the stamp is really weird", and they
 * were right: an overlay reads as a debug widget left switched on. In the
 * footer it is ordinary page content. It prints with the page rather than over
 * it, covers nothing, and reads as deliberate.
 *
 * IT NEVER SHIPS. Rendered only when VITE_REVIEW_STAMP is set, which only
 * .env.review sets, which only `npm run build:review` selects. A normal build
 * folds the condition in Footer.jsx to false and drops this component from the
 * bundle — checked by grepping dist for the class name.
 */
export function ReviewStamp() {
  const { pathname } = useLocation();
  // Bumped by hand in .env.review when a round goes out, so a page marked up in
  // round 2 can never be mistaken for one from round 1.
  const version = import.meta.env.VITE_REVIEW_VERSION || '1';

  return (
    <div
      className="review-stamp mt-8 flex flex-wrap gap-x-8 gap-y-1 border-t border-dashed
        border-nn-300/40 pt-4 font-data text-[0.6875rem] leading-[1.6]
        tracking-[0.06em] text-nn-300"
    >
      {/* The path is the identifier: unique, already how every review comment
          and every tool here refers to a page, and unchanged when somebody
          edits a heading. */}
      <span>
        <b className="font-semibold text-nn-200">Page</b> {pathname}
      </span>
      <span>
        <b className="font-semibold text-nn-200">Review</b> {version}
      </span>
      <span>
        {/* Injected at build time by vite.config.js, so it cannot drift from
            the build it is printed on. */}
        <b className="font-semibold text-nn-200">Date</b> {__REVIEW_DATE__}
      </span>
    </div>
  );
}
