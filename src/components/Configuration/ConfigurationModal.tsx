import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateConfiguration, validateConfiguration } from '../../store/slices/configurationSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { Configuration } from '../../types';
import { validerConfiguration } from '../../utils/validation';
import { formaterMontant } from '../../utils/calculations';
import Modal from '../UI/Modal';
import LoadingSpinner from '../UI/LoadingSpinner';
import { fetchDashboardKPI } from '../../store/slices/dashboardSlice';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
}

/**
 * Composant ConfigurationModal - Modal de configuration de l'application
 */
const ConfigurationModal: React.FC<ConfigurationModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { configuration, isLoading: loading } = useAppSelector((state: any) => state.configuration);
  const [formData, setFormData] = useState<Configuration>({
    autorisationBancaire: 0,
  } as Configuration);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialiser le formulaire avec la configuration actuelle
  useEffect(() => {
    if (configuration && isOpen) {
      setFormData(configuration);
      setHasChanges(false);
      setErrors({});
    }
  }, [configuration, isOpen]);

  const handleInputChange = (field: keyof Configuration, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Supprimer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Placeholders for removed advanced fields to keep UI minimal and in-sync with types

  const validateForm = async () => {
    setIsValidating(true);
    try {
      // Validation côté client
      const clientValidation = validerConfiguration(formData);
      if (!clientValidation.valide) {
        // Aplatir le type Record<string, string[]> vers Record<string, string>
        const flatErrors: Record<string, string> = {};
        Object.entries(clientValidation.erreurs).forEach(([key, messages]) => {
          flatErrors[key] = (messages && messages[0]) ? messages[0] : 'Champ invalide';
        });
        setErrors(flatErrors);
        return false;
      }

      // Validation côté serveur
      await dispatch(validateConfiguration(formData)).unwrap();
      setErrors({});
      return true;
    } catch (error: any) {
      if (error.validationErrors) {
        setErrors(error.validationErrors);
      } else {
        dispatch(addNotification({
          type: 'error',
          title: 'Erreur de validation',
          message: error.message || 'Impossible de valider la configuration',
          autoClose: true,
          duration: 5000,
        }));
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      onClose();
      return;
    }

    const isValid = await validateForm();
    if (!isValid) return;

    try {
      await dispatch(updateConfiguration(formData)).unwrap();
      // Refresh KPI after configuration changes
      await dispatch(fetchDashboardKPI() as any).unwrap();
      dispatch(addNotification({
        type: 'success',
        title: 'Configuration sauvegardée',
        message: 'Configuration mise à jour avec succès',
        autoClose: true,
        duration: 3000,
      }));
      onClose();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: error.message || 'Impossible de sauvegarder la configuration',
        autoClose: true,
        duration: 5000,
      }));
    }
  };

  const handleReset = () => {
    if (configuration) {
      setFormData(configuration);
      setHasChanges(false);
      setErrors({});
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuration financière */}
        <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-banking border border-slate-200/50">
          <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-trust-900 to-trust-700 bg-clip-text text-transparent mb-3 sm:mb-4 flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-banking-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Configuration financière
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group-responsive">
              <label className="label-responsive">
                <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                </svg>
                Autorisation bancaire (DH) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.autorisationBancaire}
                  onChange={(e) => handleInputChange('autorisationBancaire', parseFloat(e.target.value) || 0)}
                  className={`input-field-responsive touch-target-large pr-12 ${
                    errors.autorisationBancaire 
                      ? 'border-risk-500 focus:ring-risk-500 focus:border-risk-500' 
                      : ''
                  }`}
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base font-medium">
                  DH
                </span>
              </div>
              {errors.autorisationBancaire && (
                <p className="error-message-responsive">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                  </svg>
                  {errors.autorisationBancaire}
                </p>
              )}
            </div>
            
          </div>
        </div>

        {/* Configuration générale - champs avancés retirés pour alignement avec le type Configuration actuel */}

        {/* Sauvegarde automatique - retiré */}

        {/* Notifications - retiré */}

        {/* Résumé des impacts */}
        {hasChanges && (
          <div className="bg-gradient-to-r from-banking-50 to-banking-100/50 border border-banking-200 rounded-banking p-4 shadow-banking-sm">
            <h4 className="text-sm font-semibold text-banking-900 mb-3 flex items-center">
              <svg className="w-4 h-4 text-banking-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Aperçu des modifications
            </h4>
            <div className="text-sm text-banking-700 space-y-2">
              <div className="flex items-center bg-white/60 rounded-banking px-3 py-2">
                <svg className="w-4 h-4 text-banking-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                </svg>
                <span className="font-medium">Autorisation bancaire:</span>
                <span className="ml-2 font-semibold text-banking-800">{formaterMontant(formData.autorisationBancaire)}</span>
              </div>
              {/* Champs avancés retirés du résumé */}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gradient-to-r from-slate-200 to-slate-300/50 bg-gradient-to-r from-slate-50/30 to-white">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading || !hasChanges}
            className="touch-target-large order-3 sm:order-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-banking hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-banking-sm flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Réinitialiser
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 order-1 sm:order-2">
             <button
               type="submit"
              disabled={loading || isValidating || !hasChanges}
              className="touch-target-large order-2 sm:order-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-banking-600 to-banking-700 border border-transparent rounded-banking hover:from-banking-700 hover:to-banking-800 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-banking hover:shadow-banking-md flex items-center justify-center"
            >
              {(loading || isValidating) && <LoadingSpinner size="sm" className="mr-2" />}
              {loading ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sauvegarde...
                </>
              ) : isValidating ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validation...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Sauvegarder
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="touch-target-large order-1 sm:order-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-banking hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-banking-sm flex items-center justify-center"
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ConfigurationModal;