import d1Head from '../assets/d1/head.webp';
import mavenDevice from '../assets/maven/device.webp';
import mavenDetail from '../assets/maven/detail.webp';
import tableShot from '../assets/or-tables/table.webp';
import { asset } from '../lib/asset.js';

/**
 * The product catalog.
 *
 * One record yields: a card in the catalog grid, a detail page at
 * /products/:slug, an entry in the Products nav mega-panel, and a column in the
 * comparison grid. Adding a product means adding a record here — no new
 * components, no new routes.
 *
 * `technology` links a product to the platform page that explains its science,
 * so Products (what you buy) and Technology (how it works) cross-reference
 * without duplicating each other.
 *
 * `status: 'in-development'` renders the ComingSoon treatment instead of the
 * full detail template, so an unfinished product can appear in the catalog
 * without fabricating specifications for it.
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
    slug: 'd1-stereotactic-frame',
    path: '/products/d1-stereotactic-frame',
    /**
     * The full name carries both generations. navinetics.com sells this as the
     * "NaviNetics Frame System"; D1 appears nowhere there. Merging the two —
     * rather than renaming outright and footnoting the old name — keeps the
     * product findable for anyone who knows it already, and is how the rest of
     * the field does it (Medtronic Stealth Autoguide, Leksell Vantage
     * Stereotactic System).
     *
     * This replaced a separate "Also known as the NaviNetics Frame System"
     * line on the page. Once the name itself carries the continuity that line
     * is redundant, and an aka footnote on a product page reads as though the
     * product were renamed to get away from something.
     */
    name: 'NaviNetics Reusable Stereotactic System (NRSS)',
    shortName: 'NRSS',
    family: 'NaviNetics Reusable Stereotactic System (NRSS)',
    /* NRSS is the name, confirmed by NaviNetics — the open question recorded
       here is now closed. It used to read "NaviNetics D1 Stereotactic Frame
       System", and the note said the NRSS name from Goerss's biography was
       deliberately not used because the bio describes a "prototype version"
       and the name might have belonged to an earlier generation.

       "D1" survives as the slug, the route, the page component and the asset
       folder, so no link or import moves; it is simply not what the product is
       called on screen any more. Still no `aka` — the full name is the name. */
    /**
     * REGULATORY STATUS.
     *
     * Taken verbatim in substance from navinetics.com's own Frame System page:
     * "NaviNetics has developed an FDA cleared system…". This is not a new
     * claim — it is the claim the company already publishes, restored to the
     * page that replaces theirs. It had been left off, which made this site
     * less informative than the one it supersedes on the first question a
     * hospital value-analysis committee asks.
     *
     * STILL WANTED, and the reason `number` is null rather than absent: the
     * 510(k) number and the clearance date. A bare "FDA cleared" is weaker
     * than it needs to be, and the number is public record once NaviNetics
     * confirms which one it is. Nothing else — CE, UKCA, TGA, NMPA — is stated
     * anywhere by the company, so nothing else is stated here.
     */
    regulatory: {
      /**
       * WITHHELD FROM THE SITE ON NAVINETICS' INSTRUCTION, 2026-08-13.
       *
       * `published: false` is what hides it. The record is kept intact rather
       * than deleted because this is the second time it has moved, and the
       * history matters:
       *
       *   · The rebuild originally stated nothing. documentation/.../01-audit
       *     logged that as a high-severity gap.
       *   · PR #3 RESTORED it, on the reasoning that navinetics.com publishes
       *     "an FDA cleared system" today and matching an existing public
       *     statement is not inventing one. See PR-TICKET.md.
       *   · NaviNetics has now asked for it off the site again.
       *
       * So the live company site and this site currently disagree, and that is
       * a deliberate company decision rather than an oversight. Flipping
       * `published` back to true restores the chip, the spec row and the meta
       * description in one edit — nothing else has to change.
       *
       * The statement below is navinetics.com's own wording, kept verbatim so
       * that restoring it does not mean rewriting it.
       */
      published: false,
      status: 'FDA 510(k) cleared',
      market: null,
      number: null,
      /* Two things came out of this sentence. "FDA cleared" is withheld by
         decision, and it survived here because this field feeds the generic
         product template, which no route currently reaches — so the rendered-copy
         audit could not see it. A withheld claim sitting in data is still a
         withheld claim; the moment that template gets a route it publishes
         itself. And "reduce the burden" framed the product by what is wrong
         with the alternative rather than by what it does. */
      statement:
        'The coordinate system is set at the surgical field, from a single key fixed to the skull.',
    },
    tag: { label: 'Flagship', tone: 'action' },
    technology: 'stereotactic-devices',
    /* "Radically comfortable" — the adverb went because it is the one word in
       the line making a claim rather than stating a property, and the other two
       sentences are flat by design. Comfort itself stays: it is the point of
       fixing to an anchor key instead of encircling the head. */
    tagline: 'Robust. Low complexity.\nComfortable.',
    summary:
      'Arc-centered targeting from the Skull Anchor Key. Three linear degrees of freedom, two angles of rotation.',
    /* THE OPENING CLAUSE WAS THE MOST EXPOSED SENTENCE ON THE SITE.
       It read: "Stereotactic neurosurgical procedures are constrained by the
       costs and limitations of commercially available stereotactic devices."
       That is a disparaging comparative claim about every competing device on
       the market — asserting they are expensive and limited — made without
       naming one and with no substantiation held anywhere. A manufacturer is
       expected to be able to support that, and we cannot.
       What replaces it says what this device is, which needs no comparison. */
    intro:
      'The brief was a device robust enough for daily use and simple enough to trust, working '
      + 'across stereotactic and functional procedures — deep brain stimulation among them. It was '
      + 'written with the surgeons who would use it, and around the patient who would wear it.',
    hero: d1Head,
    heroAlt: 'The NRSS fitted to an anatomical head model, held clear of the face',
    heroTone: 'bay',
    metrics: [
      { label: 'Degrees of freedom', value: '3 + 2', unit: 'linear + rotational' },
      { label: 'Localizers', value: 'MR · CT', unit: 'plus X-ray reticles' },
      { label: 'Fixation', value: 'Anchor key', unit: 'fixed to the skull' },
    ],
    /** Scroll-pinned narrative. Capped at three steps by the template. */
    sequence: [
      {
        title: 'Skull Anchor Key',
        body: "The Skull Anchor Key is fixed to the patient's skull.",
      },
      {
        title: 'Patient Comfort',
        // "more comfortable" is a comparative without a comparator. What the
        // patient actually experiences is stated instead.
        body: 'The face stays open, so an awake patient can be spoken with and watched throughout the procedure.',
      },
      {
        title: 'Total Flexibility',
        // "unprecedented space to work" was a comparative claim against every
        // competing system, unnamed and unsubstantiated. What replaces it is
        // the thing that is actually true and specific: nothing encircles the
        // head, so the face and the field stay clear.
        body: 'Components attach to the key and come off it. The face stays clear and the team keeps the field.',
      },
    ],
    detail: {
      title: 'The Stereotactic Frame',
      image: asset('/DSC05397-1024x695.jpg'),
      imageAlt: 'The NaviNetics stereotactic frame assembly',
      fit: 'cover',
      paragraphs: [
        'Classified as an arc centered stereotactic device, it provides three linear degrees of freedom (X, Y and Z axes) for target positioning, with two angles of rotation to optimize approach trajectory.',
        'The compact design places all adjustments in close proximity to the surgical field, so the coordinate system is established from where the surgeon is already standing.',
      ],
    },
    specs: [
      { k: 'Classification', v: 'Arc-centered' },
      { k: 'Linear degrees of freedom', v: '3 — X, Y, Z' },
      { k: 'Angular rotations', v: '2 — collar, arc' },
      { k: 'Patient fixation', v: 'Skull Anchor Key' },
      { k: 'Imaging localizers', v: 'MR · CT · X-ray' },
      { k: 'Reusable', v: 'Yes' },
      /* No regulatory row — withheld on instruction, see `regulatory` above. */
    ],
    /** Enumerated set the reader traverses completely — numbering is meaningful. */
    highlights: [
      // "in place of a base frame" was both a comparison and the retired frame
      // terminology, surviving inside a highlight nobody re-read.
      'Improved patient experience: the Skull Anchor Key is all the patient wears.',
      'Surgeon ease-of-use & workflow of frame-based systems with compact frameless size.',
      'Intuitive, accessible targeting adjustment of device.',
      'Device size and range optimized for accelerating DBS workflow.',
      'Excellent burr hole access and sterile field integrity throughout procedure.',
      'DBS-optimized and Frame accuracy verification accessories provided.',
    ],
    /**
     * The "System Components" list from navinetics.com, verbatim.
     *
     * That page carries TWO lists and they are not the same thing:
     *
     *   · a prose sentence naming seven FUNCTIONAL parts — "a stereotactic
     *     head frame, the skull anchor key, an MR localizer, a CT Localizer,
     *     X-ray reticles, a mechanical microdrive, and DBS lead implantation
     *     accessories". That sentence is used in the page copy.
     *   · a "System Components" list of nine KITS, below. This is the bill of
     *     materials — what is actually ordered and shipped — which is what
     *     this field feeds and what the "what the frame comes with" section is.
     *
     * They were briefly merged into one twelve-item list here, which produced
     * near-duplicates ("MR Localizer" beside "MR Localizer Kit"). Kept
     * separate now.
     *
     * OPEN QUESTION FOR NAVINETICS: X-ray reticles, the mechanical microdrive
     * and the DBS lead implantation accessories are named in the prose but do
     * NOT appear in the System Components list. Do they ship as standard, or
     * are they ordered separately? The page does not say, so neither does this.
     */
    components: [
      'Frame Kit',
      'MR Localizer Kit',
      'CT Localizer Kit',
      'Key Sterilization Tray',
      'Frame Sterilization Tray',
      'Skull Anchor Key Kit',
      'Ground Truth Fixture Kit',
      'Key Placement Guide (KPG)',
      'Screw Kits',
    ],
    gallery: [
      { src: asset('/model-head-clean-750x998-1-451x600.png'), caption: 'The Skull Anchor Key on a head model', fit: 'contain' },
      { src: asset('/DSC05397-1024x695.jpg'), caption: 'The stereotactic frame', fit: 'cover' },
      { src: asset('/microdrive-image-1024x797.png'), caption: 'The mechanical microdrive', fit: 'contain' },
    ],
  },

  {
    slug: 'carbon-fiber-surgical-tables',
    path: '/products/carbon-fiber-surgical-tables',
    name: 'Carbon Fiber Surgical Tables',
    shortName: 'Surgical Tables',
    family: 'Carbon Fiber Surgical Tables',
    tag: { label: 'Range', tone: 'line' },
    technology: 'stereotactic-devices',
    /**
     * No longer `status: 'in-development'`. That flag drove the ComingSoon
     * treatment and the "In development" badge, and both became wrong when the
     * brochure arrived: /products/carbon-fiber-surgical-tables now has its own
     * page with five models specified in full. Removing it also moves this
     * record into `shipping` in pages/WhoWeAre.jsx, which is why that section
     * counts three lines of work rather than two.
     */
    tagline: 'Radiolucent by design.',
    summary:
      'Carbon fiber tabletops and supports for imaging-guided procedures, where the table itself must stay out of the image.',
    /**
     * PLACEHOLDER — content pending from NaviNetics.
     * Deliberately no dimensions, load ratings, radiolucency figures or
     * compatibility claims: all of those are regulated and none have been
     * supplied. The page renders the ComingSoon treatment until they are.
     */
    metrics: [
      { label: 'Models specified', value: '5', unit: 'one to six motions' },
      { label: 'Load capacity', value: '230', unit: 'kg, every model' },
      { label: 'Table top', value: 'Carbon fiber', unit: 'always in the beam' },
    ],
    intro:
      'Imaging-guided procedures are only as good as what the imaging can see through. Carbon fiber construction keeps the support structure radiolucent, so the anatomy and the instrument stay visible rather than the table.',
    hero: tableShot,
    heroAlt: 'A carbon-fiber operating table',
    heroTone: 'bay',
    /* Four of the five gaps were closed by the brochure — photography,
       dimensions, load ratings and the range itself. These two are still not
       stated in any document NaviNetics has supplied, and the page says so
       rather than leaving the list to imply they are settled. */
    needsContent: [
      'Radiolucency characteristics — no attenuation figure is published',
      'Imaging-system compatibility',
      'Regulatory status',
    ],
  },

  {
    slug: 'maven-neuromodulation',
    path: '/products/maven-neuromodulation',
    /* MAVEN, not "Maven" — see the note below on the product name. These three
       fields are the ones the catalog, the nav and the page heading read, and
       they were the last place on the site still setting it in title case. */
    name: 'MAVEN Neuromodulation',
    shortName: 'MAVEN',
    family: 'MAVEN Neuromodulation',
    /**
     * NO `aka` HERE, deliberately.
     *
     * WINCS — the Wireless Instantaneous Neurotransmitter Concentration
     * Sensing System on navinetics.com and in the published papers — is an
     * EARLIER GENERATION, confirmed by NaviNetics. It is not another name for
     * MAVEN, and listing it as one would tell a researcher that the papers
     * describe this instrument when they describe its predecessor.
     *
     * The note at data/maven.js:61 already said the lineage is a sentence
     * NaviNetics should supply rather than one to infer. It was inferred here
     * anyway and removed. If the relationship is worth stating, it needs their
     * words: which generation, what changed, and which papers apply to which.
     */
    /**
     * NOT A CLEARED DEVICE, and the company says so in its own words:
     * navinetics.com describes this work as "Preclinical research for
     * understanding brain mechanisms" and makes no regulatory or human-use
     * claim about it anywhere.
     *
     * Stated here because the page otherwise presents MAVEN with the same
     * weight as the D1 — a cleared surgical instrument — and a reader has no
     * way to tell the two apart. This is the company's existing framing, not
     * an added claim.
     */
    /**
     * NO `regulatory` RECORD — pending an answer from NaviNetics.
     *
     * A statement was written here reading "not a cleared medical device and
     * not for use in human subjects" and it was withdrawn. The no-human-use
     * half was invented: navinetics.com describes the neurochemical sensing
     * work as enabling "both research development in preclinical studies and
     * human recordings", which may contradict it outright.
     *
     * OPEN QUESTION FOR NAVINETICS: is MAVEN used in human recordings, and
     * under what authorization — IDE, IRB, research use only? The answer
     * decides what belongs on this page, and until it arrives the page says
     * only what the company already says: that this is preclinical research.
     */
    tag: { label: 'Research', tone: 'line' },
    technology: 'neuromodulation',
    tagline: 'Measuring the living brain,\nwhile you stimulate it.',
    /* "A pre-clinical research device" leads, and it has to.
       ────────────────────────────────────────────────────────────────────
       This one string is the MAVEN card on the home page, the MAVEN entry in
       Three Lines of Work on /company/who-we-are, and the catalogue tile. On
       all three it sat beside the NRSS and the operating tables with nothing
       to distinguish it, so a surgeon met MAVEN as a fourth thing they could
       buy for theatre. The qualifier existed — but only in the last section of
       MAVEN's own page, which is three clicks and eight screens too late.

       Stated first rather than appended, because a reader who stops after one
       clause should still have the important half. */
    summary:
      'A pre-clinical research device: synchronized neurochemical and electrophysiological recording with stimulation, engineered to minimize stimulation artifact.',
    /**
     * MAVEN is the product name — confirmed by NaviNetics. The copy below used
     * to be written around "the WINCS Harmoni Device" throughout; it now names
     * MAVEN, which is what the artwork, the summary slide and the deck all
     * call it. If the lineage between the two is worth stating on the page,
     * that is a sentence NaviNetics should supply rather than one to infer.
     *
     * The bespoke page at /products/maven-neuromodulation reads only `name`,
     * `shortName`, `tagline` and the catalog fields from this record. The
     * rest — sequence, detail, specs, highlights, components, gallery — is not
     * rendered anywhere at the moment. It is kept because it describes a real
     * product and may come back, not because something is using it.
     */
    intro:
      'Improving the efficacy of deep brain stimulation (DBS) by studying the role of neurochemical and electrophysiological biomarkers.',
    /* The unit's own artwork, cut out. This replaces /WINC-Harmoni-Device.png,
       which is a four-panel journal figure — device dimensions, a software
       block diagram, a chip die and a calibration curve — and was standing in
       as product photography here, on the neuromodulation technology page and
       in this record's gallery. It is still in public/ and still listed in
       data/media.js; whether it should be is a permissions question. */
    hero: mavenDevice,
    heroAlt: 'The MAVEN system',
    heroTone: 'bay',
    metrics: [
      { label: 'Measures', value: 'Chem + Ephys', unit: 'synchronized' },
      { label: 'Telemetry', value: 'Wireless', unit: 'real-time' },
      { label: 'Targets', value: 'DA · 5-HT', unit: 'and adenosine' },
    ],
    sequence: [
      {
        title: 'Synchronized',
        body: 'Independent but synchronized neurochemical and electrophysiological measurements alongside stimulation.',
      },
      {
        title: 'Artifact-Free',
        body: 'The integration minimizes the impact of stimulation artifact on the measurement, ensuring pure, uncompromised recorded data.',
      },
      {
        title: 'Wireless',
        body: 'Wireless control and telemetry provide a seamless real-time platform for identifying and characterizing potential biomarkers.',
      },
    ],
    detail: {
      title: 'Preclinical Research',
      image: asset('/WINCS-Swine-Model-1024x668.png'),
      imageAlt: 'MAVEN applied in a preclinical model',
      fit: 'cover',
      paragraphs: [
        'MAVEN can be used to quantify neuronal electrical activity and neurochemical levels such as dopamine, serotonin, and adenosine. By analyzing multimodal recordings, it addresses a critical gap in understanding normal and pathologic neurophysiology.',
        'With wireless control and telemetry, MAVEN provides a seamless real-time platform for identifying and characterizing potential biomarkers.',
      ],
    },
    specs: [
      { k: 'Modality', v: 'Neurochemical + electrophysiological' },
      { k: 'Technique', v: 'FSCV · MCSWV' },
      { k: 'Telemetry', v: 'Wireless' },
      { k: 'Stimulation', v: 'Synchronized, artifact-minimized' },
      { k: 'Analytes', v: 'Dopamine, serotonin, adenosine' },
      { k: 'Use', v: 'Preclinical research' },
    ],
    highlights: [
      'Independent but synchronized measurement and stimulation channels.',
      'Stimulation artifact minimized at the point of integration.',
      'Quantifies neuronal electrical activity alongside neurochemical levels.',
      'Wireless control and telemetry for real-time preclinical work.',
      'Supports both fast-scan cyclic and multiple cyclic square wave voltammetry.',
      'Addresses a critical gap in understanding normal and pathologic neurophysiology.',
    ],
    components: [
      'MAVEN Base Unit',
      'Carbon-Fiber Microelectrodes',
      'Reference Electrode',
      'Wireless Telemetry Module',
      'Stimulation Channel',
      'Acquisition Software',
    ],
    gallery: [
      { src: mavenDevice, caption: 'The MAVEN system', fit: 'contain' },
      { src: mavenDetail, caption: 'The MAVEN front panel', fit: 'contain' },
    ],
  },
];

export const getProduct = (slug) => products.find((p) => p.slug === slug);
export const isPlaceholder = (p) => p?.status === 'in-development';
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
  columns: ['NRSS', 'Traditional frame-based', 'Frameless'],
  rows: [
    { k: 'Patient fixation', v: ['Skull Anchor Key', 'Rigid head fixation', 'Bone fiducials / mask'] },
    { k: 'Facial obstruction', v: ['None', 'Significant', 'Minimal'] },
    { k: 'Targeting principle', v: ['Arc-centered', 'Arc-centered', 'Trajectory guide'] },
    { k: 'Adjustment location', v: ['At surgical field', 'At the frame', 'Varies'] },
  ],
};
