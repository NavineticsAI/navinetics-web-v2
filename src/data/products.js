/**
 * The product catalogue.
 *
 * One record yields: a card in the catalogue grid, a detail page at
 * /what-we-do/:slug, an entry in the "What We Do" nav mega-panel, and a column
 * in the comparison grid. Adding a product means adding a record here — no new
 * components, no new routes.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 * Every value below is paraphrased from NaviNetics' existing public site.
 * No accuracy figures, setup times, or comparative performance numbers have
 * been invented — those are regulated marketing claims and must come from
 * NaviNetics with regulatory review before they ship. Fields marked
 * `needsReview: true` render with an internal-only affordance in dev.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const products = [
  {
    slug: 'navinetics-frame-system',
    path: '/what-we-do/navinetics-frame-system',
    name: 'NaviNetics Frame System',
    shortName: 'Frame System',
    family: 'Reusable Stereotactic System',
    tag: { label: 'Flagship', tone: 'action' },
    tagline: 'Robust. Low complexity.\nRadically comfortable.',
    summary:
      'Arc-centred targeting with a skull anchor key in place of a base ring. Three linear degrees of freedom, two angles of rotation.',
    intro:
      'Stereotactic neurosurgical procedures are constrained by the costs and limitations of commercially available stereotactic devices. Our challenge was to develop a robust, low complexity stereotactic device that could be used for multiple stereotactic and functional neurosurgical applications including deep brain stimulation (DBS).',
    hero: '/model-head-clean-750x998-1-451x600.png',
    heroAlt: 'The NaviNetics skull anchor key fitted to an anatomical head model',
    metrics: [
      { label: 'Degrees of freedom', value: '3 + 2', unit: 'linear + rotational' },
      { label: 'Localisers', value: 'MR · CT', unit: 'plus X-ray reticles' },
      { label: 'Fixation', value: 'Anchor key', unit: 'percutaneous screws' },
    ],
    /** Scroll-pinned narrative. Capped at three steps by the template. */
    sequence: [
      {
        title: 'Anchor Key',
        body: "In place of the typical head ring of frame-based systems, a small anchor key is affixed to the patient's skull with percutaneous screws.",
      },
      {
        title: 'Patient Comfort',
        body: 'Designed to be more comfortable for the patient and keeps the facial area completely free from obstruction during awake procedures.',
      },
      {
        title: 'Total Flexibility',
        body: 'Components can be seamlessly attached and removed from the anchor key, giving the surgical team unprecedented space to work.',
      },
    ],
    detail: {
      title: 'The Stereotactic Frame',
      image: '/DSC05397-1024x695.jpg',
      imageAlt: 'The NaviNetics stereotactic frame assembly',
      fit: 'cover',
      paragraphs: [
        'Classified as an arc centered stereotactic device, it provides three linear degrees of freedom (X, Y and Z axes) for target positioning, with two angles of rotation to optimize approach trajectory.',
        'The compact design places all adjustments in close proximity to the surgical field, improving surgeon experience and reducing the burden of establishing the coordinate system.',
      ],
    },
    specs: [
      { k: 'Classification', v: 'Arc-centred' },
      { k: 'Linear degrees of freedom', v: '3 — X, Y, Z' },
      { k: 'Angular rotations', v: '2 — ring, arc' },
      { k: 'Patient fixation', v: 'Skull anchor key' },
      { k: 'Imaging localisers', v: 'MR · CT · X-ray' },
      { k: 'Reusable', v: 'Yes' },
    ],
    /** Enumerated set the reader traverses completely — numbering is meaningful. */
    highlights: [
      'Improved patient experience with Skull Anchor Key in place of a base frame.',
      'Surgeon ease-of-use & workflow of frame-based systems with compact frameless size.',
      'Intuitive, accessible targeting adjustment of device.',
      'Device size and range optimized for accelerating DBS workflow.',
      'Excellent burr hole access and sterile field integrity throughout procedure.',
      'DBS-optimized and Frame accuracy verification accessories provided.',
    ],
    components: [
      'Stereotactic Head Frame',
      'Skull Anchor Key',
      'MR Localizer',
      'CT Localizer',
      'X-ray Reticles',
      'Mechanical Microdrive',
      'DBS Lead Implantation Accessories',
    ],
    gallery: [
      { src: '/model-head-clean-750x998-1-451x600.png', caption: 'Anchor key on model', fit: 'contain' },
      { src: '/DSC05397-1024x695.jpg', caption: 'Stereotactic frame', fit: 'cover' },
      { src: '/microdrive-image-1024x797.png', caption: 'Mechanical microdrive', fit: 'contain' },
      { src: '/stereotactic_halo.png', caption: 'Frame assembly', fit: 'contain' },
    ],
  },

  {
    slug: 'neuromodulation',
    path: '/what-we-do/neuromodulation',
    name: 'NaviNetics NeuroModulation',
    shortName: 'Neuromodulation',
    family: 'WINCS Harmoni',
    tag: { label: 'Research', tone: 'line' },
    tagline: 'Measuring the living brain,\nwhile you stimulate it.',
    summary:
      'Synchronised neurochemical and electrophysiological recording with stimulation, engineered to minimise stimulation artefact.',
    intro:
      'Improving the efficacy of deep brain stimulation (DBS) by studying the role of neurochemical and electrophysiological biomarkers with the WINCS Harmoni Device.',
    hero: '/WINC-Harmoni-Device.png',
    heroAlt: 'The WINCS Harmoni device',
    metrics: [
      { label: 'Measures', value: 'Chem + Ephys', unit: 'synchronised' },
      { label: 'Telemetry', value: 'Wireless', unit: 'real-time' },
      { label: 'Targets', value: 'DA · 5-HT', unit: 'and adenosine' },
    ],
    sequence: [
      {
        title: 'Synchronised',
        body: 'Independent but synchronised neurochemical and electrophysiological measurements alongside stimulation.',
      },
      {
        title: 'Artefact-Free',
        body: 'The integration minimises the impact of stimulation artefact on the measurement, ensuring pure, uncompromised recorded data.',
      },
      {
        title: 'Wireless',
        body: 'Wireless control and telemetry provide a seamless real-time platform for identifying and characterising potential biomarkers.',
      },
    ],
    detail: {
      title: 'Preclinical Research',
      image: '/WINCS-Swine-Model-1024x668.png',
      imageAlt: 'WINCS applied in a preclinical model',
      fit: 'cover',
      paragraphs: [
        'WINCS can be used to quantify neuronal electrical activity and neurochemical levels such as dopamine, serotonin, and adenosine. By analyzing multimodal recordings, it addresses a critical gap in understanding normal and pathologic neurophysiology.',
        'With wireless control and telemetry, WINCS provides a seamless real-time platform for identifying and characterizing potential biomarkers.',
      ],
    },
    specs: [
      { k: 'Modality', v: 'Neurochemical + electrophysiological' },
      { k: 'Technique', v: 'FSCV · MCSWV' },
      { k: 'Telemetry', v: 'Wireless' },
      { k: 'Stimulation', v: 'Synchronised, artefact-minimised' },
      { k: 'Analytes', v: 'Dopamine, serotonin, adenosine' },
      { k: 'Use', v: 'Preclinical research' },
    ],
    highlights: [
      'Independent but synchronised measurement and stimulation channels.',
      'Stimulation artefact minimised at the point of integration.',
      'Quantifies neuronal electrical activity alongside neurochemical levels.',
      'Wireless control and telemetry for real-time preclinical work.',
      'Supports both fast-scan cyclic and multiple cyclic square wave voltammetry.',
      'Addresses a critical gap in understanding normal and pathologic neurophysiology.',
    ],
    components: [
      'WINCS Harmoni Base Unit',
      'Carbon-Fibre Microelectrodes',
      'Reference Electrode',
      'Wireless Telemetry Module',
      'Stimulation Channel',
      'Acquisition Software',
    ],
    gallery: [
      { src: '/WINC-Harmoni-Device.png', caption: 'WINCS Harmoni device', fit: 'contain' },
      { src: '/WINCS-Swine-Model-1024x668.png', caption: 'Preclinical application', fit: 'cover' },
      { src: '/surgical_probe.png', caption: 'Sensing probe', fit: 'contain' },
    ],
  },
];

export const getProduct = (slug) => products.find((p) => p.slug === slug);
export const otherProducts = (slug) => products.filter((p) => p.slug !== slug);

/**
 * Comparison grid.
 *
 * NOT APPROVED COPY. Rows are paraphrased from the existing public site to
 * demonstrate the component. Comparative claims about competing devices are
 * regulated; these need NaviNetics sign-off and regulatory review before the
 * comparison is surfaced publicly. `published: false` keeps it out of the site
 * until that happens.
 */
export const comparison = {
  published: false,
  needsReview: true,
  columns: ['NaviNetics Frame System', 'Traditional frame-based', 'Frameless'],
  rows: [
    { k: 'Patient fixation', v: ['Skull anchor key', 'Full base head ring', 'Bone fiducials / mask'] },
    { k: 'Facial obstruction', v: ['None', 'Significant', 'Minimal'] },
    { k: 'Targeting principle', v: ['Arc-centred', 'Arc-centred', 'Trajectory guide'] },
    { k: 'Adjustment location', v: ['At surgical field', 'At base ring', 'Varies'] },
  ],
};
