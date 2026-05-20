import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { ACHIEVEMENTS } from '../utils/gameLogic';
import GameEngine from '../phaser/GameEngine';

export default function GamePage() {
  const { user }  = useAuthStore();
  const store     = useGameStore();
  const { boardPosition, xp, level, streak, readingHistory, pendingSteps, clearPendingSteps } = store;

  const containerRef = useRef(null);
  const engineRef    = useRef(null);
  const [toast,        setToast]   = useState(null);
  const [diplomaModal, setDiploma] = useState(false);

  const showToast = useCallback((msg, color = 'bg-primary-600') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const buildState = () => ({
    position: boardPosition, xp, level, streak,
    books: readingHistory.length,
    pages: readingHistory.reduce((s, b) => s + (b.pages || 0), 0),
  });

  // Mount Phaser once
  useEffect(() => {
    if (!containerRef.current || engineRef.current) return;
    engineRef.current = new GameEngine(containerRef.current, buildState());
    engineRef.current.on('diploma-reached', () => setDiploma(true));
    return () => { engineRef.current?.destroy(); engineRef.current = null; };
  }, []); // eslint-disable-line

  // Keep stats panel in sync
  useEffect(() => {
    engineRef.current?.syncState(buildState());
  }, [boardPosition, xp, level, streak, readingHistory.length]); // eslint-disable-line

  // Animate movement when a book is logged
  useEffect(() => {
    if (pendingSteps > 0 && engineRef.current) {
      const steps = pendingSteps;
      clearPendingSteps();
      showToast(`🎲 Liikut ${steps} askelta!`);
      setTimeout(() => engineRef.current?.movePlayer(steps), 700);
    }
  }, [pendingSteps]); // eslint-disable-line

  const recentAch = ACHIEVEMENTS.filter(a => store.unlockedAchievements.includes(a.id)).slice(-3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">🗺️ Lukumatka</h1>
        <Link to="/log-book" className="btn btn-primary">📖 Kirjaa kirja</Link>
      </div>

      {toast && (
        <div className={`${toast.color} text-white text-center py-2 px-4 rounded-lg mb-4 text-sm font-medium`}>
          {toast.msg}
        </div>
      )}

      {/* Game canvas */}
      <div ref={containerRef} className="w-full rounded-xl overflow-hidden shadow-lg mb-6"
        style={{ aspectRatio: '876/540' }} />

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: '📍', label: 'Ruutu',  value: `${boardPosition}/49` },
          { icon: '⭐', label: 'XP',      value: xp },
          { icon: '🔥', label: 'Putki',   value: `${streak} pv` },
          { icon: '📚', label: 'Kirjoja', value: readingHistory.length },
        ].map(({ icon, label, value }) => (
          <div key={label} className="card py-3 text-center">
            <div className="text-xl">{icon}</div>
            <div className="font-bold text-primary-600">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Guide */}
      <div className="card">
        <h3 className="mb-3">Pelin ohjeet</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            { icon: '📖', title: 'Liikkuminen',    text: 'Kirjaa kirja → saat askelia' },
            { icon: '⭐', title: 'Bonus-ruutu',     text: 'Ylimääräisiä tähtiä!' },
            { icon: '📍', title: 'Tarkistuspiste',  text: 'Hyvää edistymistä!' },
            { icon: '📚', title: 'Kirjaportti',     text: 'Kokeile eri genreä!' },
            { icon: '⚡', title: 'Haaste-ruutu',    text: 'Enemmän XP riskistä!' },
            { icon: '🏆', title: 'Tavoite',         text: 'Ruutu 49 = Diplomi!' },
          ].map(({ icon, title, text }) => (
            <div key={title} className="flex items-start gap-2">
              <span className="text-lg">{icon}</span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-gray-500 text-xs">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {recentAch.length > 0 && (
        <div className="card mt-4">
          <h3 className="mb-3">Viimeisimmät saavutukset</h3>
          <div className="flex gap-3 flex-wrap">
            {recentAch.map(a => (
              <div key={a.id} className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-full text-sm">
                <span>{a.icon}</span><span className="font-medium">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diploma modal */}
      {diplomaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-yellow-700 mb-2">Lukudiplomi saavutettu!</h2>
            <p className="text-gray-600 mb-6">Hieno suoritus, {user?.name}!</p>
            <div className="flex gap-3">
              <button onClick={() => { setDiploma(false); store.resetGame(); }}
                className="btn btn-secondary flex-1">Aloita alusta</button>
              <Link to="/" className="btn btn-primary flex-1">Etusivulle</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
