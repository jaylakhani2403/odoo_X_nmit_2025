import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !hasRole(roles)) {
    return (
      <div className="access-denied">
        <div className="access-denied__content">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Required roles: {roles.join(', ')}</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
