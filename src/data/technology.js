import mavenDevice from '../assets/maven/device.webp';
/**
 * Mega-panel thumbnails, separate from `hero`.
 *
 * `hero` is the PAGE's opening image and stays what it is. The nav panel had
 * been reading `hero` too, which meant the Technology dropdown showed the same
 * three pictures as the Products dropdown — the D1 frame photograph appeared in
 * both, and NaviNetics AI, which is software, was illustrated with a mechanical
 * microdrive.
 *
 * These are figures rather than product photography, which is the distinction
 * the two panels are meant to draw: Products shows the object you buy,
 * Technology shows how it works.
 *
 * DRAWN, not photographed. `mark` names one of the glyphs in ui/TechMark.jsx.
 *
 * Photography was tried twice here and failed both times. The slot is 64 × 56
 * CSS px — about 3,600 pixels. The full science figures became a brown blob, a
 * white box with a smudge, and a field of noise; cropping them (see
 * tools/crop-icons.mjs, kept for reference) helped and was still not good
 * enough. Nothing photographic survives that size. A mark drawn for it does.
 */
import { asset } from '../lib/asset.js';

/**
 * The technology platforms.
 *
 * Technology explains HOW things work; Products is WHAT you can buy. They are
 * deliberately different jobs, so these pages stay at platform level and hand
 * off rather than restating:
 *   · deep science      → rendered into this page, see `teaches`
 *   · evidence          → /resources/publications
 *   · the actual device → the linked product
 *
 * One record yields a detail page at /technology/:slug and an entry in the
 * Technology nav panel.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 * Drawn from NaviNetics' existing public site and publications. No accuracy
 * figures, performance numbers or availability claims have been invented.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ASSET NOTE — the four fabricated device images that used to sit in public/
 * were deleted on 2026-08-03. See the note in data/media.js for what they were
 * and why. Use photography of actual devices, or renders derived from our own
 * CAD — see tools/d1-frame.mjs.
 */

