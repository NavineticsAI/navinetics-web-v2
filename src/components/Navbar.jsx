import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const navLinks = [
    {
      title: "Who We Are",
      path: "/who-we-are",
      dropdown: [
        { title: "About NaviNetics", path: "/who-we-are" },
        { title: "Our Founders", path: "/who-we-are/our-founders" },
        { title: "Community", path: "/who-we-are/community" }
      ]
    },
    {
      title: "What We Do",
      path: "/what-we-do/navinetics-frame-system",
      dropdown: [
        { title: "NaviNetics Frame System", path: "/what-we-do/navinetics-frame-system" },
        { title: "NaviNetics NeuroModulation", path: "/what-we-do/neuromodulation" }
      ]
    },
    {
      title: "Resources",
      path: "/resources/education",
      dropdown: [
        { title: "Education", path: "/resources/education" },
        { title: "Publications", path: "/resources/publications" }
      ]
    },
    {
      title: "Careers",
      path: "/careers"
    },
    {
      title: "Investment",
      path: "/investment-opportunities"
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/logo-378x75-1.png" alt="NaviNetics Logo" className="h-8 object-contain" />
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-6 text-sm text-brand-dark font-medium tracking-wide">
          {navLinks.map((link, idx) => (
            <div 
              key={idx} 
              className="relative group py-5"
              onMouseEnter={() => setActiveDropdown(idx)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link to={link.path} className="flex items-center gap-1 hover:text-brand-light transition-colors">
                {link.title}
                {link.dropdown && <ChevronDown size={14} className="text-brand-light/70" />}
              </Link>
              
              {link.dropdown && (
                <AnimatePresence>
                  {activeDropdown === idx && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 w-64 bg-white/90 backdrop-blur-md shadow-xl border border-gray-100 rounded-2xl overflow-hidden pt-2 pb-2"
                    >
                      {link.dropdown.map((dropItem, dropIdx) => (
                        <Link 
                          key={dropIdx} 
                          to={dropItem.path}
                          className="block px-5 py-3 hover:bg-brand-light/10 hover:text-brand-light transition-colors"
                        >
                          {dropItem.title}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
          <Link to="/contact" className="text-sm font-semibold bg-brand-dark text-white px-6 py-2.5 rounded-full hover:bg-brand-light shadow-md hover:shadow-lg transition-all ml-2">
            Contact
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="lg:hidden text-brand-dark p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-lg border-b border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col space-y-4">
              {navLinks.map((link, idx) => (
                <div key={idx} className="flex flex-col space-y-2">
                  <Link to={link.path} className="font-semibold text-lg text-brand-dark">
                    {link.title}
                  </Link>
                  {link.dropdown && (
                    <div className="flex flex-col pl-4 space-y-2 border-l-2 border-brand-light/20">
                      {link.dropdown.map((dropItem, dropIdx) => (
                        <Link key={dropIdx} to={dropItem.path} className="text-gray-600 hover:text-brand-light">
                          {dropItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link to="/contact" className="font-semibold text-lg text-brand-light mt-4">
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
