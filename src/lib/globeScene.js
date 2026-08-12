/**
 * The partners globe: projection, the land dot-field, and the drawing pass.
 *
 * Orthographic, which is what a globe seen from far away actually is, and the
 * projection every atlas uses for this picture. Two rotations set what faces
 * the viewer — `lon0` is the longitude at the centre of the disc and `lat0` the
 * latitude — and a point is on the near side when its rotated z is positive.
 *
 * The maths lives here rather than in the component so it can be reasoned about
 * without React in the way, the same split as arcScene.js.
 */

export const RAD = Math.PI / 180;

/** Unit vector for a latitude and longitude, in the un-rotated earth frame. */
export function unit(lat, lon) {
  const cf = Math.cos(lat * RAD);
  return { x: cf * Math.sin(lon * RAD), y: Math.sin(lat * RAD), z: cf * Math.cos(lon * RAD) };
}

/**
 * Precompute the sines and cosines for one frame's orientation.
 *
 * Both angles are negated: `lon0` and `lat0` name the point that should end up
 * facing the viewer, so the world turns by the opposite of each.
 */
export function rotor(lon0, lat0) {
  const a = -lon0 * RAD;
  const b = -lat0 * RAD;
  return { ca: Math.cos(a), sa: Math.sin(a), cb: Math.cos(b), sb: Math.sin(b) };
}

/** Rotate a unit vector into view space and drop it onto the disc. z > 0 is near. */
export function project(v, r, view) {
  const x1 = v.x * r.ca + v.z * r.sa;
  const z1 = -v.x * r.sa + v.z * r.ca;
  const y2 = v.y * r.cb + z1 * r.sb;
  const z2 = -v.y * r.sb + z1 * r.cb;
  return { x: view.cx + view.R * x1, y: view.cy - view.R * y2, z: z2 };
}

/**
 * Expand the baked rows into flat typed arrays.
 *
 * Done once, at module scope. Rotating a stored unit vector is nine multiplies;
 * rebuilding it from latitude and longitude would be four trig calls per dot
 * per frame, and there are ~4,800 dots.
 */
export function decodeDots({ step, latMax, rows }) {
  const n = rows.reduce((sum, row) => sum + row.length - (row.split('.').length - 1), 0);
  const d = {
    n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    z: new Float32Array(n),
    t: new Int8Array(n),
    s: new Uint8Array(n),
  };
  let i = 0;
  rows.forEach((row, r) => {
    const lat = latMax - r * step;
    const cf = Math.cos(lat * RAD);
    const sf = Math.sin(lat * RAD);
    for (let j = 0; j < row.length; j++) {
      const ch = row[j];
      if (ch === '.') continue;
      const lon = -180 + (360 * (j + 0.5)) / row.length;
      d.x[i] = cf * Math.sin(lon * RAD);
      d.y[i] = sf;
      d.z[i] = cf * Math.cos(lon * RAD);
      const v = ch === '0' ? 0 : +ch;
      d.t[i] = v ? (v - 1) >> 1 : -1;      // territory index, -1 for plain land
      d.s[i] = v ? ((v - 1) % 2) + 1 : 0;  // 1 primary market, 2 secondary
      i++;
    }
  });
  return d;
}

/** `#rrggbb` plus an alpha, as an rgba() string. */
export function withAlpha(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/**
 * Samples along the great circle from `a` to `b`, lifted clear of the surface.
 *
 * Each sample says whether it is visible, and that test is the part worth
 * stating: a point lifted off the sphere can be seen even when the ground under
 * it is on the far side — that is exactly what an arc crossing the horizon
 * looks like. So a sample is hidden only when it is behind the centre plane AND
 * its projected position falls inside the disc. Testing z alone chops the arc
 * at the limb and leaves a stray hook floating in space.
 */
export function greatCircle(a, b, r, view, steps = 128) {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const om = Math.acos(dot);
  if (om < 1e-4) return [];
  const so = Math.sin(om);
  const lift = 0.16 + 0.17 * (om / Math.PI);
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const k1 = Math.sin((1 - u) * om) / so;
    const k2 = Math.sin(u * om) / so;
    const v = {
      x: a.x * k1 + b.x * k2,
      y: a.y * k1 + b.y * k2,
      z: a.z * k1 + b.z * k2,
    };
    const p = project(v, r, view);
    const k = 1 + lift * Math.sin(u * Math.PI);
    const x = view.cx + (p.x - view.cx) * k;
    const y = view.cy + (p.y - view.cy) * k;
    const inDisc = Math.hypot(x - view.cx, y - view.cy) < view.R;
    out.push({ x, y, vis: !(p.z < 0 && inDisc) });
  }
  return out;
}

