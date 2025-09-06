import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectEscomptes } from '../../store/slices/escomptesSlice';
import { selectRefinancements } from '../../store/slices/refinancementsSlice';
import { selectConfiguration } from '../../store/slices/configurationSlice';
import { addNotification } from '../../store/slices/uiSlice';
import LoadingSpinner from './LoadingSpinner';

interface SaveButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant SaveButton - Bouton de sauvegarde de l'état complet de l'application
 */
const SaveButton: React.FC<SaveButtonProps> = ({ 
  className = '', 
  variant = 'primary',
  size = 'md'
}) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  
  // Récupération des données depuis le store Redux
  const escomptes = useAppSelector(selectEscomptes);
  const refinancements = useAppSelector(selectRefinancements);
  const configuration = useAppSelector(selectConfiguration);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Préparer les données à sauvegarder
      const saveData = {
        escomptes,
        refinancements,
        configuration,
        metadata: {
          saveTimestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          version: '1.0.0'
        }
      };

      // Appel API pour sauvegarder l'état
      const response = await fetch('http://localhost:3001/api/save-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      
      // Notification de succès
      dispatch(addNotification({
        type: 'success',
        title: 'Sauvegarde réussie',
        message: `État de l'application sauvegardé avec succès. ${result.summary.escomptesCount} escomptes et ${result.summary.refinancementsCount} refinancements sauvegardés.`,
        autoClose: true,
        duration: 5000
      }));

      console.log('Sauvegarde réussie:', result);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      // Notification d'erreur
      dispatch(addNotification({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite lors de la sauvegarde.',
        autoClose: false
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Classes CSS basées sur la variante et la taille
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-banking focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-banking-sm hover:shadow-banking';
    
    const variantClasses = {
      primary: 'bg-banking-600 hover:bg-banking-700 text-white focus:ring-banking-500 border border-banking-600 hover:border-banking-700',
      secondary: 'bg-trust-100 hover:bg-trust-200 text-trust-800 focus:ring-trust-500 border border-trust-300 hover:border-trust-400'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={getButtonClasses()}
      title="Sauvegarder l'état actuel de l'application"
      aria-label="Sauvegarder l'état de l'application"
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          <span>Sauvegarde...</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          <span>Sauvegarder</span>
        </>
      )}
    </button>
  );
};

export default SaveButton;