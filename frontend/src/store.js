import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import projectsReducer from './features/projects/projectsSlice';
import tasksReducer from './features/tasks/tasksSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
  },
});

export default store;