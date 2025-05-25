import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userTeams: [],
  publicTeams: [],
  currentTeam: null,
  loading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    fetchTeamsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserTeamsSuccess(state, action) {
      state.userTeams = action.payload;
      state.loading = false;
    },
    fetchPublicTeamsSuccess(state, action) {
      state.publicTeams = action.payload;
      state.loading = false;
    },
    fetchTeamsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentTeam(state, action) {
      state.currentTeam = action.payload;
    },
    joinTeam(state, action) {
      // Add team to user's teams
      state.userTeams.push(action.payload);
      
      // Remove from public teams if it exists there
      state.publicTeams = state.publicTeams.filter(
        team => team.id !== action.payload.id
      );
    },
    leaveTeam(state, action) {
      state.userTeams = state.userTeams.filter(
        team => team.id !== action.payload
      );
    },
    createTeam(state, action) {
      state.userTeams.push(action.payload);
      if (action.payload.privacy === 'public') {
        state.publicTeams.push(action.payload);
      }
    },
    updateTeam(state, action) {
      // Update in userTeams if it exists there
      const userTeamIndex = state.userTeams.findIndex(
        team => team.id === action.payload.id
      );
      if (userTeamIndex !== -1) {
        state.userTeams[userTeamIndex] = action.payload;
      }
      
      // Update in publicTeams if it exists there
      const publicTeamIndex = state.publicTeams.findIndex(
        team => team.id === action.payload.id
      );
      if (publicTeamIndex !== -1) {
        state.publicTeams[publicTeamIndex] = action.payload;
      }
      
      // Update currentTeam if it matches
      if (state.currentTeam?.id === action.payload.id) {
        state.currentTeam = action.payload;
      }
    },
    updateUserTeam(state, action) {
      // Update in userTeams if it exists there
      const userTeamIndex = state.userTeams.findIndex(
        team => team.teamId === action.payload.teamId
      );
      if (userTeamIndex !== -1) {
        state.userTeams[userTeamIndex] = action.payload;
      }
      
      // Update currentTeam if it matches
      if (state.currentTeam?.teamId === action.payload.teamId) {
        state.currentTeam = action.payload;
      }
    },
    removeUserTeam(state, action) {
      // Remove team from user's teams
      state.userTeams = state.userTeams.filter(
        team => team.teamId !== action.payload
      );
      
      // Clear currentTeam if it matches
      if (state.currentTeam?.teamId === action.payload) {
        state.currentTeam = null;
      }
    },
  },
});

export const {
  fetchTeamsStart,
  fetchUserTeamsSuccess,
  fetchPublicTeamsSuccess,
  fetchTeamsFailure,
  setCurrentTeam,
  joinTeam,
  leaveTeam,
  createTeam,
  updateTeam,
  updateUserTeam,
  removeUserTeam,
} = teamsSlice.actions;

export default teamsSlice.reducer;