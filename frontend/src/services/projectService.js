// src/services/projectService.js
import axios from '../api/axios';
import { showErrorAlert } from '../utils/alertUtils';

export const projectService = {
  getProjects: async (teamId) => {
    try {
      const response = await axios.get(`/teams/${teamId}/projects`);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to fetch projects');
      throw error;
    }
  },

  createProject: async (teamId, projectData) => {
    try {
      const response = await axios.post(`projects`, projectData);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to create project');
      throw error;
    }
  },

  getProjectById: async (projectId) => {
    try {
      const response = await axios.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to fetch project details');
      throw error;
    }
  }
};
