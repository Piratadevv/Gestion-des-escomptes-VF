import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import { selectAutorisationBancaire, selectCumulGlobal } from '../../store/slices/dashboardSlice';
import { createRefinancement, updateRefinancement } from '../../store/slices/refinancementsSlice';
import { Refinancement, RefinancementFormData } from '../../types';
import { validerRefinancement, validerMontantRefinancement, validerDateRefinancement } from '../../utils/validation';
import { calculerImpactNouveauMontant, formaterMontant } from '../../utils/calculations';
import { obtenirDateActuelle, dateVersInputHTML } from '../../utils/dates';
import Modal from '../UI/Modal';
import LoadingSpinner from '../UI/LoadingSpinner';

interface RefinancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: Refinancement | null;
}

const RefinancementModal: React.FC<RefinancementModalProps> = ({ isOpen, onClose, data }) => {
  const dispatch = useAppDispatch();
  const autorisationBancaire = useAppSelector(selectAutorisationBancaire);
  const cumulGlobal = useAppSelector(selectCumulGlobal);

  const isEditing = !!data;

  const [formData, setFormData] = useState<RefinancementFormData>({
    dateRefinancement: dateVersInputHTML(obtenirDateActuelle()),
    libelle: '',
    montantRefinance: 0,
    tauxInteret: 0,
    dureeEnMois: 12,
    encoursRefinance: 0,
    fraisDossier: 0,
    conditions: '',
    statut: 'ACTIF',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (data) {
      setFormData({
        dateRefinancement: data.dateRefinancement,
        libelle: data.libelle,
        montantRefinance: data.montantRefinance,
        tauxInteret: data.tauxInteret,
        dureeEnMois: data.dureeEnMois,
        encoursRefinance: data.encoursRefinance,
        fraisDossier: data.fraisDossier ?? 0,
        conditions: data.conditions ?? '',
        statut: data.statut ?? 'ACTIF',
      });
    } else {
      setFormData({
        dateRefinancement: dateVersInputHTML(obtenirDateActuelle()),
        libelle: '',
        montantRefinance: 0,
        tauxInteret: 0,
        dureeEnMois: 12,
        encoursRefinance: 0,
        fraisDossier: 0,
        conditions: '',
        statut: 'ACTIF',
      });
    }
    setErrors({});
    setIsSubmitting(false);
    setShowPreview(false);
  }, [isOpen, data]);

  const handleInputChange = (field: keyof RefinancementFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'montantRefinance' && value > 0) {
      setShowPreview(true);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const dateValidation = validerDateRefinancement(formData.dateRefinancement);
    if (!dateValidation.valide && dateValidation.erreurs && Array.isArray(dateValidation.erreurs) && dateValidation.erreurs.length > 0) {
      newErrors.dateRefinancement = dateValidation.erreurs[0] || 'Date invalide';
    }

    if (!formData.libelle.trim()) {
      newErrors.libelle = 'Le libellé est obligatoire';
    } else if (formData.libelle.trim().length < 3) {
      newErrors.libelle = 'Le libellé doit contenir au moins 3 caractères';
    } else if (formData.libelle.trim().length > 255) {
      newErrors.libelle = 'Le libellé ne peut pas dépasser 255 caractères';
    }

    if (formData.montantRefinance <= 0) {
      newErrors.montantRefinance = 'Le montant doit être supérieur à 0';
    } else {
      const montantValidation = validerMontantRefinancement(
        formData.montantRefinance || 0,
        cumulActuelGlobal || 0,
        autorisationBancaire || 0
      );
      if (!montantValidation.valide && montantValidation.erreurs && Array.isArray(montantValidation.erreurs) && montantValidation.erreurs.length > 0) {
        newErrors.montantRefinance = montantValidation.erreurs[0] || 'Montant invalide';
      }
    }

    if (formData.tauxInteret < 0 || formData.tauxInteret > 100) {
      newErrors.tauxInteret = 'Le taux d\'intérêt doit être compris entre 0 et 100%';
    }

    if (!Number.isInteger(formData.dureeEnMois) || formData.dureeEnMois <= 0 || formData.dureeEnMois > 360) {
      newErrors.dureeEnMois = 'La durée doit être un entier positif (max 360)';
    }

    if (formData.encoursRefinance < 0) {
      newErrors.encoursRefinance = 'L\'encours ne peut pas être négatif';
    }

    if (formData.conditions && formData.conditions.length > 500) {
      newErrors.conditions = 'Les conditions ne peuvent pas dépasser 500 caractères';
    }

    // Validation globale avec Zod
    const validationGlobale = validerRefinancement({
      ...formData,
      libelle: formData.libelle.trim(),
    });
    if (!validationGlobale.valide) {
      Object.entries(validationGlobale.erreurs).forEach(([champ, messages]) => {
        if (messages && Array.isArray(messages) && messages.length > 0) {
          newErrors[champ] = messages[0] || 'Champ invalide';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload: RefinancementFormData = {
        ...formData,
        libelle: formData.libelle.trim(),
      };

      if (isEditing && data && data.id) {
        await dispatch(updateRefinancement({ id: data.id, refinancement: payload })).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'Modification réussie',
          message: 'Refinancement modifié avec succès',
          autoClose: true,
          duration: 3000,
        }));
      } else {
        await dispatch(createRefinancement(payload)).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'Création réussie',
          message: 'Refinancement créé avec succès',
          autoClose: true,
          duration: 3000,
        }));
      }

      onClose();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: `Erreur lors de la ${isEditing ? 'modification' : 'création'}`,
        message: error?.message || 'Une erreur inattendue s\'est produite',
        autoClose: true,
        duration: 5000,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  // Calcul de l'impact du nouveau montant (sur le cumul global)
  const cumulActuelGlobal = isEditing && data?.montantRefinance ? ((cumulGlobal || 0) - data.montantRefinance) : (cumulGlobal || 0);
  const impact = calculerImpactNouveauMontant(
    formData.montantRefinance || 0,
    cumulActuelGlobal,
    autorisationBancaire || 0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Modifier le refinancement' : 'Nouveau refinancement'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date de refinancement */}
        <div>
          <label htmlFor="dateRefinancement" className="label">Date de refinancement *</label>
          <input
            type="date"
            id="dateRefinancement"
            value={formData.dateRefinancement}
            onChange={(e) => handleInputChange('dateRefinancement', e.target.value)}
            className={`input-field ${errors.dateRefinancement ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            disabled={isSubmitting}
            required
          />
          {errors.dateRefinancement && (
            <p className="mt-1 text-sm text-danger-600">{errors.dateRefinancement}</p>
          )}
        </div>

        {/* Libellé */}
        <div>
          <label htmlFor="libelle" className="label">Libellé *</label>
          <input
            type="text"
            id="libelle"
            value={formData.libelle}
            onChange={(e) => handleInputChange('libelle', e.target.value)}
            placeholder="Description du refinancement"
            className={`input-field ${errors.libelle ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            disabled={isSubmitting}
            maxLength={255}
            required
          />
          <div className="mt-1 flex justify-between">
            {errors.libelle ? (
              <p className="text-sm text-danger-600">{errors.libelle}</p>
            ) : (
              <p className="text-sm text-gray-500">Décrivez brièvement le refinancement (minimum 3 caractères)</p>
            )}
            <span className="text-sm text-gray-400">{formData.libelle.length}/255</span>
          </div>
        </div>

        {/* Montant refinancé */}
        <div>
          <label htmlFor="montantRefinance" className="label">Montant refinancé (DH) *</label>
          <input
            type="number"
            id="montantRefinance"
            value={formData.montantRefinance || ''}
            onChange={(e) => handleInputChange('montantRefinance', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            max="999999.99"
            className={`input-field ${errors.montantRefinance ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            disabled={isSubmitting}
            required
          />
          {errors.montantRefinance && (
            <p className="mt-1 text-sm text-danger-600">{errors.montantRefinance}</p>
          )}
        </div>

        {/* Taux et Durée */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="tauxInteret" className="label">Taux d'intérêt (%) *</label>
            <input
              type="number"
              id="tauxInteret"
              value={formData.tauxInteret || ''}
              onChange={(e) => handleInputChange('tauxInteret', parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              max="100"
              className={`input-field ${errors.tauxInteret ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
              disabled={isSubmitting}
              required
            />
            {errors.tauxInteret && <p className="mt-1 text-sm text-danger-600">{errors.tauxInteret}</p>}
          </div>
          <div>
            <label htmlFor="dureeEnMois" className="label">Durée (mois) *</label>
            <input
              type="number"
              id="dureeEnMois"
              value={formData.dureeEnMois || ''}
              onChange={(e) => handleInputChange('dureeEnMois', parseInt(e.target.value, 10) || 0)}
              step="1"
              min="1"
              max="360"
              className={`input-field ${errors.dureeEnMois ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
              disabled={isSubmitting}
              required
            />
            {errors.dureeEnMois && <p className="mt-1 text-sm text-danger-600">{errors.dureeEnMois}</p>}
          </div>
          <div>
            <label htmlFor="encoursRefinance" className="label">Encours (DH)</label>
            <input
              type="number"
              id="encoursRefinance"
              value={formData.encoursRefinance || ''}
              onChange={(e) => handleInputChange('encoursRefinance', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="999999.99"
              className={`input-field ${errors.encoursRefinance ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.encoursRefinance && <p className="mt-1 text-sm text-danger-600">{errors.encoursRefinance}</p>}
          </div>
        </div>

        {/* Frais de dossier et Statut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fraisDossier" className="label">Frais de dossier (DH)</label>
            <input
              type="number"
              id="fraisDossier"
              value={formData.fraisDossier || ''}
              onChange={(e) => handleInputChange('fraisDossier', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="999999.99"
              className={`input-field ${errors.fraisDossier ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.fraisDossier && <p className="mt-1 text-sm text-danger-600">{errors.fraisDossier}</p>}
          </div>
          <div>
            <label htmlFor="statut" className="label">Statut</label>
            <select
              id="statut"
              value={formData.statut}
              onChange={(e) => handleInputChange('statut', e.target.value as RefinancementFormData['statut'])}
              className="input-field"
              disabled={isSubmitting}
            >
              <option value="ACTIF">ACTIF</option>
              <option value="TERMINE">TERMINE</option>
              <option value="SUSPENDU">SUSPENDU</option>
            </select>
          </div>
        </div>

        {/* Conditions */}
        <div>
          <label htmlFor="conditions" className="label">Conditions</label>
          <textarea
            id="conditions"
            value={formData.conditions || ''}
            onChange={(e) => handleInputChange('conditions', e.target.value)}
            className={`input-field ${errors.conditions ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            rows={3}
            placeholder="Conditions particulières (optionnel)"
            disabled={isSubmitting}
          />
          {errors.conditions && <p className="mt-1 text-sm text-danger-600">{errors.conditions}</p>}
        </div>

        {/* Aperçu des calculs */}
        {showPreview && formData.montantRefinance > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Aperçu des calculs</h4>
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
                <span className={`ml-2 font-medium ${impact.nouvelEncours < 0 ? 'text-danger-600' : 'text-success-600'}`}>
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
                  <span className="text-sm text-danger-800">Attention : Ce montant dépasserait l'autorisation bancaire de {formaterMontant(Math.abs(impact.nouvelEncours))} DH</span>
                </div>
              </div>
            )}
            {impact.nouvelEncours >= 0 && impact.nouvelEncours < (autorisationBancaire * 0.1) && (
              <div className="bg-warning-50 border border-warning-200 rounded p-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-warning-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-warning-800">Attention : Il ne restera que {formaterMontant(impact.nouvelEncours)} DH d'encours disponible</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button type="button" onClick={handleClose} disabled={isSubmitting} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={isSubmitting || Object.keys(errors).length > 0} className="btn-primary flex items-center">
            {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
            {isEditing ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RefinancementModal;