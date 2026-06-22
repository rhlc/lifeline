import { useState } from 'react';
import type { Board } from '@lifeline/shared';
import { useRewardMutations } from '../../api/queries.js';
import SlideOver from './SlideOver.js';
import { input as inputCls, primaryBtn, dangerBtn } from './ui.js';

export default function RewardsPanel({ board, open, onClose }: { board: Board; open: boolean; onClose: () => void }) {
  const { create, remove } = useRewardMutations();
  const [label, setLabel] = useState('');
  const [threshold, setThreshold] = useState<70 | 90>(70);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    create.mutate({ emoji: null, label: label.trim(), threshold }, { onSuccess: () => setLabel('') });
  };

  const base = board.rewards.filter((r) => r.threshold === 70);
  const bonus = board.rewards.filter((r) => r.threshold === 90);

  return (
    <SlideOver open={open} title="rewards" onClose={onClose}>
      <form onSubmit={add} className="mb-5 space-y-3">
        <input
          className={`${inputCls} w-full`}
          placeholder="reward you actually want"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <div className="flex gap-2">
          {([70, 90] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setThreshold(t)}
              className={`press focus-clay flex-1 rounded-md border px-2 py-1.5 text-sm lowercase ${
                threshold === t ? 'border-bonus bg-bonus-soft text-bonus' : 'border-line-2 text-ink-2 hover:bg-card-2'
              }`}
            >
              {t === 70 ? 'base · 70%' : 'bonus · 90%'}
            </button>
          ))}
        </div>
        <button type="submit" disabled={create.isPending} className={primaryBtn}>
          add reward
        </button>
      </form>

      <RewardList title="base · 70%" rewards={base} onRemove={(id) => remove.mutate(id)} />
      <RewardList title="bonus · 90%" rewards={bonus} onRemove={(id) => remove.mutate(id)} />
    </SlideOver>
  );
}

function RewardList({
  title,
  rewards,
  onRemove,
}: {
  title: string;
  rewards: Board['rewards'];
  onRemove: (id: number) => void;
}) {
  if (rewards.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-xs lowercase tracking-[0.06em] text-muted">{title}</h3>
      <div className="space-y-2">
        {rewards.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border border-line bg-card-2 px-3 py-2">
            <span className={`lowercase ${r.unlocked ? '' : 'text-ink-2'}`}>
              {r.label.toLowerCase()}{' '}
              {r.unlocked && <span className="ml-1 text-xs text-good">✓ unlocked</span>}
            </span>
            <button onClick={() => onRemove(r.id)} className={dangerBtn}>
              delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
