/**
 * The animated grounds behind the carbon table bands.
 *
 * Same contract as lib/mavenScenes.js and lib/featureScenes.js: a builder
 * returns `draw(ctx, w, h, t)` and keeps whatever it needs in the closure.
 * Both scenes here are about the same physical fact from two directions —
 * something has to pass through the table for the image to be worth having.
 */

function hash(i) {
  let x = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

const clear = (ctx, w, h) => { ctx.clearRect(0, 0, w, h); };

/** Ink for a light ground, light for a dark one. Same reasoning as MAVEN's. */
export function palette(light) {
  return light
    ? { beam: '28 92 134', warm: '176 92 20', rule: '11 56 77', k: 0.7 }
    : { beam: '120 200 230', warm: '224 151 63', rule: '163 200 216', k: 1 };
}
const rgba = (c, a, P) => `rgb(${c} / ${(a * P.k).toFixed(3)})`;

/* ═══════════════════════════════════════════════════════════════════════════
   Radiolucency — what gets through

   A source above, a fan of rays down through a section, and a detector below.
   Rays crossing the carbon top continue; rays crossing the two metal blocks
   beside it stop. Nothing here is a measurement — it is the reason the top is
   made of what it is made of, drawn.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeBeam(light) {
  const P = palette(light);
  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const sx = w * (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.34)));
    const sy = h * 0.13;
    const topY = h * 0.52;
    const detY = h * 0.85;
    const halfW = w * 0.34;

    // the top, in section
    ctx.fillStyle = rgba(P.rule, 0.13, P);
    ctx.fillRect(w / 2 - halfW, topY, halfW * 2, 14);
    // and the two things that are not carbon
    ctx.fillStyle = rgba(P.warm, 0.4, P);
    ctx.fillRect(w / 2 - halfW - 46, topY - 8, 40, 30);
    ctx.fillRect(w / 2 + halfW + 6, topY - 8, 40, 30);

    const RAYS = 46;
    for (let i = 0; i <= RAYS; i++) {
      const u = i / RAYS;
      const x0 = w * 0.08 + u * w * 0.84;
      // where the ray crosses the plane of the top
      const cross = sx + (x0 - sx) * ((topY - sy) / (detY - sy));
      const blocked = Math.abs(cross - w / 2) > halfW && Math.abs(cross - w / 2) < halfW + 52;
      const jitter = (hash(i + Math.floor(t * 2)) - 0.5) * 0.1;

      ctx.strokeStyle = blocked
        ? rgba(P.warm, 0.16 + jitter, P)
        : rgba(P.beam, 0.3 + jitter, P);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(blocked ? cross : x0, blocked ? topY : detY);
      ctx.stroke();

      // what reaches the detector, as a mark on it
      if (!blocked) {
        ctx.fillStyle = rgba(P.beam, 0.5, P);
        ctx.fillRect(x0 - 1.5, detY, 3, 7);
      }
    }

    // source and detector
    ctx.fillStyle = rgba(P.beam, 0.55, P);
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, 6.283);
    ctx.fill();
    ctx.strokeStyle = rgba(P.rule, 0.22, P);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.06, detY);
    ctx.lineTo(w * 0.94, detY);
    ctx.stroke();
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Motion — the envelope a top can reach

   Every position the table can put its top in, drawn as the outline of one
   sweeping through them. The shape it traces IS the specification: a table
   with more motions traces a larger figure.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeEnvelope(light) {
  const P = palette(light);
  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const cx = w * 0.5;
    const cy = h * 0.55;
    const len = w * 0.3;

    // the envelope: ghosts of the positions already passed through
    for (let i = 0; i < 26; i++) {
      const u = i / 25;
      const ph = t * 0.22 - u * 0.5;
      const lift = Math.sin(ph) * h * 0.14;
      const tilt = Math.sin(ph * 0.63) * 0.19;
      const slide = Math.cos(ph * 0.41) * w * 0.06;
      const a = 0.055 + 0.16 * (1 - u);
      ctx.save();
      ctx.translate(cx + slide, cy + lift);
      ctx.rotate(tilt);
      ctx.strokeStyle = rgba(i === 0 ? P.warm : P.beam, a, P);
      ctx.lineWidth = i === 0 ? 2.4 : 1;
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.restore();
    }

    // the column the whole thing turns about
    ctx.strokeStyle = rgba(P.rule, 0.14, P);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.2);
    ctx.lineTo(cx, h * 0.92);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.14, h * 0.92);
    ctx.lineTo(w * 0.86, h * 0.92);
    ctx.stroke();
  };
}
