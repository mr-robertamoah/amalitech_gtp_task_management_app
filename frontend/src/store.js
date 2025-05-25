import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import teamsReducer from './features/teams/teamsSlice';
import projectsReducer from './features/projects/projectsSlice';
import tasksReducer from './features/tasks/tasksSlice';
import userTasksReducer from './features/userTasks/userTasksSlice';
import alertsReducer from './features/alerts/alertsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    teams: teamsReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    userTasks: userTasksReducer,
    alerts: alertsReducer,
  },
});

export default store;