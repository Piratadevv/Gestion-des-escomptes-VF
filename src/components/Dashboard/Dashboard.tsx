import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchEscomptes, selectEscomptes, selectEscomptesLoading, selectEscomptesError } from '../../store/slices/escomptesSlice';
import { selectCumulGlobal, selectEncoursRestantGlobal, selectAutorisationBancaire, selectCumulRefinancements, selectNombreRefinancements, selectPourcentageUtilisationGlobal } from '../../store/slices/dashboardSlice';
import { selectConfiguration } from '../../store/slices/configurationSlice';
import { openModal, addNotification } from '../../store/slices/uiSlice';
import { formaterMontant } from '../../utils/calculations';
import KPICard from './KPICard';
import EscomptesTable from '../Escomptes/EscomptesTable';
import SearchFilters from '../Escomptes/SearchFilters';
import { fetchDashboardKPI } from '../../store/slices/dashboardSlice';
import { apiClient } from '../../services/api/client';

/**
 * Composant Dashboard - Tableau de bord principal
 */
const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const escomptes = useAppSelector(selectEscomptes);
  const loading = useAppSelector(selectEscomptesLoading);
  const error = useAppSelector(selectEscomptesError);
  const cumulGlobal = useAppSelector(selectCumulGlobal);
  const encoursRestantGlobal = useAppSelector(selectEncoursRestantGlobal);
  const autorisationBancaire = useAppSelector(selectAutorisationBancaire);
  const cumulRefinancements = useAppSelector(selectCumulRefinancements);
  const nombreRefinancements = useAppSelector(selectNombreRefinancements);
  const configuration = useAppSelector(selectConfiguration);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'escomptes' | 'refinancements'>('escomptes');

  // Chargement initial des données
  useEffect(() => {
    dispatch(fetchEscomptes({ pagination: { page: 1, limit: 10 } }));
    // Removed duplicate KPI fetch; App.tsx already fetches KPIs on load and schedules auto-refresh
  }, [dispatch]);

  // Listen for configuration changes and refresh KPIs
  useEffect(() => {
    if (configuration) {
      dispatch(fetchDashboardKPI());
    }
  }, [configuration, dispatch]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de chargement',
        message: error,
        autoClose: true,
        duration: 5000,
      }));
    }
  }, [error, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchEscomptes({ pagination: { page: 1, limit: 10 } }) as any).unwrap();
      dispatch(addNotification({
        type: 'success',
        title: 'Actualisation réussie',
        message: 'Données actualisées avec succès',
        autoClose: true,
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur d\'actualisation',
        message: 'Impossible d\'actualiser les données',
        autoClose: true,
        duration: 5000,
      }));
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewEscompte = () => {
    dispatch(openModal({ type: 'escompte', mode: 'create', data: null, isOpen: true } as any));
  };

  const handleExport = () => {
    dispatch(openModal({ type: 'export', isOpen: true } as any));
  };



  const handleConfiguration = () => {
    dispatch(openModal({ type: 'configuration', isOpen: true } as any));
  };



  // Calcul du pourcentage d'utilisation (global)
  const utilisationPourcentage = useAppSelector(selectPourcentageUtilisationGlobal);

  // Détermination du statut de l'encours
  const getEncoursStatus = () => {
    if (encoursRestantGlobal < 0) return 'danger';
    if (utilisationPourcentage > 90) return 'warning';
    if (utilisationPourcentage > 70) return 'info';
    return 'success';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête du dashboard */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion des Escomptes Bancaires
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Tableau de bord - {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="btn-secondary flex items-center justify-center"
                >
                  <svg 
                    className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {refreshing ? 'Actualisation...' : 'Actualiser'}
                </button>
                
                <button
                  onClick={handleConfiguration}
                  className="btn-secondary flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuration
                </button>


                
                <button
                  onClick={handleNewEscompte}
                  className="btn-primary flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nouvel Escompte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec bouton de configuration */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble de vos escomptes et refinancements</p>
          </div>
          <button
            onClick={() => dispatch(openModal({ type: 'configuration', isOpen: true }))}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Configuration</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Cumul Total"
            value={formaterMontant(cumulGlobal)}
            icon={(
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )}
            trend={{
              value: escomptes.length,
              label: `${escomptes.length} escompte${escomptes.length > 1 ? 's' : ''}`,
              type: 'neutral'
            }}
          />
          
          <KPICard
            title="Encours Restant"
            value={formaterMontant(encoursRestantGlobal) }
            icon={(
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            trend={{
              value: Math.round(utilisationPourcentage),
              label: `${Math.round(utilisationPourcentage)}% utilisé`,
              type: getEncoursStatus() === 'danger' ? 'negative' : getEncoursStatus() === 'warning' ? 'neutral' : 'positive'
            }}
          />
          
          <KPICard
            title="Autorisation Bancaire"
            value={formaterMontant(autorisationBancaire || 0)}
            icon={(
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
            trend={{
              value: Math.round(utilisationPourcentage),
              label: `${Math.round(utilisationPourcentage)}% utilisé`,
              type: utilisationPourcentage > 90 ? 'negative' : utilisationPourcentage > 75 ? 'neutral' : 'positive'
            }}
            onClick={() => dispatch(openModal({ type: 'configuration', isOpen: true }))}
          />

          <KPICard
            title="Cumul Refinancements"
            value={formaterMontant(cumulRefinancements)}
            icon={(
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2h-2zM9 9V7a3 3 0 016 0v2H9z" />
              </svg>
            )}
            trend={{
              value: nombreRefinancements,
              label: `${nombreRefinancements} refinancement${nombreRefinancements > 1 ? 's' : ''}`,
              type: 'neutral'
            }}
          />
          
          <KPICard
            title="Nombre d'Escomptes"
            value={escomptes.length.toString()}
            icon={(
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            trend={{
              value: escomptes.filter(e => {
                const today = new Date();
                const escompteDate = new Date(e.dateRemise);
                const diffTime = today.getTime() - escompteDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length,
              label: 'Cette semaine',
              type: 'positive'
            }}
          />
        </div>

        {/* Alertes */}
        {encoursRestantGlobal < 0 && (
          <div className="mb-6 bg-danger-50 border border-danger-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-danger-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-danger-800">
                  Dépassement d'autorisation détecté
                </h3>
                <p className="text-sm text-danger-700 mt-1">
                  Le cumul des escomptes dépasse l'autorisation bancaire de {formaterMontant(Math.abs(encoursRestantGlobal))} DH.
                  Veuillez ajuster les montants ou augmenter l'autorisation.
                </p>
              </div>
            </div>
          </div>
        )}

        {utilisationPourcentage > 90 && encoursRestantGlobal >= 0 && (
          <div className="mb-6 bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-warning-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-warning-800">
                  Autorisation presque atteinte
                </h3>
                <p className="text-sm text-warning-700 mt-1">
                  Vous avez utilisé {Math.round(utilisationPourcentage)}% de votre autorisation bancaire.
                  Il reste {formaterMontant(encoursRestantGlobal)} DH disponible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section des escomptes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {activeTab === 'escomptes' ? 'Liste des Escomptes' : 'Refinancements'}
                </h2>
                <div className="mt-3 inline-flex rounded-md shadow-sm border border-gray-200" role="group">
                  <button
                    type="button"
                    onClick={() => setActiveTab('escomptes')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-l-md transition-colors ${
                      activeTab === 'escomptes' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-pressed={activeTab === 'escomptes' }
                  >
                    Escomptes
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('refinancements')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-r-md transition-colors ${
                      activeTab === 'refinancements' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-pressed={activeTab === 'refinancements'}
                  >
                    Refinancements
                  </button>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0 flex space-x-3">
                {activeTab === 'escomptes' && (
                  <>
                    <button
                      onClick={handleExport}
                      className="btn-secondary text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Exporter
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Filtres de recherche */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            {activeTab === 'escomptes' ? (
              <SearchFilters />
            ) : (
              <p className="text-sm text-gray-600">Les filtres pour les refinancements seront bientôt disponibles.</p>
            )}
          </div>

          {/* Tableau / Contenu */}
          <div id="escomptes-section" className="overflow-hidden">
            {activeTab === 'escomptes' ? (
              <EscomptesTable />
            ) : (
              <div className="p-6">
                <div className="text-center text-gray-600">
                  <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <p className="text-sm">L’interface des refinancements arrive bientôt.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;