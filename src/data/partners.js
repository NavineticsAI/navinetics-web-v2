import abbott from '../assets/partners/abbott.webp';
import paragon from '../assets/partners/paragon-care.webp';
import lituo from '../assets/partners/lituo-medical.webp';
import naviAsia from '../assets/partners/navinetics-asia.webp';
import elim from '../assets/partners/elim-dmp.webp';
import delta from '../assets/partners/delta-medical.webp';
import naviLogo from '../assets/logo.png';

/**
 * Where the systems can be delivered, and who delivers them.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 * Everything below comes from src/assets/partners/info.pptx or from what the
 * company has stated directly. Nothing here quotes a revenue figure, a market
 * share, a regulatory status or a date that was not in that deck.
 *
 * Three things were in the deck and are deliberately NOT on this page:
 *
 *   · The FDA and CE MDR badges. Those are regulatory claims. They belong on a
 *     page built to carry them with their scope and their certificate numbers,
 *     not as decoration on a distribution map.
 *   · The 2026 US revenue forecast. Not public-site material.
 *   · The export-growth narrative. It is an investor argument, and this page
 *     answers a different question: who can supply a system where.
 *
 * Both of the open questions have since been answered by NaviNetics:
 *
 *   · ELIM DMP is the manufacturing partner for NaviNetics Asia. The deck had
 *     it as "Partner company" and nothing more, which is how it was listed
 *     until the relationship was confirmed.
 *   · Delta Medical and NaviNetics Asia both have real artwork now — neither
 *     is a drawn placeholder any longer. Every mark on this page is the
 *     organisation's own.
 *
 * ONE THING TO BE SURE OF. The NaviNetics Asia slot currently shows the CBH
 * mark, supplied at 1485×944 — not a NaviNetics Asia mark. That reads as
 * deliberate, since the subsidiary was CBH until March 2026 and may still
 * trade under it. But this page introduces the organisation as "NaviNetics
 * Asia", so it is a name and a logo that do not match. If the intent is that
 * South Korea is presented as CBH, the name should follow the logo; if a
 * NaviNetics Asia mark exists, it should replace the file. Either is one
 * change. See tools/partner-logos.mjs.
 *
 * The `id` of each territory must match the order in tools/world-dots.mjs —
 * that is what ties a record to the dots the globe tints for it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Rochester, Minnesota. The one point on the map that is us, not a partner. */
export const HOME = { lat: 44.02, lon: -92.46 };

export const territories = [
  {
    id: 'us',
    label: 'United States',
    anchor: [39.5, -98.5],
    home: true,
    summary: 'Direct from Rochester, with Abbott carrying distribution.',
    orgs: [
      {
        /* Served from public/ rather than imported: it is the same file the
           navbar uses, and one copy cannot drift from the other. */
        logo: naviLogo,
        name: 'NaviNetics, Inc.',
        role: 'Headquarters',
        body:
          '206 S Broadway, Suite 700, Rochester, Minnesota — the company itself, and where the '
          + 'systems are designed.',
      },
      {
        logo: abbott,
        name: 'Abbott',
        role: 'Distribution',
        body:
          'Distribution across the United States through Abbott’s established network and sales '
          + 'infrastructure.',
      },
    ],
    cover: [['United States', 1]],
  },
  {
    id: 'sa',
    label: 'South America',
    anchor: [-10.5, -52],
    summary: 'Brazil as the primary market, the rest of the continent behind it.',
    orgs: [
      {
        logo: delta,
        name: 'Delta Medical',
        role: 'Distribution',
        body:
          'Distribution across South America, with Brazil as the primary market and the remaining '
          + 'countries served secondarily.',
      },
    ],
    cover: [
      ['Brazil', 1], ['Argentina', 2], ['Chile', 2], ['Peru', 2], ['Colombia', 2],
      ['Rest of South America', 2],
    ],
  },
  {
    id: 'cn',
    label: 'Greater China & Singapore',
    anchor: [34, 104],
    summary: 'Lituo Medical’s local network across three markets.',
    orgs: [
      {
        logo: lituo,
        name: 'Lituo Medical 丽拓生物',
        role: 'Distribution',
        body:
          'Distribution through Lituo Medical’s local network in China, extending to Taiwan and '
          + 'Singapore.',
      },
    ],
    cover: [['China', 1], ['Taiwan', 1], ['Singapore', 1]],
    /* Both are smaller than one dot at globe scale, so they carry a point
       marker rather than a tinted region. Drawing them as areas would mean
       drawing area that is not there. */
    sites: [[23.7, 121, 'Taiwan'], [1.35, 103.8, 'Singapore']],
  },
  {
    id: 'au',
    label: 'Australia',
    anchor: [-25.5, 134],
    summary: 'Paragon Care across Australia.',
    orgs: [
      {
        logo: paragon,
        name: 'Paragon Care',
        role: 'Distribution',
        body: 'Distribution in Australia, and the route into neighbouring markets in the region.',
      },
    ],
    cover: [['Australia', 1]],
  },
  {
    id: 'kr',
    label: 'South Korea',
    anchor: [36.5, 127.9],
    summary: 'A subsidiary, not a distributor — manufacturing and R&D as well as sales.',
    orgs: [
      {
        logo: naviAsia,
        name: 'NaviNetics Asia',
        role: 'Subsidiary',
        body:
          'Integrated as a subsidiary in March 2026, formerly CBH. Carries manufacturing, R&D, and '
          + 'the Asia and Europe sales network.',
      },
      {
        logo: elim,
        name: 'ELIM DMP',
        role: 'Manufacturing partner',
        body: 'Manufacturing partner for NaviNetics Asia. The deck listed it only as a partner '
          + 'company; NaviNetics confirmed what the relationship is.',
      },
    ],
    cover: [['South Korea', 1]],
  },
];

/** CSS custom property holding a territory's colour. See :root in index.css. */
export const territoryVar = (id) => `--terr-${id}`;
