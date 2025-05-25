import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projectsFeature',
  initialState,
  reducers: {
    fetchProjectsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProjectsSuccess(state, action) {
      state.projects = action.payload;
      state.loading = false;
    },
    fetchProjectsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentProject(state, action) {
      state.currentProject = action.payload;
    },
    addProject(state, action) {
      state.projects.push(action.payload);
    },
    updateProject(state, action) {
      const index = state.projects.findIndex(
        (project) => project.projectId === action.payload.projectId
      );
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.currentProject?.projectId === action.payload.projectId) {
        state.currentProject = action.payload;
      }
    },
    deleteProject(state, action) {
      state.projects = state.projects.filter(
        (project) => project.projectId !== action.payload
      );
      if (state.currentProject?.projectId === action.payload) {
        state.currentProject = null;
      }
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  setCurrentProject,
  addProject,
  updateProject,
  deleteProject,
} = projectsSlice.actions;

export default projectsSlice.reducer;