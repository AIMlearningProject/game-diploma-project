import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

import Login            from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import GamePage         from './pages/GamePage';
import BookLog          from './pages/BookLog';
import ProtectedRoute   from './components/ProtectedRoute';
import Navigation       from './components/Navigation';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen">
      {isAuthenticated && <Navigation />}
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/log-book" element={<ProtectedRoute><BookLog /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
