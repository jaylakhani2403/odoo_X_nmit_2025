import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from "react-hook-form";

import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Auth.css';

const Login = () => {
  const { login, loading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setApiError(result.error || 'Login failed');
      }
    } catch (error) {
      setApiError(error.message || 'Login failed');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Logging in..." />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-leaf"></i>
              <h2>Welcome Back</h2>
            </div>
            <p className="auth-subtitle">Sign in to your EcoFinds account</p>
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
                placeholder="Enter your password"
              />
              {errors.password && (
                <span className="form-error">{errors.password.message}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn--primary btn--full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
            
            {/* <div className="auth-demo">
              <h4>Demo Accounts:</h4>
              <div className="demo-accounts">
                <div className="demo-account">
                  <strong>Admin:</strong> admin@ecofinds.com / password123
                </div>
                <div className="demo-account">
                  <strong>Seller:</strong> seller1@example.com / password123
                </div>
                <div className="demo-account">
                  <strong>Buyer:</strong> buyer1@example.com / password123
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
