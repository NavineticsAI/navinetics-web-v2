import React from 'react';
import { motion } from 'framer-motion';

const topPublications = [
  {
    title: "Deep Brain Stimulation for Addictive Disorders—Where Are We Now?",
    authors: "J Yuen, AZ Kouzani, M Berk, SJ Tye, AE Rusheen, CD Blaha, KE Bennet, ...",
    journal: "Neurotherapeutics",
    year: "2022",
    link: "https://doi.org/10.1007/s13311-022-01229-4"
  },
  {
    title: "Effectiveness of Thalamic Ventralis Oralis Anterior and Posterior Nuclei Deep Brain Stimulation for Posttraumatic Dystonia",
    authors: "RL Owen, SS Grewal, JM Thompson, A Hassan, KH Lee, BT Klassen",
    journal: "Mayo Clinic Proceedings",
    year: "2022",
    link: "https://doi.org/10.1016/j.mayocpiqo.2022.01.001"
  },
  {
    title: "The development of ultra–high field MRI guidance technology for neuronavigation",
    authors: "AE Rusheen, A Goyal, RL Owen, EM Berning, DT Bothun, RE Giblon, ...",
    journal: "Journal of Neurosurgery",
    year: "2022",
    link: "https://doi.org/10.3171/2021.11.jns211078"
  },
  {
    title: "Biomarkers for deep brain stimulation in animal models of depression",
    authors: "J Yuen, AE Rusheen, JB Price, AS Barath, H Shin, AZ Kouzani, M Berk, ...",
    journal: "Neuromodulation: Technology at the Neural Interface",
    year: "2022",
    link: "https://doi.org/10.1111/ner.13483"
  },
  {
    title: "Enhanced Dopamine Sensitivity Using Steered Fast-Scan Cyclic Voltammetry",
    authors: "Y Kang, A Goyal, S Hwang, C Park, HU Cho, H Shin, J Park, KE Bennet, ...",
    journal: "ACS omega",
    year: "2021",
    link: "https://doi.org/10.1021/acsomega.1c04475"
  },
  {
    title: "Development and validation of a rapidly deployable CT-guided stereotactic system for external ventricular drainage: preclinical study",
    authors: "AS Barath, AE Rusheen, JMR Cabrera, H Shin, CD Blaha, KE Bennet, ...",
    journal: "Scientific reports",
    year: "2021",
    link: "https://doi.org/10.1038/s41598-021-97080-2"
  },
  {
    title: "DeepNavNet: Automated Landmark Localization for Neuronavigation",
    authors: "CA Edwards, A Goyal, AE Rusheen, AZ Kouzani, KH Lee",
    journal: "Frontiers in Neuroscience",
    year: "2021",
    link: "https://doi.org/10.3389/fnins.2021.670287"
  },
  {
    title: "A compact stereotactic system for image-guided surgical intervention",
    authors: "AE Rusheen, AS Barath, A Goyal, JH Barnett, BT Gifford, KE Bennet, ...",
    journal: "Journal of neural engineering",
    year: "2020",
    link: "https://doi.org/10.1088/1741-2552/abc743"
  },
  {
    title: "Advances in neurochemical measurements: A review of biomarkers and devices for the development of closed-loop deep brain stimulation systems",
    authors: "JMR Cabrera, JB Price, AE Rusheen, A Goyal, D Jondal, AS Barath, ...",
    journal: "Reviews in analytical chemistry",
    year: "2020",
    link: "https://doi.org/10.1515/revac-2020-0117"
  },
  {
    title: "Wireless intraoperative real-time monitoring of neurotransmitters in humans",
    authors: "E Bah, J Hachmann, SB Paek, A Batton, PK Min, K Bennet, K Lee",
    journal: "IEEE International Symposium",
    year: "2017",
    link: "https://doi.org/10.1109/memea.2017.7985861"
  }
];

export default function Publications() {
  return (
    <div className="pt-40 pb-32 min-h-screen bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-32 text-center"
        >
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-gray-900 mb-8">
            Publications.
          </h1>
          <p className="text-2xl text-gray-500 font-light leading-relaxed max-w-4xl mx-auto tracking-tight">
            Our team actively contributes to scientific advancement. Explore our selected research spanning neurostimulation, advanced stereotactics, and neurochemical monitoring.
          </p>
        </motion.div>

        <div className="flex flex-col gap-12">
          {topPublications.map((pub, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <a 
                href={pub.link}
                target="_blank"
                rel="noreferrer"
                className="bg-white rounded-[2rem] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-500 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group block hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-[#f5f5f7] text-gray-800 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
                      {pub.year}
                    </span>
                    <span className="text-blue-600 font-medium tracking-wide">
                      {pub.journal}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-6 group-hover:text-blue-600 transition-colors">
                    {pub.title}
                  </h3>
                  <p className="text-xl text-gray-500 font-light leading-relaxed">
                    {pub.authors}
                  </p>
                </div>
                
                <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 relative z-10 group-hover:scale-110">
                  <svg className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <p className="text-2xl text-gray-400 font-light tracking-tight">
            And over 100+ more publications spanning decades of research.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
