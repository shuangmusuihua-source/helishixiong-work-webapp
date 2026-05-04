'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  Square,
  Sun,
  Crosshair,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlBarProps {
  index: number;
  total: number;
  startedAt: number;
  blackout: 'black' | 'white' | null;
  laser: boolean;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
  onBlackout: (mode: 'black' | 'white') => void;
  onLaser: () => void;
  onOverview: () => void;
  onExit: () => void;
}

export function ControlBar({
  index,
  total,
  startedAt,
  blackout,
  laser,
  visible,
  onPrev,
  onNext,
  onBlackout,
  onLaser,
  onOverview,
  onExit,
}: ControlBarProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4',
        'transition-all duration-300',
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0',
      )}
    >
      <div className="pointer-events-auto flex h-11 items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2 text-white/85 shadow-lg backdrop-blur-md">
        <BarButton label="上一页" onClick={onPrev} disabled={index === 0}>
          <ChevronLeft className="size-4" />
        </BarButton>
        <BarButton label="下一页" onClick={onNext} disabled={index >= total - 1}>
          <ChevronRight className="size-4" />
        </BarButton>

        <Divider />

        <span className="px-2 font-mono text-[11.5px] tracking-wider tabular-nums select-none">
          <span className="text-white">{(index + 1).toString().padStart(2, '0')}</span>
          <span className="text-white/35"> / </span>
          <span>{total.toString().padStart(2, '0')}</span>
        </span>

        <Divider />

        <time className="px-2 font-mono text-[11.5px] tracking-wider tabular-nums select-none text-white/70">
          {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </time>

        <Divider />

        <BarButton label="缩略图网格" onClick={onOverview}>
          <Grid2x2 className="size-4" />
        </BarButton>
        <BarButton
          label="黑屏"
          onClick={() => onBlackout('black')}
          active={blackout === 'black'}
        >
          <Square className="size-4 fill-current" />
        </BarButton>
        <BarButton
          label="白屏"
          onClick={() => onBlackout('white')}
          active={blackout === 'white'}
        >
          <Sun className="size-4" />
        </BarButton>
        <BarButton label="激光笔" onClick={onLaser} active={laser}>
          <Crosshair className="size-4" />
        </BarButton>

        <Divider />

        <BarButton label="退出" onClick={onExit}>
          <LogOut className="size-4" />
        </BarButton>
      </div>
    </div>
  );
}

function BarButton({
  children,
  label,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full transition-colors',
        'hover:bg-white/12 focus-visible:bg-white/12 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-30',
        active && 'bg-primary/85 text-white hover:bg-primary',
      )}
      title={label}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-4 w-px bg-white/15" />;
}
