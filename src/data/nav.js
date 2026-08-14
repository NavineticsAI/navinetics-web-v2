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
      /* No "In development" badge, on instruction. `status` still drives the
         placeholder filters and the ComingSoon treatment; only the label goes. */
      note: null,
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
      /* A drawn mark rather than a picture. Reading `hero` here made this
         panel a copy of the Products panel — the D1 photograph appeared in
         both — and photography does not survive the slot size anyway. See the
         note in data/technology.js. */
      mark: t.mark,
      note: null,
    })).concat([
      /* Education moved here from Resources on NaviNetics' instruction: it
         explains the science the three technology lines rest on, so it belongs
         beside them rather than next to Media and Careers. Appended to the
         mapped list rather than carried in a separate field, because the
         navbar and the footer both render `items` and nothing else. The route
         is unchanged — /resources/education still resolves. */
      {
        title: 'Education',
        subtitle: 'The science behind the instruments, explained from first principles.',
        path: '/resources/education',
        mark: null,
        note: null,
      },
    ]),
  },
  {
    title: 'Resources',
    path: '/resources/media',
    items: [
      { title: 'Media', path: '/resources/media' },
      { title: 'Careers', path: '/resources/careers' },
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
