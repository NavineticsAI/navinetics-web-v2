import device from '../assets/maven/device.webp';
import detail from '../assets/maven/detail.webp';
import figWaveform from '../assets/maven/fig-waveform.webp';
import figFscv from '../assets/maven/fig-fscv.webp';
/* fig-field.webp is no longer imported: the only band that showed it was
   'Every sweep is kept.', withdrawn 2026-10-21. The file stays in
   assets/maven/ so restoring that band is one paste. */

/**
 * The MAVEN system.
 *
 * Structure and copy are read off src/assets/maven/info.pptx — NaviNetics'
 * own deck — and src/assets/maven/info.png, its summary slide. The four
 * domains are that slide's four quadrants and the channels are the circles it
 * hangs off them.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 *
 * THE DECK IS AN INVESTOR DECK AND SEVERAL SLIDES ARE STAMPED CONFIDENTIAL.
 * It is a source, not a script. What is on this page is the part that explains
 * how the instrument works, written at the level of disclosure the existing
 * site already uses. What is deliberately NOT here, all of it in the deck:
 *
 *   · Market sizing, patents, funding and investment. Investor material.
 *   · Every drug study — cocaine, methamphetamine, alcohol, oxycodone,
 *     fentanyl, nicotine — and every trace, figure and video from them.
 *     Unpublished animal work, and results are not marketing copy.
 *   · "No FDA-cleared device combining neurochemical and electrophysiological
 *     recording", "used in humans", the physiologic exemption letter. Every
 *     one of those is a regulatory claim and needs review before it appears.
 *   · Named indications — Parkinson's, epilepsy, depression, Tourette's,
 *     addiction — which the deck ties to specific neurotransmitters. The
 *     existing site never names a disease, and that calibration is kept.
 *   · The implantable stimulator concept and its render. A product that does
 *     not exist yet, shown as though it does.
 *   · The surgical photography and the animal imaging.
 *   · The base-unit render stamped "© 2014 MFMER · Mayo Clinic" — third-party
 *     artwork, not NaviNetics'.
 *
 * TWO FIGURES NEED A PERMISSIONS ANSWER. `fig-waveform` and `fig-fscv` look
 * like figures from published papers. Journals usually hold copyright on those
 * even when the authors are your own people. tools/maven-art.mjs prints both
 * on every run. The other two are drawn in the deck itself.
 *
 * NO NUMBER ON THIS PAGE IS A SPECIFICATION. There is no scan rate, no
 * channel count, no detection limit and no electrode dimension in any copy
 * here. Where a figure carries its own annotation, that is the figure's, and
 * it is not restated as a claim.
 *
 * RESOLVED: MAVEN IS THE PRODUCT NAME — confirmed by NaviNetics. The record in
 * data/products.js was written around "the WINCS Harmoni Device" throughout
 * and now names MAVEN. Two consequences worth knowing:
 *
 *   · /WINC-Harmoni-Device.png is a four-panel journal figure — device
 *     dimensions, a software block diagram, a chip die and a calibration curve
 *     — and it was standing in as product photography on the catalog card,
 *     the neuromodulation technology page and in this product's gallery. All
 *     three now use the unit's own artwork. The file is still in public/ and
 *     still listed in data/media.js; whether it should be is a permissions
 *     question, not a naming one.
 *   · If the lineage between MAVEN and WINCS Harmoni is worth stating on the
 *     page, that is a sentence NaviNetics should supply rather than one to
 *     infer from a deck.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const art = {
  device,
  deviceAlt: 'The MAVEN system — a benchtop unit with two indicator windows and a touch panel',
  /**
   * The unit alone, cut out of the black it was rendered on and capped at 620
   * wide — see tools/maven-art.mjs. The ring reads this to size the image by
   * its HEIGHT, so a future render with a different aspect fits without
   * anything else changing.
   */
  deviceNative: { w: 620, h: 869 },
  detail,
  detailAlt: 'The front panel of the MAVEN system, showing the touch controls and the badge',
};

/** What the name stands for. Slide 8 of the deck. */
export const expansion = [
  ['M', 'ultifunctional '],
  ['A', 'pparatus for '],
  ['V', 'oltammetry, '],
  ['E', 'lectrophysiology and '],
  ['N', 'euromodulation'],
];

