import React from 'react';
import { useDispatch } from 'react-redux';
import { showAlert } from '../features/alerts/alertsSlice';
import { showSuccessAlert, showErrorAlert, showInfoAlert, showWarningAlert } from '../utils/alertUtils';
import Button from '../components/Button';

// This is just an example component to demonstrate how to use the alert system
const ExampleUsage = () => {
  const dispatch = useDispatch();

  // Method 1: Using the dispatch directly with the showAlert action
  const showSuccessWithDispatch = () => {
    dispatch(showAlert({
      type: 'success',
      message: 'Operation completed successfully!'
    }));
  };

  // Method 2: Using the utility functions (can be used anywhere, even outside React components)
  const showAlerts = () => {
    showSuccessAlert('Success message from utility function');
    
    // You can show multiple alerts at once
    setTimeout(() => {
      showErrorAlert('Error message from utility function');
    }, 1000);
    
    setTimeout(() => {
      showInfoAlert('Info message from utility function');
    }, 2000);
    
    setTimeout(() => {
      showWarningAlert('Warning message from utility function');
    }, 3000);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Alert System Example</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Method 1: Using dispatch directly</h3>
          <Button onClick={showSuccessWithDispatch}>Show Success Alert</Button>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Method 2: Using utility functions</h3>
          <Button onClick={showAlerts}>Show All Alert Types</Button>
        </div>
      </div>
    </div>
  );
};

export default ExampleUsage;