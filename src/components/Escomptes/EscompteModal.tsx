import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { createEscompte, updateEscompte } from '../../store/slices/escomptesSlice';
import { selectAutorisationBancaire as selectConfigAutorisationBancaire } from '../../store/slices/configurationSlice';
import { selectCumulTotal, selectCumulGlobal } from '../../store/slices/dashboardSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { validerEscompte, validerMontantEscompte, validerDateRemise } from '../../utils/validation';
import { calculerImpactNouveauMontant, formaterMontant } from '../../utils/calculations';
import { obtenirDateActuelle, dateVersInputHTML } from '../../utils/dates';
import { Escompte, EscompteFormData } from '../../types';
import Modal from '../UI/Modal';
import LoadingSpinner from '../UI/LoadingSpinner';

interface EscompteModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: Escompte | null;
}

/**
 * Composant EscompteModal - Modal de création/modification d'escompte
 */
const EscompteModal: React.FC<EscompteModalProps> = ({ isOpen, onClose, data }) => {
  const dispatch = useAppDispatch();
  const autorisationBancaire = useAppSelector(selectConfigAutorisationBancaire);
  const cumulTotal = useAppSelector(selectCumulTotal);
  const cumulGlobal = useAppSelector(selectCumulGlobal);
  
  const [formData, setFormData] = useState<EscompteFormData>({
    dateRemise: dateVersInputHTML(obtenirDateActuelle()),
    libelle: '',
    montant: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isEditing = !!data;

  // Initialisation du formulaire
  useEffect(() => {
    if (isOpen) {
      if (data) {
        setFormData({
          dateRemise: data.dateRemise,
          libelle: data.libelle,
          montant: data.montant
        });
      } else {
        setFormData({
          dateRemise: dateVersInputHTML(obtenirDateActuelle()),
          libelle: '',
          montant: 0
        });
      }
      setErrors({});
      setIsSubmitting(false);
      setShowPreview(false);
    }
  }, [isOpen, data]);

  const handleInputChange = (field: keyof EscompteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Afficher l'aperçu si le montant est valide
    if (field === 'montant' && value > 0) {
      setShowPreview(true);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation de la date
    const dateValidation = validerDateRemise(formData.dateRemise);
    if (!dateValidation.valide && dateValidation.erreurs.length > 0) {
      newErrors.dateRemise = dateValidation.erreurs[0] || 'Date invalide';
    }

    // Validation du libellé
    if (!formData.libelle.trim()) {
      newErrors.libelle = 'Le libellé est obligatoire';
    } else if (formData.libelle.trim().length < 3) {
      newErrors.libelle = 'Le libellé doit contenir au moins 3 caractères';
    } else if (formData.libelle.trim().length > 255) {
      newErrors.libelle = 'Le libellé ne peut pas dépasser 255 caractères';
    }

    // Validation du montant
    if (formData.montant <= 0) {
      newErrors.montant = 'Le montant doit être supérieur à 0';
    } else {
      const montantValidation = validerMontantEscompte(
        formData.montant,
        cumulTotal,
        autorisationBancaire
      );
      if (!montantValidation.valide && montantValidation.erreurs.length > 0) {
        newErrors.montant = montantValidation.erreurs[0] || 'Montant invalide';
      }
    }

    // Validation globale avec Zod via utilitaire
    const validationGlobale = validerEscompte({
      dateRemise: formData.dateRemise,
      libelle: formData.libelle.trim(),
      montant: formData.montant,
    });
    if (!validationGlobale.valide) {
      Object.entries(validationGlobale.erreurs).forEach(([champ, messages]) => {
        if (messages && messages.length > 0) {
          newErrors[champ] = messages[0] || 'Champ invalide';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const escompteData = {
        dateRemise: formData.dateRemise,
        libelle: formData.libelle.trim(),
        montant: formData.montant
      };

      if (isEditing && data && data.id) {
        await dispatch(updateEscompte({ id: data.id, escompte: escompteData })).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'Modification réussie',
          message: 'Escompte modifié avec succès',
          autoClose: true,
          duration: 3000,
        }));
      } else {
        await dispatch(createEscompte(escompteData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'Création réussie',
          message: 'Escompte créé avec succès',
          autoClose: true,
          duration: 3000,
        }));
      }

      onClose();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: `Erreur lors de la ${isEditing ? 'modification' : 'création'}`,
        message: error.message || 'Une erreur inattendue s\'est produite',
        autoClose: true,
        duration: 5000,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Calcul de l'impact du nouveau montant
  // Pour l'impact, on utilise le cumul global actuel moins l'ancien montant si on modifie
  const cumulActuelGlobal = isEditing && data?.montant ? cumulGlobal - data.montant : cumulGlobal;
  const impact = calculerImpactNouveauMontant(
    formData.montant,
    cumulActuelGlobal,
    autorisationBancaire
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Modifier l\'escompte' : 'Nouvel escompte'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date de remise */}
        <div className="form-group-responsive">
          <label htmlFor="dateRemise" className="label-responsive">
            <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Date de remise *
          </label>
          <input
            type="date"
            id="dateRemise"
            value={formData.dateRemise}
            onChange={(e) => handleInputChange('dateRemise', e.target.value)}
            className={`input-field-responsive touch-target-large ${errors.dateRemise ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            disabled={isSubmitting}
            required
          />
          {errors.dateRemise && (
            <p className="error-message-responsive">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.dateRemise}
            </p>
          )}
        </div>

        {/* Libellé */}
        <div className="form-group-responsive">
          <label htmlFor="libelle" className="label-responsive">
            <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Libellé *
          </label>
          <input
            type="text"
            id="libelle"
            value={formData.libelle}
            onChange={(e) => handleInputChange('libelle', e.target.value)}
            placeholder="Description de l'escompte"
            className={`input-field-responsive touch-target-large ${errors.libelle ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            disabled={isSubmitting}
            maxLength={255}
            required
          />
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            {errors.libelle ? (
              <p className="error-message-responsive">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.libelle}
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-gray-500">
                Décrivez brièvement l'escompte (minimum 3 caractères)
              </p>
            )}
            <span className="text-sm text-gray-400 sm:ml-2 self-end sm:self-auto">
              {formData.libelle.length}/255
            </span>
          </div>
        </div>

        {/* Montant */}
        <div className="form-group-responsive">
          <label htmlFor="montant" className="label-responsive">
            <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5a1 1 0 10-2 0z" clipRule="evenodd" />
            </svg>
            Montant (DH) *
          </label>
          <div className="relative">
            <input
              type="number"
              id="montant"
              value={formData.montant || ''}
              onChange={(e) => handleInputChange('montant', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max="999999.99"
              className={`input-field-responsive touch-target-large pr-12 ${errors.montant ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
              disabled={isSubmitting}
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 text-sm font-medium">DH</span>
            </div>
          </div>
          {errors.montant && (
            <p className="error-message-responsive">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.montant}
            </p>
          )}
        </div>

        {/* Aperçu des calculs */}
        {showPreview && formData.montant > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h4 className="flex items-center text-sm sm:text-base font-medium text-gray-900">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              Aperçu des calculs
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Cumul actuel (global) :</span>
                <span className="ml-2 font-medium">{formaterMontant(cumulGlobal)}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Nouveau cumul :</span>
                <span className="ml-2 font-medium">{formaterMontant(impact.nouveauCumul)}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Autorisation :</span>
                <span className="ml-2 font-medium">{formaterMontant(autorisationBancaire)}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Nouvel encours :</span>
                <span className={`ml-2 font-medium ${
                  impact.nouvelEncours < 0 ? 'text-danger-600' : 'text-success-600'
                }`}>
                  {formaterMontant(impact.nouvelEncours)}
                </span>
              </div>
            </div>
            
            {impact.nouvelEncours < 0 && (
              <div className="bg-danger-50 border border-danger-200 rounded p-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-danger-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-danger-800">
                    Attention : Ce montant dépasserait l'autorisation bancaire de {formaterMontant(Math.abs(impact.nouvelEncours))} DH
                  </span>
                </div>
              </div>
            )}
            
            {impact.nouvelEncours >= 0 && impact.nouvelEncours < (autorisationBancaire * 0.1) && (
              <div className="bg-warning-50 border border-warning-200 rounded p-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-warning-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-warning-800">
                    Attention : Il ne restera que {formaterMontant(impact.nouvelEncours)} DH d'encours disponible
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="btn-secondary touch-target-large order-2 sm:order-1"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="btn-primary touch-target-large flex items-center justify-center order-1 sm:order-2 active:scale-95 transform-responsive"
          >
            {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              {isEditing ? (
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              )}
            </svg>
            {isEditing ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EscompteModal;