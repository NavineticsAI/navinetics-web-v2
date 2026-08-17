/**
 * Is the reader scrolling right now?
 *
 * WHY THIS EXISTS. Measured on a phone-class CPU, scrolling a block into view
 * on /company/partners took 13.5 seconds to become readable, and on
 * /products/maven-neuromodulation it never did. Neither page is slow to load —
 * both are slow to *reveal*, which is a different fault and reads to a reader
 * as content that will not arrive.
 *
 * The cause is contention, not weight. Every block on the site enters through
 * an IntersectionObserver callback and a run of animation frames. Those are
 * main-thread work, and on these two routes the main thread is already spoken
 * for: the globe re-projects the whole world thirty times a second and never
 * stops, because it drifts whether or not anyone is touching it. So the reveal
 * that takes 420ms on an idle page queues behind a scene that yields nothing,
 * and the reader scrolls into blank space.
 *
 * The resolution is not to make the scenes cheaper — that was tried, and a
 * quieter globe still starves a reveal it is competing with. It is to make
 * them yield at the one moment they are not being looked at. Nobody is
 * studying a slowly drifting globe while flicking past it; they are reading
 * what comes next, and that is precisely what the reveal is trying to draw.
 *
 * ONLY FOR SELF-ANIMATING SCENES. A scene whose whole output is a function of
 * scroll position — BrainHero — must keep drawing while scrolling, or it
 * freezes exactly when it is meant to move. Pausing is right for scenes that
 * animate on their own clock: an idle drift, a bead on a route, a pulse.
 */

let scrolling = false;
let timer = 0;

/* Long enough that momentum scrolling on iOS, which fires in bursts with gaps
   between them, is treated as one continuous gesture rather than a stutter of
   starts and stops — restarting a globe between flicks would be worse than
   either pausing or not. Short enough that the scene is moving again by the
   time a reader has settled and looked back at it. */
const QUIET_MS = 180;

/**
 * The same signal as a class on <html>, for the things CSS owns.
 *
 * The navbar logo runs four infinite CSS animations behind two blend modes.
 * Measured in WebKit, switching them off took every route from roughly 22-26fps
 * to 56-60 — about half the frame rate of the whole site, spent on a header
 * flourish that runs for the length of the session. It is a brand element and
 * stays; it just stands aside while someone is scrolling past it.
 *
 * `animation-play-state: paused` rather than `animation: none`, because none
 * would snap the layers back to their unanimated positions and then jump when
 * the gesture ended. Paused holds them exactly where they are and resumes from
 * there, so nothing moves that should not.
 *
 * The class is only touched on a transition, not on every scroll event — a
 * class change on the root element recalculates style for the document, and
 * doing that per event would cost more than the animation does.
 */
function setClass(on) {
  document.documentElement.classList.toggle('nn-scrolling', on);
}

if (typeof window !== 'undefined') {
  addEventListener('scroll', () => {
    if (!scrolling) {
      scrolling = true;
      setClass(true);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      scrolling = false;
      setClass(false);
    }, QUIET_MS);
  }, { passive: true, capture: true });
}

/** True while a scroll gesture is in flight, and briefly after it settles. */
export function isScrolling() {
  return scrolling;
}
