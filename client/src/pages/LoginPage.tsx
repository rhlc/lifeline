import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../api/queries.js';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const login = useLogin();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(password, { onSuccess: () => navigate('/') });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-panel p-6 shadow-xl ring-1 ring-edge">
        <div className="mb-1 text-center text-4xl">🔥</div>
        <h1 className="mb-1 text-center text-xl font-bold">LIFELINE</h1>
        <p className="mb-5 text-center text-sm text-muted">Owner login · bas chalte raho</p>

        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-card px-3 py-2.5 text-ink ring-1 ring-edge focus:outline-none focus:ring-ink/40"
        />

        {login.isError && (
          <div className="mt-2 text-sm text-band-warn">
            {(login.error as Error).message || 'Login failed'}
          </div>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="mt-4 w-full rounded-xl bg-band-ontrack px-4 py-2.5 font-semibold text-black disabled:opacity-60"
        >
          {login.isPending ? 'Checking…' : 'Log in'}
        </button>

        <Link to="/" className="mt-4 block text-center text-xs text-muted hover:underline">
          ← back to the board
        </Link>
      </form>
    </div>
  );
}
