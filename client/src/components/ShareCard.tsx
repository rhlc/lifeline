import { forwardRef } from 'react';
import type { Board } from '@lifeline/shared';
import { levelDef } from '@lifeline/shared';
import { bandLabel } from '../lib/bands.js';
import { pick } from '../lib/messages.js';
import ContributionGrid from './ContributionGrid.js';
import { Wordmark, AsciiFlame, Badge } from './ui/index.js';

/** Chrome-free, screenshot-ready card on warm paper. lowercase, no money. */
const ShareCard = forwardRef<HTMLDivElement, { board: Board }>(({ board }, ref) => {
  const def = levelDef(board.profile.level);
  const flavor = pick(
    board.monthBand === 'bonus' ? 'month90' : board.monthBand === 'ontrack' ? 'onTrack' : 'warn'
  );

  return (
    <div
      ref={ref}
      className="paper-grain flex w-[420px] flex-col gap-5 p-7 text-ink"
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--r-xl)',
      }}
    >
      <div className="flex items-center justify-between">
        <Wordmark variant="lockup" size="md" />
        <div className="text-sm tabular-nums text-muted">{board.today}</div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="accent" glyph="●">
              lvl {def.level}
            </Badge>
          </div>
          <div className="mt-2 text-lg font-bold lowercase text-ink">{def.name.toLowerCase()}</div>
          <div className="mt-0.5 text-xs lowercase text-muted">{board.profile.xp} xp</div>
        </div>
        <div className="text-right">
          <AsciiFlame count={board.profile.current_streak} size="lg" />
          <div className="mt-1 text-xs lowercase text-muted">day streak</div>
        </div>
      </div>

      <div
        className="p-4"
        style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' }}
      >
        <ContributionGrid days={board.days} today={board.today} weeks={20} fixedCell={11} />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-3xl font-black tabular-nums text-ink">{board.monthPct}%</div>
        <div className="text-sm font-semibold lowercase" style={{ color: 'var(--clay-deep)' }}>
          {bandLabel(board.monthBand)}
        </div>
      </div>

      <div className="border-t border-line pt-3 text-sm lowercase text-ink-2">
        “{flavor}”
        <div className="mt-1 text-right text-xs text-muted">rahulc.xyz</div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
export default ShareCard;
