import fs from 'fs/promises';
import path from 'path';
import type { Slide, ContentSlide, Outline, AdvancedTheme, TextDensity, MotionLevel, DesignSystem, SlideContent } from '@/types';
import { generatePageContentStream } from '@/lib/llm/claude';
import { generateHtmlPreview } from './react-generator';

// Theme metadata extracted from markdown files
export interface ThemeMeta {
  name: string;
  description: string;
  mode: 'dark' | 'light';
  palette: Record<string, string>;
  fonts: {
    display: string;
    body: string;
  };
  typeScale: {
    hero: string;
    heading: string;
    body: string;
    caption: string;
  };
  motion: {
    philosophy: 'static' | 'subtle' | 'rich';
    keyframes?: string;
  };
}

// Parse theme markdown file to extract design tokens
export async function parseThemeMarkdown(themeId: AdvancedTheme): Promise<ThemeMeta> {
  const themePath = path.join(process.cwd(), 'themes', `${themeId}.md`);
  const content = await fs.readFile(themePath, 'utf-8');

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';

  const nameMatch = frontmatter.match(/name:\s*(.+)/);
  const descMatch = frontmatter.match(/description:\s*(.+)/);
  const modeMatch = frontmatter.match(/mode:\s*(.+)/);

  // Extract palette from markdown table
  const palette: Record<string, string> = {};
  const paletteMatch = content.match(/## Palette[\s\S]*?(?=##|$)/);
  if (paletteMatch) {
    const lines = paletteMatch[0].split('\n');
    for (const line of lines) {
      const match = line.match(/\|\s*`?(\w+)`?\s*\|\s*`?([^`|]+)`?\s*\|/);
      if (match) {
        palette[match[1]] = match[2].trim();
      }
    }
  }

  // Extract typography info
  const fonts = { display: '', body: '' };
  const typeScale = { hero: '144px', heading: '64px', body: '32px', caption: '24px' };

  const typographyMatch = content.match(/## Typography[\s\S]*?(?=##|$)/);
  if (typographyMatch) {
    const displayFontMatch = typographyMatch[0].match(/Display font:\s*`?([^`\n]+)`?/);
    const bodyFontMatch = typographyMatch[0].match(/Body font:\s*`?([^`\n]+)`?/);
    if (displayFontMatch) fonts.display = displayFontMatch[1].trim();
    if (bodyFontMatch) fonts.body = bodyFontMatch[1].trim();

    const heroMatch = typographyMatch[0].match(/Hero title:\s*(\d+)\s*px/);
    const headingMatch = typographyMatch[0].match(/Page heading:\s*(\d+)\s*px/);
    const bodyMatch = typographyMatch[0].match(/Body text:\s*(\d+)\s*px/);
    const captionMatch = typographyMatch[0].match(/Caption.*?:\s*(\d+)\s*px/);

    if (heroMatch) typeScale.hero = heroMatch[1] + 'px';
    if (headingMatch) typeScale.heading = headingMatch[1] + 'px';
    if (bodyMatch) typeScale.body = bodyMatch[1] + 'px';
    if (captionMatch) typeScale.caption = captionMatch[1] + 'px';
  }

  // Extract motion philosophy
  let motion: ThemeMeta['motion'] = { philosophy: 'subtle' };
  const motionMatch = content.match(/## Motion[\s\S]*?(?=##|$)/);
  if (motionMatch) {
    const philosophyMatch = motionMatch[0].match(/Philosophy:\s*(\w+)/);
    if (philosophyMatch) {
      const p = philosophyMatch[1].toLowerCase();
      if (p === 'static' || p === 'subtle' || p === 'rich') {
        motion.philosophy = p;
      }
    }

    // Extract keyframes CSS
    const keyframesMatch = motionMatch[0].match(/```css\n([\s\S]*?)```/);
    if (keyframesMatch) {
      motion.keyframes = keyframesMatch[1].trim();
    }
  }

  return {
    name: nameMatch?.[1] || themeId,
    description: descMatch?.[1] || '',
    mode: (modeMatch?.[1] as 'dark' | 'light') || 'dark',
    palette,
    fonts,
    typeScale,
    motion,
  };
}

// Generate CSS variables for design system
function generateDesignSystemCSS(theme: ThemeMeta, design?: DesignSystem): string {
  // Use design system palette if provided, otherwise use theme palette
  const bg = design?.palette?.bg || theme.palette.bg || '#ffffff';
  const surface = design?.palette?.surface || theme.palette.surface || '#f5f5f5';
  const text = design?.palette?.text || theme.palette.text || '#000000';
  const accent = design?.palette?.accent || theme.palette.accent || '#10B981';
  const accent2 = theme.palette.accent2 || accent;
  const muted = design?.palette?.muted || theme.palette.muted || '#888888';

  return `
:root {
  /* Colors */
  --color-bg: ${bg};
  --color-surface: ${surface};
  --color-text: ${text};
  --color-accent: ${accent};
  --color-accent2: ${accent2};
  --color-muted: ${muted};

  /* Typography */
  --font-display: ${theme.fonts.display || 'system-ui'};
  --font-body: ${theme.fonts.body || 'system-ui'};

  /* Type Scale */
  --text-hero: ${theme.typeScale.hero};
  --text-heading: ${theme.typeScale.heading};
  --text-body: ${theme.typeScale.body};
  --text-caption: ${theme.typeScale.caption};
}
`.trim();
}

// Generate React component for a slide
function generateSlideComponent(
  slide: Slide,
  theme: ThemeMeta,
  pageNum: number,
  totalPages: number,
  motionLevel: MotionLevel
): string {
  const applyMotion = theme.motion.philosophy !== 'static' && motionLevel !== 'static';
  const motionStyle = applyMotion ? getMotionStyle(theme, motionLevel) : '';

  if (slide.page_type === 'cover') {
    return generateCoverComponent(slide, theme, pageNum, totalPages, motionStyle);
  }

  if (slide.page_type === 'end') {
    return generateEndComponent(slide, theme, pageNum, totalPages);
  }

  return generateContentComponent(slide as ContentSlide, theme, pageNum, totalPages, motionStyle);
}

function getMotionStyle(theme: ThemeMeta, motionLevel: MotionLevel): string {
  if (theme.motion.philosophy === 'static' || motionLevel === 'static') {
    return '';
  }

  const keyframes = theme.motion.keyframes || '';
  const animationDuration = motionLevel === 'rich' ? '800ms' : '600ms';

  return `
<style>{\`${keyframes}\`}</style>
<style>{\`
  .animate-in { animation: fadeUp ${animationDuration} ease-out both; }
\`}</style>`;
}

function generateCoverComponent(
  slide: Slide,
  theme: ThemeMeta,
  pageNum: number,
  totalPages: number,
  motionStyle: string
): string {
  const isNeonTerminal = theme.name === 'Neon Terminal';
  const isPaperPress = theme.name === 'Paper Press';
  const isEditorialNoir = theme.name === 'Editorial Noir';
  const coverSlide = slide as { title: string; subtitle?: string };

  const containerStyle = {
    width: '100%',
    height: '100%',
    background: theme.palette.bg || '#ffffff',
    color: theme.palette.text || '#000000',
    padding: isPaperPress ? '120px 140px' : isEditorialNoir ? '100px 120px' : '80px 100px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    gap: isPaperPress ? '56px' : isEditorialNoir ? '48px' : '40px',
    border: isNeonTerminal ? '1px solid #1a2230' : undefined,
    boxSizing: 'border-box' as const,
  };

  return `
<div style={${JSON.stringify(containerStyle)}}>
  ${motionStyle}
  ${isNeonTerminal ? `<Eyebrow>chapter 01</Eyebrow>` : ''}
  ${isPaperPress ? `<Eyebrow>Field notes · 2026</Eyebrow>` : ''}
  ${isEditorialNoir ? `<Eyebrow>Volume 04 · Spring 2026</Eyebrow>` : ''}
  <Title>${coverSlide.title}</Title>
  ${coverSlide.subtitle ? `<p style={{ fontSize: ${theme.typeScale.body}, lineHeight: 1.6, color: '${theme.palette.muted}', maxWidth: 1200, margin: 0 }}>${coverSlide.subtitle}</p>` : ''}
  <Footer pageNum={${pageNum}} total={${totalPages}} />
</div>`;
}

function generateEndComponent(
  slide: Slide,
  theme: ThemeMeta,
  pageNum: number,
  totalPages: number
): string {
  const endSlide = slide as { title?: string; author?: string };
  const containerStyle = {
    width: '100%',
    height: '100%',
    background: theme.palette.bg || '#ffffff',
    color: theme.palette.text || '#000000',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
  };

  return `
<div style={${JSON.stringify(containerStyle)}}>
  <Title>${endSlide.title || 'Thank You'}</Title>
  ${endSlide.author ? `<p style={{ fontSize: ${theme.typeScale.body}, color: '${theme.palette.muted}' }}>${endSlide.author}</p>` : ''}
  <Footer pageNum={${pageNum}} total={${totalPages}} />
</div>`;
}

function generateContentComponent(
  slide: ContentSlide,
  theme: ThemeMeta,
  pageNum: number,
  totalPages: number,
  motionStyle: string
): string {
  const containerStyle = {
    width: '100%',
    height: '100%',
    background: theme.palette.bg || '#ffffff',
    color: theme.palette.text || '#000000',
    padding: '80px 100px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '32px',
  };

  return `
<div style={${JSON.stringify(containerStyle)}}>
  ${motionStyle}
  <Eyebrow>${slide.title}</Eyebrow>
  <Title>${slide.title}</Title>
  <div style={{ flex: 1 }}>
    {/* Content will be generated by AI */}
  </div>
  <Footer pageNum={${pageNum}} total={${totalPages}} />
</div>`;
}

// Main function to generate React slides for advanced mode
export async function generateAdvancedSlides(
  outline: Outline,
  themeId: AdvancedTheme,
  options: {
    aesthetic?: string | null;
    pageCount?: number | null;
    textDensity?: TextDensity | null;
    motionLevel?: MotionLevel | null;
    design?: DesignSystem | null;
  } = {}
): Promise<{ components: string[]; designCSS: string; theme: ThemeMeta }> {
  const theme = await parseThemeMarkdown(themeId);
  const designCSS = generateDesignSystemCSS(theme, options.design || undefined);
  const motionLevel = options.motionLevel || 'subtle';

  const components: string[] = [];

  for (let i = 0; i < outline.slides.length; i++) {
    const component = generateSlideComponent(
      outline.slides[i],
      theme,
      i + 1,
      outline.slides.length,
      motionLevel
    );
    components.push(component);
  }

  return { components, designCSS, theme };
}

// Generate full React component file
export async function generateReactSlideFile(
  outline: Outline,
  themeId: AdvancedTheme,
  options: {
    aesthetic?: string | null;
    pageCount?: number | null;
    textDensity?: TextDensity | null;
    motionLevel?: MotionLevel | null;
    design?: DesignSystem | null;
  } = {}
): Promise<string> {
  const { components, designCSS, theme } = await generateAdvancedSlides(outline, themeId, options);

  return `// Generated by Kami Slides - ${theme.name}
// Theme: ${theme.description}

import React from 'react';

// Design System CSS
const designCSS = \`${designCSS}\`;

// Fixed Components
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1 style={{
    fontFamily: '${theme.fonts.display}',
    fontSize: ${theme.typeScale.hero},
    fontWeight: 700,
    lineHeight: 1.05,
    margin: 0,
    color: '${theme.palette.text}',
  }}>
    {children}
  </h1>
);

const Footer = ({ pageNum, total }: { pageNum: number; total: number }) => (
  <div style={{
    position: 'absolute',
    left: 100,
    right: 100,
    bottom: 40,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 20,
    color: '${theme.palette.muted}',
    borderTop: '1px solid ${theme.palette.muted}40',
    paddingTop: 16,
  }}>
    <span>${theme.name}</span>
    <span>{String(pageNum).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
  </div>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontSize: ${theme.typeScale.caption},
    fontWeight: 500,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '${theme.palette.accent}',
  }}>
    {children}
  </div>
);

// Slide Pages
${components.map((comp, i) => `
export const Page${i + 1} = () => (
  ${comp}
);`).join('\n')}

// All pages export
export const pages = [${components.map((_, i) => `Page${i + 1}`).join(', ')}];
`;
}

// Generate HTML for a single slide using advanced theme (for preview)
export async function generateAdvancedSlideHtml(
  slide: Slide,
  themeId: AdvancedTheme,
  pageNum: number,
  totalPages: number,
  motionLevel: MotionLevel = 'subtle',
  context?: string,
  onStream?: (token: string) => void
): Promise<string> {
  // For content slides, generate AI content if not already present
  if (slide.page_type === 'content') {
    const contentSlide = slide as ContentSlide;

    // If no content or content is empty, generate it via AI
    if (!contentSlide.content || Object.keys(contentSlide.content).length === 0) {
      console.log(`[Advanced] Generating AI content for slide ${pageNum}: ${contentSlide.title}`);

      try {
        const generatedContent = await generatePageContentStream(
          {
            title: contentSlide.title,
            content_type: contentSlide.content_type,
            summary: contentSlide.summary,
          },
          context || `主题：${contentSlide.title}`,
          onStream || (() => {})
        );

        contentSlide.content = generatedContent;
        console.log(`[Advanced] AI content generated for slide ${pageNum}`);
      } catch (error) {
        console.error(`[Advanced] Failed to generate AI content for slide ${pageNum}:`, error);
        // Continue with empty content, will show summary
      }
    }
  }

  // 使用新的 React 风格 HTML 预览生成器
  return generateHtmlPreview(slide, themeId, pageNum, totalPages);
}

// Render content based on content_type
function renderContent(slide: ContentSlide, theme: ThemeMeta): string {
  const content = slide.content;
  if (!content) {
    return `<p style="color:${theme.palette.muted};font-size:${theme.typeScale.body};line-height:1.6;">${slide.summary || ''}</p>`;
  }

  const accent = theme.palette.accent || '#10B981';
  const muted = theme.palette.muted || '#888888';
  const text = theme.palette.text || '#000000';

  switch (slide.content_type) {
    case 'list': {
      const items = (content as { items: { title: string; description?: string; icon?: string }[] }).items || [];
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:24px;">
        ${items.map(item => `
          <div style="padding:20px;background:${theme.palette.surface || '#f5f5f5'}20;border-radius:12px;">
            <h4 style="font-size:24px;font-weight:600;margin:0 0 8px 0;color:${text};">${item.title}</h4>
            ${item.description ? `<p style="font-size:18px;color:${muted};margin:0;line-height:1.5;">${item.description}</p>` : ''}
          </div>
        `).join('')}
      </div>`;
    }

    case 'data-cards': {
      const items = (content as { items: { label: string; value: string | number; unit?: string; insight?: string }[] }).items || [];
      return `<div style="display:grid;grid-template-columns:repeat(${Math.min(items.length, 4)},1fr);gap:32px;">
        ${items.map(item => `
          <div style="text-align:center;padding:32px;background:${theme.palette.surface || '#f5f5f5'}20;border-radius:16px;">
            <div style="font-size:56px;font-weight:700;color:${accent};margin-bottom:8px;">${item.value}${item.unit || ''}</div>
            <div style="font-size:20px;color:${muted};">${item.label}</div>
            ${item.insight ? `<div style="font-size:16px;color:${muted};margin-top:8px;opacity:0.8;">${item.insight}</div>` : ''}
          </div>
        `).join('')}
      </div>`;
    }

    case 'quote': {
      const quoteContent = content as { quote: string; author?: string; source?: string };
      return `<div style="max-width:1200px;margin:0 auto;text-align:center;">
        <blockquote style="font-size:48px;font-weight:600;line-height:1.4;color:${text};font-style:italic;margin:0 0 24px 0;">
          "${quoteContent.quote}"
        </blockquote>
        ${quoteContent.author ? `<p style="font-size:24px;color:${accent};margin:0;">— ${quoteContent.author}</p>` : ''}
        ${quoteContent.source ? `<p style="font-size:18px;color:${muted};margin:8px 0 0 0;">${quoteContent.source}</p>` : ''}
      </div>`;
    }

    case 'timeline': {
      const events = (content as { events: { time: string; title: string; description?: string }[] }).events || [];
      return `<div style="display:flex;flex-direction:column;gap:24px;">
        ${events.map((event, i) => `
          <div style="display:flex;gap:32px;align-items:flex-start;">
            <div style="min-width:120px;font-size:20px;font-weight:600;color:${accent};">${event.time}</div>
            <div style="flex:1;padding-left:24px;border-left:2px solid ${accent}40;">
              <h4 style="font-size:24px;font-weight:600;margin:0 0 8px 0;color:${text};">${event.title}</h4>
              ${event.description ? `<p style="font-size:18px;color:${muted};margin:0;line-height:1.5;">${event.description}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>`;
    }

    case 'paragraph': {
      const paraContent = content as { text: string; highlight?: string[] };
      let text = paraContent.text || slide.summary || '';
      // Highlight specified terms
      if (paraContent.highlight) {
        paraContent.highlight.forEach(term => {
          text = text.replace(new RegExp(term, 'g'), `<span style="color:${accent};font-weight:600;">${term}</span>`);
        });
      }
      return `<div style="max-width:1200px;">
        <p style="font-size:${theme.typeScale.body};line-height:1.8;color:${text};">${text}</p>
      </div>`;
    }

    case 'comparison-feature': {
      const compContent = content as { subjects: [string, string]; items: { subject1_feature: string; subject2_feature: string }[]; conclusion?: string };
      return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;">
        <div>
          <h3 style="font-size:28px;font-weight:600;margin:0 0 24px 0;color:${accent};text-align:center;">${compContent.subjects?.[0] || 'A'}</h3>
          ${compContent.items?.map(item => `<div style="padding:16px;margin-bottom:12px;background:${theme.palette.surface || '#f5f5f5'}20;border-radius:8px;font-size:20px;">${item.subject1_feature}</div>`).join('') || ''}
        </div>
        <div>
          <h3 style="font-size:28px;font-weight:600;margin:0 0 24px 0;color:${accent};text-align:center;">${compContent.subjects?.[1] || 'B'}</h3>
          ${compContent.items?.map(item => `<div style="padding:16px;margin-bottom:12px;background:${theme.palette.surface || '#f5f5f5'}20;border-radius:8px;font-size:20px;">${item.subject2_feature}</div>`).join('') || ''}
        </div>
      </div>
      ${compContent.conclusion ? `<p style="font-size:20px;color:${muted};text-align:center;margin-top:24px;">${compContent.conclusion}</p>` : ''}`;
    }

    default:
      // Fallback: show summary
      return `<p style="color:${muted};font-size:${theme.typeScale.body};line-height:1.6;">${slide.summary || ''}</p>`;
  }
}

// Generate HTML string from theme metadata
function generateSlideHtmlFromTheme(
  slide: Slide,
  theme: ThemeMeta,
  pageNum: number,
  totalPages: number,
  motionLevel: MotionLevel
): string {
  const isNeonTerminal = theme.name === 'Neon Terminal';
  const isPaperPress = theme.name === 'Paper Press';
  const isEditorialNoir = theme.name === 'Editorial Noir';

  const bg = theme.palette.bg || '#ffffff';
  const text = theme.palette.text || '#000000';
  const accent = theme.palette.accent || '#10B981';
  const muted = theme.palette.muted || '#888888';

  const padding = isPaperPress ? '120px 140px' : isEditorialNoir ? '100px 120px' : '80px 100px';
  const gap = isPaperPress ? '56px' : isEditorialNoir ? '48px' : '40px';

  // Motion animations
  const motionCSS = theme.motion.keyframes || '';
  const animation = motionLevel !== 'static' && theme.motion.philosophy !== 'static'
    ? 'animation: fadeUp 600ms ease-out both;'
    : '';

  // Base section style with fixed dimensions
  const sectionBase = `width:1920px;height:1080px;position:relative;background:${bg};color:${text};box-sizing:border-box;`;

  if (slide.page_type === 'cover') {
    return `
<section style="${sectionBase}padding:${padding};display:flex;flex-direction:column;justify-content:center;gap:${gap};${isNeonTerminal ? 'border:1px solid #1a2230;' : ''}${animation}">
  <style>${motionCSS}</style>
  ${isNeonTerminal ? `<div style="font-size:${theme.typeScale.caption};color:${accent};font-family:${theme.fonts.display};letter-spacing:0.05em;">[chapter 01]</div>` : ''}
  ${isPaperPress ? `<div style="font-size:${theme.typeScale.caption};color:${accent};font-family:${theme.fonts.body};letter-spacing:0.3em;text-transform:uppercase;">FIELD NOTES · 2026</div>` : ''}
  ${isEditorialNoir ? `<div style="font-size:${theme.typeScale.caption};color:${accent};font-family:${theme.fonts.body};letter-spacing:0.24em;text-transform:uppercase;">VOLUME 04 · SPRING 2026</div>` : ''}
  <h1 style="font-family:${theme.fonts.display};font-size:${theme.typeScale.hero};font-weight:700;line-height:1.05;margin:0;color:${text};">
    ${isNeonTerminal ? `<span style="color:${accent};text-shadow:0 0 16px ${accent}66;">$</span> ` : ''}${slide.title}
  </h1>
  ${slide.subtitle ? `<p style="font-size:${theme.typeScale.body};line-height:1.6;color:${muted};max-width:1200;margin:0;">${slide.subtitle}</p>` : ''}
  <div style="position:absolute;left:${isPaperPress ? '140' : isEditorialNoir ? '120' : '100'}px;right:${isPaperPress ? '140' : isEditorialNoir ? '120' : '100'}px;bottom:${isPaperPress ? '80' : isEditorialNoir ? '60' : '40'}px;display:flex;justify-content:space-between;font-size:20px;color:${muted};border-top:1px ${isPaperPress ? 'dashed' : 'solid'} ${muted}40;padding-top:16px;">
    <span>${theme.name}</span>
    <span>${String(pageNum).padStart(2, '0')}/${String(totalPages).padStart(2, '0')}</span>
  </div>
</section>`;
  }

  if (slide.page_type === 'end') {
    return `
<section style="${sectionBase}display:flex;flex-direction:column;justify-content:center;align-items:center;gap:24px;">
  <h1 style="font-family:${theme.fonts.display};font-size:${theme.typeScale.hero};font-weight:700;margin:0;color:${text};">
    ${slide.title || 'Thank You'}
  </h1>
  ${slide.author ? `<p style="font-size:${theme.typeScale.body};color:${muted};">${slide.author}</p>` : ''}
  <div style="position:absolute;left:100px;right:100px;bottom:40px;display:flex;justify-content:space-between;font-size:20px;color:${muted};border-top:1px solid ${muted}40;padding-top:16px;">
    <span>${theme.name}</span>
    <span>${String(pageNum).padStart(2, '0')}/${String(totalPages).padStart(2, '0')}</span>
  </div>
</section>`;
  }

  // Content slide - render actual AI-generated content
  const contentSlide = slide as ContentSlide;
  const contentHtml = renderContent(contentSlide, theme);

  return `
<section style="${sectionBase}padding:80px 100px;display:flex;flex-direction:column;gap:32px;${animation}">
  <style>${motionCSS}</style>
  <div style="font-size:${theme.typeScale.caption};color:${accent};font-family:${theme.fonts.body};letter-spacing:0.2em;text-transform:uppercase;">
    ${contentSlide.title}
  </div>
  <h2 style="font-family:${theme.fonts.display};font-size:${theme.typeScale.heading};font-weight:700;margin:0;color:${text};">
    ${contentSlide.title}
  </h2>
  <div style="flex:1;overflow:auto;">
    ${contentHtml}
  </div>
  <div style="position:absolute;left:100px;right:100px;bottom:40px;display:flex;justify-content:space-between;font-size:20px;color:${muted};border-top:1px solid ${muted}40;padding-top:16px;">
    <span>${theme.name}</span>
    <span>${String(pageNum).padStart(2, '0')}/${String(totalPages).padStart(2, '0')}</span>
  </div>
</section>`;
}
