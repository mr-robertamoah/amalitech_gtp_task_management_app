// src/components/InviteUsersModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { userService } from '../services/userService';

const InviteUsersModal = ({ isOpen, onClose, onInvite, teamId, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Clear selected users when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
      setSearchResults([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for search
    if (query.length >= 2) {
      const timeout = setTimeout(() => {
        searchUsers(query);
      }, 500);
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
    }
  };

  // Search users by query
  const searchUsers = async (query) => {
    if (query.length < 2) return;
    
    setIsSearching(true);
    try {
      const results = await userService.searchUsers(query);
      // Filter out already selected users
      const filteredResults = results.filter(
        user => !selectedUsers.some(selected => selected.userId === user.userId)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (user) => {
    if (selectedUsers.some(selected => selected.userId === user.userId)) {
      setSelectedUsers(selectedUsers.filter(selected => selected.userId !== user.userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
    // Remove from search results when selected
    setSearchResults(searchResults.filter(result => result.userId !== user.userId));
  };

  // Remove user from selection
  const removeSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.userId !== userId));
  };

  // Handle invite submission
  const handleSubmit = () => {
    const userIds = selectedUsers.map(user => user.userId);
    onInvite(userIds);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Users to Team</h3>
        
        {/* Search input */}
        <div className="mb-4">
          <Input
            label="Search by username or email"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Type to search users..."
          />
        </div>
        
        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Users ({selectedUsers.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div 
                  key={user.userId} 
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  <span>{user.username || user.email}</span>
                  <button 
                    onClick={() => removeSelectedUser(user.userId)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Search results */}
        <div className="mb-6 max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users found</p>
          ) : searchResults.length > 0 ? (
            <div className="border rounded-md divide-y">
              {searchResults.map(user => (
                <div 
                  key={user.userId} 
                  className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleUserSelection(user)}
                >
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    Add
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || isLoading}
          >
            Invite Users
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
      </div>
    </Modal>
  );
};

export default InviteUsersModal;