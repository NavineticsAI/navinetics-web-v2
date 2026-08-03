/* Stage of tools/d1-frame.mjs. Run that, not this. */
/**
 * Tessellate the B-rep into a shaded mesh.
 *
 * Every ADVANCED_FACE is a trimmed surface: a surface plus loops of 3D edges
 * that bound the live region. So the job per face is — invert the loop points
 * into the surface's own (u,v), triangulate that 2D region, subdivide until the
 * chord error is under tolerance, and map back to 3D with analytic normals.
 *
 * 91% of the faces sit on planes, cylinders, cones, tori and spheres, all of
 * which invert in closed form. The B-spline patches (8%, nearly all fillets)
 * invert numerically: nearest point on a coarse grid, then Newton.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { parse, args, ref, str, nums, placement, mul, invert as inv4, apply, IDENT } from './step.mjs';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/^\//, '');
const CAD = ROOT + 'src/assets/d1/';
const WORK = ROOT + 'tools/.d1/';

const FILE = CAD + (readdirSync(CAD).find((f) => /\.step$/i.test(f)) || '');
const IN = 25.4;
const TOL = +(process.argv[2] || 0.3);
/* Set per instance before its faces are walked. Threads are the reason: a
   thumbscrew carries more faces than the arc does, and none of them is
   visible at hero size. */
const FASTENER_TOL = 1.8;
let ACTIVE_TOL = TOL;   // chord tolerance, mm
const E = await parse(FILE);
const A = (id) => args(E.get(id).a);
const T = (id) => E.get(id)?.t;
const P3 = (id) => nums(E.get(id).a).slice(0, 3);

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scl = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/* ── assembly (as before) ─────────────────────────────────────────────────── */
const pdName = new Map();
for (const [id, e] of E) {
  if (e.t !== 'PRODUCT_DEFINITION') continue;
  pdName.set(id, str(args(E.get(ref(args(E.get(ref(A(id)[2])).a)[2])).a)[0]));
}
const pdToRep = new Map();
for (const [id, e] of E) {
  if (e.t !== 'SHAPE_DEFINITION_REPRESENTATION') continue;
  const [pdsA, repA] = A(id);
  const t = ref(args(E.get(ref(pdsA)).a)[2]);
  if (pdName.has(t)) pdToRep.set(t, ref(repA));
}
const repToBrep = new Map();
for (const [id, e] of E) {
  if (e.t !== 'SHAPE_REPRESENTATION_RELATIONSHIP') continue;
  const [, , a, b] = A(id);
  const x = ref(a); const y = ref(b);
  const [sr, br] = T(x) === 'SHAPE_REPRESENTATION' ? [x, y] : [y, x];
  repToBrep.set(sr, br);
}
const kids = new Map();
for (const [id, e] of E) {
  if (e.t !== 'CONTEXT_DEPENDENT_SHAPE_REPRESENTATION') continue;
  const [relA, pdsA] = A(id);
  const na = args(E.get(ref(args(E.get(ref(pdsA)).a)[2])).a);
  const parentPd = ref(na[3]); const childPd = ref(na[4]);
  const rel = E.get(ref(relA)).a;
  const [r1] = (/REPRESENTATION_RELATIONSHIP\s*\(([^)]*)\)/.exec(rel)[1].match(/#\d+/g) || []).map((r) => +r.slice(1));
  const idt = +(/REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION\s*\(\s*#(\d+)/.exec(rel)[1]);
  const [, , ax1, ax2] = args(E.get(idt).a);
  const M1 = placement(E, ref(ax1)); const M2 = placement(E, ref(ax2));
  const M = r1 === pdToRep.get(childPd) ? mul(M2, inv4(M1)) : mul(M1, inv4(M2));
  if (!kids.has(parentPd)) kids.set(parentPd, []);
  kids.get(parentPd).push({ pd: childPd, M });
}
const isChild = new Set();
for (const [, l] of kids) for (const k of l) isChild.add(k.pd);
const insts = [];
const walk = (pd, M) => {
  const brep = repToBrep.get(pdToRep.get(pd));
  if (brep) insts.push({ name: pdName.get(pd), M, brep });
  for (const k of kids.get(pd) || []) walk(k.pd, mul(M, k.M));
};
for (const r of [...pdName.keys()].filter((pd) => !isChild.has(pd))) walk(r, IDENT.slice());

/* ── curves (needed for the loops) ────────────────────────────────────────── */
function deBoor(deg, ctrl, knots, u) {
  let k = deg;
  while (k < knots.length - deg - 2 && knots[k + 1] <= u) k++;
  const d = [];
  for (let j = 0; j <= deg; j++) d.push(ctrl[k - deg + j].slice());
  for (let r = 1; r <= deg; r++) {
    for (let j = deg; j >= r; j--) {
      const i = k - deg + j;
      const den = knots[i + deg - r + 1] - knots[i];
      const a = den === 0 ? 0 : (u - knots[i]) / den;
      for (let c = 0; c < 4; c++) d[j][c] = (1 - a) * d[j - 1][c] + a * d[j][c];
    }
  }
  const w = d[deg][3] || 1;
  return [d[deg][0] / w, d[deg][1] / w, d[deg][2] / w];
}
function splineOf(text) {
  const bs = /B_SPLINE_CURVE\s*\(\s*(\d+)\s*,\s*\(([^)]*)\)/.exec(text);
  const bk = /B_SPLINE_CURVE_WITH_KNOTS\s*\(\s*\(([^)]*)\)\s*,\s*\(([^)]*)\)/.exec(text);
  if (!bs || !bk) return null;
  const deg = +bs[1];
  const cps = (bs[2].match(/#\d+/g) || []).map((r) => P3(+r.slice(1)));
  const mults = bk[1].split(',').map(Number);
  const kn = bk[2].split(',').map(parseFloat);
  const rw = /RATIONAL_B_SPLINE_CURVE\s*\(\s*\(([^)]*)\)/.exec(text);
  const w = rw ? rw[1].split(',').map(parseFloat) : null;
  const ctrl = cps.map((p, i) => { const wi = w ? w[i] : 1; return [p[0] * wi, p[1] * wi, p[2] * wi, wi]; });
  const knots = [];
  for (let i = 0; i < kn.length; i++) for (let m = 0; m < mults[i]; m++) knots.push(kn[i]);
  return { deg, ctrl, knots };
}
function edgePoints(ec) {
  const a = A(ec);
  const v1 = ref(a[1]); const v2 = ref(a[2]); const cid = ref(a[3]);
  const same = /\.T\./.test(a[4] || '');
  const p1 = P3(ref(args(E.get(v1).a)[1]));
  const p2 = P3(ref(args(E.get(v2).a)[1]));
  const t = T(cid);
  if (t === 'LINE') return [p1, p2];
  if (t === 'CIRCLE' || t === 'ELLIPSE') {
    const ca = A(cid);
    const M = placement(E, ref(ca[1]));
    const r = parseFloat(ca[2]);
    const r2 = t === 'ELLIPSE' ? parseFloat(ca[3]) : r;
    const o = [M[3], M[7], M[11]];
    const X = [M[0], M[4], M[8]]; const Y = [M[1], M[5], M[9]];
    const ang = (p) => Math.atan2(dot(sub(p, o), Y) / r2, dot(sub(p, o), X) / r);
    let a1 = ang(p1); let a2 = ang(p2);
    if (!same) { const s = a1; a1 = a2; a2 = s; }
    let d = a2 - a1;
    while (d <= 1e-9) d += Math.PI * 2;
    if (v1 === v2) d = Math.PI * 2;
    /* Segment count from the sagitta, not from arc length over tolerance:
       the latter asks for ~600 segments on a 12 mm hole and buries the
       tessellator in boundary points that then all get subdivided. */
    const rr = Math.max(r, r2);
    const dth = 2 * Math.acos(Math.max(-1, Math.min(1, 1 - (ACTIVE_TOL / IN) / rr)));
    const n = Math.max(4, Math.min(48, Math.ceil(Math.abs(d) / (dth || 0.5))));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const th = a1 + (d * i) / n;
      pts.push(add(o, add(scl(X, r * Math.cos(th)), scl(Y, r2 * Math.sin(th)))));
    }
    return same ? pts : pts.reverse();
  }
  if (t === 'B_SPLINE_CURVE_WITH_KNOTS' || t === 'COMPLEX') {
    const sp = splineOf(E.get(cid).a);
    if (!sp) return [p1, p2];
    const u0 = sp.knots[sp.deg]; const u1 = sp.knots[sp.knots.length - sp.deg - 1];
    const pts = [];
    for (let i = 0; i <= 16; i++) pts.push(deBoor(sp.deg, sp.ctrl, sp.knots, u0 + ((u1 - u0) * i) / 16));
    return pts;
  }
  return [p1, p2];
}

/* ── surfaces ─────────────────────────────────────────────────────────────── */
function frameOf(id) {
  const M = placement(E, id);
  return {
    o: [M[3], M[7], M[11]],
    X: [M[0], M[4], M[8]], Y: [M[1], M[5], M[9]], Z: [M[2], M[6], M[10]],
  };
}
/**
 * A B-spline surface, from either spelling.
 *
 * A plain B_SPLINE_SURFACE_WITH_KNOTS entity carries only its argument list —
 * the parser already stripped the type name — so matching on the literal text
 * "B_SPLINE_SURFACE(" finds nothing and every one of the 1,223 patches fails.
 * Only the COMPLEX (rational) form keeps its type names inline.
 */
function bsurfOf(t, text) {
  let du; let dv; let rows; let wr = null;
  let uM; let vM; let uK; let vK;
  const grid = (s) => s.replace(/^\s*\(/, '').replace(/\)\s*$/, '').split(/\)\s*,\s*\(/);
  if (t === 'COMPLEX') {
    const m = /B_SPLINE_SURFACE\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*\(([\s\S]*?)\)\s*\)\s*,\s*\.[A-Z_]+\./.exec(text)
      || /B_SPLINE_SURFACE\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*\(([\s\S]*?)\)\s*,\s*\.[A-Z_]+\./.exec(text);
    const km = /B_SPLINE_SURFACE_WITH_KNOTS\s*\(\s*\(([^)]*)\)\s*,\s*\(([^)]*)\)\s*,\s*\(([^)]*)\)\s*,\s*\(([^)]*)\)/.exec(text);
    if (!m || !km) return null;
    du = +m[1]; dv = +m[2];
    rows = grid(m[3]).map((r) => (r.match(/#\d+/g) || []).map((x) => P3(+x.slice(1))));
    uM = km[1].split(',').map(Number); vM = km[2].split(',').map(Number);
    uK = km[3].split(',').map(parseFloat); vK = km[4].split(',').map(parseFloat);
    const wm = /RATIONAL_B_SPLINE_SURFACE\s*\(\s*\(([\s\S]*?)\)\s*\)\s*\)/.exec(text);
    wr = wm ? grid(wm[1]).map((r) => r.split(',').map(parseFloat)) : null;
  } else {
    const a = args(text);
    if (a.length < 12) return null;
    du = +a[1]; dv = +a[2];
    rows = grid(a[3]).map((r) => (r.match(/#\d+/g) || []).map((x) => P3(+x.slice(1))));
    uM = (a[8].match(/\d+/g) || []).map(Number); vM = (a[9].match(/\d+/g) || []).map(Number);
    uK = (a[10].match(/-?[\d.]+(?:E[-+]?\d+)?/gi) || []).map(Number);
    vK = (a[11].match(/-?[\d.]+(?:E[-+]?\d+)?/gi) || []).map(Number);
  }
  if (!rows.length || !rows[0].length) return null;
  const ctrl = rows.map((row, i) => row.map((p, j) => {
    const w = wr ? (wr[i]?.[j] ?? 1) : 1;
    return [p[0] * w, p[1] * w, p[2] * w, w];
  }));
  const exp = (mults, kn) => { const o = []; for (let i = 0; i < kn.length; i++) for (let k = 0; k < mults[i]; k++) o.push(kn[i]); return o; };
  const ku = exp(uM, uK);
  const kv = exp(vM, vK);
  if (ku.length !== ctrl.length + du + 1 || kv.length !== ctrl[0].length + dv + 1) return null;
  return { du, dv, ctrl, ku, kv };
}
function bsEval(S, u, v) {
  const cols = [];
  for (let i = 0; i < S.ctrl.length; i++) {
    const row = S.ctrl[i];
    const p = deBoor(S.dv, row, S.kv, v);
    // deBoor divided by w; re-weight so the u pass stays rational
    let wsum = 0; let k = S.dv;
    while (k < S.kv.length - S.dv - 2 && S.kv[k + 1] <= v) k++;
    const d = [];
    for (let j = 0; j <= S.dv; j++) d.push(row[k - S.dv + j][3]);
    for (let r = 1; r <= S.dv; r++) {
      for (let j = S.dv; j >= r; j--) {
        const i2 = k - S.dv + j;
        const den = S.kv[i2 + S.dv - r + 1] - S.kv[i2];
        const a = den === 0 ? 0 : (v - S.kv[i2]) / den;
        d[j] = (1 - a) * d[j - 1] + a * d[j];
      }
    }
    wsum = d[S.dv];
    cols.push([p[0] * wsum, p[1] * wsum, p[2] * wsum, wsum]);
  }
  return deBoor(S.du, cols, S.ku, u);
}
function surfaceOf(id) {
  const rawT = T(id);
  const t = rawT === 'COMPLEX' ? 'B_SPLINE_SURFACE_WITH_KNOTS' : rawT;
  const raw = E.get(id).a;
  const a = args(raw);
  if (t === 'PLANE') {
    const f = frameOf(ref(a[1]));
    return { curved: false, perU: false, perV: false,
      ev: (u, v) => add(f.o, add(scl(f.X, u), scl(f.Y, v))),
      nv: () => f.Z,
      iv: (p) => { const d = sub(p, f.o); return [dot(d, f.X), dot(d, f.Y)]; } };
  }
  if (t === 'CYLINDRICAL_SURFACE') {
    const f = frameOf(ref(a[1])); const R = parseFloat(a[2]);
    return { curved: true, perU: true, perV: false, uscale: R,
      ev: (u, v) => add(f.o, add(add(scl(f.X, R * Math.cos(u)), scl(f.Y, R * Math.sin(u))), scl(f.Z, v))),
      nv: (u) => nrm(add(scl(f.X, Math.cos(u)), scl(f.Y, Math.sin(u)))),
      iv: (p) => { const d = sub(p, f.o); return [Math.atan2(dot(d, f.Y), dot(d, f.X)), dot(d, f.Z)]; } };
  }
  if (t === 'CONICAL_SURFACE') {
    const f = frameOf(ref(a[1])); const R = parseFloat(a[2]); const ang = parseFloat(a[3]);
    const tn = Math.tan(ang);
    return { curved: true, perU: true, perV: false, uscale: R,
      ev: (u, v) => { const r = R + v * tn;
        return add(f.o, add(add(scl(f.X, r * Math.cos(u)), scl(f.Y, r * Math.sin(u))), scl(f.Z, v))); },
      nv: (u) => nrm(add(scl(add(scl(f.X, Math.cos(u)), scl(f.Y, Math.sin(u))), Math.cos(ang)), scl(f.Z, -Math.sin(ang)))),
      iv: (p) => { const d = sub(p, f.o); return [Math.atan2(dot(d, f.Y), dot(d, f.X)), dot(d, f.Z)]; } };
  }
  if (t === 'SPHERICAL_SURFACE') {
    const f = frameOf(ref(a[1])); const R = parseFloat(a[2]);
    return { curved: true, perU: true, perV: false, uscale: R, vscale: R,
      ev: (u, v) => add(f.o, add(scl(add(scl(f.X, Math.cos(u)), scl(f.Y, Math.sin(u))), R * Math.cos(v)), scl(f.Z, R * Math.sin(v)))),
      nv: (u, v) => nrm(add(scl(add(scl(f.X, Math.cos(u)), scl(f.Y, Math.sin(u))), Math.cos(v)), scl(f.Z, Math.sin(v)))),
      iv: (p) => { const d = sub(p, f.o);
        return [Math.atan2(dot(d, f.Y), dot(d, f.X)), Math.asin(Math.max(-1, Math.min(1, dot(d, f.Z) / R)))]; } };
  }
  if (t === 'TOROIDAL_SURFACE') {
    const f = frameOf(ref(a[1])); const R = parseFloat(a[2]); const r = parseFloat(a[3]);
    return { curved: true, perU: true, perV: true, uscale: R + r, vscale: r,
      ev: (u, v) => add(f.o, add(scl(add(scl(f.X, Math.cos(u)), scl(f.Y, Math.sin(u))), R + r * Math.cos(v)), scl(f.Z, r * Math.sin(v)))),
      nv: (u, v) => nrm(add(scl(add(scl(f.X, Math.cos(u)), scl(f.Y, Math.sin(u))), Math.cos(v)), scl(f.Z, Math.sin(v)))),
      iv: (p) => { const d = sub(p, f.o); const x = dot(d, f.X); const y = dot(d, f.Y); const z = dot(d, f.Z);
        return [Math.atan2(y, x), Math.atan2(z, Math.hypot(x, y) - R)]; } };
  }
  const S = bsurfOf(rawT, raw);
  if (!S) return null;
  const u0 = S.ku[S.du]; const u1 = S.ku[S.ku.length - S.du - 1];
  const v0 = S.kv[S.dv]; const v1 = S.kv[S.kv.length - S.dv - 1];
  const ev = (u, v) => bsEval(S, Math.max(u0, Math.min(u1, u)), Math.max(v0, Math.min(v1, v)));
  const du = (u1 - u0) / 800; const dv = (v1 - v0) / 800;
  return { curved: true, perU: false, perV: false, uscale: 1, vscale: 1, ev,
    nv: (u, v) => {
      const a1 = sub(ev(Math.min(u1, u + du), v), ev(Math.max(u0, u - du), v));
      const b1 = sub(ev(u, Math.min(v1, v + dv)), ev(u, Math.max(v0, v - dv)));
      const n = crs(a1, b1);
      return Math.hypot(n[0], n[1], n[2]) < 1e-12 ? [0, 0, 1] : nrm(n);
    },
    iv: (p) => {
      let best = [u0, v0]; let bd = Infinity;
      const N = 9;
      for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
        const u = u0 + ((u1 - u0) * i) / N; const v = v0 + ((v1 - v0) * j) / N;
        const d = dist(ev(u, v), p);
        if (d < bd) { bd = d; best = [u, v]; }
      }
      let [u, v] = best; let step = [(u1 - u0) / N, (v1 - v0) / N];
      for (let it = 0; it < 26; it++) {
        let improved = false;
        for (const [su, sv] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
          const nu = Math.max(u0, Math.min(u1, u + su * step[0]));
          const nv2 = Math.max(v0, Math.min(v1, v + sv * step[1]));
          const d = dist(ev(nu, nv2), p);
          if (d < bd - 1e-12) { bd = d; u = nu; v = nv2; improved = true; }
        }
        if (!improved) { step = [step[0] / 2, step[1] / 2]; if (step[0] < (u1 - u0) / 1e5) break; }
      }
      return [u, v];
    } };
}

/* ── triangulation in uv: ear clipping with bridged holes ─────────────────── */
function area(P) { let a = 0; for (let i = 0, j = P.length - 1; i < P.length; j = i++) a += (P[j][0] - P[i][0]) * (P[j][1] + P[i][1]); return a / 2; }
function segInt(a, b, c, d) {
  const s = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  const d1 = s(a, b, c); const d2 = s(a, b, d); const d3 = s(c, d, a); const d4 = s(c, d, b);
  return d1 !== d2 && d3 !== d4;
}
function bridge(outer, hole) {
  /* Brute force: the shortest join that crosses nothing. Face loops here are
     tens of points, so the cost is irrelevant and the robustness is not. */
  let best = null; let bd = Infinity;
  for (let i = 0; i < outer.length; i++) {
    for (let j = 0; j < hole.length; j++) {
      const a = outer[i]; const b = hole[j];
      const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
      if (d >= bd) continue;
      let ok = true;
      for (const [poly, skipA, skipB] of [[outer, i, (i + outer.length - 1) % outer.length], [hole, j, (j + hole.length - 1) % hole.length]]) {
        for (let k = 0; k < poly.length && ok; k++) {
          if (k === skipA || k === skipB) continue;
          if (segInt(a, b, poly[k], poly[(k + 1) % poly.length])) ok = false;
        }
      }
      if (ok) { bd = d; best = [i, j]; }
    }
  }
  if (!best) return outer;
  const [i, j] = best;
  return [...outer.slice(0, i + 1), ...hole.slice(j), ...hole.slice(0, j + 1), ...outer.slice(i)];
}
function earcut(P) {
  const tri = [];
  const idx = P.map((_, i) => i);
  let guard = 0;
  const cross2 = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const inTri = (a, b, c, p) => {
    const d1 = cross2(a, b, p); const d2 = cross2(b, c, p); const d3 = cross2(c, a, p);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  while (idx.length > 3 && guard++ < 12000) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const a = P[idx[(k + idx.length - 1) % idx.length]];
      const b = P[idx[k]];
      const c = P[idx[(k + 1) % idx.length]];
      if (cross2(a, b, c) <= 0) continue;
      let ok = true;
      for (let m = 0; m < idx.length && ok; m++) {
        if (m === k || m === (k + idx.length - 1) % idx.length || m === (k + 1) % idx.length) continue;
        if (inTri(a, b, c, P[idx[m]])) ok = false;
      }
      if (!ok) continue;
      tri.push([idx[(k + idx.length - 1) % idx.length], idx[k], idx[(k + 1) % idx.length]]);
      idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) tri.push([idx[0], idx[1], idx[2]]);
  return tri;
}

/* ── per-face tessellation ────────────────────────────────────────────────── */
function loopPoints(loopId) {
  const out = [];
  for (const oe of (E.get(loopId).a.match(/#\d+/g) || []).map((r) => +r.slice(1))) {
    if (T(oe) !== 'ORIENTED_EDGE') continue;
    const oa = A(oe);
    const ec = ref(oa[3]);
    if (T(ec) !== 'EDGE_CURVE') continue;
    let pts = edgePoints(ec);
    if (/\.F\./.test(oa[4] || '')) pts = pts.slice().reverse();
    for (const p of pts) {
      if (!out.length || dist(out[out.length - 1], p) > 1e-9) out.push(p);
    }
  }
  if (out.length > 1 && dist(out[0], out[out.length - 1]) < 1e-9) out.pop();
  return out;
}
function unwrap(uv, period) {
  for (let i = 1; i < uv.length; i++) {
    while (uv[i][0] - uv[i - 1][0] > period / 2) uv[i][0] -= period;
    while (uv[i][0] - uv[i - 1][0] < -period / 2) uv[i][0] += period;
  }
  return uv;
}

/* ── grouping: the same families the wireframe used ───────────────────────── */
const STOCK = /^(\d{5,7}[A-Z]\d+|1349K105)_/;
const FAMILY = [
  ['arc', /^20186-9_/],
  ['rails', /^(20186-7_|20186-8_|D1R-)/],
  ['drive', /^20191-/],
  ['stage', /^20186-(1-1|2|5|6|12|13|14|16A|17-1|28-\d|31|32|34)_/],
  ['base', /^20186-(3-1|4)_/],
];
const GNAMES = ['arc', 'rails', 'drive', 'stage', 'base', 'fastener'];
const groupOf = (name) => {
  if (STOCK.test(name) || /_(9\d{4}A\d+|1\d{7}_)/.test(name)) return GNAMES.indexOf('fastener');
  for (const [g, re] of FAMILY) if (re.test(name)) return GNAMES.indexOf(g);
  return GNAMES.indexOf('stage');
};

let nTri = 0; let nFail = 0; const parts = [];
for (const inst of insts) {
  ACTIVE_TOL = groupOf(inst.name) === GNAMES.indexOf('fastener') ? FASTENER_TOL : TOL;
  const items = (E.get(inst.brep).a.match(/#\d+/g) || []).map((r) => +r.slice(1));
  const V = []; const F = [];
  for (const it of items) {
    if (T(it) !== 'MANIFOLD_SOLID_BREP') continue;
    const shell = ref(A(it)[1]);
    for (const f of (E.get(shell).a.match(/#\d+/g) || []).map((r) => +r.slice(1))) {
      if (T(f) !== 'ADVANCED_FACE') continue;
      const fa = A(f);
      const surfId = ref(fa[fa.length - 2]);
      const flip = /\.F\./.test(fa[fa.length - 1] || '');
      let S;
      try { S = surfaceOf(surfId); } catch { S = null; }
      if (!S) { nFail++; continue; }

      const bounds = (fa[1].match(/#\d+/g) || []).map((r) => +r.slice(1));
      const loops = [];
      for (const b of bounds) {
        if (!/FACE_(OUTER_)?BOUND/.test(T(b) || '')) continue;
        const ba = args(E.get(b).a);
        const loop = ref(ba[1]);
        if (T(loop) !== 'EDGE_LOOP') continue;
        let pts = loopPoints(loop);
        if (/\.F\./.test(ba[2] || '')) pts = pts.reverse();
        if (pts.length >= 3) loops.push({ outer: /FACE_OUTER_BOUND/.test(T(b)), pts });
      }
      if (!loops.length) { nFail++; continue; }

      let uvLoops;
      try {
        uvLoops = loops.map((l) => {
          let uv = l.pts.map((p) => S.iv(p));
          if (S.perU) uv = unwrap(uv, Math.PI * 2);
          if (S.perV) { uv = uv.map(([u, v]) => [v, u]); uv = unwrap(uv, Math.PI * 2); uv = uv.map(([v, u]) => [u, v]); }
          return { outer: l.outer, uv, pts: l.pts };
        });
      } catch { nFail++; continue; }

      let outer = uvLoops.find((l) => l.outer) || uvLoops[0];
      const holes = uvLoops.filter((l) => l !== outer);
      let poly = outer.uv.slice();
      if (area(poly) < 0) poly.reverse();
      for (const h of holes) {
        const hp = h.uv.slice();
        if (area(hp) > 0) hp.reverse();
        poly = bridge(poly, hp);
      }
      const tris = earcut(poly);
      if (!tris.length) { nFail++; continue; }

      /* subdivide until the chord error is under tolerance */
      const emit = (a, b, c, depth) => {
        if (S.curved && depth < 5) {
          const edges = [[a, b], [b, c], [c, a]];
          let worst = -1; let we = 0;
          for (let i = 0; i < 3; i++) {
            const [p, q] = edges[i];
            const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
            const e = dist(scl(add(S.ev(p[0], p[1]), S.ev(q[0], q[1])), 0.5), S.ev(mid[0], mid[1])) * IN;
            if (e > we) { we = e; worst = i; }
          }
          if (we > ACTIVE_TOL) {
            const [p, q] = edges[worst];
            const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
            const o = [a, b, c][(worst + 2) % 3];
            emit(o, p, mid, depth + 1);
            emit(o, mid, q, depth + 1);
            return;
          }
        }
        for (const uv of [a, b, c]) {
          const p3 = apply(inst.M, S.ev(uv[0], uv[1])).map((x) => x * IN);
          let n = S.nv(uv[0], uv[1]);
          n = [
            inst.M[0] * n[0] + inst.M[1] * n[1] + inst.M[2] * n[2],
            inst.M[4] * n[0] + inst.M[5] * n[1] + inst.M[6] * n[2],
            inst.M[8] * n[0] + inst.M[9] * n[1] + inst.M[10] * n[2],
          ];
          if (flip) n = scl(n, -1);
          V.push(p3[0], p3[1], p3[2], n[0], n[1], n[2]);
        }
        F.push(V.length / 6 - 3);
        nTri++;
      };
      for (const [i, j, k] of tris) emit(poly[i], poly[j], poly[k], 0);
    }
  }
  if (F.length) parts.push({ name: inst.name, V: Float32Array.from(V) });
}

console.log(`instances ${insts.length}, triangles ${nTri.toLocaleString()}, failed faces ${nFail}`);

/* ── keep the frame, drop the tray and the stock hardware ─────────────────── */
const keep = [];
for (const p of parts) {
  const g = groupOf(p.name);
  if (g < 0) continue;
  let sy = 0;
  for (let i = 1; i < p.V.length; i += 6) sy += p.V[i];
  if (sy / (p.V.length / 6) <= 0) continue;   // accessory tray
  keep.push({ g, V: p.V });
}
const total = keep.reduce((s, p) => s + p.V.length / 18, 0);
console.log(`kept ${keep.length} instances, ${total.toLocaleString()} triangles`);

/* Binary, not JSON: the same mesh as JSON is 275 MB and takes longer to parse
   than it took to build. This file is scratch — only the renders ship. */
const nv = keep.reduce((s, p) => s + p.V.length / 6, 0);
const out = Buffer.alloc(4 + nv * 25);
out.writeUInt32LE(nv, 0);
let o = 4;
for (const p of keep) {
  for (let i = 0; i < p.V.length; i += 6) {
    for (let c = 0; c < 6; c++) { out.writeFloatLE(p.V[i + c], o); o += 4; }
    out.writeUInt8(p.g, o); o += 1;
  }
}
writeFileSync(WORK + 'mesh.bin', out);
console.log(`wrote d1-mesh.bin — ${(out.length / 1048576).toFixed(0)} MB, ${nv.toLocaleString()} vertices`);
