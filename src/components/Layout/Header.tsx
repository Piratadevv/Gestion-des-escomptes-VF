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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo et titre */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Gestion Bancaire
              </h1>
              <p className="text-sm text-gray-500">
               Groupe Unimagec  
              </p>
            </div>
          </div>
        </div>

        {/* Informations et actions */}
        <div className="flex items-center space-x-4">
          {/* Dernière mise à jour */}
          {lastUpdated && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Mis à jour : {formaterDateHeure(lastUpdated, 'HH:mm')}
              </span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 relative"
              aria-label="Notifications"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              
              {notificationsNonLues > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationsNonLues > 9 ? '9+' : notificationsNonLues}
                </span>
              )}
            </button>
          </div>

          {/* Bouton de sauvegarde */}
          <SaveButton size="sm" variant="primary" />

          {/* Menu utilisateur */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Menu utilisateur"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              
              <span className="hidden md:block text-sm font-medium">
                USERtest
              </span>
              
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-medium">USERtest</div>
                  <div className="text-gray-500">Administrateur</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>

          {/* Indicateur de statut */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="hidden lg:block text-sm text-gray-500">
              En ligne
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;