import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Home from '../pages/Home.jsx';
import FrameSystem from '../pages/FrameSystem.jsx';
import Neuromodulation from '../pages/Neuromodulation.jsx';
import WhoWeAre from '../pages/WhoWeAre.jsx';
import Founders from '../pages/Founders.jsx';
import Community from '../pages/Community.jsx';
import Education from '../pages/Education.jsx';
import Publications from '../pages/Publications.jsx';
import Careers from '../pages/Careers.jsx';
import Investment from '../pages/Investment.jsx';
import Contact from '../pages/Contact.jsx';
import PageTransition from './PageTransition.jsx';

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        
        <Route path="/what-we-do/navinetics-frame-system" element={<PageTransition><FrameSystem /></PageTransition>} />
        <Route path="/what-we-do/neuromodulation" element={<PageTransition><Neuromodulation /></PageTransition>} />
        
        <Route path="/who-we-are" element={<PageTransition><WhoWeAre /></PageTransition>} />
        <Route path="/who-we-are/our-founders" element={<PageTransition><Founders /></PageTransition>} />
        <Route path="/who-we-are/community" element={<PageTransition><Community /></PageTransition>} />
        
        <Route path="/resources/education" element={<PageTransition><Education /></PageTransition>} />
        <Route path="/resources/publications" element={<PageTransition><Publications /></PageTransition>} />
        
        <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
        <Route path="/investment-opportunities" element={<PageTransition><Investment /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        
        {/* Fallback */}
        <Route path="*" element={<PageTransition><Home /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
