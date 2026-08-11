import { products } from './products.js';
import { technologies } from './technology.js';

/**
 * Single source of truth for site navigation.
 *
 * The navbar, the footer and the route table all read this, so adding a page
 * in one place puts it everywhere. Product and technology entries are derived
 * from their data files, which is why a new product needs no nav edit.
 *
 * `panel: 'rich'` renders the mega-panel with thumbnails; plain groups render
 * a simple dropdown list.
 */
export const nav = [
  {
    title: 'Company',
    path: '/company/who-we-are',
    items: [
      { title: 'Who We Are', path: '/company/who-we-are' },
      { title: 'Our Founders', path: '/company/our-founders' },
      { title: 'Partners', path: '/company/partners' },
      { title: 'Community', path: '/company/community' },
    ],
  },
  {
    title: 'Products',
    path: products[0].path,
    panel: 'rich',
    items: products.map((p) => ({
      title: p.shortName,
      subtitle: p.family,
      path: p.path,
      image: p.hero,
      note: p.status === 'in-development' ? 'In development' : null,
    })),
  },
  {
    title: 'Technology',
    path: technologies[0].path,
    panel: 'rich',
    items: technologies.map((t) => ({
      title: t.name,
      subtitle: t.summary,
      path: t.path,
      image: t.hero,
      note: t.status === 'in-development' ? 'In development' : null,
    })),
  },
  {
    title: 'Resources',
    path: '/resources/media',
    items: [
      { title: 'Media', path: '/resources/media' },
      { title: 'Careers', path: '/resources/careers' },
      { title: 'Education', path: '/resources/education' },
      { title: 'Publications', path: '/resources/publications' },
    ],
  },
];

/**
 * Old → new paths. The IA changed; these keep every previously published URL
 * working instead of 404ing, which matters for anything already shared.
 */
export const redirects = [
  ['/who-we-are', '/company/who-we-are'],
  ['/who-we-are/our-founders', '/company/our-founders'],
  ['/who-we-are/community', '/company/community'],
  ['/what-we-do/navinetics-frame-system', '/products/d1-stereotactic-frame'],
  ['/what-we-do/neuromodulation', '/products/maven-neuromodulation'],
  ['/careers', '/resources/careers'],
  ['/investment-opportunities', '/contact'],
  // Shipped as live CTAs on Who We Are, Community and the About stat tiles
  // before anyone noticed neither path was ever a route.
  ['/company/careers', '/resources/careers'],
  ['/products', '/products/d1-stereotactic-frame'],
];
