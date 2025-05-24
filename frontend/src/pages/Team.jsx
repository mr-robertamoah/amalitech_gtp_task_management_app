// src/pages/Team.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { teamService } from '../services/teamService';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/Button';
import CreateProjectModal from '../components/CreateProjectModal';
import { formatDate } from '../utils/dateUtils';
import { showErrorAlert } from '../utils/alertUtils';

const Team = () => {
  const { teamId } = useParams();
  const user = useSelector((state) => state.user.user);
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Check if user is owner or admin
  const isOwnerOrAdmin = user && team && (
    team.ownerId === user.userId || 
    (team.members?.some(member => 
      member.userId === user.userId && 
      (member.role === 'admin' || member.isOwner)
    ))
  );

  // Get user's role in the team
  const getUserRole = () => {
    if (!user || !team) return null;
    
    if (team.ownerId === user.userId) return 'Owner';
    
    const membership = team.members?.find(member => member.userId === user.userId);
    if (membership) {
      if (membership.role === 'admin') return 'Admin';
      return 'Member';
    }
    
    return null;
  };

  // Fetch team details
  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const teamData = await teamService.getTeamById(teamId);
        setTeam(teamData);
      } catch (error) {
        showErrorAlert('Failed to load team details');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId]);

  // Fetch team projects
  useEffect(() => {
    const fetchTeamProjects = async () => {
      try {
        const projectsData = await projectService.getProjects(teamId);
        setProjects(projectsData);
      } catch (error) {
        showErrorAlert('Failed to load team projects');
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchTeamProjects();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">Team not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Team Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{team.name}</h1>
          
          {getUserRole() && (
            <span className={`
              ${getUserRole() === 'Owner' ? 'bg-purple-100 text-purple-800' : 
                getUserRole() === 'Admin' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'} 
              px-3 py-1 rounded-full text-sm font-medium
            `}>
              {getUserRole()}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 mb-6">{team.description}</p>
        
        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-6">
          <div>
            <span className="font-medium">Created by:</span> {team.ownerUsername || 'Team Owner'}
          </div>
          <div>
            <span className="font-medium">Created:</span> {formatDate(team.createdAt)}
          </div>
          <div>
            <span className="font-medium">Members:</span> {team.members?.length || 0}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Projects</h2>
          
          {isOwnerOrAdmin && (
            <Button 
              variant="primary" 
              size="small"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Project
            </Button>
          )}
        </div>

        {projectsLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.projectId} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No projects have been created yet.</p>
            {isOwnerOrAdmin && (
              <Button 
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Your First Project
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        teamId={teamId}
      />
    </div>
  );
};

export default Team;
