import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import TextArea from './TextArea';
import { taskService } from '../services/taskService';
import { updateTask } from '../features/tasks/tasksSlice';
import { showSuccessAlert, showErrorAlert } from '../utils/alertUtils';

const EditTaskModal = ({ isOpen, onClose, task }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    startAt: '',
    endAt: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Set initial form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        startAt: task.startAt ? new Date(task.startAt).toISOString().split('T')[0] : '',
        endAt: task.endAt ? new Date(task.endAt).toISOString().split('T')[0] : '',
      });
    }

    console.log(task, task?.endAt ? new Date(task.endAt).toISOString().split('T')[0] : '');
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate that both dates are provided or neither is provided
    if ((formData.startAt && !formData.endAt) || (!formData.startAt && formData.endAt)) {
      showErrorAlert('Both start date and end date must be provided together');
      setIsLoading(false);
      return;
    }
    
    // Prepare data for submission
    const taskData = {
      ...formData,
      startAt: formData.startAt ? new Date(formData.startAt).toISOString() : undefined,
      endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined
    };
    
    try {
      const updatedTask = await taskService.updateTask(task.taskId, taskData);
      dispatch(updateTask(updatedTask));
      showSuccessAlert('Task updated successfully');
      onClose();
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mb-4"
          />
          
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mb-4"
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startAt"
              value={formData.startAt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Both start and end dates must be provided together</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endAt"
              value={formData.endAt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Task'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditTaskModal;