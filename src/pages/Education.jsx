import { usePageMeta } from '../lib/meta.js';
import {
  Accordion,
  Hero,
  ProductPlate,
  Reveal,
  Section,
  SectionHead,
} from '../ui/index.js';

const sections = [
  {
    id: 'dbs',
    title: 'Deep Brain Stimulation',
    image: '/model-head-clean-750x998-1-451x600.png',
    fit: 'contain',
    body: 'Deep brain stimulation (DBS) involves implanting electrodes within certain areas of the brain. These electrodes produce electrical impulses that regulate abnormal impulses, or affect certain cells and chemicals within the brain. The amount of stimulation is controlled by a pacemaker-like device placed under the skin in the upper chest, connected to the electrodes by a wire that travels under the skin.',
    lists: [
      {
        title: 'Commonly used to treat',
        tone: 'action',
        items: [
          "Parkinson's disease",
          'Essential tremor',
          'Dystonia',
          'Epilepsy',
          'Obsessive-compulsive disorder',
        ],
      },
      {
        title: 'Being studied for',
        tone: 'muted',
        items: [
          'Tourette syndrome',
          "Huntington's disease and chorea",
          'Chronic pain',
          'Cluster headache',
        ],
      },
    ],
  },
  {
    id: 'stereotaxy',
    title: 'Stereotactic Neurosurgery',
    image: '/DSC05397-1024x695.jpg',
    fit: 'cover',
    body: 'Stereotactic technology allows for navigation and accurate targeting of specific structures in the body. In functional neurosurgery it is employed to target brain nuclei for the treatment of movement disorders, primarily Parkinson’s disease and essential tremor. Historically, stereotactic head frames have used a large base ring fixed around the patient’s head. Frameless systems — and the NaviNetics stereotactic frame — attach near the top of the head using smaller hardware components.',
    detail: {
      label: 'The arc-centred principle',
      body: 'Three linear degrees of freedom (X, Y, Z) place the target at the focus, or iso-center, of the arc, while two angular rotations about that focus set the trajectory. Fixation to the skull establishes a three-dimensional coordinate system, providing a link between imaging data and patient anatomy. The instrument carrier holds and guides electrodes, leads and surgical instruments along a trajectory projecting through the iso-center, allowing a target to be approached from a multitude of directions.',
    },
  },
  {
    id: 'neurochemical',
    title: 'Neurochemical Detection',
    image: '/WINC-Harmoni-Device.png',
    fit: 'contain',
    body: 'Neurotransmitters such as dopamine, serotonin and norepinephrine are instrumental in normal brain function. To measure them accurately and safely we have developed both measuring techniques and hardware — the Wireless Instantaneous Neurotransmitter Concentration Sensing System, WINCS — enabling preclinical research and human recordings. Abnormal levels of neurochemicals are implicated in a host of psychiatric and neurological disorders including addiction, obsessive-compulsive disorder, depression, epilepsy, and both essential and Parkinsonian tremor.',
    detail: {
      label: 'Why real-time measurement matters',
      body: 'An important focus of neuroscience research is to understand the complex relationships between electrophysiologic activity and neurochemicals in normal and abnormal brain function. One means to understand these relationships is to assess concentrations of neurotransmitters in real time in the tissue using electrochemistry — sensing the specific oxidation and reduction potentials used to identify each neurotransmitter.',
    },
  },
  {
    id: 'phasic',
    title: 'Phasic Concentration Recording',
    image: '/surgical_probe.png',
    fit: 'contain',
    body: 'In fast-scan cyclic voltammetry (FSCV), the potential of the electrode is linearly scanned, causing molecules adjacent to the electrode to be oxidised or reduced. The measured current provides chemical information about the surrounding environment. Under typical fast-scan conditions the potential is cycled between −0.4 V and 1.0 V against a reference electrode; scan rate and potential limits determine sensitivity, selectivity and time resolution.',
    detail: {
      label: 'Background subtraction',
      body: 'During fast-scan cyclic voltammetry a large background current is produced, which requires digital background subtraction to reveal changes in neurochemicals. The resulting background-subtracted cyclic voltammogram indicates the change in current attributable to oxidation and reduction of the target neurochemical.',
    },
  },
  {
    id: 'absolute',
    title: 'Absolute Concentration Recording',
    image: '/microdrive-image-1024x797.png',
    fit: 'contain',
    body: 'Multiple cyclic square wave voltammetry (MCSWV) measures the absolute concentration of neurochemicals in the brain extracellular space. It uses square waveforms together with a delayed holding potential period to control neurotransmitter adsorption to the electrode surface.',
    detail: {
      label: 'Selectivity',
      body: 'Dynamic background subtraction and capacitive current modelling eliminate large capacitive background currents, allowing basal neurotransmitter concentrations to be measured. MCSWV has demonstrated high sensitivity and selectivity against potential electroactive interferents, including ascorbic acid, DOPAC, and pH changes.',
    },
  },
];

export default function Education() {
  usePageMeta({
    title: 'Education',
    description:
      'The science behind NaviNetics — deep brain stimulation, stereotactic neurosurgery, and neurochemical detection explained.',
  });

  return (
    <>
      <Hero
        eyebrow="Resources — Education"
        title="The science behind the devices."
        lead="Learn about the technologies and methodologies driving our work in neuromodulation and stereotactic neurosurgery."
      />

      {/* Section index — a real sequence, so numbering carries information */}
      <Section band className="!py-12">
        <nav aria-label="On this page">
          <ol className="flex flex-wrap gap-x-6 gap-y-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="group/idx inline-flex items-baseline gap-2 text-sm text-ink-2 transition-colors hover:text-action"
                >
                  <span className="font-data text-[0.6875rem] text-ink-3 group-hover/idx:text-action">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </Section>

      {sections.map((s, i) => (
        <Section key={s.id} id={s.id} wide band={i % 2 === 1} className="scroll-mt-24">
          <div
            className={`flex flex-col items-start gap-10 lg:gap-16 ${
              i % 2 ? 'lg:flex-row-reverse' : 'lg:flex-row'
            }`}
          >
            <Reveal className="w-full lg:w-[45%] lg:sticky lg:top-28">
              <ProductPlate
                src={s.image}
                alt={s.title}
                fit={s.fit}
                className="aspect-[4/3] w-full"
              />
            </Reveal>

            <div className="w-full lg:w-[55%]">
              <SectionHead
                eyebrow={`${String(i + 1).padStart(2, '0')} — Education`}
                title={s.title}
              />
              {/* Prose sits on an opaque surface. Never glass. */}
              <p className="mt-6 max-w-prose leading-[1.7] text-ink-2">{s.body}</p>

              {s.lists && (
                <div className="mt-10 flex flex-col gap-8">
                  {s.lists.map((list) => (
                    <div key={list.title}>
                      <h3 className="eyebrow text-ink-3">{list.title}</h3>
                      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                        {list.items.map((item) => (
                          <li key={item} className="flex items-center gap-3 text-sm">
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                list.tone === 'action' ? 'bg-action' : 'bg-ink-3'
                              }`}
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Progressive disclosure: the paragraph only researchers want */}
              {s.detail && (
                <Accordion
                  className="mt-8"
                  items={[
                    { id: `${s.id}-detail`, label: s.detail.label, body: s.detail.body },
                  ]}
                />
              )}
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}
