import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TeamCard from '../components/TeamCard';
import { fetchTeamsStart, fetchUserTeamsSuccess, fetchPublicTeamsSuccess, fetchTeamsFailure } from '../features/teams/teamsSlice';

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const { userTeams, publicTeams, loading } = useSelector((state) => state.teams);
  
  useEffect(() => {
    // This would be replaced with actual API calls in a real implementation
    const loadTeams = () => {
      dispatch(fetchTeamsStart());
      
      // Simulate API calls with static data
      const myTeamsData = [
        {
          id: '1',
          name: 'Development Team',
          description: 'Frontend and backend development team working on the main product.',
          memberCount: 8,
          projectCount: 3
        },
        {
          id: '2',
          name: 'Design Team',
          description: 'UI/UX designers creating beautiful interfaces for our products.',
          memberCount: 5,
          projectCount: 2
        }
      ];
      
      const publicTeamsData = [
        {
          id: '3',
          name: 'Marketing Team',
          description: 'Responsible for all marketing activities and campaigns.',
          memberCount: 6,
          projectCount: 4
        },
        {
          id: '4',
          name: 'QA Team',
          description: 'Quality assurance team ensuring product reliability.',
          memberCount: 4,
          projectCount: 2
        },
        {
          id: '5',
          name: 'DevOps Team',
          description: 'Managing infrastructure and deployment pipelines.',
          memberCount: 3,
          projectCount: 5
        }
      ];
      
      try {
        if (user) {
          dispatch(fetchUserTeamsSuccess(myTeamsData));
        }
        dispatch(fetchPublicTeamsSuccess(publicTeamsData));
      } catch (error) {
        dispatch(fetchTeamsFailure(error.message));
      }
    };
    
    loadTeams();
  }, [dispatch, user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Management App</h1>
        
        {user ? (
          <p className="text-lg text-gray-600 mb-8">
            Welcome back, <span className="font-medium">{user.username}</span>! 
            Here's an overview of your teams and available public teams.
          </p>
        ) : (
          <p className="text-lg text-gray-600 mb-8">
            Welcome to the Task Management App! Sign in to join teams and manage your tasks.
          </p>
        )}
      </section>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && user && (
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">My Teams</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Create New Team
            </button>
          </div>
          
          {userTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTeams.map(team => (
                <TeamCard key={team.id} team={team} isUserMember={true} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">You haven't joined any teams yet.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Create Your First Team
              </button>
            </div>
          )}
        </section>
      )}

      {!loading && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Public Teams</h2>
          
          {publicTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicTeams.map(team => (
                <TeamCard key={team.id} team={team} isUserMember={false} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No public teams available at the moment.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}