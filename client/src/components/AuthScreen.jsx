import { useState } from 'react';
import { register, login } from '../lib/api.js';

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = mode === 'register'
        ? await register(username, password)
        : await login(username, password);
      onAuth(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Vinay's Diabolical Tier List</h1>
        <p className="subtitle">Ranking the most unhinged reels this man has liked</p>

        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Hold on...' : mode === 'register' ? 'Create Account' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
