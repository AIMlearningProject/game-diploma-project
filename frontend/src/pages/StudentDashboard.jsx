import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../stores/authStore';

function StudentDashboard() {
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [stateRes, historyRes, achievementsRes] = await Promise.all([
        api.get(`/students/${user.id}/state`),
        api.get(`/students/${user.id}/history?limit=5`),
        api.get(`/students/${user.id}/achievements`),
      ]);

      setGameState(stateRes.data.gameState);
      setRecentBooks(historyRes.data.logs);
      setAchievements(achievementsRes.data.unlocked);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-8">Welcome back, {user?.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600 mb-2">Board Position</h3>
          <p className="text-3xl font-bold text-primary-600">
            {gameState?.boardPosition || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 mb-2">Current Streak</h3>
          <p className="text-3xl font-bold text-green-600">
            {gameState?.streak || 0} days
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 mb-2">XP / Level</h3>
          <p className="text-3xl font-bold text-purple-600">
            {gameState?.xp || 0} / Lv {gameState?.level || 1}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/game" className="btn btn-primary w-full block text-center">
              Continue Playing
            </Link>
            <Link to="/log-book" className="btn btn-secondary w-full block text-center">
              Log a New Book
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4">Recent Achievements</h2>
          {achievements.length === 0 ? (
            <p className="text-gray-600">No achievements yet. Keep reading!</p>
          ) : (
            <div className="space-y-2">
              {achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="mb-4">Recent Books</h2>
        {recentBooks.length === 0 ? (
          <p className="text-gray-600">No books logged yet. Start reading!</p>
        ) : (
          <div className="space-y-3">
            {recentBooks.map((log) => (
              <div key={log.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">{log.book.title}</p>
                  <p className="text-sm text-gray-600">by {log.book.author}</p>
                  <p className="text-xs text-gray-500">{log.pagesRead} pages</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    +{log.stepsAwarded} steps
                  </p>
                  <p className="text-xs text-purple-600">
                    +{log.pointsAwarded} XP
                  </p>
                  {log.verifiedByTeacher ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
