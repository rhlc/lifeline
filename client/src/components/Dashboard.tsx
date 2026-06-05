import { useEffect, useMemo, useRef, useState } from 'react';
import type { AnyBoard, DayInput } from '@lifeline/shared';
import { dayEngagement } from '@lifeline/shared';
import { useSaveDay } from '../api/queries.js';
import { todaysDraft } from '../lib/today.js';
import { pick } from '../lib/messages.js';
import HeaderStrip from './HeaderStrip.js';
import ViewingBadge from './ViewingBadge.js';
import TodayTiles from './TodayTiles.js';
import WorkBlocks from './WorkBlocks.js';
import DayStatus from './DayStatus.js';
import ContributionGrid from './ContributionGrid.js';
import MonthRing from './MonthRing.js';
import MoraleLine from './MoraleLine.js';
import NextReward from './NextReward.js';
import GoalsBars from './GoalsBars.js';
import ShareButton from './ShareButton.js';
import OwnerToolbar from './OwnerToolbar.js';
import Toast from './Toast.js';
import PrivacyMask from './PrivacyMask.js';
import MoneyStat from './MoneyStat.js';

export default function Dashboard({ board }: { board: AnyBoard }) {
  const isOwner = board.isOwner;
  const saveDay = useSaveDay();

  const [draft, setDraft] = useState<DayInput>(() => todaysDraft(board));
  const [toast, setToast] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  // Privacy mask for money + milestones — default hidden (nazar on) so a
  // screenshot/screen-share doesn't leak private numbers. Persisted locally.
  const [hidden, setHidden] = useState(() => localStorage.getItem('ll_reveal') !== '1');
  const toggleHidden = () =>
    setHidden((h) => {
      localStorage.setItem('ll_reveal', h ? '1' : '0');
      return !h;
    });

  // Resync the draft only when the calendar day changes (e.g. at midnight) —
  // otherwise the draft is client-owned and survives each auto-save round-trip.
  useEffect(() => {
    setDraft(todaysDraft(board));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.today]);

  const seed = useMemo(() => Number(board.today.replace(/-/g, '')) % 97, [board.today]);

  function runSave(next: DayInput, nudge?: string | null) {
    if (!isOwner) return;
    saveDay.mutate(
      { date: board.today, input: next },
      {
        onSuccess: (res) => {
          if (res.newlyUnlocked.length > 0) {
            const r = res.newlyUnlocked[0];
            setToast(`🎉 Reward unlocked: ${r.emoji ?? ''} ${r.label}!`);
          } else if (nudge !== undefined) {
            setToast(nudge ?? pick(res.messageKey, seed) ?? pick('lockedIn', seed));
          }
        },
        onError: () => setToast('⚠️ Could not save — are you still logged in? Try /log again.'),
      }
    );
  }

  /** A tap: update the UI instantly, then auto-save (debounced). */
  function onTap(next: DayInput) {
    setDraft(next);
    if (!isOwner) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => runSave(next), 350);
  }

  const engagement = dayEngagement(draft);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-12 pt-4 sm:px-6">
      {!isOwner && <ViewingBadge />}

      <HeaderStrip profile={board.profile} />

      {/* TODAY — the daily ritual */}
      <section className="mt-4 rounded-2xl bg-panel/70 p-4 shadow-lg ring-1 ring-edge sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Today
            {isOwner && saveDay.isPending && <span className="ml-2 text-[11px] normal-case text-muted">saving…</span>}
            {isOwner && !saveDay.isPending && <span className="ml-2 text-[11px] normal-case text-band-ontrack">auto-saved ✓</span>}
          </h2>
          {board.isOwner && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleHidden}
                title={hidden ? 'Reveal private numbers (money & milestones)' : 'Hide private numbers'}
                className={`rounded-lg px-2 py-1 text-base ring-1 ring-edge hover:bg-card ${hidden ? '' : 'bg-card'}`}
              >
                {hidden ? '🧿' : '👁️'}
              </button>
              <OwnerToolbar board={board} />
            </div>
          )}
        </div>

        <TodayTiles draft={draft} isOwner={isOwner} onChange={onTap} />

        <WorkBlocks
          blocks={draft.blocks}
          isOwner={isOwner}
          onChange={(blocks) => onTap({ ...draft, blocks })}
        />

        {isOwner && <DayStatus engagement={engagement} streak={board.profile.current_streak} />}
      </section>

      {/* THE GRID — the hero */}
      <section className="mt-5 rounded-2xl bg-panel/70 p-4 shadow-lg ring-1 ring-edge sm:p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">The Grid</h2>
        <ContributionGrid days={board.days} today={board.today} />
      </section>

      {/* Bottom row: month ring + morale + money, next reward, goals */}
      <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col rounded-2xl bg-panel/70 p-4 ring-1 ring-edge">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">This Month</h3>
          <MonthRing pct={board.monthPct} band={board.monthBand} />
          <MoraleLine days={board.days} />
          {board.isOwner && (
            <div className="mt-auto">
              <PrivacyMask hidden={hidden} label="money · hidden">
                <MoneyStat board={board} />
              </PrivacyMask>
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-panel/70 p-4 ring-1 ring-edge">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Next Reward</h3>
          <NextReward rewards={board.rewards} monthPct={board.monthPct} />
        </div>
        <div className="flex flex-col rounded-2xl bg-panel/70 p-4 ring-1 ring-edge">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Goals</h3>
          <div className="flex flex-1 flex-col">
            {board.isOwner ? (
              <PrivacyMask hidden={hidden} label="milestones · hidden">
                <GoalsBars goals={board.goals} />
              </PrivacyMask>
            ) : (
              <GoalsBars goals={board.goals} />
            )}
          </div>
        </div>
      </section>

      {board.isOwner && (
        <div className="mt-5 flex justify-end">
          <ShareButton board={board} />
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
