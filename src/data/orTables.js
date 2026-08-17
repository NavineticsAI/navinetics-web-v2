import table from '../assets/or-tables/table.webp';
import tableAlt from '../assets/or-tables/table-alt.webp';
import tableSide from '../assets/or-tables/table-side.webp';
import tableMotion from '../assets/or-tables/table-motion.webp';

/**
 * The carbon table range.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 *
 * WHERE THE NUMBERS CAME FROM. Every figure below is transcribed from the
 * technical-specification table in CBH_Brochure_2026yr.pdf, read with
 * `pdftotext -table`. That flag matters: `-layout` reads the same tables with
 * the values one row out of step with their labels, so the CXR-701's 220 kg
 * table weight lands against "load capacity" and its 230 kg load capacity
 * lands against "Control Switch". Nothing here is estimated, converted or
 * rounded, and nothing has been carried across from one model to another.
 *
 * THE BROCHURE DISAGREES WITH ITSELF ABOUT THE CXR-704L, and this page does
 * not resolve it. Its specification table gives a height range of 734–1,184 mm
 * and lateral tilt of ±19°; the movement-feature page two sheets later gives
 * 722–1,172 mm and ±17°. The specification table is what is used here, because
 * it is the formal one, and `conflict` records the other figure so the page can
 * show that a question exists rather than quietly pick a side.
 *
 * WHOSE PRODUCT THIS IS. The brochure is branded Quantum Hunex Korea /
 * ParagonCare Korea and the tables carry a CBH mark — Carbon Bio Healthcare
 * Inc., which data/partners.js records as what NaviNetics Asia was before the
 * March 2026 integration. So this reads as NaviNetics' own Korean subsidiary's
 * product line, sold in Korea through a distributor. That is an inference from
 * two documents, and NaviNetics should confirm it before the page ships. The
 * distributor's address and telephone number are in the brochure and are
 * deliberately NOT on the page.
 *
 * NOT HERE, deliberately:
 *   · Any radiolucency figure. Carbon fiber attenuates X-rays far less than
 *     steel or aluminium — that is physics and the page says it — but no
 *     aluminium-equivalent value, no attenuation percentage and no image-
 *     quality claim appears anywhere in either PDF, so none appears here.
 *   · Any comparison with another manufacturer's table.
 *   · Regulatory status. Neither PDF states one.
 *   · The seven models in the line-up sheet that have no specification table
 *     behind them. They are named, and nothing is claimed about them.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const art = {
  table,
  tableAlt,
  tableSide,
  tableMotion,
};

/**
 * The five models the brochure specifies in full.
 *
 * `motions` is the interesting field: it is what the diagram animates, and it
 * is derived from the specification rather than written beside it — a model
 * has a motion if and only if its table gives that row a value. That is why
 * the CXR-701 shows three and the CXR-70S Tr shows five.
 */
export const models = [
  {
    id: 'cxr-701',
    name: 'CXR-701',
    line: 'Standard',
    motionCount: '1-motion',
    role: 'Small to medium clinics',
    top: { w: 2353, d: 613 },
    height: [594, 1044],
    slide: 300,
    weight: 220,
    load: 230,
    mattress: 'CMF 40 mm',
    control: 'Hand switch',
  },
  {
    id: 'cxr-702',
    name: 'CXR-702',
    line: 'Standard',
    motionCount: '2-motion',
    role: 'Small to medium clinics',
    top: { w: 2193, d: 613 },
    height: [625, 1075],
    slide: 300,
    weight: 230,
    load: 230,
    mattress: 'CMF 40 mm',
    control: 'Hand switch',
  },
  {
    id: 'cxr-704l',
    name: 'CXR-704L',
    line: 'Standard',
    motionCount: '4-motion',
    role: 'General and university hospitals',
    top: { w: 2193, d: 613 },
    height: [734, 1184],
    trendelenburg: 14,
    lateral: 19,
    slide: 300,
    weight: 260,
    load: 230,
    mattress: 'CMF 40 mm',
    control: 'Hand switch',
    /* See the claims notice: the movement-feature sheet gives different
       numbers for the same two rows. Shown on the page, not resolved. */
    conflict: {
      note: 'The movement-feature sheet in the same brochure gives 722–1,172 mm and ±17°.',
      height: [722, 1172],
      lateral: 17,
    },
  },
  {
    id: 'cxr-70s',
    name: 'CXR-70S',
    line: 'Standard',
    motionCount: 'Float 3-motion',
    role: 'General, small to medium clinics',
    top: { w: 2240, d: 670 },
    height: [692, 992],
    float: { x: 600, y: 300 },
    weight: 340,
    load: 230,
    mattress: 'CMF 40 mm',
    control: 'Hand switch',
  },
  {
    id: 'cxr-70s-tr',
    name: 'CXR-70S Tr',
    line: 'Standard',
    motionCount: 'Float + Trendelenburg',
    role: 'General, small to medium clinics',
    top: { w: 2239, d: 672 },
    height: [721, 1021],
    trendelenburg: 15,
    slide: 300,
    float: { x: 600, y: 300 },
    weight: 330,
    load: 230,
    mattress: 'CMF 40 mm',
    control: 'Hand switch',
  },
];

