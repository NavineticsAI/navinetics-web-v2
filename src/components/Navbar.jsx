import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/cn.js';
import { EASE_OUT, usePrefersReducedMotion } from '../lib/motion.js';
import { products } from '../data/products.js';
import { Button } from '../ui/Button.jsx';
import { ProductPlate } from '../ui/Card.jsx';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';

const nav = [
  {
    title: 'Who We Are',
    path: '/who-we-are',
    items: [
      { title: 'About NaviNetics', path: '/who-we-are' },
      { title: 'Our Founders', path: '/who-we-are/our-founders' },
      { title: 'Community', path: '/who-we-are/community' },
    ],
  },
  // Generated from the catalogue, so products four and five appear here for free.
  { title: 'What We Do', path: products[0].path, mega: true },
  {
    title: 'Resources',
    path: '/resources/education',
    items: [
      { title: 'Education', path: '/resources/education' },
      { title: 'Publications', path: '/resources/publications' },
    ],
  },
  { title: 'Careers', path: '/careers' },
  { title: 'Investment', path: '/investment-opportunities' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIdx, setOpenIdx] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const navRef = useRef(null);

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

  // Esc closes any open panel; never trap focus in the bar.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenIdx(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const panel = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 4, scale: 0.98 },
      };

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-[padding] duration-[420ms] ease-out"
      onMouseLeave={() => setOpenIdx(null)}
    >
      {/* Frosted, never refracting — a lens here would re-filter the backdrop
          on every scroll pixel. */}
      {/* min-h keeps the bar a fixed height through the contraction, so the
          transition can never change it even if content reflows. */}
      <div
        className={cn(
          'nn-glass mx-auto flex min-h-14 items-center gap-5 rounded-full py-2 pl-5 pr-2 [--gb:16px]',
          'transition-[max-width] duration-[420ms] ease-out',
          scrolled ? 'max-w-5xl' : 'max-w-7xl',
        )}
      >
        <Link to="/" className="flex shrink-0 items-center" aria-label="NaviNetics home">
          <img src="/logo-378x75-1.png" alt="NaviNetics" className="h-7 w-auto object-contain" />
        </Link>

        <div className="hidden flex-1 items-center gap-1 lg:flex">
          {nav.map((link, idx) => (
            <div key={link.title} className="relative" onMouseEnter={() => setOpenIdx(idx)}>
              <NavLink
                to={link.path}
                onFocus={() => setOpenIdx(idx)}
                aria-expanded={link.items || link.mega ? openIdx === idx : undefined}
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
                {(link.items || link.mega) && (
                  <ChevronDown size={13} className="opacity-60" aria-hidden="true" />
                )}
              </NavLink>

              <AnimatePresence>
                {openIdx === idx && link.items && (
                  <motion.div
                    key={`${link.title}-menu`}
                    {...panel}
                    transition={{ duration: 0.18, ease: EASE_OUT }}
                    className="nn-glass absolute left-0 top-full mt-2 w-60 overflow-hidden rounded-md p-1.5 [--gb:30px]"
                  >
                    {link.items.map((it) => (
                      <Link
                        key={it.path}
                        to={it.path}
                        className="block rounded-sm px-3.5 py-2.5 text-sm text-ink-2 transition-colors duration-100 hover:bg-action-soft hover:text-action"
                      >
                        {it.title}
                      </Link>
                    ))}
                  </motion.div>
                )}

                {openIdx === idx && link.mega && (
                  <motion.div
                    key={`${link.title}-mega`}
                    {...panel}
                    transition={{ duration: 0.18, ease: EASE_OUT }}
                    className="nn-glass absolute left-1/2 top-full mt-2 w-[min(38rem,80vw)] -translate-x-1/2 overflow-hidden rounded-lg p-2 [--gb:34px]"
                  >
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {products.map((p) => (
                        <Link
                          key={p.slug}
                          to={p.path}
                          className="group/mega flex gap-3 rounded-md p-2.5 transition-colors duration-100 hover:bg-action-soft"
                        >
                          <ProductPlate
                            src={p.hero}
                            alt=""
                            className="h-14 w-16 shrink-0 rounded-sm"
                            imgClassName="!p-1.5"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold leading-tight group-hover/mega:text-action">
                              {p.shortName}
                            </div>
                            <div className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-3">
                              {p.family}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="nn-glass mx-auto mt-2 max-w-7xl overflow-hidden rounded-lg p-4 [--gb:30px] lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {nav.map((link) => (
                <div key={link.title} className="flex flex-col gap-1.5">
                  <Link to={link.path} className="text-base font-semibold">
                    {link.title}
                  </Link>
                  {(link.items ?? (link.mega ? products.map((p) => ({ title: p.shortName, path: p.path })) : null))?.map(
                    (it) => (
                      <Link
                        key={it.path}
                        to={it.path}
                        className="border-l border-hairline pl-3 text-sm text-ink-2"
                      >
                        {it.title}
                      </Link>
                    ),
                  )}
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
