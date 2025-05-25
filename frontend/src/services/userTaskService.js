import axios from '../api/axios';
import { showErrorAlert } from '../utils/alertUtils';
import { changeArrayToString } from '../utils/errorUtils';

export const userTaskService = {
  // Get all tasks assigned to the current user
  getUserTasks: async (userId) => {
    try {
      const response = await axios.get(`/tasks/users/${userId}`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to fetch your tasks');
      throw error;
    }
  }
};