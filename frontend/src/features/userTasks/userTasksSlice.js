import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const userTasksSlice = createSlice({
  name: 'userTasksFeature',
  initialState,
  reducers: {
    fetchUserTasksStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserTasksSuccess(state, action) {
      state.tasks = action.payload;
      state.loading = false;
    },
    fetchUserTasksFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearUserTasks(state) {
      state.tasks = [];
    }
  },
});

export const {
  fetchUserTasksStart,
  fetchUserTasksSuccess,
  fetchUserTasksFailure,
  clearUserTasks
} = userTasksSlice.actions;

export default userTasksSlice.reducer;