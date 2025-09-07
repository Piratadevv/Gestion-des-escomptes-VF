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
        <div className="form-group-responsive">
          <label htmlFor="dateRefinancement" className="label-responsive">
            <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Date de refinancement *
          </label>
          <input
            type="date"
            id="dateRefinancement"
            value={formData.dateRefinancement}
            onChange={(e) => handleInputChange('dateRefinancement', e.target.value)}
            className={`input-field-responsive touch-target-large ${errors.dateRefinancement ? 'border-red-300 focus:ring-red-500' : ''}`}
            disabled={isSubmitting}
            required
          />
          {errors.dateRefinancement && (
            <p className="error-message-responsive">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.dateRefinancement}
            </p>
          )}
        </div>

        {/* Libellé */}
        <div className="form-group-responsive">
          <label htmlFor="libelle" className="label-responsive">
            <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Libellé *
          </label>
          <input
            type="text"
            id="libelle"
            value={formData.libelle}
            onChange={(e) => handleInputChange('libelle', e.target.value)}
            placeholder="Description du refinancement"
            className={`input-field-responsive touch-target-large ${errors.libelle ? 'border-red-300 focus:ring-red-500' : ''}`}
            disabled={isSubmitting}
            maxLength={255}
            required
          />
          <div className="mt-2 flex justify-between items-start">
            {errors.libelle ? (
              <p className="error-message-responsive">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.libelle}
              </p>
            ) : (
              <p className="text-sm text-neutral-500">Décrivez brièvement le refinancement (minimum 3 caractères)</p>
            )}
            <span className="text-sm text-neutral-400 ml-2">{formData.libelle.length}/255</span>
          </div>
        </div>

        {/* Montant refinancé */}
        <div className="form-group-responsive">
          <label htmlFor="montantRefinance" className="label-responsive">
            <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            Montant refinancé (DH) *
          </label>
          <div className="relative">
            <input
              type="number"
              id="montantRefinance"
              value={formData.montantRefinance || ''}
              onChange={(e) => handleInputChange('montantRefinance', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max="999999.99"
              className={`input-field-responsive touch-target-large pr-12 ${errors.montantRefinance ? 'border-red-300 focus:ring-red-500' : ''}`}
              disabled={isSubmitting}
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base font-medium">
              DH
            </span>
          </div>
          {errors.montantRefinance && (
            <p className="error-message-responsive">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.montantRefinance}
            </p>
          )}
        </div>

        {/* Taux et Durée */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="tauxInteret" className="block text-sm font-medium text-neutral-700 mb-2">
              <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Taux d'intérêt (%) *
            </label>
            <input
              type="number"
              id="tauxInteret"
              value={formData.tauxInteret || ''}
              onChange={(e) => handleInputChange('tauxInteret', parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              max="100"
              className={`w-full px-4 py-3 bg-gradient-to-r from-neutral-50 to-white border rounded-banking shadow-banking-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:border-transparent ${errors.tauxInteret ? 'border-red-300 focus:ring-red-500' : 'border-neutral-300 hover:border-banking-400'}`}
              disabled={isSubmitting}
              required
            />
            {errors.tauxInteret && (
              <p className="mt-4 flex items-center text-sm text-red-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.tauxInteret}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="dureeEnMois" className="block text-sm font-medium text-neutral-700 mb-2">
              <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Durée (mois)
            </label>
            <input
              type="number"
              id="dureeEnMois"
              value={formData.dureeEnMois || ''}
              onChange={(e) => handleInputChange('dureeEnMois', parseInt(e.target.value) || 0)}
              placeholder="12"
              min="1"
              max="360"
              className={`w-full px-4 py-3 bg-gradient-to-r from-neutral-50 to-white border rounded-banking shadow-banking-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:border-transparent ${errors.dureeEnMois ? 'border-red-300 focus:ring-red-500' : 'border-neutral-300 hover:border-banking-400'}`}
              disabled={isSubmitting}
              required
            />
            {errors.dureeEnMois && (
              <p className="mt-4 flex items-center text-sm text-red-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.dureeEnMois}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="encoursRefinance" className="block text-sm font-medium text-neutral-700 mb-2">
              <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              Encours (DH)
            </label>
            <input
              type="number"
              id="encoursRefinance"
              value={formData.encoursRefinance || ''}
              onChange={(e) => handleInputChange('encoursRefinance', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="999999.99"
              className={`w-full px-4 py-3 bg-gradient-to-r from-neutral-50 to-white border rounded-banking shadow-banking-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:border-transparent ${errors.encoursRefinance ? 'border-red-300 focus:ring-red-500' : 'border-neutral-300 hover:border-banking-400'}`}
              disabled={isSubmitting}
            />
            {errors.encoursRefinance && (
              <p className="mt-4 flex items-center text-sm text-red-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.encoursRefinance}
              </p>
            )}
          </div>
        </div>

        {/* Frais de dossier et Statut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fraisDossier" className="block text-sm font-medium text-neutral-700 mb-2">
              <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Frais de dossier (DH)
            </label>
            <input
              type="number"
              id="fraisDossier"
              value={formData.fraisDossier || ''}
              onChange={(e) => handleInputChange('fraisDossier', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="999999.99"
              className={`w-full px-4 py-3 bg-gradient-to-r from-neutral-50 to-white border rounded-banking shadow-banking-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:border-transparent ${errors.fraisDossier ? 'border-red-300 focus:ring-red-500' : 'border-neutral-300 hover:border-banking-400'}`}
              disabled={isSubmitting}
            />
            {errors.fraisDossier && (
              <p className="mt-2 flex items-center text-sm text-red-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.fraisDossier}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="statut" className="block text-sm font-medium text-neutral-700 mb-2">
              <svg className="w-4 h-4 inline mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Statut
            </label>
            <select
              id="statut"
              value={formData.statut}
              onChange={(e) => handleInputChange('statut', e.target.value as RefinancementFormData['statut'])}
              className="w-full px-4 py-3 bg-gradient-to-r from-neutral-50 to-white border border-neutral-300 rounded-banking shadow-banking-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:border-transparent hover:border-banking-400"
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
          <label htmlFor="conditions" className="block text-sm font-medium text-neutral-700 mb-2">
            <svg className="w-4 h-4 inline mr-2 text-banking-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Conditions
          </label>
          <textarea
            id="conditions"
            value={formData.conditions || ''}
            onChange={(e) => handleInputChange('conditions', e.target.value)}
            className={`w-full px-4 py-3 bg-gradient-to-r from-neutral-50 to-white border rounded-banking shadow-banking-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:border-transparent resize-none ${errors.conditions ? 'border-red-300 focus:ring-red-500' : 'border-neutral-300 hover:border-banking-400'}`}
            rows={3}
            placeholder="Conditions particulières (optionnel)"
            disabled={isSubmitting}
          />
          {errors.conditions && (
            <p className="mt-4 flex items-center text-sm text-red-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.conditions}
            </p>
          )}
        </div>

        {/* Aperçu des calculs */}
        {showPreview && formData.montantRefinance > 0 && (
          <div className="bg-gradient-to-br from-neutral-50 to-white rounded-banking border border-neutral-200 shadow-banking-md p-6 space-y-4">
            <h4 className="flex items-center text-lg font-semibold bg-gradient-to-r from-banking-600 to-banking-700 bg-clip-text text-transparent">
              <svg className="w-5 h-5 mr-2 text-banking-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Aperçu des calculs
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-banking border border-neutral-100 p-4 shadow-banking-sm">
                <span className="block text-sm text-neutral-600 mb-1">Cumul actuel (global)</span>
                <span className="text-lg font-semibold text-neutral-900">{formaterMontant(cumulGlobal)}</span>
              </div>
              <div className="bg-white rounded-banking border border-neutral-100 p-4 shadow-banking-sm">
                <span className="block text-sm text-neutral-600 mb-1">Nouveau cumul</span>
                <span className="text-lg font-semibold text-neutral-900">{formaterMontant(impact.nouveauCumul)}</span>
              </div>
              <div className="bg-white rounded-banking border border-neutral-100 p-4 shadow-banking-sm">
                <span className="block text-sm text-neutral-600 mb-1">Autorisation</span>
                <span className="text-lg font-semibold text-neutral-900">{formaterMontant(autorisationBancaire)}</span>
              </div>
              <div className="bg-white rounded-banking border border-neutral-100 p-4 shadow-banking-sm">
                <span className="block text-sm text-neutral-600 mb-1">Nouvel encours</span>
                <span className={`text-lg font-semibold ${impact.nouvelEncours < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formaterMontant(impact.nouvelEncours)}
                </span>
              </div>
            </div>
            {impact.nouvelEncours < 0 && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-banking p-4 shadow-banking-sm">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h5 className="font-medium text-red-800 mb-1">Dépassement d'autorisation</h5>
                    <span className="text-sm text-red-700">Ce montant dépasserait l'autorisation bancaire de {formaterMontant(Math.abs(impact.nouvelEncours))} DH</span>
                  </div>
                </div>
              </div>
            )}
            {impact.nouvelEncours >= 0 && impact.nouvelEncours < (autorisationBancaire * 0.1) && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-banking p-4 shadow-banking-sm">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h5 className="font-medium text-yellow-800 mb-1">Encours faible</h5>
                    <span className="text-sm text-yellow-700">Il ne restera que {formaterMontant(impact.nouvelEncours)} DH d'encours disponible</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-neutral-200">
          <button 
            type="submit" 
            disabled={isSubmitting || Object.keys(errors).length > 0} 
            className="touch-target-large order-2 sm:order-2 px-6 py-3 bg-gradient-to-r from-banking-600 to-banking-700 text-white font-medium rounded-banking shadow-banking-md hover:from-banking-700 hover:to-banking-800 hover:shadow-banking-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-banking-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {isEditing ? 'Modifier' : 'Créer'}
          </button>
          <button 
            type="button" 
            onClick={handleClose} 
            disabled={isSubmitting} 
            className="touch-target-large order-1 sm:order-1 px-6 py-3 bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 font-medium rounded-banking border border-neutral-300 shadow-banking-sm hover:from-neutral-200 hover:to-neutral-300 hover:shadow-banking-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Annuler
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RefinancementModal;