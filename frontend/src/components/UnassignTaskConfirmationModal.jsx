import React from 'react';
import Modal from './Modal';
import Button from './Button';

const UnassignTaskConfirmationModal = ({ isOpen, onClose, onConfirm, task, isLoading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Unassign Task</h3>
        
        <p className="mb-6 text-gray-600">
          Are you sure you want to unassign {task?.assignee?.username || 'the current assignee'} from 
          the task "{task?.title}"?
        </p>
        
        <div className="flex justify-end space-x-3">
          <Button 
            variant="secondary" 
            onClick={onClose}
            type="button"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="warning" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2">Unassigning...</span>
                <svg className="animate-spin h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : 'Unassign Task'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UnassignTaskConfirmationModal;