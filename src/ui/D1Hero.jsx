import { hero, FRAME } from '../data/d1.js';
import { getProduct } from '../data/products.js';

/**
 * The D1 opening: the instrument, and what it is.
 *
 * No scroll behavior at all. This page went through a rasterized turntable,
 * a traced turntable, and a translate-and-scale arrival, and every one of them
 * put something between the reader and the picture. What is left is the
 * picture: correct at first paint, sharp before anyone touches the wheel, and
 * costing one image.
 *
 * That also means no rAF loop, no scroll listener, no sticky layer and no
 * canvas — the hero is an <img> in a grid, so it is pixel-exact rather than
 * resampled, and it is as cheap as a hero can be.
 *
 * WHAT IS BEING DRAWN. Not a model — a picture of one. tools/d1-frame.mjs
 * tessellates the assembly CAD to 1.7M triangles and ray traces it: real
 * occlusion from a cosine-weighted hemisphere per pixel, GGX reflections, and
 * an anodized blue measured off NaviNetics' own photographs. No geometry goes
 * over the wire and no WebGL is needed.
 *
 * NOTHING IS LABELED, deliberately — see the notice in data/d1.js.
 */
export function D1Hero() {
  const reg = getProduct('d1-stereotactic-frame')?.regulatory;

  return (
    <header className="relative overflow-hidden bg-[var(--mv-bay)] text-nn-50">
      <div
        className="mx-auto flex min-h-[100svh] max-w-[110rem] flex-col justify-center gap-10
          px-6 pb-16 pt-28 lg:grid lg:grid-cols-[minmax(0,48%)_minmax(0,1fr)] lg:items-center
          lg:gap-8 lg:px-10 lg:pb-20 lg:pt-24"
      >
        {/* Source order puts the instrument first so it is fetched first; on a
            wide screen it belongs on the right, which is what `order` does. */}
        <div className="order-first lg:order-last lg:justify-self-center">
          <img
            src={hero}
            width={FRAME.w}
            height={FRAME.h}
            /* This image IS the largest contentful paint. It must not be lazy
               and nothing about it should be deferred. */
            fetchPriority="high"
            decoding="async"
            alt="The D1 stereotactic frame: an anodized blue arc-centered head frame with two curved
              rails, a targeting stage, and a bare-steel mechanical microdrive rising from its
              center."
            /* Sized by HEIGHT once there is a column to stand in. The render is
               tall and narrow, so capping its width instead puts the wheels
               through the bottom of a laptop viewport. */
            className="mx-auto block h-auto w-full max-w-[15rem] sm:max-w-[18rem]
              lg:h-[68svh] lg:w-auto lg:max-w-none xl:h-[74svh]"
          />
        </div>

        <div className="flex flex-col gap-4">
          <span className="eyebrow text-sg-300">
            Products — NaviNetics Reusable Stereotactic System (NRSS)
          </span>
          <h1 className="whitespace-pre-line text-d1">
            {/* Matches data/products.js — see the note there on why the adverb went. */}
            {'Robust. Low complexity.\nComfortable.'}
          </h1>
          <p className="max-w-prose text-lead leading-[1.55] text-nn-200">
            Arc-centered targeting from the Skull Anchor Key. Three linear degrees of freedom, two
            angles of rotation.
          </p>

          {/*
            REGULATORY STATUS, ABOVE THE FOLD.
            ─────────────────────────────────────────────────────────────────
            Whether a device is cleared decides whether a surgeon can use it,
            so it is not fine print and it does not go at the bottom of the
            page. It is the second thing a clinical reader needs after what
            the device is.

            HOW IT IS PRESENTED, and why it looks like this rather than like a
            badge. 21 CFR 807.97: clearance "does not in any way denote
            official approval", and any representation creating an impression
            of official approval is misbranding. A tick, a shield, a seal or
            an agency logo creates exactly that impression. A typographic
            status line does not — it reads as a specification, which is what
            it is.

            "CLEARED", never "APPROVED". 510(k) clearance is not PMA approval,
            and describing a cleared device as FDA approved is among the most
            commonly cited promotional violations. The word is load-bearing.

            The 510(k) number renders as soon as it is filled in at
            data/products.js — `regulatory.number` is null until NaviNetics
            confirms it. A number is materially stronger than a bare claim: it
            is checkable in the FDA database.
          */}
          {reg?.published && reg.status && (
            /* Not uppercase-transformed, unlike the rest of the site's data
               idiom: 510(k) takes a lowercase k, and rendering it 510(K) is
               the kind of detail a regulatory reader reads as carelessness. */
            <p className="mt-1 inline-flex w-fit items-baseline gap-2 rounded-sm border border-sg-300/35
              bg-sg-300/10 px-3 py-2 font-data text-[0.75rem] tracking-[0.04em] text-sg-300">
              <span className="font-semibold">{reg.status}</span>
              {reg.number && <span className="text-nn-200/70">· {reg.number}</span>}
              {reg.market && <span className="text-nn-200/70">· {reg.market}</span>}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
