import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasksFeature',
  initialState,
  reducers: {
    fetchTasksStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess(state, action) {
      state.tasks = action.payload;
      state.loading = false;
    },
    fetchTasksFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addTask(state, action) {
      state.tasks.push(action.payload);
    },
    updateTask(state, action) {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask(state, action) {
      state.tasks = state.tasks.filter(
        (task) => task.id !== action.payload
      );
    },
  },
});

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  addTask,
  updateTask,
  deleteTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;