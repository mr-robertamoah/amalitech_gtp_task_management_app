import React, { useState, useRef, useEffect } from 'react';
import TaskDetailsModal from './TaskDetailsModal';

const HomeTaskCalendar = ({ tasks }) => {
  const scrollRef = useRef(null);
  const [dates, setDates] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [tasksWithDates, setTasksWithDates] = useState([]);
  const [tasksWithoutDates, setTasksWithoutDates] = useState([]);
  
  // Set tasks with and without dates
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    
    const withDates = tasks.filter(task => task.startAt && task.endAt);
    const withoutDates = tasks.filter(task => !task.startAt || !task.endAt);
    
    setTasksWithDates(withDates);
    setTasksWithoutDates(withoutDates);
  }, [tasks]);
  
  // Generate dates based on tasks with dates
  useEffect(() => {
    if (!tasksWithDates || tasksWithDates.length === 0) {
      setDates([]);
      return;
    }
    
    // Find earliest start date
    const earliestTask = tasksWithDates.reduce((earliest, task) => {
      const taskStart = new Date(task.startAt);
      const earliestStart = earliest ? new Date(earliest.startAt) : taskStart;
      return taskStart < earliestStart ? task : earliest;
    }, tasksWithDates[0]);
    
    // Find latest end date
    const latestTask = tasksWithDates.reduce((latest, task) => {
      const taskEnd = new Date(task.endAt);
      const latestEnd = latest ? new Date(latest.endAt) : taskEnd;
      return taskEnd > latestEnd ? task : latest;
    }, tasksWithDates[0]);
    
    if (earliestTask && latestTask) {
      generateDates(new Date(earliestTask.startAt), new Date(latestTask.endAt));
    }
  }, [tasksWithDates]);
  
  // Generate dates for the calendar based on earliest and latest dates
  const generateDates = (startDate, endDate) => {
    const result = [];
    
    // Ensure we have at least a month of dates
    const minEndDate = new Date(startDate);
    minEndDate.setMonth(minEndDate.getMonth() + 1);
    
    const actualEndDate = endDate > minEndDate ? endDate : minEndDate;
    
    // Generate all dates in the range
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(actualEndDate.getFullYear(), actualEndDate.getMonth(), actualEndDate.getDate());
    
    let currentDate = new Date(start);
    while (currentDate <= end) {
      result.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setDates(result);
  };

  // Scroll to today when component mounts
  useEffect(() => {
    if (scrollRef.current && dates.length > 0) {
      const today = new Date();
      const todayIndex = dates.findIndex(date => 
        date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()
      );
      
      if (todayIndex >= 0) {
        const dayWidth = 96; // 24px * 4 (w-24 class)
        scrollRef.current.scrollLeft = (todayIndex - 2) * dayWidth; // Center today
      }
    }
  }, [dates]);

  // Get status color for task
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-200';
      case 'in-progress': return 'bg-blue-200';
      case 'pending': return 'bg-yellow-200';
      default: return 'bg-gray-200';
    }
  };

  // Check if task spans this date
  const isTaskOnDate = (task, date) => {
    if (!task.startAt || !task.endAt) return false;
    
    const taskStart = new Date(task.startAt);
    const taskEnd = new Date(task.endAt);
    const dateToCompare = new Date(date);
    
    // Reset hours to compare dates only
    const taskStartDay = new Date(taskStart.getFullYear(), taskStart.getMonth(), taskStart.getDate());
    const taskEndDay = new Date(taskEnd.getFullYear(), taskEnd.getMonth(), taskEnd.getDate());
    const dateDay = new Date(dateToCompare.getFullYear(), dateToCompare.getMonth(), dateToCompare.getDate());
    
    return dateDay >= taskStartDay && dateDay <= taskEndDay;
  };

  // Format date for display
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  // Is this date today?
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Is this the first day of a month?
  const isFirstDayOfMonth = (date) => {
    return date.getDate() === 1;
  };
  
  // Handle task click
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
  };

  // Removed redundant comment

  if (tasks.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">You don't have any assigned tasks.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {tasksWithDates.length > 0 && dates.length > 0 && (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-3">My Task Timeline</h3>
          
          <div 
            ref={scrollRef}
            className="overflow-x-auto pb-4 mb-6"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="inline-block min-w-full">
              {/* Date headers */}
              <div className="flex">
                {dates.map((date, index) => (
                  <div 
                    key={index} 
                    className={`flex-shrink-0 w-24 px-2 py-1 text-center border-r border-gray-200 ${
                      isToday(date) ? 'bg-blue-50 font-medium' : 
                      isFirstDayOfMonth(date) ? 'bg-gray-50 border-l border-gray-300' : ''
                    }`}
                  >
                    {isFirstDayOfMonth(date) ? (
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500">
                          {date.toLocaleString('default', { month: 'long' })}
                        </span>
                        <span>{formatDate(date)}</span>
                      </div>
                    ) : (
                      formatDate(date)
                    )}
                  </div>
                ))}
              </div>
              
              {/* Task rows container with fixed height */}
              <div className="relative" style={{ height: tasksWithDates.length > 0 ? `${tasksWithDates.length * 36}px` : '100px' }}>
                {tasksWithDates.map((task, taskIndex) => (
                  <div 
                    key={taskIndex} 
                    className="absolute flex h-7 mt-1 mb-1 rounded-sm overflow-hidden cursor-pointer" 
                    style={{ top: `${taskIndex * 36}px`, width: '100%' }}
                    onClick={() => handleTaskClick(task)}
                  >
                    {dates.map((date, dateIndex) => {
                      const onDate = isTaskOnDate(task, date);
                      return (
                        <div 
                          key={dateIndex} 
                          className={`flex-shrink-0 w-24 px-2 h-full ${
                            onDate ? getStatusColor(task.status) : 'bg-transparent'
                          }`}
                        >
                          {onDate && (
                            <div className="text-xs truncate font-medium">
                              {dateIndex === dates.findIndex(d => isTaskOnDate(task, d)) ? task.title : ''}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Tasks without dates */}
      {tasksWithoutDates.length > 0 && (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Tasks Without Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasksWithoutDates.map((task) => (
              <div 
                key={task.taskId} 
                className={`p-4 rounded-lg shadow-sm border-l-4 ${getStatusColor(task.status)} cursor-pointer`}
                onClick={() => handleTaskClick(task)}
              >
                <h4 className="font-medium text-gray-800 mb-1">{task.title}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {task.projectName || 'No project'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isTaskDetailsModalOpen}
        onClose={() => setIsTaskDetailsModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
};

export default HomeTaskCalendar;