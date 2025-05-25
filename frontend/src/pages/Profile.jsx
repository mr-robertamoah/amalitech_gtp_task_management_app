import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import UpdateProfileModal from '../components/UpdateProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { userService } from '../services/userService';
import { logout } from '../features/user/userSlice';
import { showSuccessAlert, showErrorAlert } from '../utils/alertUtils';

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAccount();
      showSuccessAlert('Account deleted successfully');
      dispatch(logout());
      navigate('/login', { replace: true });
    } catch (error) {
      showErrorAlert('Failed to delete account');
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Personal Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 font-medium">Name:</span> 
                <span className="ml-2">{user.name || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Username:</span> 
                <span className="ml-2">{user.username || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Email:</span> 
                <span className="ml-2">{user.email || 'Not set'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Bio</h2>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md min-h-[100px]">
              {user.bio || 'No bio provided'}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="primary"
            onClick={() => setIsUpdateModalOpen(true)}
          >
            Update Profile
          </Button>
        </div>
      </div>
      
      {/* Password Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Password</h2>
        <p className="text-gray-600 mb-4">
          Change your password to keep your account secure.
        </p>
        <div className="flex justify-end">
          <Button 
            variant="secondary"
            onClick={() => setIsChangePasswordModalOpen(true)}
          >
            Change Password
          </Button>
        </div>
      </div>
      
      {/* Delete Account Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-500">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Delete Account</h2>
        <p className="text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <div className="flex justify-end">
          <Button 
            variant="danger"
            onClick={() => setIsDeleteAccountModalOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </div>
      
      {/* Update Profile Modal */}
      <UpdateProfileModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        user={user}
      />
      
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      
      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmText="Delete Account"
        isLoading={isDeleting}
      />
    </div>
  );
}