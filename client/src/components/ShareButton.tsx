import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import type { Board } from '@lifeline/shared';
import ShareCard from './ShareCard.js';
import { Button } from './ui/index.js';

/** Opens the share card modal and exports it as a PNG. */
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
      <Button variant="secondary" size="md" onClick={() => setOpen(true)}>
        share my week →
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <ShareCard ref={cardRef} board={board} />
            <div className="flex gap-2">
              <Button variant="primary" onClick={download} disabled={busy}>
                {busy ? 'rendering…' : 'download png ↓'}
              </Button>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                close ×
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
