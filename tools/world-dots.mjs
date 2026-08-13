/**
 * Bake the land dot-field the partners globe draws.
 *
 * Run with:  node tools/world-dots.mjs [degrees]     (default 1.5)
 *
 * Output is src/data/worldDots.js — one string per latitude row, one character
 * per longitude slot:
 *
 *   '.'  ocean
 *   '0'  land with no partner behind it
 *   '1'… land inside a partner territory, encoded as territory*2 + strength
 *        where strength is 1 for a primary market and 2 for secondary
 *
 * Rows are equal-area: the longitude step widens by 1/cos(lat) so the dots stay
 * evenly spaced on the sphere instead of bunching at the poles. At 1.5° that is
 * ~4,800 dots and about 1.3 kB gzipped — small enough that a map library and a
 * tile server would both be more weight than the entire feature.
 *
 * This is the only step that needs the network, which is why the result is
 * committed rather than fetched at build time.
 */
import { writeFileSync } from 'node:fs';
import { dir } from './lib/paths.mjs';

const ROOT = dir('../', import.meta.url);
const SRC = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

/**
 * Which countries each partner covers, in the order the page lists them.
 * Names are Natural Earth's ADMIN field. 2 marks secondary coverage — reached,
 * but not the primary market.
 *
 * Keep this in step with TERRITORIES in src/data/partners.js: the ids here are
 * what the page matches dots against.
 */
const TERRITORIES = [
  { id: 'us', countries: { 'United States of America': 1 } },
  { id: 'sa', countries: {
    Brazil: 1,
    Argentina: 2, Chile: 2, Peru: 2, Colombia: 2, Venezuela: 2, Ecuador: 2,
    Bolivia: 2, Paraguay: 2, Uruguay: 2, Guyana: 2, Suriname: 2,
  } },
  { id: 'cn', countries: { China: 1 } },
  { id: 'au', countries: { Australia: 1, 'New Zealand': 2 } },
  { id: 'kr', countries: { 'South Korea': 1 } },
  /* Singapore is its own territory, not part of a "Greater China" grouping.
     It is smaller than one dot at this resolution, so it bakes to nothing and
     the page draws it as a point marker — see `sites` in data/partners.js.
     Listed anyway so this file and that one hold the same five... six ids. */
  { id: 'sg', countries: { Singapore: 1 } },
];

/* Antarctica is cut. It is land, it would ring the whole bottom of the globe,
   and no territory is anywhere near it. Greenland stays — the north Atlantic
   looks wrong without it. */
const LAT_MIN = -58;
const LAT_MAX = 84;
const STEP = Number(process.argv[2] ?? 1.5);

const res = await fetch(SRC);
if (!res.ok) throw new Error(`Natural Earth fetch failed: ${res.status}`);
const gj = await res.json();

const owner = new Map();
TERRITORIES.forEach((t, i) => {
  for (const [name, s] of Object.entries(t.countries)) owner.set(name, { t: i, s });
});

/* Every ring, flattened, each with its own bounding box — that turns the
   point-in-polygon test from ~290 rings per dot into two number comparisons
   for nearly all of them. */
const rings = [];
for (const f of gj.features) {
  const admin = f.properties.ADMIN ?? f.properties.admin;
  const own = owner.get(admin);
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    for (let r = 0; r < poly.length; r++) {
      const pts = poly[r];
      let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
      for (const [x, y] of pts) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      rings.push({ pts, hole: r > 0, own, x0, x1, y0, y1 });
    }
  }
}

const inRing = (lon, lat, r) => {
  if (lon < r.x0 || lon > r.x1 || lat < r.y0 || lat > r.y1) return false;
  const p = r.pts;
  let hit = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};

const rows = [];
let land = 0;
const per = {};
for (let lat = LAT_MAX; lat >= LAT_MIN; lat -= STEP) {
  const n = Math.max(4, Math.round((360 / STEP) * Math.cos((lat * Math.PI) / 180)));
  let row = '';
  for (let i = 0; i < n; i++) {
    const lon = -180 + (360 * (i + 0.5)) / n;
    let ch = '.';
    for (const r of rings) {
      if (!inRing(lon, lat, r)) continue;
      if (r.hole) { ch = '.'; break; }          // a lake — rings come outer-first
      ch = r.own ? String(r.own.t * 2 + r.own.s) : '0';
      if (r.own) break;                          // a tagged country wins outright
    }
    row += ch;
    if (ch !== '.') {
      land++;
      if (ch !== '0') per[TERRITORIES[(+ch - 1) >> 1].id] = (per[TERRITORIES[(+ch - 1) >> 1].id] || 0) + 1;
    }
  }
  rows.push(row);
}

const body = `/**
 * The land dot-field for the partners globe. GENERATED — do not hand-edit.
 * Regenerate with:  node tools/world-dots.mjs
 *
 * Derived from Natural Earth 1:110m country polygons (public domain). One
 * string per latitude row, one character per longitude slot: '.' is ocean, '0'
 * is land, and any other digit is land inside a partner territory, encoded as
 * territory index * 2 + strength (1 primary, 2 secondary). Rows are equal-area,
 * so the longitude step widens with 1/cos(lat).
 *
 * ${rows.length} rows, ${land} land dots, ${STEP}° spacing.
 */
export const worldDots = {
  step: ${STEP},
  latMax: ${LAT_MAX},
  rows: [
${rows.map((r) => `    '${r}',`).join('\n')}
  ],
};
`;
writeFileSync(ROOT + 'src/data/worldDots.js', body);

console.log(`${gj.features.length} countries, ${rings.length} rings`);
console.log(`${rows.length} rows, ${land} land dots at ${STEP}°`);
for (const t of TERRITORIES) console.log(`  ${t.id.padEnd(4)} ${per[t.id] ?? 0} dots`);
console.log(`src/data/worldDots.js  ${(body.length / 1024).toFixed(1)} kB`);
