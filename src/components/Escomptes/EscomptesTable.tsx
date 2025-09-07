import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectEscomptes,
  selectEscomptesLoading,
  selectEscomptesPagination,
  selectEscomptesSort,
  selectEscomptesFilters,
  fetchEscomptes,
  setSort,
  deleteEscompte
} from '../../store/slices/escomptesSlice';
import { openModal, addNotification } from '../../store/slices/uiSlice';
import { formaterMontant } from '../../utils/calculations';
import { formaterDate } from '../../utils/dates';
import { Escompte } from '../../types';
import Pagination from '../UI/Pagination';
import LoadingSpinner from '../UI/LoadingSpinner';

/**
 * Composant EscomptesTable - Tableau des escomptes avec tri et pagination
 */
const EscomptesTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const escomptes = useAppSelector(selectEscomptes);
  const loading = useAppSelector(selectEscomptesLoading);
  const pagination = useAppSelector(selectEscomptesPagination);
  const sorting = useAppSelector(selectEscomptesSort);
  const filters = useAppSelector(selectEscomptesFilters);
  const [selectedEscomptes, setSelectedEscomptes] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Escompte>('dateRemise');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les escomptes au montage du composant
  useEffect(() => {
    dispatch(fetchEscomptes({
      pagination,
      filters,
      sort: sorting
    }));
  }, [dispatch, pagination.page, pagination.limit, filters, sorting]);

  const handleSort = (field: keyof Escompte) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    // Only dispatch for valid sortable fields
    const validSortFields = ['dateRemise', 'libelle', 'montant', 'ordreSaisie'] as const;
    if (validSortFields.includes(field as any)) {
      dispatch(setSort({ field: field as any, direction: newDirection }));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEscomptes(escomptes.filter(e => e.id).map(e => e.id!));
    } else {
      setSelectedEscomptes([]);
    }
  };

  const handleSelectEscompte = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEscomptes([...selectedEscomptes, id]);
    } else {
      setSelectedEscomptes(selectedEscomptes.filter(eid => eid !== id));
    }
  };

  const handleEdit = (escompte: Escompte) => {
    dispatch(openModal({ type: 'escompte', mode: 'edit', data: escompte, isOpen: true } as any));
  };

  const handleDelete = (escompte: Escompte) => {
    if (!escompte.id) return;
    dispatch(openModal({
      type: 'confirmation',
      isOpen: true,
      data: {
        title: 'Confirmer la suppression',
        message: `Supprimer l’escompte « ${escompte.libelle} » ?`,
        type: 'danger',
        onConfirm: () => confirmDelete(escompte),
      },
    } as any));
  };

  const confirmDelete = async (escompte: Escompte) => {
    if (!escompte.id) return;
    
    try {
      await dispatch(deleteEscompte(escompte.id)).unwrap();
      dispatch(addNotification({
        type: 'success',
        title: 'Suppression réussie',
              message: 'Escompte supprimé avec succès',
        autoClose: true,
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de suppression',
        message: 'Impossible de supprimer l\'escompte',
        autoClose: true,
        duration: 5000,
      }));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEscomptes.length === 0) return;

    try {
      await Promise.all(
        selectedEscomptes.map(id => dispatch(deleteEscompte(id)).unwrap())
      );
      setSelectedEscomptes([]);
      dispatch(addNotification({
        type: 'success',
        title: 'Suppression réussie',
        message: `${selectedEscomptes.length} escompte${selectedEscomptes.length > 1 ? 's supprimés' : ' supprimé'} avec succès`,
        autoClose: true,
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de suppression',
        message: 'Impossible de supprimer certains escomptes',
        autoClose: true,
        duration: 5000,
      }));
    }
  };

  // Filtrage et tri des escomptes
  const filteredAndSortedEscomptes = escomptes
    .filter(escompte => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        escompte.libelle.toLowerCase().includes(searchLower) ||
        escompte.montant.toString().includes(searchLower) ||
        (escompte.ordreSaisie?.toString() || '').includes(searchLower) ||
        formaterDate(escompte.dateRemise).toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ field }: { field: keyof Escompte }) => {
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

  const allSelected = escomptes.length > 0 && selectedEscomptes.length === escomptes.length;
  const someSelected = selectedEscomptes.length > 0 && selectedEscomptes.length < escomptes.length;

  if (loading) {
    return (
      <div className="bg-white rounded-banking shadow-banking border border-neutral-200 p-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header avec recherche */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-white to-banking-50 rounded-banking shadow-banking border border-banking-200 p-6">
          <div className="mobile-stack">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-banking-600 rounded-banking flex items-center justify-center shadow-banking-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-trust-900 to-banking-800 bg-clip-text text-transparent">
                  Liste des Escomptes
                </h2>
                <p className="text-sm text-trust-600 font-medium">
                  {filteredAndSortedEscomptes.length} escompte{filteredAndSortedEscomptes.length !== 1 ? 's' : ''} trouvé{filteredAndSortedEscomptes.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="mobile-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mobile-full pl-10 pr-4 py-3 border border-banking-300 rounded-banking focus:ring-2 focus:ring-banking-500 focus:border-banking-500 bg-white shadow-banking-sm transition-all duration-200 hover:border-banking-400 text-sm font-medium"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
      {filteredAndSortedEscomptes.length === 0 ? (
        <div className="bg-white rounded-banking shadow-banking border border-neutral-200 p-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-banking mx-auto mb-6 flex items-center justify-center">
              <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-trust-900 mb-4">Aucun escompte</h3>
            <p className="text-sm text-neutral-600 max-w-sm mx-auto">
              {searchTerm ? 'Aucun escompte ne correspond à votre recherche. Essayez avec d\'autres termes.' : 'Commencez par créer votre premier escompte pour suivre vos opérations financières.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-banking shadow-banking border border-neutral-200 overflow-hidden">
          <div className="table-responsive">
            <table className="table">
              <thead className="bg-gradient-to-r from-banking-50 to-trust-50">
              <tr>
                <th className="table-header-cell">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-trust-300 text-banking-600 focus:ring-banking-500 focus:ring-offset-2 w-4 h-4"
                    aria-label="Sélectionner tous les escomptes"
                  />
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
                  onClick={() => handleSort('dateRemise')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Date de remise</span>
                    <SortIcon field="dateRemise" />
                  </div>
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
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
                  className="table-header-cell cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
                  onClick={() => handleSort('montant')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Montant</span>
                    <SortIcon field="montant" />
                  </div>
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-banking-100 transition-colors duration-200 group"
                  onClick={() => handleSort('ordreSaisie')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <span>Ordre</span>
                    <SortIcon field="ordreSaisie" />
                  </div>
                </th>
                <th className="table-header-cell">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Date création</span>
                  </div>
                </th>
                <th className="table-header-cell">
                  <div className="flex items-center justify-end space-x-2">
                    <svg className="w-4 h-4 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
              </thead>
          
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredAndSortedEscomptes.map((escompte, index) => {
              const isSelected = escompte.id ? selectedEscomptes.includes(escompte.id) : false;
              return (
                <tr
                  key={escompte.id}
                  className={`
                    table-row group
                    ${isSelected ? 'bg-banking-50 border-l-4 border-banking-500' : ''}
                    ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-25'}
                  `}
                >
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => escompte.id && handleSelectEscompte(escompte.id, e.target.checked)}
                      className="rounded border-neutral-300 text-banking-600 focus:ring-banking-500 focus:ring-offset-2 w-4 h-4"
                      aria-label={`Sélectionner l'escompte ${escompte.libelle}`}
                      disabled={!escompte.id}
                    />
                  </td>
                  
                  <td className="table-cell">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-banking-100 to-trust-100 flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-banking-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-neutral-900">
                          {formaterDate(escompte.dateRemise)}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="table-cell">
                    <div className="text-sm text-neutral-900 truncate max-w-xs" title={escompte.libelle}>
                      {escompte.libelle}
                    </div>
                  </td>
                  
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-success-100 to-success-50 text-success-800 border border-success-200">
                      DH {formaterMontant(escompte.montant)}
                    </span>
                  </td>
                  
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-neutral-100 to-neutral-50 text-neutral-800 border border-neutral-200">
                      #{escompte.ordreSaisie}
                    </span>
                  </td>
                  
                  <td className="table-cell">
                    <div className="text-sm text-neutral-500">
                      {escompte.dateCreation ? formaterDate(escompte.dateCreation) : '-'}
                    </div>
                  </td>
                  
                  <td className="table-cell">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(escompte)}
                        className="action-btn action-btn-edit"
                        aria-label={`Modifier l'escompte ${escompte.libelle}`}
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(escompte)}
                        className="action-btn action-btn-delete"
                        aria-label={`Supprimer l'escompte ${escompte.libelle}`}
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {filteredAndSortedEscomptes.map((escompte) => {
          const isSelected = escompte.id ? selectedEscomptes.includes(escompte.id) : false;
          return (
            <div
              key={escompte.id}
              className={`
                mobile-card
                ${isSelected ? 'border-banking-300 bg-banking-50' : ''}
              `}
            >
              {/* Header with checkbox and actions */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => escompte.id && handleSelectEscompte(escompte.id, e.target.checked)}
                    className="rounded border-neutral-300 text-banking-600 focus:ring-banking-500 focus:ring-offset-2 w-4 h-4 flex-shrink-0"
                    aria-label={`Sélectionner l'escompte ${escompte.libelle}`}
                    disabled={!escompte.id}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-neutral-900 truncate" title={escompte.libelle}>
                      {escompte.libelle}
                    </h3>
                    <div className="flex items-center space-x-1 mt-1">
                      <svg className="w-3 h-3 text-banking-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-neutral-500">
                        {formaterDate(escompte.dateRemise)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-neutral-100 to-neutral-50 text-neutral-800 border border-neutral-200">
                    #{escompte.ordreSaisie}
                  </span>
                  <button
                    onClick={() => handleEdit(escompte)}
                    className="action-btn action-btn-edit"
                    aria-label={`Modifier l'escompte ${escompte.libelle}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(escompte)}
                    className="action-btn action-btn-delete"
                    aria-label={`Supprimer l'escompte ${escompte.libelle}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {/* Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-xs text-neutral-500">Montant</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-success-100 to-success-50 text-success-800 border border-success-200">
                    DH {formaterMontant(escompte.montant)}
                  </span>
                </div>

                {/* Date de création */}
                {escompte.dateCreation && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-neutral-500">Créé le</span>
                    </div>
                    <span className="text-sm text-neutral-600">
                      {formaterDate(escompte.dateCreation)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-gradient-to-r from-banking-25 to-trust-25 px-6 py-6 border-t border-trust-200 mt-4 md:mt-0">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => {
              // Déclencher un nouveau fetch avec la page mise à jour
              dispatch(fetchEscomptes({
                pagination: { page, limit: pagination.limit },
              }) as any);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EscomptesTable;