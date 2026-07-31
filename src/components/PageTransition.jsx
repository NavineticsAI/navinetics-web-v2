import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { EASE_OUT, usePrefersReducedMotion } from '../lib/motion.js';

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Transform and opacity only. The previous build animated `filter: blur()`,
  // which forces a repaint of the whole page on every frame of every route
  // change — the most expensive property it could have picked.
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: EASE_OUT }}
      className="flex w-full flex-grow flex-col"
    >
      {children}
    </motion.div>
  );
}
