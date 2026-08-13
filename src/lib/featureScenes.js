/* ══════════════════════════════════════════════════════════════════════════
   Motion backgrounds for the NaviNetics AI feature bands.

   All four are drawn from scratch. Nothing is traced from a scan, so none of
   them carries a likeness or any patient data.
   ══════════════════════════════════════════════════════════════════════════ */

import { BRAIN } from './brainShape.js';
import { buildTracts } from './tractField.js';

const TAU = Math.PI * 2;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t) => t * t * (3 - 2 * t);

/* ── where each scene sits, and how big it is ─────────────────────────────
   The band is three columns: copy, an empty window, then the screenshot. A
   scene centered and sized to the band ends up mostly behind one or the
   other, so each is fitted to the window instead — placed at `cx` (fraction
   of band width) and scaled so that at most a tenth of its lit area falls
   behind the copy and a twentieth behind the image.

   These are measured, not judged by eye: the harness samples the canvas and
   reports what fraction of lit pixels each element covers. Change the column
   widths in SceneBand and these need re-fitting. */
const AT = {
  fusion: { cx: 0.40, s: 0.45, cy: 0.50 },
  nbar: { cx: 0.405, s: 0.142, cy: 0.46 },
  targeting: { cx: 0.391, s: 0.47, cy: 0.46 },
  dti: { cx: 0.39, s: 0.45, cy: 0.46 },
};

/** Deterministic, so a scene composes the same way on every load. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/** Bottom-right figure, shared by all four scenes. */
function readout(ctx, w, h, label, value, color) {
  ctx.textAlign = 'right';
  ctx.font = '600 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = 'rgba(169,195,208,0.6)';
  ctx.fillText(label, w - 28, h - 42);
  ctx.font = '600 23px "IBM Plex Mono", monospace';
  ctx.fillStyle = color;
  ctx.fillText(value, w - 28, h - 16);
}

/* ══════════════════════════════════════════════════════════════════════
   1 · MULTIMODAL FUSION
   Two contour sets — CT blue, MR gold — drift into alignment while the
   edge-agreement figure climbs. A review line sweeps continuously and a
   checkerboard fades in as they agree, which is how registration is
   actually inspected.
   ══════════════════════════════════════════════════════════════════════ */
export function makeFusion() {
  const r = rng(0x51f0);
  const rings = [
    { rx: 0.30, ry: 0.385, wob: 0.020, w: 1.7 },
    { rx: 0.272, ry: 0.352, wob: 0.017, w: 1.1 },
    { rx: 0.244, ry: 0.318, wob: 0.015, w: 0.9 },
    { rx: 0.176, ry: 0.236, wob: 0.026, w: 0.8 },
  ].map((ring) => {
    const pts = [];
    for (let i = 0; i < 128; i++) {
      const a = (i / 128) * TAU;
      const k = 1 + Math.sin(a * 3 + r() * 0.4) * ring.wob + Math.sin(a * 7) * ring.wob * 0.5;
      pts.push([Math.cos(a) * ring.rx * k, Math.sin(a) * ring.ry * k]);
    }
    return { pts, w: ring.w };
  });
  for (const sx of [-1, 1]) {
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * TAU;
      pts.push([sx * 0.055 + Math.cos(a) * 0.030, -0.02 + Math.sin(a) * 0.086]);
    }
    rings.push({ pts, w: 0.9 });
  }

  const path = (ctx, pts, cx, cy, s, dx, dy, rot) => {
    const c = Math.cos(rot), sn = Math.sin(rot);
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      const X = x * c - y * sn, Y = x * sn + y * c;
      const px = cx + X * s + dx, py = cy + Y * s + dy;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    });
    ctx.closePath();
  };

  return (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const p = (t % 13) / 13;
    const conv = smooth(clamp01(p / 0.42));
    const miss = 1 - conv;

    const s = Math.min(w, h) * AT.fusion.s;
    const cx = w * AT.fusion.cx, cy = h * AT.fusion.cy;
    const spin = Math.sin(t * 0.11) * 0.018;
    const dx = miss * s * 0.13, dy = miss * s * -0.075, rot = miss * 0.11 + spin;

    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(232,168,56,0.62)';
    for (const ring of rings) { ctx.lineWidth = ring.w; path(ctx, ring.pts, cx, cy, s, 0, 0, spin); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(91,155,213,0.66)';
    for (const ring of rings) { ctx.lineWidth = ring.w; path(ctx, ring.pts, cx, cy, s, dx, dy, rot); ctx.stroke(); }

    const fw = s * 0.42, fh = s * 0.47;
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = 'rgba(91,155,213,0.34)';
    ctx.save();
    ctx.translate(cx + dx, cy + dy);
    ctx.rotate(rot);
    ctx.strokeRect(-fw, -fh, fw * 2, fh * 2);
    ctx.beginPath();
    for (const g of [-0.5, 0, 0.5]) {
      ctx.moveTo(fw * g * 2, -fh); ctx.lineTo(fw * g * 2, fh);
      ctx.moveTo(-fw, fh * g * 2); ctx.lineTo(fw, fh * g * 2);
    }
    ctx.stroke();
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    const sy = cy - fh + ((t * 0.16) % 1) * fh * 2;
    const grad = ctx.createLinearGradient(cx - fw, sy, cx + fw, sy);
    grad.addColorStop(0, 'rgba(190,225,240,0)');
    grad.addColorStop(0.5, `rgba(190,225,240,${(0.16 + conv * 0.2).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(190,225,240,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - fw, sy); ctx.lineTo(cx + fw, sy); ctx.stroke();

    const chk = clamp01((conv - 0.5) / 0.5);
    if (chk > 0.01) {
      const tile = s * 0.14;
      ctx.strokeStyle = `rgba(190,225,240,${(chk * 0.16).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = cx - fw; x <= cx + fw + 1; x += tile) { ctx.moveTo(x, cy - fh); ctx.lineTo(x, cy + fh); }
      for (let y = cy - fh; y <= cy + fh + 1; y += tile) { ctx.moveTo(cx - fw, y); ctx.lineTo(cx + fw, y); }
      ctx.stroke();
    }

    readout(ctx, w, h, 'EDGE AGREEMENT', (0.22 + conv * 0.47).toFixed(2),
      conv > 0.72 ? 'rgba(94,231,160,0.9)' : 'rgba(232,168,56,0.88)');
  };
}

/* ══════════════════════════════════════════════════════════════════════
   2 · N-BAR STEREOTACTIC REGISTRATION

   The N-localizer principle, animated. Three rods per plate — two upright,
   one diagonal — and an image plane descending through them. Every slice
   yields three points per plate, so the fiducials accumulate into dense
   strings along each rod, which is exactly how the detected set looks in
   the application.

   The middle point of each N slides along its diagonal as the plane falls.
   That displacement is what encodes slice height, and it is the one thing
   this scene exists to show.
   ══════════════════════════════════════════════════════════════════════ */
export function makeNbar() {
  const iso = (x, y, z, cx, cy, s) => [
    cx + (x - z) * 0.866 * s,
    cy + (y * 0.92 + (x + z) * 0.5) * s,
  ];

  /* Face placement is not arbitrary: with screenX = (x - z), the faces at
     z=+1 and x=-1 land on the LEFT of the projection and those at z=-1 and
     x=+1 land on the RIGHT. Picking three without checking puts two on top
     of each other. Two left, one right reads as a box you can see into. */
  const FACES = [
    { at: (u, v) => [u * 2 - 1, v, 1], depth: 0 },     // anterior  → left
    { at: (u, v) => [-1, v, u * 2 - 1], depth: 1 },    // left      → left, behind
    { at: (u, v) => [1, v, 1 - u * 2], depth: 0 },     // right     → right
  ];
  const UP = [0.22, 0.78];
  const SLICES = 46;                                    // stack depth

  return (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const s = Math.min(w, h) * AT.nbar.s;
    const cx = w * AT.nbar.cx, cy = h * AT.nbar.cy;

    const p = (t % 12) / 12;
    const sweep = clamp01(p / 0.72);
    const done = Math.floor(sweep * SLICES);
    const yp = -1 + sweep * 2;
    const solved = p > 0.76;

    const P = (x, y, z) => iso(x, y, z, cx, cy, s);
    const seg = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };

    ctx.strokeStyle = 'rgba(120,160,190,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
      for (const [dx, dy, dz] of [[2, 0, 0], [0, 2, 0], [0, 0, 2]]) {
        if (x + dx > 1 || y + dy > 1 || z + dz > 1) continue;
        const a = P(x, y, z), b = P(x + dx, y + dy, z + dz);
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      }
    }
    ctx.stroke();

    for (const f of FACES) {
      const dim = f.depth ? 0.6 : 1;
      ctx.strokeStyle = `rgba(91,155,213,${(0.5 * dim).toFixed(2)})`;
      ctx.lineWidth = 2.4;
      for (const u of UP) seg(P(...f.at(u, -1)), P(...f.at(u, 1)));
      ctx.strokeStyle = `rgba(120,180,225,${(0.62 * dim).toFixed(2)})`;
      seg(P(...f.at(UP[0], -1)), P(...f.at(UP[1], 1)));
    }

    // accumulated fiducials — one triple per slice, per plate
    for (const f of FACES) {
      const dim = f.depth ? 0.55 : 1;
      for (let i = 0; i <= done; i++) {
        const frac = i / SLICES;
        const yy = -1 + frac * 2;
        const live = i === done;
        for (let k = 0; k < 3; k++) {
          const u = k === 2 ? UP[0] + (UP[1] - UP[0]) * frac : UP[k];
          const pt = P(...f.at(u, yy));
          if (live) {
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], 7, 0, TAU);
            ctx.fillStyle = 'rgba(74,222,128,0.16)';
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], live ? 3.4 : 1.9, 0, TAU);
          ctx.fillStyle = k === 2
            ? `rgba(140,255,190,${(0.9 * dim).toFixed(2)})`
            : `rgba(74,222,128,${(0.78 * dim).toFixed(2)})`;
          ctx.fill();
        }
      }
    }

    ctx.beginPath();
    [P(-1, yp, -1), P(1, yp, -1), P(1, yp, 1), P(-1, yp, 1)]
      .forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
    ctx.closePath();
    ctx.fillStyle = 'rgba(120,180,220,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(190,225,240,0.34)';
    ctx.lineWidth = 1;
    ctx.stroke();

    readout(ctx, w, h, solved ? 'FIDUCIALS · TRANSFORM SOLVED' : 'FIDUCIALS DETECTED',
      String(done * 9), solved ? 'rgba(94,231,160,0.92)' : 'rgba(190,225,240,0.72)');
  };
}

