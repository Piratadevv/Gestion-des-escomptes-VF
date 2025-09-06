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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-trust-900 bg-opacity-75 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-banking-50 rounded-banking p-8 shadow-banking-xl max-w-sm w-full mx-4 border border-banking-200">
        <div className="flex flex-col items-center space-y-6">
          {/* Spinner animé */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-banking-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-banking-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>

          {/* Texte de chargement */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-trust-900 mb-2 font-banking">
              Chargement en cours...
            </h3>
            <p className="text-sm text-neutral-600 font-medium">
              Veuillez patienter pendant le traitement de votre demande.
            </p>
          </div>

          {/* Barre de progression indéterminée */}
          <div className="w-full bg-banking-200 rounded-banking h-2 overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-banking-500 to-banking-600 rounded-banking animate-pulse-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;