import { useState } from 'react';
import type { Board } from '@lifeline/shared';
import { useSaveSettings } from '../../api/queries.js';
import SlideOver from './SlideOver.js';
import { field, input as inputCls, primaryBtn } from './ui.js';

export default function SettingsPanel({ board, open, onClose }: { board: Board; open: boolean; onClose: () => void }) {
  const s = board.settings;
  const save = useSaveSettings();
  const [form, setForm] = useState({
    wake_target: s.wake_target,
    steps_target: s.steps_target,
    work_blocks: s.work_blocks,
    block_length_hrs: s.block_length_hrs,
    monthly_savings_target: s.monthly_savings_target,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(form, { onSuccess: onClose });
  };

  return (
    <SlideOver open={open} title="⚙️ Settings" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className={field}>
          <span>Wake target</span>
          <input type="time" className={inputCls} value={form.wake_target} onChange={(e) => setForm({ ...form, wake_target: e.target.value })} />
        </label>
        <label className={field}>
          <span>Steps target</span>
          <input type="number" className={inputCls} value={form.steps_target} onChange={(e) => setForm({ ...form, steps_target: Number(e.target.value) })} />
        </label>
        <label className={field}>
          <span>Work blocks / day</span>
          <input type="number" min={1} max={12} className={inputCls} value={form.work_blocks} onChange={(e) => setForm({ ...form, work_blocks: Number(e.target.value) })} />
        </label>
        <label className={field}>
          <span>Block length (hrs)</span>
          <input type="number" min={1} max={12} className={inputCls} value={form.block_length_hrs} onChange={(e) => setForm({ ...form, block_length_hrs: Number(e.target.value) })} />
        </label>
        <label className={field}>
          <span>🔒 Monthly savings target (private)</span>
          <input type="number" className={inputCls} value={form.monthly_savings_target} onChange={(e) => setForm({ ...form, monthly_savings_target: Number(e.target.value) })} />
        </label>
        <button type="submit" disabled={save.isPending} className={primaryBtn}>
          {save.isPending ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </SlideOver>
  );
}
