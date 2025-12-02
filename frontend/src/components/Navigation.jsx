import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

function Navigation() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Lukudiplomi
            </Link>

            <div className="ml-10 flex space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                Etusivu
              </Link>

              {user?.role === 'STUDENT' && (
                <>
                  <Link to="/game" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                    Pelaa
                  </Link>
                  <Link to="/log-book" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                    Kirjaa kirja
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.name}
            </span>
            <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-md text-xs font-medium">
              {user?.role === 'STUDENT' ? 'Oppilas' : user?.role === 'TEACHER' ? 'Opettaja' : 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              Kirjaudu ulos
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
