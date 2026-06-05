import { useEffect } from 'react';

/** Transient nudge / celebration message at the bottom of the screen. */
export default function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="animate-float-up pointer-events-auto max-w-md rounded-xl bg-card px-4 py-3 text-center text-sm shadow-2xl ring-1 ring-edge">
        {message}
      </div>
    </div>
  );
}
