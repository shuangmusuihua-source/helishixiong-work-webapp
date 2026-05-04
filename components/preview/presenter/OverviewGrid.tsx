'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const THUMB_WIDTH = 160;

interface OverviewGridProps {
  pages: string[];
  current: number;
  open: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
}

export function OverviewGrid({
  pages,
  current,
  open,
  onClose,
  onSelect,
}: OverviewGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(current);

  useEffect(() => {
    if (open) setFocusedIndex(current);
  }, [open, current]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(focusedIndex);
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(pages.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(pages.length - 1, i + 4));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(0, i - 4));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, focusedIndex, pages.length, onClose, onSelect]);

  // 初始化 iframe
  const initIframe = useCallback((iframe: HTMLIFrameElement | null, index: number) => {
    if (!iframe || !pages[index]) return;
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(pages[index]);
      doc.close();
    }
  }, [pages]);

  if (!open) return null;

  const scale = THUMB_WIDTH / CANVAS_WIDTH;
  const height = CANVAS_HEIGHT * scale;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={gridRef}
        className="max-h-[80vh] max-w-[80vw] overflow-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-4 gap-4">
          {pages.map((_, i) => {
            const isActive = i === current;
            const isFocused = i === focusedIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onSelect(i);
                  onClose();
                }}
                onFocus={() => setFocusedIndex(i)}
                className={cn(
                  'relative overflow-hidden rounded-[6px] border-2 transition-all',
                  isActive
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-transparent hover:border-white/30',
                  isFocused && !isActive && 'border-white/50',
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
                    ref={(el) => initIframe(el, i)}
                    className="w-full h-full border-0 bg-white"
                    title={`缩略图 ${i + 1}`}
                    sandbox="allow-scripts"
                  />
                </div>
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
