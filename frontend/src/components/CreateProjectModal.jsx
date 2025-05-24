// src/components/CreateProjectModal.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { projectService } from '../services/projectService';
import { addProject } from '../features/projects/projectsSlice';
import { showSuccessAlert, showErrorAlert } from '../utils/alertUtils';

const CreateProjectModal = ({ isOpen, onClose, teamId }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newProject = await projectService.createProject(teamId, formData);
      dispatch(addProject(newProject));
      showSuccessAlert('Project created successfully!');
      onClose();
    } catch (error) {
      showErrorAlert(error.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Create New Project"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter project name"
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your project"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            isLoading={isLoading}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
