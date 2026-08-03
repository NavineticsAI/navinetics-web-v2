/**
 * A STEP AP214 reader, only as much of one as this job needs.
 *
 * The file is an assembly: 82 products, 157 placement transforms. Raw
 * CARTESIAN_POINT coordinates are in each part's OWN frame, so reading them
 * straight out would stack every part on the origin. The whole point of this
 * module is resolving the placement tree.
 */
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

/* ── entity table ─────────────────────────────────────────────────────────── */

export async function parse(file) {
  const E = new Map(); // id -> { t, a } raw arg string
  const rl = createInterface({
    input: createReadStream(file, { encoding: 'latin1' }),
    crlfDelay: Infinity,
  });

  let buf = '';
  for await (const line of rl) {
    const s = line.trim();
    if (!s) continue;
    buf = buf ? `${buf} ${s}` : s;
    if (!buf.endsWith(';')) continue;
    const stmt = buf;
    buf = '';
    if (stmt[0] !== '#') continue;
    const eq = stmt.indexOf('=');
    if (eq < 0) continue;
    const id = +stmt.slice(1, eq);
    if (!id) continue;
    const rest = stmt.slice(eq + 1).trim().replace(/;$/, '').trim();
    if (rest[0] === '(') {
      // complex entity: ( TYPE(..) TYPE(..) ) — keep whole, tag as COMPLEX
      E.set(id, { t: 'COMPLEX', a: rest });
    } else {
      const sp = rest.indexOf('(');
      if (sp < 0) continue;
      E.set(id, { t: rest.slice(0, sp).trim(), a: rest.slice(sp) });
    }
  }
  return E;
}

/** Split one argument list at top level, respecting nesting and quotes. */
export function args(s) {
  const open = s.indexOf('(');
  const body = s.slice(open + 1, s.lastIndexOf(')'));
  const out = [];
  let d = 0; let q = false; let cur = '';
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (q) { cur += c; if (c === "'") q = false; continue; }
    if (c === "'") { q = true; cur += c; continue; }
    if (c === '(') d++;
    if (c === ')') d--;
    if (c === ',' && d === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export const refs = (s) => (s.match(/#\d+/g) || []).map((r) => +r.slice(1));
export const ref = (s) => (s && s[0] === '#' ? +s.slice(1) : 0);
export const nums = (s) => (s.match(/-?\d+\.?\d*(?:E[-+]?\d+)?/gi) || []).map(Number);
export const str = (s) => (s.match(/'([^']*)'/) || [, ''])[1];

/* ── linear algebra: 4x4 as a flat 16, column-major-free (row-major) ──────── */

export const IDENT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export function mul(A, B) {
  const M = new Array(16).fill(0);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let v = 0;
      for (let k = 0; k < 4; k++) v += A[r * 4 + k] * B[k * 4 + c];
      M[r * 4 + c] = v;
    }
  }
  return M;
}

export function apply(M, p) {
  return [
    M[0] * p[0] + M[1] * p[1] + M[2] * p[2] + M[3],
    M[4] * p[0] + M[5] * p[1] + M[6] * p[2] + M[7],
    M[8] * p[0] + M[9] * p[1] + M[10] * p[2] + M[11],
  ];
}

/** Rigid inverse: transpose the rotation, negate the rotated translation. */
export function invert(M) {
  const R = [M[0], M[4], M[8], M[1], M[5], M[9], M[2], M[6], M[10]];
  const t = [M[3], M[7], M[11]];
  const it = [
    -(R[0] * t[0] + R[1] * t[1] + R[2] * t[2]),
    -(R[3] * t[0] + R[4] * t[1] + R[5] * t[2]),
    -(R[6] * t[0] + R[7] * t[1] + R[8] * t[2]),
  ];
  return [
    R[0], R[1], R[2], it[0],
    R[3], R[4], R[5], it[1],
    R[6], R[7], R[8], it[2],
    0, 0, 0, 1,
  ];
}

const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** AXIS2_PLACEMENT_3D -> a 4x4 taking local coords into the placement frame. */
export function placement(E, id) {
  const e = E.get(id);
  if (!e) return IDENT.slice();
  const a = args(e.a);
  const loc = nums(E.get(ref(a[1]))?.a ?? '(0,0,0)').slice(0, 3);
  let z = a[2] && a[2] !== '$' ? nums(E.get(ref(a[2]))?.a ?? '').slice(0, 3) : [0, 0, 1];
  let x = a[3] && a[3] !== '$' ? nums(E.get(ref(a[3]))?.a ?? '').slice(0, 3) : null;
  z = norm(z.length === 3 ? z : [0, 0, 1]);
  if (!x || x.length !== 3) x = Math.abs(z[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  // Gram-Schmidt x against z, then y = z x x
  x = norm([x[0] - z[0] * dot(x, z), x[1] - z[1] * dot(x, z), x[2] - z[2] * dot(x, z)]);
  const y = cross(z, x);
  return [
    x[0], y[0], z[0], loc[0],
    x[1], y[1], z[1], loc[1],
    x[2], y[2], z[2], loc[2],
    0, 0, 0, 1,
  ];
}

/* ── curve sampling ───────────────────────────────────────────────────────── */

/** de Boor, so a B-spline edge is the curve it is rather than its control hull. */
export function bspline(deg, ctrl, knots, u) {
  let k = deg;
  while (k < knots.length - deg - 2 && knots[k + 1] <= u) k++;
  const d = [];
  for (let j = 0; j <= deg; j++) d.push(ctrl[k - deg + j].slice());
  for (let r = 1; r <= deg; r++) {
    for (let j = deg; j >= r; j--) {
      const i = k - deg + j;
      const den = knots[i + deg - r + 1] - knots[i];
      const a = den === 0 ? 0 : (u - knots[i]) / den;
      for (let c = 0; c < 3; c++) d[j][c] = (1 - a) * d[j - 1][c] + a * d[j][c];
    }
  }
  return d[deg];
}

/** Expand knot multiplicities into the flat knot vector de Boor wants. */
export function flatKnots(mults, knots) {
  const out = [];
  for (let i = 0; i < knots.length; i++) for (let m = 0; m < mults[i]; m++) out.push(knots[i]);
  return out;
}
