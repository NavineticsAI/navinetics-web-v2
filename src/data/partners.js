import paragon from '../assets/partners/paragon-care.webp';
import cbh from '../assets/partners/cbh.webp';
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
 * WHAT NAVINETICS REMOVED, 2026-08-12. Abbott, Lituo Medical and ELIM DMP all
 * came off this page on instruction. Their artwork is still in
 * src/assets/partners/ and tools/partner-logos.mjs still knows how to build it,
 * so putting any of them back is a data change here and nothing else.
 *
 * The name/logo mismatch flagged here previously is resolved: South Korea is
 * presented as CBH, which is what the supplied mark has always shown. The
 * subsidiary traded as CBH until March 2026 and the company's instruction is to
 * keep that name, so the name now follows the logo rather than the reverse.
 *
 * China, Taiwan and Singapore are separate territories with no organization named
 * yet — see `note` on each. "Greater China & Singapore" grouped all three under
 * one distributor; with that distributor gone the grouping had nothing holding
 * it together, so each stands on its own.
 *
 * The `id` of each territory must match the order in tools/world-dots.mjs —
 * that is what ties a record to the dots the globe tints for it. Both files
 * were changed together and the dot field was rebaked; Singapore is smaller
 * than one dot at 1.5° and bakes to zero, which is why it carries a `sites`
 * marker instead.
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
    /* Was "Direct from Rochester, with Abbott carrying distribution." Abbott
       came off the list and what was left read as a shipping origin rather than
       a sales model. This says the thing the row is actually for: who sells
       into this territory. */
    summary: 'Sold direct by NaviNetics.',
    orgs: [
      {
        /* `self` makes the tile draw the <Logo> lockup — the same component the
           navbar and the footer use — instead of the flat PNG. `logo` stays as
           the fallback for anything that renders a mark without going through
           <Mark>. */
        self: true,
        logo: naviLogo,
        name: 'NaviNetics, Inc.',
        role: 'Headquarters',
        body:
          '206 S Broadway, Suite 700, Rochester, Minnesota — the company itself, and where the '
          + 'systems are designed.',
      },
    ],
    cover: [['United States', 1]],
  },
  {
    id: 'sa',
    label: 'South America',
    anchor: [-10.5, -52],
    summary: 'Brazil first, then the rest of the continent.',
    orgs: [
      {
        logo: delta,
        name: 'Delta Medical',
        role: 'Distribution',
        body:
          'Distribution across South America, led by Brazil and reaching the rest of the '
          + 'continent.',
      },
    ],
    cover: [
      ['Brazil', 1], ['Argentina', 2], ['Chile', 2], ['Peru', 2], ['Colombia', 2],
      ['Rest of South America', 2],
    ],
  },
  {
    id: 'cn',
    label: 'China',
    anchor: [34, 104],
    summary: 'A market we cover. The partner is being confirmed.',
    orgs: [],
    note: 'NaviNetics is naming the partner or collaborator for this market. '
      + 'It will be listed here once it is confirmed.',
    cover: [['China', 1]],
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
        body: 'Distribution in Australia, and the route into neighboring markets.',
      },
    ],
    cover: [['Australia', 1]],
  },
  {
    id: 'kr',
    label: 'South Korea',
    anchor: [36.5, 127.9],
    /* "Subsidiary" came out at the company's request, here and in the tile
       below. What the row needs to convey is unchanged and is a fact rather
       than a corporate structure: this territory does more than sell. */
    summary: 'Manufacturing and R&D as well as sales.',
    orgs: [
      {
        logo: cbh,
        /* Named here, because the carbon tables page says "Built by CBH in South
           Korea — see our partners" and this page did not contain the letters
           CBH anywhere. A cross-reference that does not resolve is worse than no
           cross-reference. */
        name: 'CBH',
        role: 'Manufacturing, R&D and sales',
        /* The second sentence named the carbon-fiber tables, which are
           withdrawn pending FDA registration — see data/products.js. */
        body: 'CBH carries manufacturing, R&D, and the Asia and Europe sales network.',
      },
    ],
    cover: [['South Korea', 1]],
  },
  {
    /* Its own territory, no longer folded into a "Greater China" grouping.
       Smaller than one dot at globe scale, so it carries a point marker rather
       than a tinted region — drawing it as an area would mean drawing area that
       is not there. Baked to 0 dots by tools/world-dots.mjs, as expected. */
    id: 'sg',
    label: 'Singapore',
    anchor: [1.35, 103.8],
    summary: 'A market we cover. The partner is being confirmed.',
    orgs: [],
    note: 'NaviNetics is naming the partner or collaborator for this market. '
      + 'It will be listed here once it is confirmed.',
    cover: [['Singapore', 1]],
    sites: [[1.35, 103.8, 'Singapore']],
  },
  {
    /* Taiwan, listed separately for the same reason as Singapore. It bakes to a
       single dot at 1.5 degrees, so it also carries a point marker rather than
       relying on a tinted region a reader would struggle to see. */
    id: 'tw',
    label: 'Taiwan',
    anchor: [23.7, 121],
    summary: 'A market we cover. The partner is being confirmed.',
    orgs: [],
    note: 'NaviNetics is naming the partner or collaborator for this market. '
      + 'It will be listed here once it is confirmed.',
    cover: [['Taiwan', 1]],
    sites: [[23.7, 121, 'Taiwan']],
  },
];

/** CSS custom property holding a territory's color. See :root in index.css. */
export const territoryVar = (id) => `--terr-${id}`;

/**
 * Scientific collaborators.
 *
 * Supplied by NaviNetics on 2026-08-12, in this order. These are research
 * relationships, not distribution — which is why they are a separate section
 * rather than more pins on the globe.
 *
 * NO ARTWORK, DELIBERATELY. Each name is set in type on the same plate the
 * partner marks use, which is what makes them a consistent size: the plate
 * fixes the height, so nothing depends on ten institutions' logos happening to
 * have compatible proportions. Adding a real mark later is one `logo` field
 * here and nothing else — <Mark> already prefers artwork when a record has it.
 *
 * Worth knowing before that happens: these are third-party trademarks, and
 * several of these institutions (Mayo Clinic and Stanford especially) restrict
 * use of their marks by companies precisely because a logo on a commercial site
 * reads as endorsement. Written permission is the institution's to give, not
 * ours to assume.
 */
export const collaborators = [
  { name: 'Mayo Clinic' },
  { name: 'University of Toronto' },
  { name: 'University of Texas at El Paso' },
  { name: 'University of Melbourne' },
  { name: 'Deakin University' },
  { name: 'Korea University' },
  { name: 'Hanyang University' },
  { name: 'University of Queensland' },
  { name: 'Stanford University' },
  { name: 'Samsung Medical Center' },
];
