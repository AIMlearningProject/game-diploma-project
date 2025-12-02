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
      console.error('Virhe haettaessa tietoja:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Ladataan...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-8">Tervetuloa takaisin, {user?.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600 mb-2">Sijaintisi</h3>
          <p className="text-3xl font-bold text-primary-600">
            {gameState?.boardPosition || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 mb-2">Putki</h3>
          <p className="text-3xl font-bold text-green-600">
            {gameState?.streak || 0} päivää
          </p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 mb-2">Pisteet / Taso</h3>
          <p className="text-3xl font-bold text-purple-600">
            {gameState?.xp || 0} / Taso {gameState?.level || 1}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="mb-4">Pikavalinnat</h2>
          <div className="space-y-2">
            <Link to="/game" className="btn btn-primary w-full block text-center">
              Jatka pelaamista
            </Link>
            <Link to="/log-book" className="btn btn-secondary w-full block text-center">
              Kirjaa uusi kirja
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4">Viimeisimmät saavutukset</h2>
          {achievements.length === 0 ? (
            <p className="text-gray-600">Ei vielä saavutuksia. Jatka lukemista!</p>
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
        <h2 className="mb-4">Viimeisimmät kirjat</h2>
        {recentBooks.length === 0 ? (
          <p className="text-gray-600">Et ole vielä kirjannut kirjoja. Aloita lukeminen!</p>
        ) : (
          <div className="space-y-3">
            {recentBooks.map((log) => (
              <div key={log.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">{log.book.title}</p>
                  <p className="text-sm text-gray-600">kirjoittanut {log.book.author}</p>
                  <p className="text-xs text-gray-500">{log.pagesRead} sivua</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    +{log.stepsAwarded} askelta
                  </p>
                  <p className="text-xs text-purple-600">
                    +{log.pointsAwarded} pistettä
                  </p>
                  {log.verifiedByTeacher ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Vahvistettu
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Odottaa
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