function stroke(ctx, pts) {
  ctx.beginPath();
  let open = false;
  for (const p of pts) {
    if (!p.vis) { open = false; continue; }
    if (open) ctx.lineTo(p.x, p.y);
    else { ctx.moveTo(p.x, p.y); open = true; }
  }
  ctx.stroke();
}

/**
 * The graticule as unit vectors, built ONCE at module load.
 *
 * These lines are fixed on the sphere — only the viewer moves — so their unit
 * vectors never change. Rebuilding them per frame called unit() for every point
 * of every line: 5 parallels at 121 points plus 12 meridians at 60, about 1,300
 * points and ~5,300 trigonometric calls, to redraw the same wireframe from the
 * same numbers. Now each frame only rotates and projects what already exists.
 *
 * Honest note: this did NOT measurably move the page's busy ratio (93.1% before,
 * 93.8% after — i.e. within noise), so it is not the bottleneck on this page.
 * It is kept because it is strictly less work for an identical picture, and
 * because knowing it is *not* the cause narrows where to look next.
 */
const GRATICULE = (() => {
  const lines = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const line = [];
    for (let lon = -180; lon <= 180; lon += 3) line.push(unit(lat, lon));
    lines.push(line);
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const line = [];
    for (let lat = -88; lat <= 88; lat += 3) line.push(unit(lat, lon));
    lines.push(line);
  }
  return lines;
})();

function meridians(ctx, r, view, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  // One path for the whole wireframe rather than one per line.
  ctx.beginPath();
  for (const line of GRATICULE) {
    let open = false;
    for (const v of line) {
      const p = project(v, r, view);
      if (p.z <= 0) { open = false; continue; }
      if (open) ctx.lineTo(p.x, p.y);
      else { ctx.moveTo(p.x, p.y); open = true; }
    }
  }
  ctx.stroke();
}

/**
 * One frame.
 *
 * `state.glow` is a 0…1 per territory, eased by the caller, so selecting one
 * lifts its dots and lays a wash under them rather than snapping.
 */
export function drawGlobe(ctx, view, dots, state, pal) {
  const { cx: X, cy: Y, R } = view;
  ctx.clearRect(0, 0, view.w, view.h);
  const r = rotor(state.lon0, state.lat0);

  // atmosphere — a thin falloff outside the limb, so the globe sits in the page
  // rather than being cut out of it
  const air = ctx.createRadialGradient(X, Y, R * 0.97, X, Y, R * 1.13);
  air.addColorStop(0, withAlpha(pal.action, 0.13));
  air.addColorStop(1, withAlpha(pal.action, 0));
  ctx.fillStyle = air;
  ctx.beginPath();
  ctx.arc(X, Y, R * 1.13, 0, Math.PI * 2);
  ctx.fill();

  // the sphere itself, lit from the upper left
  const body = ctx.createRadialGradient(X - R * 0.35, Y - R * 0.4, R * 0.1, X, Y, R);
  body.addColorStop(0, pal.sky1);
  body.addColorStop(1, pal.sky2);
  ctx.beginPath();
  ctx.arc(X, Y, R, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  meridians(ctx, r, view, pal.grid);

  // a soft wash under whichever territory is lit, clipped to the disc
  for (const [id, glow] of Object.entries(state.glow)) {
    if (glow < 0.01) continue;
    const anchor = state.anchors[id];
    if (!anchor) continue;
    const p = project(anchor, r, view);
    if (p.z <= 0) continue;
    const wash = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 0.42);
    wash.addColorStop(0, withAlpha(pal.terr[id], 0.3 * glow * p.z));
    wash.addColorStop(1, withAlpha(pal.terr[id], 0));
    ctx.save();
    ctx.beginPath();
    ctx.arc(X, Y, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = wash;
    ctx.fillRect(X - R, Y - R, R * 2, R * 2);
    ctx.restore();
  }

  /* ── the land ────────────────────────────────────────────────────────────
     BATCHED BY COLOUR, and it matters more here than anywhere else on the
     site. There are 4,846 dots. Drawn one at a time — a withAlpha() string
     built per dot, assigned to fillStyle (which re-parses it), then
     beginPath/arc/fill — that is roughly 24,000 canvas operations and 4,846
     string allocations PER FRAME, about 290,000 a second at 60fps. Measured
     on the built site under a 4x CPU throttle it produced 486 long tasks and
     7,260ms of total blocking time on /company/partners: the main thread was
     never free, so taps queued behind it and the whole page felt broken.

     Alpha varies continuously with depth, so it is quantised to 1/16ths and
     dots are grouped into one Path2D per (colour, alpha) bucket. Radius may
     still vary freely within a bucket — only the fill colour has to be
     constant. That turns ~4,846 fills into fewer than a hundred, and builds
     each colour string once per bucket instead of once per dot.

     moveTo before each arc is load-bearing: without it every arc is joined to
     the previous subpath and the globe fills in as one solid blob.        */
  const base = Math.max(1.05, R / 150);
  const { ca, sa, cb, sb } = r;
  const TAU = Math.PI * 2;
  const STEPS = 16;
  const buckets = new Map();

  for (let i = 0; i < dots.n; i++) {
    const x1 = dots.x[i] * ca + dots.z[i] * sa;
    const z1 = -dots.x[i] * sa + dots.z[i] * ca;
    const y2 = dots.y[i] * cb + z1 * sb;
    const z2 = -dots.y[i] * sb + z1 * cb;
    const px = X + R * x1;
    const py = Y - R * y2;

    let key, colour, rad;

    if (z2 <= 0) {
      if (!state.ghost) continue;
      key = 'g';
      colour = pal.ghost;
      rad = base * 0.62;
    } else {
      // dots near the limb are seen almost edge-on, so they fade rather than
      // piling up into a hard ring
      const edge = Math.min(1, z2 * 3.2);
      rad = base * (0.7 + 0.45 * z2);
      const t = dots.t[i];
      if (t < 0) {
        const q = Math.round((0.5 + 0.5 * edge) * STEPS);
        if (q <= 0) continue;
        key = `l${q}`;
        colour = withAlpha(pal.land, q / STEPS);
      } else {
        const id = state.ids[t];
        const glow = state.glow[id] ?? 0;
        const a = (0.62 + 0.38 * glow) * edge * (dots.s[i] === 1 ? 1 : 0.45);
        const q = Math.round(a * STEPS);
        if (q <= 0) continue;
        key = `t${t}_${q}`;
        colour = withAlpha(pal.terr[id], q / STEPS);
        rad *= 1 + 0.28 * glow;
      }
    }

    let b = buckets.get(key);
    if (!b) { b = { colour, path: new Path2D() }; buckets.set(key, b); }
    b.path.moveTo(px + rad, py);
    b.path.arc(px, py, rad, 0, TAU);
  }

  for (const b of buckets.values()) {
    ctx.fillStyle = b.colour;
    ctx.fill(b.path);
  }

  ctx.beginPath();
  ctx.arc(X, Y, R, 0, Math.PI * 2);
  ctx.strokeStyle = pal.rim;
  ctx.lineWidth = 1;
  ctx.stroke();

  return r;
}

/** The route from home to a selected territory, plus one bead running it. */
export function drawRoute(ctx, view, from, to, r, colour, alpha, bead) {
  const pts = greatCircle(from, to, r, view);
  if (!pts.length) return;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.strokeStyle = withAlpha(colour, 0.8 * alpha);
  stroke(ctx, pts);
  if (bead == null) return;
  const p = pts[Math.round(bead * (pts.length - 1))];
  if (!p || !p.vis) return;
  ctx.fillStyle = withAlpha(colour, alpha);
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
  ctx.fill();
}
