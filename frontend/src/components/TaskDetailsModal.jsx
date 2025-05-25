import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from './Modal';
import Button from './Button';
import { formatFullDate } from '../utils/dateUtils';
import axios from '../api/axios';
import { updateTask } from '../features/tasks/tasksSlice';
import { updateUserTask } from '../features/userTasks/userTasksSlice';

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  
  if (!task) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const canChangeStatus = user && (
    user.userId === task.assignee?.userId || 
    user.userId === task.assigner?.userId || 
    user.userId === task.creator?.userId
  );
  
  const changeTaskStatus = async (status) => {
    if (!canChangeStatus) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/tasks/${task.taskId}/change-status`, { status });
      
      // Update the task in Redux store
      dispatch(updateTask({
        ...task,
        status
      }));
      
      dispatch(updateUserTask({
        ...task,
        status
      }));
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{task.title}</h3>
        
        <div className="mb-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>
        
        {task.description && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Assignee</h4>
            <p className="text-sm text-gray-600">{task.assignee?.username || 'Unassigned'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Assigner</h4>
            <p className="text-sm text-gray-600">{task.assigner?.username || 'Unknown'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Start Date</h4>
            <p className="text-sm text-blue-600 font-medium">
              {task.startAt ? formatFullDate(task.startAt) : 'Not set'}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">End Date</h4>
            <p className="text-sm text-blue-600 font-medium">
              {task.endAt ? formatFullDate(task.endAt) : 'Not set'}
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-between">
          {canChangeStatus && (
            <div className="flex space-x-2">
              {task.status !== 'pending' && (
                <Button 
                  variant="warning" 
                  onClick={() => changeTaskStatus('pending')}
                  disabled={isLoading}
                >
                  Mark as Pending
                </Button>
              )}
              
              {task.status !== 'in-progress' && (
                <Button 
                  variant="info" 
                  onClick={() => changeTaskStatus('in-progress')}
                  disabled={isLoading}
                >
                  Start Progress
                </Button>
              )}
              
              {task.status !== 'done' && (
                <Button 
                  variant="success" 
                  onClick={() => changeTaskStatus('done')}
                  disabled={isLoading}
                >
                  Complete
                </Button>
              )}
            </div>
          )}
          
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailsModal;