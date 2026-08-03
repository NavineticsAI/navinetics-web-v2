/**
 * Publication records.
 *
 * Every field here was resolved from Crossref against the published DOI rather
 * than transcribed, including the author lists — one of these papers has
 * thirty-six authors. Regenerating is preferable to editing by hand.
 *
 * `line` groups the work into the two threads the page is built around, and is
 * the one editorial field: it was assigned by reading the papers, not by
 * keyword. The 2023 Brain paper is a striatal dopamine study that happens to be
 * about DBS, so it sits with the sensing work.
 *
 * `excerpt` is carried only by the featured paper, and quotes its aim and its
 * conclusion. The abstract also reports figures — sub-0.1 mm agreement between
 * imaging techniques, and a mean radial error — which are deliberately left off
 * the page. They are published and peer-reviewed, so quoting them attributed to
 * the paper is not the same as claiming them as specifications, but they are
 * still performance numbers about our own device on our own site. That is a
 * decision for NaviNetics rather than a default.
 */
export const publications = [
  {
    title:
      'Design and validation of a stereotactic frame for independent bilateral multi-trajectory '
      + 'targeting',
    authors: [
      'A. Alfonsi', 'J. Tang-Cabrera', 'E. Lee', 'A.L. Koller', 'P.J. Chen', 'L. Scalise',
      'M.A. Hawkes', 'Y. Oh', 'J. Sung', 'H. Shin', 'K.H. Lee',
    ],
    journal: 'Journal of Neural Engineering',
    year: 2026,
    volume: '23',
    pages: '046031',
    line: 'Stereotaxy',
    doi: '10.1088/1741-2552/ae87cf',
    nnAffiliation: true,
  },
  {
    title:
      'Application of a human stereotactic system for image-guided deep brain stimulation '
      + 'neurosurgery in a swine model',
    authors: [
      'K.M. Scheitler', 'J.M. Rojas-Cabrera', 'S.A. Vettleson-Trutza', 'S.T. Tsai',
      'G.K. Pons-Monnier', 'M.M. El-Gohary', 'R. Scheer', 'Y. Kwak', 'D.G. Barone', 'C.D. Blaha',
      'T.S. Oesterle', 'H. Shin', 'K.H. Lee', 'Y. Oh',
    ],
    journal: 'Brain Stimulation',
    year: 2025,
    volume: '18',
    pages: '1441-1443',
    line: 'Stereotaxy',
    doi: '10.1016/j.brs.2025.07.007',
  },
  {
    title:
      'Clinical Evaluation of the NaviNetics Stereotactic System Using Intraoperative Portable '
      + 'Surgical Imaging System in DBS Surgery',
    authors: [
      'J.W. Shin', 'K.M. Scheitler', 'B. Sharaf', 'I. Mandybur', 'S. Hussein', 'B.T. Klassen',
      'N. Gregg', 'S.S. Grewal', 'K.J. Miller', 'H. Shin', 'J.W. Chang', 'Y. Oh', 'D. Vansickle',
      'K.H. Lee',
    ],
    journal: 'Operative Neurosurgery',
    year: 2025,
    volume: '29',
    pages: '93-101',
    line: 'Stereotaxy',
    doi: '10.1227/ons.0000000000001427',
    namesSystem: true,
    nnAffiliation: true,
    excerpt:
      'Intraoperative O-arm imaging can be used safely and effectively for stereotactic '
      + 'registration and lead placement confirmation with the stereotactic system in both awake and '
      + 'asleep DBS surgery.',
  },
  {
    title:
      'Clinical evaluation of a stereotactic system for single-stage deep brain stimulation surgery '
      + 'under general anesthesia: technical note',
    authors: [
      'K.M. Scheitler', 'A.E. Rusheen', 'J. Yuen', 'A. Goyal', 'S. Hong', 'G.M. Osman',
      'B. Sharaf', 'B.T. Klassen', 'S.S. Grewal', 'K.J. Miller', 'H. Shin', 'Y. Oh', 'K.H. Lee',
    ],
    journal: 'Journal of Neurosurgery',
    year: 2024,
    volume: '141',
    pages: '406-411',
    line: 'Stereotaxy',
    doi: '10.3171/2024.1.JNS232563',
    nnAffiliation: true,
  },
  {
    title:
      'A compact stereotactic system for image-guided surgical intervention',
    authors: [
      'A.E. Rusheen', 'A.S. Barath', 'A. Goyal', 'J.H. Barnett', 'B.T. Gifford', 'K.E. Bennet',
      'C.D. Blaha', 'S.J. Goerss', 'Y. Oh', 'K.H. Lee',
    ],
    journal: 'Journal of Neural Engineering',
    year: 2020,
    volume: '17',
    pages: '066014',
    line: 'Stereotaxy',
    doi: '10.1088/1741-2552/abc743',
  },
  {
    title:
      'A multimodal platform for real-time neurochemical and electrophysiologic monitoring for '
      + 'intraoperative neurosurgical applications',
    authors: [
      'H. Shin', 'K.M. Scheitler', 'J.M. Rojas Cabrera', 'A. Goyal', 'J.B. Boesche',
      'A.E. Rusheen', 'J. Yuen', 'B. Hanna', 'U. Karanovic', 'S. Vettleson-Trutza',
      'J. Tang-Cabrera', 'S.T. Tsai', 'M. Elgohary', 'S. Hussein', 'S. Wei', 'L. Yuan',
      'M. McIntosh', 'A. Rech', 'M. Reyes', 'W.O. Dennis', 'T.J. Van Buren', 'D.R. Eaker',
      'G. Cameron', 'M.E. Hainy', 'B.J. Berghuis', 'C.J. Kimble', 'K.E. Bennet', 'B. Sharaf',
      'T.S. Oesterle', 'X. Chen', 'Z. Bao', 'J. Sung', 'D.P. Jang', 'C.D. Blaha', 'Y. Oh',
      'K.H. Lee',
    ],
    journal: 'Biosensors and Bioelectronics',
    year: 2026,
    volume: '293',
    pages: '118151',
    line: 'Neurochemistry',
    doi: '10.1016/j.bios.2025.118151',
  },
  {
    title:
      'Resolution of tonic concentrations of highly similar neurotransmitters using voltammetry and '
      + 'deep learning',
    authors: [
      'A. Goyal', 'J. Yuen', 'S. Sinicrope', 'B. Winter', 'L. Randall', 'A.E. Rusheen',
      'C.D. Blaha', 'K.E. Bennet', 'K.H. Lee', 'H. Shin', 'Y. Oh',
    ],
    journal: 'Molecular Psychiatry',
    year: 2024,
    volume: '29',
    pages: '3076-3085',
    line: 'Neurochemistry',
    doi: '10.1038/s41380-024-02537-1',
  },
  {
    title:
      'Deep brain stimulation alleviates tics in Tourette syndrome via striatal dopamine '
      + 'transmission',
    authors: [
      'A.E. Rusheen', 'J. Rojas-Cabrera', 'A. Goyal', 'H. Shin', 'J. Yuen', 'D.P. Jang',
      'K.E. Bennet', 'C.D. Blaha', 'K.H. Lee', 'Y. Oh',
    ],
    journal: 'Brain',
    year: 2023,
    volume: '146',
    pages: '4174-4190',
    line: 'Neurochemistry',
    doi: '10.1093/brain/awad142',
  },
  {
    title:
      'Tracking tonic dopamine levels in vivo using multiple cyclic square wave voltammetry',
    authors: [
      'Y. Oh', 'M.L. Heien', 'C. Park', 'Y.M. Kang', 'J. Kim', 'S.L. Boschen', 'H. Shin',
      'H.U. Cho', 'C.D. Blaha', 'K.E. Bennet', 'H.K. Lee', 'S.J. Jung', 'I.Y. Kim', 'K.H. Lee',
      'D.P. Jang',
    ],
    journal: 'Biosensors and Bioelectronics',
    year: 2018,
    volume: '121',
    pages: '174-182',
    line: 'Neurochemistry',
    doi: '10.1016/j.bios.2018.08.034',
  },
];

/** Bolded wherever they appear in an author list. */
export const founders = ['K.H. Lee', 'K.E. Bennet', 'S.J. Goerss'];

/** Section order on the page. Derived, so a new `line` appears on its own. */
export const publicationLines = [...new Set(publications.map((p) => p.line))];

export const publicationLineBlurbs = {
  Stereotaxy:
    'Getting a probe to a target: frame geometry, image guidance, and what happened '
    + 'when the system was taken from the bench into an operating room.',
  Neurochemistry:
    'Measuring what the brain is doing chemically while it is being stimulated — the '
    + 'sensing work the founders’ laboratory has run since 2018.',
};

/** doi.org rather than the publisher’s own URL: it outlives site redesigns. */
export const doiLink = (p) => `https://doi.org/${p.doi}`;
