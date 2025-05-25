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
    updateUserTask(state, action) {
      const index = state.tasks.findIndex(
        (task) => task.taskId === action.payload.taskId
      );
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
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
  clearUserTasks,
  updateUserTask
} = userTasksSlice.actions;

export default userTasksSlice.reducer;