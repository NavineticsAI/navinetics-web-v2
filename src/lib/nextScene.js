/* ══════════════════════════════════════════════════════════════════════════
   The closing section's background.

   One sequence, on a slow loop:

     1. the anatomy assembles out of scattered samples
     2. a profile arrives from the left and comes into agreement with it
     3. a trajectory is planned against the result

   That is the whole idea of the section — something new arrives, it lines up
   with what is already there, and the planning follows from it. Nothing is
   labelled and nothing is claimed; it is deliberately abstract.

   Very low contrast on purpose. Peak alpha is around a quarter, the cycle is
   half a minute, and the whole thing sits behind a scrim — if it draws the
   eye away from the sentence it is sitting behind, it is wrong.
   ══════════════════════════════════════════════════════════════════════════ */
import { BRAIN } from './brainShape.js';

const TAU = Math.PI * 2;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v) => v * v * (3 - 2 * v);

/* A profile, in the same unit space as the silhouette: u runs anterior(−) to
   posterior(+), v superior(−) to inferior(+). Forehead down to under the jaw,
   which is the part of a head that has any shape worth matching. */
const PROFILE = [
  [-0.365, -0.410], [-0.445, -0.330], [-0.505, -0.230], [-0.545, -0.130],
  [-0.560, -0.070], [-0.548, -0.030], [-0.585, 0.010], [-0.650, 0.062],
  [-0.672, 0.078], [-0.600, 0.094], [-0.566, 0.110], [-0.578, 0.140],
  [-0.556, 0.166], [-0.574, 0.196], [-0.545, 0.224], [-0.560, 0.258],
  // Stops at the jaw. Carried on to the neck it stopped reading as a profile
  // and became a long swoosh trailing off to the right.
  [-0.532, 0.292], [-0.480, 0.320],
];

