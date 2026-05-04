/**
 * Design System - 与 open-slide 保持一致的设计系统
 * 类型定义从 types/index.ts 导出，这里只包含预设主题和工具函数
 */

import type { DesignSystem, DesignPalette, DesignFonts, DesignTypeScale } from '@/types';

// 重新导出类型（与 open-slide 保持一致）
export type { DesignSystem, DesignPalette, DesignFonts, DesignTypeScale };

// 设计系统类型定义（本地使用，与 open-slide 完全一致）
export type OpenSlideDesignPalette = {
  bg: string;
  text: string;
  accent: string;
};

export type OpenSlideDesignFonts = {
  display: string;
  body: string;
};

export type OpenSlideDesignTypeScale = {
  hero: number;
  body: number;
};

export type OpenSlideDesignSystem = {
  palette: OpenSlideDesignPalette;
  fonts: OpenSlideDesignFonts;
  typeScale: OpenSlideDesignTypeScale;
  radius: number;
};

// 设计系统转 CSS 变量（与 open-slide 完全一致）
export function designToCssVars(d: OpenSlideDesignSystem): Record<string, string> {
  return {
    '--osd-bg': d.palette.bg,
    '--osd-text': d.palette.text,
    '--osd-accent': d.palette.accent,
    '--osd-font-display': d.fonts.display,
    '--osd-font-body': d.fonts.body,
    '--osd-size-hero': `${d.typeScale.hero}px`,
    '--osd-size-body': `${d.typeScale.body}px`,
    '--osd-radius': `${d.radius}px`,
  };
}

// 扩展版 CSS 变量（包含可选字段）
export function designToCssVarsExtended(d: DesignSystem): Record<string, string> {
  const base = designToCssVars({
    palette: { bg: d.palette.bg, text: d.palette.text, accent: d.palette.accent },
    fonts: { display: d.fonts.display, body: d.fonts.body },
    typeScale: { hero: d.typeScale.hero, body: d.typeScale.body },
    radius: d.radius,
  });

  return {
    ...base,
    '--osd-surface': d.palette.surface || d.palette.bg,
    '--osd-muted': d.palette.muted || d.palette.text,
    '--osd-font-mono': d.fonts.mono || 'ui-monospace, monospace',
    '--osd-size-heading': `${d.typeScale.heading || Math.round(d.typeScale.hero * 0.5)}px`,
    '--osd-size-caption': `${d.typeScale.caption || Math.round(d.typeScale.body * 0.7)}px`,
  };
}

// CSS 变量转字符串
export function cssVarsToString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
}

// 预设主题设计系统
export const themeDesigns: Record<string, DesignSystem> = {
  'neon-terminal': {
    palette: {
      bg: '#05070a',
      text: '#e6edf3',
      accent: '#10B981',
      surface: '#0d1117',
      muted: '#6e7681',
    },
    fonts: {
      display: '"JetBrains Mono", "Menlo", "Consolas", monospace',
      body: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", "Menlo", monospace',
    },
    typeScale: {
      hero: 144,
      heading: 64,
      body: 28,
      caption: 20,
    },
    radius: 8,
  },
  'paper-press': {
    palette: {
      bg: '#f7f5f0',
      text: '#1a1814',
      accent: '#b45309',
      surface: '#ffffff',
      muted: '#6b6660',
    },
    fonts: {
      display: 'Georgia, "Times New Roman", serif',
      body: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
    },
    typeScale: {
      hero: 128,
      heading: 56,
      body: 24,
      caption: 18,
    },
    radius: 4,
  },
  'editorial-noir': {
    palette: {
      bg: '#0a0a0a',
      text: '#fafafa',
      accent: '#d97706',
      surface: '#171717',
      muted: '#737373',
    },
    fonts: {
      display: 'Georgia, "Times New Roman", serif',
      body: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
    },
    typeScale: {
      hero: 136,
      heading: 60,
      body: 26,
      caption: 18,
    },
    radius: 2,
  },
};

// 默认设计系统
export const defaultDesign: DesignSystem = themeDesigns['neon-terminal'];

// 画布尺寸
export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;
