import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  selectAutorisationBancaire,
  selectEncoursRestantGlobal,
  selectPourcentageUtilisationGlobal,
  selectCumulTotal
} from '../../store/slices/dashboardSlice';
import { selectEscomptes } from '../../store/slices/escomptesSlice';
import { addNotification, openModal } from '../../store/slices/uiSlice';
import { formaterMontant } from '../../utils/calculations';
import StatCard from './StatCard';

const EscomptesDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const escomptes = useAppSelector(selectEscomptes);
  const autorisationBancaire = useAppSelector(selectAutorisationBancaire);
  const cumulEscomptes = useAppSelector(selectCumulTotal);
  const encoursRestantGlobal = useAppSelector(selectEncoursRestantGlobal);
  const utilisationPourcentage = useAppSelector(selectPourcentageUtilisationGlobal);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(addNotification({
        type: 'success',
        title: 'Données actualisées',
        message: 'Les données des escomptes ont été mises à jour',
        autoClose: true,
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de mise à jour',
        message: 'Impossible de mettre à jour les données',
        autoClose: true,
        duration: 5000,
      }));
    } finally {
      setRefreshing(false);
    }
  };



  // Détermination du statut de l'encours
  const getEncoursStatus = () => {
    if (encoursRestantGlobal < 0) return 'danger';
    if (utilisationPourcentage > 90) return 'warning';
    return 'success';
  };

  // Calcul des escomptes par période
  const today = new Date();
  const escomptesAujourdhui = escomptes.filter(e => {
    const escompteDate = new Date(e.dateRemise);
    return escompteDate.toDateString() === today.toDateString();
  });



  return (
    <div>
      {/* Header avec actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Tableau de Bord - Escomptes</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => dispatch(openModal({ type: 'configuration', isOpen: true }))}
            className="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuration
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 mr-1 inline ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>

        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Autorisation Bancaire"
          value={formaterMontant(autorisationBancaire)}
          subtitle="Limite autorisée"
          color="blue"
        />
        
        <StatCard
          title="Cumul Escomptes"
          value={formaterMontant(cumulEscomptes)}
          subtitle={`${Math.round(utilisationPourcentage)}% utilisé`}
          color="purple"
        />
        
        <StatCard
          title="Encours Restant"
          value={formaterMontant(Math.abs(encoursRestantGlobal))}
          subtitle={encoursRestantGlobal < 0 ? 'Dépassement' : 'Disponible'}
          color="blue"
        />
        
        <StatCard
          title="Total Escomptes"
          value={escomptes.length.toString()}
          subtitle={`${escomptesAujourdhui.length} aujourd'hui`}
          color="indigo"
        />
      </div>

      {/* Alertes */}
      {encoursRestantGlobal < 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Dépassement d'autorisation détecté
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Le cumul des escomptes dépasse l'autorisation bancaire de {formaterMontant(Math.abs(encoursRestantGlobal))} DH.
                Veuillez ajuster les montants ou augmenter l'autorisation.
              </p>
            </div>
          </div>
        </div>
      )}

      {utilisationPourcentage > 90 && encoursRestantGlobal >= 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Autorisation presque atteinte
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Vous avez utilisé {Math.round(utilisationPourcentage)}% de votre autorisation bancaire.
                Il reste {formaterMontant(encoursRestantGlobal)} DH disponible.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscomptesDashboard;