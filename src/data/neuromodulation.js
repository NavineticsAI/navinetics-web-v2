import figWaveform from '../assets/maven/fig-waveform.webp';
import figFscv from '../assets/maven/fig-fscv.webp';
/* fig-field.webp is no longer imported here: the only band that used it was
   'Almost the same answer.', withdrawn 2026-10-22. The asset stays in place. */
import { publications } from './publications.js';

/**
 * The research behind neuromodulation.
 *
 * This page has a different job from the two either side of it, and the three
 * only work if none of them does another's:
 *
 *   this page, further down     how the method works, from first principles
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
  /* Lightly rewritten 2026-10-22 for readability. Was: '...It will not tell
     you what they released, and the chemistry is where a great deal of what
     goes wrong in neurological and psychiatric disease actually lives.' The
     claim is unchanged; the sentence is shorter and the trailing space is
     gone. */
  body: 'An electrode in the brain will tell you when the cells around it fire. It will not tell '
  + 'you what they released — and the chemistry is where much of what goes wrong in neurological '
  + 'and psychiatric disease actually lives.',
  /* Was: "…working toward that. This page is those four." The second sentence
     describes the page's own structure to the reader, which is a note to
     ourselves about how the page was built. The first sentence is the useful
     part — eight years of sustained work is evidence, and it stays. */
  /* `note` is withdrawn - 2026-10-22. It read 'Four papers, over eight years,
     each one a step toward it.' and is no longer true of the page in any case:
     two of the four bands have gone, so a count printed under the opening
     paragraph would have to be maintained against the array below it. */
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
    /* No eyebrow: 'The standing level' withdrawn 2026-10-22. */
    /* Breaks are explicit AND short. The copy column is ~28% of the band so
       the animation has somewhere to be seen, which at this type size is
       about ten characters a line — an authored line longer than that
       wraps again and a three-line heading becomes five. */
    title: 'Reporting an\namount.',
    lead: 'Fast-scan cyclic voltammetry subtracts its own background, and the baseline goes with it '
    + '— so it reports changes. Multiple cyclic square wave voltammetry models the capacitive '
    + 'current instead of subtracting a neighboring sweep, which is what leaves the standing '
    + 'level intact underneath.',
    points: [
      {
        label: 'Phasic and tonic are different questions.',
        body: 'One is a release event in fractions of a second; the other is the level that shifts '
        + 'over minutes and hours.',
      },
    ],
    /* TWO POINTS AND THE META ROW WITHDRAWN - 2026-10-22. Gone:
         'Selectivity had to be demonstrated.' - the method against the usual
         electroactive interferents, ascorbic acid, DOPAC and changes in pH.
         'Demonstrated in living tissue.' - tonic dopamine tracked in the
         living brain, which is the whole difficulty.
       The meta row read Method / MCSWV and Reported / 2018.

       Worth noting: the selectivity point was the one place on this page the
       method's specificity was stated against named interferents, and it was
       sourced from the paper's own abstract. The same claim is made without
       attribution on /technology/education. */
    figure: {
      src: figWaveform, w: 1262, h: 639,
      alt: 'A staircase potential added to a square wave to give the cyclic square waveform, with '
        + 'the current it produces shown beneath.',
      caption: 'The cyclic square waveform',
    },
    /* `readMore` withdrawn ('Absolute concentration recording, explained').
       The Citation strip under each band no longer renders one. */
  },
  /* CHRONOLOGICAL, and it was not.
     The page opens on "four papers, over eight years, each one a step toward
     it" and then ran 2018 -> 2024 -> 2023 -> 2026, while the evidence list at
     the foot of the same page ran correctly. A page arguing a progression
     contradicted its own order within one scroll, and the reader most likely
     to notice is the one it is written for. `act` (Brain, 2023) now precedes
     `resolve` (Molecular Psychiatry, 2024). */
  {
    id: 'act',
    doi: '10.1093/brain/awad142',
    ground: 'bay',
    scene: 'stim',
    tone: 'stim',
    /* No eyebrow: 'Watching stimulation act' withdrawn 2026-10-22. */
    title: 'Asking what\nthe response\nmeans.',
    lead: 'Deep brain stimulation is known to help before it is understood to. Measuring chemistry '
    + 'with/without stimulation turns an outcome into a mechanism.',
    /* ONE POINT LEFT - 2026-10-22. Withdrawn: 'One clock for both.' (the
       stimulus and the response on the same timebase, or the delay between
       them is not recoverable) and 'Reported in Brain, 2023.' (which carried
       the paper's title, now shown in the Citation strip below the band
       instead). The meta row read Journal / Brain and Reported / 2023.

       The surviving point was rewritten for readability, chosen from three
       drafts on 2026-10-26. The original was: 'A stimulator that can see what
       it changed is a stimulator that could eventually be told to change it by
       a different amount.'

       THE HEDGE IS DELIBERATE AND SURVIVES THE REWRITE. 'First step toward'
       describes a direction, not a product - nothing here says NaviNetics is
       building closed-loop stimulation, and nothing should be allowed to drift
       into saying so. */
    points: [
      {
        label: 'The case for closing the loop.',
        body: 'A device that can measure its own effect is the first step toward one that can '
          + 'adjust itself in response.',
      },
    ],
    figure: {
      src: figFscv, w: 717, h: 848,
      alt: 'A voltammetric color plot with the extracted concentration trace above it and the '
        + 'cyclic voltammogram inset; the stimulus is marked beneath the plot.',
      caption: 'A release event, with the stimulus marked beneath',
    },
    /* `readMore` withdrawn ('Deep brain stimulation, explained'). */
  },
  /* THE THIRD CHAPTER IS WITHDRAWN - 'Almost the same answer.', on
     NaviNetics' instruction 2026-10-22. It was the Molecular Psychiatry 2024
     paper (DOI 10.1038/s41380-024-02537-1) on resolving dopamine from
     norepinephrine by combining voltammetry with deep learning, with three
     points ('The waveform does part of the work.', 'A model does the rest.',
     'Which widens what can be asked.'), a Method / Reported meta row, the
     square-wave voltammogram figure and a 'Neurochemical detection, explained'
     link.

     THE PAPER IS NOT GONE FROM THE PAGE. `evidence` above is derived from
     data/publications.js by `line`, not from this array, so the 2024 paper is
     still listed in the published-record section at the foot of this page and
     still appears on /resources/publications. Only its band is gone.

     Its figure (fig-field.webp) and its scene ('stack' in lib/mavenScenes) are
     now unreferenced from here. Both are left in place - the MAVEN page's own
     withdrawn band had the same two, so neither is dead weight introduced by
     this change. */
];

/** The paper a chapter is built on, by DOI. Throws rather than render a gap. */
export const paperFor = (doi) => {
  const p = evidence.find((x) => x.doi === doi);
  if (!p) throw new Error(`neuromodulation.js: no publication with DOI ${doi}`);
  return p;
};
