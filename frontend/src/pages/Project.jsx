import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { projectService } from '../services/projectService';
import { showErrorAlert, showSuccessAlert } from '../utils/alertUtils';
import { formatDate } from '../utils/dateUtils';
import { deleteProject, setCurrentProject } from '../features/projects/projectsSlice';
import Button from '../components/Button';
import TaskCard from '../components/TaskCard';
import TaskDetailsModal from '../components/TaskDetailsModal';
import TaskCalendar from '../components/TaskCalendar';
import UpdateProjectModal from '../components/UpdateProjectModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Project() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const project = useSelector((state) => state.projects.currentProject);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Design UI', 
      status: 'completed', 
      assignee: 'John Doe',
      assigner: 'Project Manager',
      startAt: '2023-06-01T00:00:00Z',
      endAt: '2023-06-05T00:00:00Z',
      description: 'Create wireframes and mockups for the new dashboard'
    },
    { 
      id: 2, 
      title: 'Implement API', 
      status: 'in-progress', 
      assignee: 'Jane Smith',
      assigner: 'Tech Lead',
      startAt: '2023-06-06T00:00:00Z',
      endAt: '2023-06-12T00:00:00Z',
      description: 'Build RESTful endpoints for user management'
    },
    { 
      id: 3, 
      title: 'Write tests', 
      status: 'pending', 
      assignee: null,
      assigner: 'QA Lead',
      startAt: '2023-06-13T00:00:00Z',
      endAt: '2023-06-18T00:00:00Z',
      description: 'Create unit and integration tests for new features'
    },
    { 
      id: 4, 
      title: 'Deploy to production', 
      status: 'pending', 
      assignee: null,
      assigner: 'DevOps Engineer',
      description: 'Deploy the application to production servers'
    }
  ]); // Mock tasks data - replace with actual API call

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const projectData = await projectService.getProjectById(projectId);
        
        // Check if project data is valid
        if (!projectData || !projectData.projectId) {
          showErrorAlert('Invalid project data');
          navigate('/', { replace: true });
          return;
        }
        
        // Set project in Redux store
        dispatch(setCurrentProject(projectData));
      } catch (error) {
        showErrorAlert('Failed to load project details');
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    
    // Clear current project when component unmounts
    return () => {
      dispatch(setCurrentProject(null));
    };
  }, [projectId, navigate, dispatch]);

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteProject(projectId);
      // Update Redux store
      dispatch(deleteProject(projectId));
      showSuccessAlert('Project deleted successfully');
      navigate(`/team/${project.teamId}`, { replace: true });
    } catch (error) {
      showErrorAlert('Failed to delete project');
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditTask = (taskId) => {
    // Implement task editing functionality
    console.log(`Edit task ${taskId}`);
  };

  const handleDeleteTask = (taskId) => {
    // Implement task deletion functionality
    console.log(`Delete task ${taskId}`);
  };

  const handleAssignTask = (taskId) => {
    // Implement task assignment functionality
    console.log(`Assign task ${taskId}`);
  };

  const handleUnassignTask = (taskId) => {
    // Implement task unassignment functionality
    console.log(`Unassign task ${taskId}`);
  };

  const handleViewTaskDetails = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskDetailsModalOpen(true);
    }
  };

  // Check if user has permission to edit/delete
  const canEditDelete = user && project && (
    user.userId === project.creator?.userId || 
    user.userId === project.teamOwnerId
  );

  // Format date for display
  const formatFullDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || !project) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
          
          {canEditDelete && (
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => setIsUpdateModalOpen(true)}
              >
                Edit Project
              </Button>
              <Button 
                variant="danger" 
                size="small"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete Project
              </Button>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 mb-6">{project.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <span className="font-medium">Created by:</span> {project.creator?.username || 'Unknown'}
          </div>
          <div>
            <span className="font-medium">Created:</span> {formatDate(project.createdAt)}
          </div>
          <div>
            <span className="font-medium">Start date:</span> {formatFullDate(project.startAt)}
          </div>
          <div>
            <span className="font-medium">End date:</span> {formatFullDate(project.endAt)}
          </div>
        </div>
      </div>
      
      {/* Task Calendar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <TaskCalendar tasks={tasks} />
      </div>
      
      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Tasks</h2>
          {canEditDelete && (
            <Button 
              variant="primary" 
              size="small"
            >
              Add Task
            </Button>
          )}
        </div>
        
        {/* Horizontal Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onAssign={handleAssignTask}
                onUnassign={handleUnassignTask}
                onViewDetails={handleViewTaskDetails}
              />
            ))
          ) : (
            <div className="col-span-3 py-8 text-center text-gray-500">
              No tasks found. Add a task to get started.
            </div>
          )}
        </div>
      </div>
      
      {/* Update Project Modal */}
      <UpdateProjectModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        project={project}
      />
      
      {/* Delete Project Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete Project"
        isLoading={isDeleting}
      />
      
      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isTaskDetailsModalOpen}
        onClose={() => setIsTaskDetailsModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}