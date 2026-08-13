/**
 * Geometry and drawing for the MAVEN page.
 *
 * Two unrelated things live here because they are two halves of one picture:
 * the ring the instrument sits in, and the field it sits on.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   THE RING

   Authored around the origin, so the assembly rotates about (0,0) and nothing
   has to carry a center through the maths. The page places it with a viewBox.

   Angles are degrees from twelve o'clock, clockwise, which is how the layout
   was reasoned about on paper — not the atan2 convention. Converting once,
   here, is cheaper than remembering to subtract 90 everywhere else.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Radii, in viewBox units.
 *
 * The unit is sized by its HEIGHT, not its width, and the width follows from
 * the artwork's own aspect. Once the render's table top was keyed off, the
 * silhouette went from 328x373 to 258x362 — a width that used to fit inside
 * the bezel gave a height that stood well outside it. Driving the short
 * dimension from the long one is what makes the fit survive new artwork.
 *
 * 356 leaves 28 units between the top of the unit and the bezel. The ring is
 * the constraint now, not the artwork: at this size the image is still drawn
 * below its own 362px, so there is nothing to gain by going larger.
 */
export const R = {
  deviceH: 356, // height of the unit at the center
  bezel: 206, // the hairline immediately outside it
  engrave: 222, // where the domain names are set, inside the band
  arc: 244, // the four domain arcs
  node: 316, // where a channel sits
};

/** Square, and only as big as the ring — the labels are allowed outside it. */
export const VIEW = { w: 840, h: 840 };

/** Polar → cartesian, in the convention above. */
export function pt(r, deg) {
  const a = (deg - 90) * (Math.PI / 180);
  return [r * Math.cos(a), r * Math.sin(a)];
}

/**
 * An SVG arc between two angles at one radius.
 *
 * `flip` runs it anticlockwise instead. That exists for the engraved domain
 * names: text on a path follows the path's direction, so a name set on the
 * lower half of the ring reads upside down unless its arc is drawn backwards.
 */
export function arcPath(r, a0, a1, flip = false) {
  const [s, e] = flip ? [a1, a0] : [a0, a1];
  const [x0, y0] = pt(r, s);
  const [x1, y1] = pt(r, e);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} ${flip ? 0 : 1} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** True where a name set along this arc would come out upside down. */
export const arcFlipped = (a0, a1) => {
  const mid = ((a0 + a1) / 2 + 360) % 360;
  return mid > 90 && mid < 270;
};

/**
 * One channel's wire, from the domain arc out to its node.
 *
 * `swing` bends the cable tangentially — every wire the same way, so the loom
 * reads as having been combed round by the rotation. The page drives it to
 * zero as the assembly settles, which is what makes the wires appear to unwind
 * rather than simply appear.
 */
export function wirePath(deg, swing, r0 = R.arc, r1 = R.node) {
  const span = r1 - r0;
  const [x0, y0] = pt(r0, deg);
  const [x1, y1] = pt(r0 + span * 0.42, deg + swing);
  const [x2, y2] = pt(r1 - span * 0.3, deg + swing * 0.34);
  const [x3, y3] = pt(r1, deg);
  const f = (n) => n.toFixed(2);
  return `M${f(x0)} ${f(y0)}C${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)} ${f(x3)} ${f(y3)}`;
}

/**
 * Which side of the ring a channel's name is set on.
 *
 * Names are DOM, not SVG text: real type at real sizes, in the page's own font
 * stack, read in order by a screen reader. The same call as the pins on the
 * partners globe. A node sitting all but on the vertical still reads better to
 * the right, which is what the tolerance is for.
 */
export const sideOf = (deg) => (pt(1, deg)[0] > -0.02 ? 'right' : 'left');

/* ═══════════════════════════════════════════════════════════════════════════
   THE FIELD

   A voltammogram, near enough to read as one and no nearer. It carries no
   axis, no unit and no number, because a labeled plot on a product page is a
   claim about what the instrument measured and this one measured nothing —
   see the claims notice in src/data/maven.js.

   What it does carry is the shape of the thing: a potential sweep across, scan
   number down, current in color, and the vertical striations that a real
   sweep leaves behind. As the page settles, the striations fall away and the
   peaks resolve, which is the only editorial idea in it.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The color bar out of src/assets/maven/graph.png, resampled at seventeen
 * stops. It is the ordinary jet ramp that acquisition software has used for
 * thirty years, and it is here because it is the ramp the customer already
 * reads their own data in — not because a rainbow is a good color scale.
 * Low current first.
 */