/* ══════════════════════════════════════════════════════════════════════
   3 · AC-PC TARGETING

   Indirect targeting, in the order it is actually done. Find the anterior
   and posterior commissures, take the line between them, put the origin at
   its midpoint, rotate the coordinate frame onto it, then step out to the
   target as an offset from that midpoint — and only then plan the track.

   The AC-PC distance shown is an ordinary anatomical measurement, not a
   figure about the product.
   ══════════════════════════════════════════════════════════════════════ */
export function makeTargeting() {
  /* Same silhouette as the tractography scene, from the same mesh — the two
     sections sit one after the other, and two different brains between them
     reads as carelessness. Anterior is at negative u, so it faces left here
     exactly as it does there. */
  const brain = BRAIN.outline.filter(([, v]) => v <= 0.3);

  // Cerebral extent, measured rather than assumed, so the landmarks sit in
  // the right place whatever mesh is supplied.
  const us = brain.map((p) => p[0]), vs = brain.map((p) => p[1]);
  const uLo = Math.min(...us), uHi = Math.max(...us);
  const vLo = Math.min(...vs), vHi = Math.max(...vs);

  /* The mid-commissural point sits close to the center of the cerebrum, a
     little below its vertical midpoint. AC and PC straddle it about 26 mm
     apart — roughly 15% of the front-to-back extent — with AC anterior. */
  const MCP = [uLo + (uHi - uLo) * 0.5, vLo + (vHi - vLo) * 0.56];
  const halfAcPc = (uHi - uLo) * 0.075;
  const AC = [MCP[0] - halfAcPc, MCP[1] - 0.009];
  const PC = [MCP[0] + halfAcPc, MCP[1] + 0.009];

  const acpcAng = Math.atan2(PC[1] - AC[1], PC[0] - AC[0]);
  const rotp = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
  // target as an offset from MCP, expressed in the AC-PC frame
  const OFF = [0.022, 0.042];
  const TGT = (() => { const o = rotp(OFF, acpcAng); return [MCP[0] + o[0], MCP[1] + o[1]]; })();

  // Entry on the real cortical surface, a little anterior of the vertex.
  const ENTRY = (() => {
    const c = BRAIN.cortex;
    const p = c[Math.floor(c.length * 0.38)];
    return [p[0], p[1] + 0.012];
  })();

  return (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const s = Math.min(w, h) * AT.targeting.s;
    const cx = w * AT.targeting.cx, cy = h * AT.targeting.cy;
    const X = (p) => cx + p[0] * s;
    const Y = (p) => cy + p[1] * s;
    const dot = (p, rad, fill) => { ctx.beginPath(); ctx.arc(X(p), Y(p), rad, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };

    const p = (t % 14) / 14;
    const ph = (a, b) => smooth(clamp01((p - a) / (b - a)));
    const marks = ph(0.10, 0.26);       // AC and PC
    const line = ph(0.26, 0.40);        // AC-PC line and MCP
    const frame = ph(0.40, 0.56);       // rotate the frame onto it
    const step = ph(0.56, 0.74);        // offset out to target
    const track = ph(0.74, 0.88);       // trajectory
    // Everything except the brain fades out together rather than snapping
    // off, so the loop restarts without a cut.
    const out = 1 - ph(0.9, 1);

    /* The outline is always drawn. Animating it on left the band very nearly
       empty for the first second of every cycle, and a background must not
       blink out. Clipping the stalk leaves two arcs rather than one closed
       ring, so the path is broken between them; joining them would rule a
       line straight across the skull base. */
    ctx.strokeStyle = 'rgba(150,190,210,0.36)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    let open = false, prevU = null;
    for (const pt of brain) {
      if (prevU !== null && Math.abs(pt[0] - prevU) > 0.06) open = false;   // a jump
      const px = X(pt), py = Y(pt);
      if (open) ctx.lineTo(px, py); else { ctx.moveTo(px, py); open = true; }
      prevU = pt[0];
    }
    ctx.stroke();

    ctx.globalAlpha = out;

    // the AC-PC aligned grid
    if (frame > 0.01) {
      ctx.save();
      ctx.translate(X(MCP), Y(MCP));
      ctx.rotate(acpcAng * frame);
      ctx.strokeStyle = `rgba(120,180,225,${(0.16 * frame).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let g = -4; g <= 4; g++) {
        ctx.moveTo(g * s * 0.026, -s * 0.11); ctx.lineTo(g * s * 0.026, s * 0.11);
        ctx.moveTo(-s * 0.11, g * s * 0.026); ctx.lineTo(s * 0.11, g * s * 0.026);
      }
      ctx.stroke();
      ctx.restore();
    }

    // AC-PC line
    if (line > 0.01) {
      ctx.strokeStyle = 'rgba(190,225,240,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(X(AC), Y(AC));
      ctx.lineTo(X(AC) + (X(PC) - X(AC)) * line, Y(AC) + (Y(PC) - Y(AC)) * line);
      ctx.stroke();
    }

    // commissures
    if (marks > 0.01) {
      const pulse = 1 + Math.sin(t * 3) * 0.12 * (1 - marks);
      dot(AC, 3.6 * pulse, `rgba(255,219,79,${(0.95 * marks).toFixed(2)})`);
      dot(PC, 3.6 * pulse, `rgba(255,219,79,${(0.95 * marks).toFixed(2)})`);
      ctx.font = '600 9.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = `rgba(255,219,79,${(0.85 * marks).toFixed(2)})`;
      ctx.textAlign = 'center';
      ctx.fillText('AC', X(AC) + 14, Y(AC) - 9);
      ctx.fillText('PC', X(PC) - 14, Y(PC) - 9);
    }

    // mid-commissural point
    if (line > 0.6) {
      const a = clamp01((line - 0.6) / 0.4);
      dot(MCP, 4.2, `rgba(120,190,235,${(0.95 * a).toFixed(2)})`);
      ctx.font = '600 9.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = `rgba(120,190,235,${(0.9 * a).toFixed(2)})`;
      ctx.textAlign = 'center';
      ctx.fillText('MCP', X(MCP), Y(MCP) - 12);
    }

    // the offset, stepped out along the AC-PC frame
    if (step > 0.01) {
      const o = rotp([OFF[0] * Math.min(1, step * 2), 0], acpcAng);
      const mid = [MCP[0] + o[0], MCP[1] + o[1]];
      const o2 = rotp([OFF[0], OFF[1] * clamp01(step * 2 - 1)], acpcAng);
      const cur = [MCP[0] + o2[0], MCP[1] + o2[1]];
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(120,190,235,0.7)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(X(MCP), Y(MCP));
      ctx.lineTo(X(mid), Y(mid));
      if (step > 0.5) ctx.lineTo(X(cur), Y(cur));
      ctx.stroke();
      ctx.setLineDash([]);
      if (step > 0.9) {
        dot(TGT, 4, 'rgba(198,45,45,0.95)');
        ctx.strokeStyle = 'rgba(198,45,45,0.8)';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(X(TGT), Y(TGT), 8.5, 0, TAU); ctx.stroke();
      }
    }

    // the track
    if (track > 0.01) {
      ctx.strokeStyle = 'rgba(3,161,189,0.85)';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(X(ENTRY), Y(ENTRY));
      ctx.lineTo(X(ENTRY) + (X(TGT) - X(ENTRY)) * track, Y(ENTRY) + (Y(TGT) - Y(ENTRY)) * track);
      ctx.stroke();
      dot(ENTRY, 3.4, 'rgba(115,229,25,0.95)');
    }

    ctx.globalAlpha = 1;

    const acpcMm = 26 * clamp01(line * 1.2);
    readout(ctx, w, h,
      step > 0.9 ? 'TARGET · OFFSET FROM MCP' : 'AC–PC DISTANCE',
      step > 0.9 ? 'SET' : `${acpcMm.toFixed(1)} mm`,
      step > 0.9 ? 'rgba(94,231,160,0.9)' : 'rgba(190,225,240,0.78)');
  };
}

/* ══════════════════════════════════════════════════════════════════════
   4 · DIFFUSION TRACTOGRAPHY

   A whole-brain field rather than a single bundle, built from five families
   that genuinely run in different principal directions — so the colouring
   covers all three DEC axes instead of collapsing onto one.

   Directionally-encoded color, coronal view: screen-horizontal is
   left-right (RED), screen-vertical is superior-inferior (BLUE), and the
   axis into the screen is anterior-posterior (GREEN). Curving bundles blend
   between them, which is where the mixed hues come from.
   ══════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════
   4 · DIFFUSION TRACTOGRAPHY

   Streamlines are INTEGRATED through a direction field rather than drawn as
   parametric curves. That is how real tractography works, and it is what
   makes the result look anatomical: neighboring streamlines share the local
   direction so bundles stay coherent, but each one wanders on its own, so
   none of them reads as a formula.

   The field is assembled from three regimes that blend smoothly into each
   other — projection fibers radiating from the internal capsule, association
   fibers running front to back, and a callosal arc riding over the ventricle
   — plus a low-frequency perturbation, and a tangential bend near the
   surface so fibers turn to follow the cortex instead of running into it.

   Shape, boundary and cortical surface all come from the supplied mesh.

   Directionally-encoded color, sagittal view: screen-horizontal is
   anterior-posterior (GREEN), screen-vertical is superior-inferior (BLUE),
   and the axis into the screen is left-right (RED). Bundles that curve blend
   between them.
   ══════════════════════════════════════════════════════════════════════ */
export function makeDti() {
  /* Field, streamlines and containment all live in tractField.js now, so the
     hero draws the same bundles instead of its own hand-placed guesses. */
  /* Color is quantized into buckets so each is stroked once. Every distinct
     bucket is a separate additive stroke, though, so the resolution is a
     direct frame cost: at QC=5 a fully-grown frame issued up to 648 of them.
     At QC=3 it is 192, and with hairlines blending additively the difference
     is not visible. */
  const QC = 3, QA = 3;
  const tracts = buildTracts({ count: 420, max: 46, step: 0.0062 });

  /* Direction color never changes, so quantise it once here rather than
     normalizing and rounding three channels on every segment of every frame.
     Only the alpha half of the bucket key is left to the frame. */
  for (const tr of tracts) {
    for (let k = 1; k < tr.pts.length; k++) {
      const b = tr.pts[k];
      const m = Math.max(b[2], b[3], b[4]) || 1;
      b[6] = ((Math.round((b[2] / m) * QC) * (QC + 1)
        + Math.round((b[3] / m) * QC)) * (QC + 1)
        + Math.round((b[4] / m) * QC)) * QA;
    }
  }

  /* Stroking every segment individually is tens of thousands of draw calls a
     frame and will not hold 60fps. Segments are collected into buckets keyed
     by quantized color and alpha, then each bucket is stroked once. */
  const buckets = new Map();

  /* The tracts are drawn into a reduced-resolution buffer and blitted once.
     Additive blending is charged per stroke, and this scene issues a couple
     of hundred of them over an area the width of the band — done straight
     onto a device-scaled canvas it was the single most expensive thing on
     the page, and at 2× display scaling it fell to about 12fps. These are
     soft hairlines, so three quarters of linear resolution costs nothing
     anyone can see and a bit over half the fill. */
  const R = 0.75;
  let buf = null;
  let bctx = null;

  return (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    /* Set further left and a little smaller than the other three. This scene
       is a whole brain and is by far the widest of them, so at the shared
       center it ran furthest under the screenshot. */
    const s = Math.min(w, h) * AT.dti.s;
    const cx = w * AT.dti.cx, cy = h * AT.dti.cy;

    const bw = Math.max(1, Math.round(w * R));
    const bh = Math.max(1, Math.round(h * R));
    if (!buf || buf.width !== bw || buf.height !== bh) {
      buf = document.createElement('canvas');
      buf.width = bw;
      buf.height = bh;
      bctx = buf.getContext('2d');
    }
    bctx.setTransform(R, 0, 0, R, 0, 0);
    bctx.clearRect(0, 0, w, h);

    /* Silhouette, straight from the model — but only down to the cerebrum.
       The mesh carries a long brainstem tail that reads as a stray line once
       the tracts above it stop. */
    bctx.strokeStyle = 'rgba(150,190,210,0.15)';
    bctx.lineWidth = 1.1;
    bctx.beginPath();
    let open = false;
    for (const [u, v] of BRAIN.outline) {
      if (v > 0.3) { open = false; continue; }
      const px = cx + u * s, py = cy + v * s;
      if (open) bctx.lineTo(px, py); else { bctx.moveTo(px, py); open = true; }
    }
    bctx.stroke();

    const base = (t % 13) / 13;
    buckets.clear();

    for (const tr of tracts) {
      const p = (base + tr.phase) % 1;
      const grow = clamp01(p / 0.34);
      const fade = p > 0.82 ? 1 - clamp01((p - 0.82) / 0.18) : 1;
      // grow outward from the seed, both ways, as tracking actually proceeds
      const reach = Math.floor(smooth(grow) * Math.max(tr.seed, tr.pts.length - tr.seed));
      const from = Math.max(1, tr.seed - reach);
      const to = Math.min(tr.pts.length - 1, tr.seed + reach);

      let lastKey = -1;
      let path = null;
      for (let k = from; k <= to; k++) {
        const b = tr.pts[k];
        const edge = Math.min(k - from, to - k);
        const qa = Math.min(QA - 1, Math.round(Math.min(1, edge / 11) * (QA - 1) * fade));
        const key = b[6] + qa;
        /* Direction changes slowly along a streamline, so consecutive
           segments nearly always land in the same bucket. Extending the run
           halves the path calls and skips the map lookup entirely. */
        if (key !== lastKey) {
          path = buckets.get(key);
          if (!path) { path = new Path2D(); buckets.set(key, path); }
          const a = tr.pts[k - 1];
          path.moveTo(cx + a[0] * s, cy + a[1] * s);
          lastKey = key;
        }
        path.lineTo(cx + b[0] * s, cy + b[1] * s);
      }
    }

    bctx.globalCompositeOperation = 'lighter';
    bctx.lineCap = 'round';
    for (const [key, path] of buckets) {
      const qa = key % QA;
      const rest = (key - qa) / QA;
      const qb = rest % (QC + 1);
      const qg = ((rest - qb) / (QC + 1)) % (QC + 1);
      const qr = ((rest - qb) / (QC + 1) - qg) / (QC + 1);
      const alpha = 0.09 + (qa / (QA - 1)) * 0.3;
      bctx.strokeStyle = `rgba(${((qr / QC) * 255) | 0},${((qg / QC) * 255) | 0},${((qb / QC) * 255) | 0},${alpha.toFixed(3)})`;
      bctx.lineWidth = (0.65 + (qa / (QA - 1)) * 0.6) / R;
      bctx.stroke(path);
    }
    bctx.globalCompositeOperation = 'source-over';

    // one blit; the readout goes on afterwards, at full resolution
    ctx.drawImage(buf, 0, 0, w, h);

    readout(ctx, w, h, 'STREAMLINES',
      String(1200 + Math.floor(smooth(clamp01(base / 0.4)) * 1078)), 'rgba(94,231,160,0.85)');
  };
}
