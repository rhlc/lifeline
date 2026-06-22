import { Link } from 'react-router-dom';
import type { Profile } from '@lifeline/shared';
import { levelDef, levelProgress } from '@lifeline/shared';
import { Wordmark, Badge, ProgressBar, AsciiFlame } from './ui/index.js';

export default function HeaderStrip({ profile }: { profile: Profile }) {
  const def = levelDef(profile.level);
  const prog = levelProgress(profile.xp);
  const isMax = prog.ceil === prog.floor;

  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-line bg-card px-5 py-4 shadow-sm">
      <Wordmark variant="lockup" size="md" />

      <div className="flex items-center gap-2">
        <Badge tone="accent" glyph="●">
          lvl {def.level}
        </Badge>
        <span className="text-sm font-semibold lowercase text-ink">{def.name.toLowerCase()}</span>
      </div>

      <div className="flex min-w-[180px] flex-1 items-center gap-3">
        <div className="flex-1">
          <ProgressBar
            value={Math.round(prog.ratio * 100)}
            cells={18}
            tone="accent"
            brackets
            showValue={false}
          />
        </div>
        <div className="whitespace-nowrap text-xs tabular-nums text-muted">
          {isMax ? `${profile.xp} xp · max` : `${profile.xp} / ${prog.ceil}`}
        </div>
      </div>

      <AsciiFlame
        count={profile.current_streak}
        size="md"
        title={`current streak. longest: ${profile.longest_streak} · freezes left: ${profile.freezes_left_this_month}`}
      />

      <Link
        to="/tasks"
        className="rounded-full border border-transparent px-3 py-1 font-mono text-sm lowercase text-muted no-underline transition-colors hover:bg-card-2 hover:text-ink"
      >
        tasks →
      </Link>
    </header>
  );
}
