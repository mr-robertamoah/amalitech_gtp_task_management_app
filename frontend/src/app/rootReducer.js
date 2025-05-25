import { combineReducers } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import projectsReducer from '../features/projects/projectsSlice';
import teamsReducer from '../features/teams/teamsSlice';
import alertsReducer from '../features/alerts/alertsSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import userTasksReducer from '../features/userTasks/userTasksSlice';

const rootReducer = combineReducers({
  user: userReducer,
  projects: projectsReducer,
  teams: teamsReducer,
  alerts: alertsReducer,
  // Add more reducers here as your app grows
  tasks: tasksReducer,
  userTasks: userTasksReducer,
});

export default rootReducer;