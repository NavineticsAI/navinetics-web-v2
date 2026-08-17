/**
 * The six approach angles on the careers page.
 *
 * The convergence diagram derives each discipline's position on the arc from
 * its index, so reordering or adding one is safe — the geometry follows.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CLAIMS NOTICE
 * Every "problem" line traces to work NaviNetics has published or shipped —
 * the Skull Anchor Key, automated landmark localization for neuronavigation,
 * ultra-high-field MRI guidance, the compact stereotactic system. Nothing was
 * invented, and no accuracy figures or setup times appear anywhere, since
 * those are regulated marketing claims.
 *
 * Two statements need NaviNetics' confirmation before this ships:
 *   · that a co-founder is still in active surgical practice
 *   · that applications reach the founders directly
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const disciplines = [
  {
    id: 'nsx',
    short: 'Neurosurgery',
    group: 'Clinical',
    role: 'Clinical — Neurosurgery',
    title: 'They don’t advise. They operate.',
    /* "the hardware is in the way" was collateral from the base-ring sweep: the
       original said "the base ring is in the way", and replacing a specific
       object with a generic one turned a surgeon's concrete complaint into a
       vague one. The ring cannot come back, so the specificity is restored the
       other way — by naming what is in the way in that moment, the hands. */
    body: 'Our co-founder is a practicing neurosurgeon at Mayo Clinic. Clinical input here is not a quarterly advisory call — it is someone who will be holding the device at 7am, telling you there is metal where their hands need to be. The Skull Anchor Key exists because of exactly that complaint.',
    problem:
      '“The frame is blocking the patient’s face during an awake case. Give me the coordinate system without it.”',
    owns: ['Clinical requirements', 'Surgical workflow', 'Cadaver & OR validation', 'Trajectory planning'],
    with: [
      ['MECH', 'Whether a bracket can physically be reached with gloved hands mid-procedure.'],
      ['NEURO', 'Which target, which patient, and what counts as a good outcome.'],
      ['REG', 'Turning a surgeon’s sentence into a verifiable design input.'],
    ],
  },
  {
    id: 'neu',
    short: 'Neurology',
    group: 'Clinical',
    role: 'Clinical — Neurology',
    title: 'Deciding what “better” means.',
    body: 'Movement disorders, target selection, and what happens to the patient afterwards. Neurology sets the outcome everything upstream is optimizing for — and it is not millimetres on a bench, it is whether a person can hold a cup of coffee.',
    problem: '“Which target, in which patient — and how would we know afterwards whether we were right?”',
    owns: ['Indications & selection', 'Target planning', 'Outcome measures', 'Clinical follow-up'],
    with: [
      ['NSX', 'Target selection, and what the plan has to allow for.'],
      ['SW', 'What a surgeon needs to see on screen, and how fast.'],
      ['RES', 'Studies that ask a clinically meaningful question.'],
    ],
  },
  {
    id: 'mech',
    short: 'Mechanical',
    group: 'Engineering',
    role: 'Engineering — Mechanical',
    title: 'Kinematics you can trust with a skull.',
    body: 'Arc-centered geometry: three linear degrees of freedom plus collar and arc rotation, all landing on one focus. Every tolerance in that stack is an error at the target. Then it has to survive autoclave cycles and still read true.',
    problem:
      '“Hold the iso-center through a full reprocessing life, in a device small enough to sit at the surgical field.”',
    owns: ['Arc-centered kinematics', 'Tolerance stack-up', 'Materials & reprocessing', 'Microdrive & carriers'],
    with: [
      ['NSX', 'Whether the adjustment is reachable where the surgeon actually stands.'],
      ['SW', 'Where a readout or encoder has to physically live on the mechanism.'],
      ['REG', 'Verification protocols that prove the stack-up.'],
    ],
  },
  {
    id: 'sw',
    short: 'Software',
    group: 'Engineering',
    role: 'Engineering — Software',
    title: 'Turning images into coordinates.',
    body: 'Localizer fiducial detection, image registration, trajectory planning, and the interface a surgeon reads while a patient is on the table. Automated landmark localization for neuronavigation is already published work here — the job is making it reliable enough to trust in an operating room.',
    problem:
      '“Find the localizer fiducials in an MR series and return a coordinate system a surgeon will stake a trajectory on.”',
    owns: ['Image registration', 'Fiducial & landmark detection', 'Planning & targeting UI', 'Accuracy tooling'],
    with: [
      ['MECH', 'What the instrument can physically deliver to the target.'],
      ['RES', 'Turning a published method into something that runs in theater.'],
      ['NEURO', 'An interface that is legible to someone who is not an engineer.'],
    ],
  },
  {
    id: 'res',
    short: 'Research',
    group: 'Science',
    role: 'Science — Research',
    title: 'Proving the target is where you say it is.',
    body: 'Accuracy validation, imaging guidance methods, preclinical models, and the papers that follow — plus a smaller neuromodulation research track alongside. Research is where a navigation claim becomes credible before it becomes a specification, and the publication record is a large part of why clinicians take the systems seriously.',
    problem:
      '“Show the delivered trajectory lands where the plan said it would — and quantify the error honestly.”',
    owns: ['Accuracy validation', 'Imaging guidance methods', 'Preclinical studies', 'Publication'],
    with: [
      ['SW', 'Software that can actually run the method in theater.'],
      ['REG', 'Evidence recorded so it still stands up years later.'],
      ['NEURO', 'Framing a question a clinician would care about the answer to.'],
    ],
  },
  {
    id: 'reg',
    short: 'Regulatory',
    group: 'Regulatory',
    role: 'Medical, Regulatory & Quality',
    title: 'The part that makes it legal to help someone.',
    body: 'Design controls, risk management, the regulatory pathway, and a design history file that still makes sense to an auditor years from now. Unglamorous, and the reason any of the rest reaches a patient.',
    problem:
      '“Build a design history file that a stranger can audit in five years and reach the same conclusion we did.”',
    owns: ['Regulatory strategy', 'Design controls & DHF', 'Risk management', 'Quality system'],
    with: [
      ['ALL', 'Every discipline — evidence is generated everywhere and assembled here.'],
      ['NSX', 'Translating clinical intent into verifiable requirements.'],
      ['MECH', 'Verification and validation protocols.'],
    ],
  },
];

/** Honest framing of the job. Naming what it is NOT is the trust move. */
export const expectations = [
  {
    tone: 'no',
    label: 'Not this',
    title: 'Ship on Friday',
    body: 'Design controls, verification, and a design history file sit between your idea and a patient. A change that takes an afternoon to write can take months to qualify.',
  },
  {
    tone: 'no',
    label: 'Not this',
    title: 'Stay in your lane',
    body: 'The team is small. A mechanical engineer will end up reading registration error plots; a software engineer will end up in a sterilization discussion. Narrow specialists get bored.',
  },
  {
    tone: 'yes',
    label: 'But this',
    title: 'You will meet the patient',
    body: 'Not abstractly. The disorders in our publications — Parkinson’s, essential tremor, dystonia — belong to people our founders have operated on.',
  },
  {
    tone: 'yes',
    label: 'But this',
    title: 'Your name goes on it',
    body: 'Patents and peer-reviewed papers. Over 100 publications so far, and the people who did the work are on them.',
  },
];
