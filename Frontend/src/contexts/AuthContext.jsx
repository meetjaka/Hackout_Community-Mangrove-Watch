import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
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
  
  // Add rate limiting protection
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests (reduced from 2)
  
  const checkRateLimit = () => {
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      const remainingTime = MIN_REQUEST_INTERVAL - (now - lastRequestTime);
      const seconds = Math.ceil(remainingTime / 1000);
      
      // Start countdown
      setRateLimitCountdown(seconds);
      
      // More user-friendly message
      if (seconds === 1) {
        toast.error('Please wait 1 second before trying again.');
      } else {
        toast.error(`Please wait ${seconds} seconds before trying again.`);
      }
      
      // Clear countdown after delay
      setTimeout(() => {
        setRateLimitCountdown(0);
      }, remainingTime);
      
      return false;
    }
    setLastRequestTime(now);
    setRateLimitCountdown(0);
    return true;
  };
  
  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication state...');
      console.log('🔍 Current token:', state.token);
      
      if (state.token) {
        try {
          console.log('🔍 Token found, checking with backend...');
          const response = await authAPI.getCurrentUser();
          console.log('🔍 Backend auth check successful:', response.data);
          
          // Backend returns data in nested structure: { success: true, data: { user } }
          if (response.data.success && response.data.data && response.data.data.user) {
            const user = response.data.data.user;
            console.log('🔍 User data extracted:', user);
            
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token: state.token },
            });
            console.log('🔍 Authentication state updated to SUCCESS');
          } else {
            console.error('🔍 Invalid response format from getCurrentUser:', response.data);
            throw new Error('Invalid response format from getCurrentUser');
          }
        } catch (error) {
          console.error('🔍 Auth check error:', error);
          // If there's a network error (backend not running), just set loading to false
          if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
            console.log('🔍 Network error, setting auth to failure');
            dispatch({ type: 'AUTH_FAILURE', payload: null });
          } else {
            console.log('🔍 Other error, removing token and setting auth to failure');
            localStorage.removeItem('token');
            dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
          }
        }
      } else {
        console.log('🔍 No token found, setting auth to failure');
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
    console.log('🔐 Login attempt started');
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.login(credentials);
      console.log('🔐 Login response:', response.data);
      
      // Backend returns data in nested structure: { success: true, data: { user, token } }
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        if (user && token) {
          console.log('🔐 Login successful, dispatching AUTH_SUCCESS');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token },
          });
          
          // Store token immediately
          localStorage.setItem('token', token);
          console.log('🔐 Token stored in localStorage');
          
          toast.success('Login successful!');
          navigate('/dashboard');
          return { success: true };
        } else {
          console.error('🔐 Missing user or token in response data');
          throw new Error('Invalid response format from server');
        }
      } else {
        console.error('🔐 Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('🔐 Login error:', error);
      
      // Handle specific HTTP status codes
      if (error.response?.status === 429) {
        const message = 'Too many requests. Please wait a moment and try again.';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
        return { success: false, error: message };
      } else if (error.response?.status === 401) {
        const message = 'Invalid email or password. Please try again.';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
        return { success: false, error: message };
      } else if (error.response?.status === 500) {
        const message = 'Server error. Please try again later.';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
        return { success: false, error: message };
      } else {
        const message = error.response?.data?.message || error.message || 'Login failed';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
        return { success: false, error: message };
      }
    }
  };

  const register = async (userData) => {
    console.log('🔐 Registration attempt started');
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.register(userData);
      console.log('🔐 Registration response:', response.data);
      
      // Backend returns data in nested structure: { success: true, data: { user, token } }
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        if (user && token) {
          console.log('🔐 Registration successful, dispatching AUTH_SUCCESS');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token },
          });
          
          // Store token immediately
          localStorage.setItem('token', token);
          console.log('🔐 Token stored in localStorage');
          
          toast.success('Registration successful! Welcome to Community Mangrove Watch!');
          navigate('/dashboard');
          return { success: true };
        } else {
          console.error('🔐 Missing user or token in response data');
          throw new Error('Invalid response format from server');
        }
      } else {
        console.error('🔐 Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('🔐 Registration error:', error);
      
      // Handle specific HTTP status codes
      if (error.response?.status === 429) {
        const message = 'Too many requests. Please wait a moment and try again.';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
        return { success: false, error: message };
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Invalid registration data. Please check your information.';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
        return { success: false, error: message };
      } else if (error.response?.status === 409) {
        const message = 'User already exists with this email or phone number.';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
        return { success: false, error: message };
      } else if (error.response?.status === 500) {
        const message = 'Server error. Please try again later.';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
        return { success: false, error: message };
      } else {
        const message = error.response?.data?.message || error.message || 'Registration failed';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
        return { success: false, error: message };
      }
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
    rateLimitCountdown, // Add this so components can show countdown
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
