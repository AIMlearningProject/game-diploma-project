import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register({ name, email, password, role: 'STUDENT' });
      }

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Odottamaton virhe tapahtui');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="card max-w-md w-full">
        <h1 className="text-center mb-6">
          {isLogin ? 'Kirjaudu sisään' : 'Rekisteröidy'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Nimi</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                placeholder="Etunimi Sukunimi"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Sähköposti</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="oppilas@koulu.fi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Salasana</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Salasana"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Ladataan...' : isLogin ? 'Kirjaudu' : 'Rekisteröidy'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            {isLogin ? 'Tarvitsetko tunnuksen? Rekisteröidy' : 'Onko sinulla jo tunnus? Kirjaudu'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Tai kirjaudu:</p>
          <div className="flex gap-2 justify-center">
            <button className="btn btn-secondary flex-1">
              Google
            </button>
            <button className="btn btn-secondary flex-1">
              Microsoft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
