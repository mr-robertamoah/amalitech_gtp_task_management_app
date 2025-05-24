import { showAlert } from '../features/alerts/alertsSlice';
import { store } from '../app/store';

// Helper functions to make it easier to show alerts from anywhere in the app
export const showSuccessAlert = (message) => {
  store.dispatch(showAlert({ type: 'success', message }));
};

export const showErrorAlert = (message) => {
  store.dispatch(showAlert({ type: 'error', message }));
};

export const showInfoAlert = (message) => {
  store.dispatch(showAlert({ type: 'info', message }));
};

export const showWarningAlert = (message) => {
  store.dispatch(showAlert({ type: 'warning', message }));
};