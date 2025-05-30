import axios from '../api/axios';
import { showErrorAlert, showSuccessAlert } from '../utils/alertUtils';
import { changeArrayToString } from '../utils/errorUtils';

export const teamService = {
  // Respond to team invitation
  respondToInvitation: async (teamId, response) => {
    try {
      const result = await axios.post(`/teams/${teamId}/respond-to-invitation`, { response });
      showSuccessAlert(response === 'accept' ? 'Team invitation accepted!' : 'Team invitation rejected');
      return result.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to respond to invitation');
      throw error;
    }
  },
  // Get teams the current user belongs to
  getUserTeams: async () => {
    try {
      const response = await axios.get('/teams/all');
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to fetch your teams');
      throw error;
    }
  },

  getTeamById: async (teamId, user = null) => {
    try {
      const response = user ? await axios.get(`/teams/${teamId}`) : await axios.get(`/teams/${teamId}/public`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to fetch team details');
      throw error;
    }
  },
  // Get public teams
  getPublicTeams: async () => {
    try {
      const response = await axios.get('/teams/public');
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to fetch public teams');
      throw error;
    }
  },

  // Join a team
  joinTeam: async (teamId) => {
    try {
      const response = await axios.post(`/teams/${teamId}/join`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to join team');
      throw error;
    }
  },

  // Create a new team
  createTeam: async (teamData) => {
    try {
      const response = await axios.post('/teams', teamData);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to create team');
      throw error;
    }
  },

  // Update team information
  updateTeam: async (teamId, updateData) => {
    try {
      const response = await axios.post(`/teams/${teamId}`, updateData);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to update team');
      throw error;
    }
  },

  // Delete a team
  deleteTeam: async (teamId) => {
    try {
      const response = await axios.delete(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to delete team');
      throw error;
    }
  },

  // Invite users to team
  inviteUsersToTeam: async (teamId, inviteData) => {
    try {
      const response = await axios.post(`/teams/${teamId}/invite`, inviteData);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to invite users');
      throw error;
    }
  },

  // Update member role to admin
  makeAdmin: async (teamId, userId) => {
    try {
      const response = await axios.patch(`/teams/${teamId}/members/${userId}/role`, { role: 'admin' });
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to update member role');
      throw error;
    }
  },

  // Update member role to member
  makeMember: async (teamId, userId) => {
    try {
      const response = await axios.patch(`/teams/${teamId}/members/${userId}/role`, { role: 'member' });
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to update member role');
      throw error;
    }
  },

  // Ban a member
  banMember: async (teamId, userId) => {
    try {
      const response = await axios.patch(`/teams/${teamId}/members/${userId}/status`, { status: 'banned' });
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to ban member');
      throw error;
    }
  },

  // Activate a member
  activateMember: async (teamId, userId) => {
    try {
      const response = await axios.patch(`/teams/${teamId}/members/${userId}/status`, { status: 'active' });
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to activate member');
      throw error;
    }
  },

  // Remove a member
  removeMember: async (teamId, userId) => {
    try {
      const response = await axios.delete(`/teams/${teamId}/members/${userId}`);
      return response.data;
    } catch (error) {
      showErrorAlert(changeArrayToString(error.response?.data?.message) || 'Failed to remove member');
      throw error;
    }
  }
};