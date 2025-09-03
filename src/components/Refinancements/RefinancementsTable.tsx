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
      'ACTIF': { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif' },
      'TERMINE': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminé' },
      'SUSPENDU': { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspendu' }
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.ACTIF;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
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
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4l6 6h4l6-6" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 20l-6-6H9l-6 6" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
            Liste des Refinancements ({filteredAndSortedRefinancements.length})
          </h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredAndSortedRefinancements.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun refinancement</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Aucun refinancement ne correspond à votre recherche.' : 'Commencez par créer votre premier refinancement.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('libelle')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Libellé</span>
                    <SortIcon field="libelle" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dureeEnMois')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Durée (mois)</span>
                    <SortIcon field="dureeEnMois" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('montantRefinance')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Montant</span>
                    <SortIcon field="montantRefinance" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('tauxInteret')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Taux</span>
                    <SortIcon field="tauxInteret" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dateRefinancement')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date Refinancement</span>
                    <SortIcon field="dateRefinancement" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('encoursRefinance')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Encours</span>
                    <SortIcon field="encoursRefinance" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('statut')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Statut</span>
                    <SortIcon field="statut" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedRefinancements.map((refinancement) => (
                <tr key={refinancement.id || `refinancement-${Math.random()}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {refinancement.libelle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {refinancement.dureeEnMois} mois
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formaterMontant(refinancement.montantRefinance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {refinancement.tauxInteret}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(refinancement.dateRefinancement).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formaterMontant(refinancement.encoursRefinance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(refinancement.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(refinancement)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => refinancement.id && handleDelete(refinancement.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Supprimer"
                        disabled={!refinancement.id}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      )}
    </div>
  );
};

export default RefinancementsTable;