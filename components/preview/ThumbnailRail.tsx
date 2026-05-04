'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { SlideCanvas, CANVAS_WIDTH, CANVAS_HEIGHT } from './SlideCanvas';

const THUMB_WIDTH = 184;
const THUMB_SCALE = THUMB_WIDTH / CANVAS_WIDTH;
const THUMB_HEIGHT = CANVAS_HEIGHT * THUMB_SCALE;

interface ThumbnailRailProps {
  pages: string[];
  current: number;
  onSelect: (index: number) => void;
  /** 设计系统（用于高级主题） */
  design?: import('@/types').DesignSystem;
  /** 是否使用 React 渲染模式 */
  useReactMode?: boolean;
}

export function ThumbnailRail({
  pages,
  current,
  onSelect,
  design,
  useReactMode = false,
}: ThumbnailRailProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  console.log('[ThumbnailRail] Rendering with pages:', pages.length, 'current:', current);

  // 自动滚动到当前页
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    activeRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [current]);

  return (
    <div className="h-full overflow-y-auto border-r border-border bg-sidebar/50">
      <aside className="flex flex-col gap-2 p-3">
        <div className="flex items-baseline justify-between px-1 pb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            页面
          </span>
          <span className="text-sm font-mono text-muted-foreground">
            {pages.length.toString().padStart(2, '0')}
          </span>
        </div>
        {pages.map((pageHtml, i) => {
          const active = i === current;
          return (
            <button
              key={i}
              type="button"
              ref={active ? activeRef : undefined}
              onClick={() => {
                console.log('[ThumbnailRail] Button clicked, index:', i);
                onSelect(i);
              }}
              aria-label={`跳转到第 ${i + 1} 页`}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'group/thumb flex items-start gap-2.5 rounded-[6px] p-1.5 text-left transition-colors relative',
                'hover:bg-muted/60',
                active && 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'mt-1.5 w-7 shrink-0 text-right font-mono text-[10px] font-medium tracking-wider tabular-nums uppercase',
                  active ? 'text-primary' : 'text-muted-foreground/70',
                )}
              >
                {(i + 1).toString().padStart(2, '0')}
              </span>
              <div
                className={cn(
                  'relative shrink-0 overflow-hidden rounded-[4px] border bg-card transition-all',
                  active
                    ? 'border-primary shadow-[0_0_0_1px_hsl(var(--primary))]'
                    : 'border-border group-hover/thumb:border-foreground/25',
                )}
                style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
              >
                <SlideCanvas
                  html={pageHtml}
                  scale={THUMB_SCALE}
                  center={false}
                  flat
                  freezeMotion
                  design={design}
                />
                {active && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-primary"
                  />
                )}
              </div>
            </button>
          );
        })}
      </aside>
    </div>
  );
}