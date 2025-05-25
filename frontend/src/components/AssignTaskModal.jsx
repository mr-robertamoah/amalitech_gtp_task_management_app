import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from './Modal';
import Button from './Button';
import { taskService } from '../services/taskService';
import { updateTask } from '../features/tasks/tasksSlice';
import { showSuccessAlert, showErrorAlert } from '../utils/alertUtils';

const AssignTaskModal = ({ isOpen, onClose, task, teamMembers }) => {
  const dispatch = useDispatch();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen && teamMembers?.length > 0) {
      setSelectedUserId(teamMembers[0].userId);
    }
  }, [isOpen, teamMembers]);

  const handleChange = (e) => {
    setSelectedUserId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      showErrorAlert('Please select a team member');
      return;
    }
    
    setIsLoading(true);
    try {
      const updatedTask = await taskService.assignTask(task.taskId, selectedUserId);
      dispatch(updateTask(updatedTask));
      showSuccessAlert('Task assigned successfully');
      onClose();
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to assign task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Task</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Team Member
            </label>
            {teamMembers?.length > 0 ? (
              <select
                value={selectedUserId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {teamMembers.map(member => (
                  <option key={member.userId} value={member.userId}>
                    {member.details?.username || member.userId}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">No team members available</p>
            )}
          </div>
          
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
              variant="primary" 
              type="submit"
              disabled={isLoading || !teamMembers?.length}
            >
              {isLoading ? 'Assigning...' : 'Assign Task'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AssignTaskModal;