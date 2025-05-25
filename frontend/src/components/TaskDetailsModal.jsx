import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { formatDate, formatFullDate } from '../utils/dateUtils';

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  if (!task) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{task.title}</h3>
        
        <div className="mb-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>
        
        {task.description && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Assignee</h4>
            <p className="text-sm text-gray-600">{task.assignee?.username || 'Unassigned'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Assigner</h4>
            <p className="text-sm text-gray-600">{task.assigner?.username || 'Unknown'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Start Date</h4>
            <p className="text-sm text-blue-600 font-medium">
              {task.startAt ? formatFullDate(task.startAt) : 'Not set'}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">End Date</h4>
            <p className="text-sm text-blue-600 font-medium">
              {task.endAt ? formatFullDate(task.endAt) : 'Not set'}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailsModal;