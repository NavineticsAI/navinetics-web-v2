import { useEffect, useRef } from 'react';

/**
 * The four things `role="dialog" aria-modal="true"` promises, and which have to
 * be implemented by hand because the attributes alone do nothing.
 *
 * The media lightbox claimed both attributes and delivered none of them: no
 * Escape, no focus move, no focus trap and no focus return. For a sighted
 * mouse user it worked; for anyone on a keyboard it opened a dialog they could
 * not reach, could not leave, and whose backdrop they could tab straight
 * through into the page behind.
 *
 *   1. ESCAPE closes it. Universally expected, and the only exit a keyboard
 *      user will guess.
 *   2. FOCUS MOVES IN on open, so the next Tab is inside the dialog rather
 *      than at the top of the document.
 *   3. FOCUS IS TRAPPED while it is open — Tab from the last control returns
 *      to the first, Shift+Tab from the first goes to the last.
 *   4. FOCUS RETURNS to whatever opened it, so closing does not dump the
 *      reader back at the start of the page.
 *
 * Returns a ref to put on the dialog element.
 */
const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useDialog(open, onClose) {
  const ref = useRef(null);
  /* Captured before focus moves, so it is the element that actually opened
     the dialog and not whatever happened to be focused later. */
  const opener = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    opener.current = document.activeElement;

    const node = ref.current;
    const items = () => (node ? [...node.querySelectorAll(FOCUSABLE)] : []);

    // Move in. Prefer the first control; fall back to the dialog itself, which
    // is why the caller should carry tabIndex={-1}.
    const first = items()[0];
    (first ?? node)?.focus?.();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = items();
      if (f.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = f[0], lastEl = f[f.length - 1];
      // Wrap at both ends, and pull focus back in if it has escaped entirely.
      if (e.shiftKey && (document.activeElement === firstEl || !node.contains(document.activeElement))) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      // Give it back. `focus` may be gone if the opener unmounted.
      opener.current?.focus?.();
    };
  }, [open, onClose]);

  return ref;
}
