import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('browser-frame', className)}>
      <div className="browser-bar">
        <span className="browser-dot bg-[#ff5f57]" />
        <span className="browser-dot bg-[#febc2e]" />
        <span className="browser-dot bg-[#28c840]" />
        <div className="ml-4 flex-1 truncate rounded-md bg-canvas-paper px-3 py-1 text-[10px] text-ink-mute">
          {url}
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}
