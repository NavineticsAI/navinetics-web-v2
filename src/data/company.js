import { publications } from './publications.js';
import { products } from './products.js';
import { territories } from './partners.js';
import { disciplines } from './disciplines.js';

/**
 * The company, as facts rather than adjectives.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 * Every dated entry below is quoted or paraphrased from something already
 * published on this site — the founders' biographies on /company/our-founders,
 * the partner records, the publication list. `source` on each entry says which.
 * Nothing here is inferred, and no figure is invented: the counts in `numbers`
 * are computed from the data files at render time, so they cannot drift away
 * from what the rest of the site says.
 *
 * Two gaps NaviNetics needs to fill:
 *
 *   · The Neural Engineering and Precision Surgery Laboratories entry has no year. The founders'
 *     biographies say Lee and Bennet founded the laboratories and co-direct
 *     them, but never say when. It is shown undated rather than guessed at.
 *
 *   · NaviNetics, Inc.'s own founding year is nowhere on the site. The footer
 *     copyright starts at 2021, which is a hint and not a fact, so there is no
 *     entry for it. Give me the year and it goes in.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const timeline = [
  {
    year: '1984',
    title: 'A workshop inside a neurosurgery department',
    body:
      'Stephan Goerss joins Mayo Clinic’s Department of Neurologic Surgery. Over the next three '
      + 'decades he supports every computer-assisted neurosurgical procedure there, trains the '
      + 'residents on the technology, and builds custom instruments for the surgical staff.',
    source: 'Founder biography',
  },
  {
    year: '1986',
    title: 'COMPASS International',
    body:
      'Goerss co-founds a computer-assisted stereotactic and medical device company and serves as '
      + 'its President until 1997 — the first time this work leaves the hospital as a product.',
    source: 'Founder biography',
  },
  {
    year: '1990',
    title: 'Engineering joins the clinic',
    body:
      'Kevin Bennet arrives at Mayo Clinic after technology development roles at W.R. Grace, Exxon '
      + 'International and Amoco Chemicals. He goes on to chair Strategic Alliances and to '
      + 'administer the Division of Engineering.',
    source: 'Founder biography',
  },
  {
    /* No year. The biographies establish the laboratories and both men's role
       in founding them, and never date it. Guessing would be the only way to
       fill this column, so it stays empty. */
    year: null,
    title: 'The Neural Engineering and Precision Surgery Laboratories',
    body:
      'Kendall Lee and Kevin Bennet found the Neural Engineering and Precision Surgery Laboratories at Mayo Clinic and '
      + 'serve as co-directors. This is the room NaviNetics comes out of: a neurosurgeon and an '
      + 'engineer, in the same building as the operating theater.',
    source: 'Founder biographies — year not recorded',
  },
  {
    year: '2015',
    title: 'Distinguished Team Science',
    body: 'Dr Lee’s team is awarded the Mayo Clinic Distinguished Team Science award.',
    source: 'Founder biography',
  },
  {
    year: '2016',
    title: 'The prototype',
    body:
      'Goerss joins the Neural Engineering and Precision Surgery Laboratories. There he designs a spinal stereotactic '
      + 'device, a relocatable porcine headframe, and the prototype of the reusable stereotactic '
      + 'system NaviNetics now commercializes.',
    source: 'Founder biography',
  },
  {
    year: '2018',
    title: 'The published record begins',
    body:
      'The earliest of the selected papers appears. The work runs on two lines — reaching the '
      + 'target, and reading what happens there — and continues to the present.',
    source: 'Publication list',
    to: '/resources/publications',
  },
  {
    year: '2026',
    /* "NaviNetics Asia" and "subsidiary" both came off at the company's
       request. CBH is named as itself, which is what the review asked for, and
       what it does is unchanged. */
    title: 'CBH joins',
    body:
      'CBH is integrated in March, carrying manufacturing, R&D, and the Asia and Europe sales '
      + 'network.',
    source: 'Partner records',
    to: '/company/partners',
  },
];

/**
 * The counts, computed rather than typed.
 *
 * A hardcoded "9 papers" goes stale the moment someone adds a tenth. These read
 * the same files the rest of the site renders from, so they are always right or
 * always wrong together.
 */
export const numbers = () => {
  const years = publications.map((p) => p.year);
  return [
    { value: String(publications.length), label: 'Selected papers',
      unit: `${Math.min(...years)}–${Math.max(...years)}`, to: '/resources/publications' },
    { value: String(products.length), label: 'Product lines',
      unit: 'frames, tables, sensing', to: '/products/d1-stereotactic-frame' },
    { value: String(territories.length), label: 'Territories',
      /* Was "covered by partners", and the arithmetic did not survive a look:
         the United States is sold direct, three territories have no named
         organisation yet, and two partners are named anywhere on the site. The
         count of territories is right; what they are covered BY is mixed, and
         saying so is both accurate and unremarkable. */
      unit: 'served, direct and through partners', to: '/company/partners' },
    { value: String(disciplines.length), label: 'Disciplines',
      /* The unit named three where the number says six — see disciplines.js,
         which runs surgery, product, mechanical, imaging, verification and
         regulatory. Naming the span instead of a subset keeps the two in step
         however the list changes. */
      unit: 'surgery through to regulatory', to: '/resources/careers' },
  ];
};

/** What the company actually holds itself to. Paraphrased from the site. */
export const principles = [
  {
    title: 'Design by listening',
    body:
      /* See data/disciplines.js — same sentence, same reason for the change. */
      'A co-founder is a practicing neurosurgeon. Clinical input is not a quarterly advisory call — '
      + 'it is someone who will be holding the device at 7am, telling you there is metal where '
      + 'their hands need to be. The Skull Anchor Key exists because of that complaint.',
  },
  {
    title: 'Quality and simplicity',
    body:
      'Low complexity is a safety property, not a cost saving. Fewer parts to set, fewer ways to '
      + 'set them wrong, and fewer tolerances stacking up between the plan and the target.',
  },
  {
    title: 'Publish the evidence',
    body:
      'The methods behind these devices are in the peer-reviewed record, under the founders’ names '
      + 'and their laboratory’s. We cite what we claim.',
  },
];
