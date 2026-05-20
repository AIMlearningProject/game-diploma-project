import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';

export default function Navigation() {
  const { user, logout } = useAuthStore();
  const { boardPosition } = useGameStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-primary-600">📚 Lukudiplomi</Link>
            <Link to="/" className="text-sm font-medium hover:text-primary-600 transition-colors">Etusivu</Link>
            <Link to="/game" className="text-sm font-medium hover:text-primary-600 transition-colors">🎮 Pelaa</Link>
            <Link to="/log-book" className="text-sm font-medium hover:text-primary-600 transition-colors">📖 Kirjaa kirja</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
              Ruutu {boardPosition}/49
            </span>
            <span className="text-sm text-gray-600 hidden md:block">{user?.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary text-sm py-1">
              Kirjaudu ulos
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
