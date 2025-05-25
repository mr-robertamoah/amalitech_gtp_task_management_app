import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TeamCard from '../components/TeamCard';
import CreateTeamModal from '../components/CreateTeamModal';
import HomeTaskCalendar from '../components/HomeTaskCalendar';
import { 
  fetchTeamsStart, 
  fetchUserTeamsSuccess, 
  fetchPublicTeamsSuccess, 
  fetchTeamsFailure 
} from '../features/teams/teamsSlice';
import {
  fetchUserTasksStart,
  fetchUserTasksSuccess,
  fetchUserTasksFailure
} from '../features/userTasks/userTasksSlice';
import { teamService } from '../services/teamService';
import { userTaskService } from '../services/userTaskService';

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const { userTeams, publicTeams } = useSelector((state) => state.teams);
  const { tasks: userTasks, loading: userTasksLoading } = useSelector((state) => state.userTasks);
  
  const [userTeamsLoading, setUserTeamsLoading] = useState(false);
  const [publicTeamsLoading, setPublicTeamsLoading] = useState(false);
  const [hasLoadedPublicTeams, setHasLoadedPublicTeams] = useState(false);
  const [hasLoadedUserTeams, setHasLoadedUserTeams] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch public teams only if not already loaded
  useEffect(() => {
    const fetchPublicTeams = async () => {
      // Skip if we already have public teams data or if we've already attempted to load them
      if (publicTeams.length > 0 || hasLoadedPublicTeams) {
        return;
      }
      
      setPublicTeamsLoading(true);
      dispatch(fetchTeamsStart());
      
      try {
        const data = await teamService.getPublicTeams();
        dispatch(fetchPublicTeamsSuccess(data));
      } catch (error) {
        dispatch(fetchTeamsFailure(error.message));
      } finally {
        setPublicTeamsLoading(false);
        setHasLoadedPublicTeams(true);
      }
    };
    
    fetchPublicTeams();
  }, [dispatch, publicTeams.length, hasLoadedPublicTeams]);

  // Fetch user teams if user is logged in and teams not already loaded
  useEffect(() => {
    if (!user) return;
    
    const fetchUserTeams = async () => {
      // Skip if we already have user teams data or if we've already attempted to load them
      if (userTeams.length > 0 || hasLoadedUserTeams) {
        return;
      }
      
      setUserTeamsLoading(true);
      
      try {
        const data = await teamService.getUserTeams();
        dispatch(fetchUserTeamsSuccess(data));
      } catch (error) {
        dispatch(fetchTeamsFailure(error.message));
      } finally {
        setUserTeamsLoading(false);
        setHasLoadedUserTeams(true);
      }
    };
    
    fetchUserTeams();
  }, [dispatch, user, userTeams.length, hasLoadedUserTeams]);

  // Fetch user tasks if user is logged in
  useEffect(() => {
    if (!user) return;
    
    const fetchUserTasks = async () => {
      dispatch(fetchUserTasksStart());
      
      try {
        const data = await userTaskService.getUserTasks(user?.userId);
        dispatch(fetchUserTasksSuccess(data));
      } catch (error) {
        dispatch(fetchUserTasksFailure(error.message));
      }
    };
    
    fetchUserTasks();
  }, [dispatch, user]);

  const handleCreateTeam = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Management App</h1>
        
        {user ? (
          <p className="text-lg text-gray-600 mb-8">
            Welcome back, <span className="font-medium">{user.username}</span>! 
            Here's an overview of your tasks and teams.
          </p>
        ) : (
          <p className="text-lg text-gray-600 mb-8">
            Welcome to the Task Management App! Sign in to join teams and manage your tasks.
          </p>
        )}
      </section>

      {/* User Tasks Section */}
      {user && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Tasks</h2>
          
          {userTasksLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <HomeTaskCalendar tasks={userTasks} />
            </div>
          )}
        </section>
      )}

      {/* User Teams Section */}
      {user && (
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">My Teams</h2>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              onClick={handleCreateTeam}
            >
              Create New Team
            </button>
          </div>
          
          {userTeamsLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : userTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTeams.map(team => (
                <TeamCard key={team.teamId} team={team} showMembership={true} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">You haven't joined any teams yet.</p>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleCreateTeam}
              >
                Create Your First Team
              </button>
            </div>
          )}
        </section>
      )}

      {/* Public Teams Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Public Teams</h2>
        
        {publicTeamsLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : publicTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicTeams.map(team => {
              // Check if this team is already in the user's teams
              // TODO const isUserTeam = user && userTeams.some(userTeam => userTeam.teamId === team.teamId);
              return (
                <TeamCard 
                  key={team.teamId} 
                  team={team} 
                  showMembership={false} 
                  canJoin={false} // {!isUserTeam && user}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No public teams available at the moment.</p>
          </div>
        )}
      </section>

      {/* Create Team Modal */}
      <CreateTeamModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}