import { Link } from 'react-router-dom';
import { Wordmark } from './ui/index.js';

const pill = (active: boolean) =>
  `rounded-full border px-3 py-1 font-mono text-sm lowercase no-underline transition-colors ${
    active
      ? 'border-clay/30 bg-clay-tint text-clay-deep'
      : 'border-transparent text-muted hover:bg-card-2 hover:text-ink'
  }`;

/** Top nav for the standalone pages: wordmark + board / tasks pills. */
export default function PageNav({ active }: { active: 'board' | 'tasks' }) {
  return (
    <nav className="mb-[18px] flex flex-wrap items-center gap-4 rounded-lg border border-line bg-card px-4 py-3 shadow-sm">
      <Wordmark variant="lockup" size="sm" />
      <div className="ml-auto flex gap-1">
        <Link to="/" className={pill(active === 'board')}>
          board
        </Link>
        <Link to="/tasks" className={pill(active === 'tasks')}>
          tasks
        </Link>
      </div>
    </nav>
  );
}
