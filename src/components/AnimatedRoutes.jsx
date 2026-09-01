import { Suspense, lazy } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Home from '../pages/Home.jsx';
import WhoWeAre from '../pages/WhoWeAre.jsx';
import Founders from '../pages/Founders.jsx';
import Community from '../pages/Community.jsx';
import Media from '../pages/Media.jsx';
import Publications from '../pages/Publications.jsx';
import Careers from '../pages/Careers.jsx';
import Contact from '../pages/Contact.jsx';
import NotFound from '../pages/NotFound.jsx';
import PageTransition from './PageTransition.jsx';
import { redirects } from '../data/nav.js';
import { RouteBoundary, RouteFallback } from '../ui/RouteBoundary.jsx';

/**
 * The two split routes. Both carry drawing code no other page touches, and
 * inlining either pushes the main bundle over Vite's chunk-size warning.
 *
 * NaviNetics AI has a volume renderer and a noise table; its fallback is the
 * dark workstation ground, so the split cannot flash white over the hero.
 *
 * Education is a route again. Neuromodulation indexes its four topics rather
 * than rendering them inline — four full lessons ran to ~9,000px on a page whose
 * bands had already explained the same science — and an index needs somewhere to
 * point. Declared before the dynamic /technology/:slug below, which would
 * otherwise treat "education" as a technology slug and render the 404.
 *
 * The five
 * topics are rendered into the two technology pages that own them, so the
 * module now travels inside their chunks. See `teaches` in data/technology.js.
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
/* Partners pulls PartnerGlobe, which pulls data/worldDots.js — 4,846 coastline
   dots, decoded at module scope. Eagerly imported it sat in the entry chunk and
   was parsed by every visitor to every page, to draw a globe on one of them.
   Its fallback is the page ground; the hero above it is plain markup. */
const Partners = lazy(() => import('../pages/Partners.jsx'));
/* The two catalog templates. Every product slug that exists today is claimed
   by a dedicated page above, so Product is currently reached by nothing at all;
   Technology serves one slug. Neither belongs in the chunk every visitor
   downloads, and both carry SpecTable, ComparisonTable and ComingSoon. */
const Product = lazy(() => import('../pages/Product.jsx'));
const Technology = lazy(() => import('../pages/Technology.jsx'));

const routes = [
  { path: '/', element: <Home /> },

  // Company
  { path: '/company/who-we-are', element: <WhoWeAre /> },
  { path: '/company/our-founders', element: <Founders /> },
  {
    path: '/company/partners',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <Partners />
      </Suspense>
    ),
  },
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
      <Suspense fallback={<RouteFallback tone="bay" />}>
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
      <Suspense fallback={<RouteFallback />}>
        <SurgicalTables />
      </Suspense>
    ),
  },
  // D1 is the third: its opening is the assembly itself, turning. The template
  // has one hero image and no way to express that.
  {
    path: '/products/d1-stereotactic-frame',
    element: (
      <Suspense fallback={<RouteFallback tone="bay" />}>
        <D1 />
      </Suspense>
    ),
  },
  {
    path: '/products/:slug',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <Product />
      </Suspense>
    ),
  },

  // NaviNetics AI has its own page rather than the Technology template: its
  // hero is the software itself. Declared before the dynamic route — React
  // Router ranks static segments above dynamic ones, but stating it in order
  // means the reason survives a refactor.
  {
    path: '/technology/navinetics-ai',
    element: (
      <Suspense fallback={<RouteFallback tone="ws" />}>
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
      <Suspense fallback={<RouteFallback />}>
        <Neuromodulation />
      </Suspense>
    ),
  },
  {
    path: '/technology/education',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <Education />
      </Suspense>
    ),
  },
  {
    path: '/technology/:slug',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <Technology />
      </Suspense>
    ),
  },

  // Resources
  { path: '/resources/media', element: <Media /> },
  { path: '/resources/careers', element: <Careers /> },
  { path: '/resources/publications', element: <Publications /> },

  { path: '/contact', element: <Contact /> },

  // A real 404. Unknown URLs must not silently render Home — that tells both
  // users and crawlers the page exists.
  { path: '*', element: <NotFound /> },
];

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <RouteBoundary routeKey={location.pathname}>
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
    </RouteBoundary>
  );
}