export const technologies = [
  {
    slug: 'stereotactic-devices',
    path: '/technology/stereotactic-devices',
    name: 'Stereotactic Devices',
    eyebrow: 'Technology — Stereotaxy',
    tagline: 'Reaching one point\nfrom any angle.',
    summary:
      'Arc-centered targeting: three linear degrees of freedom place a target at the focus of an arc, and two rotations set the trajectory to it.',
    hero: asset('/DSC05397-1024x695.jpg'),
    // An arc and the one point every approach along it reaches.
    mark: 'stereotaxy',
    heroAlt: 'The NaviNetics stereotactic frame assembly',
    principles: [
      {
        title: 'A coordinate system fixed to the patient',
        body: 'Fixation to the skull establishes a three-dimensional coordinate system, providing the link between imaging data and patient anatomy. That link is what turns a point on a scan into a point in a person.',
      },
      {
        title: 'Three linear axes, two rotations',
        // "Collar", not "ring" — the review retired ring terminology, and the
        // education and software pages already say collar. A surgeon dialling
        // coordinates needs one word for the axis across the whole site.
        body: 'X, Y and Z place the target at the focus — the iso-center — of the arc. Collar and arc angles then set the approach trajectory to it. Because every trajectory passes through the same focus, one set of coordinates serves every approach to the target.',
      },
      {
        title: 'Localizers tie it to the image',
        body: 'MR and CT localizers, and X-ray reticles, register the imaging volume to the frame so that a planned coordinate and a delivered coordinate are the same thing.',
      },
    ],
    /* The tables came off this list. It renders as "the devices this technology
       is built into", and arc-centered stereotactic targeting is not built into
       a table — the tables are radiolucent, which is a different technology
       serving the same procedure. A stereotactic surgeon reads the claim as
       either sloppiness or overreach, and it is the one factual error a
       specialist is guaranteed to catch. */
    appliedIn: ['d1-stereotactic-frame'],
    /* Education topics rendered INTO this page — see pages/Technology.jsx.
       `stereotaxy` covers localization, the arc-centered principle and the six
       numbers, which is exactly what this platform is, and it did it better
       than the three principles above ever did. The other four topics are
       neurochemistry and belong to /technology/neuromodulation. */
    teaches: ['stereotaxy'],
    readMore: [
      { label: 'Published accuracy and validation work', to: '/resources/publications' },
    ],
  },

  {
    slug: 'neuromodulation',
    path: '/technology/neuromodulation',
    name: 'Neuromodulation',
    eyebrow: 'Technology — Neuromodulation',
    tagline: 'Measuring what\nstimulation changes.',
    summary:
      'Recording neurochemical and electrophysiological activity during stimulation, so the effect of deep brain stimulation can be observed rather than inferred.',
    /* The MAVEN unit's own artwork. This replaced a journal figure that was
       standing in as a product shot — see the note in data/products.js. */
    hero: mavenDevice,
    // The triangular FSCV sweep, and the response it draws out.
    mark: 'neuro',
    heroAlt: 'The MAVEN system',
    /**
     * This slug does NOT use the Technology template. It has its own route and
     * page (pages/Neuromodulation.jsx), because the template is three
     * principles beside a photograph and the subject is an arc of published
     * work that wants figures and room. Its content is data/neuromodulation.js.
     *
     * What that page still reads from here: `eyebrow`, `tagline`, `summary`
     * for the hero, and `readMore`. `hero`, `heroAlt` and `principles` are not
     * rendered anywhere at the moment — kept because they describe the
     * platform correctly and the template may want them again, not because
     * something is using them.
     */
    principles: [
      {
        title: 'Chemistry, measured electrically',
        body: 'Neurotransmitters are detected by their oxidation and reduction at an electrode surface. Fast-scan cyclic voltammetry sweeps the electrode potential and reads the resulting current; the shape of that response identifies the analyte.',
      },
      {
        title: 'Absolute concentration',
        body: 'Multiple cyclic square wave voltammetry measures absolute concentration in the extracellular space rather than only phasic change — which matters if you want to compare across sessions or subjects.',
      },
      {
        title: 'Synchronized with stimulation',
        body: 'Measurement and stimulation channels are independent but synchronized, so stimulation artifact is minimized at the point of integration instead of being filtered out afterwards.',
      },
    ],
    appliedIn: ['maven-neuromodulation'],
    /* Four of the five education topics land here: what deep brain stimulation
       is, how a neurochemical is detected at all, and the two recording methods
       — phasic and absolute — that the papers on this page introduced. Rendered
       by pages/Neuromodulation.jsx, which has its own layout rather than the
       template. */
    teaches: ['dbs', 'neurochemical', 'phasic', 'absolute'],
    readMore: [
      { label: 'Voltammetry method papers', to: '/resources/publications' },
    ],
  },

  {
    slug: 'navinetics-ai',
    path: '/technology/navinetics-ai',
    name: 'NaviNetics AI',
    eyebrow: 'Technology — Software',
    tagline: 'Software for\nplanning and targeting.',
    /* This described the research programme rather than the thing you can
       look at. It is the subtitle in the Technology nav panel and the hero
       lead on the page, so it should say what the software does; the
       published landmark-localization work is still cited on the page. */
    summary:
      'A desktop workstation for stereotactic planning: CT and MR fusion, automatic frame '
      + 'registration, targeting and tractography in one application.',
    hero: asset('/microdrive-image-1024x797.png'),
    /* Alt text is read aloud by a screen reader and shown if the image fails.
       It was "Placeholder image — NaviNetics AI visuals pending", which
       announces our content backlog to the one visitor who cannot see the
       picture. It describes the photograph instead; that the artwork is a
       stand-in is an internal fact and lives in the note below. */
    heroAlt: 'A mechanical microdrive for advancing electrodes along a planned trajectory',
    // Four planning panes with one target running through them.
    mark: 'ai',
    /**
     * IN DEVELOPMENT — copy pending from NaviNetics.
     *
     * This slug does NOT use the Technology template. It has its own route and
     * page (pages/NaviNeticsAI.jsx) because its hero is the software itself: a
     * simulation of the planning workspace, running on a generated head.
     *
     * The one concrete statement here — published work on automated landmark
     * localization for neuronavigation — is verifiable. Nothing is claimed
     * about availability, regulatory status, or performance.
     */
    status: 'in-development',
    /*
     * Body copy is now written, derived from the application repository
     * itself (navinetics-ai-suite: the master application guide, the
     * requirements set, and the named modules). It still wants a read-through
     * by someone who can approve it as a public statement — which is what
     * the first item below now asks for.
     */
    needsContent: [
      'Sign-off on the body copy, which is currently derived from the application repository',
      'Whether it is a product, a platform, or research',
      'An approved classification, intended-use and intended-user statement',
      'Sign-off on the two performance figures held back: the ±1 mm placement tolerance and the OR benchmark',
      'A defaced surface render, to replace the synthetic head in the demo',
      'Confirmation of the frame origin offset used by the demo',
    ],
    principles: [],
    appliedIn: [],
    readMore: [{ label: 'Published research', to: '/resources/publications' }],
  },
];

export const getTechnology = (slug) => technologies.find((t) => t.slug === slug);
export const isTechPlaceholder = (t) => t?.status === 'in-development';
