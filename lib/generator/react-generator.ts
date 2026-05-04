/**
 * React 组件生成器 - 生成 open-slide 风格的 React 幻灯片组件
 */

import type { Slide, ContentSlide, Outline, AdvancedTheme } from '@/types';
import { themeDesigns, type DesignSystem, CANVAS_WIDTH, CANVAS_HEIGHT } from './design-system';
import { PAD_X, PAD_Y, keyframes, ease } from './templates';
import { generateThemeDecoration } from './decorations';

// 生成设计系统导出代码
function generateDesignExport(themeId: AdvancedTheme): string {
  const design = themeDesigns[themeId] || themeDesigns['neon-terminal'];

  return `export const design: DesignSystem = {
  palette: {
    bg: '${design.palette.bg}',
    text: '${design.palette.text}',
    accent: '${design.palette.accent}',
    surface: '${design.palette.surface || design.palette.bg}',
    muted: '${design.palette.muted || design.palette.text}',
  },
  fonts: {
    display: '${design.fonts.display}',
    body: '${design.fonts.body}',
    mono: '${design.fonts.mono || 'ui-monospace, monospace'}',
  },
  typeScale: {
    hero: ${design.typeScale.hero},
    heading: ${design.typeScale.heading || Math.round(design.typeScale.hero * 0.5)},
    body: ${design.typeScale.body},
    caption: ${design.typeScale.caption || Math.round(design.typeScale.body * 0.7)},
  },
  radius: ${design.radius},
};`;
}

// 生成 Style 组件
function generateStyleComponent(): string {
  return `const keyframes = \`
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeRight {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes scale {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes lineGrow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes cursorBlink {
  to { visibility: hidden; }
}
@keyframes glow {
  0%, 100% { text-shadow: 0 0 16px var(--osd-accent); }
  50% { text-shadow: 0 0 32px var(--osd-accent), 0 0 48px var(--osd-accent); }
}
.animate-fadeup { animation: fadeUp 1000ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-fade { animation: fade 1200ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-faderight { animation: fadeRight 800ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-scale { animation: scale 1000ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-line { animation: lineGrow 900ms cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: left center; }
\`;

const Style = () => <style>{keyframes}</style>;`;
}

// 生成 Eyebrow 组件
function generateEyebrowComponent(): string {
  return `const Eyebrow = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <div
    className="animate-fadeup"
    style={{
      animationDelay: \`\${delay}ms\`,
      fontFamily: 'var(--osd-font-body)',
      fontSize: 22,
      fontWeight: 500,
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color: 'var(--osd-accent)',
    }}
  >
    {children}
  </div>
);`;
}

// 生成 PageNumber 组件
function generatePageNumberComponent(): string {
  return `const PageNumber = ({ n, total, label }: { n: number; total: number; label?: string }) => (
  <div
    style={{
      position: 'absolute',
      left: ${PAD_X},
      bottom: 60,
      fontFamily: 'var(--osd-font-body)',
      fontSize: 18,
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: 'var(--osd-muted)',
    }}
  >
    {label ? \`\${label} · \` : ''}{String(n).padStart(2, '0')} / {String(total).padStart(2, '0')}
  </div>
);`;
}

