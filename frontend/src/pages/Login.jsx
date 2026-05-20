import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';

const GRADES = [1,2,3,4,5,6,7,8,9];

export default function Login() {
  const [name, setName]   = useState('');
  const [grade, setGrade] = useState(4);
  const [error, setError] = useState('');

  const { login }     = useAuthStore();
  const { resetGame } = useGameStore();
  const navigate      = useNavigate();

  const handleStart = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Anna nimesi ensin.'); return; }
    resetGame();
    login(name.trim(), grade);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="card max-w-md w-full text-center">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="mb-2">Lukudiplomi</h1>
        <p className="text-gray-600 mb-8 text-sm">
          Lue kirjoja, kerää askelia ja saavuta diplomi!
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-5 text-left">
          <div>
            <label className="block text-sm font-medium mb-1">Nimesi</label>
            <input
              className="input"
              placeholder="Etunimi Sukunimi"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Luokka-aste</label>
            <select
              className="input"
              value={grade}
              onChange={e => setGrade(Number(e.target.value))}
            >
              {GRADES.map(g => (
                <option key={g} value={g}>{g}. luokka</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-full text-lg py-3">
            🚀 Aloita lukuseikkailu!
          </button>
        </form>

        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '📖', label: 'Kirjaa kirjoja' },
            { icon: '🎲', label: 'Liiku laudalla' },
            { icon: '🏆', label: 'Voita diplomi' },
          ].map(({ icon, label }) => (
            <div key={label} className="bg-primary-50 rounded-lg p-3">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs text-primary-700 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
