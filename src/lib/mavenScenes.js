/**
 * The animated grounds behind the four MAVEN bands.
 *
 * One per domain, and each one is the thing the band is about rather than a
 * decoration that happens to be nearby: a potential sweep for the chemistry, a
 * field potential with spikes riding on it for the electrophysiology, a
 * stimulus and its answer for the neuromodulation, and sweeps stacking into a
 * plot for the analysis.
 *
 * Same contract as src/lib/featureScenes.js on the software page: a builder
 * returns `draw(ctx, w, h, t)` and holds whatever state it needs in the
 * closure. Everything is drawn in hairlines on a dark ground, additively, at
 * half rate — these sit behind text and none of them has anything moving fast
 * enough to need sixty frames a second.
 */

/** Deterministic hash noise. No seeded RNG, no table, same result everywhere. */
function hash(i) {
  let x = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

const clear = (ctx, w, h) => { ctx.clearRect(0, 0, w, h); };

/**
 * Two palettes, because two of the four bands stand on a light ground.
 *
 * Not the same colours at a different opacity: ink on paper and light in a
 * dark room are different problems. The light set is darker, less saturated
 * and drawn at lower alpha, because a hairline that reads as a whisper on
 * black reads as a scratch on white at the same strength.
 *
 * `k` scales every alpha in the scene, so each drawing keeps its own internal
 * balance and only its overall weight changes.
 */
export function palette(light) {
  return light
    ? { a: '13 122 96', b: '28 92 134', c: '176 92 20', d: '104 70 160', rule: '11 56 77', k: 0.72 }
    : { a: '90 230 190', b: '120 200 230', c: '224 151 63', d: '166 140 220', rule: '163 200 216', k: 1 };
}

/** `rgb(r g b / a)` with the palette's own weight already applied. */
const rgba = (c, a, P) => `rgb(${c} / ${(a * P.k).toFixed(3)})`;


/* ═══════════════════════════════════════════════════════════════════════════
   Neurochemistry — the sweep

   A triangular potential ramp travelling left to right, leaving behind the
   response it drew out of the electrode. The waveform is the real shape: hold,
   ramp up, ramp down, hold. What trails it is the current, which peaks where
   the analyte turns over and again, smaller and inverted, on the way back.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeSweep(light) {
  const P = palette(light);
  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const mid = h * 0.5;
    const amp = Math.min(h * 0.22, 120);

    // the applied waveform, repeating across the width
    const period = Math.max(180, w * 0.26);
    const phase = (t * 46) % period;
    ctx.lineWidth = 1;
    for (let k = -1; k * period - phase < w + period; k++) {
      const x0 = k * period - phase;
      ctx.strokeStyle = rgba(P.b, 0.3, P);
      ctx.beginPath();
      ctx.moveTo(x0, mid + amp * 0.55);
      ctx.lineTo(x0 + period * 0.12, mid + amp * 0.55);
      ctx.lineTo(x0 + period * 0.44, mid - amp * 0.9);
      ctx.lineTo(x0 + period * 0.76, mid + amp * 0.55);
      ctx.lineTo(x0 + period, mid + amp * 0.55);
      ctx.stroke();

      /* The response. Two peaks, the reverse one smaller and the other way up
         — which is what a cyclic voltammogram of an oxidising species looks
         like, and the reason the technique can tell species apart at all. */
      ctx.strokeStyle = rgba(P.a, 0.5, P);
      ctx.beginPath();
      for (let i = 0; i <= 90; i++) {
        const u = i / 90;
        const x = x0 + u * period;
        const ox = Math.exp(-((u - 0.38) ** 2) / 0.0022);
        const rd = -0.42 * Math.exp(-((u - 0.63) ** 2) / 0.0016);
        const y = mid + amp * 0.5 - (ox + rd) * amp * 0.8;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
    }

    // the electrode tip the sweep is applied at
    const gx = w * 0.5 + Math.sin(t * 0.4) * w * 0.02;
    const g = ctx.createRadialGradient(gx, mid, 0, gx, mid, Math.min(w, h) * 0.34);
    g.addColorStop(0, rgba(P.a, 0.18, P));
    g.addColorStop(1, rgba(P.a, 0, P));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Electrophysiology — the field, and what fires in it

   A slow local field potential with single units riding on it, and the same
   units struck below as a raster. Two views of one recording, which is the
   band's whole point.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeSpikes(light) {
  const P = palette(light);
  /* Spike times are generated once, not per frame: they scroll rather than
     re-randomise, or the raster boils instead of moving. */
  const N = 420;
  const times = Array.from({ length: N }, (_, i) => hash(i) * 60);
  const rows = Array.from({ length: N }, (_, i) => Math.floor(hash(i + 9001) * 6));

  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const lfpY = h * 0.36;
    const rasterTop = h * 0.6;
    const rasterH = Math.min(h * 0.3, 130);
    const speed = 58;

    // the field potential
    ctx.strokeStyle = rgba(P.b, 0.52, P);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const u = (x + t * speed) * 0.006;
      const y = lfpY
        + Math.sin(u) * h * 0.075
        + Math.sin(u * 2.7 + 1.1) * h * 0.032
        + Math.sin(u * 6.1 + 0.4) * h * 0.012;
      if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();

    // units, on the trace and again in the raster below
    ctx.lineWidth = 1;
    for (let i = 0; i < N; i++) {
      const x = w - (((times[i] * speed) - t * speed) % (w + 400)) - 200;
      if (x < -20 || x > w + 20) continue;
      const u = (x + t * speed) * 0.006;
      const y = lfpY + Math.sin(u) * h * 0.075 + Math.sin(u * 2.7 + 1.1) * h * 0.032;
      ctx.strokeStyle = rgba(P.b, 0.72, P);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 14);
      ctx.stroke();
      const ry = rasterTop + (rows[i] + 0.5) * (rasterH / 6);
      ctx.strokeStyle = rgba(P.b, 0.42, P);
      ctx.beginPath();
      ctx.moveTo(x, ry - 4);
      ctx.lineTo(x, ry + 4);
      ctx.stroke();
    }

    // the raster's channel rules
    ctx.strokeStyle = rgba(P.b, 0.11, P);
    for (let r = 0; r < 6; r++) {
      const ry = rasterTop + (r + 0.5) * (rasterH / 6);
      ctx.beginPath();
      ctx.moveTo(0, ry);
      ctx.lineTo(w, ry);
      ctx.stroke();
    }
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Neuromodulation — deliver, then watch

   A stimulus train goes out as rings from a point; a chemical answer swells
   behind it and decays. The delay between the two is the whole subject.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeStim(light) {
  const P = palette(light);
  const PERIOD = 7.4;
  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const cx = w * 0.42;
    const cy = h * 0.5;
    const reach = Math.hypot(w, h) * 0.55;
    const phase = t % PERIOD;

    // the train: a burst of pulses, then silence
    for (let i = 0; i < 7; i++) {
      const age = phase - i * 0.16;
      if (age < 0 || age > 3.4) continue;
      const r = (age / 3.4) * reach;
      const a = 0.46 * (1 - age / 3.4) ** 2;
      ctx.strokeStyle = rgba(P.c, a, P);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 6.283);
      ctx.stroke();
    }

    // the answer, rising after the train and returning to baseline
    const resp = phase < 0.3 ? 0
      : (1 - Math.exp(-(phase - 0.3) / 0.32)) * Math.exp(-(phase - 0.3) / 2.4);
    if (resp > 0.004) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach * 0.75);
      g.addColorStop(0, rgba(P.a, resp * 0.3, P));
      g.addColorStop(0.6, rgba(P.a, resp * 0.1, P));
      g.addColorStop(1, rgba(P.a, 0, P));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // the same event as a trace along the foot, so the delay is legible
    const baseY = h * 0.84;
    ctx.strokeStyle = rgba(P.a, 0.5, P);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const p = ((x / w) * PERIOD + PERIOD - phase) % PERIOD;
      const v = p < 0.3 ? 0 : (1 - Math.exp(-(p - 0.3) / 0.32)) * Math.exp(-(p - 0.3) / 2.4);
      const y = baseY - v * h * 0.16;
      if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();

    // and the stimulus marks under it
    ctx.strokeStyle = rgba(P.c, 0.56, P);
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const p = (PERIOD - phase + i * 0.16) % PERIOD;
      const x = (p / PERIOD) * w;
      ctx.beginPath();
      ctx.moveTo(x, baseY + 4);
      ctx.lineTo(x, baseY + 15);
      ctx.stroke();
    }

    // the electrode, at the centre of it
    ctx.fillStyle = rgba(P.c, 0.7, P);
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, 6.283);
    ctx.fill();
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Software and analysis — sweeps, stacked

   Columns arriving from the right and stacking into a field, with a line
   pulled back out of the stack. That is the actual shape of the work: a run is
   thousands of sweeps, and the plot is what you get by keeping all of them.
   ═══════════════════════════════════════════════════════════════════════════ */
