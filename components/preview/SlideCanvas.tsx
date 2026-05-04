'use client';

import { useRef, useEffect, useState, useCallback, useMemo, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { DesignSystem } from '@/types';
import { designToCssVarsExtended } from '@/lib/generator/design-system';

// 画布尺寸（16:9）
export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

// 从完整 HTML 文档中提取 body 内容和样式
function extractHtmlContent(html: string): { bodyContent: string; styles: string; links: string } {
  if (!html) return { bodyContent: '', styles: '', links: '' };

  // 检查是否是完整的 HTML 文档
  if (!html.includes('<html') && !html.includes('<body')) {
    return { bodyContent: html, styles: '', links: '' };
  }

  // 提取 style 标签内容
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  const styles = styleMatch ? styleMatch.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n') : '';

  // 提取 link 标签（样式表）
  const linkMatch = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi);
  const links = linkMatch ? linkMatch.join('\n') : '';

  // 提取 body 内容
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;

  return { bodyContent, styles, links };
}

interface SlideCanvasProps {
  /** HTML content for iframe mode (template themes) */
  html?: string;
  /** React children for direct render mode (advanced themes) */
  children?: ReactNode;
  /** Fixed scale (e.g., for thumbnails). Otherwise fit to container. */
  scale?: number;
  /** Center the canvas within the container (default true). */
  center?: boolean;
  /** Flat mode: no rounded corners or drop shadow. */
  flat?: boolean;
  /** Freeze descendant animations and transitions, useful for thumbnail previews. */
  freezeMotion?: boolean;
  /** Per-slide design tokens for CSS custom properties. */
  design?: DesignSystem;
  /** Enable inspector mode for element editing */
  inspectorMode?: boolean;
  className?: string;
}

/**
 * SlideCanvas - 幻灯片画布组件
 *
 * 支持两种渲染模式：
 * 1. iframe 模式：用于模板主题（传入 html prop）
 * 2. React 直接渲染模式：用于高级主题（传入 children prop）
 */
export function SlideCanvas({
  html,
  children,
  scale: fixedScale,
  center = true,
  flat = false,
  freezeMotion = false,
  design,
  inspectorMode = false,
  className,
}: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const previousHtmlRef = useRef<string>('');

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

  // 更新 iframe 内容（仅用于 html 模式）
  const updateIframe = useCallback((content: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (doc && content) {
      try {
        doc.open();
        doc.write(content);
        doc.close();
        previousHtmlRef.current = content;
      } catch (error) {
        console.error('[SlideCanvas] Error writing to iframe:', error);
      }
    }
  }, []);

  // 当 html prop 变化时更新 iframe
  useEffect(() => {
    if (html && html !== previousHtmlRef.current) {
      updateIframe(html);
    }
  }, [html, updateIframe]);

  const s = fixedScale ?? fitScale;
  const scaledW = CANVAS_WIDTH * s;
  const scaledH = CANVAS_HEIGHT * s;

  // 决定渲染模式：inspectorMode 时直接渲染 HTML，否则使用 iframe
  // 这样 Inspector 可以正常捕获点击事件
  const useIframeMode = html && !children && !inspectorMode;

  // 提取 HTML 内容和样式
  const { bodyContent, styles, links } = useMemo(() => extractHtmlContent(html || ''), [html]);

  // CSS 变量注入
  const cssVars = design ? designToCssVarsExtended(design) : {};

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full overflow-hidden', className)}
    >
      <div
        className={cn(
          'overflow-hidden bg-white text-black',
          !flat && 'rounded-[6px] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)]',
        )}
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
          ...(design ? { background: design.palette.bg, color: design.palette.text } : {}),
        }}
      >
        <div
          data-osd-canvas
          data-osd-freeze-motion={freezeMotion ? '' : undefined}
          data-inspector-root={inspectorMode ? '' : undefined}
          style={
            {
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${s})`,
              transformOrigin: 'top left',
              ...cssVars,
            } as CSSProperties
          }
        >
          {useIframeMode ? (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="幻灯片"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="w-full h-full relative">
              {/* 外部样式表 */}
              <div dangerouslySetInnerHTML={{ __html: links }} suppressHydrationWarning />
              {/* 内联样式 */}
              <style dangerouslySetInnerHTML={{ __html: styles }} suppressHydrationWarning />
              {/* 内容 */}
              <div
                dangerouslySetInnerHTML={{ __html: bodyContent }}
                className="w-full h-full"
                suppressHydrationWarning
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * HtmlSlideCanvas - 简化版 HTML 幻灯片画布
 * 仅用于 iframe 模式渲染
 */
export function HtmlSlideCanvas({ html, className }: { html: string; className?: string }) {
  return <SlideCanvas html={html} className={className} />;
}

/**
 * ReactSlideCanvas - 简化版 React 幻灯片画布
 * 仅用于 React 直接渲染模式
 */
export function ReactSlideCanvas({
  children,
  design,
  freezeMotion,
  scale,
  className,
}: {
  children: ReactNode;
  design?: DesignSystem;
  freezeMotion?: boolean;
  scale?: number;
  className?: string;
}) {
  return (
    <SlideCanvas
      design={design}
      freezeMotion={freezeMotion}
      scale={scale}
      className={className}
    >
      {children}
    </SlideCanvas>
  );
}