/**
 * 组件模板 - 从 open-slide 提取的组件模板
 * 用于生成高质量的 React 幻灯片组件
 */

import type { DesignSystem } from './design-system';

// 缓动函数（与 open-slide 一致）
export const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

// 动画 keyframes（与 open-slide 一致，使用 l- 前缀）
export const keyframes = `
@keyframes lFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes lFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes lFadeRight {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes lScale {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes lLineGrow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes lBarGrow {
  from { transform: scaleX(0); }
  to { transform: scaleX(var(--scale, 1)); }
}
@keyframes lBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
@keyframes lSlide {
  0% { transform: translateX(0); }
  100% { transform: translateX(var(--dist, 0px)); }
}
@keyframes lWindowSlide {
  0%, 100% { transform: translateX(0px); }
  50% { transform: translateX(var(--dist, 200px)); }
}
@keyframes cursorBlink {
  to { visibility: hidden; }
}
@keyframes glow {
  0%, 100% { text-shadow: 0 0 16px var(--osd-accent); }
  50% { text-shadow: 0 0 32px var(--osd-accent), 0 0 48px var(--osd-accent); }
}

/* Animation utility classes */
.l-fadeup    { animation: lFadeUp 1000ms ${ease} both; }
.l-fade      { animation: lFade 1200ms ${ease} both; }
.l-faderight { animation: lFadeRight 800ms ${ease} both; }
.l-scale     { animation: lScale 1000ms ${ease} both; }
.l-line      { animation: lLineGrow 900ms ${ease} both; transform-origin: left center; }
.l-blink     { animation: lBlink 1.1s steps(1) infinite; }
.l-bar       { animation: lBarGrow 1100ms ${ease} both; transform-origin: left center; }
.l-slide     { animation: lSlide 1000ms ${ease} both; }

/* Legacy class names (for backward compatibility) */
.animate-fadeup { animation: lFadeUp 1000ms ${ease} both; }
.animate-fade { animation: lFade 1200ms ${ease} both; }
.animate-faderight { animation: lFadeRight 800ms ${ease} both; }
.animate-scale { animation: lScale 1000ms ${ease} both; }
.animate-line { animation: lLineGrow 900ms ${ease} both; transform-origin: left center; }
.animate-blink { animation: lBlink 1.1s steps(1) infinite; }
`;

// 布局常量
export const PAD_X = 140;
export const PAD_Y = 110;

// 填充样式
export const fillStyle = {
  width: '100%',
  height: '100%',
  fontFamily: 'var(--osd-font-body)',
  color: 'var(--osd-text)',
  background: 'var(--osd-bg)',
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

// 组件样式生成函数
export function generateEyebrowStyle(delay: number = 0): Record<string, string | number> {
  return {
    animationDelay: `${delay}ms`,
    fontFamily: 'var(--osd-font-body)',
    fontSize: 22,
    fontWeight: 500,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: 'var(--osd-accent)',
  };
}

export function generateTitleStyle(delay: number = 180): Record<string, string | number> {
  return {
    animationDelay: `${delay}ms`,
    fontFamily: 'var(--osd-font-display)',
    fontSize: 'var(--osd-size-hero)',
    fontWeight: 400,
    lineHeight: 1.02,
    letterSpacing: '-0.025em',
    margin: '40px 0 0',
    color: 'var(--osd-text)',
  };
}

export function generateSubtitleStyle(delay: number = 400): Record<string, string | number> {
  return {
    animationDelay: `${delay}ms`,
    fontFamily: 'var(--osd-font-body)',
    fontSize: 36,
    lineHeight: 1.5,
    color: 'var(--osd-muted)',
    maxWidth: 1200,
    margin: '32px 0 0',
    fontWeight: 300,
  };
}

export function generatePageNumberStyle(): Record<string, string | number> {
  return {
    position: 'absolute',
    left: PAD_X,
    bottom: 60,
    fontFamily: 'var(--osd-font-body)',
    fontSize: 18,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: 'var(--osd-muted)',
  };
}

export function generateSectionTitleStyle(delay: number = 180, size: number = 84): Record<string, string | number> {
  return {
    animationDelay: `${delay}ms`,
    fontFamily: 'var(--osd-font-display)',
    fontSize: size,
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: '32px 0 16px',
    color: 'var(--osd-text)',
  };
}

export function generateBodyTextStyle(delay: number = 320): Record<string, string | number> {
  return {
    animationDelay: `${delay}ms`,
    fontFamily: 'var(--osd-font-body)',
    fontSize: 'var(--osd-size-body)',
    lineHeight: 1.6,
    color: 'var(--osd-text)',
  };
}

// 列表项样式
export function generateListItemStyle(index: number, baseDelay: number = 200): Record<string, string | number> {
  return {
    animationDelay: `${baseDelay + index * 100}ms`,
    padding: '20px 24px',
    background: 'var(--osd-surface)',
    borderRadius: 'var(--osd-radius)',
    marginBottom: 16,
  };
}

// 数据卡片样式
export function generateDataCardStyle(index: number, baseDelay: number = 200): Record<string, string | number> {
  return {
    animationDelay: `${baseDelay + index * 100}ms`,
    textAlign: 'center',
    padding: '32px',
    background: 'var(--osd-surface)',
    borderRadius: 'var(--osd-radius)',
  };
}

// 时间线样式
export function generateTimelineItemStyle(index: number, baseDelay: number = 200): Record<string, string | number> {
  return {
    animationDelay: `${baseDelay + index * 150}ms`,
    display: 'flex',
    gap: 32,
    alignItems: 'flex-start',
    marginBottom: 24,
  };
}

// 生成主题特定的 CSS
export function generateThemeCSS(design: DesignSystem): string {
  return `
:root {
  --osd-bg: ${design.palette.bg};
  --osd-text: ${design.palette.text};
  --osd-accent: ${design.palette.accent};
  --osd-surface: ${design.palette.surface || design.palette.bg};
  --osd-muted: ${design.palette.muted || design.palette.text};
  --osd-font-display: ${design.fonts.display};
  --osd-font-body: ${design.fonts.body};
  --osd-font-mono: ${design.fonts.mono || 'ui-monospace, monospace'};
  --osd-size-hero: ${design.typeScale.hero}px;
  --osd-size-heading: ${design.typeScale.heading || Math.round(design.typeScale.hero * 0.5)}px;
  --osd-size-body: ${design.typeScale.body}px;
  --osd-size-caption: ${design.typeScale.caption || Math.round(design.typeScale.body * 0.7)}px;
  --osd-radius: ${design.radius}px;
}
`;
}

// 生成完整的样式标签内容
export function generateFullStyles(design: DesignSystem): string {
  return `
${generateThemeCSS(design)}
${keyframes}
`;
}

// 冻结动画的 CSS（用于缩略图）
export const freezeMotionCSS = `
[data-osd-freeze-motion],
[data-osd-freeze-motion] *,
[data-osd-freeze-motion] *::before,
[data-osd-freeze-motion] *::after {
  animation-duration: 1ms !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  animation-fill-mode: forwards !important;
  transition: none !important;
  scroll-behavior: auto !important;
  view-transition-name: none !important;
}
`;
