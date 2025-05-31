import React, { useState, useEffect, useRef } from 'react';
import { ViewMode } from '../types';
import MenuIcon from './icons/MenuIcon';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navButtonClasses = (view: ViewMode, isMobile: boolean = false) => 
    `px-3 ${isMobile ? 'py-3 w-full text-left' : 'py-2'} rounded-md text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-850 focus:ring-sky-500
    ${currentView === view 
      ? `${isMobile ? 'bg-sky-700 text-white' : 'bg-sky-600 text-white shadow-lg'}`
      : `${isMobile ? 'text-slate-200 hover:bg-slate-600 hover:text-sky-300' : 'text-slate-200 hover:bg-slate-700 hover:text-sky-400'}`
    }`;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        const menuButton = document.getElementById('mobile-menu-button');
        if (menuButton && menuButton.contains(event.target as Node)) {
          return; 
        }
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);


  const handleNavClick = (view: ViewMode) => {
    onViewChange(view);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  }

  return (
    <header className="bg-slate-850 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">
          <h1 className="text-xl sm:text-2xl font-bold text-sky-400">Sales Dashboard</h1>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 sm:space-x-2">
            <button 
              onClick={() => handleNavClick('main')} 
              className={navButtonClasses('main')}
              aria-current={currentView === 'main' ? 'page' : undefined}
            >
              Main
            </button>
            <button 
              onClick={() => handleNavClick('brokerAnalysis')} 
              className={navButtonClasses('brokerAnalysis')}
              aria-current={currentView === 'brokerAnalysis' ? 'page' : undefined}
            >
              Broker Analysis
            </button>
            <button 
              onClick={() => handleNavClick('stateAnalysis')} 
              className={navButtonClasses('stateAnalysis')}
              aria-current={currentView === 'stateAnalysis' ? 'page' : undefined}
            >
              State Analysis
            </button>
            <button 
              onClick={() => handleNavClick('reports')} 
              className={navButtonClasses('reports')}
              aria-current={currentView === 'reports' ? 'page' : undefined}
            >
              Reports
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              id="mobile-menu-button"
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-800 shadow-lg pb-3 z-40" id="mobile-menu" ref={mobileMenuRef}>
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <button 
              onClick={() => handleNavClick('main')} 
              className={navButtonClasses('main', true)}
              aria-current={currentView === 'main' ? 'page' : undefined}
            >
              Main Dashboard
            </button>
            <button 
              onClick={() => handleNavClick('brokerAnalysis')} 
              className={navButtonClasses('brokerAnalysis', true)}
              aria-current={currentView === 'brokerAnalysis' ? 'page' : undefined}
            >
              Broker Analysis
            </button>
            <button 
              onClick={() => handleNavClick('stateAnalysis')} 
              className={navButtonClasses('stateAnalysis', true)}
              aria-current={currentView === 'stateAnalysis' ? 'page' : undefined}
            >
              State Analysis
            </button>
            <button 
              onClick={() => handleNavClick('reports')} 
              className={navButtonClasses('reports', true)}
              aria-current={currentView === 'reports' ? 'page' : undefined}
            >
              Reports
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;