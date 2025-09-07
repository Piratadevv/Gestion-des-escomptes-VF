import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleSidebar, selectSidebarOpen, selectNotifications } from '../../store/slices/uiSlice';
import { selectDashboardLastUpdated } from '../../store/slices/dashboardSlice';
import { formaterDateHeure } from '../../utils/dates';
import { useAuth } from '../../contexts/AuthContext';
import SaveButton from '../UI/SaveButton';

/**
 * Composant Header - Barre de navigation principale
 */
const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const notifications = useAppSelector(selectNotifications);
  const lastUpdated = useAppSelector(selectDashboardLastUpdated);
  const { logout, username } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const notificationsNonLues = notifications.filter(n => !n.lu).length;

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-banking-800 shadow-banking-md border-b border-banking-900">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Menu toggle button */}
          <button
            onClick={handleToggleSidebar}
            className="touch-target p-4 rounded-banking text-white/80 hover:text-white hover:bg-banking-700 active:bg-banking-600 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 focus:ring-offset-banking-800 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo/Title */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-banking-lg flex items-center justify-center shadow-banking p-0.5 sm:p-1">
              <img 
                src="https://i0.wp.com/unimagec.ma/wp-content/uploads/2021/03/Logo-Unimagec-Web3.png?w=370&ssl=1" 
                alt="Unimagec Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="heading-secondary text-white font-banking leading-tight">
                Gestion Bancaire
              </h1>
              <p className="text-xs sm:text-sm text-banking-200 font-medium">
                Unimagec
              </p>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Last updated indicator */}
          {lastUpdated && (
            <div className="hidden xl:flex items-center space-x-2 text-xs text-banking-200 bg-banking-700/50 px-3 py-1.5 rounded-banking">
              <svg className="w-4 h-4 text-banking-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Mis à jour: {formaterDateHeure(lastUpdated, 'HH:mm')}</span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button className="touch-target p-4 rounded-banking text-white/80 hover:text-white hover:bg-banking-700 active:bg-banking-600 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 focus:ring-offset-banking-800 transition-all duration-200">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationsNonLues > 0 && (
                <span className="absolute -top-1 -right-1 bg-risk-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-banking animate-pulse-subtle">
                  {notificationsNonLues > 9 ? '9+' : notificationsNonLues}
                </span>
              )}
            </button>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="hidden md:block">
            <SaveButton size="sm" variant="primary" />
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="touch-target flex items-center space-x-4 p-4 rounded-banking text-white/90 hover:text-white hover:bg-banking-700 active:bg-banking-600 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 focus:ring-offset-banking-800 transition-all duration-200"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-banking-400 to-banking-600 rounded-full flex items-center justify-center shadow-banking">
                <span className="text-sm sm:text-base font-semibold text-white">
                  {username ? username.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <div className="body-small font-medium text-white leading-tight">
                  {username || 'Administrateur'}
                </div>
                <div className="body-caption text-banking-200">
                  Gestionnaire Système
                </div>
              </div>
              <svg 
                className={`w-4 h-4 sm:w-5 sm:h-5 text-banking-300 transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-banking-lg shadow-banking-xl border border-banking-200 py-2 z-50 animate-fade-in">
                {/* Profile info */}
                <div className="px-6 py-4 border-b border-banking-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-banking-500 to-banking-700 rounded-full flex items-center justify-center">
                      <span className="text-base font-semibold text-white">{username ? username.charAt(0).toUpperCase() : 'A'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-banking-900 truncate">{username || 'Administrateur'}</p>
                      <p className="text-xs text-banking-600 truncate">admin@unimagec.ma</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <button className="w-full flex items-center px-6 py-4 text-sm text-banking-700 hover:bg-banking-50 hover:text-banking-900 active:bg-banking-100 transition-colors duration-150 touch-target">
                    <svg className="w-5 h-5 mr-3 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mon Profil
                  </button>
                  <button className="w-full flex items-center px-6 py-4 text-sm text-banking-700 hover:bg-banking-50 hover:text-banking-900 active:bg-banking-100 transition-colors duration-150 touch-target">
                    <svg className="w-5 h-5 mr-3 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Paramètres
                  </button>
                </div>

                <div className="border-t border-banking-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-6 py-4 text-sm text-risk-600 hover:bg-risk-50 hover:text-risk-700 active:bg-risk-100 transition-colors duration-150 touch-target"
                  >
                    <svg className="w-5 h-5 mr-3 text-risk-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Se Déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Indicateur de statut */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;