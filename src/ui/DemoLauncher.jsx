import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../lib/cn.js';
import { Badge } from './Badge.jsx';
import { Button } from './Button.jsx';
import { Workstation } from './Workstation.jsx';

/**
 * One section, three ways out of it.
 *
 * The demo used to open by scroll: a 270vh pinned stage that scaled the
 * workspace down into a screen. It looked good once and cost every visitor
 * two and a half screens of scrolling to get past, whether or not they wanted
 * it. Now it is a button, alongside the page's other two actions, and it
 * opens over the page — so it is the same size on every display, it can be
 * closed, and nobody scrolls through it by accident.
 */
export function DemoLauncher({ eyebrow, title, lead, note, actions = [], about }) {
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32 lg:px-8">
      <div className="rounded-xl border border-hairline bg-surface p-8 md:p-12">
        <div className="max-w-prose">
          {/* Said before it is opened, not only inside it. Somebody who reads
              the section and never presses the button should still come away
              knowing this is a demonstration rather than the application. */}
          <Badge tone="line" dot>Demonstration</Badge>
          <p className="eyebrow mt-4 text-action">{eyebrow}</p>
          <h2 className="mt-3 text-d2 !tracking-[-0.035em]">{title}</h2>
          {lead && <p className="mt-5 text-lead leading-[1.55] text-ink-2">{lead}</p>}
        </div>

        <div className="mt-9 flex flex-wrap gap-3">
          <Button onClick={() => setOpen(true)}>Open the demo</Button>
          {actions.map((a) => (
            <Button key={a.label} to={a.to} href={a.href} variant="secondary" arrow={a.arrow}>
              {a.label}
            </Button>
          ))}
        </div>

        {note && (
          <p className="mt-5 font-data text-[0.6875rem] uppercase leading-relaxed tracking-[0.1em] text-ink-3">
            {note}
          </p>
        )}
      </div>

      {open && (
        <DemoOverlay
          onClose={() => { setOpen(false); setAboutOpen(false); }}
          about={about}
          aboutOpen={aboutOpen}
          setAboutOpen={setAboutOpen}
        />
      )}
    </section>
  );
}

/**
 * The workspace, over the page.
 *
 * Portalled to the body so no ancestor's transform, filter or overflow can
 * clip it — the feature bands each establish a containing block, and a fixed
 * child of one of those is positioned against the band, not the viewport.
 */
function DemoOverlay({ onClose, about, aboutOpen, setAboutOpen }) {
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    // Hold the page still underneath, and keep the width so the layout does
    // not jump as the scrollbar goes.
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="NaviNetics AI planning workspace, simulated"
      tabIndex={-1}
      className="fixed inset-0 z-[120] flex flex-col gap-3 bg-ws-bg/97 p-3 backdrop-blur-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-data text-[0.6875rem] uppercase tracking-[0.13em] text-[#8c97a3]">
          Simulated interface
          <span className="ml-2 rounded-full bg-white/10 px-2.5 py-1 tracking-[0.06em] text-[#cfd6de]">
            Drag either end of the track to move it, or the track itself to swing the approach
          </span>
        </p>
        <div className="flex items-center gap-2">
          {about && (
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="rounded-full border border-white/25 px-3 py-1.5 font-data text-[0.6875rem] uppercase tracking-[0.06em] text-[#cfd6de] transition-colors hover:border-white/50 hover:text-white"
            >
              About this demo
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 font-data text-[0.6875rem] uppercase tracking-[0.06em] text-[#cfd6de] transition-colors hover:border-white/50 hover:text-white"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Close
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-white/[0.14] shadow-e3">
        <Workstation live />
      </div>

      {about && (
        <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)}>{about}</AboutPanel>
      )}
    </div>,
    document.body,
  );
}

/* ── about this demonstration ─────────────────────────────────────────────
   Optional, behind a button. The always-visible disclosure is the "Synthetic
   dataset" chip in the workstation's own title bar; this panel is the long
   form for anyone who wants it.                                          */
function AboutPanel({ open, onClose, children }) {
  const panelRef = useRef(null);
  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    // Stop at this layer so Escape closes the panel, not the workspace behind it.
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 grid place-items-center p-5">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="About this demonstration"
        tabIndex={-1}
        className={cn(
          'relative max-h-full w-full max-w-2xl overflow-y-auto rounded-lg bg-surface',
          'p-7 text-ink shadow-e3 md:p-9',
        )}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink-3 transition-colors hover:bg-action-soft hover:text-action"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}
