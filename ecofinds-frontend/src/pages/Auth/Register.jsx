import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Auth.css';

const Register = () => {
  const { register: registerUser, loading } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!selectedRole) {
      setApiError('Please select whether you want to sign up as a Buyer or Seller');
      return;
    }

    setApiError('');
    try {
      const userData = {
        email: data.email,
        password: data.password,
        username: data.username,
        full_name: data.full_name,
        role: selectedRole
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setApiError(result.error || 'Registration failed');
      }
    } catch (error) {
      setApiError(error.message || 'Registration failed');
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  if (loading) {
    return <LoadingSpinner text="Creating account..." />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-leaf"></i>
              <h2>Join EcoFinds</h2>
            </div>
            <p className="auth-subtitle">Create your sustainable marketplace account</p>
          </div>

          {!selectedRole ? (
            <div className="role-selection">
              <h3>How do you want to use EcoFinds?</h3>
              <div className="role-options">
                <div 
                  className="role-card"
                  onClick={() => handleRoleSelect('buyer')}
                >
                  <div className="role-icon">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <h4>Sign up as Buyer</h4>
                  <p>Browse and purchase second-hand items from sellers</p>
                  <ul className="role-features">
                    <li><i className="fas fa-check"></i> Browse products</li>
                    <li><i className="fas fa-check"></i> Add to cart</li>
                    <li><i className="fas fa-check"></i> Place orders</li>
                    <li><i className="fas fa-check"></i> Track purchases</li>
                  </ul>
                </div>

                <div 
                  className="role-card"
                  onClick={() => handleRoleSelect('seller')}
                >
                  <div className="role-icon">
                    <i className="fas fa-store"></i>
                  </div>
                  <h4>Sign up as Seller</h4>
                  <p>Sell your second-hand items to eco-conscious buyers</p>
                  <ul className="role-features">
                    <li><i className="fas fa-check"></i> List products</li>
                    <li><i className="fas fa-check"></i> Manage inventory</li>
                    <li><i className="fas fa-check"></i> Track sales</li>
                    <li><i className="fas fa-check"></i> Plus buyer features</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="selected-role">
                <div className="role-badge">
                  <i className={`fas fa-${selectedRole === 'buyer' ? 'shopping-cart' : 'store'}`}></i>
                  Signing up as {selectedRole === 'buyer' ? 'Buyer' : 'Seller'}
                </div>
                <button 
                  type="button" 
                  className="btn btn--text"
                  onClick={() => setSelectedRole('')}
                >
                  Change Role
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                {apiError && (
                  <div className="alert alert--error">
                    <i className="fas fa-exclamation-circle"></i>
                    {apiError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className={errors.email ? 'form-input form-input--error' : 'form-input'}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <span className="form-error">{errors.email.message}</span>
                  )}
                </div>

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
                    placeholder="Choose a username"
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
                    placeholder="Enter your full name (optional)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className={errors.password ? 'form-input form-input--error' : 'form-input'}
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <span className="form-error">{errors.password.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    className={errors.confirmPassword ? 'form-input form-input--error' : 'form-input'}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <span className="form-error">{errors.confirmPassword.message}</span>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn--primary btn--full"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : `Create ${selectedRole} Account`}
                </button>
              </form>
            </>
          )}

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
