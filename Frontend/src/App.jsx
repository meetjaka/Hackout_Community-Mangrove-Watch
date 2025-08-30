import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ReportsPage from './pages/Reports/ReportsPage';
import SubmitReportPage from './pages/Reports/SubmitReportPage';
import ReportDetailPage from './pages/Reports/ReportDetailPage';
import CommunityPage from './pages/Community/CommunityPage';
import LeaderboardPage from './pages/Gamification/LeaderboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminPage from './pages/Admin/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
              <Layout>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports/submit" element={
                    <ProtectedRoute>
                      <SubmitReportPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports/:id" element={
                    <ProtectedRoute>
                      <ReportDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/community" element={
                    <ProtectedRoute>
                      <CommunityPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/leaderboard" element={
                    <ProtectedRoute>
                      <LeaderboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
