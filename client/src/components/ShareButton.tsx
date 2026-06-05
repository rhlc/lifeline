import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import type { Board } from '@lifeline/shared';
import ShareCard from './ShareCard.js';

/** Opens the share card modal and exports it as a PNG (spec §7). */
export default function ShareButton({ board }: { board: Board }) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.download = `lifeline-${board.today}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-card px-4 py-2 text-sm font-semibold ring-1 ring-edge hover:ring-ink/30"
      >
        📤 Share my week
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <ShareCard ref={cardRef} board={board} />
            <div className="flex gap-2">
              <button onClick={download} disabled={busy} className="rounded-xl bg-band-ontrack px-5 py-2 font-semibold text-black disabled:opacity-60">
                {busy ? 'Rendering…' : '⬇️ Download PNG'}
              </button>
              <button onClick={() => setOpen(false)} className="rounded-xl bg-card px-5 py-2 ring-1 ring-edge">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
