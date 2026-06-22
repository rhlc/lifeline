import { Link } from 'react-router-dom';
import { Badge } from './ui/index.js';

/** Top control strip on the public board: who you're viewing + a log-in link. */
export default function ViewingBadge() {
  return (
    <div className="mb-[18px] flex items-center justify-between">
      <Badge tone="neutral" glyph="◦">
        viewing rahul's board
      </Badge>
      <Link
        to="/log"
        className="rounded-md border border-line-2 bg-card px-3 py-1.5 text-sm lowercase text-ink no-underline transition-colors hover:bg-card-2 hover:border-muted"
      >
        /log in
      </Link>
    </div>
  );
}
