import { hero, FRAME } from '../data/d1.js';

/**
 * The D1 opening: the instrument, and what it is.
 *
 * No scroll behaviour at all. This page went through a rasterised turntable,
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
 * an anodised blue measured off NaviNetics' own photographs. No geometry goes
 * over the wire and no WebGL is needed.
 *
 * NOTHING IS LABELLED, deliberately — see the notice in data/d1.js.
 */
export function D1Hero() {
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
            alt="The D1 stereotactic frame: an anodised blue arc-centred head frame with two curved
              rails, a targeting stage, and a bare-steel mechanical microdrive rising from its
              centre."
            /* Sized by HEIGHT once there is a column to stand in. The render is
               tall and narrow, so capping its width instead puts the wheels
               through the bottom of a laptop viewport. */
            className="mx-auto block h-auto w-full max-w-[15rem] sm:max-w-[18rem]
              lg:h-[68svh] lg:w-auto lg:max-w-none xl:h-[74svh]"
          />
        </div>

        <div className="flex flex-col gap-4">
          <span className="eyebrow text-sg-300">Products — D1 Stereotactic Frame</span>
          <h1 className="whitespace-pre-line text-d1">
            {'Robust. Low complexity.\nRadically comfortable.'}
          </h1>
          <p className="max-w-prose text-lead leading-[1.55] text-nn-200">
            Arc-centred targeting with a skull anchor key in place of a base ring. Three linear
            degrees of freedom, two angles of rotation.
          </p>
        </div>
      </div>
    </header>
  );
}
