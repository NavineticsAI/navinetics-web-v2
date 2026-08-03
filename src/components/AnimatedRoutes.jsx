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
import Publications from '../pages/Publications.jsx';
import Careers from '../pages/Careers.jsx';
import Contact from '../pages/Contact.jsx';
import NotFound from '../pages/NotFound.jsx';
import PageTransition from './PageTransition.jsx';
import { redirects } from '../data/nav.js';

/**
 * The two split routes. Both carry drawing code no other page touches, and
 * inlining either pushes the main bundle over Vite's chunk-size warning.
 *
 * NaviNetics AI has a volume renderer and a noise table; its fallback is the
 * dark workstation ground, so the split cannot flash white over the hero.
 * Education has five canvas figures and a small 3-D scene; its fallback is the
 * page ground, and it sits below a hero that renders immediately either way.
 */
const NaviNeticsAI = lazy(() => import('../pages/NaviNeticsAI.jsx'));
const Education = lazy(() => import('../pages/Education.jsx'));
/* MAVEN carries the ring geometry and the voltammogram field, which no other
   route touches. Its fallback is the instrument bay, so the split cannot flash
   a pale panel over a dark hero. */
const Maven = lazy(() => import('../pages/Maven.jsx'));
/* Neuromodulation shares MAVEN's band component and scene builders, so it
   splits for the same reason and lands in the same neighbourhood. */
const Neuromodulation = lazy(() => import('../pages/Neuromodulation.jsx'));
/* The surgical tables carry the motion explorer and two more scene builders. */
const SurgicalTables = lazy(() => import('../pages/SurgicalTables.jsx'));
/* D1 carries a 36-frame turntable rendered from the assembly CAD — the heaviest
   asset on the site by some way, and the strongest argument for splitting it
   off its own route. Its fallback is the instrument bay, like MAVEN's. */
const D1 = lazy(() => import('../pages/D1.jsx'));

const routes = [
  { path: '/', element: <Home /> },

  // Company
  { path: '/company/who-we-are', element: <WhoWeAre /> },
  { path: '/company/our-founders', element: <Founders /> },
  { path: '/company/partners', element: <Partners /> },
  { path: '/company/community', element: <Community /> },

  // Products and Technology are each one data-driven route: adding a record to
  // data/products.js or data/technology.js publishes a page.
  //
  // MAVEN is the exception, declared before the dynamic route for the same
  // reason NaviNetics AI is below: its opening is a diagram of the system
  // rather than a photograph of it, which the template cannot express. Its
  // words still come from the same record.
  {
    path: '/products/maven-neuromodulation',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-[var(--mv-bay)]" />}>
        <Maven />
      </Suspense>
    ),
  },
  // The carbon tables are the second product with their own page: the range is
  // five specified models and the useful thing to do with that is let a reader
  // put each one through its own motions, which the template cannot express.
  {
    path: '/products/carbon-fiber-surgical-tables',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
        <SurgicalTables />
      </Suspense>
    ),
  },
  // D1 is the third: its opening is the assembly itself, turning. The template
  // has one hero image and no way to express that.
  {
    path: '/products/d1-stereotactic-frame',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-[var(--mv-bay)]" />}>
        <D1 />
      </Suspense>
    ),
  },
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
  // Neuromodulation is the third exception to the technology template, and the
  // same kind: the template is three principles beside a photograph, and this
  // subject is an arc of published work that wants figures and room.
  {
    path: '/technology/neuromodulation',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
        <Neuromodulation />
      </Suspense>
    ),
  },
  { path: '/technology/:slug', element: <Technology /> },

  // Resources
  { path: '/resources/media', element: <Media /> },
  { path: '/resources/careers', element: <Careers /> },
  {
    path: '/resources/education',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
        <Education />
      </Suspense>
    ),
  },
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
