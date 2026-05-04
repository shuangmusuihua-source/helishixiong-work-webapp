'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const THUMB_WIDTH = 184;

interface ThumbnailRailProps {
  pages: string[];
  current: number;
  onSelect: (index: number) => void;
}

export function ThumbnailRail({ pages, current, onSelect }: ThumbnailRailProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const [iframeDocs, setIframeDocs] = useState<Map<number, Document>>(new Map());

  // 自动滚动到当前页
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    activeRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [current]);

  // 初始化 iframe 内容
  const initIframe = useCallback((index: number, iframe: HTMLIFrameElement | null) => {
    if (!iframe || !pages[index]) return;
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(pages[index]);
      doc.close();
      setIframeDocs((prev) => new Map(prev).set(index, doc));
    }
  }, [pages]);

  const scale = THUMB_WIDTH / CANVAS_WIDTH;
  const height = CANVAS_HEIGHT * scale;

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
        {pages.map((_, i) => {
          const active = i === current;
          return (
            <button
              key={i}
              type="button"
              ref={active ? activeRef : undefined}
              onClick={() => onSelect(i)}
              aria-label={`跳转到第 ${i + 1} 页`}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'group/thumb flex items-start gap-2.5 rounded-[6px] p-1.5 text-left transition-colors',
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
                style={{ width: THUMB_WIDTH, height }}
              >
                <div
                  style={{
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <iframe
                    ref={(el) => initIframe(i, el)}
                    className="w-full h-full border-0"
                    title={`缩略图 ${i + 1}`}
                    sandbox="allow-scripts"
                  />
                </div>
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
