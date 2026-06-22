import type { ReactNode } from 'react';

/**
 * Blurs its children behind a glyph overlay when `hidden`. Keeps private
 * numbers — money + milestones — safe during screen-shares/screenshots.
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
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm lowercase text-muted">
          <span aria-hidden="true" className="font-mono font-bold text-faint">
            [×]
          </span>
          {label}
        </div>
      )}
    </div>
  );
}
