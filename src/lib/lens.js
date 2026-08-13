/**
 * Liquid-glass refraction engine.
 *
 * Displaces the real page backdrop through an feDisplacementMap whose map is
 * generated from the element's own rounded-rectangle signed-distance field.
 * Strongest at the curved bevel, zero through the flat middle — the opposite
 * of the feTurbulence approach, which warps evenly and reads as rippled glass.
 *
 * See /design-language-info/02-liquid-glass.md for the derivation, the
 * measurements, and the dead ends (notably: blurring before displacement
 * takes the effect to zero).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const BLOB = 190; // px, the pointer lens map
const MAP_MAX = 420; // cap on generated map resolution; maps are smooth so this is free

export const LENS_DEFAULTS = {
  bevel: 26, // px — width of the refracting band
  edge: 130, // displacement strength at the bevel
  pointer: 60, // displacement strength of the cursor-following lens
  chroma: 5, // chromatic aberration; 0 disables the extra passes
  blur: 5, // px — above ~7 the refraction stops being visible
};

let defs = null;
let blobHref = null;
let uid = 0;
let capability = null;

/**
 * SVG filter references inside backdrop-filter are Chromium-only today.
 * Probed rather than assumed — a rejected declaration would drop the blur too,
 * so the refraction layer is only ever added after this passes.
 */
export function canRefract() {
  if (capability !== null) return capability;
  if (typeof window === 'undefined' || !window.CSS?.supports) return (capability = false);
  const ua = navigator.userAgent;
  const isSafari = /safari/i.test(ua) && !/chrome|chromium|crios|android|edg|fxios/i.test(ua);
  const isFirefox = /firefox|fxios/i.test(ua);
  const supported =
    CSS.supports('backdrop-filter', 'url(#a) blur(2px)') ||
    CSS.supports('-webkit-backdrop-filter', 'url(#a) blur(2px)');
  capability = supported && !isSafari && !isFirefox;
  if (capability) document.documentElement.classList.add('nn-refract');
  return capability;
}

function getDefs() {
  if (defs) return defs;
  defs = document.createElementNS(SVG_NS, 'svg');
  defs.setAttribute('aria-hidden', 'true');
  defs.setAttribute('focusable', 'false');
  defs.style.cssText =
    'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  document.body.appendChild(defs);
  return defs;
}

/** Bevel displacement map from the rounded-rect SDF. */
function edgeMap(w, h, r, bevel) {
  const s = Math.min(1, MAP_MAX / Math.max(w, h));
  const cw = Math.max(8, Math.round(w * s));
  const ch = Math.max(8, Math.round(h * s));
  const rr = Math.min(r * s, cw / 2, ch / 2);
  const bv = Math.max(1, bevel * s);

  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(cw, ch);
  const d = img.data;
  const hw = cw / 2;
  const hh = ch / 2;

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const px = x - hw + 0.5;
      const py = y - hh + 0.5;
      const qx = Math.abs(px) - hw + rr;
      const qy = Math.abs(py) - hh + rr;
      const ax = Math.max(qx, 0);
      const ay = Math.max(qy, 0);
      const sd = Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(qx, qy), 0) - rr;

      let nx = 0;
      let ny = 0;
      let k = 0;
      if (sd < 0 && sd > -bv) {
        const t = -sd / bv; // 0 at the edge, 1 at the inner limit
        k = (1 - t) * (1 - t); // convex falloff
        if (ax > 0 || ay > 0) {
          const L = Math.sqrt(ax * ax + ay * ay) || 1;
          nx = (px < 0 ? -1 : 1) * (ax / L);
          ny = (py < 0 ? -1 : 1) * (ay / L);
        } else if (qx > qy) {
          nx = px < 0 ? -1 : 1;
        } else {
          ny = py < 0 ? -1 : 1;
        }
      }
      const i = (y * cw + x) * 4;
      d[i] = 128 + nx * k * 127; // R drives X
      d[i + 1] = 128 + ny * k * 127; // G drives Y
      d[i + 2] = 128;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

/** Radial droplet lens that rides the pointer. Generated once. */
function lensMap(size) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const d = img.data;
  const cc = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cc + 0.5;
      const dy = y - cc + 0.5;
      const L = Math.sqrt(dx * dx + dy * dy);
      const t = L / cc;
      let nx = 0;
      let ny = 0;
      let k = 0;
      if (t < 1 && L > 0) {
        const s = Math.sin(t * Math.PI);
        k = s * s; // zero at center and rim, peak between
        nx = dx / L;
        ny = dy / L;
      }
      const i = (y * size + x) * 4;
      d[i] = 128 + nx * k * 127;
      d[i + 1] = 128 + ny * k * 127;
      d[i + 2] = 128;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

function parseNode(markup) {
  const doc = new DOMParser().parseFromString(
    `<svg xmlns="${SVG_NS}">${markup}</svg>`,
    'image/svg+xml',
  );
  return document.importNode(doc.documentElement.firstElementChild, true);
}

