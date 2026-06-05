import type { Profile } from '@lifeline/shared';
import { levelDef, levelProgress } from '@lifeline/shared';

export default function HeaderStrip({ profile }: { profile: Profile }) {
  const def = levelDef(profile.level);
  const prog = levelProgress(profile.xp);
  const isMax = prog.ceil === prog.floor;

  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl bg-gradient-to-r from-card to-panel px-4 py-2 shadow-lg ring-1 ring-edge sm:px-5">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{def.emoji}</span>
        <div className="leading-tight">
          <div className="text-[11px] uppercase tracking-wider text-muted">Lvl {def.level}</div>
          <div className="text-sm font-semibold">{def.name}</div>
        </div>
      </div>

      <div className="flex min-w-[180px] flex-1 items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-edge">
          <div
            className="h-full rounded-full bg-gradient-to-r from-band-ontrack to-grid-4 transition-[width] duration-500"
            style={{ width: `${Math.round(prog.ratio * 100)}%` }}
          />
        </div>
        <div className="whitespace-nowrap text-xs text-muted">
          {isMax ? `${profile.xp} XP · MAX` : `${profile.xp} / ${prog.ceil}`}
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 text-lg font-bold"
        title={`Current streak. Longest: ${profile.longest_streak} · Freezes left: ${profile.freezes_left_this_month}`}
      >
        <span className={profile.current_streak > 0 ? '' : 'opacity-40 grayscale'}>🔥</span>
        <span>{profile.current_streak}</span>
      </div>
    </header>
  );
}
