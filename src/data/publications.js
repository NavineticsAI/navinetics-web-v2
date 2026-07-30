/**
 * Publication records. Filter options derive from this array, so adding a
 * record with a new journal adds the filter option automatically.
 */
export const publications = [
  {
    title: 'Deep Brain Stimulation for Addictive Disorders—Where Are We Now?',
    authors: 'J Yuen, AZ Kouzani, M Berk, SJ Tye, AE Rusheen, CD Blaha, KE Bennet, et al.',
    journal: 'Neurotherapeutics',
    year: 2022,
    topics: ['Neuromodulation'],
    link: 'https://doi.org/10.1007/s13311-022-01229-4',
  },
  {
    title:
      'Effectiveness of Thalamic Ventralis Oralis Anterior and Posterior Nuclei Deep Brain Stimulation for Posttraumatic Dystonia',
    authors: 'RL Owen, SS Grewal, JM Thompson, A Hassan, KH Lee, BT Klassen',
    journal: 'Mayo Clinic Proceedings',
    year: 2022,
    topics: ['Neuromodulation'],
    link: 'https://doi.org/10.1016/j.mayocpiqo.2022.01.001',
  },
  {
    title: 'The development of ultra–high field MRI guidance technology for neuronavigation',
    authors: 'AE Rusheen, A Goyal, RL Owen, EM Berning, DT Bothun, RE Giblon, et al.',
    journal: 'Journal of Neurosurgery',
    year: 2022,
    topics: ['Stereotaxy'],
    link: 'https://doi.org/10.3171/2021.11.jns211078',
  },
  {
    title: 'Biomarkers for deep brain stimulation in animal models of depression',
    authors: 'J Yuen, AE Rusheen, JB Price, AS Barath, H Shin, AZ Kouzani, M Berk, et al.',
    journal: 'Neuromodulation: Technology at the Neural Interface',
    year: 2022,
    topics: ['Neuromodulation'],
    link: 'https://doi.org/10.1111/ner.13483',
  },
  {
    title: 'Enhanced Dopamine Sensitivity Using Steered Fast-Scan Cyclic Voltammetry',
    authors: 'Y Kang, A Goyal, S Hwang, C Park, HU Cho, H Shin, J Park, KE Bennet, et al.',
    journal: 'ACS Omega',
    year: 2021,
    topics: ['Neurochemistry'],
    link: 'https://doi.org/10.1021/acsomega.1c04475',
  },
  {
    title:
      'Development and validation of a rapidly deployable CT-guided stereotactic system for external ventricular drainage: preclinical study',
    authors: 'AS Barath, AE Rusheen, JMR Cabrera, H Shin, CD Blaha, KE Bennet, et al.',
    journal: 'Scientific Reports',
    year: 2021,
    topics: ['Stereotaxy'],
    link: 'https://doi.org/10.1038/s41598-021-97080-2',
  },
  {
    title: 'DeepNavNet: Automated Landmark Localization for Neuronavigation',
    authors: 'CA Edwards, A Goyal, AE Rusheen, AZ Kouzani, KH Lee',
    journal: 'Frontiers in Neuroscience',
    year: 2021,
    topics: ['Stereotaxy'],
    link: 'https://doi.org/10.3389/fnins.2021.670287',
  },
  {
    title: 'A compact stereotactic system for image-guided surgical intervention',
    authors: 'AE Rusheen, AS Barath, A Goyal, JH Barnett, BT Gifford, KE Bennet, et al.',
    journal: 'Journal of Neural Engineering',
    year: 2020,
    topics: ['Stereotaxy'],
    link: 'https://doi.org/10.1088/1741-2552/abc743',
  },
  {
    title:
      'Advances in neurochemical measurements: A review of biomarkers and devices for the development of closed-loop deep brain stimulation systems',
    authors: 'JMR Cabrera, JB Price, AE Rusheen, A Goyal, D Jondal, AS Barath, et al.',
    journal: 'Reviews in Analytical Chemistry',
    year: 2020,
    topics: ['Neurochemistry', 'Neuromodulation'],
    link: 'https://doi.org/10.1515/revac-2020-0117',
  },
  {
    title: 'Wireless intraoperative real-time monitoring of neurotransmitters in humans',
    authors: 'E Bah, J Hachmann, SB Paek, A Batton, PK Min, K Bennet, K Lee',
    journal: 'IEEE International Symposium',
    year: 2017,
    topics: ['Neurochemistry'],
    link: 'https://doi.org/10.1109/memea.2017.7985861',
  },
];

const uniqSorted = (values) => [...new Set(values)].sort();

export const publicationYears = uniqSorted(publications.map((p) => p.year)).reverse();
export const publicationJournals = uniqSorted(publications.map((p) => p.journal));
export const publicationTopics = uniqSorted(publications.flatMap((p) => p.topics));
