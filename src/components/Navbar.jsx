import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/cn.js';
import { EASE_OUT, usePrefersReducedMotion } from '../lib/motion.js';
import { nav } from '../data/nav.js';
import { Button } from '../ui/Button.jsx';
import { ProductPlate } from '../ui/Card.jsx';
import { Logo } from '../ui/Logo.jsx';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';

const MENU_W = 240;
const RICH_MAX = 620;
const EDGE = 12;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIdx, setOpenIdx] = useState(null);
  const [anchor, setAnchor] = useState({ left: 0, top: 0, width: MENU_W });
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const reduced = usePrefersReducedMotion();

  const navRef = useRef(null);
  const pillRef = useRef(null);
  const itemRefs = useRef([]);
  const panelRef = useRef(null);

  /**
   * Panels are positioned manually because they render OUTSIDE the frosted
   * pill. They have to: an element with backdrop-filter becomes a backdrop
   * root, so a nested panel would blur the pill's empty interior instead of
   * the page — which renders it completely transparent.
   */
  const measure = useCallback((idx) => {
    const item = itemRefs.current[idx];
    const navEl = navRef.current;
    const pill = pillRef.current;
    if (!item || !navEl || !pill) return;

    const nr = navEl.getBoundingClientRect();
    const ir = item.getBoundingClientRect();
    const pr = pill.getBoundingClientRect();
    const rich = nav[idx].panel === 'rich';
    const width = rich ? Math.min(RICH_MAX, window.innerWidth * 0.8) : MENU_W;

    let left = rich ? ir.left + ir.width / 2 - width / 2 : ir.left;
    left = Math.max(EDGE, Math.min(left, window.innerWidth - width - EDGE));

    setAnchor({ left: left - nr.left, top: pr.bottom - nr.top, width });
  }, []);

  const open = useCallback(
    (idx) => {
      setOpenIdx(idx);
      measure(idx);
    },
    [measure],
  );

  useEffect(() => {
    setMobileOpen(false);
    setOpenIdx(null);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The pill changes width on scroll, so a held-open panel must follow it.
  useLayoutEffect(() => {
    if (openIdx == null) return;
    const update = () => measure(openIdx);
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [openIdx, scrolled, measure]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        // Give focus back to the trigger, or Escape strands the reader at the
        // top of the document with the panel gone from under them.
        if (openIdx != null) itemRefs.current[openIdx]?.querySelector('a')?.focus();
        setOpenIdx(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openIdx]);

  /**
   * KEYBOARD ACCESS TO THE PANELS.
   *
   * The panels render as SIBLINGS of the bar — they have to, so they can
   * escape the frosted pill's stacking context — which puts their links after
   * every trigger, the theme toggle and the Contact button in DOM order. And
   * because focusing the next trigger calls open() for THAT one, the panel you
   * were on unmounts before you reach it. The net effect was that no link
   * inside Company, Products, Technology or Resources could be reached by
   * keyboard at all: eleven of the site's pages, unreachable from the nav.
   *
   * Down-arrow opens the panel and moves into it — the disclosure-navigation
   * pattern. Enter still follows the trigger to its section landing page,
   * which is what an anchor should do, so nothing is taken away from anyone.
   */
  const openInto = useCallback((idx) => {
    open(idx);
    // After the panel has mounted and framer-motion has committed it.
    requestAnimationFrame(() => {
      panelRef.current?.querySelector('a')?.focus();
    });
  }, [open]);

  const onTriggerKey = useCallback((e, idx) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openInto(idx);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = e.key === 'ArrowRight'
        ? (idx + 1) % nav.length
        : (idx - 1 + nav.length) % nav.length;
      itemRefs.current[next]?.querySelector('a')?.focus();
    }
  }, [openInto]);

  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 4, scale: 0.98 },
      };

  const active = openIdx != null ? nav[openIdx] : null;

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3"
      onMouseLeave={() => setOpenIdx(null)}
    >
      {/* Frosted, never refracting — a lens here would re-filter the backdrop
          on every scroll pixel. min-h keeps the height fixed through the
          contraction so the transition can never change it. */}
      <div
        ref={pillRef}
        className={cn(
          'nn-glass mx-auto flex min-h-14 items-center gap-5 rounded-full py-2 pl-5 pr-2 [--gb:16px]',
          'transition-[max-width] duration-[420ms] ease-out',
          // Unscrolled, the pill matches the content frame — including its
          // wide steps, so on an ultrawide the nav is not a 1280px island
          // above 1760px of content. Scrolled, it contracts, which is the
          // point of the animation.
          scrolled ? 'max-w-5xl' : 'nn-frame',
        )}
      >
        <Link to="/" className="flex shrink-0 items-center" aria-label="NaviNetics home">
          {/* 28px: the h-7 the image used, kept exactly so the bar's height
              and the gap to the first link do not move. */}
          <Logo height={28} />
        </Link>

        <div className="hidden flex-1 items-center gap-1 lg:flex">
          {nav.map((link, idx) => (
            <div
              key={link.title}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onMouseEnter={() => open(idx)}
            >
              <NavLink
                to={link.path}
                onFocus={() => open(idx)}
                onKeyDown={(e) => onTriggerKey(e, idx)}
                aria-expanded={openIdx === idx}
                aria-controls={openIdx === idx ? 'nav-panel' : undefined}
                aria-haspopup="true"
                className={({ isActive }) =>
                  cn(
                    // whitespace-nowrap is load-bearing: without it the labels
                    // wrap when the bar contracts and the bar changes height.
                    'flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium',
                    'transition-colors duration-100 hover:text-action',
                    isActive ? 'text-action' : 'text-ink-2',
                  )
                }
              >
                {link.title}
                <ChevronDown size={13} className="opacity-60" aria-hidden="true" />
              </NavLink>
            </div>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button to="/contact" size="sm" className="hidden lg:inline-flex">
            Contact
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            /* 44 × 44 — the size a finger reliably hits, and the WCAG 2.2 AA
               target minimum. This was 36 × 36, and it is the ONLY way into
               the navigation on a phone. */
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-ink lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Dropdown panels ──────────────────────────────────────────────────
          Siblings of the pill, never children. See `measure` above. */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.title}
            {...panelMotion}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            ref={panelRef}
            id="nav-panel"
            aria-label={active.title}
            /* Tabbing out of the last link should close the panel rather than
               leave it hanging open over the page behind. */
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setOpenIdx(null);
            }}
            className="absolute hidden lg:block"
            style={{ left: anchor.left, top: anchor.top, width: anchor.width }}
          >
            {/* pt-2 is the visual gap AND the hover bridge — without it the
                pointer crosses dead space and the menu closes on approach. */}
            <div className="pt-2">
              {active.panel === 'rich' ? (
                <div className="nn-glass overflow-hidden rounded-lg p-2 [--gb:34px]">
                  <div className="grid gap-1.5">
                    {active.items.map((it) => (
                      <Link
                        key={it.path}
                        to={it.path}
                        className="group/mega flex gap-3 rounded-md p-2.5 transition-colors duration-100 hover:bg-action-soft"
                      >
                        <ProductPlate
                          src={it.image}
                          alt=""
                          className="h-14 w-16 shrink-0 rounded-sm"
                          imgClassName="!p-1.5"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold leading-tight group-hover/mega:text-action">
                              {it.title}
                            </span>
                            {it.note && (
                              <span className="font-data text-[0.5625rem] uppercase tracking-[0.1em] text-warn">
                                {it.note}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-3">
                            {it.subtitle}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="nn-glass overflow-hidden rounded-md p-1.5 [--gb:30px]">
                  {active.items.map((it) => (
                    <Link
                      key={it.path}
                      to={it.path}
                      className="block rounded-sm px-3.5 py-2.5 text-sm text-ink-2 transition-colors duration-100 hover:bg-action-soft hover:text-action"
                    >
                      {it.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="nn-glass mx-auto mt-2 max-h-[75vh] max-w-7xl overflow-y-auto rounded-lg p-4 [--gb:30px] lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {nav.map((link) => (
                <div key={link.title} className="flex flex-col gap-1.5">
                  <span className="text-base font-semibold">{link.title}</span>
                  {link.items.map((it) => (
                    <Link
                      key={it.path}
                      to={it.path}
                      className="border-l border-hairline pl-3 text-sm text-ink-2"
                    >
                      {it.title}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between">
                <Button to="/contact" size="sm">
                  Contact
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
