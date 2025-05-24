import { useModal } from '../context/ModalContext';
import Button from '../components/Button';

export const useAppModal = () => {
  const { openModal, closeModal } = useModal();

  const showConfirmModal = ({ 
    title = 'Confirm Action', 
    message, 
    onConfirm, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    isDestructive = false
  }) => {
    const handleConfirm = () => {
      onConfirm();
      closeModal();
    };

    openModal({
      title,
      content: <p className="text-gray-600">{message}</p>,
      footer: (
        <>
          <Button 
            variant="outline" 
            size="small" 
            onClick={closeModal}
          >
            {cancelText}
          </Button>
          <Button 
            variant={isDestructive ? "danger" : "primary"} 
            size="small" 
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </>
      ),
      size: 'sm'
    });
  };

  const showInfoModal = ({ 
    title = 'Information', 
    message, 
    onClose,
    closeText = 'Close'
  }) => {
    const handleClose = () => {
      if (onClose) onClose();
      closeModal();
    };

    openModal({
      title,
      content: <p className="text-gray-600">{message}</p>,
      footer: (
        <Button 
          variant="primary" 
          size="small" 
          onClick={handleClose}
        >
          {closeText}
        </Button>
      ),
      size: 'sm'
    });
  };

  const showCustomModal = (options) => {
    openModal(options);
  };

  return {
    showConfirmModal,
    showInfoModal,
    showCustomModal,
    closeModal
  };
};