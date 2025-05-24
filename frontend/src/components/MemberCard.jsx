// src/components/MemberCard.jsx
import React, { useState } from 'react';
import Button from './Button';
import ConfirmationModal from './ConfirmationModal';

const MemberCard = ({ 
  member, 
  isOwner, 
  onMakeAdmin, 
  onMakeMember, 
  onBanMember, 
  onRemoveMember,
  loadingStates = {}
}) => {
  const [showBanConfirmation, setShowBanConfirmation] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);

  // Get status color based on member status
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get role color based on member role
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-indigo-500">
        <div className="p-5">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {member.details?.username || 'Unknown User'}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
              {member.role?.charAt(0).toUpperCase() + member.role?.slice(1) || 'Member'}
            </span>
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
              {member.status?.charAt(0).toUpperCase() + member.status?.slice(1) || 'Unknown'}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            {member.joinedAt && (
              <span>Joined: {new Date(member.joinedAt).toLocaleDateString()}</span>
            )}
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-2 mt-2 border-t pt-3">
              {member.role === 'member' && (
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => onMakeAdmin(member.userId)}
                  disabled={loadingStates.makeAdmin}
                >
                  Make Admin
                  {loadingStates.makeAdmin && (
                    <span className="ml-2 inline-block">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  )}
                </Button>
              )}
              
              {member.role === 'admin' && (
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => onMakeMember(member.userId)}
                  disabled={loadingStates.makeMember}
                >
                  Make Member
                  {loadingStates.makeMember && (
                    <span className="ml-2 inline-block">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  )}
                </Button>
              )}
              
              <Button 
                variant="danger" 
                size="small" 
                onClick={() => setShowBanConfirmation(true)}
                disabled={loadingStates.banMember}
              >
                Ban Member
                {loadingStates.banMember && (
                  <span className="ml-2 inline-block">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </Button>
              
              <Button 
                variant="danger" 
                size="small" 
                onClick={() => setShowRemoveConfirmation(true)}
                disabled={loadingStates.removeMember}
              >
                Remove Member
                {loadingStates.removeMember && (
                  <span className="ml-2 inline-block">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Ban Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBanConfirmation}
        onClose={() => setShowBanConfirmation(false)}
        onConfirm={() => {
          onBanMember(member.userId);
          setShowBanConfirmation(false);
        }}
        title="Ban Team Member"
        message={`Are you sure you want to ban ${member.details?.username || 'this member'}? They will no longer be able to access team resources.`}
        confirmText="Ban Member"
        isLoading={loadingStates.banMember}
      />

      {/* Remove Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemoveConfirmation}
        onClose={() => setShowRemoveConfirmation(false)}
        onConfirm={() => {
          onRemoveMember(member.userId);
          setShowRemoveConfirmation(false);
        }}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${member.details?.username || 'this member'} from the team?`}
        confirmText="Remove Member"
        isLoading={loadingStates.removeMember}
      />
    </>
  );
};

export default MemberCard;