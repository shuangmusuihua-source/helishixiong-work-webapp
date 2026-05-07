'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { DesignSystem } from '@/lib/generator/design-system';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

interface ReactSlidePreviewProps {
  slideCode: string;
  design?: DesignSystem;
  className?: string;
}

/**
 * React 幻灯片预览组件
 * 用于渲染生成的 React 组件代码
 */
export function ReactSlidePreview({ slideCode, design, className }: ReactSlidePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 计算自适应缩放比例
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setFitScale(Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 注入设计系统 CSS 变量
  useEffect(() => {
    if (!design) return;

    const root = document.documentElement;
    root.style.setProperty('--osd-bg', design.palette.bg);
    root.style.setProperty('--osd-text', design.palette.text);
    root.style.setProperty('--osd-accent', design.palette.accent);
    root.style.setProperty('--osd-surface', design.palette.surface || design.palette.bg);
    root.style.setProperty('--osd-muted', design.palette.muted || design.palette.text);
    root.style.setProperty('--osd-font-display', design.fonts.display);
    root.style.setProperty('--osd-font-body', design.fonts.body);
    root.style.setProperty('--osd-size-hero', `${design.typeScale.hero}px`);
    root.style.setProperty('--osd-size-heading', `${design.typeScale.heading || Math.round(design.typeScale.hero * 0.5)}px`);
    root.style.setProperty('--osd-size-body', `${design.typeScale.body}px`);
    root.style.setProperty('--osd-radius', `${design.radius}px`);
  }, [design]);

  const scaledW = CANVAS_WIDTH * fitScale;
  const scaledH = CANVAS_HEIGHT * fitScale;

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full overflow-hidden', className)}
    >
      <div
        className="overflow-hidden rounded-[6px] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)]"
        style={{
          width: scaledW,
          height: scaledH,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: design?.palette.bg || 'var(--osd-bg)',
        }}
      >
        <div
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${fitScale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* 这里将来会渲染动态加载的 React 组件 */}
          <div className="flex items-center justify-center h-full text-muted-foreground">
            React 组件预览（开发中）
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HTML 幻灯片预览组件
 * 用于渲染生成的 HTML 内容
 */
export function HtmlSlidePreview({ html, className }: { html: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const previousHtmlRef = useRef<string>('');

  // 计算自适应缩放比例
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setFitScale(Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 更新 iframe 内容
  const updateIframe = useCallback((content: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (doc && content) {
      try {
        doc.open();
        doc.write(content);
        doc.close();
        previousHtmlRef.current = content;
      } catch (error) {
        console.error('[HtmlSlidePreview] Error writing to iframe:', error);
      }
    }
  }, []);

  // 当 html 变化时更新 iframe
  useEffect(() => {
    if (html && html !== previousHtmlRef.current) {
      updateIframe(html);
    }
  }, [html, updateIframe]);

  const scaledW = CANVAS_WIDTH * fitScale;
  const scaledH = CANVAS_HEIGHT * fitScale;

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
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${fitScale})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="幻灯片预览"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
