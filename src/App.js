import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import SignInPage from './components/auth/SignInPage';
import RegisterPage from './components/auth/RegisterPage';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Dashboard Pages
import DashboardPage from './components/dashboard/DashboardPage';
import VitalTasksPage from './components/tasks/VitalTasksPage';
import MyTasksPage from './components/tasks/MyTasksPage';
import TaskCategoriesPage from './components/categories/TaskCategoriesPage';
import CalendarPage from './components/calendar/CalendarPage';
import SettingsPage from './components/settings/SettingsPage';

// Auth Context
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SignInPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vital-tasks"
        element={
          <ProtectedRoute>
            <VitalTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tasks"
        element={
          <ProtectedRoute>
            <MyTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <TaskCategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all route - redirect to dashboard if authenticated, otherwise to login */}
      <Route
        path="*"
        element={
          <Navigate to="/dashboard" replace />
        }
      />
    </Routes>
  );
};

export default App; 