function filterMarkup(state, w, h, opts) {
  const S = Math.max(opts.edge, opts.pointer, 1);
  const eA = opts.edge / S;
  const bA = opts.pointer / S;
  state.bA = bA;
  const a = state.amp * bA;

  const displace =
    opts.chroma > 0
      ? // three passes at slightly different scales, one channel from each
        `<feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="${S + opts.chroma}" result="dR"/>` +
        `<feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="${S}" result="dG"/>` +
        `<feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="${S - opts.chroma}" result="dB"/>` +
        `<feColorMatrix in="dR" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="cR"/>` +
        `<feColorMatrix in="dG" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="cG"/>` +
        `<feColorMatrix in="dB" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="cB"/>` +
        `<feComposite in="cR" in2="cG" operator="arithmetic" k2="1" k3="1" result="cRG"/>` +
        `<feComposite in="cRG" in2="cB" operator="arithmetic" k2="1" k3="1"/>`
      : `<feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="${S}"/>`;

  // color-interpolation-filters="sRGB" is REQUIRED. The linearRGB default
  // shifts where "neutral" sits and smears the whole panel sideways.
  //
  // The neutral flood is also required: feImage yields transparent black
  // outside its subregion, which a displacement map reads as a full-scale
  // negative offset.
  return (
    `<filter id="${state.id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}" color-interpolation-filters="sRGB">` +
    `<feFlood flood-color="rgb(128,128,128)" result="neutral"/>` +
    `<feImage class="nn-blob" href="${blobHref}" x="-9999" y="-9999" width="${BLOB}" height="${BLOB}" preserveAspectRatio="none" result="blobRaw"/>` +
    `<feComposite in="blobRaw" in2="neutral" operator="over" result="blobFull"/>` +
    `<feComposite class="nn-amp" in="blobFull" in2="neutral" operator="arithmetic" k1="0" k2="${a.toFixed(3)}" k3="${(1 - a).toFixed(3)}" k4="0" result="ptr"/>` +
    `<feImage href="${state.edgeHref}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="edgeRaw"/>` +
    `<feComposite in="edgeRaw" in2="neutral" operator="arithmetic" k1="0" k2="${eA.toFixed(3)}" k3="${(1 - eA).toFixed(3)}" k4="0" result="edge"/>` +
    // both maps are centered on 0.5, so one must be subtracted back out
    `<feComposite in="ptr" in2="edge" operator="arithmetic" k1="0" k2="1" k3="1" k4="-0.5" result="map"/>` +
    displace +
    `</filter>`
  );
}

/**
 * Attach refraction to an element. Returns a cleanup function.
 * No-op (returning a no-op cleanup) where unsupported.
 */
export function attachLens(el, options = {}) {
  const opts = { ...LENS_DEFAULTS, ...options };
  if (!el || !canRefract()) return () => {};

  if (!blobHref) blobHref = lensMap(BLOB);
  const container = getDefs();

  const state = {
    id: `nn-lens-${++uid}`,
    edgeHref: null,
    geoKey: '',
    amp: 0,
    target: 0,
    bA: 0,
    node: null,
    blob: null,
    amper: null,
    raf: 0,
  };

  const applyBackdrop = () => {
    // Order matters: displace FIRST, then blur. Blurring first leaves no
    // high-frequency detail to bend and takes the effect to zero.
    const value = `url(#${state.id}) blur(${opts.blur}px) saturate(1.9)`;
    el.style.backdropFilter = value;
    el.style.webkitBackdropFilter = value;
  };

  const rebuild = () => {
    const w = Math.round(el.offsetWidth);
    const h = Math.round(el.offsetHeight);
    if (!w || !h) return;
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    const geoKey = `${w}|${h}|${radius}|${opts.bevel}`;
    if (geoKey !== state.geoKey || !state.edgeHref) {
      state.edgeHref = edgeMap(w, h, radius, opts.bevel);
      state.geoKey = geoKey;
    }
    const node = parseNode(filterMarkup(state, w, h, opts));
    if (state.node) container.replaceChild(node, state.node);
    else container.appendChild(node);
    state.node = node;
    state.blob = node.querySelector('.nn-blob');
    state.amper = node.querySelector('.nn-amp');
    applyBackdrop();
  };

  const pump = () => {
    if (Math.abs(state.amp - state.target) > 0.004) {
      state.amp += (state.target - state.amp) * 0.16;
      state.raf = requestAnimationFrame(pump);
    } else {
      state.amp = state.target;
      state.raf = 0;
    }
    if (state.amper) {
      const a = state.amp * state.bA;
      state.amper.setAttribute('k2', a.toFixed(3));
      state.amper.setAttribute('k3', (1 - a).toFixed(3));
    }
  };
  const kick = () => {
    if (!state.raf) state.raf = requestAnimationFrame(pump);
  };

  // Pointer lens. Repositioning is two attribute writes — no map regeneration.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onMove = (e) => {
    if (reduced) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - BLOB / 2).toFixed(1);
    const y = (e.clientY - r.top - BLOB / 2).toFixed(1);
    if (state.blob) {
      state.blob.setAttribute('x', x);
      state.blob.setAttribute('y', y);
    }
    // The frosted sheen (L4) rides the same event.
    el.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    state.target = 1;
    kick();
  };
  const onLeave = () => {
    state.target = 0;
    kick();
  };

  rebuild();
  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', onLeave, { passive: true });

  const ro = new ResizeObserver(rebuild);
  ro.observe(el);

  return () => {
    ro.disconnect();
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    if (state.raf) cancelAnimationFrame(state.raf);
    if (state.node?.parentNode) state.node.parentNode.removeChild(state.node);
    el.style.backdropFilter = '';
    el.style.webkitBackdropFilter = '';
  };
}
