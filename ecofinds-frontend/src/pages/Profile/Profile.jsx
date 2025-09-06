import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
  console.log(user);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: user?.username || '',
      full_name: user?.full_name || '',
      email: user?.email || ''
    }
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
  try {
    setLoading(true);
    const response = await authService.updateProfile(data);
    if (response && response.user) {
      updateUser(response.user); // <-- Update context, localStorage, rerender
    }
    toast.success('Profile updated successfully');
  } catch (error) {
    toast.error('Failed to update profile');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="profile-info">
              <h1>{user?.username}</h1>
              <p className="profile-role">
                <span className={`role-badge role-badge--${user?.role}`}>
                  {user?.role}
                </span>
              </p>
            </div>
          </div>
          <div className="profile-form-container">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters'
                    }
                  })}
                  className={errors.username ? 'form-input form-input--error' : 'form-input'}
                />
                {errors.username && (
                  <span className="form-error">{errors.username.message}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  {...register('full_name')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="form-input form-input--disabled"
                />
                <small className="form-help">Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value={user?.role || ''}
                  disabled
                  className="form-input form-input--disabled"
                />
                <small className="form-help">Role cannot be changed</small>
              </div>
              <button 
                type="submit" 
                className="btn btn--primary btn--full"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
