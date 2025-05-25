import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import TextArea from './TextArea';
import { userService } from '../services/userService';
import { updateUserSuccess } from '../features/user/userSlice';
import { showSuccessAlert, showErrorAlert } from '../utils/alertUtils';

const UpdateProfileModal = ({ isOpen, onClose, user }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Set initial form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updatedUser = await userService.updateProfile(user.userId, formData);
      dispatch(updateUserSuccess(updatedUser));
      showSuccessAlert('Profile updated successfully');
      onClose();
    } catch (error) {
      showErrorAlert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Update Profile</h3>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            name="name"
            type="name"
            value={formData.name}
            onChange={handleChange}
            className="mb-4"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mb-4"
          />
          
          <TextArea
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            className="mb-6"
          />
          
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
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateProfileModal;