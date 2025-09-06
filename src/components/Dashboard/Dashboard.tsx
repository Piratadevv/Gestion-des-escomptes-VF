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
    <div className="min-h-screen bg-neutral-50">
      {/* En-tête du dashboard */}
      <div className="bg-gradient-to-r from-trust-900 to-banking-800 shadow-banking border-b border-trust-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-banking-600 rounded-banking flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Gestion des Escomptes Bancaires
                    </h1>
                    <p className="text-banking-200 text-sm font-medium">
                      Système de Gestion Financière
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-trust-300 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </p>
              </div>
              
              <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-trust-700 hover:bg-trust-600 text-white px-4 py-2.5 rounded-banking font-medium transition-all duration-200 flex items-center justify-center shadow-sm border border-trust-600 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="bg-banking-600 hover:bg-banking-700 text-white px-4 py-2.5 rounded-banking font-medium transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
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
        {/* Header avec statistiques rapides */}
        <div className="mb-8">
          <div className="bg-white rounded-banking shadow-banking border border-neutral-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h2 className="text-xl font-bold text-trust-900 mb-1">Tableau de Bord Financier</h2>
                <p className="text-trust-600 text-sm">Vue d'ensemble de vos escomptes et refinancements</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-banking-600">{escomptes.length}</div>
                  <div className="text-xs text-trust-500 font-medium">Escomptes Actifs</div>
                </div>
                <div className="w-px h-8 bg-neutral-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-financial-600">{Math.round(utilisationPourcentage)}%</div>
                  <div className="text-xs text-trust-500 font-medium">Taux d'Utilisation</div>
                </div>
                <div className="w-px h-8 bg-neutral-300"></div>
                <button
                  onClick={() => dispatch(openModal({ type: 'configuration', isOpen: true }))}
                  className="bg-banking-600 hover:bg-banking-700 text-white px-4 py-2 rounded-banking font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Configuration</span>
                </button>
              </div>
            </div>
          </div>
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
          <div className="mb-8 bg-gradient-to-r from-risk-50 to-risk-100 border-l-4 border-risk-500 rounded-banking shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-risk-500 rounded-banking flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-risk-800 mb-2">
                  ⚠️ Dépassement d'Autorisation Critique
                </h3>
                <p className="text-risk-700 mb-3">
                  Le cumul des escomptes dépasse l'autorisation bancaire de <span className="font-bold">{formaterMontant(Math.abs(encoursRestantGlobal))} DH</span>.
                </p>
                <div className="bg-white rounded-banking p-3 border border-risk-200">
                  <p className="text-sm text-risk-600">
                    <strong>Action requise:</strong> Veuillez ajuster les montants ou augmenter l'autorisation bancaire immédiatement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {utilisationPourcentage > 90 && encoursRestantGlobal >= 0 && (
          <div className="mb-8 bg-gradient-to-r from-alert-50 to-alert-100 border-l-4 border-alert-500 rounded-banking shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-alert-500 rounded-banking flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-alert-800 mb-2">
                  🔔 Autorisation Presque Atteinte
                </h3>
                <p className="text-alert-700 mb-3">
                  Vous avez utilisé <span className="font-bold">{Math.round(utilisationPourcentage)}%</span> de votre autorisation bancaire.
                </p>
                <div className="bg-white rounded-banking p-3 border border-alert-200">
                  <p className="text-sm text-alert-600">
                    <strong>Montant disponible:</strong> {formaterMontant(encoursRestantGlobal)} DH restants
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section des escomptes */}
        <div className="bg-white rounded-banking shadow-banking border border-neutral-200">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-banking-600 rounded-banking flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-trust-900">
                    {activeTab === 'escomptes' ? 'Gestion des Escomptes' : 'Suivi des Refinancements'}
                  </h2>
                </div>
                <div className="inline-flex rounded-banking shadow-sm border border-neutral-300 bg-white" role="group">
                  <button
                    type="button"
                    onClick={() => setActiveTab('escomptes')}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-l-banking transition-all duration-200 ${
                      activeTab === 'escomptes' 
                        ? 'bg-banking-600 text-white shadow-sm border-r border-banking-500' 
                        : 'bg-white text-trust-700 hover:bg-neutral-50 border-r border-neutral-300'
                    }`}
                    aria-pressed={activeTab === 'escomptes' }
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span>Escomptes</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('refinancements')}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-r-banking transition-all duration-200 ${
                      activeTab === 'refinancements' 
                        ? 'bg-banking-600 text-white shadow-sm' 
                        : 'bg-white text-trust-700 hover:bg-neutral-50'
                    }`}
                    aria-pressed={activeTab === 'refinancements'}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Refinancements</span>
                    </div>
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