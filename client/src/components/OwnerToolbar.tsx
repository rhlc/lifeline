import { useState } from 'react';
import type { Board } from '@lifeline/shared';
import { useLogout } from '../api/queries.js';
import { api } from '../api/client.js';
import { useQueryClient } from '@tanstack/react-query';
import SettingsPanel from './panels/SettingsPanel.js';
import GoalsPanel from './panels/GoalsPanel.js';
import RewardsPanel from './panels/RewardsPanel.js';
import MoneyPanel from './panels/MoneyPanel.js';

type Panel = 'settings' | 'goals' | 'rewards' | 'money' | null;

const TOOL_BTN =
  'press focus-clay rounded-md border border-line-2 bg-card px-2.5 py-1 text-xs lowercase text-ink-2 transition-colors hover:bg-card-2 hover:text-ink cursor-pointer';

export default function OwnerToolbar({ board }: { board: Board }) {
  const [panel, setPanel] = useState<Panel>(null);
  const logout = useLogout();
  const qc = useQueryClient();

  const exportJson = async () => {
    const data = await api.get('/api/export');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeline-backup-${board.today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(String(reader.result));
        await api.post('/api/import', { json });
        qc.invalidateQueries({ queryKey: ['board'] });
      } catch {
        alert('import failed — invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const Btn = ({ p, label }: { p: Panel; label: string }) => (
    <button onClick={() => setPanel(p)} className={TOOL_BTN}>
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Btn p="settings" label="settings" />
      <Btn p="goals" label="goals" />
      <Btn p="rewards" label="rewards" />
      <Btn p="money" label="money" />
      <button onClick={exportJson} title="export backup" className={TOOL_BTN}>
        export ↓
      </button>
      <label title="import backup" className={TOOL_BTN}>
        import ↑
        <input type="file" accept="application/json" className="hidden" onChange={importJson} />
      </label>
      <button onClick={() => logout.mutate()} title="log out" className={TOOL_BTN}>
        log out ×
      </button>

      <SettingsPanel board={board} open={panel === 'settings'} onClose={() => setPanel(null)} />
      <GoalsPanel board={board} open={panel === 'goals'} onClose={() => setPanel(null)} />
      <RewardsPanel board={board} open={panel === 'rewards'} onClose={() => setPanel(null)} />
      <MoneyPanel board={board} open={panel === 'money'} onClose={() => setPanel(null)} />
    </div>
  );
}
