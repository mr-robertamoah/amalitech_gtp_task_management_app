// src/services/projectService.js
import axios from '../api/axios';
import { showErrorAlert } from '../utils/alertUtils';
import { changeArrayToString } from '../utils/errorUtils';

export const projectService = {
  getProjects: async (teamId) => {
    try {
      const response = await axios.get(`/teams/${teamId}/projects`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to fetch projects');
      throw error;
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await axios.post(`projects`, projectData);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to create project');
      throw error;
    }
  },

  getProjectById: async (projectId, user) => {
    try {
      const response = user ? 
        await axios.get(`/projects/${projectId}`) : await axios.get(`/projects/${projectId}/public`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to fetch project details');
      throw error;
    }
  },

  updateProject: async (projectId, updateData) => {
    try {
      const response = await axios.post(`/projects/${projectId}`, updateData);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to update project');
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {
      const response = await axios.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to delete project');
      throw error;
    }
  },
  
  getTeamMembers: async (teamId) => {
    try {
      const response = await axios.get(`/teams/${teamId}/members`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to fetch team members');
      throw error;
    }
  }
};