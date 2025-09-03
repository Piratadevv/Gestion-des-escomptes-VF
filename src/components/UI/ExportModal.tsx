import React, { useState } from 'react';
import { useAppDispatch } from '../../store';
import { exportEscomptes } from '../../store/slices/escomptesSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { ExportOptions, EscompteFilters } from '../../types';
import { obtenirDebutFinMoisCourant, dateVersInputHTML, inputHTMLVersDate } from '../../utils/dates';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
}

/**
 * Composant ExportModal - Modal d'export des données
 */
const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeHeaders: true,
    dateRange: 'all',
    customDateStart: '',
    customDateEnd: ''
  });

  const convertDateRangeToFilters = (): EscompteFilters => {
    const filters: EscompteFilters = {};
    
    switch (exportOptions.dateRange) {
      case 'thisMonth': {
        const { debut, fin } = obtenirDebutFinMoisCourant();
        filters.dateDebut = dateVersInputHTML(debut);
        filters.dateFin = dateVersInputHTML(fin);
        break;
      }
      case 'lastMonth': {
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        const debut = startOfMonth(lastMonth);
        const fin = endOfMonth(lastMonth);
        filters.dateDebut = dateVersInputHTML(debut);
        filters.dateFin = dateVersInputHTML(fin);
        break;
      }
      case 'custom':
        if (exportOptions.customDateStart) {
          filters.dateDebut = exportOptions.customDateStart;
        }
        if (exportOptions.customDateEnd) {
          filters.dateFin = exportOptions.customDateEnd;
        }
        break;
      default:
        // 'all' - no date filters
        break;
    }
    
    return filters;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filters = convertDateRangeToFilters();
      
      // Validate custom date range
      if (exportOptions.dateRange === 'custom') {
        if (exportOptions.customDateStart && exportOptions.customDateEnd) {
          const startDate = inputHTMLVersDate(exportOptions.customDateStart);
          const endDate = inputHTMLVersDate(exportOptions.customDateEnd);
          
          if (startDate && endDate && startDate > endDate) {
            dispatch(addNotification({
              type: 'error',
              title: 'Erreur de validation',
              message: 'La date de début doit être antérieure à la date de fin',
              autoClose: true,
              duration: 5000,
            }));
            return;
          }
        }
      }
      
      await dispatch(exportEscomptes({ 
        format: exportOptions.format, 
        filters 
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Export réussi',
        message: `Le fichier ${exportOptions.format.toUpperCase()} a été téléchargé avec succès`,
        autoClose: true,
        duration: 5000,
      }));
      onClose();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur d\'export',
        message: error.message || 'Impossible d\'exporter les données',
        autoClose: true,
        duration: 8000,
      }));
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (field: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exporter les données"
      size="md"
    >
      <div className="space-y-6">
        {/* Format d'export */}
        <div>
          <label className="label">Format d'export</label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="excel"
                checked={exportOptions.format === 'excel'}
                onChange={(e) => handleOptionChange('format', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Excel (.xlsx) - Exporte les montants en dirhams marocains (DH)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={exportOptions.format === 'csv'}
                onChange={(e) => handleOptionChange('format', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">CSV (.csv)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={exportOptions.format === 'pdf'}
                onChange={() => {
                  setExportOptions({ ...exportOptions, format: 'pdf' });
                }}
                className="text-blue-600"
              />
              <span className="text-sm">PDF (.pdf)</span>
              {exportOptions.format === 'pdf' && (
                <span className="ml-2 text-xs text-yellow-600">(Bientôt disponible)</span>
              )}
            </label>
          </div>
        </div>

        {/* Période */}
        <div>
          <label className="label">Période</label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="dateRange"
                value="all"
                checked={exportOptions.dateRange === 'all'}
                onChange={(e) => handleOptionChange('dateRange', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Toutes les données</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="dateRange"
                value="thisMonth"
                checked={exportOptions.dateRange === 'thisMonth'}
                onChange={(e) => handleOptionChange('dateRange', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Ce mois</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="dateRange"
                value="lastMonth"
                checked={exportOptions.dateRange === 'lastMonth'}
                onChange={(e) => handleOptionChange('dateRange', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Mois dernier</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="dateRange"
                value="custom"
                checked={exportOptions.dateRange === 'custom'}
                onChange={(e) => handleOptionChange('dateRange', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Période personnalisée</span>
            </label>
          </div>
        </div>

        {/* Dates personnalisées */}
        {exportOptions.dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date de début</label>
              <input
                type="date"
                value={exportOptions.customDateStart}
                onChange={(e) => handleOptionChange('customDateStart', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Date de fin</label>
              <input
                type="date"
                value={exportOptions.customDateEnd}
                onChange={(e) => handleOptionChange('customDateEnd', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Options */}
        <div>
          <label className="label">Options</label>
          <div className="mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeHeaders}
                onChange={(e) => handleOptionChange('includeHeaders', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Inclure les en-têtes de colonnes</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="btn-secondary"
          >
            Annuler
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary flex items-center"
          >
            {isExporting && <LoadingSpinner size="sm" className="mr-2" />}
            {isExporting ? 'Export en cours...' : 'Exporter'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;