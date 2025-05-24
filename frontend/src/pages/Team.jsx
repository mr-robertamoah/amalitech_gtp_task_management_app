// src/pages/Team.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { teamService } from '../services/teamService';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/ProjectCard';
import MemberCard from '../components/MemberCard';
import Button from '../components/Button';
import CreateProjectModal from '../components/CreateProjectModal';
import UpdateTeamModal from '../components/UpdateTeamModal';
import InviteUsersModal from '../components/InviteUsersModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatDate } from '../utils/dateUtils';
import { showErrorAlert, showSuccessAlert } from '../utils/alertUtils';

const Team = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  
  // Check if user is owner or admin
  const isOwnerOrAdmin = user && team && (
    team.ownerId === user.userId || 
    (team.members?.some(member => 
      member.userId === user.userId && 
      (member.role === 'admin' || member.isOwner)
    ))
  );

  const isOwner = user && team && team.ownerId === user.userId;

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

  // Handler functions for member actions
  const handleMakeAdmin = async (userId) => {
    setLoadingStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], makeAdmin: true }
    }));
    
    try {
      const updatedTeam = await teamService.makeAdmin(teamId, userId);
      setTeam(updatedTeam);
      showSuccessAlert('Member role updated to admin');
    } catch (error) {
      console.error('Error making member admin:', error);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], makeAdmin: false }
      }));
    }
  };

  const handleMakeMember = async (userId) => {
    setLoadingStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], makeMember: true }
    }));
    
    try {
      const updatedTeam = await teamService.makeMember(teamId, userId);
      setTeam(updatedTeam);
      showSuccessAlert('Member role updated to member');
    } catch (error) {
      console.error('Error making admin a member:', error);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], makeMember: false }
      }));
    }
  };

  const handleBanMember = async (userId) => {
    setLoadingStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], banMember: true }
    }));
    
    try {
      const updatedTeam = await teamService.banMember(teamId, userId);
      setTeam(updatedTeam);
      showSuccessAlert('Member has been banned');
    } catch (error) {
      console.error('Error banning member:', error);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], banMember: false }
      }));
    }
  };

  const handleActivateMember = async (userId) => {
    setLoadingStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], activateMember: true }
    }));
    
    try {
      const updatedTeam = await teamService.activateMember(teamId, userId);
      setTeam(updatedTeam);
      showSuccessAlert('Member has been activated');
    } catch (error) {
      console.error('Error activating member:', error);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], activateMember: false }
      }));
    }
  };

  const handleRemoveMember = async (userId) => {
    setLoadingStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], removeMember: true }
    }));
    
    try {
      const updatedTeam = await teamService.removeMember(teamId, userId);
      setTeam(updatedTeam);
      showSuccessAlert('Member has been removed from the team');
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], removeMember: false }
      }));
    }
  };

  const handleUpdateTeam = async (updateData) => {
    setIsUpdating(true);
    try {
      const updatedTeam = await teamService.updateTeam(teamId, updateData);
      setTeam(updatedTeam);
      setIsUpdateModalOpen(false);
      showSuccessAlert('Team updated successfully');
    } catch (error) {
      console.error('Error updating team:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    try {
      await teamService.deleteTeam(teamId);
      showSuccessAlert('Team deleted successfully');
      navigate('/'); // Redirect to home page after deletion
    } catch (error) {
      console.error('Error deleting team:', error);
      setIsDeleting(false);
    }
  };
  
  const handleInviteUsers = async (userIds) => {
    if (!userIds.length) return;
    
    setIsInviting(true);
    try {
      const updatedTeam = await teamService.inviteUsersToTeam(teamId, { userIds });
      setTeam(updatedTeam);
      setIsInviteModalOpen(false);
      showSuccessAlert('Users invited successfully');
    } catch (error) {
      console.error('Error inviting users:', error);
    } finally {
      setIsInviting(false);
    }
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
          
          <div className="flex items-center space-x-3 mt-3 md:mt-0">
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
            
            {isOwner && (
              <>
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => setIsUpdateModalOpen(true)}
                >
                  Edit Team
                </Button>
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete Team
                </Button>
              </>
            )}
          </div>
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

      {/* Members Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Team Members</h2>
          
          {user && (team.ownerId === user.userId || team.members?.some(member => 
            member.userId === user.userId && member.role === 'admin')) && (
            <Button 
              variant="primary" 
              size="small"
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite User
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : team.members && team.members.filter(member => !member.isOwner).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.members
              .filter(member => !member.isOwner)
              .map(member => (
                <MemberCard 
                  key={member.userId} 
                  member={member} 
                  isOwner={user && team.ownerId === user.userId}
                  loadingStates={loadingStates[member.userId] || {}}
                  onMakeAdmin={(userId) => handleMakeAdmin(userId)}
                  onMakeMember={(userId) => handleMakeMember(userId)}
                  onBanMember={(userId) => handleBanMember(userId)}
                  onActivateMember={(userId) => handleActivateMember(userId)}
                  onRemoveMember={(userId) => handleRemoveMember(userId)}
                />
              ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No team members found.</p>
            {user && (team.ownerId === user.userId || team.members?.some(member => 
              member.userId === user.userId && member.role === 'admin')) && (
              <Button 
                variant="primary"
                onClick={() => setIsInviteModalOpen(true)}
                className="mt-4"
              >
                Invite Your First Team Member
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

      {/* Update Team Modal */}
      <UpdateTeamModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdate={handleUpdateTeam}
        team={team}
        isLoading={isUpdating}
      />

      {/* Delete Team Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTeam}
        title="Delete Team"
        message="Are you sure you want to delete this team? This action cannot be undone and all team data will be permanently lost."
        confirmText="Delete Team"
        isLoading={isDeleting}
      />

      {/* Invite Users Modal */}
      <InviteUsersModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteUsers}
        teamId={teamId}
        isLoading={isInviting}
      />
    </div>
  );
};

export default Team;