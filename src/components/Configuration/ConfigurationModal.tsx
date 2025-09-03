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
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration financière</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Autorisation bancaire (DH)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.autorisationBancaire}
                onChange={(e) => handleInputChange('autorisationBancaire', parseFloat(e.target.value) || 0)}
                className={`input-field ${errors.autorisationBancaire ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.autorisationBancaire && (
                <p className="text-sm text-red-600 mt-1">{errors.autorisationBancaire}</p>
              )}
            </div>
            
          </div>
        </div>

        {/* Configuration générale - champs avancés retirés pour alignement avec le type Configuration actuel */}

        {/* Sauvegarde automatique - retiré */}

        {/* Notifications - retiré */}

        {/* Résumé des impacts */}
        {hasChanges && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Aperçu des modifications</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Autorisation bancaire: {formaterMontant(formData.autorisationBancaire)}</p>
              {/* Champs avancés retirés du résumé */}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading || !hasChanges}
            className="btn-secondary"
          >
            Réinitialiser
          </button>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={loading || isValidating || !hasChanges}
              className="btn-primary flex items-center"
            >
              {(loading || isValidating) && <LoadingSpinner size="sm" className="mr-2" />}
              {loading ? 'Sauvegarde...' : isValidating ? 'Validation...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ConfigurationModal;