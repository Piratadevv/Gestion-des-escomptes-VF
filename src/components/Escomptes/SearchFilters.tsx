import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectEscomptesFilters,
  setFilters,
  resetFilters,
  fetchEscomptes,
  selectEscomptesPagination,
  selectEscomptesSort
} from '../../store/slices/escomptesSlice';
import { obtenirDateActuelle, obtenirDebutMois, obtenirFinMois } from '../../utils/dates';
import { validerMontant } from '../../utils/calculations';
import { EscompteFilters } from '../../types';

/**
 * Composant SearchFilters - Filtres de recherche pour les escomptes
 */
const SearchFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectEscomptesFilters);
  const pagination = useAppSelector(selectEscomptesPagination);
  const sort = useAppSelector(selectEscomptesSort);
  
  const [localFilters, setLocalFilters] = useState<EscompteFilters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Synchronisation avec les filtres du store
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Application des filtres avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(localFilters) !== JSON.stringify(filters)) {
        dispatch(setFilters(localFilters));
        dispatch(fetchEscomptes({
          pagination,
          filters: localFilters,
          sort
        }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilters, filters, dispatch, pagination, sort]);

  const handleFilterChange = (field: string, value: any) => {
    setLocalFilters((prev: EscompteFilters) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    dispatch(resetFilters());
    setLocalFilters({
      recherche: '',
      dateDebut: '',
      dateFin: '',
      montantMin: undefined,
      montantMax: undefined,
      libelle: ''
    });
  };

  const handleQuickFilter = (type: string) => {
    const today = obtenirDateActuelle();
    const startOfMonth = obtenirDebutMois(today);
    const endOfMonth = obtenirFinMois(today);
    
    let newFilters: EscompteFilters = { ...localFilters };
    
    switch (type) {
      case 'today':
        newFilters = { 
          ...newFilters, 
          dateDebut: today.toISOString().split('T')[0], 
          dateFin: today.toISOString().split('T')[0] 
        };
        break;
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche
        newFilters = { 
          ...newFilters, 
          dateDebut: startOfWeek.toISOString().split('T')[0],
          dateFin: endOfWeek.toISOString().split('T')[0]
        };
        break;
      case 'thisMonth':
        newFilters = { 
          ...newFilters, 
          dateDebut: startOfMonth.toISOString().split('T')[0], 
          dateFin: endOfMonth.toISOString().split('T')[0] 
        };
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        newFilters = { 
          ...newFilters, 
          dateDebut: lastMonth.toISOString().split('T')[0],
          dateFin: endOfLastMonth.toISOString().split('T')[0]
        };
        break;
      default:
        break;
    }
    
    setLocalFilters(newFilters);
  };

  const hasActiveFilters = Object.values(localFilters as any).some(value => value !== '');

  return (
    <div className="space-y-6">
      {/* Barre de recherche principale */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher par libellé..."
              value={(localFilters as any).recherche}
              onChange={(e) => handleFilterChange('recherche', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center shadow-sm hover:shadow-md ${
              hasActiveFilters 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres avancés
            {hasActiveFilters && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2.5 py-1 font-semibold shadow-sm">
                {Object.values(localFilters as any).filter(v => v !== '').length}
              </span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 rounded-xl font-medium text-sm bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-600 font-semibold">Filtres rapides :</span>
        <button
          onClick={() => handleQuickFilter('today')}
          className="text-sm bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-indigo-50 text-slate-700 hover:text-blue-700 px-4 py-2 rounded-lg transition-all duration-200 border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-md font-medium"
        >
          Aujourd'hui
        </button>
        <button
          onClick={() => handleQuickFilter('thisWeek')}
          className="text-sm bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-indigo-50 text-slate-700 hover:text-blue-700 px-4 py-2 rounded-lg transition-all duration-200 border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-md font-medium"
        >
          Cette semaine
        </button>
        <button
          onClick={() => handleQuickFilter('thisMonth')}
          className="text-sm bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-indigo-50 text-slate-700 hover:text-blue-700 px-4 py-2 rounded-lg transition-all duration-200 border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-md font-medium"
        >
          Ce mois
        </button>
        <button
          onClick={() => handleQuickFilter('lastMonth')}
          className="text-sm bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-indigo-50 text-slate-700 hover:text-blue-700 px-4 py-2 rounded-lg transition-all duration-200 border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-md font-medium"
        >
          Mois dernier
        </button>
      </div>

      {/* Filtres avancés */}
      {isExpanded && (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 space-y-6 border border-slate-200 shadow-lg backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Filtre par libellé */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Libellé spécifique
              </label>
              <input
                type="text"
                placeholder="Filtrer par libellé exact"
                value={(localFilters as any).libelle}
                onChange={(e) => handleFilterChange('libelle', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>

            {/* Filtre par date de début */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Date de début
              </label>
              <input
                type="date"
                value={(localFilters as any).dateDebut}
                onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>

            {/* Filtre par date de fin */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Date de fin
              </label>
              <input
                type="date"
                value={(localFilters as any).dateFin}
                onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>

            {/* Filtre par montant minimum */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Montant minimum (DH)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={(localFilters as any).montantMin}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || validerMontant(parseFloat(value)).valide) {
                    handleFilterChange('montantMin', value);
                  }
                }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>

            {/* Filtre par montant maximum */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Montant maximum (DH)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={(localFilters as any).montantMax}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || validerMontant(parseFloat(value)).valide) {
                    handleFilterChange('montantMax', value);
                  }
                }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Actions des filtres avancés */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <div className="text-sm text-slate-600 font-medium">
              {hasActiveFilters && (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {Object.values(localFilters as any).filter(v => v !== '').length} filtre{Object.values(localFilters as any).filter(v => v !== '').length > 1 ? 's' : ''} actif{Object.values(localFilters as any).filter(v => v !== '').length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!hasActiveFilters}
              >
                Réinitialiser
              </button>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;