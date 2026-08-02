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
 * a labelled placeholder, so the page says what the slot is for rather than
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
        'Which structure the lead sits in — and how precisely — decides what the stimulation does. This is '
        + 'the reason for everything in topic 02.'],
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
    shots: [
      {
        title: 'Hardware, at scale',
        brief:
          'The three implanted parts laid out on a neutral ground — lead, extension, generator — with a '
          + 'scale reference. Shows how small the lead is against the generator.',
        source: 'Studio shoot, unbranded',
      },
      {
        title: 'Lead in place',
        src: lead,
        caption:
          'Two leads at their targets, with the frame’s skull anchor above. Volume-rendered CT.',
      },
      {
        title: 'Programming',
        brief:
          'A clinician adjusting settings with the patient present. The human half of the therapy, and '
          + 'the part that shows it continues after surgery.',
        source: 'Clinical photography, consented',
      },
    ],
  },
  {
    id: 'stereotaxy',
    n: '02',
    title: 'Stereotactic Neurosurgery',
    definition: 'Reaching a point inside the brain by coordinate, not by sight.',
    /* Three parts, in the order the problem is actually solved: find out where
       things are, decide how the instrument will aim, then read off the
       numbers to set. The `keys` cards are gone from this topic — they said
       the same three things a second time. */
    parts: [
      {
        key: 'A',
        title: 'Localisation, and why it is needed',
        body:
          'A surgeon cannot see the target. It is centimetres inside the brain, it looks like the tissue '
          + 'around it, and it has to be reached without disturbing what is on the way. So the target is '
          + 'found on a scan instead, and the problem becomes one of transfer: the point is known in the '
          + 'image, and it has to be known in the patient.\n\n'
          + 'A frame fixed to the skull is what carries that across. A localiser attached to it appears in '
          + 'the scan itself — its rods cross every slice at a set of points whose spacing says where in '
          + 'the frame that slice was taken. Find those points in the image and the whole scan is placed in '
          + 'the frame’s coordinates. Historically the frame was a large ring encircling the head; the '
          + 'NaviNetics system fixes near the top of the skull instead, leaving the face clear.',
        figures: ['localiser'],
      },
      {
        key: 'B',
        title: 'The arc-centred principle',
        body:
          'Knowing where the target is does not yet say how to reach it. An arc-centred instrument answers '
          + 'that by putting the target at the centre of a circle: the arc swings around a single fixed '
          + 'point, and anything carried on the arc points at that point from wherever it sits.\n\n'
          + 'The consequence is the useful part. The approach can be moved — around a vessel, around '
          + 'eloquent cortex, away from a sulcus — and the target does not move with it. One target, many '
          + 'routes, and no arithmetic to redo when the route changes.',
        /* The principle, then the instrument that embodies it. */
        figures: ['arc', 'frame'],
      },
      {
        key: 'C',
        title: 'The six numbers, and what each of them does',
        body:
          'A trajectory is fully described by six values, and they fall into three jobs. Three translations '
          + 'move the frame until the target lies at the arc’s focus. Two rotations then turn about that '
          + 'focus to choose the approach. One depth advances the instrument along it.\n\n'
          + 'The split is the whole geometry. The first three decide where; the next two decide how you get '
          + 'there; the last decides how far. Because the two rotations turn about the focus rather than '
          + 'about the frame, changing your approach can never change your target — which is what makes the '
          + 'first three worth solving once.',
        axes: [
          ['Three translations', 'X  Y  Z', 'Move the frame until the target sits at the focus.'],
          ['Two rotations', 'Collar · Arc', 'Turn about the focus. The target does not move.'],
          ['One depth', 'Entry → target', 'Advance along the trajectory that has been set.'],
        ],
      },
    ],
    deep: {
      label: 'How the localiser fixes a slice in space',
      body:
        'The rods are arranged so that each panel presents two uprights and one diagonal. A plane cuts the '
        + 'uprights at a fixed separation and the diagonal somewhere between them, and where it cuts the '
        + 'diagonal depends on how high the plane is. The ratio of those spacings therefore reports the '
        + 'height of the slice, and with three panels the plane’s tilt is recovered too — so a single image '
        + 'carries enough information to place itself in the frame without any assumption about how the '
        + 'patient was lying.',
    },
    /* No image slots. Between the localiser pair, the interactive arc and the
       video of the instrument turning, this topic is the best illustrated on
       the page already. */
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
      + 'triangle, repeatedly, many times a second. On the way up, dopamine at the surface is oxidised; on '
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
      + 'measurement. Modelling the capacitive current, rather than subtracting a neighbouring sweep, is '
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
        'Dynamic background subtraction together with capacitive current modelling removes the large '
        + 'capacitive background without removing the signal that sits underneath it, which is what allows '
        + 'basal neurotransmitter concentrations to be measured rather than only deviations from them.',
    },
    /* No image slots — the phasic-against-tonic figure is what this topic
       needs, and it is already above. */
  },
];
