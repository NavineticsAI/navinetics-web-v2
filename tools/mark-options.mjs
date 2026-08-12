/**
 * Contact sheet for the Technology mega-panel marks.
 *
 *   node tools/mark-options.mjs
 *
 * Renders five candidates per entry at the REAL slot size (64 × 56) beside a
 * 3× enlargement, on both grounds. Real size is the only size that matters —
 * everything looks good at 3× — so the small column is the one to judge.
 *
 * Writes tools/.shots/mark-options.png.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { webkit } from 'playwright';

const DIR = new URL('./.shots/', import.meta.url).pathname.replace(/^\//, '');
mkdirSync(DIR, { recursive: true });

/* ── the candidates ────────────────────────────────────────────────────────
   viewBox 0 0 64 60 throughout, so they drop straight into TechMark.jsx.
   One stroke weight; fill only on the point being marked.                  */
const SETS = [
  {
    group: 'Stereotactic Devices',
    subtitle: 'arc-centred targeting · skull anchor · 3 linear + 2 rotational',
    items: [
      { id: 'S1', name: 'Arc and focus',
        why: 'The arc, a probe down it, the point it reaches. Current mark.',
        art: `<path d="M10 40a22 22 0 0 1 44 0"/><path d="M32 18v22"/>
              <circle cx="32" cy="40" r="7"/><circle cx="32" cy="40" r="2" fill="currentColor" stroke="none"/>
              <path d="M32 47v5M25 40h-5M44 40h5" opacity=".55"/>` },
      { id: 'S2', name: 'Target, entered obliquely',
        why: 'Concentric target with one angled approach. Reads as aiming.',
        art: `<circle cx="34" cy="34" r="15"/><circle cx="34" cy="34" r="8"/>
              <circle cx="34" cy="34" r="2.5" fill="currentColor" stroke="none"/>
              <path d="M9 9 27 27"/><path d="M34 12v-6M34 56v6M12 34H6M56 34h6" opacity=".5"/>` },
      { id: 'S3', name: 'Every approach, one point',
        why: 'Three trajectories converging. The literal claim the page makes.',
        art: `<path d="M8 12 32 42M32 6v36M56 12 32 42"/>
              <circle cx="32" cy="42" r="6"/><circle cx="32" cy="42" r="2" fill="currentColor" stroke="none"/>
              <path d="M14 50h36" opacity=".45"/>` },
      { id: 'S4', name: 'The N-localiser',
        why: 'Two uprights and a diagonal — the actual geometry that turns an image into coordinates.',
        art: `<path d="M13 12v36M51 12v36M13 12 51 48"/>
              <circle cx="32" cy="30" r="2.5" fill="currentColor" stroke="none"/>
              <path d="M6 30h52" opacity=".4" stroke-dasharray="3 3"/>` },
      { id: 'S5', name: 'Two rotations',
        why: 'Collar ring and arc crossing at the focus. Says 3+2 degrees of freedom.',
        art: `<ellipse cx="32" cy="34" rx="22" ry="8"/>
              <path d="M12 38a20 20 0 0 1 40 0"/>
              <circle cx="32" cy="34" r="2.5" fill="currentColor" stroke="none"/>
              <path d="M32 12v10" opacity=".55"/>` },
    ],
  },
  {
    group: 'Neuromodulation',
    subtitle: 'FSCV · recording during stimulation · chemistry + electrophysiology',
    items: [
      { id: 'N1', name: 'Sweep and response',
        why: 'The triangular potential ramp and the current it draws out. Current mark.',
        art: `<path d="M6 22h8l9-13 9 26 9-13h9"/>
              <path d="M6 46h9c4 0 5-11 9-11s5 11 9 11h20" opacity=".55"/>
              <circle cx="32" cy="35" r="2" fill="currentColor" stroke="none"/>` },
      { id: 'N2', name: 'Electrode and analyte',
        why: 'A tapered fibre with molecules arriving at the tip. The measurement, physically.',
        art: `<path d="M28 6v18l4 6 4-6V6"/><path d="M32 30v4"/>
              <path d="M20 42a13 13 0 0 1 24 0" opacity=".5"/>
              <path d="M14 50a19 19 0 0 1 36 0" opacity=".3"/>
              <circle cx="18" cy="34" r="2" fill="currentColor" stroke="none"/>
              <circle cx="47" cy="30" r="2" fill="currentColor" stroke="none"/>
              <circle cx="38" cy="46" r="2" fill="currentColor" stroke="none"/>` },
      { id: 'N3', name: 'Two channels, one clock',
        why: 'Spikes above, chemistry below, on a shared timebase. The whole point of the instrument.',
        art: `<path d="M6 22h5l2-9 3 14 3-9 2 4h5l3-7 3 7h25" />
              <path d="M6 46h10c5 0 5-13 10-13s6 13 11 13h21" opacity=".55"/>
              <path d="M26 8v46" opacity=".4" stroke-dasharray="3 3"/>` },
      { id: 'N4', name: 'Deliver, then watch',
        why: 'A stimulus pulse and the transient that follows it. Cause and effect in one line.',
        art: `<path d="M6 44h10v-22h7v22h6"/>
              <path d="M29 44c6 0 5-24 12-24s6 24 17 24" opacity=".7"/>
              <path d="M6 52h52" opacity=".35"/>` },
      { id: 'N5', name: 'The voltammogram',
        why: 'The colour-map field with its hotspot, abstracted to strokes.',
        art: `<rect x="8" y="14" width="48" height="32" rx="2"/>
              <path d="M8 24h48M8 34h48" opacity=".35"/>
              <ellipse cx="26" cy="34" rx="7" ry="5" fill="currentColor" stroke="none" opacity=".85"/>
              <path d="M26 46v6" opacity=".5"/>` },
    ],
  },
  {
    group: 'NaviNetics AI',
    subtitle: 'planning · CT/MR fusion · tractography · landmark localisation',
    items: [
      { id: 'A1', name: 'Four panes',
        why: 'The planning workspace: orthogonal views with one target through them. Current mark.',
        art: `<rect x="7" y="11" width="22" height="17" rx="2"/><rect x="35" y="11" width="22" height="17" rx="2"/>
              <rect x="7" y="32" width="22" height="17" rx="2"/><rect x="35" y="32" width="22" height="17" rx="2"/>
              <path d="M18 5v50M2 30h60" opacity=".45"/>
              <circle cx="18" cy="30" r="3.5"/><circle cx="18" cy="30" r="1.5" fill="currentColor" stroke="none"/>` },
      { id: 'A2', name: 'Fusion',
        why: 'Two studies converging into alignment — one dashed, one solid. Registration, drawn.',
        art: `<path d="M20 14a18 18 0 1 0 0 32" />
              <path d="M44 14a18 18 0 1 1 0 32" stroke-dasharray="4 3" opacity=".7"/>
              <path d="M32 8v44" opacity=".35"/>
              <path d="M26 30h12M32 24v12" opacity=".8"/>` },
      { id: 'A3', name: 'Tractography',
        why: 'Bundles running through a target. What the software adds that a coordinate cannot.',
        art: `<path d="M6 44c12-4 18-22 30-26M10 50c14-2 20-20 34-24M16 54c14 0 20-18 34-22" opacity=".8"/>
              <circle cx="34" cy="34" r="6"/><circle cx="34" cy="34" r="2" fill="currentColor" stroke="none"/>` },
      { id: 'A4', name: 'Target in the head',
        why: 'A cranial outline with a trajectory to a point inside. The clearest at a glance.',
        art: `<path d="M46 46a19 19 0 1 0-28-3l-3 8h7v6"/>
              <path d="M18 8 31 30" opacity=".8"/>
              <circle cx="33" cy="32" r="5"/><circle cx="33" cy="32" r="1.8" fill="currentColor" stroke="none"/>` },
      { id: 'A5', name: 'AC-PC',
        why: 'The commissural line, its midpoint, and a target offset from it. Indirect targeting.',
        art: `<path d="M12 36h40"/>
              <circle cx="12" cy="36" r="2.5" fill="currentColor" stroke="none"/>
              <circle cx="52" cy="36" r="2.5" fill="currentColor" stroke="none"/>
              <path d="M32 30v12" opacity=".7"/>
              <path d="M32 36 42 22" stroke-dasharray="3 2" opacity=".7"/>
              <circle cx="42" cy="22" r="4"/><circle cx="42" cy="22" r="1.5" fill="currentColor" stroke="none"/>` },
    ],
  },
];