/**
 * The four domains, as arcs.
 *
 * `a0`/`a1` are degrees from twelve o'clock, clockwise, separated by an even
 * 18°. Spans follow how many channels each domain carries — which is why the
 * left of the ring is dense and its foot is nearly empty; that asymmetry is
 * the instrument's, not the layout's — with one floor on top of it: an arc has
 * to be long enough to have its own name set along it. Neuromodulation carries
 * a single channel and would be 30°, and NEUROMODULATION needs 45° of engraved
 * ring at this size, so it gets 50 and Neurochemistry gives up the 20.
 */
export const domains = [
  {
    id: 'chem',
    name: 'Neurochemistry',
    tone: 'chem',
    a0: -122,
    a1: 0,
    line: 'What the electrode reads out of the tissue.',
  },
  {
    id: 'ephys',
    name: 'Electrophysiology',
    tone: 'ephys',
    a0: 18,
    a1: 76,
    line: 'What the same tip hears in the tissue.',
  },
  {
    id: 'soft',
    name: 'Software & analysis',
    tone: 'soft',
    a0: 94,
    a1: 152,
    line: 'What turns two recordings into one record.',
  },
  {
    id: 'stim',
    name: 'Neuromodulation',
    tone: 'stim',
    a0: 170,
    a1: 220,
    line: 'The stimulation the other three answer.',
  },
];

/**
 * The channels, at their angles.
 *
 * `short` is what the ring shows; `name` is what a list says. Where the slide
 * uses the abbreviation and the product record uses the word, the ring takes
 * the word — a diagram that needs a glossary is not a diagram.
 *
 * THE ABBREVIATIONS ARE GONE. Each chemical channel used to carry a `sub` —
 * DA under Dopamine, 5-HT under Serotonin, LFP under Local field potential —
 * set small and grey beneath the word on the ring. Withdrawn on NaviNetics'
 * instruction 2026-10-21: the ring already names the thing in full, and a
 * second, shorter name beneath it is the glossary the note above says a
 * diagram should not need. The render in ui/MavenHero.jsx went with them.
 */
export const channels = [
  { id: 'da', domain: 'chem', deg: -8, short: 'Dopamine', name: 'Dopamine' },
  { id: '5ht', domain: 'chem', deg: -33.5, short: 'Serotonin', name: 'Serotonin' },
  { id: 'ado', domain: 'chem', deg: -59, short: 'Adenosine', name: 'Adenosine' },
  /* Glutamate and acetylcholine were named individually and are now folded
     into one "Other" channel on NaviNetics' instruction. Two slots become one,
     so this takes the midpoint of the angles they used to hold.

     `short` was "Other", which on a ring of named chemicals reads as a
     leftovers bin rather than as a channel. It now says what it is. */
  { id: 'other', domain: 'chem', deg: -97, short: 'Other neurochemicals', name: 'Other neurochemicals' },
  { id: 'lfp', domain: 'ephys', deg: 32, short: 'LFP', name: 'Local field potential' },
  { id: 'unit', domain: 'ephys', deg: 62, short: 'Single-unit', name: 'Single-unit activity' },
  { id: 'gui', domain: 'soft', deg: 108, short: 'Intuitive GUI', name: 'One interface for every channel' },
  { id: 'adv', domain: 'soft', deg: 138, short: 'Advanced analysis', name: 'Advanced analysis' },
  { id: 'stim', domain: 'stim', deg: 195, short: 'Electrical stimulation', name: 'Electrical stimulation' },
];

/** The three techniques, which are modes rather than channels. */
export const modes = ['FSCV', 'MCSWV', 'Amperometry'];

/**
 * One band per domain, in the order the work happens: read the chemistry, hear
 * the electricity, stimulate, then make a record of all three.
 *
 * `ground` alternates. Four bays in a row is a tunnel, and the two light bands
 * are where the page comes up for air — they follow the site theme, and their
 * scenes are redrawn in ink rather than the same colors turned down. Which
 * two is not arbitrary: electrophysiology is a line on paper and the analysis
 * is a plot, and both are things you would print.
 *
 * Each figure illustrates its own band rather than being the nearest available
 * picture. The FSCV plate sits under Neuromodulation because the stimulus mark
 * is drawn beneath its color plot — it is a picture of stimulate-then-measure,
 * which is what that band is about.
 */
