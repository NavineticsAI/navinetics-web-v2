import device from '../assets/maven/device.webp';
import detail from '../assets/maven/detail.webp';
import figWaveform from '../assets/maven/fig-waveform.webp';
import figSensor from '../assets/maven/fig-sensor.webp';
import figFscv from '../assets/maven/fig-fscv.webp';
import figField from '../assets/maven/fig-field.webp';

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
 */
export const channels = [
  { id: 'da', domain: 'chem', deg: -8, short: 'Dopamine', name: 'Dopamine', sub: 'DA' },
  { id: '5ht', domain: 'chem', deg: -33.5, short: 'Serotonin', name: 'Serotonin', sub: '5-HT' },
  { id: 'ado', domain: 'chem', deg: -59, short: 'Adenosine', name: 'Adenosine', sub: null },
  { id: 'glu', domain: 'chem', deg: -84.5, short: 'Glutamate', name: 'Glutamate', sub: null },
  { id: 'ach', domain: 'chem', deg: -110, short: 'Acetylcholine', name: 'Acetylcholine', sub: 'ACh' },
  { id: 'lfp', domain: 'ephys', deg: 32, short: 'LFP', name: 'Local field potential', sub: 'LFP' },
  { id: 'unit', domain: 'ephys', deg: 62, short: 'Single-unit', name: 'Single-unit activity', sub: null },
  { id: 'dsp', domain: 'soft', deg: 108, short: 'Signal processing', name: 'Ephys & signal processing', sub: null },
  { id: 'adv', domain: 'soft', deg: 138, short: 'Advanced analysis', name: 'Advanced analysis', sub: null },
  { id: 'dbs', domain: 'stim', deg: 195, short: 'DBS', name: 'Deep brain stimulation', sub: 'DBS' },
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
    lead: 'Apply a changing potential to a carbon-fiber or diamond sensor and electrochemically '
      + 'active substances give up or take back electrons at its surface. Subtract the applied '
      + 'waveform from what comes back, and what is left is the current the chemistry drew.',
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
      {
        label: 'The waveform does the discriminating.',
        body: 'Dopamine, serotonin, adenosine, acetylcholine, norepinephrine, histamine and '
          + 'others each answer a sweep differently, and the shape of the answer tells them apart.',
      },
    ],
    meta: [
      { label: 'Sensor', value: 'Carbon fiber · diamond' },
      { label: 'Reports', value: 'Relative · absolute' },
    ],
    figure: {
      src: figWaveform, w: 1262, h: 639,
      alt: 'A staircase potential added to a square wave, giving the cyclic square waveform, '
        + 'with the current it produces shown beneath.',
      caption: 'Building the cyclic square waveform',
    },
  },
  {
    id: 'ephys',
    ground: 'light',
    scene: 'spikes',
    tone: 'ephys',
    eyebrow: 'Electrophysiology',
    title: 'The same tip\nhears the\ntissue.',
    lead: 'The electrode that reads the chemistry also hears the tissue’s electrical activity. '
      + 'Local field potentials and single-unit firing are recorded on their own channel, at the '
      + 'same instant, through the same piece of hardware.',
    points: [
      { label: 'Local field potential.', body: 'The summed activity of the population around the tip.' },
      { label: 'Single-unit activity.', body: 'Individual neurons, resolved as spikes.' },
      {
        label: 'Independent, but synchronized.',
        body: 'The two run as separate channels of one instrument, so the chemistry and the '
          + 'electrophysiology line up on one timeline.',
      },
    ],
    meta: [
      { label: 'Channels', value: 'Chemical · electrical' },
      { label: 'Probe', value: 'Carbon fiber in cannula' },
    ],
    figure: {
      src: figSensor, w: 1308, h: 1026,
      alt: 'A carbon-fiber microelectrode: the fiber, silica and polyamide tubing, and the inner '
        + 'and outer cannula, photographed against a scale and drawn in section.',
      caption: 'The carbon-fiber microelectrode',
    },
  },
  {
    id: 'stim',
    ground: 'bay',
    scene: 'stim',
    tone: 'stim',
    eyebrow: 'Neuromodulation',
    title: 'The response\nto stimulation.',
    lead: 'Deep brain stimulation goes in on one channel while the other two keep recording. That '
      + 'is the point of the instrument — deliver something, then see what the tissue does about '
      + 'it, without the stimulation swamping the measurement of its own effect.',
    points: [
      {
        label: 'Synchronized with the measurement.',
        body: 'The stimulus sits on the same timeline as both signals, so what follows can be '
          + 'read against it.',
      },
      {
        label: 'Artifact minimized at the integration.',
        body: 'The stimulation artifact is dealt with where the channels meet, so the recording '
          + 'stays usable through the stimulus rather than around it.',
      },
      {
        label: 'Placed by the same route.',
        body: 'Sensing and stimulating electrodes go in through the stereotactic workflow the '
          + 'rest of NaviNetics is built around.',
      },
    ],
    meta: [
      { label: 'Delivered', value: 'DBS' },
      { label: 'Observed', value: 'Chemical + electrical' },
    ],
    figure: {
      src: figFscv, w: 717, h: 848,
      alt: 'A voltammetric color plot with the extracted concentration trace above it and the '
        + 'cyclic voltammogram inset; the stimulus is marked beneath the plot.',
      caption: 'A release event, with the stimulus marked beneath',
    },
  },
  {
    id: 'soft',
    ground: 'light',
    scene: 'stack',
    tone: 'soft',
    eyebrow: 'Software & analysis',
    title: 'Every sweep\nis kept.',
    lead: 'A run is thousands of sweeps. They stack into a field with potential running one way '
      + 'and time the other; take off what the background was doing, and a concentration against '
      + 'time comes back out of it.',
    points: [
      {
        label: 'Kept in full.',
        body: 'Every sweep is kept as its own column, so a run can be re-read rather than only '
          + 're-plotted.',
      },
      {
        label: 'Background subtracted.',
        body: 'The steady current the electrode draws before the event is taken off, so the '
          + 'release itself is the signal.',
      },
      {
        label: 'Read as a trace.',
        body: 'A line through the field at the analyte’s own potential is the concentration '
          + 'against time.',
      },
    ],
    meta: [
      { label: 'Field', value: 'Potential × time' },
      { label: 'Out', value: 'Concentration × time' },
    ],
    figure: {
      src: figField, w: 577, h: 513,
      alt: 'A square-wave voltammogram as the software renders it: current in color across '
        + 'potential and scan number.',
      caption: 'The field as the software draws it',
    },
  },
];

export const domainOf = (id) => domains.find((d) => d.id === id);
export const channelsIn = (id) => channels.filter((c) => c.domain === id);
