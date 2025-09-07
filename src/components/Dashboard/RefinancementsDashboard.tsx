import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  selectRefinancements
} from '../../store/slices/refinancementsSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { formaterMontant } from '../../utils/calculations';
import StatCard from './StatCard';

const RefinancementsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const refinancements = useAppSelector(selectRefinancements);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(addNotification({
        type: 'success',
        title: 'Données actualisées',
        message: 'Les données des refinancements ont été mises à jour',
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



  // Calculs des métriques
  const today = new Date();
  
  // Total des montants refinancés
  const totalMontantRefinance = refinancements.reduce((sum, r) => sum + r.montantRefinance, 0);
  
  // Total des intérêts (calculé correctement)
  const totalInterets = refinancements.reduce((sum, r) => {
    // Vérifier que toutes les valeurs nécessaires sont valides
    const montant = r.montantRefinance || 0;
    const taux = r.tauxInteret || 0;
    const duree = r.dureeEnMois || 0;
    
    // Calcul des intérêts simples: Capital × Taux × Durée
    // Taux annuel converti en taux mensuel, puis multiplié par la durée en mois
    const interetsCalcules = (montant * (taux / 100) * duree) / 12;
    
    // Vérifier que le résultat n'est pas NaN
    return sum + (isNaN(interetsCalcules) ? 0 : interetsCalcules);
  }, 0);
  
  // Refinancements actifs (non remboursés)
  const refinancementsActifs = refinancements.filter(r => r.statut === 'ACTIF');
  const montantActif = refinancementsActifs.reduce((sum, r) => sum + r.montantRefinance, 0);
  
  // Refinancements de cette semaine
  const refinancementsCetteSemaine = refinancements.filter(r => {
    const refinancementDate = new Date(r.dateRefinancement);
    const diffTime = today.getTime() - refinancementDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });
  
  // Refinancements d'aujourd'hui
  const refinancementsAujourdhui = refinancements.filter(r => {
    const refinancementDate = new Date(r.dateRefinancement);
    return refinancementDate.toDateString() === today.toDateString();
  });

  // Refinancements arrivant à échéance dans les 30 jours
  const refinancementsEcheanceProche = refinancements.filter(r => {
    if (r.statut !== 'ACTIF') return false;
    const startDate = new Date(r.dateRefinancement);
    const echeanceDate = new Date(startDate.getTime() + (r.dureeEnMois * 30 * 24 * 60 * 60 * 1000));
    const diffTime = echeanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  });

  return (
    <div className="mt-6">
      <div className="space-y-8">
        {/* Header avec actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6">
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary flex items-center space-x-2 text-sm sm:text-base px-4 py-2.5 min-w-[120px] justify-center"
            >
              <svg 
                className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
            </button>
          </div>
        </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Refinancé"
          value={formaterMontant(totalMontantRefinance)}
          subtitle={`${refinancements.length} refinancement${refinancements.length > 1 ? 's' : ''}`}
          color="green"
          className="transform hover:scale-105 transition-transform duration-200"
        />
        
        <StatCard
          title="Montant Actif"
          value={formaterMontant(montantActif)}
          subtitle={`${refinancementsActifs.length} actif${refinancementsActifs.length > 1 ? 's' : ''}`}
          color="green"
          className="transform hover:scale-105 transition-transform duration-200"
        />
        
        <StatCard
          title="Total Intérêts"
          value={formaterMontant(totalInterets)}
          subtitle="Coût total"
          color="green"
          className="transform hover:scale-105 transition-transform duration-200"
        />
        
        <StatCard
          title="Cette Semaine"
          value={refinancementsCetteSemaine.length.toString()}
          subtitle={`${refinancementsAujourdhui.length} aujourd'hui`}
          color="green"
          className="transform hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Alertes */}
      {refinancementsEcheanceProche.length > 0 && (
        <div className="mb-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">
                  Échéances à venir
                </h3>
                <p className="text-sm sm:text-base text-yellow-700 leading-relaxed">
                  {refinancementsEcheanceProche.length} refinancement{refinancementsEcheanceProche.length > 1 ? 's' : ''} arrive{refinancementsEcheanceProche.length > 1 ? 'nt' : ''} à échéance dans les 30 prochains jours.
                  Vérifiez les dates d'échéance pour planifier les remboursements.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {refinancements.length === 0 && (
        <div className="mb-8">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">
                  Aucun refinancement
                </h3>
                <p className="text-sm sm:text-base text-blue-700 leading-relaxed">
                  Vous n'avez pas encore de refinancements enregistrés. Cliquez sur "Nouveau Refinancement" pour commencer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default RefinancementsDashboard;