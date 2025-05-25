import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideAlert } from '../features/alerts/alertsSlice';

const AlertManager = () => {
  const alerts = useSelector(state => state.alerts.alerts);
  const dispatch = useDispatch();

  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (alerts.length > 0) {
      const timer = setTimeout(() => {
        dispatch(hideAlert(alerts[0].id));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alerts, dispatch]);

  // No alerts to show
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
      {alerts.map(alert => (
        <div 
          key={alert.id}
          className={`p-4 rounded-md shadow-lg flex justify-between items-center ${
            alert.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
            alert.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' :
            'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
          }`}
        >
          <div className="flex-1">{alert.message}</div>
          <button 
            onClick={() => dispatch(hideAlert(alert.id))}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertManager;