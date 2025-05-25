import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { projectService } from '../services/projectService';
import { updateProject } from '../features/projects/projectsSlice';
import { showSuccessAlert, showErrorAlert } from '../utils/alertUtils';
import Input from './Input';
import TextArea from './TextArea';
import Button from './Button';

const UpdateProjectForm = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectData = await projectService.getProjectById(projectId);
        setProject(projectData);
        setFormData({
          name: projectData.name || '',
          description: projectData.description || '',
          teamId: projectData.teamId
        });
      } catch (error) {
        showErrorAlert('Failed to load project details');
        navigate(`/project/${projectId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedProject = await projectService.updateProject(projectId, formData);
      // Update Redux store
      dispatch(updateProject(updatedProject));
      showSuccessAlert('Project updated successfully');
      navigate(`/project/${projectId}`);
    } catch (error) {
      showErrorAlert('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Update Project</h1>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Project Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
          />
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate(`/project/${projectId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProjectForm;