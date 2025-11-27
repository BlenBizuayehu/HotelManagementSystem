import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/rooms', label: 'Rooms' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${isScrolled ? 'text-blue-900' : 'text-white'}`}>
              HAILE HOTELS
            </div>
            <div className={`text-xs ${isScrolled ? 'text-blue-600' : 'text-white'}`}>
              & RESORTS
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors ${
                  location.pathname === link.path
                    ? isScrolled
                      ? 'text-blue-900 font-semibold'
                      : 'text-white font-semibold'
                    : isScrolled
                    ? 'text-gray-700 hover:text-blue-900'
                    : 'text-white hover:text-blue-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/booking"
              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            <i className={`fas fa-${isMobileMenuOpen ? 'times' : 'bars'} text-2xl`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 ${
                  location.pathname === link.path
                    ? 'text-blue-900 font-semibold'
                    : 'text-gray-700 hover:text-blue-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/booking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block bg-blue-900 text-white px-6 py-2 rounded-lg text-center hover:bg-blue-800"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
