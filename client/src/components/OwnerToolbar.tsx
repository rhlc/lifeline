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
        alert('Import failed — invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const Btn = ({ p, icon, title }: { p: Panel; icon: string; title: string }) => (
    <button
      onClick={() => setPanel(p)}
      title={title}
      className="rounded-lg px-2 py-1 text-base ring-1 ring-edge hover:bg-card"
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-1.5">
      <Btn p="settings" icon="⚙️" title="Settings" />
      <Btn p="goals" icon="🎯" title="Goals" />
      <Btn p="rewards" icon="🎁" title="Rewards" />
      <Btn p="money" icon="💰" title="Money (private)" />
      <button onClick={exportJson} title="Export backup" className="rounded-lg px-2 py-1 text-base ring-1 ring-edge hover:bg-card">
        📤
      </button>
      <label title="Import backup" className="cursor-pointer rounded-lg px-2 py-1 text-base ring-1 ring-edge hover:bg-card">
        📥
        <input type="file" accept="application/json" className="hidden" onChange={importJson} />
      </label>
      <button onClick={() => logout.mutate()} title="Log out" className="rounded-lg px-2 py-1 text-sm text-muted ring-1 ring-edge hover:bg-card">
        ⏻
      </button>

      <SettingsPanel board={board} open={panel === 'settings'} onClose={() => setPanel(null)} />
      <GoalsPanel board={board} open={panel === 'goals'} onClose={() => setPanel(null)} />
      <RewardsPanel board={board} open={panel === 'rewards'} onClose={() => setPanel(null)} />
      <MoneyPanel board={board} open={panel === 'money'} onClose={() => setPanel(null)} />
    </div>
  );
}
