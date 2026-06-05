import { forwardRef } from 'react';
import type { Board } from '@lifeline/shared';
import { levelDef } from '@lifeline/shared';
import { bandLabel } from '../lib/bands.js';
import { pick } from '../lib/messages.js';
import ContributionGrid from './ContributionGrid.js';

/** Chrome-free, square-ish, screenshot-ready card (spec §7). No money. */
const ShareCard = forwardRef<HTMLDivElement, { board: Board }>(({ board }, ref) => {
  const def = levelDef(board.profile.level);
  const flavor = pick(board.monthBand === 'bonus' ? 'month90' : board.monthBand === 'ontrack' ? 'onTrack' : 'warn');

  return (
    <div
      ref={ref}
      className="flex w-[420px] flex-col gap-5 rounded-3xl p-7 text-ink"
      style={{ background: 'linear-gradient(160deg, #1b2433 0%, #0d1118 100%)' }}
    >
      <div className="flex items-center justify-between">
        <div className="text-lg font-extrabold tracking-tight">LIFELINE</div>
        <div className="text-sm text-muted">{board.today}</div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span>{def.emoji}</span>
            <span>{def.name}</span>
          </div>
          <div className="mt-1 text-sm text-muted">Lvl {def.level} · {board.profile.xp} XP</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black">🔥 {board.profile.current_streak}</div>
          <div className="text-xs text-muted">day streak</div>
        </div>
      </div>

      <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-edge">
        <ContributionGrid days={board.days} today={board.today} weeks={20} fixedCell={11} />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-3xl font-black">{board.monthPct}%</div>
        <div className="text-sm font-semibold">{bandLabel(board.monthBand)}</div>
      </div>

      <div className="border-t border-edge pt-3 text-sm italic text-muted">
        “{flavor}”
        <div className="mt-1 text-right text-xs not-italic text-ink/60">rahulc.xyz</div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
export default ShareCard;
