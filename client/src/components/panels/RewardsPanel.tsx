import { useState } from 'react';
import type { Board } from '@lifeline/shared';
import { useRewardMutations } from '../../api/queries.js';
import SlideOver from './SlideOver.js';
import { input as inputCls, primaryBtn, dangerBtn } from './ui.js';

export default function RewardsPanel({ board, open, onClose }: { board: Board; open: boolean; onClose: () => void }) {
  const { create, remove } = useRewardMutations();
  const [emoji, setEmoji] = useState('🎁');
  const [label, setLabel] = useState('');
  const [threshold, setThreshold] = useState<70 | 90>(70);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    create.mutate({ emoji, label: label.trim(), threshold }, { onSuccess: () => setLabel('') });
  };

  const base = board.rewards.filter((r) => r.threshold === 70);
  const bonus = board.rewards.filter((r) => r.threshold === 90);

  return (
    <SlideOver open={open} title="🎁 Rewards" onClose={onClose}>
      <form onSubmit={add} className="mb-5 space-y-3">
        <div className="flex gap-2">
          <input className={`${inputCls} w-16 text-center`} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
          <input className={`${inputCls} flex-1`} placeholder="Reward you actually want" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {([70, 90] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setThreshold(t)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-sm ring-1 ${
                threshold === t ? 'bg-band-bonus/20 ring-band-bonus' : 'ring-edge hover:bg-card'
              }`}
            >
              {t === 70 ? 'Base · 70%' : 'Bonus · 90%'}
            </button>
          ))}
        </div>
        <button type="submit" disabled={create.isPending} className={primaryBtn}>
          Add reward
        </button>
      </form>

      <RewardList title="Base · 70%" rewards={base} onRemove={(id) => remove.mutate(id)} />
      <RewardList title="Bonus · 90%" rewards={bonus} onRemove={(id) => remove.mutate(id)} />
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
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <div className="space-y-2">
        {rewards.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-xl bg-card/70 px-3 py-2 ring-1 ring-edge">
            <span className={r.unlocked ? '' : 'opacity-80'}>
              {r.emoji} {r.label} {r.unlocked && <span className="ml-1 text-xs text-band-ontrack">✓ unlocked</span>}
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
