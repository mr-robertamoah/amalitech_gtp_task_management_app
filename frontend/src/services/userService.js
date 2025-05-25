import axios from '../api/axios';
import { showErrorAlert } from '../utils/alertUtils';

export const userService = {
  updateProfile: async (userId, userData) => {
    try {
      const response = await axios.post(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  },
  
  changePassword: async (passwordData) => {
    try {
      const response = await axios.post('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to change password');
      throw error;
    }
  },
  
  deleteAccount: async () => {
    try {
      const response = await axios.delete('/users/account');
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to delete account');
      throw error;
    }
  }
};