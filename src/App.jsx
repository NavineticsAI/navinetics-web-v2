import { BrowserRouter as Router } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AnimatedRoutes from './components/AnimatedRoutes.jsx';
import { ThemeProvider } from './lib/theme.jsx';
import { ReviewStamp } from './ui/ReviewStamp.jsx';

function App() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.3 });

  return (
    <ThemeProvider>
      {/*
        The site deploys under a sub-path (see vite.config.js). Without a
        matching basename the router reads the pathname as '/navinetics-web-v2/',
        matches no route, and renders the 404 page at the site's own home URL —
        while every <Link to="/products/…"> pushes outside the deployed base.
        BASE_URL is '/' in dev and the configured base in a build, so one value
        covers both.
      */}
      <Router basename={import.meta.env.BASE_URL}>
        <motion.div
          className="fixed left-0 right-0 top-0 z-[10000] h-0.5 origin-left bg-action"
          style={{ scaleX: progress }}
          aria-hidden="true"
        />

        <a
          href="#main"
          className="sr-only rounded-full bg-action px-4 py-2 text-sm font-semibold text-on-action focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10001]"
        >
          Skip to content
        </a>

        <div className="flex min-h-screen flex-col bg-canvas text-ink selection:bg-action-soft">
          <Navbar />
          <main id="main" className="relative z-0 flex flex-grow flex-col">
            <AnimatedRoutes />
          </main>
          <Footer />
          {/* Only ever true under `npm run build:review` — see .env.review.
              In every other build this folds to false and the component is
              dropped from the bundle entirely. */}
          {import.meta.env.VITE_REVIEW_STAMP === '1' && <ReviewStamp />}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
