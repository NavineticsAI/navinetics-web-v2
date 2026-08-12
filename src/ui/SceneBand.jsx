import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../lib/motion.js';
import { Eyebrow, Reveal } from './Section.jsx';
import * as SCENES from '../lib/featureScenes.js';

import fusionShot from '../assets/software/fusion.webp';
import nbarShot from '../assets/software/nbar.webp';
import acpcShot from '../assets/software/acpc.webp';
import dti2Shot from '../assets/software/dti2.webp';

const BUILDERS = {
  fusion: SCENES.makeFusion,
  nbar: SCENES.makeNbar,
  targeting: SCENES.makeTargeting,
  dti: SCENES.makeDti,
};

/**
 * A dark feature band with a generated motion background behind it.
 *
 * The scene is canvas, sized to its element and driven by one rAF loop that
 * only runs while the band is on screen — four of these animating off-screen
 * at once is pure waste. Under reduced motion the scene is drawn once, as a
 * composed still, rather than removed: the band would look broken empty.
 */
export function SceneBand({ scene, tint, eyebrow, title, lead, points = [], meta = [], image }) {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;

    const ctx = cv.getContext('2d');
    const draw = BUILDERS[scene]();
    let w = 0;
    let h = 0;
    let visible = false;
    let raf = 0;
    let start = null;

    const size = () => {
      // These are out-of-focus backgrounds behind text, drawn with additive
      // hairlines. Rendering them at full device ratio on a dense display
      // costs a great deal of fill for a difference nobody can see.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* These scenes drift; none of them has anything moving fast enough to
       need 60fps, and halving the rate leaves the main thread free for the
       scroll. Capped rather than throttled so the phase stays even. */
    const MIN_MS = 1000 / 30;
    let painted = 0;

    const frame = (now) => {
      if (start === null) start = now;
      if (visible && w > 4 && now - painted >= MIN_MS) {
        painted = now;
        draw(ctx, w, h, (now - start) / 1000);
      }
      raf = requestAnimationFrame(frame);
    };

    size();
    if (reduced) {
      // One composed frame, picked well into the cycle so nothing is mid-build.
      draw(ctx, w, h, 6.2);
    } else {
      raf = requestAnimationFrame(frame);
    }

    // No margin: the bands are tall, and a generous one leaves two of them
    // animating at every boundary for no visible gain.
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);

    const onResize = () => {
      size();
      if (reduced) draw(ctx, w, h, 6.2);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [scene, reduced]);

  return (
    <section
      /* The GROUND is full-bleed — the canvas and the gradient below are
         inset-0 and always will be. The CONTENT is not: it sits in the same
         max-w-7xl frame as every other section, so a product page built out of
         these bands lines up with the rest of the site instead of running to
         both edges. The gutter is the site gutter; the old asymmetric
         lg:pl-8 lg:pr-5 existed to push the screenshot toward the right edge,
         which is what made the misalignment read as deliberate. */
      className="relative overflow-hidden bg-nn-950 px-6 py-16 text-nn-50 md:py-20 lg:px-8 lg:py-24"
      style={{ '--tint': tint }}
    >
      {/* Height is capped, not `inset-0`.
          When the layout stacks, this section grows past 2500px and a canvas
          spanning it repaints four megapixels every frame — which is what made
          the page stutter on a scaled display, and would have been worse on a
          phone. On a desktop band the cap is above the natural height, so
          nothing changes there. */}
      {/* The canvas is held to the SAME max-w-7xl frame as the copy below it.
          It used to span the band full-bleed, which put every scene's
          bottom-right readout — "AC-PC DISTANCE 19.8 mm" and the rest — out in
          the page margin, past the right edge of the screenshot it annotates
          and level with nothing. It read as a stray number.

          Inside the frame it lands under the screenshot's right edge, which is
          the thing it belongs to. The scenes are unchanged; only where they
          are allowed to draw is. */}
      <canvas
        ref={canvasRef}
        className="nn-frame absolute inset-x-0 top-1/2 mx-auto h-full max-h-[880px] w-full -translate-y-1/2"
        aria-hidden="true"
      />

      {/* Holds the copy readable over whatever the scene is doing, and lifts
          off through the middle so the animation reads between the two
          columns rather than only behind them. */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(96deg,rgb(4 20 29/.94) 0%,rgb(4 20 29/.84) 32%,'
            + 'rgb(4 20 29/.2) 52%,rgb(4 20 29/.34) 100%)',
        }}
      />

      {/* text | animation | image. The middle column is deliberately empty —
          it is the window the scene shows through, and it is sized as
          generously as the copy and the screenshot will allow. */}
      <div className="nn-frame relative mx-auto grid items-center gap-12 lg:grid-cols-[minmax(0,30%)_minmax(150px,1fr)_minmax(0,48%)] lg:gap-10">
        <div className="max-w-[min(52ch,100%)]">
          <Eyebrow style={{ color: 'var(--tint)' }}>{eyebrow}</Eyebrow>
          <h2 className="mt-4 whitespace-pre-line text-d1 !tracking-[-0.04em]">{title}</h2>
          {lead && (
            <p className="mt-5 text-lead leading-[1.6] tracking-[-0.015em] text-nn-200">{lead}</p>
          )}

          {points.length > 0 && (
            <ul className="mt-7 grid list-none gap-3.5 p-0">
              {points.map((p) => (
                <li key={p.label} className="flex gap-3 text-[0.925rem] leading-relaxed text-nn-200">
                  <i
                    className="mt-[0.5em] block h-1.5 w-1.5 shrink-0 rounded-full not-italic"
                    style={{ background: 'var(--tint)' }}
                    aria-hidden="true"
                  />
                  <span>
                    <b className="font-semibold text-nn-50">{p.label}</b> {p.body}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {meta.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
              {meta.map((m) => (
                <span key={m.label}>
                  {m.label} <b className="font-semibold" style={{ color: 'var(--tint)' }}>{m.value}</b>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* the animation's window */}
        <div aria-hidden="true" className="hidden lg:block" />

        {image && (
          <Reveal>
            {/* Pulled into the section's right padding: every pixel the image
                gives back on the left is animation you can actually see. */}
            <figure className="m-0 lg:-mr-3">
              {/* Intrinsic size is declared so the browser reserves the right
                  space before a lazy image decodes. Without it these collapse
                  to zero height and the band jumps as you scroll into it. */}
              <img
                src={image.src}
                alt={image.alt}
                width={image.w}
                height={image.h}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full rounded-xl border border-nn-300/25 shadow-e3"
              />
              <figcaption className="mt-3 font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
                {image.caption}
              </figcaption>
            </figure>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/** Every band on the page, in the order the work is actually done. */
export const FEATURE_BANDS = [
  {
    scene: 'fusion',
    tint: '#e8a838',
    eyebrow: 'Multimodal fusion',
    title: 'Into the same\ncoordinate\nspace.',
    lead: 'The stereotactic CT carries the frame. The MR carries the anatomy you are actually '
      + 'aiming at. Fusion puts them in the same coordinate space, so a target picked on the MR '
      + 'means something to the frame.',
    points: [
      { label: 'Reference and moving.', body: 'The CT stays fixed; the MR is brought onto it, so frame geometry is never disturbed by the alignment.' },
      { label: 'Agreement is measured.', body: 'Edge agreement is reported per plane, and both surfaces can be reviewed together in 3D before anything is planned.' },
      { label: 'Any series.', body: 'T1, T2, FGATIR, GAD and post-operative studies register into the same space.' },
    ],
    meta: [
      { label: 'Reference', value: 'CT · Stereo' },
      { label: 'Moving', value: 'MR · GAD' },
      { label: 'Review', value: 'Axial · Coronal · Sagittal' },
    ],
    image: {
      src: fusionShot, w: 2400, h: 1316,
      alt: 'Fusion verification: CT and MR reviewed together, with edge agreement reported per plane.',
      caption: 'Fusion verification',
    },
  },
  {
    scene: 'nbar',
    tint: '#4ade80',
    eyebrow: 'Stereotactic registration',
    title: 'The frame,\nfound in\nthe scan.',
    lead: 'A localiser carries rods in an N: two upright, one diagonal. Every image plane cutting '
      + 'a plate meets all three, and where the middle point falls between the outer two tells you '
      + 'exactly how high that slice sits.',
    points: [
      { label: 'Three points per plate, every slice.', body: 'Across the stack that is hundreds of fiducials, not a handful — detected automatically.' },
      { label: 'Geometry does the work.', body: 'The middle point’s position is a direct measurement, so the transform is solved rather than guessed at.' },
      { label: 'Checked before it is trusted.', body: 'Detected points are drawn on the volume so the fit can be inspected.' },
    ],
    meta: [
      { label: 'Per slice', value: '3 × 3' },
      { label: 'Across the stack', value: 'Hundreds' },
    ],
    image: {
      src: nbarShot, w: 1399, h: 1124,
      alt: 'The localiser box with detected fiducials strung along every rod.',
      caption: 'N-BAR detection',
    },
  },
  {
    scene: 'targeting',
    tint: '#7cc4f0',
    eyebrow: 'Targeting',
    title: 'Indirect,\nthen exact.',
    lead: 'Deep structures are often invisible on the scan you have. Indirect targeting solves '
      + 'that by measuring from landmarks that are visible: the anterior and posterior commissures. '
      + 'Take the line between them, put the origin at its midpoint, and a target becomes an offset '
      + 'in that frame.',
    points: [
      { label: 'AC–PC as the reference.', body: 'The coordinate frame rotates onto the commissural line, so offsets mean the same thing between patients.' },
      { label: 'Then the track.', body: 'Entry, target, collar and arc — with the probe’s-eye view rebuilt along the trajectory.' },
      { label: 'More than one plan.', body: 'Multiple trajectories per case, compared side by side, with clearance checked along each.' },
    ],
    meta: [
      { label: 'Frames', value: 'Stereo · AC–PC' },
      { label: 'Per case', value: 'Multiple plans' },
    ],
    image: {
      src: acpcShot, w: 2400, h: 907,
      alt: 'Coronal, sagittal and axial views with the anterior and posterior commissures and the mid-commissural point marked.',
      caption: 'AC–PC landmarks',
    },
  },
  {
    scene: 'dti',
    tint: '#5ee7a0',
    eyebrow: 'Diffusion tractography',
    // Breaks are explicit: the copy column is deliberately narrow so the
    // animation has somewhere to be seen, and left to wrap these strand a
    // single word on the last line.
    title: 'Or target\nthe tract\nitself.',
    lead: 'Where a formula gives you a coordinate, diffusion gives you the structure. Water moves '
      + 'further along a fibre than across it; tracking that anisotropy from a seed region '
      + 'reconstructs the bundles running through the target, so it can be aimed at directly '
      + 'rather than derived.',
    points: [
      { label: 'Seed, include, exclude.', body: 'Regions are drawn by hand, taken from an atlas, or loaded from a preset.' },
      { label: 'Coloured by direction.', body: 'Red runs left–right, green front–back, blue up–down — and bundles that curve blend between them, so orientation is readable at a glance.' },
      { label: 'Carried into the plan.', body: 'Reconstructed tracts appear on the orthogonal views alongside entry, target and track.' },
    ],
    meta: [
      { label: 'Background', value: 'Anatomy · FA · DEC' },
      { label: 'Regions', value: 'Manual · Atlas · Preset' },
    ],
    image: {
      src: dti2Shot, w: 2126, h: 1137,
      alt: 'Reconstructed tracts shown on the planning views alongside the trajectory.',
      caption: 'Tractography in the surgical plan',
    },
  },
];
