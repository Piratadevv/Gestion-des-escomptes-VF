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
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'} overflow-y-auto scrollbar-thin bg-blue-50`}
      >
        <div className="flex flex-col h-full">
          {/* Banking Brand Section */}
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-banking-500 rounded-banking flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-banking-900">Gestion Bancaire</h2>
                <p className="text-xs text-banking-600">Système Financier</p>
              </div>
            </div>
          </div>

          {/* Résumé financier */}
          <div className="p-4 bg-blue-100/50">
            <div className="flex items-center space-x-2 mb-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-sm font-semibold text-black">
                Résumé Financier
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-100 rounded-banking p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-blue-700 font-medium">Cumul Total</span>
                  <span className="text-sm font-semibold text-blue-900">
                    {formaterMontant(cumulTotal)}
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-100 rounded-banking p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-blue-700 font-medium">Encours Restant</span>
                  <span className={`text-sm font-semibold ${
                    encoursRestant < 0 ? 'text-risk-400' : 'text-financial-400'
                  }`}>
                    {formaterMontant(encoursRestant)}
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-100 rounded-banking p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-blue-700 font-medium">Autorisation</span>
                  <span className="text-sm font-semibold text-blue-900">
                    {formaterMontant(autorisationBancaire)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4 bg-blue-100 rounded-banking p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-blue-700 font-medium">Taux d'Utilisation</span>
                <span className="text-xs font-semibold text-blue-900">
                  {Math.max(0, Math.round(pourcentageUtilisationGlobal))}%
                </span>
              </div>
              
              <div className="w-full bg-trust-600 rounded-full h-2.5">
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
              
              <div className="flex justify-between text-xs text-trust-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <h4 className="text-xs font-semibold text-black uppercase tracking-wider">
                  Navigation
                </h4>
              </div>
            </div>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-banking text-left transition-colors duration-200 focus:outline-none group ${
                        isActive
                          ? 'bg-blue-100 text-blue-900 shadow-sm'
                          : 'text-blue-700 hover:bg-blue-50 hover:text-blue-900'
                      }`}
                      aria-label={`Naviguer vers ${item.label}`}
                    >
                      <span className={`transition-colors duration-200 ${
                        isActive 
                          ? 'text-blue-700' 
                          : 'text-blue-600 group-hover:text-blue-700'
                      }`}>
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className={`text-xs ${
                          isActive 
                            ? 'text-blue-700' 
                            : 'text-blue-600 group-hover:text-blue-700'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>



          {/* Informations système */}
          <div className="p-4 bg-blue-100/50">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-banking flex items-center justify-center">
                <svg className="w-3 h-3 text-banking-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xs text-black space-y-1">
                <div className="font-semibold">Système Bancaire v2.0.0</div>
                <div className="text-black">© 2025 Gestion Financière</div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-financial-500 rounded-full animate-pulse-subtle" />
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