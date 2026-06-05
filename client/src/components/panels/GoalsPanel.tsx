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
    <SlideOver open={open} title="🎯 Goals" onClose={onClose}>
      <form onSubmit={add} className="mb-5 space-y-3">
        <label className={field}>
          <span>New goal</span>
          <input className={inputCls} placeholder="e.g. Ship the v2 launch" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <div className="flex gap-2">
          {SCOPES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-sm capitalize ring-1 ${
                scope === s ? 'bg-band-bonus/20 ring-band-bonus' : 'ring-edge hover:bg-card'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button type="submit" disabled={create.isPending} className={primaryBtn}>
          Add goal
        </button>
      </form>

      <div className="space-y-3">
        {board.goals.map((g) => (
          <div key={g.id} className="rounded-xl bg-card/70 p-3 ring-1 ring-edge">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded bg-edge px-1.5 py-0.5 text-[10px] uppercase text-muted">{g.scope}</span>
                <div className="mt-1 text-sm">{g.text}</div>
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
                className="flex-1 accent-band-ontrack"
              />
              <span className="w-10 text-right text-xs text-muted">{g.progress}%</span>
            </div>
          </div>
        ))}
        {board.goals.length === 0 && <div className="text-sm text-muted">No goals yet.</div>}
      </div>
    </SlideOver>
  );
}