const slot = (art, dark) => `
  <span style="display:grid;place-items:center;width:64px;height:56px;border-radius:3px;
    border:1px solid ${dark ? '#173b4e' : '#e4edf1'};background:${dark ? '#020c12' : '#eef4f7'};
    color:${dark ? '#82bad9' : '#1f6890'}">
    <svg viewBox="0 0 64 60" width="40" height="38" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${art}</svg>
  </span>`

const big = (art, dark) => `
  <span style="display:grid;place-items:center;width:150px;height:132px;border-radius:6px;
    border:1px solid ${dark ? '#173b4e' : '#e4edf1'};background:${dark ? '#020c12' : '#eef4f7'};
    color:${dark ? '#82bad9' : '#1f6890'}">
    <svg viewBox="0 0 64 60" width="120" height="112" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${art}</svg>
  </span>`

const html = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#f4f7f9;font:14px/1.5 -apple-system,Segoe UI,sans-serif;color:#0b2b3c;padding:28px 32px">
${SETS.map((s) => `
  <h2 style="margin:26px 0 2px;font-size:19px;letter-spacing:-.02em">${s.group}</h2>
  <p style="margin:0 0 14px;color:#5b7382;font-size:12.5px">${s.subtitle}</p>
  <table style="border-collapse:collapse;width:100%">
    ${s.items.map((it) => `
      <tr style="border-top:1px solid #dde7ec">
        <td style="padding:12px 14px 12px 0;vertical-align:middle;width:44px">
          <b style="font:600 13px ui-monospace,monospace;color:#1f6890">${it.id}</b>
        </td>
        <td style="padding:12px 14px 12px 0;vertical-align:middle">${big(it.art, false)}</td>
        <td style="padding:12px 14px 12px 0;vertical-align:middle">${big(it.art, true)}</td>
        <td style="padding:12px 20px 12px 0;vertical-align:middle">${slot(it.art, false)}</td>
        <td style="padding:12px 20px 12px 0;vertical-align:middle">${slot(it.art, true)}</td>
        <td style="padding:12px 0;vertical-align:middle">
          <div style="font-weight:600;margin-bottom:2px">${it.name}</div>
          <div style="color:#5b7382;font-size:12.5px;max-width:34ch">${it.why}</div>
        </td>
      </tr>`).join('')}
  </table>`).join('')}
<p style="margin-top:24px;color:#5b7382;font-size:12px">
  Columns: 3× light · 3× dark · <b>actual size light</b> · <b>actual size dark</b>.
  Judge the two small ones — that is the size the panel renders.
</p>
</body>`

const browser = await webkit.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 800 }, deviceScaleFactor: 2 });
await page.setContent(html);
await page.waitForTimeout(400);
writeFileSync(`${DIR}mark-options.png`, await page.screenshot({ fullPage: true }));
console.log('tools/.shots/mark-options.png');
await browser.close();
process.exit(0);
