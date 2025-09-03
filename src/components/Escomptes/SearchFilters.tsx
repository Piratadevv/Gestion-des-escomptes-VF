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
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher par libellé..."
              value={(localFilters as any).recherche}
              onChange={(e) => handleFilterChange('recherche', e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`btn-secondary flex items-center ${
              hasActiveFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : ''
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres avancés
            {hasActiveFilters && (
              <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                {Object.values(localFilters as any).filter(v => v !== '').length}
              </span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="btn-secondary text-danger-600 hover:text-danger-700 hover:bg-danger-50"
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
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 font-medium">Filtres rapides :</span>
        <button
          onClick={() => handleQuickFilter('today')}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
        >
          Aujourd'hui
        </button>
        <button
          onClick={() => handleQuickFilter('thisWeek')}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
        >
          Cette semaine
        </button>
        <button
          onClick={() => handleQuickFilter('thisMonth')}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
        >
          Ce mois
        </button>
        <button
          onClick={() => handleQuickFilter('lastMonth')}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
        >
          Mois dernier
        </button>
      </div>

      {/* Filtres avancés */}
      {isExpanded && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtre par libellé */}
            <div>
              <label className="label">
                Libellé spécifique
              </label>
              <input
                type="text"
                placeholder="Filtrer par libellé exact"
                value={(localFilters as any).libelle}
                onChange={(e) => handleFilterChange('libelle', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Filtre par date de début */}
            <div>
              <label className="label">
                Date de début
              </label>
              <input
                type="date"
                value={(localFilters as any).dateDebut}
                onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Filtre par date de fin */}
            <div>
              <label className="label">
                Date de fin
              </label>
              <input
                type="date"
                value={(localFilters as any).dateFin}
                onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Filtre par montant minimum */}
            <div>
              <label className="label">
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
                className="input-field"
              />
            </div>

            {/* Filtre par montant maximum */}
            <div>
              <label className="label">
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
                className="input-field"
              />
            </div>
          </div>

          {/* Actions des filtres avancés */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {hasActiveFilters && (
                <span>
                  {Object.values(localFilters as any).filter(v => v !== '').length} filtre{Object.values(localFilters as any).filter(v => v !== '').length > 1 ? 's' : ''} actif{Object.values(localFilters as any).filter(v => v !== '').length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleClearFilters}
                className="btn-secondary text-sm"
                disabled={!hasActiveFilters}
              >
                Réinitialiser
              </button>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="btn-primary text-sm"
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