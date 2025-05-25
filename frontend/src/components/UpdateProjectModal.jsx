// src/components/UpdateProjectModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import TextArea from './TextArea';
import { projectService } from '../services/projectService';
import { updateProject } from '../features/projects/projectsSlice';
import { showSuccessAlert, showErrorAlert } from '../utils/alertUtils';

const UpdateProjectModal = ({ isOpen, onClose, project }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startAt: '',
    endAt: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Set initial form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        teamId: project.teamId,
        startAt: project.startAt ? new Date(project.startAt).toISOString().split('T')[0] : '',
        endAt: project.endAt ? new Date(project.endAt).toISOString().split('T')[0] : ''
      });
    }
  }, [project]);

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
    
    // Convert dates to ISO format if provided
    const updatedData = {
      ...formData,
      startAt: formData.startAt ? new Date(formData.startAt).toISOString() : undefined,
      endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined
    };
    
    try {
      const updatedProject = await projectService.updateProject(project.projectId, updatedData);
      dispatch(updateProject(updatedProject));
      showSuccessAlert('Project updated successfully');
      onClose();
    } catch (error) {
      showErrorAlert('Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Update Project</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          
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
          
          <div className="flex justify-end space-x-3 mt-6">
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
              Update Project
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
        </form>
      </div>
    </Modal>
  );
};

export default UpdateProjectModal;