export function makeNext() {
  /* The silhouette, taken from the same mesh everything else on this page
     uses, minus the brainstem tail — it reads as a stray line once the
     samples around it stop. */
  const outline = BRAIN.outline.filter(([, v]) => v <= 0.3);

  /* Resampled at even arc length. The mesh's own vertices bunch where it
     happened to be dense, and a bunched sample set reads as a dotted line
     with clots in it rather than as a surface. */
  const SAMPLES = 300;
  const seg = [];
  let total = 0;
  for (let i = 1; i < outline.length; i++) {
    const a = outline[i - 1], b = outline[i];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d > 0.08) continue;                    // skip the jump across the tail
    seg.push({ a, b, d, at: total });
    total += d;
  }

  const pts = [];
  for (let i = 0; i < SAMPLES; i++) {
    const want = (i / SAMPLES) * total;
    let s = seg[seg.length - 1];
    for (let k = 0; k < seg.length; k++) {
      if (seg[k].at + seg[k].d >= want) { s = seg[k]; break; }
    }
    const f = s.d > 0 ? (want - s.at) / s.d : 0;
    const x = s.a[0] + (s.b[0] - s.a[0]) * f;
    const y = s.a[1] + (s.b[1] - s.a[1]) * f;
    // a stable scatter direction and distance per sample
    const h = ((i * 2654435761) % 1000) / 1000;
    const h2 = ((i * 40503) % 1000) / 1000;
    pts.push({
      x, y,
      ax: Math.cos(h * TAU) * (0.03 + h2 * 0.075),
      ay: Math.sin(h * TAU) * (0.03 + h2 * 0.075),
      lag: h2 * 0.16,                          // so they do not all land at once
    });
  }

  /* The profile, resampled so the leading edge can be drawn progressively —
     and interpolated with a Catmull-Rom spline rather than straight lines.
     Joining twenty control points with segments puts a corner at every one of
     them, and on a face that is exactly where the eye looks: the bridge of
     the nose and the lips came out faceted. A spline passes through the same
     points with a continuous tangent, so the control points stop being
     visible as control points. */
  const cr = (a, b, c, d, t) => {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * b) + (c - a) * t
      + (2 * a - 5 * b + 4 * c - d) * t2
      + (3 * b - a - 3 * c + d) * t3);
  };
  const CURVE = [];
  const STEPS = 12;
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const p0 = PROFILE[Math.max(0, i - 1)];
    const p1 = PROFILE[i];
    const p2 = PROFILE[i + 1];
    const p3 = PROFILE[Math.min(PROFILE.length - 1, i + 2)];
    for (let k = 0; k < STEPS; k++) {
      const f = k / STEPS;
      CURVE.push([
        cr(p0[0], p1[0], p2[0], p3[0], f),
        cr(p0[1], p1[1], p2[1], p3[1], f),
      ]);
    }
  }
  CURVE.push(PROFILE[PROFILE.length - 1]);

  /* Where the planned track runs, once there is something to plan against.
     The entry is TAKEN FROM the silhouette rather than typed in — a hand-set
     coordinate floated just above the surface, which is exactly the tell that
     an overlay was not derived from the anatomy under it. Topmost sample in
     the superior-frontal stretch. */
  let ENTRY = [-0.145, -0.408];
  for (const q of pts) {
    if (q.x > -0.06 || q.x < -0.30) continue;
    if (q.y < ENTRY[1]) ENTRY = [q.x, q.y];
  }
  const TARGET = [0.030, 0.060];

  const CYCLE = 30;                            // seconds

  return (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    if (w < 4 || h < 4) return;

    const s = Math.min(w, h) * 0.86;
    const cx = w * 0.70, cy = h * 0.50;
    const p = (t % CYCLE) / CYCLE;

    const sweep = smooth(clamp01(p / 0.24));            // anatomy assembling
    const arrive = smooth(clamp01((p - 0.20) / 0.30));  // profile coming in
    const track = smooth(clamp01((p - 0.60) / 0.24));   // trajectory drawn
    const fade = p > 0.90 ? 1 - clamp01((p - 0.90) / 0.10) : 1;
    const front = -0.62 + sweep * 1.34;                 // left to right

    /* ── the anatomy, assembling ───────────────────────────────────────── */
    const moving = sweep > 0.001 && sweep < 0.999 ? 1 : 0;
    for (let i = 0; i < pts.length; i++) {
      const q = pts[i];
      const done = clamp01((front - q.x) / (0.10 + q.lag));
      const e = smooth(done);
      const px = cx + (q.x + q.ax * (1 - e)) * s;
      const py = cy + (q.y + q.ay * (1 - e)) * s;
      const near = moving * Math.exp(-(((q.x - front) / 0.085) ** 2));
      const a = (0.05 + e * 0.22 + near * 0.2) * fade;
      ctx.fillStyle = `rgba(196,222,238,${a.toFixed(3)})`;
      const r = 1.5 + near * 0.9;
      ctx.fillRect(px, py, r, r);
    }

    /* ── the profile, arriving from the left ─────────────────────────────
       It travels in still offset from where it belongs and closes the last of
       that distance as it lands, which is what makes the arrival read as
       coming into agreement rather than as a shape sliding past. */
    if (arrive > 0.001) {
      const dx = (1 - arrive) * -0.58;
      const dy = (1 - arrive) * 0.055;
      const drawn = Math.max(2, Math.round(CURVE.length * clamp01(arrive * 1.35)));
      const base = 0.30 * arrive * fade;
      ctx.lineWidth = 1.2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      /* Drawn in runs so both ends can fade out. A profile that starts and
         stops at full strength has two blunt ends hanging in the dark, which
         reads as a line that was cut rather than a surface that was found. */
      const at = (i) => [cx + (CURVE[i][0] + dx) * s, cy + (CURVE[i][1] + dy) * s];
      const RUN = 6;
      for (let i = 0; i < drawn - 1; i += RUN) {
        const end = Math.min(drawn - 1, i + RUN);
        const mid = (i + end) / 2 / Math.max(1, drawn - 1);
        const taper = Math.min(1, mid / 0.10) * Math.min(1, (1 - mid) / 0.16);
        ctx.strokeStyle = `rgba(108,172,228,${(base * (0.25 + taper * 0.75)).toFixed(3)})`;
        ctx.beginPath();
        for (let k = i; k <= end; k++) {
          const [px, py] = at(k);
          if (k === i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // the leading point, so the arrival has a direction
      if (arrive < 0.999) {
        const lead = CURVE[Math.min(CURVE.length - 1, drawn - 1)];
        ctx.fillStyle = `rgba(150,205,244,${(0.5 * fade).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(cx + (lead[0] + dx) * s, cy + (lead[1] + dy) * s, 1.7, 0, TAU);
        ctx.fill();
      }
    }

    /* ── the trajectory, planned against the result ────────────────────── */
    if (track > 0.001) {
      const ex = cx + ENTRY[0] * s, ey = cy + ENTRY[1] * s;
      const tx = cx + TARGET[0] * s, ty = cy + TARGET[1] * s;
      const hx = ex + (tx - ex) * track, hy = ey + (ty - ey) * track;
      ctx.strokeStyle = `rgba(3,161,189,${(0.42 * fade).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      ctx.fillStyle = `rgba(115,229,25,${(0.5 * fade).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(ex, ey, 2, 0, TAU); ctx.fill();

      if (track > 0.985) {
        ctx.strokeStyle = `rgba(198,45,45,${(0.55 * fade).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(tx, ty, 3.2, 0, TAU); ctx.stroke();
      }
    }
  };
}
