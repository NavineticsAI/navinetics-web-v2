/**
 * Bake the locator outline for the community page.
 *
 * Run with:  node tools/locator-map.mjs
 *
 * Writes src/data/locatorMap.js — Minnesota's border plus its neighbours as
 * context, simplified and quantised, in plain latitude/longitude.
 *
 * This exists because the page used to hotlink a stock photograph of downtown
 * Rochester from a third-party CDN — an uncontrolled dependency, on a page
 * NaviNetics owns, with no licence on file. Drawn geography has no such
 * problem: Natural Earth is public domain, the file is a couple of kilobytes,
 * and it follows the site's theme instead of fighting it.
 *
 * Only this tool needs the network. The output is committed.
 */
import { writeFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '');
const SRC = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson';

/** Minnesota is the subject; the rest are there so it is not a blob in space. */
const HOME = 'Minnesota';
const CONTEXT = ['Wisconsin', 'Iowa', 'South Dakota', 'North Dakota', 'Illinois', 'Michigan', 'Nebraska', 'Missouri'];

/**
 * Ramer–Douglas–Peucker on an OPEN polyline. A state border at 1:50m carries
 * far more vertices than a 600px-wide map can show; dropping the ones that do
 * not move the shape by more than `eps` degrees cuts the file by an order of
 * magnitude and is invisible at the size this draws.
 */
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  let far = 0;
  let idx = 0;
  const [ax, ay] = pts[0];
  const [bx, by] = pts[pts.length - 1];
  const dx = bx - ax;
  const dy = by - ay;
  const den = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / den;
    if (d > far) { far = d; idx = i; }
  }
  if (far <= eps) return [pts[0], pts[pts.length - 1]];
  return [
    ...simplify(pts.slice(0, idx + 1), eps).slice(0, -1),
    ...simplify(pts.slice(idx), eps),
  ];
}

/**
 * RDP over a closed ring.
 *
 * Handing a ring straight to `simplify` collapses it to two points every time.
 * A GeoJSON ring repeats its first vertex at the end, so the baseline RDP draws
 * between the endpoints has zero length — every vertex then measures zero
 * distance from it, nothing beats `eps`, and the whole state disappears.
 *
 * Splitting the ring at the vertex farthest from the start gives each half a
 * real baseline to measure against.
 */
function simplifyRing(ring, eps) {
  const pts = ring.slice(0, -1);
  if (pts.length < 8) return ring;
  let far = -1;
  let idx = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if (d > far) { far = d; idx = i; }
  }
  const head = simplify(pts.slice(0, idx + 1), eps);
  const tail = simplify(pts.slice(idx), eps);
  const out = [...head.slice(0, -1), ...tail];
  return [...out, out[0]];
}

const res = await fetch(SRC);
if (!res.ok) throw new Error(`Natural Earth fetch failed: ${res.status}`);
const gj = await res.json();

const q = (n) => Math.round(n * 1000) / 1000;   // ~110 m, far finer than the draw
const ringsFor = (name, eps) => {
  const f = gj.features.find((x) => (x.properties.name ?? x.properties.NAME) === name
    && (x.properties.admin ?? x.properties.ADMIN) === 'United States of America');
  if (!f) throw new Error(`no feature for ${name}`);
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  return polys
    .map((p) => simplifyRing(p[0], eps).map(([x, y]) => [q(x), q(y)]))
    .filter((r) => r.length > 3);
};

const home = ringsFor(HOME, 0.02);
const context = CONTEXT.map((n) => ({ name: n, rings: ringsFor(n, 0.06) }));

const count = (rs) => rs.reduce((a, r) => a + r.length, 0);
const body = `/**
 * Locator outline for the community page. GENERATED — do not hand-edit.
 * Regenerate with:  node tools/locator-map.mjs
 *
 * Natural Earth 1:50m state borders (public domain), simplified with
 * Ramer–Douglas–Peucker and quantised to three decimal places — about 110 m,
 * which is far finer than a 600px map can resolve. Plain [lon, lat] degrees.
 */
export const locatorMap = {
  home: ${JSON.stringify(home)},
  context: ${JSON.stringify(context)},
};

/** Places named on the map. Coordinates are the standard civic ones. */
export const places = [
  { id: 'roc', name: 'Rochester', lat: 44.0121, lon: -92.4802, home: true },
  { id: 'msp', name: 'Minneapolis–Saint Paul', lat: 44.9778, lon: -93.265 },
];
`;
writeFileSync(ROOT + 'src/data/locatorMap.js', body);

/* Great-circle distance, so the page can state one without me inventing it. */
const R = 6371;
const rad = (d) => (d * Math.PI) / 180;
const [a, b] = [{ lat: 44.0121, lon: -92.4802 }, { lat: 44.9778, lon: -93.265 }];
const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2
  + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
const km = 2 * R * Math.asin(Math.sqrt(h));

console.log(`${HOME}: ${home.length} rings, ${count(home)} points`);
console.log(`context: ${context.length} states, ${context.reduce((s, c) => s + count(c.rings), 0)} points`);
console.log(`src/data/locatorMap.js  ${(body.length / 1024).toFixed(1)} kB`);
console.log(`\nRochester → Minneapolis, straight line: ${km.toFixed(0)} km / ${(km * 0.621371).toFixed(0)} mi`);
console.log('(road distance is longer — the page says "about an hour", which the site already claimed)');
