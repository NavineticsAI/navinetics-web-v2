/* ══════════════════════════════════════════════════════════════════════════
   Arc-centered targeting, in three dimensions.

   The focus sits at the origin. The collar angle rotates the arc's plane
   about the vertical axis; the arc angle slides the carrier along the arc.
   A point on the arc is therefore

     P = R · ( sinA·cosC , sinA·sinC , cosA )

   and the trajectory is the segment from P back to the origin. That is the
   whole idea of an arc-centered frame: whatever the two angles are, the line
   ends in the same place. The demonstration is that the target marker never
   moves while the entry point travels all over the skull.

   Everything is drawn as depth-sorted segments — a painter's algorithm over
   the whole scene rather than per-object layers — so the arc genuinely passes
   behind the head rather than being drawn on top of a picture of one.
   ══════════════════════════════════════════════════════════════════════════ */

const TAU = Math.PI * 2;
const rad = (d) => (d * Math.PI) / 180;

export const ARC_R = 120;                 // arc radius, clear of the crown
const HEAD_C = [0, -4, 18];               // head center, focus below it
const HEAD_R = [74, 92, 84];

/** A point on the arc, in world space. */
export const carrier = (arcDeg, collarDeg) => {
  const a = rad(arcDeg), c = rad(collarDeg);
  return [ARC_R * Math.sin(a) * Math.cos(c), ARC_R * Math.sin(a) * Math.sin(c), ARC_R * Math.cos(a)];
};

/**
 * World → screen. Yaw about the vertical, then pitch, then a perspective
 * divide. Returns the depth as well, which is what the sort runs on.
 */
function makeProject(cam, w, h) {
  const ca = Math.cos(cam.az), sa = Math.sin(cam.az);
  const ce = Math.cos(cam.el), se = Math.sin(cam.el);
  const k = Math.min(w / 380, h / 340) * cam.zoom;
  const cx = w / 2, cy = h / 2 + h * 0.06;
  return (p) => {
    const x1 = p[0] * ca - p[1] * sa;
    const y1 = p[0] * sa + p[1] * ca;
    const y2 = y1 * ce - p[2] * se;
    const z2 = y1 * se + p[2] * ce;
    const d = cam.dist + y2;
    const s = (cam.dist / d) * k;
    return [cx + x1 * s, cy - z2 * s, d];
  };
}

/** Sampled ellipsoid wireframe — enough to read as a volume, not a mesh. */
function headWire(out, col) {
  const [cx, cy, cz] = HEAD_C, [rx, ry, rz] = HEAD_R;
  const at = (u, v) => [
    cx + rx * Math.sin(v) * Math.cos(u),
    cy + ry * Math.sin(v) * Math.sin(u),
    cz + rz * Math.cos(v),
  ];
  /* Sparse and faint on purpose. At eight meridians and half opacity the head
     competed with the instrument, and the arc — the thing being explained —
     was the hardest line on the diagram to find. */
  for (let i = 1; i <= 3; i++) {                       // latitudes
    const v = (i / 4) * Math.PI;
    for (let j = 0; j < 40; j++) {
      out.push({ a: at((j / 40) * TAU, v), b: at(((j + 1) / 40) * TAU, v), c: col, w: 1, o: 0.3 });
    }
  }
  for (let i = 0; i < 6; i++) {                        // meridians
    const u = (i / 6) * TAU;
    for (let j = 0; j < 24; j++) {
      out.push({ a: at(u, (j / 24) * Math.PI), b: at(u, ((j + 1) / 24) * Math.PI), c: col, w: 1, o: 0.3 });
    }
  }
}

/**
 * Draw a frame.
 *
 * @param ctx      2d context, already scaled for DPR
 * @param w,h      CSS pixels
 * @param cam      { az, el, dist, zoom } — az/el in radians
 * @param state    { arc, collar, ghosts } — angles in degrees
 * @param palette  { line, soft, action, ink, sub } as CSS color strings
 */
