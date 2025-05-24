import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  alerts: []
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    showAlert(state, action) {
      const { type, message, id = Date.now() } = action.payload;
      state.alerts.push({
        id,
        type,
        message
      });
    },
    hideAlert(state, action) {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    clearAlerts(state) {
      state.alerts = [];
    }
  }
});

export const { showAlert, hideAlert, clearAlerts } = alertsSlice.actions;

// Helper functions to make it easier to show specific types of alerts
export const showSuccessAlert = (message) => showAlert({ type: 'success', message });
export const showErrorAlert = (message) => showAlert({ type: 'error', message });
export const showInfoAlert = (message) => showAlert({ type: 'info', message });
export const showWarningAlert = (message) => showAlert({ type: 'warning', message });

export default alertsSlice.reducer;