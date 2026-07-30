import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function FrameSystem() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Image transformations
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.4, 1]);
  const imageY = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "10%", "0%"]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 5, 0]);

  // Text box opacities and positions
  const text1Opacity = useTransform(scrollYProgress, [0, 0.1, 0.25], [0, 1, 0]);
  const text1Y = useTransform(scrollYProgress, [0, 0.1, 0.25], [50, 0, -50]);

  const text2Opacity = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 1, 0]);
  const text2Y = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [50, 0, -50]);

  const text3Opacity = useTransform(scrollYProgress, [0.75, 0.9, 1], [0, 1, 0]);
  const text3Y = useTransform(scrollYProgress, [0.75, 0.9, 1], [50, 0, -50]);



  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero Section */}
      <div className="h-screen flex items-center justify-center px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-xl md:text-2xl font-medium tracking-widest text-blue-600 mb-6 uppercase">NaviNetics</h2>
          <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-semibold tracking-tighter text-gray-900 mb-8 leading-none">
            Frame System.
          </h1>
          <p className="text-3xl md:text-4xl text-gray-400 font-light max-w-4xl mx-auto tracking-tight mb-8">
            Robust. Low complexity. <br/> Radically comfortable.
          </p>
          <p className="text-xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed">
            Stereotactic neurosurgical procedures are constrained by the costs and limitations of commercially available stereotactic devices. Our challenge was to develop a robust, low complexity stereotactic device that could be used for multiple stereotactic and functional neurosurgical applications including deep brain stimulation (DBS).
          </p>
        </motion.div>
      </div>

      {/* Sticky Scroll Section */}
      <div ref={containerRef} className="relative h-[300vh] bg-[#f5f5f7]">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          
          <motion.div 
            style={{ scale: imageScale, y: imageY, rotate: imageRotate }} 
            className="w-full h-full max-w-5xl flex items-center justify-center absolute z-0"
          >
            <img 
               src="/model-head-clean-750x998-1-451x600.png" 
               alt="Skull Anchor Key on Model" 
               className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl" 
             />
          </motion.div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-center pointer-events-none">
            
            <motion.div 
              style={{ opacity: text1Opacity, y: text1Y }} 
              className="absolute left-6 md:left-12 top-1/4 max-w-md bg-white/90 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl"
            >
              <h3 className="text-4xl font-semibold tracking-tight text-gray-900 mb-4">Anchor Key</h3>
              <p className="text-xl text-gray-600 font-light leading-relaxed">
                In place of the typical head ring of frame-based systems, a small anchor key is affixed to the patient’s skull with percutaneous screws.
              </p>
            </motion.div>

            <motion.div 
              style={{ opacity: text2Opacity, y: text2Y }} 
              className="absolute right-6 md:right-12 top-1/2 max-w-md bg-white/90 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl"
            >
              <h3 className="text-4xl font-semibold tracking-tight text-gray-900 mb-4">Patient Comfort</h3>
              <p className="text-xl text-gray-600 font-light leading-relaxed">
                Designed to be more comfortable for the patient and keeps the facial area completely free from obstruction during awake procedures.
              </p>
            </motion.div>

            <motion.div 
              style={{ opacity: text3Opacity, y: text3Y }} 
              className="absolute left-6 md:left-12 bottom-1/4 max-w-md bg-white/90 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl"
            >
              <h3 className="text-4xl font-semibold tracking-tight text-gray-900 mb-4">Total Flexibility</h3>
              <p className="text-xl text-gray-600 font-light leading-relaxed">
                Components can be seamlessly attached and removed from the anchor key, giving the surgical team unprecedented space to work.
              </p>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Frame Details Section */}
      <div className="py-40 bg-white px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-1/2"
          >
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter text-gray-900 mb-8">The Stereotactic Frame</h2>
            <div className="space-y-6 text-2xl text-gray-500 font-light leading-relaxed tracking-tight">
              <p>
                Classified as an arc centered stereotactic device, it provides three linear degrees of freedom (X, Y and Z axes) for target positioning, with two angles of rotation to optimize approach trajectory. 
              </p>
              <p>
                The compact design places all adjustments in close proximity to the surgical field, improving surgeon experience and reducing the burden of establishing the coordinate system.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-1/2 w-full"
          >
            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden bg-black flex items-center justify-center relative shadow-2xl">
               <img 
                 src="/DSC05397-1024x695.jpg" 
                 alt="Stereotactic Frame" 
                 className="w-full h-full object-cover opacity-90 hover:scale-105 hover:opacity-100 transition-all duration-1000 ease-out" 
               />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="bg-[#1d1d1f] py-40 px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-semibold mb-24 text-center tracking-tighter"
          >
            Engineered for Excellence.
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Improved patient experience with Skull Anchor Key in place of a base frame.",
              "Surgeon ease-of-use & workflow of frame-based systems with compact frameless size.",
              "Intuitive, accessible targeting adjustment of device.",
              "Device size and range optimized for accelerating DBS workflow.",
              "Excellent burr hole access and sterile field integrity throughout procedure.",
              "DBS-optimized and Frame accuracy verification accessories provided."
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur-md p-10 rounded-[2rem] border border-white/10 hover:bg-white/15 transition-colors group"
              >
                <div className="text-4xl text-blue-400 font-bold mb-6 group-hover:scale-110 transition-transform origin-left">0{i + 1}</div>
                <p className="text-xl font-light leading-relaxed text-gray-200">
                  {feature}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* System Components Section */}
      <div className="bg-white py-40 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter text-gray-900 mb-6">System Components.</h2>
            <p className="text-2xl text-gray-500 font-light">Everything you need for comprehensive targeting and access.</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              "Stereotactic Head Frame",
              "Skull Anchor Key",
              "MR Localizer",
              "CT Localizer",
              "X-ray Reticles",
              "Mechanical Microdrive",
              "DBS Lead Implantation Accessories"
            ].map((component, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-center hover:bg-blue-50 transition-colors shadow-sm hover:shadow-md cursor-default"
              >
                <p className="text-xl font-medium text-gray-800">{component}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
