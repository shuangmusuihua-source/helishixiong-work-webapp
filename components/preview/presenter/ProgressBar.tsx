'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  index: number;
  total: number;
  visible: boolean;
}

export function ProgressBar({ index, total, visible }: ProgressBarProps) {
  const progress = ((index + 1) / total) * 100;

  return (
    <div
      className={cn(
        'absolute top-0 left-0 right-0 h-1 z-30 transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className="h-full bg-primary/80 transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