// 生成装饰性 SVG 组件
function generateDecorationComponent(themeId: AdvancedTheme, slideIndex: number): string {
  const design = themeDesigns[themeId] || themeDesigns['neon-terminal'];
  const uniqueId = `deco-${slideIndex}`;

  // 根据主题生成不同的装饰
  switch (themeId) {
    case 'neon-terminal':
      return `
    {/* neon glow effect */}
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.2 }}
      aria-hidden="true"
      role="presentation"
    >
      <title>neon glow</title>
      <defs>
        <radialGradient id="neon-glow-${slideIndex}" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stop-color="var(--osd-accent)" stopOpacity="0.6" />
          <stop offset="100%" stop-color="var(--osd-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={\`url(#neon-glow-${slideIndex})\`} />
    </svg>
    {/* grid pattern */}
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.3 }}
      aria-hidden="true"
      role="presentation"
    >
      <title>decorative grid</title>
      <defs>
        <pattern id="${uniqueId}" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="var(--osd-accent)" strokeWidth="1" />
        </pattern>
        <radialGradient id="${uniqueId}-vignette" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="var(--osd-bg)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--osd-bg)" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={\`url(#${uniqueId})\`} />
      <rect width="100%" height="100%" fill={\`url(#${uniqueId}-vignette)\`} />
    </svg>`;

    case 'paper-press':
      return `
    {/* paper texture */}
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025, mixBlendMode: 'multiply' }}
      aria-hidden="true"
      role="presentation"
    >
      <title>paper texture</title>
      <defs>
        <filter id="paper-noise-${slideIndex}">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={\`url(#paper-noise-${slideIndex})\`} />
    </svg>
    {/* faint grid */}
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4 }}
      aria-hidden="true"
      role="presentation"
    >
      <title>decorative grid</title>
      <defs>
        <pattern id="${uniqueId}" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="var(--osd-muted)" strokeWidth="1" />
        </pattern>
        <radialGradient id="${uniqueId}-vignette" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="var(--osd-bg)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--osd-bg)" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={\`url(#${uniqueId})\`} />
      <rect width="100%" height="100%" fill={\`url(#${uniqueId}-vignette)\`} />
    </svg>`;

    case 'editorial-noir':
      return `
    {/* dark gradient */}
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4 }}
      aria-hidden="true"
      role="presentation"
    >
      <title>dark gradient</title>
      <defs>
        <radialGradient id="dark-gradient-${slideIndex}" cx="70%" cy="70%" r="60%">
          <stop offset="0%" stop-color="var(--osd-accent)" stopOpacity="0.15" />
          <stop offset="100%" stop-color="var(--osd-bg)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={\`url(#dark-gradient-${slideIndex})\`} />
    </svg>
    {/* faint grid */}
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.2 }}
      aria-hidden="true"
      role="presentation"
    >
      <title>decorative grid</title>
      <defs>
        <pattern id="${uniqueId}" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="var(--osd-muted)" strokeWidth="1" />
        </pattern>
        <radialGradient id="${uniqueId}-vignette" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="var(--osd-bg)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--osd-bg)" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={\`url(#${uniqueId})\`} />
      <rect width="100%" height="100%" fill={\`url(#${uniqueId}-vignette)\`} />
    </svg>`;

    default:
      return `
    {/* faint grid */}
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }}
      aria-hidden="true"
      role="presentation"
    >
      <title>decorative grid</title>
      <defs>
        <pattern id="${uniqueId}" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="var(--osd-muted)" strokeWidth="1" />
        </pattern>
        <radialGradient id="${uniqueId}-vignette" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="var(--osd-bg)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--osd-bg)" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={\`url(#${uniqueId})\`} />
      <rect width="100%" height="100%" fill={\`url(#${uniqueId}-vignette)\`} />
    </svg>`;
  }
}

// 生成封面页组件
function generateCoverPage(slide: Slide, pageNum: number, totalPages: number, themeId: AdvancedTheme): string {
  const isNeonTerminal = themeId === 'neon-terminal';
  const isPaperPress = themeId === 'paper-press';
  const isEditorialNoir = themeId === 'editorial-noir';

  const eyebrowContent = isNeonTerminal
    ? 'CHAPTER 01'
    : isPaperPress
      ? 'FIELD NOTES · 2026'
      : isEditorialNoir
        ? 'VOLUME 04 · SPRING 2026'
        : '';

  const titleAccent = isNeonTerminal
    ? `<span style={{ color: 'var(--osd-accent)', textShadow: '0 0 16px var(--osd-accent)' }}>$</span>`
    : '';

  const coverSlide = slide as { title: string; subtitle?: string };
  const decoration = generateDecorationComponent(themeId, pageNum);

  return `const Page${pageNum}: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      fontFamily: 'var(--osd-font-body)',
      color: 'var(--osd-text)',
      background: 'var(--osd-bg)',
      position: 'relative',
      overflow: 'hidden',
      padding: \`\${${PAD_Y}}px \${${PAD_X}}px\`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    <Style />
    ${decoration}
    ${eyebrowContent ? `<Eyebrow delay={0}>${eyebrowContent}</Eyebrow>` : ''}
    <h1
      className="animate-fadeup"
      style={{
        animationDelay: '180ms',
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        fontWeight: 400,
        lineHeight: 1.02,
        letterSpacing: '-0.025em',
        margin: '40px 0 0',
        color: 'var(--osd-text)',
      }}
    >
      ${titleAccent}${coverSlide.title}
    </h1>
    ${coverSlide.subtitle ? `<p
      className="animate-fadeup"
      style={{
        animationDelay: '400ms',
        fontFamily: 'var(--osd-font-body)',
        fontSize: 36,
        lineHeight: 1.5,
        color: 'var(--osd-muted)',
        maxWidth: 1200,
        margin: '32px 0 0',
        fontWeight: 300,
      }}
    >
      ${coverSlide.subtitle}
    </p>` : ''}
    <PageNumber n={${pageNum}} total={${totalPages}} />
  </div>
);`;
}

// 生成尾页组件
function generateEndPage(slide: Slide, pageNum: number, totalPages: number): string {
  const endSlide = slide as { title?: string; author?: string };

  return `const Page${pageNum}: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      fontFamily: 'var(--osd-font-body)',
      color: 'var(--osd-text)',
      background: 'var(--osd-bg)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
    }}
  >
    <Style />
    <h1
      className="animate-fadeup"
      style={{
        animationDelay: '180ms',
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        fontWeight: 400,
        lineHeight: 1.02,
        color: 'var(--osd-text)',
      }}
    >
      ${endSlide.title || 'Thank You'}
    </h1>
    ${endSlide.author ? `<p
      className="animate-fadeup"
      style={{
        animationDelay: '320ms',
        fontFamily: 'var(--osd-font-body)',
        fontSize: 'var(--osd-size-body)',
        color: 'var(--osd-muted)',
      }}
    >
      ${endSlide.author}
    </p>` : ''}
    <PageNumber n={${pageNum}} total={${totalPages}} />
  </div>
);`;
}

// 生成内容页组件
function generateContentPage(slide: ContentSlide, pageNum: number, totalPages: number): string {
  const content = slide.content;
  let contentHtml = '';

  if (!content || Object.keys(content).length === 0) {
    // 无内容时显示 summary
    contentHtml = `<p
      className="animate-fadeup"
      style={{
        animationDelay: '320ms',
        fontFamily: 'var(--osd-font-body)',
        fontSize: 'var(--osd-size-body)',
        lineHeight: 1.6,
        color: 'var(--osd-muted)',
        maxWidth: 1200,
      }}
    >
      ${slide.summary || ''}
    </p>`;
  } else {
    // 根据内容类型生成
    switch (slide.content_type) {
      case 'list':
        contentHtml = generateListContent(content);
        break;
      case 'data-cards':
        contentHtml = generateDataCardsContent(content);
        break;
      case 'timeline':
        contentHtml = generateTimelineContent(content);
        break;
      case 'quote':
        contentHtml = generateQuoteContent(content);
        break;
      case 'comparison-feature':
        contentHtml = generateComparisonContent(content);
        break;
      case 'paragraph':
        contentHtml = generateParagraphContent(content);
        break;
      default:
        contentHtml = `<p style={{ color: 'var(--osd-muted)', fontSize: 'var(--osd-size-body)' }}>${slide.summary || ''}</p>`;
    }
  }

  return `const Page${pageNum}: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      fontFamily: 'var(--osd-font-body)',
      color: 'var(--osd-text)',
      background: 'var(--osd-bg)',
      position: 'relative',
      overflow: 'hidden',
      padding: \`\${${PAD_Y}}px \${${PAD_X}}px\`,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Style />
    <Eyebrow delay={0}>${slide.title}</Eyebrow>
    <h2
      className="animate-fadeup"
      style={{
        animationDelay: '180ms',
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-heading)',
        fontWeight: 400,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        margin: '16px 0 32px',
        color: 'var(--osd-text)',
      }}
    >
      ${slide.title}
    </h2>
    <div style={{ flex: 1, overflow: 'auto' }}>
      ${contentHtml}
    </div>
    <PageNumber n={${pageNum}} total={${totalPages}} />
  </div>
);`;
}

// 列表内容
function generateListContent(content: unknown): string {
  const items = (content as { items: { title: string; description?: string }[] }).items || [];

  return `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
    ${items.map((item, i) => `
    <div
      className="animate-fadeup"
      style={{
        animationDelay: \`${320 + i * 100}ms\`,
        padding: '20px 24px',
        background: 'var(--osd-surface)',
        borderRadius: 'var(--osd-radius)',
      }}
    >
      <h4 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--osd-text)' }}>${item.title}</h4>
      ${item.description ? `<p style={{ fontSize: 18, color: 'var(--osd-muted)', margin: 0, lineHeight: 1.5 }}>${item.description}</p>` : ''}
    </div>
    `).join('')}
  </div>`;
}

// 数据卡片内容
function generateDataCardsContent(content: unknown): string {
  const items = (content as { items: { label: string; value: string | number; unit?: string; insight?: string }[] }).items || [];

  return `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(${Math.min(items.length, 4)}, 1fr)', gap: 32 }}>
    ${items.map((item, i) => `
    <div
      className="animate-scale"
      style={{
        animationDelay: \`${320 + i * 100}ms\`,
        textAlign: 'center',
        padding: '32px',
        background: 'var(--osd-surface)',
        borderRadius: 'var(--osd-radius)',
      }}
    >
      <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--osd-accent)', marginBottom: 8 }}>${item.value}${item.unit || ''}</div>
      <div style={{ fontSize: 20, color: 'var(--osd-muted)' }}>${item.label}</div>
      ${item.insight ? `<div style={{ fontSize: 16, color: 'var(--osd-muted)', marginTop: 8, opacity: 0.8 }}>${item.insight}</div>` : ''}
    </div>
    `).join('')}
  </div>`;
}

// 时间线内容
function generateTimelineContent(content: unknown): string {
  const events = (content as { events: { time: string; title: string; description?: string }[] }).events || [];

  return `<div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    ${events.map((event, i) => `
    <div
      className="animate-faderight"
      style={{
        animationDelay: \`${320 + i * 150}ms\`,
        display: 'flex',
        gap: 32,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ minWidth: 120, fontSize: 20, fontWeight: 600, color: 'var(--osd-accent)' }}>${event.time}</div>
      <div style={{ flex: 1, paddingLeft: 24, borderLeft: '2px solid var(--osd-accent)' }}>
        <h4 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--osd-text)' }}>${event.title}</h4>
        ${event.description ? `<p style={{ fontSize: 18, color: 'var(--osd-muted)', margin: 0, lineHeight: 1.5 }}>${event.description}</p>` : ''}
      </div>
    </div>
    `).join('')}
  </div>`;
}

// 引用内容
function generateQuoteContent(content: unknown): string {
  const quoteContent = content as { quote: string; author?: string; source?: string };

  return `<div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
    <blockquote
      className="animate-fadeup"
      style={{
        animationDelay: '320ms',
        fontSize: 48,
        fontWeight: 600,
        lineHeight: 1.4,
        color: 'var(--osd-text)',
        fontStyle: 'italic',
        margin: '0 0 24px 0',
      }}
    >
      "${quoteContent.quote}"
    </blockquote>
    ${quoteContent.author ? `<p className="animate-fadeup" style={{ animationDelay: '480ms', fontSize: 24, color: 'var(--osd-accent)', margin: 0 }}>— ${quoteContent.author}</p>` : ''}
    ${quoteContent.source ? `<p className="animate-fadeup" style={{ animationDelay: '560ms', fontSize: 18, color: 'var(--osd-muted)', margin: '8px 0 0 0' }}>${quoteContent.source}</p>` : ''}
  </div>`;
}

// 对比内容
function generateComparisonContent(content: unknown): string {
  const compContent = content as { subjects: [string, string]; items: { subject1_feature: string; subject2_feature: string }[]; conclusion?: string };

  return `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
    <div>
      <h3 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 24px 0', color: 'var(--osd-accent)', textAlign: 'center' }}>${compContent.subjects?.[0] || 'A'}</h3>
      ${compContent.items?.map((item, i) => `
      <div
        className="animate-fadeup"
        style={{
          animationDelay: \`${320 + i * 100}ms\`,
          padding: 16,
          marginBottom: 12,
          background: 'var(--osd-surface)',
          borderRadius: 'var(--osd-radius)',
          fontSize: 20,
        }}
      >
        ${item.subject1_feature}
      </div>
      `).join('') || ''}
    </div>
    <div>
      <h3 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 24px 0', color: 'var(--osd-accent)', textAlign: 'center' }}>${compContent.subjects?.[1] || 'B'}</h3>
      ${compContent.items?.map((item, i) => `
      <div
        className="animate-fadeup"
        style={{
          animationDelay: \`${320 + i * 100}ms\`,
          padding: 16,
          marginBottom: 12,
          background: 'var(--osd-surface)',
          borderRadius: 'var(--osd-radius)',
          fontSize: 20,
        }}
      >
        ${item.subject2_feature}
      </div>
      `).join('') || ''}
    </div>
  </div>
  ${compContent.conclusion ? `<p className="animate-fadeup" style={{ animationDelay: '800ms', fontSize: 20, color: 'var(--osd-muted)', textAlign: 'center', marginTop: 24 }}>${compContent.conclusion}</p>` : ''}`;
}

// 段落内容
function generateParagraphContent(content: unknown): string {
  const paraContent = content as { text: string; highlight?: string[] };
  let text = paraContent.text || '';

  // 高亮处理
  if (paraContent.highlight) {
    paraContent.highlight.forEach(term => {
      text = text.replace(new RegExp(term, 'g'), `<span style="color: var(--osd-accent); font-weight: 600;">${term}</span>`);
    });
  }

  return `<div style={{ maxWidth: 1200 }}>
    <p
      className="animate-fadeup"
      style={{
        animationDelay: '320ms',
        fontSize: 'var(--osd-size-body)',
        lineHeight: 1.8,
        color: 'var(--osd-text)',
      }}
      dangerouslySetInnerHTML={{ __html: \`${text}\` }}
    />
  </div>`;
}

// 主生成函数
export function generateReactSlides(
  outline: Outline,
  themeId: AdvancedTheme
): string {
  const totalPages = outline.slides.length;

  // 生成各页面组件
  const pageComponents: string[] = [];

  outline.slides.forEach((slide, i) => {
    const pageNum = i + 1;

    if (slide.page_type === 'cover') {
      pageComponents.push(generateCoverPage(slide, pageNum, totalPages, themeId));
    } else if (slide.page_type === 'end') {
      pageComponents.push(generateEndPage(slide, pageNum, totalPages));
    } else {
      pageComponents.push(generateContentPage(slide as ContentSlide, pageNum, totalPages));
    }
  });

  // 生成 pages 导出
  const pagesExport = `export const pages = [${outline.slides.map((_, i) => `Page${i + 1}`).join(', ')}];`;

  // 组装完整文件
  return `// Generated by Kami Slides
// Theme: ${themeId}

import type { DesignSystem, Page } from '@/types';

${generateDesignExport(themeId)}

${generateStyleComponent()}

${generateEyebrowComponent()}

${generatePageNumberComponent()}

/* ─────────────── Pages ─────────────── */

${pageComponents.join('\n\n')}

${pagesExport}
`;
}

// 生成 HTML 预览（用于缩略图）
export function generateHtmlPreview(
  slide: Slide,
  themeId: AdvancedTheme,
  pageNum: number,
  totalPages: number
): string {
  const design = themeDesigns[themeId] || themeDesigns['neon-terminal'];

  // 生成 CSS 变量
  const cssVars = `
    --osd-bg: ${design.palette.bg};
    --osd-text: ${design.palette.text};
    --osd-accent: ${design.palette.accent};
    --osd-surface: ${design.palette.surface || design.palette.bg};
    --osd-muted: ${design.palette.muted || design.palette.text};
    --osd-font-display: ${design.fonts.display};
    --osd-font-body: ${design.fonts.body};
    --osd-size-hero: ${design.typeScale.hero}px;
    --osd-size-heading: ${design.typeScale.heading || Math.round(design.typeScale.hero * 0.5)}px;
    --osd-size-body: ${design.typeScale.body}px;
    --osd-radius: ${design.radius}px;
  `;

  // 生成内容
  let content = '';

  if (slide.page_type === 'cover') {
    const coverSlide = slide as { title: string; subtitle?: string };
    content = `
      <div style="padding: ${PAD_Y}px ${PAD_X}px; display: flex; flex-direction: column; justify-content: center; height: 100%;">
        <div style="font-size: 22px; font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase; color: var(--osd-accent); margin-bottom: 40px;">CHAPTER 01</div>
        <h1 style="font-family: var(--osd-font-display); font-size: var(--osd-size-hero); font-weight: 400; line-height: 1.02; margin: 0; color: var(--osd-text);">${coverSlide.title}</h1>
        ${coverSlide.subtitle ? `<p style="font-size: 36px; line-height: 1.5; color: var(--osd-muted); margin: 32px 0 0 0;">${coverSlide.subtitle}</p>` : ''}
      </div>
    `;
  } else if (slide.page_type === 'end') {
    const endSlide = slide as { title?: string; author?: string };
    content = `
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; gap: 24px;">
        <h1 style="font-family: var(--osd-font-display); font-size: var(--osd-size-hero); font-weight: 400; color: var(--osd-text);">${endSlide.title || 'Thank You'}</h1>
        ${endSlide.author ? `<p style="font-size: var(--osd-size-body); color: var(--osd-muted);">${endSlide.author}</p>` : ''}
      </div>
    `;
  } else {
    const contentSlide = slide as ContentSlide;
    // 使用 AI 生成的 content 渲染丰富内容
    const renderedContent = renderContentForPreview(contentSlide);

    content = `
      <div style="padding: ${PAD_Y}px ${PAD_X}px; display: flex; flex-direction: column; height: 100%;">
        <div style="font-size: 22px; font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase; color: var(--osd-accent);">${contentSlide.title}</div>
        <h2 style="font-family: var(--osd-font-display); font-size: var(--osd-size-heading); font-weight: 400; margin: 16px 0 32px; color: var(--osd-text);">${contentSlide.title}</h2>
        <div style="flex: 1; overflow: auto;">
          ${renderedContent}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    body {
      font-family: var(--osd-font-body);
      color: var(--osd-text);
      background: var(--osd-bg);
      ${cssVars}
    }
    section { width: ${CANVAS_WIDTH}px; height: ${CANVAS_HEIGHT}px; position: relative; }
  </style>
</head>
<body>
  <section>
    ${content}
    <div style="position: absolute; left: ${PAD_X}px; bottom: 60px; font-size: 18px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--osd-muted);">
      ${String(pageNum).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}
    </div>
  </section>
</body>
</html>`;
}

// 为预览渲染内容
function renderContentForPreview(slide: ContentSlide): string {
  const content = slide.content;

  if (!content || Object.keys(content).length === 0) {
    return `<p style="font-size: var(--osd-size-body); line-height: 1.6; color: var(--osd-muted);">${slide.summary || ''}</p>`;
  }

  switch (slide.content_type) {
    case 'list': {
      const items = (content as { items: { title: string; description?: string }[] }).items || [];
      return `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
        ${items.map(item => `
          <div style="padding: 20px 24px; background: var(--osd-surface); border-radius: var(--osd-radius);">
            <h4 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: var(--osd-text);">${item.title}</h4>
            ${item.description ? `<p style="font-size: 18px; color: var(--osd-muted); margin: 0; line-height: 1.5;">${item.description}</p>` : ''}
          </div>
        `).join('')}
      </div>`;
    }

    case 'data-cards': {
      const items = (content as { items: { label: string; value: string | number; unit?: string; insight?: string }[] }).items || [];
      return `<div style="display: grid; grid-template-columns: repeat(${Math.min(items.length, 4)}, 1fr); gap: 32px;">
        ${items.map(item => `
          <div style="text-align: center; padding: 32px; background: var(--osd-surface); border-radius: var(--osd-radius);">
            <div style="font-size: 56px; font-weight: 700; color: var(--osd-accent); margin-bottom: 8px;">${item.value}${item.unit || ''}</div>
            <div style="font-size: 20px; color: var(--osd-muted);">${item.label}</div>
            ${item.insight ? `<div style="font-size: 16px; color: var(--osd-muted); margin-top: 8px; opacity: 0.8;">${item.insight}</div>` : ''}
          </div>
        `).join('')}
      </div>`;
    }

    case 'timeline': {
      const events = (content as { events: { time: string; title: string; description?: string }[] }).events || [];
      return `<div style="display: flex; flex-direction: column; gap: 24px;">
        ${events.map(event => `
          <div style="display: flex; gap: 32px; align-items: flex-start;">
            <div style="min-width: 120px; font-size: 20px; font-weight: 600; color: var(--osd-accent);">${event.time}</div>
            <div style="flex: 1; padding-left: 24px; border-left: 2px solid var(--osd-accent);">
              <h4 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: var(--osd-text);">${event.title}</h4>
              ${event.description ? `<p style="font-size: 18px; color: var(--osd-muted); margin: 0; line-height: 1.5;">${event.description}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>`;
    }

    case 'quote': {
      const quoteContent = content as { quote: string; author?: string; source?: string };
      return `<div style="max-width: 1200px; margin: 0 auto; text-align: center;">
        <blockquote style="font-size: 48px; font-weight: 600; line-height: 1.4; color: var(--osd-text); font-style: italic; margin: 0 0 24px 0;">
          "${quoteContent.quote}"
        </blockquote>
        ${quoteContent.author ? `<p style="font-size: 24px; color: var(--osd-accent); margin: 0;">— ${quoteContent.author}</p>` : ''}
        ${quoteContent.source ? `<p style="font-size: 18px; color: var(--osd-muted); margin: 8px 0 0 0;">${quoteContent.source}</p>` : ''}
      </div>`;
    }

    case 'comparison-feature': {
      const compContent = content as { subjects: [string, string]; items: { subject1_feature: string; subject2_feature: string }[]; conclusion?: string };
      return `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <div>
          <h3 style="font-size: 28px; font-weight: 600; margin: 0 0 24px 0; color: var(--osd-accent); text-align: center;">${compContent.subjects?.[0] || 'A'}</h3>
          ${compContent.items?.map(item => `<div style="padding: 16px; margin-bottom: 12px; background: var(--osd-surface); border-radius: var(--osd-radius); font-size: 20px;">${item.subject1_feature}</div>`).join('') || ''}
        </div>
        <div>
          <h3 style="font-size: 28px; font-weight: 600; margin: 0 0 24px 0; color: var(--osd-accent); text-align: center;">${compContent.subjects?.[1] || 'B'}</h3>
          ${compContent.items?.map(item => `<div style="padding: 16px; margin-bottom: 12px; background: var(--osd-surface); border-radius: var(--osd-radius); font-size: 20px;">${item.subject2_feature}</div>`).join('') || ''}
        </div>
      </div>
      ${compContent.conclusion ? `<p style="font-size: 20px; color: var(--osd-muted); text-align: center; margin-top: 24px;">${compContent.conclusion}</p>` : ''}`;
    }

    case 'paragraph': {
      const paraContent = content as { text: string; highlight?: string[] };
      let text = paraContent.text || slide.summary || '';
      if (paraContent.highlight) {
        paraContent.highlight.forEach(term => {
          text = text.replace(new RegExp(term, 'g'), `<span style="color: var(--osd-accent); font-weight: 600;">${term}</span>`);
        });
      }
      return `<div style="max-width: 1200px;">
        <p style="font-size: var(--osd-size-body); line-height: 1.8; color: var(--osd-text);">${text}</p>
      </div>`;
    }

    default:
      return `<p style="font-size: var(--osd-size-body); line-height: 1.6; color: var(--osd-muted);">${slide.summary || ''}</p>`;
  }
}
