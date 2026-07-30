import { BrowserRouter as Router } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AnimatedRoutes from './components/AnimatedRoutes.jsx';

function App() {
  const { scrollYProgress } = useScroll();

  return (
    <Router>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-[10000]"
        style={{ scaleX: scrollYProgress }}
      />
      <div className="bg-white min-h-screen text-brand-dark font-sans selection:bg-brand-light/30 flex flex-col noise-bg">
        <Navbar />

        <main className="flex-grow flex flex-col relative z-0">
          <AnimatedRoutes />
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
