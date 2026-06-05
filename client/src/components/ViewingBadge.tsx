import { Link } from 'react-router-dom';

export default function ViewingBadge() {
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl bg-card/80 px-3 py-2 text-sm ring-1 ring-edge">
      <span className="text-muted">👀 You're viewing Rahul's board</span>
      <Link to="/log" className="text-xs text-ink/70 underline-offset-2 hover:underline">
        owner? log in
      </Link>
    </div>
  );
}
