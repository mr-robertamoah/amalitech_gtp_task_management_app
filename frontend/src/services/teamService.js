import axios from '../api/axios';
import { showErrorAlert } from '../utils/alertUtils';

export const teamService = {
  // Get teams the current user belongs to
  getUserTeams: async () => {
    try {
      const response = await axios.get('/teams/all');
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to fetch your teams');
      throw error;
    }
  },

  getTeamById: async (teamId) => {
    try {
      const response = await axios.get(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to fetch team details');
      throw error;
    }
  },
  // Get public teams
  getPublicTeams: async () => {
    try {
      const response = await axios.get('/teams/public');
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to fetch public teams');
      throw error;
    }
  },

  // Join a team
  joinTeam: async (teamId) => {
    try {
      const response = await axios.post(`/teams/${teamId}/join`);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to join team');
      throw error;
    }
  },

  // Create a new team
  createTeam: async (teamData) => {
    try {
      const response = await axios.post('/teams', teamData);
      return response.data;
    } catch (error) {
      showErrorAlert(error.response?.data?.message || 'Failed to create team');
      throw error;
    }
  }
};