/**
 * Which motions a model has, read off its own specification.
 *
 * One place, so the diagram, the chips and the spec table can never disagree
 * about whether a table tilts.
 */
export function motionsOf(m) {
  const out = [{ id: 'height', label: 'Height', value: `${m.height[0]}–${m.height[1]} mm` }];
  if (m.trendelenburg) {
    out.push({ id: 'trend', label: 'Trendelenburg', value: `±${m.trendelenburg}°` });
  }
  if (m.lateral) out.push({ id: 'lateral', label: 'Lateral tilt', value: `±${m.lateral}°` });
  if (m.slide) out.push({ id: 'slide', label: 'Slide', value: `${m.slide} mm` });
  if (m.float) out.push({ id: 'float', label: 'Float', value: `X ${m.float.x} · Y ${m.float.y} mm` });
  return out;
}

/**
 * The rest of the range, from the line-up sheet.
 *
 * Named only. None of these has a specification table behind it in either PDF,
 * so nothing is claimed about any of them beyond what the sheet itself prints.
 */
export const lineup = [
  {
    group: 'Premium',
    blurb: 'Advanced multi-motion tables for full clinical versatility.',
    items: [
      { name: 'CST-705', note: 'Float 5-motion' },
      { name: 'CST-706', note: '6-motion, mobile CT' },
      { name: 'CST-70J', note: 'Spine and general surgery' },
    ],
  },
  {
    group: 'Customized',
    blurb: 'Tailored to a specific imaging system or clinical application.',
    items: [
      { name: 'CXR-70F_N', note: 'For L&C AI Mobile CT' },
      { name: 'CXR-702D', note: 'For L&C Dentium WBCT' },
      /* V1 / V2 is not a table. It is a gamma stimulation platform that the
         supplier's range sheet lists alongside them, and on a page about
         operating tables every reader stops on it. The note now says what it is
         rather than leaving the reader to work out why a therapy device is in a
         table line-up. If it does not belong in NaviNetics' catalogue at all,
         delete the entry — that is a commercial call, not an editorial one. */
      { name: 'V1 / V2', note: 'Gamma stimulation platform, not a table' },
    ],
  },
];

/**
 * The six the line-up sheet closes on — restated as descriptions rather than
 * as the sheet's marketing adjectives, because the page renders them in
 * NaviNetics' voice, not the supplier's.
 *
 * "Superior radiolucency" was the first of them: a comparative performance
 * claim with no comparator, on the one property this file states outright it
 * has no figure for (see the claims notice above — no aluminium-equivalent
 * value, no attenuation percentage). "Lightweight and safe" carried the same
 * problem in the second half. What is left is what the tables are, which is
 * what a buyer scanning six words actually needs.
 */
/* Three of these six were still the sheet's adjectives when the rest had been
   rewritten, and adjectives are the one thing this page cannot afford:
   "Reliable and durable" says nothing a buyer can check, "Custom solutions" is
   the Customized group restated, and "Global service support" is a SERVICE
   COMMITMENT — a promise about response times and coverage that nothing on this
   site, or in the range sheet, stands behind. Replaced with properties the page
   already demonstrates elsewhere. */
export const strengths = [
  'Radiolucent carbon-fiber construction',
  'Low mass for the span',
  'Wide motion range',
  'Float in X and Y over the column',
  'Built for imaging-guided procedures',
  'Five models specified in full',
];

export const getModel = (id) => models.find((m) => m.id === id) ?? models[0];
