import { Suspense, lazy } from 'react';
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

/**
 * The only split route on the site. NaviNetics AI carries a volume renderer
 * and a noise table that no other page touches, and inlining them put the
 * main bundle over Vite's chunk-size warning. The fallback is the dark
 * workstation ground, so the split cannot flash white over the hero.
 */
const NaviNeticsAI = lazy(() => import('../pages/NaviNeticsAI.jsx'));

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

  // NaviNetics AI has its own page rather than the Technology template: its
  // hero is the software itself. Declared before the dynamic route — React
  // Router ranks static segments above dynamic ones, but stating it in order
  // means the reason survives a refactor.
  {
    path: '/technology/navinetics-ai',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-ws-bg" />}>
        <NaviNeticsAI />
      </Suspense>
    ),
  },
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
