import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { ACHIEVEMENTS } from '../utils/gameLogic';

const BOARD_LEN = 50;

export default function StudentDashboard() {
  const { user }  = useAuthStore();
  const store     = useGameStore();

  const {
    boardPosition, xp, level, streak, longestStreak,
    readingHistory, unlockedAchievements,
  } = store;

  const totalPages   = readingHistory.reduce((s, b) => s + (b.pages || 0), 0);
  const uniqueGenres = new Set(readingHistory.map(b => b.genre)).size;
  const progressPct  = Math.round((boardPosition / (BOARD_LEN - 1)) * 100);
  const earned       = ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id));
  const recentBooks  = readingHistory.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="mb-1">Hei, {user?.name}! 👋</h1>
      <p className="text-gray-500 mb-8 text-sm">Jatka lukemista — diplomi on lähellä!</p>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-sm">Lukumatka: ruutu {boardPosition} / {BOARD_LEN - 1}</span>
          <span className="text-sm text-primary-600 font-bold">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-primary-500 h-4 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {BOARD_LEN - 1 - boardPosition} ruutua jäljellä diplomiin 🏆
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Sijainti', value: `${boardPosition}/49`, icon: '📍', color: 'text-blue-600' },
          { label: 'Putki',    value: `${streak} pv`,        icon: '🔥', color: 'text-orange-500' },
          { label: 'XP / Taso',value: `${xp} / ${level}`,   icon: '⭐', color: 'text-purple-600' },
          { label: 'Kirjoja',  value: readingHistory.length, icon: '📚', color: 'text-green-600'  },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card text-center py-4">
            <div className="text-3xl mb-1">{icon}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="mb-4">Pikavalinnat</h2>
          <div className="space-y-3">
            <Link to="/game" className="btn btn-primary w-full block text-center py-3 text-base">
              🎮 Jatka pelaamista
            </Link>
            <Link to="/log-book" className="btn btn-secondary w-full block text-center py-3 text-base">
              📖 Kirjaa uusi kirja
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
            <div>📄 {totalPages} sivua</div>
            <div>🌈 {uniqueGenres} genreä</div>
            <div>🏅 {longestStreak} pv paras putki</div>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4">Saavutukset</h2>
          {earned.length === 0 ? (
            <p className="text-gray-500 text-sm">Kirjaa ensimmäinen kirjasi saadaksesi saavutuksia!</p>
          ) : (
            <div className="space-y-2">
              {earned.slice(0, 4).map(a => (
                <div key={a.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.description}</p>
                  </div>
                </div>
              ))}
              {earned.length > 4 && (
                <p className="text-xs text-gray-500 text-center">+{earned.length - 4} lisää</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reading history */}
      <div className="card">
        <h2 className="mb-4">Viimeisimmät kirjat</h2>
        {recentBooks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📖</div>
            <p className="text-gray-500">Et ole vielä kirjannut kirjoja.</p>
            <Link to="/log-book" className="btn btn-primary mt-4 inline-block">
              Kirjaa ensimmäinen kirja →
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentBooks.map((b, i) => (
              <div key={i} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{b.title}</p>
                  <p className="text-sm text-gray-500">{b.author} · {b.pages} s · {b.genre}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(b.loggedAt).toLocaleDateString('fi-FI')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+{b.steps} askelta</p>
                  <p className="text-xs text-purple-600">+{b.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
