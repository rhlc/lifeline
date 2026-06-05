import { useState } from 'react';
import type { Board } from '@lifeline/shared';
import { useSaveMonth } from '../../api/queries.js';
import SlideOver from './SlideOver.js';
import { field, input as inputCls, primaryBtn } from './ui.js';

/** Owner-only monthly money check-in (spec §4c). Private — never public. */
export default function MoneyPanel({ board, open, onClose }: { board: Board; open: boolean; onClose: () => void }) {
  const month = board.today.slice(0, 7);
  const existing = board.months.find((m) => m.month === month);
  const save = useSaveMonth();
  const [budget, setBudget] = useState(existing?.budget ?? 0);
  const [savings, setSavings] = useState(existing?.savings ?? 0);
  const [expenses, setExpenses] = useState(existing?.expenses ?? 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate({ month, input: { budget, savings, expenses } }, { onSuccess: onClose });
  };

  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const left = budget - expenses;

  return (
    <SlideOver open={open} title="💰 Money — this month" onClose={onClose}>
      <p className="mb-4 rounded-lg bg-card/70 px-3 py-2 text-xs text-muted ring-1 ring-edge">
        🔒 Private. Never shown on the public board. Doesn't affect your streak. Expenses come out of
        your <b>budget</b>, not your savings.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div className="text-sm text-muted">Month: {month}</div>

        <label className={field}>
          <span>📊 Budget (to spend this month)</span>
          <input type="number" className={inputCls} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
        </label>
        <label className={field}>
          <span>💰 Savings (set aside)</span>
          <input type="number" className={inputCls} value={savings} onChange={(e) => setSavings(Number(e.target.value))} />
        </label>
        <label className={field}>
          <span>🧾 Expenses (spent so far)</span>
          <input type="number" className={inputCls} value={expenses} onChange={(e) => setExpenses(Number(e.target.value))} />
        </label>

        <div className="rounded-lg bg-card/70 px-3 py-2 text-sm ring-1 ring-edge">
          Budget left: <b className={left < 0 ? 'text-band-warn' : 'text-band-ontrack'}>{inr(left)}</b>
          <span className="text-muted"> of {inr(budget)}</span>
          {left < 0 && <span className="ml-1 text-band-warn">(over by {inr(-left)})</span>}
        </div>

        <button type="submit" disabled={save.isPending} className={primaryBtn}>
          {save.isPending ? 'Saving…' : 'Save month'}
        </button>
      </form>
    </SlideOver>
  );
}
