import React from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => Promise<void> | void;
    loading?: boolean;
  };
}

/**
 * Composant ConfirmationModal - Modal de confirmation d'action
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  if (!data) return null;

  const {
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    type = 'info',
    onConfirm
  } = data;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-100">
            <svg className="h-6 w-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-warning-100">
            <svg className="h-6 w-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (type) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'bg-warning-600 hover:bg-warning-700 text-white';
      case 'info':
      default:
        return 'btn-primary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
      showCloseButton={!isLoading}
    >
      <div className="text-center">
        {/* Icône */}
        <div className="mb-4">
          {getIcon()}
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-sm text-neutral-600 whitespace-pre-line font-medium">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-banking
              focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed shadow-banking-sm hover:shadow-banking
              ${getConfirmButtonClasses()}
            `}
          >
            {isLoading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            {confirmLabel}
          </button>
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-semibold bg-trust-100 hover:bg-trust-200 text-trust-800 rounded-banking border border-trust-300 hover:border-trust-400 focus:outline-none focus:ring-2 focus:ring-trust-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-banking-sm hover:shadow-banking"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;