import { useEffect, type ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Generic right-side drawer on warm paper. ESC + backdrop close. */
export default function SlideOver({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="animate-float-up absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold lowercase text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="press focus-clay rounded-md px-2 py-1 font-mono text-muted hover:bg-card-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
