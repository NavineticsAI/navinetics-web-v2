import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Home from '../pages/Home.jsx';
import Product from '../pages/Product.jsx';
import WhoWeAre from '../pages/WhoWeAre.jsx';
import Founders from '../pages/Founders.jsx';
import Community from '../pages/Community.jsx';
import Education from '../pages/Education.jsx';
import Publications from '../pages/Publications.jsx';
import Careers from '../pages/Careers.jsx';
import Contact from '../pages/Contact.jsx';
import NotFound from '../pages/NotFound.jsx';
import PageTransition from './PageTransition.jsx';

const routes = [
  { path: '/', element: <Home /> },
  // One data-driven route. Adding a record to data/products.js publishes a page.
  { path: '/what-we-do/:slug', element: <Product /> },
  { path: '/who-we-are', element: <WhoWeAre /> },
  { path: '/who-we-are/our-founders', element: <Founders /> },
  { path: '/who-we-are/community', element: <Community /> },
  { path: '/resources/education', element: <Education /> },
  { path: '/resources/publications', element: <Publications /> },
  { path: '/careers', element: <Careers /> },
  { path: '/contact', element: <Contact /> },
  // A real 404. Previously unknown URLs silently rendered Home, which tells
  // both users and crawlers the page exists.
  { path: '*', element: <NotFound /> },
];

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={<PageTransition>{element}</PageTransition>} />
        ))}
      </Routes>
    </AnimatePresence>
  );
}
