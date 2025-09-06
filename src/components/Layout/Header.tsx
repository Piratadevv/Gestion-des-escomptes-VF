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
  const { logout } = useAuth();
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
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Menu toggle button */}
          <button
            onClick={handleToggleSidebar}
            className="p-2 rounded-banking text-white/80 hover:text-white hover:bg-banking-700 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 focus:ring-offset-banking-800 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-banking-lg flex items-center justify-center shadow-banking p-1">
              <img 
                src="https://i0.wp.com/unimagec.ma/wp-content/uploads/2021/03/Logo-Unimagec-Web3.png?w=370&ssl=1" 
                alt="Unimagec Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-white font-banking">
                Gestion Bancaire
              </h1>
              <p className="text-xs text-banking-200 font-medium">
                Système de Gestion Financière
              </p>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Last updated indicator */}
          {lastUpdated && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-banking-200 bg-banking-700/50 px-3 py-1.5 rounded-banking">
              <svg className="w-4 h-4 text-banking-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Mis à jour: {formaterDateHeure(lastUpdated, 'HH:mm')}</span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-banking text-white/80 hover:text-white hover:bg-banking-700 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 focus:ring-offset-banking-800 transition-all duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <SaveButton size="sm" variant="primary" />

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-banking text-white/90 hover:text-white hover:bg-banking-700 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 focus:ring-offset-banking-800 transition-all duration-200"
            >
              <div className="w-9 h-9 bg-banking-600 rounded-banking flex items-center justify-center shadow-banking border-2 border-banking-500">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-white">Administrateur</div>
                <div className="text-xs text-banking-200">Gestionnaire Système</div>
              </div>
              <svg className="w-4 h-4 text-banking-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-banking-lg shadow-banking-xl py-2 z-50 border border-neutral-200 animate-slide-up">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-banking-100 rounded-banking flex items-center justify-center">
                      <svg className="w-5 h-5 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-trust-900">USERtest</div>
                      <div className="text-sm text-neutral-600">admin@gestion-bancaire.com</div>
                      <div className="text-xs text-financial-600 font-medium">● En ligne</div>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button className="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profil utilisateur</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Paramètres</span>
                  </button>
                </div>
                <div className="border-t border-neutral-100 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm text-risk-600 hover:bg-risk-50 transition-colors duration-200 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Se déconnecter</span>
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