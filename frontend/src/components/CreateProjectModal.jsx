// src/components/CreateProjectModal.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from './Button';
import Input from './Input';
import TextArea from './TextArea';
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
      const newProject = await projectService.createProject({ ...formData, teamId });
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

        <TextArea
          label="Description"
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your project"
        />

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
