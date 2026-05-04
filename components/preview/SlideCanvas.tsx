'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// 画布尺寸（16:9）
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

interface SlideCanvasProps {
  html?: string;
  scale?: number;
  center?: boolean;
  className?: string;
}

export function SlideCanvas({
  html,
  scale: fixedScale,
  center = true,
  className,
}: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [fitScale, setFitScale] = useState(1);

  // 计算自适应缩放比例
  useEffect(() => {
    if (fixedScale !== undefined) return;
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setFitScale(Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixedScale]);

  // 更新 iframe 内容
  const updateIframe = useCallback((content: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (doc && content) {
      doc.open();
      doc.write(content);
      doc.close();
    }
  }, []);

  useEffect(() => {
    if (html) updateIframe(html);
  }, [html, updateIframe]);

  const scale = fixedScale ?? fitScale;
  const scaledW = CANVAS_WIDTH * scale;
  const scaledH = CANVAS_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full overflow-hidden', className)}
    >
      <div
        className="overflow-hidden bg-white rounded-[6px] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)]"
        style={{
          width: scaledW,
          height: scaledH,
          ...(center
            ? {
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }
            : {}),
        }}
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
            ref={iframeRef}
            className="w-full h-full border-0"
            title="幻灯片"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}