import figWaveform from '../assets/maven/fig-waveform.webp';
import figSensor from '../assets/maven/fig-sensor.webp';
import figFscv from '../assets/maven/fig-fscv.webp';
import figField from '../assets/maven/fig-field.webp';
import { publications } from './publications.js';

/**
 * The research behind neuromodulation.
 *
 * This page has a different job from the two either side of it, and the three
 * only work if none of them does another's:
 *
 *   /resources/education        how the method works, from first principles
 *   /technology/neuromodulation what the work has established, and when — here
 *   /products/maven…            the instrument you can put on a bench
 *
 * So the spine here is the arc of the published work rather than the technique
 * or the hardware. Each band is anchored on one real paper, in the order they
 * appeared: measure the standing level, tell similar molecules apart, watch
 * stimulation act, then put both signals on one platform.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 *
 * EVERY FINDING ON THIS PAGE IS ATTRIBUTED TO A PAPER, and the papers are real
 * — same records the publications page renders, resolved from Crossref against
 * their DOIs. Describing what a peer-reviewed paper reports, and naming it, is
 * not the same as claiming it as a property of a product. Nothing here says
 * NaviNetics' device does any of it.
 *
 * That distinction is why Tourette syndrome appears on this page when the
 * MAVEN product page names no indication at all. The 2023 Brain paper is
 * titled "Deep brain stimulation alleviates tics in Tourette syndrome via
 * striatal dopamine transmission". Citing a published title is reporting;
 * putting the same words next to a product would be a therapeutic claim.
 *
 * NOT ASSERTED, deliberately:
 *   · That the 2026 platform paper IS the MAVEN system. It is the same group,
 *     the same two signals and the same lineage — Bennet and Lee are both on
 *     it — but the paper does not name the product and neither does this page.
 *     If NaviNetics wants that stated it is one sentence, and theirs to write.
 *   · Any number the papers report. Sensitivity, limits of detection,
 *     concentrations, electrode dimensions and scan parameters are all in the
 *     abstracts and none are on this page. The publications page carries the
 *     same restraint for the same reason.
 *   · Any regulatory or availability position. The word used throughout is
 *     research, because that is what these papers are.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** The papers this page is built on, oldest first — the order it tells them in. */
export const evidence = publications
  /* Must match a `line` value in data/publications.js. That file's lines were
     renamed to the three technology lines and this filter was left on the old
     'Neurochemistry', which matched nothing — `paperFor` then threw on the
     first chapter and took the whole page to a blank screen. A filter that
     silently returns [] is the failure mode to watch for here. */
  .filter((p) => p.line === 'Neuromodulation')
  .slice()
  .sort((a, b) => a.year - b.year);

/**
 * The question the whole program is an answer to. Deliberately the plainest
 * paragraph on the page: everything after it is a step toward this.
 */
export const gap = {
  eyebrow: 'The problem',
  title: 'Firing is not the same as releasing.',
  body: 'An electrode in the brain will tell you when the cells around it fire. It will not tell '
    + 'you what they released, and the chemistry is where a great deal of what goes wrong in '
    + 'neurological and psychiatric disease actually lives. A stimulator that could read the '
    + 'chemistry might one day respond to it — but only if the chemistry can be measured in '
    + 'living tissue, at the right speed, while the stimulation is running.',
  /* Was: "…working toward that. This page is those four." The second sentence
     describes the page's own structure to the reader, which is a note to
     ourselves about how the page was built. The first sentence is the useful
     part — eight years of sustained work is evidence, and it stays. */
  note: 'Four papers, over eight years, each one a step toward it.',
};

/**
 * One band per paper. `paper` is matched against `evidence` by DOI so the
 * citation under each band cannot drift from the publications record.
 */