export function drawArc(ctx, w, h, cam, state, palette) {
  ctx.clearRect(0, 0, w, h);
  const project = makeProject(cam, w, h);
  const segs = [];

  headWire(segs, palette.soft);

  // the horizontal track the arc's feet ride on — this is what the collar turns
  for (let j = 0; j < 72; j++) {
    const t0 = (j / 72) * TAU, t1 = ((j + 1) / 72) * TAU;
    segs.push({
      a: [ARC_R * Math.cos(t0), ARC_R * Math.sin(t0), 0],
      b: [ARC_R * Math.cos(t1), ARC_R * Math.sin(t1), 0],
      c: palette.line, w: 1.4, o: 0.55,
    });
  }

  const arcPoint = (deg) => carrier(deg, state.collar);

  if (state.ghosts) {
    for (let d = -75; d <= 75; d += 25) {
      if (Math.abs(d - state.arc) < 8) continue;
      segs.push({ a: arcPoint(d), b: [0, 0, 0], c: palette.sub, w: 1, o: 0.32, dash: true });
    }
  }

  // the arc, and its graduations — the instrument, so a full tone above the head
  for (let j = 0; j < 60; j++) {
    const d0 = -90 + (j / 60) * 180, d1 = -90 + ((j + 1) / 60) * 180;
    segs.push({ a: arcPoint(d0), b: arcPoint(d1), c: palette.sub, w: 3.4, o: 1 });
  }
  for (let d = -75; d <= 75; d += 15) {
    const p = arcPoint(d);
    segs.push({ a: p, b: [p[0] * 0.9, p[1] * 0.9, p[2] * 0.9], c: palette.sub, w: 1.4, o: 0.9 });
  }

  // the live trajectory
  const P = arcPoint(state.arc);
  segs.push({ a: P, b: [0, 0, 0], c: palette.action, w: 2.6, o: 1 });

  // a small cross at the focus, drawn in world space so it sits in the scene
  for (const v of [[16, 0, 0], [0, 16, 0], [0, 0, 16]]) {
    segs.push({ a: [-v[0], -v[1], -v[2]], b: v, c: palette.action, w: 1.6, o: 0.85 });
  }

  const drawn = segs
    .map((s) => {
      const A = project(s.a), B = project(s.b);
      return { ...s, A, B, d: (A[2] + B[2]) / 2 };
    })
    .sort((m, n) => n.d - m.d);

  for (const s of drawn) {
    // far things thin out and fade — the depth cue that makes it read as 3-D
    const t = Math.max(0, Math.min(1, (s.d - cam.dist * 0.55) / (cam.dist * 0.9)));
    ctx.globalAlpha = s.o * (1 - t * 0.62);
    ctx.strokeStyle = s.c;
    ctx.lineWidth = s.w * (1 - t * 0.3);
    ctx.setLineDash(s.dash ? [2, 5] : []);
    ctx.beginPath();
    ctx.moveTo(s.A[0], s.A[1]);
    ctx.lineTo(s.B[0], s.B[1]);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // markers, always on top: they are the two things being compared
  const pf = project([0, 0, 0]);
  const pc = project(P);

  ctx.strokeStyle = palette.action;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.4;
  ctx.beginPath(); ctx.arc(pf[0], pf[1], 17, 0, TAU); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = palette.action;
  ctx.beginPath(); ctx.arc(pf[0], pf[1], 4.6, 0, TAU); ctx.fill();

  ctx.fillStyle = palette.bg;
  ctx.beginPath(); ctx.arc(pc[0], pc[1], 8, 0, TAU); ctx.fill();
  ctx.strokeStyle = palette.action;
  ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.arc(pc[0], pc[1], 8, 0, TAU); ctx.stroke();
  ctx.fillStyle = palette.action;
  ctx.beginPath(); ctx.arc(pc[0], pc[1], 2.6, 0, TAU); ctx.fill();

  ctx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillStyle = palette.action;
  ctx.fillText('TARGET', pf[0] + 22, pf[1] + 4);
  ctx.fillStyle = palette.sub;
  ctx.fillText('ENTRY', pc[0] + 13, pc[1] - 9);
}
