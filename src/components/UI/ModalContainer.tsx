import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectModal, closeModal } from '../../store/slices/uiSlice';
import EscompteModal from '../Escomptes/EscompteModal';
import ConfigurationModal from '../Configuration/ConfigurationModal';
import ConfirmationModal from './ConfirmationModal';
import ExportModal from './ExportModal';
import RefinancementsExportModal from './RefinancementsExportModal';
import RefinancementModal from '../Refinancements/RefinancementModal';

/**
 * Composant ModalContainer - Gestionnaire central des modales
 */
const ModalContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector(selectModal);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (modal.isOpen) {
          dispatch(closeModal());
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modal, dispatch]);

  // Gestion du scroll du body
  useEffect(() => {
    const hasOpenModal = modal.isOpen;
    
    if (hasOpenModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modal]);

  const renderModal = () => {
    if (!modal.isOpen || !modal.type) return null;

    const baseProps = {
      isOpen: modal.isOpen,
      onClose: () => dispatch(closeModal()),
      data: modal.data,
    } as const;

    switch (modal.type) {
      case 'escompte':
        return <EscompteModal key="escompte" {...baseProps} />;
      case 'refinancement':
        return <RefinancementModal key="refinancement" {...baseProps} />;
      case 'configuration':
        return <ConfigurationModal key="configuration" {...baseProps} />;
      case 'confirmation':
        return <ConfirmationModal key="confirmation" {...baseProps} />;
      case 'export':
        return <ExportModal key="export" {...baseProps} />;
      case 'refinancements-export':
        return <RefinancementsExportModal key="refinancements-export" {...baseProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderModal()}
    </>
  );
};

export default ModalContainer;