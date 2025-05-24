// src/components/UpdateTeamModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

const UpdateTeamModal = ({ isOpen, onClose, onUpdate, team, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'private'
  });

  // Set initial form data when team changes
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        privacy: team.privacy || 'private'
      });
    }
  }, [team]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Update Team</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              label="Team Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Privacy
            </label>
            <select
              name="privacy"
              value={formData.privacy}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary" 
              onClick={onClose}
              type="button"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isLoading}
            >
              Update Team
              {isLoading && (
                <span className="ml-2 inline-block">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateTeamModal;