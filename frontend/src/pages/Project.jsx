import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { showErrorAlert, showSuccessAlert } from '../utils/alertUtils';
import { formatDate, formatFullDate } from '../utils/dateUtils';
import { deleteProject, setCurrentProject } from '../features/projects/projectsSlice';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure, updateTask, deleteTask } from '../features/tasks/tasksSlice';
import Button from '../components/Button';
import TaskCard from '../components/TaskCard';
import TaskDetailsModal from '../components/TaskDetailsModal';
import TaskCalendar from '../components/TaskCalendar';
import UpdateProjectModal from '../components/UpdateProjectModal';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import AssignTaskModal from '../components/AssignTaskModal';
import UnassignTaskConfirmationModal from '../components/UnassignTaskConfirmationModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Project() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const project = useSelector((state) => state.projects.currentProject);
  const tasks = useSelector((state) => state.tasks.tasks);
  const tasksLoading = useSelector((state) => state.tasks.loading);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const projectData = await projectService.getProjectById(projectId, user);
        
        // Check if project data is valid
        if (!projectData || !projectData.projectId) {
          showErrorAlert('Invalid project data');
          navigate('/', { replace: true });
          return;
        }
        
        // Set project in Redux store
        dispatch(setCurrentProject(projectData));
        
        // Fetch tasks after project is loaded
        fetchProjectTasks(projectData.projectId);
        
        // Fetch team members
        if (projectData.teamId) {
          try {
            const teamData = await projectService.getTeamMembers(projectData.teamId);
            setTeamMembers(teamData.filter(member => member.status === 'active'));
          } catch (error) {
            console.error('Failed to load team members:', error);
          }
        }
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

  const fetchProjectTasks = async (projectId) => {
    dispatch(fetchTasksStart());
    try {
      const tasksData = await taskService.getProjectTasks(projectId);
      dispatch(fetchTasksSuccess(tasksData));
    } catch (error) {
      dispatch(fetchTasksFailure(error.message));
    }
  };

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
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      setSelectedTask(task);
      setIsEditTaskModalOpen(true);
    }
  };

  const handleDeleteTask = (taskId) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      setSelectedTask(task);
      setIsDeleteTaskModalOpen(true);
    }
  };

  const confirmDeleteTask = async () => {
    if (!selectedTask) return;
    
    setIsDeletingTask(true);
    try {
      await taskService.deleteTask(selectedTask.taskId);
      dispatch(deleteTask(selectedTask.taskId));
      showSuccessAlert('Task deleted successfully');
      setIsDeleteTaskModalOpen(false);
    } catch (error) {
      showErrorAlert('Failed to delete task');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleAssignTask = (taskId) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      setSelectedTask(task);
      setIsAssignTaskModalOpen(true);
    }
  };

  const [isUnassignTaskModalOpen, setIsUnassignTaskModalOpen] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);

  const handleUnassignTask = (taskId) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      setSelectedTask(task);
      setIsUnassignTaskModalOpen(true);
    }
  };
  
  const confirmUnassignTask = async () => {
    if (!selectedTask) return;
    
    setIsUnassigning(true);
    try {
      const updatedTask = await taskService.unassignTask(selectedTask.taskId);
      dispatch(updateTask(updatedTask));
      showSuccessAlert('Task unassigned successfully');
      setIsUnassignTaskModalOpen(false);
    } catch (error) {
      showErrorAlert('Failed to unassign task');
    } finally {
      setIsUnassigning(false);
    }
  };

  const handleViewTaskDetails = (taskId) => {
    const task = tasks.find(t => t.taskId === taskId);
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
            <span className="font-medium">Start date:</span> {project.startAt ? 
              <span className="text-blue-600 font-medium">{formatFullDate(project.startAt)}</span> : 
              <span>Not set</span>
            }
          </div>
          <div>
            <span className="font-medium mr-1">End date:</span> 
            {project.endAt ? (
              <span className="text-blue-600 font-medium">{formatFullDate(project.endAt)}</span>
            ) : (
              <span className="text-yellow-600 font-medium">Not set - No deadline</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Task Calendar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <TaskCalendar tasks={tasks} project={project} />
      </div>
      
      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Tasks</h2>
          {canEditDelete && (
            <Button 
              variant="primary" 
              size="small"
              onClick={() => setIsAddTaskModalOpen(true)}
            >
              Add Task
            </Button>
          )}
        </div>
        
        {/* Tasks List */}
        {tasksLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.length > 0 ? (
              tasks.map((task) => {
                let canEditAndDelete = user && project && (
                      project.creator?.userId === user.userId || 
                      task.creator?.userId === user.userId ||
                      project.teamOwnerId === user.userId
                    );

                let canAssign = user && project && (
                      project.creator?.userId === user.userId || 
                      task.creator?.userId === user.userId ||
                      project.isAdmin
                    );

                let canUnassign = user && project && (
                      project.creator?.userId === user.userId || 
                      task.creator?.userId === user.userId ||
                      task.assigner?.userId === user.userId
                    );
                  
                return <TaskCard
                  key={task.taskId}
                  task={task}
                  onEdit={
                    canEditAndDelete ? 
                    handleEditTask : 
                    null
                  }
                  onDelete={
                    canEditAndDelete ? 
                    handleDeleteTask : 
                    null
                  }
                  onAssign={
                    canAssign ? 
                    handleAssignTask : 
                    null
                  }
                  onUnassign={
                    canUnassign ? 
                    handleUnassignTask : 
                    null
                  }
                  onViewDetails={handleViewTaskDetails}
                />;
              })
            ) : (
              <div className="col-span-3 py-8 text-center text-gray-500">
                No tasks found. Add a task to get started.
              </div>
            )}
          </div>
        )}
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
      
      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        projectId={projectId}
        teamId={project.teamId}
      />
      
      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        task={selectedTask}
      />
      
      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        task={selectedTask}
        teamMembers={teamMembers}
      />
      
      {/* Delete Task Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteTaskModalOpen}
        onClose={() => setIsDeleteTaskModalOpen(false)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete the task "${selectedTask?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        isLoading={isDeletingTask}
      />
      
      {/* Unassign Task Confirmation Modal */}
      <UnassignTaskConfirmationModal
        isOpen={isUnassignTaskModalOpen}
        onClose={() => setIsUnassignTaskModalOpen(false)}
        onConfirm={confirmUnassignTask}
        task={selectedTask}
        isLoading={isUnassigning}
      />
    </div>
  );
}