import React from 'react';
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

  const handleCloseSidebar = () => {
    dispatch(setSidebarOpen(false));
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      handleCloseSidebar();
    }
  };



  const menuItems = [
    {
      path: '/escomptes',
      label: 'Escomptes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      path: '/refinancements',
      label: 'Refinancements',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      path: '/logs',
      label: 'Logs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'} overflow-y-auto scrollbar-thin`}
      >
        <div className="flex flex-col h-full">
          {/* Résumé financier */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Résumé Financier
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Cumul Total</span>
                <span className="text-sm font-medium text-gray-900">
                  {formaterMontant(cumulTotal)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Encours Restant</span>
                <span className={`text-sm font-medium ${
                  encoursRestant < 0 ? 'text-danger-600' : 'text-success-600'
                }`}>
                  {formaterMontant(encoursRestant)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Autorisation</span>
                <span className="text-sm font-medium text-gray-900">
                  {formaterMontant(autorisationBancaire)}
                </span>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Utilisation</span>
                <span className="text-xs text-gray-600">
                  {Math.max(0, Math.round(pourcentageUtilisationGlobal))}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    pourcentageUtilisationGlobal >= 100
                      ? 'bg-danger-500'
                      : pourcentageUtilisationGlobal >= 90
                      ? 'bg-warning-500'
                      : 'bg-success-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.max(pourcentageUtilisationGlobal, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      aria-label={`Naviguer vers ${item.label}`}
                    >
                      <span className={isActive ? 'text-primary-600' : 'text-gray-500'}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>



          {/* Informations système */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Version 2.0.0</div>
              <div>© 2025 Unimagec</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;