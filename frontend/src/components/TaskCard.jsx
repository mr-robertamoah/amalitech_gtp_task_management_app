import React from 'react';
import Button from './Button';

const TaskCard = ({ task, onEdit, onDelete, onAssign, onUnassign, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
      </div>
      
      <div className="mb-4">
        <span className="text-sm text-gray-500">
          Assignee: {task.assignee?.username || 'Unassigned'}
        </span>
      </div>
      
      <div className="flex flex-wrap justify-end gap-2">
        <button 
          className="text-blue-600 hover:text-blue-800 text-sm underline"
          onClick={() => onViewDetails(task.taskId)}
        >
          View Details
        </button>
        {onEdit && <Button 
          variant="secondary" 
          size="small"
          onClick={() => onEdit(task.taskId)}
        >
          Edit
        </Button>}
        {onDelete && <Button 
          variant="danger" 
          size="small"
          onClick={() => onDelete(task.taskId)}
        >
          Delete
        </Button>}
        {task.assignee?.username ? (
          (onAssign && <Button 
            variant="warning" 
            size="small"
            onClick={() => onUnassign(task.taskId)}
          >
            Unassign
          </Button>)
        ) : (onAssign &&
          <Button 
            variant="primary" 
            size="small"
            onClick={() => onAssign(task.taskId)}
          >
            Assign
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;