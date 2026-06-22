import { useState } from 'react';
import type { Board, GoalScope } from '@lifeline/shared';
import { useGoalMutations } from '../../api/queries.js';
import SlideOver from './SlideOver.js';
import { field, input as inputCls, primaryBtn, dangerBtn } from './ui.js';

const SCOPES: GoalScope[] = ['month', 'quarter', 'year'];

export default function GoalsPanel({ board, open, onClose }: { board: Board; open: boolean; onClose: () => void }) {
  const { create, update, remove } = useGoalMutations();
  const [scope, setScope] = useState<GoalScope>('month');
  const [text, setText] = useState('');

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    create.mutate({ scope, text: text.trim(), progress: 0, period: null }, { onSuccess: () => setText('') });
  };

  return (
    <SlideOver open={open} title="goals" onClose={onClose}>
      <form onSubmit={add} className="mb-5 space-y-3">
        <label className={field}>
          <span>new goal</span>
          <input className={inputCls} placeholder="e.g. ship the v2 launch" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <div className="flex gap-2">
          {SCOPES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`press focus-clay flex-1 rounded-md border px-2 py-1.5 text-sm lowercase ${
                scope === s ? 'border-clay bg-clay-tint text-clay-deep' : 'border-line-2 text-ink-2 hover:bg-card-2'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button type="submit" disabled={create.isPending} className={primaryBtn}>
          add goal
        </button>
      </form>

      <div className="space-y-3">
        {board.goals.map((g) => (
          <div key={g.id} className="rounded-md border border-line bg-card-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded border border-line-2 bg-card px-1.5 py-0.5 text-[10px] lowercase text-muted">
                  {g.scope}
                </span>
                <div className="mt-1 text-sm lowercase">{g.text.toLowerCase()}</div>
              </div>
              <button onClick={() => remove.mutate(g.id)} className={dangerBtn}>
                delete
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={g.progress}
                onChange={(e) =>
                  update.mutate({ id: g.id, input: { scope: g.scope, text: g.text, progress: Number(e.target.value), period: g.period } })
                }
                className="flex-1 accent-clay"
              />
              <span className="w-10 text-right text-xs tabular-nums text-muted">{g.progress}%</span>
            </div>
          </div>
        ))}
        {board.goals.length === 0 && <div className="text-sm lowercase text-muted">no goals yet.</div>}
      </div>
    </SlideOver>
  );
}
