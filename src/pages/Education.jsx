import React from 'react';
import { motion } from 'framer-motion';

const educationSections = [
  {
    title: 'Deep Brain Stimulation (DBS)',
    content: "Deep brain stimulation (DBS) involves implanting electrodes within certain areas of the brain. These electrodes produce electrical impulses that regulate abnormal impulses. Or the electrical impulses can affect certain cells and chemicals within the brain. The amount of stimulation in deep brain stimulation is controlled by a pacemaker-like device placed under the skin in your upper chest. A wire that travels under your skin connects this device to the electrodes in your brain.",
    image: '/model-head-clean-750x998-1-451x600.png',
    bullets: [
      "Parkinson's disease",
      "Essential tremor",
      "Dystonia",
      "Epilepsy",
      "Obsessive-compulsive disorder"
    ],
    researchBullets: [
      "Tourette syndrome",
      "Huntington's disease and chorea",
      "Chronic pain",
      "Cluster headache"
    ],
    objectFit: 'contain'
  },
  {
    title: 'Stereotactic Neurosurgery',
    content: "Stereotactic technology allows for navigation and accurate targeting of specific structures in the body. In functional neurosurgery stereotactic technology is employed to target brain nuclei for the treatment of movement disorders, primarily Parkinson’s disease and Essential Tremor. Historically, stereotactic head frames have used a large base ring that fixes to the patient around their head. Frameless systems, as well as the NaviNetics Stereotactic frame attach to the patient near the top of their heading using smaller hardware components.",
    subcontent: "Many frame-based systems including the NaviNetics Reusable Stereotactic System function using the arc-centered principle for targeting. Three (3) linear degrees of freedom (X,Y,Z) place the target at the focus (iso-center) of the arc, while the two angular rotations about the focus of the arc set the trajectory. Fixation of a frame-based system to the skull establishes a 3-dimensional coordinate system, providing a link between imaging data and patient anatomy. This enables definition of a stereotactic (X,Y,Z) target within the device’s work envelope. Arc-centered systems have rotational elements having two angular degrees of freedom, one rotating about the X axis (Ring or Collar Angle) and the other about the Y axis (Arc Angle). The X and Y axes pivot about a single point called the iso-center or focus which is the stereotactic target. The instrument carrier functions to hold and guide electrodes, leads, and surgical instruments along a trajectory that projects through the iso-center. The two degrees of freedom of the arc device allow the iso-center to be approached from a multitude of directions, allowing surgeons to optimize the path used to reach a stereotactic target.",
    image: '/DSC05397-1024x695.jpg',
    objectFit: 'cover'
  },
  {
    title: 'Neurochemical Detection',
    content: "The neurobiology of processes that occur in the brain and associated neurological diseases are highly complex. Neurotransmitters such as dopamine, serotonin and norepinephrine are instrumental in the normal functioning of the human brain. To measure these neurotransmitters accurately and safely, We have been involved in developing both cutting-edge measuring techniques and hardware (Wireless Instantaneous Neurotransmitter Concentration Sensing System, 'WINCS') that enable both research development in preclinical studies and human recordings. Abnormal levels of neurochemicals in the brain and associated changes in electrophysiological activities are implicated in a host of human psychiatric and neurological disorders including addiction, obsessive-compulsive disorder, depression, epilepsy, and both essential and Parkinsonian tremor.",
    subcontent: "An important focus of neuroscience research is to fully understand the complex relationships between electrophysiologic activities and neurochemicals in normal and abnormal brain function. One means to understand these relationships is to assess concentrations of neurotransmitters in real time in the tissue using electrochemistry. This technique involves sensing specific oxidation and reduction potentials used to identify neurotransmitters.",
    image: '/WINC-Harmoni-Device.png',
    objectFit: 'contain'
  },
  {
    title: 'Phasic Concentration Recording',
    content: "In fast-scan cyclic voltammetry (FSCV), the potential of the electrode is linearly scanned and causes molecules adjacent to the electrode to be oxidized or reduced. The measured current provides chemical information of the surrounding environment. A triangle waveform is applied intermittently to the electrode. The scan rate and potential limits determine the length of each waveform. Under typical fast-scan conditions, the potential of a sensing electrode is cycled between -0.4 V and 1.0 V, vs a reference electrode. Variations in these settings affect the sensitivity, selectivity, and time resolution of the measurements.",
    subcontent: "During fast-scan cyclic voltammetry, a large background current is produced which requires background subtraction digitally to reveal changes neurochemicals. The resulting background-subtracted cyclic voltammogram indicates the change in current that is attributable to oxidation and reduction of target neurochemical.",
    image: '/surgical_probe.png',
    objectFit: 'contain'
  },
  {
    title: 'Absolute Concentration Recording',
    content: "Multiple cyclic square wave voltammetry (MCSWV) enables voltametric technique to measure absolute concentration of neurochemicals existing in the brain extracellular space. MCSWV uses square waveforms in conjunction with a delayed holding potential period to control neurotransmitters adsorption to electrode surface.",
    subcontent: "Dynamic background subtraction and capacitive current modeling eliminate large capacitive background currents, allowing basal neurotransmitters concentrations to be measured. MCSWV demonstrated high sensitivity and selectivity against potential electroactive interferents, including ascorbic acid, DOPAC, and pH changes.",
    image: '/microdrive-image-1024x797.png',
    objectFit: 'contain'
  }
];

export default function Education() {
  return (
    <div className="pt-40 pb-32 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-32"
        >
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-gray-900 mb-8">
            Education.
          </h1>
          <p className="text-2xl text-gray-500 font-light max-w-4xl mx-auto leading-relaxed tracking-tight">
            Learn about the science, technologies, and methodologies driving our innovations in neuromodulation and stereotactic neurosurgery.
          </p>
        </motion.div>

        <div className="space-y-40">
          {educationSections.map((section, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-150px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 lg:gap-24 items-center`}
              >
                <div className="lg:w-1/2 w-full relative">
                  {/* Cool glowing background effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-emerald-400/20 rounded-[3rem] blur-3xl opacity-50 pointer-events-none"></div>
                  
                  <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm border border-white/20 flex items-center justify-center p-8 relative group z-10">
                    <motion.img 
                      src={section.image} 
                      alt={section.title} 
                      className={`w-full h-full ${section.objectFit === 'contain' ? 'object-contain p-8 drop-shadow-2xl' : 'object-cover'} mix-blend-multiply transition-transform duration-1000 ease-out`} 
                      animate={section.objectFit === 'contain' ? { y: [0, -15, 0] } : {}}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 6, 
                        ease: "easeInOut",
                        delay: idx * 0.5 // Stagger the floating animations
                      }}
                      whileHover={{ scale: 1.05 }}
                    />
                  </div>
                </div>

                <div className="lg:w-1/2">
                  <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-8">{section.title}</h2>
                  <div className="space-y-6 text-xl text-gray-600 font-light leading-relaxed tracking-wide">
                    <p>{section.content}</p>
                    
                    {section.subcontent && (
                      <p>{section.subcontent}</p>
                    )}

                    {section.bullets && (
                      <div className="mt-12">
                        <h3 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">Commonly used to treat</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {section.bullets.map(bullet => (
                            <li key={bullet} className="flex items-center space-x-4">
                              <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                              <span className="text-lg text-gray-700">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {section.researchBullets && (
                      <div className="mt-12">
                        <h3 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">Being studied for</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {section.researchBullets.map(bullet => (
                            <li key={bullet} className="flex items-center space-x-4">
                              <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0"></span>
                              <span className="text-lg text-gray-700">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
