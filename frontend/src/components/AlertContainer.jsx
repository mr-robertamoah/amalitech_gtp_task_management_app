import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideAlert } from '../features/alerts/alertsSlice';
import Alert from './Alert';

const AlertContainer = () => {
  const dispatch = useDispatch();
  const alerts = useSelector((state) => state.alerts.alerts);

  const handleClose = (id) => {
    dispatch(hideAlert(id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] w-full max-w-sm">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          id={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default AlertContainer;