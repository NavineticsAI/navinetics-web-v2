import React from 'react';
import { motion } from 'framer-motion';

export default function Investment() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 flex items-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl p-10 md:p-16 shadow-lg border border-gray-100 text-center relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 rounded-full bg-emerald-50 blur-3xl opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 rounded-full bg-teal-50 blur-3xl opacity-60 pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-8">
              Investment Opportunities
            </h1>
            
            <div className="prose prose-lg text-gray-600 mx-auto font-light leading-relaxed mb-10 max-w-2xl">
              <p>
                <strong>NaviNetics, Inc.</strong> and <strong>NaviNetics NeuroModulation, Inc.</strong> are both seeking investment to further our mission to create medical devices that change people's lives. 
              </p>
              <p>
                We invite interested investors to join us in shaping the future of neuromodulation and advanced stereotactic technologies. Together, we can accelerate the development of solutions that improve clinical outcomes and patient comfort.
              </p>
            </div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <a 
                href="mailto:info@navinetics.com" 
                className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-full font-medium text-lg hover:bg-emerald-700 transition-colors duration-300 shadow-md shadow-emerald-200"
              >
                Inquire About Investing
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
