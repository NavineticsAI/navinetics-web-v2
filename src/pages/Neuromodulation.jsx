import { motion } from 'framer-motion';

export default function Neuromodulation() {
  return (
    <div className="bg-white min-h-screen pt-40 pb-32">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-gray-900 mb-8">
            Neuromodulation
          </h1>
          <p className="text-2xl text-gray-500 font-light max-w-4xl mx-auto leading-relaxed tracking-tight">
            Improving the efficacy of deep brain stimulation (DBS) by studying the role of neurochemical and electrophysiological biomarkers.
          </p>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-40">
        
        {/* Content Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center"
        >
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-8">WINCS Harmoni Device</h2>
            <div className="space-y-6 text-xl text-gray-600 font-light leading-relaxed tracking-wide">
              <p>
                The Wireless Instantaneous Neurotransmitter Concentration Sensing System (WINCS) enables neurochemical recordings in subjects undergoing stimulation.
              </p>
              <p>
                Our device provides independent but synchronized neurochemical/electrophysiological measurements and stimulation. The integration minimizes the impact of stimulation artifact on the measurement, ensuring pure, uncompromised recorded data.
              </p>
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-[#f5f5f7] flex items-center justify-center p-12 relative group">
              <img 
                src="/WINC-Harmoni-Device.png" 
                alt="WINCS Harmoni Device" 
                className="w-full h-full object-contain p-8 drop-shadow-2xl mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
            </div>
          </div>
        </motion.section>

        {/* Preclinical Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row-reverse gap-16 lg:gap-24 items-center"
        >
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-8">Preclinical Research</h2>
            <div className="space-y-6 text-xl text-gray-600 font-light leading-relaxed tracking-wide">
              <p>
                WINCS can be used to quantify neuronal electrical activity and neurochemical levels such as dopamine, serotonin, and adenosine. By analyzing multimodal recordings, it addresses a critical gap in understanding normal and pathologic neurophysiology.
              </p>
              <p>
                With wireless control and telemetry, WINCS provides a seamless real-time platform for identifying and characterizing potential biomarkers.
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-white flex items-center justify-center relative group">
              <img 
                src="/WINCS-Swine-Model-1024x668.png" 
                alt="WINCS Application" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
