import lead from '../assets/education/01.2.webp';

/**
 * The five education topics, in the order they build on each other.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 * This is field-level explanation, not product marketing. Nothing here states
 * an accuracy figure, a setup time, or a comparison against another device.
 * The only technical values quoted — the −0.4 V to 1.0 V sweep limits — are
 * the ones the site already carried.
 *
 * Two things needing NaviNetics' confirmation before this ships:
 *
 *   · 01.2 is a volume-rendered CT that includes facial bone. A bone render is
 *     far less identifying than a surface one, but if this is a patient scan
 *     rather than a phantom or a cadaver it wants a de-identification review
 *     before it goes public.
 *
 *   · 02.3.b carries a numbered fiducial ring with a value against each one —
 *     0.70, 0.48, 0.36 and so on. Those are per-fiducial figures, which is a
 *     performance claim, and they are legible at the size the page shows them.
 *     They are on the page as supplied. If they should not be public, say so:
 *     it is a crop in tools/education-images.mjs, and the markers themselves
 *     can stay, since the figure's caption is about where the nine points land
 *     rather than about how well they landed.
 *
 * Each entry in `shots` carries either an image or a brief. A brief renders as
 * a labeled placeholder, so the page says what the slot is for rather than
 * showing a stand-in that looks like a decision already made.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const topics = [
  {
    id: 'dbs',
    n: '01',
    title: 'Deep Brain Stimulation',
    definition:
      'A small implanted device that sends controlled electrical pulses to one precise structure '
      + 'deep in the brain.',
    body:
      'Three parts are implanted. A lead — a thin insulated wire carrying several electrode contacts at '
      + 'its tip — is placed at the target. An extension runs from it under the skin of the scalp and neck. '
      + 'A pulse generator, about the size of a small pocket watch, sits below the collarbone and supplies '
      + 'the stimulation. Once healed, the settings are adjusted from outside the body, and can go on being '
      + 'adjusted for years.',
    figures: ['dbs'],
    keys: [
      ['It is adjustable',
        'Amplitude, pulse width, frequency and which contacts are active are all set after surgery, and '
        + 'revised as the condition changes.'],
      ['It is reversible',
        'Unlike a lesion, stimulation can be turned down or off. The tissue is not destroyed.'],
      ['The target is the therapy',
        /* The second sentence pointed forward: "This is the reason for
           everything in topic 02." Topic 02 was stripped to its figures on
           2026-10-21, so the reference now sends a reader to three
           uncaptioned pictures. Dropped 2026-10-26. */
        'Which structure the lead sits in — and how precisely — decides what the stimulation does.'],
    ],
    lists: [
      { label: 'Established use', tone: 'action',
        items: ['Parkinson’s disease', 'Essential tremor', 'Dystonia', 'Epilepsy', 'Obsessive-compulsive disorder'] },
      { label: 'Under study', tone: 'muted',
        items: ['Tourette syndrome', 'Huntington’s disease and chorea', 'Chronic pain', 'Cluster headache'] },
    ],
    deep: {
      label: 'Why the pulse generator sits in the chest',
      body:
        'The generator needs a battery, and a battery needs to be replaceable without opening the skull. '
        + 'Putting it below the collarbone keeps replacement a minor procedure, and keeps the mass off the '
        + 'head. The cost is the extension — a second connection, tunnelled the length of the neck, which '
        + 'is one of the places a system can fail mechanically.',
    },
    /* Two BRIEFS were removed from here, for the same reason the three under
       `chemistry` went (see the note further down this file): a brief renders
       as a dashed box printing a photo-shoot instruction — "Studio shoot,
       unbranded / The three implanted parts laid out on a neutral ground…" and
       "Clinical photography, consented / A clinician adjusting settings…" — to
       a visitor who came to read about deep brain stimulation. It is a
       commissioning note to ourselves, published.

       The shoots are still wanted. They are recorded in
       docs/shubham/04-open-items.md, which is where a production task belongs;
       when the photography exists, add it back here as `src` and it fills the
       slot with no other change. */
    shots: [
      {
        title: 'Lead in place',
        src: lead,
        caption:
          'Two leads at their targets, with the frame’s skull anchor above. Volume-rendered CT.',
      },
    ],
  },
  {
    id: 'stereotaxy',
    n: '02',
    title: 'Stereotactic Neurosurgery',
    /* STRIPPED TO THE FIGURES, on NaviNetics' instruction 2026-10-21. What
       came off, so it can go back verbatim:

         definition - 'Reaching a point inside the brain by coordinate, not by
         sight.'

         A's body - the two paragraphs beginning 'A surgeon cannot see the
         target...' and 'A frame fixed to the skull is what carries that
         across...', the second of which carried the 'Historically the frame
         was a large ring encircling the head' comparison.

         B's body - 'Knowing where the target is does not yet say how to reach
         it. An arc-centered instrument answers that by putting the target at
         the center of a circle...'

         C entirely - 'The six numbers, and what each of them does', its two
         paragraphs and its three axis rows (Three translations / Two rotations
         / One depth).

         deep - 'How the localizer fixes a slice in space' and its paragraph on
         how the rod spacings report a slice's height and tilt.

       A and B are now title-plus-figure. pages/Education.jsx guards
       `definition`, `part.body` and `deep` so their absence renders nothing
       rather than throwing - before those guards, `part.body.split` on a part
       with no body took the whole page down.

       THIS TOPIC IS ON TWO PAGES. It renders into
       /technology/stereotactic-devices via `teaches` in data/technology.js,
       AND on /technology/education, which lists all five topics. The second
       page was not part of the instruction but is changed by it: its
       stereotaxy section is now three headings and three figures with no
       teaching text at all. */
    parts: [
      {
        key: 'A',
        title: 'Localization',
        figures: ['localizer'],
      },
      {
        key: 'B',
        title: 'The arc-centered principle',
        /* The principle, then the instrument that embodies it. */
        figures: ['arc', 'frame'],
      },
    ],
  },
  {
    id: 'neurochemical',
    n: '03',
    title: 'Neurochemical Detection',
    definition: 'Measuring the chemicals the brain uses to signal, in living tissue, as they change.',
    body:
      'Neurons communicate with chemicals — dopamine, serotonin, adenosine and others. Recording electrical '
      + 'activity tells you when cells fire; it does not tell you what was released. To measure the '
      + 'chemistry directly, a microelectrode finer than a human hair is placed in the tissue and held at a '
      + 'controlled voltage. Molecules that reach its surface give up or take on electrons at voltages '
      + 'characteristic of each species, and the resulting current is the measurement.',
    figures: ['redox'],
    keys: [
      ['Each molecule has a signature',
        'Oxidation and reduction happen at potentials specific to the analyte, which is what lets one be '
        + 'told from another.'],
      ['Current stands for concentration',
        'More molecules at the surface means more charge transferred, so the size of the current tracks how '
        + 'much is there.'],
      ['Why it matters clinically',
        'Abnormal neurochemistry runs through addiction, depression, obsessive-compulsive disorder, epilepsy '
        + 'and tremor. A stimulator that could read it might one day respond to it.'],
    ],
    deep: {
      label: 'Electrophysiology and neurochemistry together',
      body:
        'A long-standing aim in neuroscience is to relate electrical activity and neurochemical release in '
        + 'normal and abnormal brain function. Measuring both at once, in the same place, is what a '
        + 'closed-loop stimulator would need: a signal to respond to, rather than a fixed setting chosen '
        + 'months earlier.',
    },
    /* No image slots. The running figure above already shows what this topic
       is about, and three dashed placeholders under it said only that
       something was missing. */
  },
  {
    id: 'phasic',
    n: '04',
    title: 'Phasic Concentration Recording',
    definition: 'Catching the fast release — how much the concentration changed, in fractions of a second.',
    body:
      'In fast-scan cyclic voltammetry the electrode’s potential is swept up and back down again in a '
      + 'triangle, repeatedly, many times a second. On the way up, dopamine at the surface is oxidized; on '
      + 'the way down, the product is reduced back. Plot the current against the potential rather than '
      + 'against time and you get a cyclic voltammogram, whose shape identifies the molecule and whose '
      + 'height tracks how much of it arrived.',
    figures: ['fscv'],
    keys: [
      ['Sub-second',
        'Fast enough to see a single release event, which is the timescale neurons actually work on.'],
      ['The background is enormous',
        'Charging the electrode produces a current far larger than the chemistry does. It has to be '
        + 'subtracted before anything can be seen.'],
      ['So it measures change',
        'Subtracting the background also subtracts the baseline. This technique tells you how much the '
        + 'concentration moved, not what it was — which is what topic 05 is for.'],
    ],
    deep: {
      label: 'Background subtraction',
      body:
        'A large background current is produced during each sweep, dominated by capacitive charging of the '
        + 'electrode surface. Digital background subtraction — taking a voltammogram recorded moments '
        + 'earlier and subtracting it — removes it, and what remains is the change in current attributable '
        + 'to oxidation and reduction of the target neurochemical. Under typical conditions the potential '
        + 'is cycled between about −0.4 V and 1.0 V against a reference electrode; the scan rate and the '
        + 'potential limits together set sensitivity, selectivity and time resolution.',
    },
    /* No image slots — the interactive sweep is the figure this topic needs. */
  },
  {
    id: 'absolute',
    n: '05',
    title: 'Absolute Concentration Recording',
    definition: 'Measuring the standing level itself — not the change, the amount.',
    body:
      'Multiple cyclic square wave voltammetry measures the absolute concentration of a neurochemical in '
      + 'the extracellular space. Instead of a smooth triangle it applies square waveforms, together with a '
      + 'delayed holding period that controls how much analyte gathers on the electrode surface before each '
      + 'measurement. Modeling the capacitive current, rather than subtracting a neighboring sweep, is '
      + 'what leaves the baseline intact.',
    figures: ['compare'],
    keys: [
      ['Tonic, not phasic',
        'The slow standing level — the one that shifts over minutes and hours in disease, and in response '
        + 'to a drug or to stimulation.'],
      ['Selective',
        'Demonstrated against the usual electroactive interferents, including ascorbic acid, DOPAC, and '
        + 'changes in pH.'],
      ['The pair is the point',
        'Phasic and tonic are different questions about the same molecule. Answering only one leaves the '
        + 'other invisible.'],
    ],
    deep: {
      label: 'How the baseline survives',
      body:
        'Dynamic background subtraction together with capacitive current modeling removes the large '
        + 'capacitive background without removing the signal that sits underneath it, which is what allows '
        + 'basal neurotransmitter concentrations to be measured rather than only deviations from them.',
    },
    /* No image slots — the phasic-against-tonic figure is what this topic
       needs, and it is already above. */
  },
];
