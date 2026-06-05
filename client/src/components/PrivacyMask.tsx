import type { ReactNode } from 'react';

/**
 * Blurs its children behind a 🧿 (nazar) overlay when `hidden`. Used to keep
 * private numbers — money + milestones — safe during screen-shares/screenshots.
 */
export default function PrivacyMask({
  hidden,
  label = 'hidden',
  children,
}: {
  hidden: boolean;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <div className={hidden ? 'pointer-events-none select-none blur-[7px]' : ''} aria-hidden={hidden}>
        {children}
      </div>
      {hidden && (
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-sm text-muted">
          <span className="text-xl">🧿</span> {label}
        </div>
      )}
    </div>
  );
}