export function makeStack(light) {
  const P = palette(light);
  const COLS = 74;
  return function draw(ctx, w, h, t) {
    clear(ctx, w, h);
    const top = h * 0.24;
    const fieldH = Math.min(h * 0.4, 190);
    const cw = w / COLS;
    const drift = t * 5.5;

    for (let i = 0; i < COLS; i++) {
      const x = i * cw;
      /* Each column is one sweep. Its content is a smooth function of where it
         sits in the run plus a little noise, so the stack reads as data rather
         than as a gradient. */
      const u = (i + drift) * 0.055;
      const peak = Math.exp(-((((i + drift) % COLS) / COLS - 0.42) ** 2) / 0.02);
      const n = hash(Math.floor(i + drift)) * 0.3;
      const strength = 0.1 + peak * 0.55 + n * 0.12 + Math.sin(u) * 0.06;
      const g = ctx.createLinearGradient(0, top, 0, top + fieldH);
      g.addColorStop(0, rgba(P.b, strength * 0.72, P));
      g.addColorStop(0.5, rgba(P.a, strength * 0.5, P));
      g.addColorStop(1, rgba(P.c, strength * 0.44, P));
      ctx.fillStyle = g;
      ctx.fillRect(x, top, cw + 0.6, fieldH);
    }

    // the hairline that says these are discrete sweeps, not a wash
    ctx.strokeStyle = rgba(P.rule, 0.08, P);
    ctx.lineWidth = 1;
    for (let i = 0; i < COLS; i += 2) {
      ctx.beginPath();
      ctx.moveTo(i * cw, top);
      ctx.lineTo(i * cw, top + fieldH);
      ctx.stroke();
    }

    // what comes back out
    ctx.strokeStyle = rgba(P.d, 0.6, P);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= COLS; i++) {
      const peak = Math.exp(-((((i + drift) % COLS) / COLS - 0.42) ** 2) / 0.02);
      const y = top + fieldH + 46 - peak * h * 0.15 - hash(Math.floor(i + drift)) * 3;
      if (i) ctx.lineTo(i * cw, y); else ctx.moveTo(i * cw, y);
    }
    ctx.stroke();
  };
}
