import React from 'react';
import { motion } from 'framer-motion';

const foundersData = [
  {
    name: 'Kendall H. Lee, M.D, Ph.D.',
    role: 'Co-Director & Co-Founder',
    bio: [
      "Dr. Lee earned his B.A. in biology with a minor in philosophy (Summa Cum Laude) from the University of Colorado at Denver. He attended Yale University Graduate School, where he received his Master of Philosophy, M.D. (Cum Laude) and Ph.D. in neurobiology. He completed an internship in internal medicine at the Hospital of St. Raphael, Yale University School of Medicine and a residency in neurology at Harvard Medical School.",
      "He furthered trained at Dartmouth Hitchcock Medical Center, completing an internship in general surgery and a residency and chief residency in neurosurgery. In his clinical practice, Dr. Lee is an expert on neurological disorders, seeing patients with Parkinson's disease, Tourette's syndrome, dystonia, and other neurodegenerative diseases.",
      "His research focuses on developing deep brain stimulation for the treatment of Parkinson's disease, tremor, depression, obsessive-compulsive disorder and epilepsy. Dr. Lee is fascinated with the possibility of combining sophisticated electrophysiological and electrochemical recordings with miniaturized analytical elements (microprocessors) to augment or repair disrupted function of the brain.",
      "His team was awarded the Mayo Clinic Distinguished Team Science award in 2015. He was a Commander in the US Navy Reserve and in 2013 served a 6-month deployment in Germany, using his neurosurgery skills to treat soldiers wounded in the conflict in the Middle East.",
      "Dr. Lee is a consultant in the Mayo Clinic Rochester, MN Department of Neurologic Surgery with joint appointments in the Department of Physiology and Biomedical Engineering and the Department of Physical Medicine and Rehabilitation at Mayo Clinic in Rochester, Minnesota. He holds the academic rank of professor of Neurosurgery and Biomedical Engineering. Dr. Lee is one of the co-founders of the Neural Engineering Laboratories and currently serves as Co-Director."
    ],
    image: '/kendall-lee-150-500x400-1.jpg'
  },
  {
    name: 'Kevin E. Bennet, MBA, Ph.D.',
    role: 'Co-Director & Co-Founder',
    bio: [
      "Dr. Bennet has over 30 years of experience in technology development with organizations including Mayo Clinic, W.R. Grace & Co., Exxon International and Amoco Chemicals. He has been a consultant to the National Institutes of Health and served on NIH site visit teams.",
      "He holds patents concerning neurosurgery, diamond, semiconductor and optical technology and has founded several technology-based companies. He received a degree in Chemical Engineering from the Massachusetts Institute of Technology, an MBA from Harvard and his doctorate from Deakin University.",
      "Dr. Bennet joined the Mayo Clinic in 1990 with past appointments as Chair of Strategic Alliances, Vice Chair of Information Technology Architecture Subcommittee, Clinical Practice Committee Equipment Subcommittee, Pharmacy and Therapeutics Committee, Medical/Industry Relations Committee.",
      "He is also a founder of the Mayo Clinic Neural Engineering Laboratories and currently serves as co-director. He holds additional appointments as Administrator of the Mayo Clinic Division of Engineering and Associate Professor of Neurosurgery."
    ],
    image: '/kevin-bennet-150-500x400-1.jpg'
  },
  {
    name: 'Stephan J. Goerss',
    role: 'Co-Founder',
    bio: [
      "Steve Goerss has 40 years of experience in designing and fabricating neurosurgical devices and stereotactic instrumentation. He has been awarded three patents with two more pending. He joined the Mayo Clinic in 1984 with the Department of Neurologic Surgery until 2016.",
      "During this time, he supported all computer-assisted neurosurgical procedures, trained neurosurgical residents in the use of this technology, and developed custom neurosurgical instruments and systems for the neurosurgical staff. He also became an Assistant Professor of the Mayo Medical School. He has authored and co-authored 51 peer reviewed papers and two book chapters.",
      "He joined the Neural Engineering Laboratories at the Mayo Clinic in 2016. During this tenure, he designed and developed a spinal stereotactic device, a relocatable porcine stereotactic headframe/stereotactic device, and the prototype version of the NaviNetics Reusable Stereotactic System now commercialized by NaviNetics.",
      "From 1986 to 1997, Mr. Goerss was a founder of COMPASS International, a computer-assisted stereotactic and medical device company, and served as President."
    ],
    image: '/stephan-goerss-150.jpg'
  }
];

export default function Founders() {
  return (
    <div className="bg-white min-h-screen pt-40 pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-32"
        >
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-gray-900 mb-8">
            The Visionaries
          </h1>
          <p className="text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed tracking-tight">
            Meet the pioneers behind NaviNetics, bringing decades of expertise in neurosurgery, technology development, and medical device innovation.
          </p>
        </motion.div>

        <div className="space-y-40">
          {foundersData.map((founder, index) => (
            <motion.div 
              key={founder.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 lg:gap-24 items-center`}
            >
              <div className="w-full lg:w-5/12 flex justify-center">
                <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={founder.image} 
                    alt={founder.name} 
                    className="absolute inset-0 w-full h-full object-cover object-top scale-105 hover:scale-100 transition-transform duration-1000 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
              
              <div className="w-full lg:w-7/12">
                <div className="mb-12">
                  <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4">{founder.name}</h2>
                  <p className="text-xl md:text-2xl text-blue-600 font-medium tracking-tight">{founder.role}</p>
                </div>
                <div className="space-y-6">
                  {founder.bio.map((paragraph, i) => (
                    <p key={i} className="text-lg md:text-xl text-gray-600 font-light leading-relaxed tracking-wide">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
