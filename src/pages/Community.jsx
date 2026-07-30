import React from 'react';
import { motion } from 'framer-motion';

export default function Community() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-1/2 space-y-6"
          >
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
              Community
            </h1>
            <h2 className="text-2xl text-blue-600 font-medium">Rochester, MN</h2>
            
            <div className="prose prose-lg text-gray-600 font-light leading-relaxed">
              <p>
                NaviNetics is located in SE Minnesota in the heart of Downtown Rochester. Rochester has been voted one of the best places to live, with growing opportunities for arts and entertainment within Rochester and just an hour drive to the twin cities.
              </p>
              <p>
                We are proud to be part of a vibrant community that fosters innovation and supports medical advancements.
              </p>
            </div>
            
            <div className="pt-4">
              <a 
                href="https://homeia.com/city-living-guide/what-is-it-like-to-live-in-rochester-mn/" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                Learn more about our community
                <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-1/2 w-full h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1579720313437-14283ce2f036?auto=format&fit=crop&q=80&w=800&h=1000" 
              alt="Rochester, MN Cityscape" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
