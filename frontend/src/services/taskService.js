import axios from '../api/axios';
import { showErrorAlert } from '../utils/alertUtils';

export const taskService = {
  // Get tasks for a project
  getProjectTasks: async (projectId, user = null) => {
    try {
      const response = user ? 
        await axios.get(`/tasks/projects/${projectId}`) : 
        await axios.get(`/tasks/projects/${projectId}/public`);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to fetch tasks');
      throw error;
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    try {
      const response = await axios.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      let message = error.response?.data?.message;

      // if message is an array, turn message into a string which have new lines
      if (Array.isArray(message)) {
        message = message.join('\n');
      }
      showErrorAlert(message || 'Failed to create task');
      throw error;
    }
  },

  // Update a task
  updateTask: async (taskId, updateData) => {
    try {
      const response = await axios.post(`/tasks/${taskId}`, updateData);
      return response.data;
    } catch (error) {
      let message = error.response?.data?.message;

      // if message is an array, turn message into a string which have new lines
      if (Array.isArray(message)) {
        message = message.join('\n');
      }
      showErrorAlert(message || 'Failed to update task');
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const response = await axios.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to delete task');
      throw error;
    }
  },

  // Assign a task to a user
  assignTask: async (taskId, userId) => {
    try {
      const response = await axios.post(`/tasks/${taskId}/assign`, { userId });
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to assign task');
      throw error;
    }
  },

  // Unassign a task
  unassignTask: async (taskId) => {
    try {
      const response = await axios.post(`/tasks/${taskId}/unassign`);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to unassign task');
      throw error;
    }
  }
};