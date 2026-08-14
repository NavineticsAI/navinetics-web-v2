/**
 * The animated grounds behind the D1 bands.
 *
 * Same contract as lib/mavenScenes.js and lib/tableScenes.js: a builder takes
 * the ground's lightness and returns `draw(ctx, w, h, t)`, keeping whatever it
 * needs in the closure.
 *
 * All four are about the same idea from four directions — a point in the head
 * that must not move while everything around it does. Nothing here is a
 * measurement, a trajectory or a coordinate; they are drawings of an argument.
 */

const clear = (ctx, w, h) => { ctx.clearRect(0, 0, w, h); };

/** Ink on a pale ground, light on a dark one. Blue-led, because the brand is. */
export function palette(light) {
  return light
    ? { blue: '31 104 144', deep: '12 47 69', rule: '11 56 77', k: 0.74 }
    : { blue: '130 186 217', deep: '78 154 196', rule: '163 200 216', k: 1 };
}
const rgba = (c, a, P) => `rgb(${c} / ${(a * P.k).toFixed(3)})`;

/* ═══════════════════════════════════════════════════════════════════════════
   Fixation — three points, one origin

   Screws come in from three directions and tighten. The origin they define
   drifts while they are loose and stops dead once they are all home; the rings
   around it are the coordinate system settling, not a measurement.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeAnchor(light) {
  const P = palette(light);
  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const cx = w * 0.5;
    const cy = h * 0.52;
    const R = Math.min(w, h) * 0.3;
    const cyc = (t * 0.26) % 1;
    const lock = Math.min(1, cyc / 0.62);          // 0 loose, 1 home
    const wob = (1 - lock) ** 2;

    const ox = cx + Math.sin(t * 1.7) * R * 0.16 * wob;
    const oy = cy + Math.cos(t * 1.31) * R * 0.16 * wob;

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2 + 0.4;
      const far = R * 1.62;
      const near = R * (0.46 + 0.5 * (1 - lock));
      const x0 = cx + Math.cos(a) * far;
      const y0 = cy + Math.sin(a) * far;
      const x1 = ox + Math.cos(a) * near;
      const y1 = oy + Math.sin(a) * near;

      ctx.strokeStyle = rgba(P.blue, 0.26 + 0.3 * lock, P);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      ctx.fillStyle = rgba(P.blue, 0.5 + 0.4 * lock, P);
      ctx.beginPath();
      ctx.arc(x1, y1, 3.2, 0, 6.283);
      ctx.fill();
    }

    // the origin, and the frame it defines once nothing is moving
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = rgba(P.rule, (0.2 - i * 0.05) * lock, P);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ox, oy, R * (0.16 + i * 0.13), 0, 6.283);
      ctx.stroke();
    }
    ctx.fillStyle = rgba(P.blue, 0.8 * lock, P);
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, 6.283);
    ctx.fill();
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Targeting — every approach, one point

   An arc swings through its rotations and a probe runs down it. Wherever the
   arc is, the probe's tip lands on the same place. That is the whole of what
   arc-centered means, and it is the one thing worth drawing.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeArc(light) {
  const P = palette(light);
  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const cx = w * 0.5;
    const cy = h * 0.62;
    const R = Math.min(w * 0.42, h * 0.5);

    // the trails of where the arc has been
    for (let g = 6; g >= 0; g--) {
      const a = Math.sin(t * 0.44 - g * 0.14) * 0.72;
      const al = g === 0 ? 0.34 : 0.05 + 0.03 * (6 - g) / 6;
      ctx.strokeStyle = rgba(g === 0 ? P.blue : P.rule, al, P);
      ctx.lineWidth = g === 0 ? 1.8 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI + a - 1.15, Math.PI + a + 1.15);
      ctx.stroke();

      if (g === 0) {
        // the probe, on the arc, pointed at the center
        const pa = Math.PI + a + Math.sin(t * 0.9) * 0.9;
        const px = cx + Math.cos(pa) * R;
        const py = cy + Math.sin(pa) * R;
        ctx.strokeStyle = rgba(P.blue, 0.5, P);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.fillStyle = rgba(P.blue, 0.75, P);
        ctx.beginPath();
        ctx.arc(px, py, 3.4, 0, 6.283);
        ctx.fill();
      }
    }

    // the point that never moves
    ctx.fillStyle = rgba(P.deep, 0.85, P);
    ctx.beginPath();
    ctx.arc(cx, cy, 4.2, 0, 6.283);
    ctx.fill();
    ctx.strokeStyle = rgba(P.rule, 0.2, P);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, 6.283);
    ctx.stroke();
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Advancement — even steps against a still scale

   A column descends in discrete equal increments while its scale stays put.
   The steps are deliberately quantized: a microdrive advances by turns, not
   by sliding.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeDrive(light) {
  const P = palette(light);
  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const cx = w * 0.5;
    const top = h * 0.12;
    const bot = h * 0.86;
    const STEPS = 22;
    const k = Math.floor(((t * 0.7) % 1) * STEPS) / STEPS;
    const y = top + (bot - top) * k;

    // the scale it moves against
    for (let i = 0; i <= STEPS; i++) {
      const ty = top + ((bot - top) * i) / STEPS;
      const major = i % 5 === 0;
      ctx.strokeStyle = rgba(P.rule, major ? 0.24 : 0.12, P);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 20, ty);
      ctx.lineTo(cx + (major ? 46 : 34), ty);
      ctx.stroke();
    }
    ctx.strokeStyle = rgba(P.rule, 0.16, P);
    ctx.beginPath();
    ctx.moveTo(cx + 20, top);
    ctx.lineTo(cx + 20, bot);
    ctx.stroke();

    // the column, and the trajectory it is on
    ctx.strokeStyle = rgba(P.rule, 0.13, P);
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(cx - 1, top);
    ctx.lineTo(cx - 1, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = rgba(P.blue, 0.42, P);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx - 1, top);
    ctx.lineTo(cx - 1, y);
    ctx.stroke();

    ctx.fillStyle = rgba(P.blue, 0.62, P);
    ctx.fillRect(cx - 13, y - 4, 24, 8);
    ctx.strokeStyle = rgba(P.blue, 0.3, P);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + 11, y);
    ctx.lineTo(cx + 46, y);
    ctx.stroke();
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Access — things come off, the key does not

   Blocks lift away from a fixed anchor and return to it, one after another.
   The anchor and the origin under it never move, which is the point: what is
   removable and what is not are different things.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeAccess(light) {
  const P = palette(light);
  const BLOCKS = [
    { x: -0.20, w: 0.15, h: 0.055, ph: 0.0 },
    { x: -0.02, w: 0.19, h: 0.07, ph: 0.33 },
    { x: 0.20, w: 0.13, h: 0.05, ph: 0.66 },
  ];
  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const cx = w * 0.5;
    const base = h * 0.7;
    const S = Math.min(w, h);

    // the key: fixed, always drawn, never lifted
    ctx.fillStyle = rgba(P.blue, 0.5, P);
    ctx.fillRect(cx - S * 0.1, base, S * 0.2, S * 0.035);
    ctx.strokeStyle = rgba(P.rule, 0.2, P);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - S * 0.3, base + S * 0.035);
    ctx.lineTo(cx + S * 0.3, base + S * 0.035);
    ctx.stroke();

    for (const b of BLOCKS) {
      const u = ((t * 0.2 + b.ph) % 1);
      // away and back, resting for most of the cycle
      const lift = u < 0.5 ? Math.sin(u * Math.PI) ** 1.6 : 0;
      const y = base - S * (0.06 + b.h) - lift * S * 0.3;
      ctx.fillStyle = rgba(P.blue, 0.17 + 0.12 * (1 - lift), P);
      ctx.strokeStyle = rgba(P.blue, 0.4, P);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.rect(cx + S * b.x, y, S * b.w, S * b.h);
      ctx.fill();
      ctx.stroke();

      if (lift > 0.02) {
        ctx.strokeStyle = rgba(P.rule, 0.16 * (1 - lift), P);
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(cx + S * (b.x + b.w / 2), y + S * b.h);
        ctx.lineTo(cx + S * (b.x + b.w / 2), base);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // the origin the key defines, under everything, never moving
    ctx.fillStyle = rgba(P.deep, 0.8, P);
    ctx.beginPath();
    ctx.arc(cx, base + S * 0.018, 3.4, 0, 6.283);
    ctx.fill();
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Rotation — two angles, one point

   Replaces the "DEGREES OF FREEDOM 3 + 2" panel that used to float over the
   NRSS plate on the home page. That panel stated the number; this draws what
   the number means, which is the whole argument for an arc-centred frame:
   the collar turns, the arc turns within it, and the probe reaches the target
   from a different direction every time WITHOUT the target moving.

   The geometry is real rather than decorative. A point on the arc sits at
   angle θ from vertical in the arc's own plane; that plane is then rotated
   about the vertical axis by the collar angle φ. The projection is a cheap
   axonometric — y squashed, z pushed down-right — which is enough to read as
   depth at this size and costs three multiplications.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeRotation(light) {
  const P = palette(light);

  /* Arc-local (θ) + collar (φ) -> screen. R is the arc radius in px. */
  const project = (th, ph, R, cx, cy) => {
    const x = Math.sin(th) * R * Math.cos(ph);
    const z = Math.sin(th) * R * Math.sin(ph);
    const y = -Math.cos(th) * R;
    return [cx + x + z * 0.34, cy + y * 0.62 + z * 0.2];
  };

  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const cx = w * 0.5;
    const cy = h * 0.54;
    const R = Math.min(w * 0.34, h * 0.4);

    const phi = t * 0.34;                          // the collar, turning
    const theta = 1.15 + Math.sin(t * 0.62) * 0.85; // the probe, sweeping the arc

    /* Ghosts of collar positions already visited — the point of the drawing is
       that they all converge, so several have to be on screen at once. */
    for (let g = 4; g >= 1; g--) {
      const ph = phi - g * 0.42;
      ctx.strokeStyle = rgba(P.rule, 0.10 + 0.035 * (5 - g), P);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const [px, py] = project((i / 40) * Math.PI, ph, R, cx, cy);
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.stroke();
    }

    // the collar itself, seen edge-on as an ellipse
    ctx.strokeStyle = rgba(P.rule, 0.34, P);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 1.04, R * 1.04 * 0.32, 0, 0, 6.283);
    ctx.stroke();

    // the live arc
    ctx.strokeStyle = rgba(P.blue, 0.62, P);
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const [px, py] = project((i / 60) * Math.PI, phi, R, cx, cy);
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.stroke();

    // the probe on the arc, always aimed at the point
    const [px, py] = project(theta, phi, R, cx, cy);
    ctx.strokeStyle = rgba(P.blue, 0.7, P);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.fillStyle = rgba(P.blue, 0.95, P);
    ctx.beginPath();
    ctx.arc(px, py, 3.6, 0, 6.283);
    ctx.fill();

    /* The point that never moves. Drawn last so nothing crosses it, and given
       a settled ring rather than a pulse — it is the one still thing here. */
    ctx.strokeStyle = rgba(P.rule, 0.3, P);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, 6.283);
    ctx.stroke();
    ctx.fillStyle = rgba(P.blue, 1, P);
    ctx.beginPath();
    ctx.arc(cx, cy, 4.4, 0, 6.283);
    ctx.fill();
  };
}
