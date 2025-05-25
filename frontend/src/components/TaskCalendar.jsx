import React, { useState, useRef, useEffect } from 'react';

const TaskCalendar = ({ tasks, project }) => {
  const scrollRef = useRef(null);
  const [dates, setDates] = useState([]);
  
  // Generate dates for the calendar based on project dates or default to 3 months
  useEffect(() => {
    const generateDates = () => {
      const today = new Date();
      const result = [];
      
      let startDate, endDate;
      
      // If project has both start and end dates, use them
      if (project && project.startAt && project.endAt) {
        startDate = new Date(project.startAt);
        endDate = new Date(project.endAt);
      } else {
        // Default: show previous, current, and next month
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        startDate.setDate(1); // Start from the 1st day of the month
        
        endDate = new Date(today);
        endDate.setMonth(today.getMonth() + 1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of the next month
      }
      
      // Generate all dates in the range
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        result.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setDates(result);
    };
    
    generateDates();
  }, [project]);

  // Scroll to today when component mounts
  useEffect(() => {
    if (scrollRef.current) {
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
    
    // Reset hours to compare dates only
    taskStart.setHours(0, 0, 0, 0);
    taskEnd.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    return date >= taskStart && date <= taskEnd;
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

  // Filter tasks with dates
  const tasksWithDates = tasks.filter(task => task.startAt && task.endAt);

  return (
    <div className="mb-8">
      <div className="mb-3">
        <h3 className="text-lg font-medium text-gray-900">Task Timeline</h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="overflow-x-auto pb-4"
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
                className="absolute flex h-7 mt-1 mb-1 rounded-sm overflow-hidden" 
                style={{ top: `${taskIndex * 36}px`, width: '100%' }}
              >
                {dates.map((date, dateIndex) => {
                  const onDate = isTaskOnDate(task, new Date(date));
                  return (
                    <div 
                      key={dateIndex} 
                      className={`flex-shrink-0 w-24 px-2 h-full ${
                        onDate ? getStatusColor(task.status) : 'bg-transparent'
                      }`}
                    >
                      {onDate && dateIndex === dates.findIndex(d => 
                        isTaskOnDate(task, new Date(d))
                      ) && (
                        <div className="text-xs truncate font-medium">
                          {task.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            
            {tasksWithDates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tasks with scheduled dates to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCalendar;