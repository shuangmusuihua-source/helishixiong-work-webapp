/**
 * 装饰元素 - 从 open-slide 提取的装饰性 SVG 元素
 * 用于增强幻灯片的视觉效果
 */

import type { DesignSystem } from './design-system';

interface DecorativeGridProps {
  /** Grid pattern ID (must be unique per slide) */
  id?: string;
  /** Line color */
  lineColor?: string;
  /** Background color for vignette */
  bgColor?: string;
  /** Opacity of the grid */
  opacity?: number;
}

/**
 * 生成装饰性网格 SVG（用于封面和内容页背景）
 */
export function generateDecorativeGridSvg({
  id = 'lgrid',
  lineColor = 'var(--osd-muted)',
  bgColor = 'var(--osd-bg)',
  opacity = 0.5,
}: DecorativeGridProps = {}): string {
  return `<svg
  width="100%"
  height="100%"
  style="position: absolute; inset: 0; pointer-events: none; opacity: ${opacity};"
  aria-hidden="true"
  role="presentation"
>
  <title>decorative grid</title>
  <defs>
    <pattern id="${id}" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="${lineColor}" stroke-width="1" />
    </pattern>
    <radialGradient id="${id}-vignette" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${bgColor}" stop-opacity="0" />
      <stop offset="100%" stop-color="${bgColor}" stop-opacity="1" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#${id})" />
  <rect width="100%" height="100%" fill="url(#${id}-vignette)" />
</svg>`;
}

/**
 * 生成霓虹效果（用于 neon-terminal 主题）
 */
export function generateNeonGlowSvg({
  accentColor = 'var(--osd-accent)',
  opacity = 0.15,
}: {
  accentColor?: string;
  opacity?: number;
} = {}): string {
  return `<svg
  width="100%"
  height="100%"
  style="position: absolute; inset: 0; pointer-events: none; opacity: ${opacity};"
  aria-hidden="true"
  role="presentation"
>
  <title>neon glow</title>
  <defs>
    <radialGradient id="neon-glow" cx="30%" cy="30%" r="50%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.6" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#neon-glow)" />
</svg>`;
}

/**
 * 生成纸张纹理（用于 paper-press 主题）
 */
export function generatePaperTextureSvg({
  opacity = 0.03,
}: {
  opacity?: number;
} = {}): string {
  return `<svg
  width="100%"
  height="100%"
  style="position: absolute; inset: 0; pointer-events: none; opacity: ${opacity}; mix-blend-mode: multiply;"
  aria-hidden="true"
  role="presentation"
>
  <title>paper texture</title>
  <defs>
    <filter id="paper-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
    </filter>
  </defs>
  <rect width="100%" height="100%" filter="url(#paper-noise)" />
</svg>`;
}

/**
 * 生成暗色渐变（用于 editorial-noir 主题）
 */
export function generateDarkGradientSvg({
  bgColor = 'var(--osd-bg)',
  accentColor = 'var(--osd-accent)',
  opacity = 0.3,
}: {
  bgColor?: string;
  accentColor?: string;
  opacity?: number;
} = {}): string {
  return `<svg
  width="100%"
  height="100%"
  style="position: absolute; inset: 0; pointer-events: none; opacity: ${opacity};"
  aria-hidden="true"
  role="presentation"
>
  <title>dark gradient</title>
  <defs>
    <radialGradient id="dark-gradient" cx="70%" cy="70%" r="60%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="${bgColor}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#dark-gradient)" />
</svg>`;
}

/**
 * 根据主题生成装饰元素
 */
export function generateThemeDecoration(
  themeId: string,
  design: DesignSystem,
  slideIndex: number
): string {
  const uniqueId = `deco-${slideIndex}`;

  switch (themeId) {
    case 'neon-terminal':
      return generateNeonGlowSvg({
        accentColor: design.palette.accent,
        opacity: 0.2,
      }) + generateDecorativeGridSvg({
        id: uniqueId,
        lineColor: design.palette.accent,
        bgColor: design.palette.bg,
        opacity: 0.3,
      });

    case 'paper-press':
      return generatePaperTextureSvg({ opacity: 0.025 }) + generateDecorativeGridSvg({
        id: uniqueId,
        lineColor: design.palette.muted || design.palette.text,
        bgColor: design.palette.bg,
        opacity: 0.4,
      });

    case 'editorial-noir':
      return generateDarkGradientSvg({
        bgColor: design.palette.bg,
        accentColor: design.palette.accent,
        opacity: 0.4,
      }) + generateDecorativeGridSvg({
        id: uniqueId,
        lineColor: design.palette.muted || design.palette.text,
        bgColor: design.palette.bg,
        opacity: 0.2,
      });

    default:
      return generateDecorativeGridSvg({
        id: uniqueId,
        lineColor: design.palette.muted || design.palette.text,
        bgColor: design.palette.bg,
      });
  }
}

/**
 * 生成渐变线条（用于分隔）
 */
export function generateGradientLineSvg({
  x1 = '0%',
  y1 = '50%',
  x2 = '100%',
  y2 = '50%',
  color1 = 'var(--osd-accent)',
  color2 = 'transparent',
  width = '100%',
  height = '2px',
}: {
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
  color1?: string;
  color2?: string;
  width?: string;
  height?: string;
} = {}): string {
  return `<svg
  width="${width}"
  height="${height}"
  style="display: block;"
  aria-hidden="true"
  role="presentation"
>
  <defs>
    <linearGradient id="line-gradient" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#line-gradient)" />
</svg>`;
}
