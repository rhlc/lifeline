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
import BoardTasks from './BoardTasks.js';
import MonthRing from './MonthRing.js';
import MoraleLine from './MoraleLine.js';
import NextReward from './NextReward.js';
import GoalsBars from './GoalsBars.js';
import ShareButton from './ShareButton.js';
import OwnerToolbar from './OwnerToolbar.js';
import Toast from './Toast.js';
import PrivacyMask from './PrivacyMask.js';
import MoneyStat from './MoneyStat.js';
import { Card, Badge, AsciiSpinner } from './ui/index.js';

export default function Dashboard({ board }: { board: AnyBoard }) {
  const isOwner = board.isOwner;
  const saveDay = useSaveDay();

  const [draft, setDraft] = useState<DayInput>(() => todaysDraft(board));
  const [toast, setToast] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  // privacy mask for money + milestones — default hidden so a screenshot /
  // screen-share doesn't leak private numbers. persisted locally.
  const [hidden, setHidden] = useState(() => localStorage.getItem('ll_reveal') !== '1');
  const toggleHidden = () =>
    setHidden((h) => {
      localStorage.setItem('ll_reveal', h ? '1' : '0');
      return !h;
    });

  // resync the draft only when the calendar day changes (e.g. at midnight) —
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
            setToast(`★ reward unlocked: ${r.label.toLowerCase()}!`);
          } else if (nudge !== undefined) {
            setToast(nudge ?? pick(res.messageKey, seed) ?? pick('lockedIn', seed));
          }
        },
        onError: () => setToast('△ could not save — are you still logged in? try /log again.'),
      }
    );
  }

  /** a tap: update the UI instantly, then auto-save (debounced). */
  function onTap(next: DayInput) {
    setDraft(next);
    if (!isOwner) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => runSave(next), 350);
  }

  const engagement = dayEngagement(draft);

  return (
    <div className="paper-grain mx-auto flex min-h-screen max-w-board flex-col gap-[18px] px-[18px] pb-14 pt-5">
      {!isOwner && <ViewingBadge />}

      <HeaderStrip profile={board.profile} />

      {/* today — the daily ritual */}
      <Card
        label="today"
        action={
          isOwner ? (
            <div className="flex items-center gap-2">
              {saveDay.isPending ? (
                <AsciiSpinner variant="blocks" label="saving…" />
              ) : (
                <span className="text-xs lowercase text-good">auto-saved ✓</span>
              )}
              <button
                onClick={toggleHidden}
                title={hidden ? 'reveal private numbers (money & milestones)' : 'hide private numbers'}
                className="press focus-clay rounded-md border border-line-2 bg-card px-2 py-1 font-mono text-xs lowercase text-ink-2 hover:bg-card-2"
              >
                {hidden ? 'reveal' : 'hide'}
              </button>
              <OwnerToolbar board={board} />
            </div>
          ) : (
            <Badge tone="neutral">read-only</Badge>
          )
        }
      >
        <TodayTiles draft={draft} isOwner={isOwner} onChange={onTap} />

        <WorkBlocks blocks={draft.blocks} isOwner={isOwner} onChange={(blocks) => onTap({ ...draft, blocks })} />

        {isOwner && <DayStatus engagement={engagement} streak={board.profile.current_streak} />}
      </Card>

      {/* tasks — quick capture + what's active (replaces the contribution grid) */}
      <BoardTasks board={board} />

      {/* bottom row: this month + morale + money, next reward, goals */}
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
        <Card label="this month" className="flex flex-col">
          <MonthRing pct={board.monthPct} band={board.monthBand} />
          <MoraleLine days={board.days} />
          {board.isOwner && (
            <div className="mt-auto">
              <PrivacyMask hidden={hidden} label="money · hidden">
                <MoneyStat board={board} />
              </PrivacyMask>
            </div>
          )}
        </Card>

        <Card label="next reward">
          <NextReward rewards={board.rewards} monthPct={board.monthPct} />
        </Card>

        <Card label="goals" className="flex flex-col">
          <div className="flex flex-1 flex-col">
            {board.isOwner ? (
              <PrivacyMask hidden={hidden} label="milestones · hidden">
                <GoalsBars goals={board.goals} />
              </PrivacyMask>
            ) : (
              <GoalsBars goals={board.goals} />
            )}
          </div>
        </Card>
      </div>

      {board.isOwner && (
        <div className="flex justify-end">
          <ShareButton board={board} />
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
