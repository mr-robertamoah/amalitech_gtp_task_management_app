// src/components/ProjectCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Link 
              to={`/project/${project.projectId}`} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Project
            </Link>
            {project.createdAt && (
              <span className="text-xs text-gray-500 mt-1">Created {formatDate(project.createdAt)}</span>
            )}
          </div>
          
          {project.creator && (
            <span className="text-xs text-gray-500">
              By {project.creator.name || project.creator.username}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
