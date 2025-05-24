import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Button from './Button';
import { teamService } from '../services/teamService';
import { joinTeam } from '../features/teams/teamsSlice';
import { showSuccessAlert, showErrorAlert } from '../utils/alertUtils';

const TeamCard = ({ team, showMembership = true, canJoin = false }) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  // Determine if the user is a member and their role
  const isOwner = user && team.ownerId === user.userId;
  const isMember = user && (isOwner || team.role === 'admin' || team.role === 'member');
  
  // Determine badge style based on role
  const getBadgeStyle = () => {
    if (isOwner) {
      return 'bg-purple-100 text-purple-800';
    } else if (team.role === 'admin') {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };
  
  // Get role display text
  const getRoleText = () => {
    if (isOwner) return 'Owner';
    if (team.role === 'admin') return 'Admin';
    return 'Member';
  };

  // Handle join team request
  const handleJoinTeam = async () => {
    setIsJoining(true);
    try {
      const joinedTeam = await teamService.joinTeam(team.id);
      dispatch(joinTeam(joinedTeam));
      showSuccessAlert('Successfully joined the team!');
      setShowJoinModal(false);
    } catch (error) {
      showErrorAlert(error.message || 'Failed to join team');
    } finally {
      setIsJoining(false);
    }
  };

  // Format the creation date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 30) {
      return date.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Handle description display
  const description = team.description || '';
  const isLongDescription = description.length > 100;
  const displayDescription = showFullDescription ? description : description.slice(0, 100);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{team.name}</h3>
        <div className="mb-4">
          <p className="text-gray-600">{displayDescription}{!showFullDescription && isLongDescription && '...'}</p>
          {isLongDescription && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)} 
              className="text-blue-600 text-sm mt-1 hover:underline"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        
        <div className="flex items-center mb-4">
          {team.memberCount && <span className="text-sm text-gray-500 mr-2">Members: {team.memberCount}</span>}
          {team.projectCount && <span className="text-sm text-gray-500">Projects: {team.projectCount}</span>}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <Link 
              to={`/team/${team.id}`} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details
            </Link>
            {team.createdAt && (
              <span className="text-xs text-gray-500 mt-1">Created {formatDate(team.createdAt)}</span>
            )}
          </div>
          
          {showMembership ? (
            isMember ? (
              <span className={`${getBadgeStyle()} text-xs px-2 py-1 rounded-full`}>
                {getRoleText()}
              </span>
            ) : <></>
          ) : (
            canJoin && user && !isMember && (
              <Button 
                variant="outline" 
                size="small"
                onClick={() => setShowJoinModal(true)}
              >
                Join Team
              </Button>
            )
          )}
        </div>
      </div>

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Join {team.name}</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to join this team?</p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                size="small" 
                onClick={() => setShowJoinModal(false)}
                disabled={isJoining}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="small" 
                onClick={handleJoinTeam}
                isLoading={isJoining}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCard;