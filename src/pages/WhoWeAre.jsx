import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function WhoWeAre() {
  return (
    <div className="bg-white min-h-screen pt-40 pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-32"
        >
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-gray-900 mb-8">
            About NaviNetics.
          </h1>
          <p className="text-2xl text-gray-500 font-light max-w-4xl mx-auto leading-relaxed tracking-tight">
            We strive to make medical devices that change people's lives. We do this by listening to the patient and physician and translating these conversations into safe, effective and high-quality device offerings.
          </p>
          <p className="mt-8 text-xl font-medium text-blue-600 tracking-wide">
            A commitment to quality and simplicity is at the forefront of everything we do.
          </p>
        </motion.div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          
          {/* Founders Link */}
          <Link to="/who-we-are/our-founders">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#f5f5f7] rounded-[3rem] p-12 h-full cursor-pointer group hover:bg-gray-100 transition-colors"
            >
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 mb-10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold text-gray-900 mb-6 tracking-tight">The Visionaries</h2>
              <p className="text-xl text-gray-500 font-light leading-relaxed">
                Meet the leaders behind NaviNetics. With decades of combined experience in neurosurgery, biomedical engineering, and technology development.
              </p>
              <div className="mt-12 text-blue-600 font-medium text-lg flex items-center group-hover:gap-3 transition-all">
                Read their bios
                <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </motion.div>
          </Link>

          {/* Community Link */}
          <Link to="/who-we-are/community">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#f5f5f7] rounded-[3rem] p-12 h-full cursor-pointer group hover:bg-gray-100 transition-colors"
            >
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-emerald-600 mb-10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold text-gray-900 mb-6 tracking-tight">Our Community</h2>
              <p className="text-xl text-gray-500 font-light leading-relaxed">
                Located in the heart of Downtown Rochester, MN. Learn more about the vibrant community that fosters our innovation and growth.
              </p>
              <div className="mt-12 text-emerald-600 font-medium text-lg flex items-center group-hover:gap-3 transition-all">
                Explore our location
                <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </motion.div>
          </Link>

        </div>
      </div>
    </div>
  );
}
