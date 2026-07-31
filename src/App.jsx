import { BrowserRouter as Router } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AnimatedRoutes from './components/AnimatedRoutes.jsx';
import { ThemeProvider } from './lib/theme.jsx';

function App() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.3 });

  return (
    <ThemeProvider>
      <Router>
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
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
