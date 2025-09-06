import React, { useEffect } from 'react';
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
  const [selectedEscomptes, setSelectedEscomptes] = React.useState<string[]>([]);

  // Charger les escomptes au montage du composant
  useEffect(() => {
    dispatch(fetchEscomptes({
      pagination,
      filters,
      sort: sorting
    }));
  }, [dispatch, pagination.page, pagination.limit, filters, sorting]);

  const handleSort = (field: 'dateRemise' | 'libelle' | 'montant' | 'ordreSaisie') => {
    const newDirection = 
      sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
    
    dispatch(setSort({ field, direction: newDirection }));
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

  const getSortIcon = (field: 'dateRemise' | 'libelle' | 'montant' | 'ordreSaisie') => {
    if (sorting.field !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sorting.direction === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  const allSelected = escomptes.length > 0 && selectedEscomptes.length === escomptes.length;
  const someSelected = selectedEscomptes.length > 0 && selectedEscomptes.length < escomptes.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (escomptes.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun escompte</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par créer votre premier escompte.
        </p>
        <div className="mt-6">
          <button
            onClick={() => dispatch(openModal({ type: 'escompte', mode: 'create', data: null, isOpen: true } as any))}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Créer un escompte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Actions en lot */}
      {selectedEscomptes.length > 0 && (
        <div className="bg-primary-50 border-b border-primary-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-700">
              {selectedEscomptes.length} escompte{selectedEscomptes.length > 1 ? 's' : ''} sélectionné{selectedEscomptes.length > 1 ? 's' : ''}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="btn-danger text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
              <button
                onClick={() => setSelectedEscomptes([])}
                className="btn-secondary text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-trust-300 text-banking-600 focus:ring-banking-500 focus:ring-offset-2"
                  aria-label="Sélectionner tous les escomptes"
                />
              </th>
              
              <th className="px-6 py-4 text-left text-xs font-bold text-trust-700 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('dateRemise')}
                  className="flex items-center space-x-2 hover:text-banking-700 focus:outline-none focus:text-banking-700 hover:bg-banking-100 transition-colors duration-200 rounded-banking px-2 py-1"
                >
                  <span>Date de remise</span>
                  {getSortIcon('dateRemise')}
                </button>
              </th>
              
              <th className="px-6 py-4 text-left text-xs font-bold text-trust-700 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('libelle')}
                  className="flex items-center space-x-2 hover:text-banking-700 focus:outline-none focus:text-banking-700 hover:bg-banking-100 transition-colors duration-200 rounded-banking px-2 py-1"
                >
                  <span>Libellé</span>
                  {getSortIcon('libelle')}
                </button>
              </th>
              
              <th className="px-6 py-4 text-left text-xs font-bold text-trust-700 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('montant')}
                  className="flex items-center space-x-2 hover:text-banking-700 focus:outline-none focus:text-banking-700 hover:bg-banking-100 transition-colors duration-200 rounded-banking px-2 py-1"
                >
                  <span>Montant</span>
                  {getSortIcon('montant')}
                </button>
              </th>
              
              <th className="px-6 py-4 text-left text-xs font-bold text-trust-700 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('ordreSaisie')}
                  className="flex items-center space-x-2 hover:text-banking-700 focus:outline-none focus:text-banking-700 hover:bg-banking-100 transition-colors duration-200 rounded-banking px-2 py-1"
                >
                  <span>Ordre</span>
                  {getSortIcon('ordreSaisie')}
                </button>
              </th>
              
              <th className="px-6 py-4 text-left text-xs font-bold text-trust-700 uppercase tracking-wider">
                Créé le
              </th>
              
              <th className="px-6 py-4 text-right text-xs font-bold text-trust-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-trust-200">
            {escomptes.map((escompte, index) => (
              <tr
                key={escompte.id}
                className={`
                  hover:bg-banking-50 transition-colors duration-200
                  ${escompte.id && selectedEscomptes.includes(escompte.id) ? 'bg-banking-100 border-l-4 border-banking-500' : ''}
                  ${index % 2 === 0 ? 'bg-white' : 'bg-trust-25'}
                `}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={escompte.id ? selectedEscomptes.includes(escompte.id) : false}
                    onChange={(e) => escompte.id && handleSelectEscompte(escompte.id, e.target.checked)}
                    className="rounded border-trust-300 text-banking-600 focus:ring-banking-500 focus:ring-offset-2"
                    aria-label={`Sélectionner l'escompte ${escompte.libelle}`}
                    disabled={!escompte.id}
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-trust-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formaterDate(escompte.dateRemise)}
                  </div>
                </td>
                
                <td className="px-6 py-4 text-sm text-neutral-900">
                  <div className="max-w-xs truncate font-medium" title={escompte.libelle}>
                    {escompte.libelle}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-success-700">
                  <div className="flex items-center">
                    <span className="text-success-600 mr-1">DH</span>
                    {formaterMontant(escompte.montant)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-trust-600">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-trust-100 text-trust-800">
                    #{escompte.ordreSaisie}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {escompte.dateCreation ? formaterDate(escompte.dateCreation) : '-'}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleEdit(escompte)}
                      className="p-2 text-banking-600 hover:text-banking-900 hover:bg-banking-100 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 rounded-banking transition-all duration-200"
                      aria-label={`Modifier l'escompte ${escompte.libelle}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(escompte)}
                      className="p-2 text-risk-600 hover:text-risk-900 hover:bg-risk-100 focus:outline-none focus:ring-2 focus:ring-risk-500 focus:ring-offset-2 rounded-banking transition-all duration-200"
                      aria-label={`Supprimer l'escompte ${escompte.libelle}`}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-gradient-to-r from-banking-25 to-trust-25 px-6 py-4 border-t border-trust-200">
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