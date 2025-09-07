import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectSidebarOpen, setSidebarOpen } from '../../store/slices/uiSlice';
import { selectCumulGlobal, selectEncoursRestantGlobal, selectAutorisationBancaire, selectPourcentageUtilisationGlobal } from '../../store/slices/dashboardSlice';
import { formaterMontant } from '../../utils/calculations';

/**
 * Composant Sidebar - Navigation latérale
 */
const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const cumulTotal = useAppSelector(selectCumulGlobal);
  const encoursRestant = useAppSelector(selectEncoursRestantGlobal);
  const autorisationBancaire = useAppSelector(selectAutorisationBancaire);
  const pourcentageUtilisationGlobal = useAppSelector(selectPourcentageUtilisationGlobal);
  
  // Touch and swipe gesture state
  const sidebarRef = useRef<HTMLElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handleCloseSidebar = () => {
    dispatch(setSidebarOpen(false));
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      handleCloseSidebar();
    }
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const currentTouch = { x: touch.clientX, y: touch.clientY };
    setTouchEnd(currentTouch);
    
    const deltaX = currentTouch.x - touchStart.x;
    const deltaY = Math.abs(currentTouch.y - touchStart.y);
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      setIsDragging(true);
      
      // For closing: only allow left swipe when sidebar is open
      if (sidebarOpen && deltaX < 0) {
        setDragOffset(Math.max(deltaX, -280)); // Limit to sidebar width
        e.preventDefault(); // Prevent scrolling
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = Math.abs(touchEnd.y - touchStart.y);
    const minSwipeDistance = 50;
    
    // Only process horizontal swipes
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > minSwipeDistance) {
      // Swipe left to close (when sidebar is open)
      if (deltaX < -minSwipeDistance && sidebarOpen) {
        handleCloseSidebar();
      }
      // Swipe right to open (when sidebar is closed) - handled by overlay or edge swipe
      else if (deltaX > minSwipeDistance && !sidebarOpen && touchStart.x < 20) {
        dispatch(setSidebarOpen(true));
      }
    }
    
    // Reset state
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    setDragOffset(0);
  };

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        handleCloseSidebar();
      }
    };

    if (sidebarOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when sidebar is open on mobile
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node) && sidebarOpen && window.innerWidth < 768) {
        handleCloseSidebar();
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const menuItems = [
    {
      path: '/escomptes',
      label: 'Escomptes',
      description: 'Gestion des escomptes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      path: '/refinancements',
      label: 'Refinancements',
      description: 'Opérations de refinancement',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      path: '/logs',
      label: 'Journaux',
      description: 'Historique des opérations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay md:hidden" 
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'} overflow-y-auto scrollbar-thin bg-blue-50 border-r border-blue-200 transform-responsive`}
        style={{ 
          zIndex: 50,
          transform: isDragging ? `translateX(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="flex flex-col h-full">
          {/* Banking Brand Section */}
          <div className="p-6 border-b border-blue-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-4">
              
               
              </div>
              
              {/* Close button for mobile */}
              <button
                onClick={handleCloseSidebar}
                className="md:hidden touch-target p-2 rounded-banking text-blue-600 hover:text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 focus:ring-offset-blue-50 transition-all duration-200"
                aria-label="Fermer le menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Résumé financier */}
          <div className="p-6 bg-blue-100 border-b border-blue-200">
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-sm font-semibold text-blue-800">
                Résumé Financier
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-sky-50 rounded-banking p-4 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-blue-700 font-medium">Cumul Total</span>
                <span className="text-sm font-semibold text-blue-900">
                    {formaterMontant(cumulTotal)}
                  </span>
                </div>
              </div>
              
              <div className="bg-sky-50 rounded-banking p-4 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-blue-700 font-medium">Encours Restant</span>
                <span className={`text-sm font-semibold ${
                    encoursRestant < 0 ? 'text-risk-400' : 'text-financial-400'
                  }`}>
                    {formaterMontant(encoursRestant)}
                  </span>
                </div>
              </div>
              
              <div className="bg-sky-50 rounded-banking p-4 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-blue-700 font-medium">Autorisation</span>
                <span className="text-sm font-semibold text-banking-300">
                    {formaterMontant(autorisationBancaire)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4 bg-sky-50 rounded-banking p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="body-caption text-blue-700 font-medium">Taux d'Utilisation</span>
                <span className="body-caption font-semibold text-blue-900">
                  {Math.max(0, Math.round(pourcentageUtilisationGlobal))}%
                </span>
              </div>
              
              <div className="w-full bg-gray-400 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    pourcentageUtilisationGlobal >= 100
                      ? 'bg-risk-500 shadow-sm'
                      : pourcentageUtilisationGlobal >= 90
                      ? 'bg-alert-500 shadow-sm'
                      : 'bg-financial-500 shadow-sm'
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.max(pourcentageUtilisationGlobal, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-blue-500 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
                Navigation
              </h4>
            </div>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`touch-target-large w-full flex items-center space-x-3 sm:space-x-3 md:space-x-2 px-4 sm:px-5 md:px-4 py-3.5 sm:py-3 md:py-2.5 rounded-banking text-left transition-all duration-200 focus-responsive active:scale-95 active:bg-opacity-80 group ${
                        isActive
                          ? 'bg-banking-900 text-white shadow-banking border-l-4 border-banking-400 animate-slide-in-right'
                          : 'text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:scale-102 transform-responsive'
                      }`}
                      aria-label={`Naviguer vers ${item.label}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className={`transition-colors duration-200 ${
                        isActive 
                          ? 'text-banking-200' 
                          : 'text-blue-600 group-hover:text-banking-300'
                      }`}>
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{item.label}</div>
              <div className={`text-sm ${
                          isActive 
                            ? 'text-banking-200' 
                            : 'text-blue-500 group-hover:text-blue-600'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-banking-300 rounded-full animate-pulse-subtle" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>



          {/* Informations système */}
          <div className="p-4 bg-blue-100 border-t border-blue-200">
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600/20 rounded-banking flex items-center justify-center">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                <div className="font-semibold text-blue-900">Système Bancaire v2.0</div>
                <div className="text-blue-600">© 2025 Gestion Financière</div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-financial-500 rounded-full animate-pulse-subtle" />
                  <span className="text-financial-400 font-medium">Système Opérationnel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;