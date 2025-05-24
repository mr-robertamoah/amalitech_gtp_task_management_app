import axios from '../api/axios';
import { showErrorAlert } from '../utils/alertUtils';

export const userService = {
  // Search users by username or email
  searchUsers: async (query) => {
    try {
      const response = await axios.get(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to search users');
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await axios.get('/users/profile');
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to fetch user profile');
      throw error;
    }
  }
};