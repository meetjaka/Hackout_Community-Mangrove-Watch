import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await authAPI.getCurrentUser();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: response.data, token: state.token },
          });
        } catch (error) {
          // If there's a network error (backend not running), just set loading to false
          if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
            dispatch({ type: 'AUTH_FAILURE', payload: null });
          } else {
            localStorage.removeItem('token');
            dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
          }
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Store token in localStorage when it changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
    }
  }, [state.token]);

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.login(credentials);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response.data,
      });
      toast.success('Login successful!');
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.register(userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response.data,
      });
      toast.success('Registration successful! Welcome to Community Mangrove Watch!');
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      dispatch({ type: 'UPDATE_USER', payload: response.data });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasRole = (requiredRole) => {
    if (!state.user) return false;
    return state.user.role === requiredRole || state.user.role === 'super_admin';
  };

  const hasPermission = (permission) => {
    if (!state.user) return false;
    return state.user.permissions?.includes(permission) || state.user.role === 'super_admin';
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
