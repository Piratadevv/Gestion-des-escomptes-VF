import React from 'react';

/**
 * Composant LoadingOverlay - Overlay de chargement global
 */
interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner animé */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>

          {/* Texte de chargement */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Chargement en cours...
            </h3>
            <p className="text-sm text-gray-600">
              Veuillez patienter pendant le traitement de votre demande.
            </p>
          </div>

          {/* Barre de progression indéterminée */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full animate-pulse-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;