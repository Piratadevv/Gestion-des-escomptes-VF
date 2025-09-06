import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  selectRefinancements,
  selectRefinancementsLoading,
  selectRefinancementsError,
  fetchRefinancements,
  deleteRefinancement
} from '../../store/slices/refinancementsSlice';
import { openModal } from '../../store/slices/uiSlice';
import { formaterMontant } from '../../utils/calculations';
import { Refinancement } from '../../types';

const RefinancementsTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const refinancements = useAppSelector(selectRefinancements);
  const isLoading = useAppSelector(selectRefinancementsLoading);
  const error = useAppSelector(selectRefinancementsError);
  const [sortField, setSortField] = useState<keyof Refinancement>('dateRefinancement');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchRefinancements({
      pagination: { page: 1, limit: 10 },
      filters: {},
      sort: { field: 'dateRefinancement', direction: 'desc' }
    }));
  }, [dispatch]);

  const handleSort = (field: keyof Refinancement) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (refinancement: Refinancement) => {
    dispatch(openModal({ 
      isOpen: true,
      type: 'refinancement', 
      mode: 'edit', 
      data: refinancement 
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce refinancement ?')) {
      dispatch(deleteRefinancement(id));
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      'ACTIF': { bg: 'bg-financial-50', text: 'text-financial-700', border: 'border-financial-200', icon: '●', label: 'Actif' },
      'TERMINE': { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-200', icon: '✓', label: 'Terminé' },
      'SUSPENDU': { bg: 'bg-risk-50', text: 'text-risk-700', border: 'border-risk-200', icon: '⏸', label: 'Suspendu' }
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.ACTIF;
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-banking text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-banking-sm`}>
        <span className="mr-1.5 text-xs">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // Filtrage et tri des refinancements
  const filteredAndSortedRefinancements = refinancements
    .filter(refinancement => 
      (refinancement.libelle && refinancement.libelle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (refinancement.statut && refinancement.statut.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle date strings
      if (typeof aValue === 'string' && typeof bValue === 'string' && 
          (sortField === 'dateRefinancement' || sortField === 'dateCreation' || sortField === 'dateModification')) {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      

      
      return 0;
    });

  const SortIcon = ({ field }: { field: keyof Refinancement }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-neutral-400 group-hover:text-trust-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-banking-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4l6 6h4l6-6" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-banking-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 20l-6-6H9l-6 6" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-banking w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-banking"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-risk-50 to-risk-100 border border-risk-200 rounded-banking shadow-banking p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 bg-risk-600 rounded-banking flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-semibold text-risk-800">Erreur de chargement</h3>
              <p className="text-sm text-risk-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header avec recherche */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-white to-banking-50 rounded-banking shadow-banking border border-banking-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-10 h-10 bg-banking-600 rounded-banking flex items-center justify-center shadow-banking-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-trust-900 to-banking-800 bg-clip-text text-transparent">
                  Liste des Refinancements
                </h2>
                <p className="text-sm text-trust-600 font-medium">
                  {filteredAndSortedRefinancements.length} refinancement{filteredAndSortedRefinancements.length !== 1 ? 's' : ''} trouvé{filteredAndSortedRefinancements.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par libellé ou statut..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-banking-300 rounded-banking focus:ring-2 focus:ring-banking-500 focus:border-banking-500 bg-white shadow-banking-sm transition-all duration-200 hover:border-banking-400 sm:text-sm font-medium"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-banking-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredAndSortedRefinancements.length === 0 ? (
        <div className="bg-white rounded-banking shadow-banking border border-neutral-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-banking mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-trust-900 mb-2">Aucun refinancement</h3>
            <p className="text-sm text-neutral-600 max-w-sm mx-auto">
              {searchTerm ? 'Aucun refinancement ne correspond à votre recherche. Essayez avec d\'autres termes.' : 'Commencez par créer votre premier refinancement pour suivre vos opérations financières.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-banking shadow-banking border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-banking-200">
              <thead className="bg-gradient-to-r from-banking-50 to-trust-50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-trust-700 uppercase tracking-wider cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
                  onClick={() => handleSort('libelle')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span>Libellé</span>
                    <SortIcon field="libelle" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-trust-700 uppercase tracking-wider cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
                  onClick={() => handleSort('dureeEnMois')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Durée (mois)</span>
                    <SortIcon field="dureeEnMois" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-trust-700 uppercase tracking-wider cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
                  onClick={() => handleSort('montantRefinance')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Montant</span>
                    <SortIcon field="montantRefinance" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-trust-700 uppercase tracking-wider cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
                  onClick={() => handleSort('tauxInteret')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>Taux</span>
                    <SortIcon field="tauxInteret" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-trust-700 uppercase tracking-wider cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
                  onClick={() => handleSort('dateRefinancement')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Date Refinancement</span>
                    <SortIcon field="dateRefinancement" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-trust-700 uppercase tracking-wider cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
                  onClick={() => handleSort('encoursRefinance')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Encours</span>
                    <SortIcon field="encoursRefinance" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-trust-700 uppercase tracking-wider cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
                  onClick={() => handleSort('statut')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Statut</span>
                    <SortIcon field="statut" />
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-trust-700 uppercase tracking-wider">
                  <div className="flex items-center justify-end space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-banking-100">
              {filteredAndSortedRefinancements.map((refinancement) => (
                <tr key={refinancement.id || `refinancement-${Math.random()}`} className="hover:bg-gradient-to-r hover:from-banking-25 hover:to-trust-25 transition-all duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-trust-900">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-banking-500 rounded-full"></div>
                      <span>{refinancement.libelle}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-trust-700 font-medium">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-banking bg-neutral-100 text-neutral-700 text-xs font-semibold">
                      {refinancement.dureeEnMois} mois
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-banking-800 font-bold">
                    {formaterMontant(refinancement.montantRefinance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-trust-700 font-medium">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-banking bg-banking-100 text-banking-700 text-xs font-semibold">
                      {refinancement.tauxInteret}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-trust-700 font-medium">
                    {new Date(refinancement.dateRefinancement).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-banking-800 font-bold">
                    {formaterMontant(refinancement.encoursRefinance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(refinancement.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => handleEdit(refinancement)}
                        className="inline-flex items-center justify-center w-8 h-8 text-banking-600 hover:text-white hover:bg-banking-600 bg-banking-50 border border-banking-200 rounded-banking transition-all duration-200 hover:shadow-banking-sm group"
                        title="Modifier le refinancement"
                      >
                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => refinancement.id && handleDelete(refinancement.id)}
                        className="inline-flex items-center justify-center w-8 h-8 text-risk-600 hover:text-white hover:bg-risk-600 bg-risk-50 border border-risk-200 rounded-banking transition-all duration-200 hover:shadow-banking-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer le refinancement"
                        disabled={!refinancement.id}
                      >
                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefinancementsTable;