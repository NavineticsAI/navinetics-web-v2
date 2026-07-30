import React from 'react';
import { motion } from 'framer-motion';

export default function Careers() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 flex items-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl p-10 md:p-16 shadow-lg border border-gray-100 text-center relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-50 blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-50 blur-3xl opacity-50 pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-8">
              Careers at NaviNetics
            </h1>
            
            <div className="prose prose-lg text-gray-600 mx-auto font-light leading-relaxed mb-10">
              <p>
                NaviNetics is a design and development company with a core of engineers and regulatory specialists bringing medical devices to market. Our partnerships reach from the research laboratory to the bedside with access to cutting-edge technology and worldwide resources.
              </p>
              <p>
                A career at NaviNetics gives opportunities to grow and develop your skills in a highly collaborative and supportive environment. We have a passion for making a meaningful difference in people's lives and are always seeking fellow innovators and problem-solvers.
              </p>
            </div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <a 
                href="mailto:info@navinetics.com" 
                className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-full font-medium text-lg hover:bg-black transition-colors duration-300 shadow-md"
              >
                Contact Us About Careers
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
