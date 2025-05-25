import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { teamService } from '../services/teamService';
import { showErrorAlert } from '../utils/alertUtils';

const ProtectedTeamRoute = ({ children }) => {
  const { teamId } = useParams();
  const user = useSelector((state) => state.user.user);
  const { userTeams } = useSelector((state) => state.teams);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkTeamAccess = async () => {
      try {
        // Check if team is in user's teams (already a member)
        const isUserTeam = user && userTeams.some(team => team.teamId === teamId);
        
        if (isUserTeam) {
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // If not in user's teams, check if it's a public team
        const teamDetails = await teamService.getTeamById(teamId, user);
        
        if (teamDetails && teamDetails.privacy === 'public') {
          setHasAccess(true);
        } else {
          showErrorAlert('You do not have access to this team');
          setHasAccess(false);
        }
      } catch (error) {
        showErrorAlert('Unable to access team');
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkTeamAccess();
  }, [teamId, user, userTeams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return hasAccess ? children : <Navigate to="/" replace />;
};

export default ProtectedTeamRoute;