import axios from '../api/axios';
import { showErrorAlert } from '../utils/alertUtils';
import { changeArrayToString } from '../utils/errorUtils';

export const taskService = {
  // Get tasks for a project
  getProjectTasks: async (projectId) => {
    try {
      const response = await axios.get(`/tasks/projects/${projectId}`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to fetch tasks');
      throw error;
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    try {
      const response = await axios.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to create task');
      throw error;
    }
  },

  // Update a task
  updateTask: async (taskId, updateData) => {
    try {
      const response = await axios.post(`/tasks/${taskId}`, updateData);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to update task');
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const response = await axios.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to delete task');
      throw error;
    }
  },

  // Assign a task to a user
  assignTask: async (taskId, userId) => {
    try {
      const response = await axios.post(`/tasks/${taskId}/assign`, { assigneeId: userId });
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to assign task');
      throw error;
    }
  },

  // Unassign a task
  unassignTask: async (taskId) => {
    try {
      const response = await axios.post(`/tasks/${taskId}/unassign`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to unassign task');
      throw error;
    }
  }
};