export const bands = [
  {
    id: 'chem',
    ground: 'bay',
    scene: 'sweep',
    tone: 'chem',
    eyebrow: 'Neurochemistry',
    /* Breaks are explicit throughout: the copy column is deliberately narrow
       so the animation has somewhere to be seen, and left to wrap, every one
       of these strands a word on its own line. */
    title: 'The chemistry,\nas it happens.',
    /* NO LEAD, AND NO META ROW. Withdrawn on NaviNetics' instruction
       2026-10-21, along with the third point.

       The lead described the electrochemistry — a changing potential, electrons
       given up at the sensor surface, the applied waveform subtracted back out.
       The third point was 'The waveform does the discriminating.', which named
       six analytes (dopamine, serotonin, adenosine, norepinephrine, histamine
       and others) and said the shape of the answer tells them apart; the same
       discrimination claim is attributed to the 2018 Biosensors and
       Bioelectronics paper on /technology/neuromodulation, where it carries
       its citation. The meta row read Sensor / Reports.

       ScienceBand guards all three — `lead &&`, `points.length`, `meta.length`
       — so omitting the keys is the whole removal. Restore by putting them
       back; nothing else has to change. */
    points: [
      {
        label: 'Fast-scan cyclic voltammetry.',
        body: 'A triangular sweep, applied over and over. It reports relative change with high '
          + 'temporal resolution — a release event as it rises and falls.',
      },
      {
        label: 'Multiple cyclic square wave voltammetry.',
        body: 'A staircase with a square wave riding on it. Where FSCV gives change, MCSWV '
          + 'measures absolute concentration.',
      },
    ],
    figure: {
      src: figWaveform, w: 1262, h: 639,
      alt: 'A staircase potential added to a square wave, giving the cyclic square waveform, '
        + 'with the current it produces shown beneath.',
      caption: 'Building the cyclic square waveform',
    },
  },
  {
    id: 'stim',
    ground: 'bay',
    scene: 'stim',
    tone: 'stim',
    eyebrow: 'Neuromodulation',
    title: 'The response\nto stimulation.',
    /* ONE POINT, NO LEAD. Withdrawn on NaviNetics' instruction 2026-10-21:
       the lead, the first point ('Synchronized with the measurement.') and the
       third ('Placed by the same route.') are gone, and the second is the whole
       band. The electrode-route sentence the third point made survives on the
       page — it is the closing line under the buttons in pages/Maven.jsx.

       'usable through the stimulus' is now 'stable through the stimulus', which
       is NaviNetics' own wording for it. */
    points: [
      {
        label: 'Artifact minimized at the integration.',
        body: 'The stimulation artifact is desynchronized from recording, so the signal stays '
        + 'stable through the stimulus.',
      },
    ],
    /* The meta row is withdrawn - 2026-10-26. It read Delivered / Electrical
       stimulation and Observed / Chemical + electrical. The Neurochemistry
       band's row (Sensor / Reports) went on 2026-10-21, so neither band
       carries one now and ScienceBand's `meta.length > 0` guard means the grey
       strip is simply absent rather than empty. */
    figure: {
      src: figFscv, w: 717, h: 848,
      alt: 'A voltammetric color plot with the extracted concentration trace above it and the '
        + 'cyclic voltammogram inset; the stimulus is marked beneath the plot.',
      caption: 'A release event, with the stimulus marked beneath',
    },
  },
  /* THE SOFTWARE BAND IS WITHDRAWN. 'Every sweep is kept.' — the third band,
     on the light ground, with the stacked-field scene and the square-wave
     voltammogram figure — came off on NaviNetics' instruction 2026-10-21.

     Two consequences worth knowing, because neither is visible from here:

       · The page now ends on a dark band. The light ground existed so the page
         "breathes instead of running as one long tunnel" (see the note at the
         top of pages/Maven.jsx) and handed the reader back to the site; the
         closing section still does that, and it is light.

       · 'stack' in lib/mavenScene.js and the figure asset are now unreferenced.
         Both are left in place deliberately — restoring this band means
         pasting this block back, and nothing else. */
];

export const domainOf = (id) => domains.find((d) => d.id === id);
export const channelsIn = (id) => channels.filter((c) => c.domain === id);
