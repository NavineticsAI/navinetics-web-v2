import { useLocation } from 'react-router-dom';

/**
 * Which page is this, which build, and when was it made.
 *
 * WHY. Kevin Bennet, reviewing the site before sign-off: "Just on a few pages,
 * there are enough issues for the document to be edited either on paper or to
 * be able to put information on images of the web pages. Pages have no page
 * identifiers, version or date."
 *
 * He is right, and it is the ordinary problem with reviewing a website rather
 * than a document. A reviewer prints a page or screenshots it, writes on it,
 * and sends it back — and by then nobody can say which page it was, or whether
 * what they marked has since changed. A printed page of a website carries no
 * identity at all.
 *
 * The URL path is the identifier, not the page's title: it is unique, it is
 * what every other tool here refers to a page by, and it does not change when
 * someone edits a heading. The first draft printed the document title beside
 * it and the long ones ran off the edge of the stamp.
 *
 * IT NEVER SHIPS. Rendered only when VITE_REVIEW_STAMP is set, which only
 * .env.review sets, which only `npm run build:review` selects. A normal
 * `npm run build` folds the condition to false and drops the component from
 * the bundle — verified by grepping dist for the class name.
 */
export function ReviewStamp() {
  const { pathname } = useLocation();
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <div
      className="review-stamp pointer-events-none fixed bottom-0 right-0 z-[10002] max-w-[min(92vw,26rem)]
        select-none overflow-hidden rounded-tl-md border-l border-t border-white/15
        bg-[#0f1720ee] px-2.5 py-1.5 font-data text-[10px] leading-[1.4]
        tracking-[0.04em] text-white/95 shadow-[0_-1px_12px_rgba(0,0,0,.25)]"
      aria-hidden="true"
    >
      <div className="truncate font-semibold">{base}{pathname}</div>
      <div className="text-white/55">
        {/* Injected by vite.config.js at build time, so the stamp cannot drift
            from the build it is printed on. `+edits` means the tree had
            uncommitted changes — that page is not any committed version. */}
        build {__BUILD_VERSION__} · {__BUILD_DATE__}
      </div>
    </div>
  );
}
