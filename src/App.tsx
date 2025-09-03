import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import EscomptesPage from './components/Pages/EscomptesPage';
import RefinancementsPage from './components/Pages/RefinancementsPage';
import LogsPage from './components/Pages/LogsPage';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import NotificationContainer from './components/UI/NotificationContainer';
import ModalContainer from './components/UI/ModalContainer';
import LoadingOverlay from './components/UI/LoadingOverlay';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from './store';
import { fetchConfiguration } from './store/slices/configurationSlice';
import { fetchDashboardKPI } from './store/slices/dashboardSlice';
import { selectSidebarOpen, setSidebarOpen } from './store/slices/uiSlice';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

/**
 * Composant principal de l'application de gestion des escomptes bancaires
 */
function AppContent(): JSX.Element {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const isLoading = useSelector((state: any) =>
    state.configuration?.isLoading || state.dashboard?.isLoading || state.escomptes?.isLoading
  );

  // Chargement initial des données
  useEffect(() => {
    dispatch(fetchConfiguration());
    dispatch(fetchDashboardKPI());
  }, [dispatch]);

  // Auto-refresh des KPI toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchDashboardKPI());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header fixe */}
        <Header />
        
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Overlay pour mobile */}
          {sidebarOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => dispatch(setSidebarOpen(false))}
            />
          )}
          
          {/* Contenu principal */}
          <main className={`main-content flex-1 pt-16 ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/" element={<Navigate to="/escomptes" replace />} />
                <Route path="/escomptes" element={<EscomptesPage />} />
                <Route path="/refinancements" element={<RefinancementsPage />} />
                <Route path="/logs" element={<LogsPage />} />
              </Routes>
            </div>
          </main>
        </div>
        
        {/* Composants overlay */}
        <NotificationContainer />
        <ModalContainer />
        <LoadingOverlay isLoading={!!isLoading} />
      </div>
    </ProtectedRoute>
  );
}

/**
 * Composant App avec Provider Redux et Router
 */
function App(): JSX.Element {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
