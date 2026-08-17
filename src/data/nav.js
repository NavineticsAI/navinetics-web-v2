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
      // The "In development" note came off the nav panels with the chip itself.
      note: null,
    })),
  },
  {
    title: 'Technology',
    path: technologies[0].path,
    panel: 'rich',
    items: [
      ...technologies.map((t) => ({
        title: t.name,
        subtitle: t.summary,
        path: t.path,
        /* A drawn mark rather than a picture. Reading `hero` here made this
           panel a copy of the Products panel — the D1 photograph appeared in
           both — and photography does not survive the slot size anyway. See the
           note in data/technology.js. */
        mark: t.mark,
        note: null,
      })),
      /* EDUCATION IS NO LONGER A PAGE. Its five topics are rendered INTO the
         two technology pages that own them — stereotaxy on
         /technology/stereotactic-devices, and DBS plus the three neurochemistry
         topics on /technology/neuromodulation. See `teaches` in
         data/technology.js.

         It was 1,432 words of the best technical writing on the site, sitting
         at third-level nav under Resources behind Media and Careers, while
         /technology/stereotactic-devices ran to 261 words and explained the
         same principle worse. The reader most likely to want it was the least
         likely to find it. There is no separate entry here because there is no
         separate page: the material is where the subject is. */
    ],
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
  /* Education's topics moved into the two technology pages, so the old path has
     no single successor. It goes to the stereotactic page, which carries topic
     02 and is the more likely destination; the neurochemistry topics are one
     click away on the neuromodulation page. Anchors that used to resolve here
     are now on whichever page owns the topic — every internal link has been
     repointed, and this redirect exists for anything already shared. */
  ['/resources/education', '/technology/stereotactic-devices'],
  ['/technology/education', '/technology/stereotactic-devices'],
];
