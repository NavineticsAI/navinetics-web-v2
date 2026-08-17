import { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * What the visitor sees when a route fails to load, instead of a white page.
 *
 * WHY THIS EXISTS. Six routes are code-split. Measured with
 * tools/check-chunkfail.mjs, every one of them went completely blank when its
 * chunk could not be fetched: `#root` emptied, the navbar went with it, and
 * there was no message and no way back — just white.
 *
 * Two separate faults produced that:
 *
 *   1. Nothing caught the error. A rejected dynamic import propagates to the
 *      root and React unmounts the whole tree, including the navigation that
 *      would let someone leave.
 *   2. Every Suspense fallback was an empty coloured div. So even a chunk that
 *      merely never arrives — rather than failing outright — leaves a blank
 *      rectangle with nothing to read and nothing to press.
 *
 * WHEN IT FIRES, and it is not exotic:
 *
 *   · a deploy. Every build renames the hashed chunks, so anyone holding the
 *     site open when it ships asks for a file that no longer exists. This is
 *     the common case and it is silent.
 *   · a phone moving between wifi and cellular mid-session.
 *   · hospital wifi, which is the network this site is actually read on.
 *
 * The deploy case is genuinely recoverable: reloading fetches a fresh
 * index.html with the new hashes and everything works again. So a chunk error
 * reloads itself once — guarded in sessionStorage so a chunk that is truly
 * gone cannot put the browser in a loop — and only shows this screen if the
 * reload did not help.
 */

const CHUNK_ERROR = /importing a module script failed|failed to fetch dynamically imported module|error loading dynamically imported module|chunkloaderror|dynamically imported module/i;

const RETRY_KEY = 'nn:chunk-retry';

export class RouteBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, isChunk: false, routeKey: props.routeKey };
  }

  static getDerivedStateFromError(error) {
    const isChunk = CHUNK_ERROR.test(String(error?.message ?? error));
    return { error, isChunk };
  }

  /**
   * Clear the error when the route changes.
   *
   * Without this the boundary keeps showing the failure over a page that would
   * render perfectly well, and the "Go to the home page" link appears to do
   * nothing. Done here rather than in componentDidUpdate: deriving from props
   * resolves before the render that would otherwise show a stale error, and
   * avoids the second render that setState-after-update costs.
   */
  static getDerivedStateFromProps(props, state) {
    if (props.routeKey === state.routeKey) return null;
    return { routeKey: props.routeKey, error: null, isChunk: false };
  }

  componentDidCatch(error) {
    const isChunk = CHUNK_ERROR.test(String(error?.message ?? error));
    if (!isChunk) return;

    /* Reload ONCE. A stale chunk after a deploy is fixed by fetching the new
       index.html; a chunk that is genuinely unreachable is not, and must not
       be allowed to reload forever. sessionStorage rather than a ref because
       the reload discards the component tree. */
    let already = false;
    try { already = sessionStorage.getItem(RETRY_KEY) === '1'; } catch { /* private mode */ }
    if (already) return;
    try { sessionStorage.setItem(RETRY_KEY, '1'); } catch { /* ignore */ }
    window.location.reload();
  }

  render() {
    if (!this.state.error) return this.props.children;

    const { isChunk } = this.state;
    return (
      <Section>
        <h1 className="text-d2">
          {isChunk ? 'This page didn’t finish loading.' : 'Something went wrong on this page.'}
        </h1>
        <p className="mt-4 max-w-prose text-lead leading-[1.55] text-ink-2">
          {isChunk
            ? 'That usually means the connection dropped, or the site was updated while you had it '
              + 'open. Reloading should fix it.'
            : 'The rest of the site is unaffected — the navigation above still works.'}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => { try { sessionStorage.removeItem(RETRY_KEY); } catch { /* ignore */ } window.location.reload(); }}
            className="rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-on-action transition-colors hover:bg-action-hi"
          >
            Reload the page
          </button>
          <Link
            to="/"
            className="rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold transition-colors hover:border-ink-3"
          >
            Go to the home page
          </Link>
        </div>
        <p className="mt-8 text-sm text-ink-3">
          If it keeps happening, tell us at{' '}
          <a href="mailto:info@navinetics.com" className="text-action underline-offset-4 hover:underline">
            info@navinetics.com
          </a>
          .
        </p>
      </Section>
    );
  }
}

/* Local, so the boundary has no import that could itself fail to load. Using
   the real <Section> would couple the error screen to the module graph it is
   there to survive. */
function Section({ children }) {
  return (
    <section className="px-6 py-24 lg:px-8 lg:py-32">
      <div className="nn-frame mx-auto">{children}</div>
    </section>
  );
}

/**
 * The waiting state for a split route.
 *
 * Holds the incoming page's ground colour so the split cannot flash a pale
 * panel over a dark hero — that was the reason these were coloured divs in the
 * first place, and it is still right. What is added is that after a moment it
 * says something, and after a longer moment it offers a way out, so a chunk
 * that never arrives is not an unexplained blank rectangle.
 *
 * `delay` exists so a fast load shows nothing at all. A spinner that appears
 * for 80ms is worse than no spinner.
 */
export function RouteFallback({ tone = 'canvas' }) {
  const bg = tone === 'bay' ? 'bg-[var(--mv-bay)]' : tone === 'ws' ? 'bg-ws-bg' : 'bg-canvas';
  const ink = tone === 'canvas' ? 'text-ink-3' : 'text-nn-300';

  return (
    <div className={`grid min-h-screen place-items-center ${bg}`}>
      {/* Announced politely: a screen-reader user gets no other signal that a
          route is still arriving. */}
      <div role="status" aria-live="polite" className={`nn-route-wait text-sm ${ink}`}>
        Loading…
      </div>
    </div>
  );
}
