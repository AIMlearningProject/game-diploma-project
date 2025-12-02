import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import GamePage from './pages/GamePage';
import BookLog from './pages/BookLog';
import Profile from './pages/Profile';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen">
      {isAuthenticated && <Navigation />}

      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } />

        <Route path="/" element={
          <ProtectedRoute>
            {user?.role === 'STUDENT' ? <StudentDashboard /> : <TeacherDashboard />}
          </ProtectedRoute>
        } />

        <Route path="/game" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <GamePage />
          </ProtectedRoute>
        } />

        <Route path="/log-book" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <BookLog />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