export const chapters = [
  {
    id: 'tonic',
    doi: '10.1016/j.bios.2018.08.034',
    ground: 'bay',
    scene: 'sweep',
    tone: 'chem',
    eyebrow: 'The standing level',
    /* Breaks are explicit AND short. The copy column is ~28% of the band so
       the animation has somewhere to be seen, which at this type size is
       about ten characters a line — an authored line longer than that
       wraps again and a three-line heading becomes five. */
    title: 'Reporting an\namount.',
    lead: 'Fast-scan voltammetry subtracts its own background, and the baseline goes with it — so '
      + 'it reports change beautifully and cannot report an amount. Multiple cyclic square wave '
      + 'voltammetry models the capacitive current instead of subtracting a neighboring sweep, '
      + 'which is what leaves the standing level intact underneath.',
    points: [
      {
        label: 'Phasic and tonic are different questions.',
        body: 'One is a release event in fractions of a second; the other is the level that shifts '
          + 'over minutes and hours, in disease and in response to a drug or to stimulation.',
      },
      {
        label: 'Selectivity had to be demonstrated.',
        body: 'The paper reports the method against the usual electroactive interferents — '
          + 'ascorbic acid, DOPAC, and changes in pH.',
      },
      {
        label: 'Demonstrated in living tissue.',
        body: 'Tonic dopamine tracked in the living brain, which is the whole difficulty.',
      },
    ],
    meta: [{ label: 'Method', value: 'MCSWV' }, { label: 'Reported', value: '2018' }],
    figure: {
      src: figWaveform, w: 1262, h: 639,
      alt: 'A staircase potential added to a square wave to give the cyclic square waveform, with '
        + 'the current it produces shown beneath.',
      caption: 'The cyclic square waveform',
    },
    readMore: { label: 'Absolute concentration recording, explained', to: '/resources/education#absolute' },
  },
  {
    id: 'resolve',
    doi: '10.1038/s41380-024-02537-1',
    ground: 'light',
    scene: 'stack',
    tone: 'soft',
    eyebrow: 'Selectivity',
    title: 'Almost the\nsame answer.',
    lead: 'Dopamine and norepinephrine differ by one hydroxyl group, and a sweep asks them both '
      + 'much the same question. Where the waveform alone cannot separate two species, what is '
      + 'left is in the shape of the response — and a model trained on that shape can do the '
      + 'separating the chemistry will not.',
    points: [
      {
        label: 'The waveform does part of the work.',
        body: 'Each species turns over at its own potential, which is what makes voltammetry '
          + 'selective at all.',
      },
      {
        label: 'A model does the rest.',
        body: 'The paper resolves tonic concentrations of highly similar neurotransmitters by '
          + 'combining voltammetry with deep learning.',
      },
      {
        label: 'Which widens what can be asked.',
        body: 'A technique that can only report one analyte confidently answers one question '
          + 'about a system that runs on several.',
      },
    ],
    meta: [{ label: 'Method', value: 'Voltammetry + learning' }, { label: 'Reported', value: '2024' }],
    figure: {
      src: figField, w: 577, h: 513,
      alt: 'A square-wave voltammogram: current in color across potential and scan number.',
      caption: 'A square-wave voltammogram',
    },
    readMore: { label: 'Neurochemical detection, explained', to: '/resources/education#neurochemical' },
  },
  {
    id: 'act',
    doi: '10.1093/brain/awad142',
    ground: 'bay',
    scene: 'stim',
    tone: 'stim',
    eyebrow: 'Watching stimulation act',
    title: 'Asking what\nthe response\nmeans.',
    lead: 'Deep brain stimulation is known to help before it is understood to. Measuring the '
      + 'chemistry while the stimulation runs turns an outcome into a mechanism — which is the '
      + 'difference between knowing that a setting works and knowing what to change when it '
      + 'stops.',
    points: [
      {
        label: 'One clock for both.',
        body: 'The stimulus and the chemical response have to be on the same timebase, or the '
          + 'delay between them — the thing you are actually measuring — is not recoverable.',
      },
      {
        label: 'Reported in Brain, 2023.',
        body: 'Deep brain stimulation alleviates tics in Tourette syndrome via striatal dopamine '
          + 'transmission. The dopamine is the mechanism the title is naming.',
      },
      {
        label: 'The case for closing the loop.',
        body: 'A stimulator that can see what it changed is a stimulator that could eventually '
          + 'be told to change it by a different amount.',
      },
    ],
    meta: [{ label: 'Journal', value: 'Brain' }, { label: 'Reported', value: '2023' }],
    figure: {
      src: figFscv, w: 717, h: 848,
      alt: 'A voltammetric color plot with the extracted concentration trace above it and the '
        + 'cyclic voltammogram inset; the stimulus is marked beneath the plot.',
      caption: 'A release event, with the stimulus marked beneath',
    },
    readMore: { label: 'Deep brain stimulation, explained', to: '/resources/education#dbs' },
  },
  {
    id: 'platform',
    doi: '10.1016/j.bios.2025.118151',
    ground: 'light',
    scene: 'spikes',
    tone: 'ephys',
    eyebrow: 'Both signals at once',
    title: 'On one\ntimebase.',
    lead: 'The chemistry and the electrophysiology had been separate instruments answering '
      + 'separate questions. A multimodal platform records both in real time, through one probe, '
      + 'on one timebase — which is what lets what was released be lined up against what fired.',
    points: [
      {
        label: 'Real time, and intraoperative.',
        body: 'The paper is titled for it: real-time neurochemical and electrophysiologic '
          + 'monitoring for intraoperative neurosurgical applications.',
      },
      {
        label: 'A carbon-fiber microelectrode does both jobs.',
        body: 'Finer than a human hair, carrying the sensing surface and the electrical channel '
          + 'in one assembly.',
      },
      {
        label: 'Thirty-six authors.',
        /* Bennet, Oh and Lee are all on this author list — it said "both" while
           the founders page named two scientific founders, and Oh's addition
           makes three. Check the byline in publications.js before editing. */
        body: 'Three of them are NaviNetics founders. It is the accumulation of the '
          + 'three papers above, not a separate line of work.',
      },
    ],
    meta: [{ label: 'Signals', value: 'Chemical + electrical' }, { label: 'Reported', value: '2026' }],
    figure: {
      src: figSensor, w: 1308, h: 1026,
      alt: 'A carbon-fiber microelectrode: the fiber, silica and polyamide tubing, and the inner '
        + 'and outer cannula, photographed against a scale and drawn in section.',
      caption: 'The carbon-fiber microelectrode',
    },
    readMore: { label: 'Phasic concentration recording, explained', to: '/resources/education#phasic' },
  },
];

/** The paper a chapter is built on, by DOI. Throws rather than render a gap. */
export const paperFor = (doi) => {
  const p = evidence.find((x) => x.doi === doi);
  if (!p) throw new Error(`neuromodulation.js: no publication with DOI ${doi}`);
  return p;
};
