import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const TeamCard = ({ team, isUserMember = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{team.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{team.description}</p>
        
        <div className="flex items-center mb-4">
          <span className="text-sm text-gray-500 mr-2">Members: {team.memberCount}</span>
          <span className="text-sm text-gray-500">Projects: {team.projectCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <Link 
            to={`/team/${team.id}`} 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </Link>
          
          {isUserMember ? (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Member</span>
          ) : (
            <Button 
              variant="outline" 
              size="small"
            >
              Join Team
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;