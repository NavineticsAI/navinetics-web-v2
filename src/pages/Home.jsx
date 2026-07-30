import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-16">
        <motion.div 
          style={{ y: heroY }}
          className="absolute inset-0 z-0 opacity-60 flex items-center justify-center pointer-events-none"
        >
           {/* Soft glowing background effect */}
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-[120px]"></div>
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-xl md:text-2xl font-medium tracking-widest text-blue-600 mb-6 uppercase">NaviNetics</h2>
            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-semibold text-gray-900 tracking-tighter mb-8 leading-tight">
              Innovate. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Elevate.</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-500 font-light max-w-3xl mx-auto tracking-tight mb-12">
              Transforming the future of neurosurgery through unparalleled precision and patient comfort.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/what-we-do/navinetics-frame-system" className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-full font-semibold text-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1">
                Discover the Frame System
              </Link>
              <Link to="/who-we-are" className="w-full sm:w-auto bg-gray-100 text-gray-900 px-10 py-5 rounded-full font-semibold text-xl hover:bg-gray-200 transition-all">
                Who We Are
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature 1: Radical Simplicity */}
      <section className="py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-1/2"
          >
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter text-gray-900 mb-6">Radical Simplicity.</h2>
            <p className="text-2xl text-gray-500 font-light leading-relaxed mb-8 tracking-tight">
              We stripped away the complexity of traditional stereotactic frames, creating a system that gets out of the surgeon's way while maximizing precision.
            </p>
            <Link to="/what-we-do/navinetics-frame-system" className="text-blue-600 font-semibold text-xl flex items-center hover:text-blue-800 transition-colors">
              Explore the Frame System 
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-1/2 w-full aspect-square rounded-[3rem] overflow-hidden bg-gray-50 p-12 flex items-center justify-center relative group shadow-2xl shadow-gray-200/50"
          >
            <img 
              src="/model-head-clean-750x998-1-451x600.png" 
              alt="NaviNetics Frame System" 
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          </motion.div>
        </div>
      </section>

      {/* Feature 2: Neuromodulation */}
      <section className="py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-1/2"
          >
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter text-gray-900 mb-6">Advanced Neuromodulation.</h2>
            <p className="text-2xl text-gray-500 font-light leading-relaxed mb-8 tracking-tight">
              Improving the efficacy of deep brain stimulation (DBS) by studying the role of neurochemical and electrophysiological biomarkers with the WINCS Harmoni Device.
            </p>
            <Link to="/what-we-do/neuromodulation" className="text-blue-600 font-semibold text-xl flex items-center hover:text-blue-800 transition-colors">
              Discover Neuromodulation 
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-1/2 w-full aspect-square rounded-[3rem] overflow-hidden bg-gray-50 p-12 flex items-center justify-center relative group shadow-2xl shadow-gray-200/50"
          >
            <img 
              src="/WINC-Harmoni-Device.png" 
              alt="WINCS Harmoni Device" 
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          </motion.div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter text-gray-900 mb-6">Designed for the Future.</h2>
          <p className="text-2xl text-gray-500 font-light max-w-3xl mx-auto tracking-tight">
            Our technology is built to improve surgical workflow, enhance patient comfort, and deliver exceptional accuracy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#f5f5f7] rounded-[2rem] p-10 flex flex-col justify-between overflow-hidden relative group h-[400px]"
          >
            <div className="relative z-10 max-w-md">
              <h3 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">Unprecedented Access</h3>
              <p className="text-lg text-gray-600 font-light leading-relaxed">
                The anchor key replaces the bulky head ring, leaving the patient's face completely unobstructed and giving the surgical team full access.
              </p>
            </div>
            {/* The skull anchor image might not exist, but let's assume it does. Or we can just use the frame image. I will use the model head image again but offset. */}
            <img 
              src="/model-head-clean-750x998-1-451x600.png" 
              alt="Skull Anchor" 
              className="absolute right-[-10%] top-[-10%] w-[60%] opacity-80 mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out" 
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-span-1 bg-blue-600 rounded-[2rem] p-10 flex flex-col justify-center items-center text-center text-white shadow-xl h-[400px]"
          >
            <h3 className="text-3xl font-semibold mb-4 tracking-tight">Mayo Clinic Roots</h3>
            <p className="text-lg text-blue-100 font-light leading-relaxed mb-8">
              Born from the Neural Engineering Laboratories at Mayo Clinic, built on decades of clinical experience.
            </p>
            <Link to="/who-we-are/our-founders" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-full font-medium hover:bg-blue-50 transition-colors">
              Meet the Founders
            </Link>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
