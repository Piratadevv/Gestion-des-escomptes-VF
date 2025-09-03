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
        <div>
          <label htmlFor="dateRemise" className="label">
            Date de remise *
          </label>
          <input
            type="date"
            id="dateRemise"
            value={formData.dateRemise}
            onChange={(e) => handleInputChange('dateRemise', e.target.value)}
            className={`input-field ${errors.dateRemise ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            disabled={isSubmitting}
            required
          />
          {errors.dateRemise && (
            <p className="mt-1 text-sm text-danger-600">{errors.dateRemise}</p>
          )}
        </div>

        {/* Libellé */}
        <div>
          <label htmlFor="libelle" className="label">
            Libellé *
          </label>
          <input
            type="text"
            id="libelle"
            value={formData.libelle}
            onChange={(e) => handleInputChange('libelle', e.target.value)}
            placeholder="Description de l'escompte"
            className={`input-field ${errors.libelle ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            disabled={isSubmitting}
            maxLength={255}
            required
          />
          <div className="mt-1 flex justify-between">
            {errors.libelle ? (
              <p className="text-sm text-danger-600">{errors.libelle}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Décrivez brièvement l'escompte (minimum 3 caractères)
              </p>
            )}
            <span className="text-sm text-gray-400">
              {formData.libelle.length}/255
            </span>
          </div>
        </div>

        {/* Montant */}
        <div>
          <label htmlFor="montant" className="label">
            Montant (DH) *
          </label>
          <input
            type="number"
            id="montant"
            value={formData.montant || ''}
            onChange={(e) => handleInputChange('montant', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            max="999999.99"
            className={`input-field ${errors.montant ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            disabled={isSubmitting}
            required
          />
          {errors.montant && (
            <p className="mt-1 text-sm text-danger-600">{errors.montant}</p>
          )}
        </div>

        {/* Aperçu des calculs */}
        {showPreview && formData.montant > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-900">
              Aperçu des calculs
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
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
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="btn-secondary"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="btn-primary flex items-center"
          >
            {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
            {isEditing ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EscompteModal;