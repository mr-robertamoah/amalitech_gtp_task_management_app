// src/components/ConfirmationModal.jsx
import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {confirmText}
            {isLoading && (
              <span className="ml-2 inline-block">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;