import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Home from '../pages/Home.jsx';
import Product from '../pages/Product.jsx';
import Technology from '../pages/Technology.jsx';
import WhoWeAre from '../pages/WhoWeAre.jsx';
import Founders from '../pages/Founders.jsx';
import Partners from '../pages/Partners.jsx';
import Community from '../pages/Community.jsx';
import Media from '../pages/Media.jsx';
import Education from '../pages/Education.jsx';
import Publications from '../pages/Publications.jsx';
import Careers from '../pages/Careers.jsx';
import Contact from '../pages/Contact.jsx';
import NotFound from '../pages/NotFound.jsx';
import PageTransition from './PageTransition.jsx';
import { redirects } from '../data/nav.js';

const routes = [
  { path: '/', element: <Home /> },

  // Company
  { path: '/company/who-we-are', element: <WhoWeAre /> },
  { path: '/company/our-founders', element: <Founders /> },
  { path: '/company/partners', element: <Partners /> },
  { path: '/company/community', element: <Community /> },

  // Products and Technology are each one data-driven route: adding a record to
  // data/products.js or data/technology.js publishes a page.
  { path: '/products/:slug', element: <Product /> },
  { path: '/technology/:slug', element: <Technology /> },

  // Resources
  { path: '/resources/media', element: <Media /> },
  { path: '/resources/careers', element: <Careers /> },
  { path: '/resources/education', element: <Education /> },
  { path: '/resources/publications', element: <Publications /> },

  { path: '/contact', element: <Contact /> },

  // A real 404. Unknown URLs must not silently render Home — that tells both
  // users and crawlers the page exists.
  { path: '*', element: <NotFound /> },
];

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Pre-restructure URLs. Declared before the catch-all so previously
            published links redirect instead of 404ing. */}
        {redirects.map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}

        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={<PageTransition>{element}</PageTransition>} />
        ))}
      </Routes>
    </AnimatePresence>
  );
}