const RAMP = [
  [74, 77, 172], [16, 23, 198], [25, 33, 254], [29, 78, 253], [41, 141, 255],
  [54, 197, 253], [68, 252, 253], [95, 252, 201], [146, 251, 137], [197, 252, 72],
  [253, 252, 0], [250, 201, 0], [248, 141, 0], [248, 83, 0], [248, 36, 0],
  [196, 26, 0], [141, 39, 30],
];

/** Deterministic hash noise — no seeded RNG, no table, same result everywhere. */
function hash(i) {
  let x = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

/** Smooth 1-D value noise over the column index. */
function striation(i, t) {
  const u = i * 0.37 + t * 0.44;
  const f = Math.floor(u);
  const k = u - f;
  const s = k * k * (3 - 2 * k);
  return hash(f) * (1 - s) + hash(f + 1) * s;
}

/**
 * The peaks. Two oxidation lobes low in the frame and one reduction trough
 * above the divider, which is the arrangement in the reference screenshot.
 * `u` runs along the sweep, `v` down the scans; both 0..1.
 */
const LOBES = [
  { u: 0.27, v: 0.86, su: 0.055, sv: 0.13, a: 1.0 },
  { u: 0.74, v: 0.83, su: 0.05, sv: 0.11, a: 0.86 },
  { u: 0.5, v: 0.66, su: 0.3, sv: 0.16, a: 0.3 },
  { u: 0.46, v: 0.2, su: 0.26, sv: 0.13, a: -0.55 },
  { u: 0.2, v: 0.32, su: 0.1, sv: 0.09, a: -0.3 },
];

const FW = 232;
const FH = 132;

/** The bay, as the color everything is pulled toward when the field is a ground. */
const BAY = [3, 16, 26];

/**
 * Build a field painter.
 *
 * Returns `draw(ctx, w, h, t, p)` where `t` is seconds and `p` is how far the
 * page has settled, 0..1. The field is composed at 232x132 and stretched: at
 * this scale the browser's own bilinear filter is the interpolation the plot
 * would have had anyway, and it costs one drawImage instead of 300,000 fills.
 *
 * `bias` is where a reading of zero lands on the ramp, and it is the whole
 * difference between the two places this is used. At 0.5 — the figure, where
 * the field is the subject — zero is the middle of the ramp and the picture
 * comes out the yellow-green of the reference screenshot. At 0.5 behind a
 * headline it is olive mud. The ground runs at 0.29, which puts the resting
 * field deep in the blue and leaves the warm end for the peaks alone.
 *
 * `dim` then mixes the whole ramp toward the bay. Dimming the ramp rather than
 * dropping the canvas's opacity keeps the peaks saturated while the ground
 * they sit on goes quiet, which is the opposite of what a flat alpha does.
 */
/**
 * The aurora.
 *
 * Curtains of light that drift across the field, each on its own period so the
 * set never repeats visibly. Drawn as radial gradients stretched vertically —
 * a real curtain shape for one fill, where a blur pass would cost a full
 * offscreen composite every frame.
 *
 * Additive on purpose. Over a dark field, `lighter` is what makes a glow read
 * as emission rather than as a pale sheet laid on top, and it means the
 * curtains brighten where they cross without any ordering to get right.
 *
 * The colors are the ramp's own cool end and one warm, so the aurora belongs
 * to the same plot it is drifting over.
 */
const CURTAINS = [
  { x: 0.24, r: 0.30, sway: 0.26, sp: 0.115, ph: 0.0, c: [64, 196, 200], a: 0.5 },
  { x: 0.55, r: 0.38, sway: 0.22, sp: 0.074, ph: 2.3, c: [48, 126, 232], a: 0.46 },
  { x: 0.80, r: 0.26, sway: 0.29, sp: 0.098, ph: 4.1, c: [110, 214, 150], a: 0.38 },
  { x: 0.40, r: 0.20, sway: 0.34, sp: 0.152, ph: 1.1, c: [176, 152, 236], a: 0.34 },
  { x: 0.68, r: 0.17, sway: 0.38, sp: 0.187, ph: 5.2, c: [232, 158, 92], a: 0.26 },
];

function aurora(ctx, w, h, t, gain) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const c of CURTAINS) {
    const cx = (c.x + Math.sin(t * c.sp * 6.283 + c.ph) * c.sway) * w;
    const cy = h * (0.46 + Math.sin(t * c.sp * 3.1 + c.ph * 1.7) * 0.17);
    /* Breathing, and never all at once: the second term is a slower beat on a
       different period, so the set drifts in and out of step with itself. */
    const k = (0.55 + 0.45 * Math.sin(t * c.sp * 4.4 + c.ph)) * (0.62 + 0.38 * Math.sin(t * 0.33 + c.ph));
    const r = c.r * w * (0.8 + 0.2 * Math.sin(t * c.sp * 2.7 + c.ph * 0.6));
    ctx.save();
    ctx.translate(cx, cy);
    // tall and narrow — a curtain, not a blob
    ctx.scale(1, (h / w) * 3.4);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    const a = c.a * k * gain;
    g.addColorStop(0, `rgb(${c.c[0]} ${c.c[1]} ${c.c[2]} / ${a.toFixed(3)})`);
    g.addColorStop(0.45, `rgb(${c.c[0]} ${c.c[1]} ${c.c[2]} / ${(a * 0.32).toFixed(3)})`);
    g.addColorStop(1, `rgb(${c.c[0]} ${c.c[1]} ${c.c[2]} / 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 6.283);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

export function makeField({ bias = 0.5, dim = 0, glow = 0 } = {}) {
  const buf = new Uint8ClampedArray(FW * FH * 4);
  const img = new ImageData(buf, FW, FH);
  let tile = null;

  return function draw(ctx, w, h, t, p) {
    const noise = 0.34 - p * 0.26; // the striations fall away as it settles
    const gain = 0.42 + p * 0.58; // and the peaks come up
    const drift = t * 0.16;

    for (let y = 0; y < FH; y++) {
      const v = y / (FH - 1);
      /* The divider. A real run of this plot is two panels with a hairline
         between them; reproducing it is what stops the field reading as a
         generic gradient mesh. */
      const gap = Math.exp(-((v - 0.5) ** 2) / 0.00035);
      for (let x = 0; x < FW; x++) {
        const u = x / (FW - 1);
        let s = 0;
        for (const L of LOBES) {
          const du = (u - L.u) / L.su;
          const dv = (v - L.v) / L.sv;
          s += L.a * Math.exp(-0.5 * (du * du + dv * dv));
        }
        s *= gain;
        s += (striation(x, t) - 0.5) * noise * (0.62 + 0.5 * Math.abs(Math.sin(v * 5 + drift)));
        s *= 1 - gap * 0.9;

        // −1..1 → ramp index
        const q = Math.min(0.9999, Math.max(0, s * 0.5 + bias)) * (RAMP.length - 1);
        const i0 = Math.floor(q);
        const k = q - i0;
        const a = RAMP[i0];
        const b = RAMP[i0 + 1] || a;
        const o = (y * FW + x) * 4;
        for (let c = 0; c < 3; c++) {
          const val = a[c] + (b[c] - a[c]) * k;
          buf[o + c] = val + (BAY[c] - val) * dim;
        }
        buf[o + 3] = 255;
      }
    }

    if (!tile) tile = document.createElement('canvas');
    if (tile.width !== FW) { tile.width = FW; tile.height = FH; }
    tile.getContext('2d').putImageData(img, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    /* Cover, never stretch: the striations are vertical and a squashed field
       turns them into a plaid. */
    const k = Math.max(w / FW, h / FH);
    const dw = FW * k;
    const dh = FH * k;
    ctx.drawImage(tile, (w - dw) / 2, (h - dh) / 2, dw, dh);

    /* Over the plot, not instead of it. The curtains come up as the page
       settles, so the field starts as a working readout and becomes something
       to look at. */
    if (glow) aurora(ctx, w, h, t, glow * (0.74 + 0.26 * p));
  };
}

/**
 * The same field, drawn once, for the figure in the sensing section — where it
 * is a picture of a measurement rather than a ground, so it is fully settled
 * and fully saturated.
 */
export function drawStill(ctx, w, h) {
  makeField({ bias: 0.5 })(ctx, w, h, 3.1, 1);
}

/** How the ground behind the ring is tuned. See makeField. */
export const GROUND = { bias: 0.17, dim: 0.5, glow: 1 };
