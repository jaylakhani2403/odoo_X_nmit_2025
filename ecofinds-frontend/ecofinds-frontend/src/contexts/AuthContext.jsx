import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('ecofinds_token');
        const savedUser = localStorage.getItem('ecofinds_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          authService.setAuthToken(savedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { user: userData, token: userToken } = response;
        
        setUser(userData);
        setToken(userToken);
        
        localStorage.setItem('ecofinds_token', userToken);
        localStorage.setItem('ecofinds_user', JSON.stringify(userData));
        
        authService.setAuthToken(userToken);
        
        toast.success(`Welcome back, ${userData.username}!`);
        return { success: true, user: userData };
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        const { user: newUser, token: userToken } = response;
        
        setUser(newUser);
        setToken(userToken);
        
        localStorage.setItem('ecofinds_token', userToken);
        localStorage.setItem('ecofinds_user', JSON.stringify(newUser));
        
        authService.setAuthToken(userToken);
        
        toast.success(`Welcome to EcoFinds, ${newUser.username}!`);
        return { success: true, user: newUser };
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ecofinds_token');
    localStorage.removeItem('ecofinds_user');
    authService.setAuthToken(null);
    toast.info('Logged out successfully');
  };

   const updateUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem('ecofinds_user', JSON.stringify(nextUser));
  };

  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  const isAdmin = () => hasRole('admin');
  const isSeller = () => hasRole(['seller', 'admin']);
  const isBuyer = () => hasRole(['buyer', 'admin']);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isSeller,
    isBuyer,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
