import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../api/queries.js';
import { Wordmark, Button } from '../components/ui/index.js';
import { input as inputCls } from '../components/panels/ui.js';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const login = useLogin();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(password, { onSuccess: () => navigate('/') });
  };

  return (
    <div className="paper-grain flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="flex w-full max-w-[340px] flex-col gap-4 rounded-lg border border-line bg-card p-7 shadow-sm"
      >
        <div className="flex justify-center">
          <Wordmark variant="lockup" size="lg" />
        </div>
        <p className="text-center text-sm lowercase text-muted">owner login · bas chalte raho</p>

        <input
          type="password"
          autoFocus
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputCls} w-full`}
        />

        {login.isError && (
          <div className="text-sm lowercase text-warn">
            {((login.error as Error).message || 'login failed').toLowerCase()}
          </div>
        )}

        <Button type="submit" variant="primary" full disabled={login.isPending}>
          {login.isPending ? 'checking…' : 'log in'}
        </Button>

        <Link to="/" className="block text-center text-xs lowercase text-muted no-underline hover:text-ink-2">
          ← back to the board
        </Link>
      </form>
    </div>
  );
}
