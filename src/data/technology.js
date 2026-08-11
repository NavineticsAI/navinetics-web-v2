import mavenDevice from '../assets/maven/device.webp';
import { asset } from '../lib/asset.js';

/**
 * The technology platforms.
 *
 * Technology explains HOW things work; Products is WHAT you can buy. They are
 * deliberately different jobs, so these pages stay at platform level and hand
 * off rather than restating:
 *   · deep science      → /resources/education
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
      'Arc-centred targeting: three linear degrees of freedom place a target at the focus of an arc, and two rotations set the trajectory to it.',
    hero: asset('/DSC05397-1024x695.jpg'),
    heroAlt: 'The NaviNetics stereotactic frame assembly',
    principles: [
      {
        title: 'A coordinate system fixed to the patient',
        body: 'Fixation to the skull establishes a three-dimensional coordinate system, providing the link between imaging data and patient anatomy. Without that link there is no way to translate a point on a scan into a point in a person.',
      },
      {
        title: 'Three linear axes, two rotations',
        body: 'X, Y and Z place the target at the focus — the iso-centre — of the arc. Ring and arc angles then set the approach trajectory to it. Because every trajectory passes through the same focus, the target can be approached from many directions without recomputing it.',
      },
      {
        title: 'Localisers tie it to the image',
        body: 'MR and CT localisers, and X-ray reticles, register the imaging volume to the frame so that a planned coordinate and a delivered coordinate are the same thing.',
      },
    ],
    appliedIn: ['d1-stereotactic-frame', 'carbon-fiber-surgical-tables'],
    readMore: [
      { label: 'Stereotactic neurosurgery, explained', to: '/resources/education#stereotaxy' },
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
        title: 'Synchronised with stimulation',
        body: 'Measurement and stimulation channels are independent but synchronised, so stimulation artefact is minimised at the point of integration instead of being filtered out afterwards.',
      },
    ],
    appliedIn: ['maven-neuromodulation'],
    readMore: [
      { label: 'Neurochemical detection, explained', to: '/resources/education#neurochemical' },
      { label: 'Voltammetry method papers', to: '/resources/publications' },
    ],
  },

  {
    slug: 'navinetics-ai',
    path: '/technology/navinetics-ai',
    name: 'NaviNetics AI',
    eyebrow: 'Technology — Software',
    tagline: 'Software for\nplanning and targeting.',
    summary:
      'Software work applying machine learning to neuronavigation — including automated landmark localisation, a method the team has already published.',
    hero: asset('/microdrive-image-1024x797.png'),
    /* Alt text is read aloud by a screen reader and shown if the image fails.
       It was "Placeholder image — NaviNetics AI visuals pending", which
       announces our content backlog to the one visitor who cannot see the
       picture. It describes the photograph instead; that the artwork is a
       stand-in is an internal fact and lives in the note below. */
    heroAlt: 'A mechanical microdrive for advancing electrodes along a planned trajectory',
    /**
     * IN DEVELOPMENT — copy pending from NaviNetics.
     *
     * This slug does NOT use the Technology template. It has its own route and
     * page (pages/NaviNeticsAI.jsx) because its hero is the software itself: a
     * simulation of the planning workspace, running on a generated head.
     *
     * The one concrete statement here — published work on automated landmark
     * localisation for neuronavigation — is verifiable. Nothing is claimed
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
