import fs from 'fs/promises';
import path from 'path';
import type { Slide, ContentSlide, Outline, AdvancedTheme } from '@/types';
import { generateCover, generateEnd } from './cover';
import { generateDataCardsSlide, generateDataChartSlide, generateChartConfig } from './data';
import { generateComparisonFeatureSlide, generateComparisonTableSlide } from './comparison';
import { generateListSlide } from './list';
import { generateTimelineSlide } from './timeline';
import { generateQuoteSlide } from './quote';
import { generateParagraphSlide } from './paragraph';
import { generateArchitectureSlide } from './architecture';
import { generatePageContentStream } from '@/lib/llm/claude';
import { SSE_EVENT_TYPES } from '@/lib/utils';
import { generateAdvancedSlideHtml, parseThemeMarkdown } from './advanced';
import { generateReactSlides, generateHtmlPreview } from './react-generator';

export type StreamCallback = (event: {
  type: typeof SSE_EVENT_TYPES[keyof typeof SSE_EVENT_TYPES];
  text?: string;
  content?: Record<string, unknown>;
  error?: string;
}) => void;

// Advanced theme IDs
const ADVANCED_THEMES: AdvancedTheme[] = ['neon-terminal', 'paper-press', 'editorial-noir'];

function isAdvancedTheme(themeId: string): boolean {
  return ADVANCED_THEMES.includes(themeId as AdvancedTheme);
}

// 生成单页完整 HTML（用于缩略图预览）
export async function generateSinglePageHtml(
  slideHtml: string,
  themeId: string,
  pageIndex: number,
  totalPages: number
): Promise<string> {
  console.log('[Generator] generateSinglePageHtml called, themeId:', themeId, 'pageIndex:', pageIndex);
  console.log('[Generator] slideHtml length:', slideHtml.length);
  console.log('[Generator] slideHtml preview:', slideHtml.substring(0, 200));

  let style = '';

  if (isAdvancedTheme(themeId)) {
    // For advanced themes, generate CSS from markdown
    try {
      const theme = await parseThemeMarkdown(themeId as AdvancedTheme);
      style = generateAdvancedThemeCSS(theme);
      console.log('[Generator] Advanced theme CSS generated, length:', style.length);
    } catch (error) {
      console.error('[Generator] Error parsing advanced theme:', error);
      // Fallback to default style
      style = 'body { margin: 0; padding: 0; }';
    }
  } else {
    // For template themes, read the style.css
    const stylePath = path.join(process.cwd(), 'templates', themeId, 'style.css');
    style = await fs.readFile(stylePath, 'utf-8');
    console.log('[Generator] Template style loaded, length:', style.length);
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    @font-face {
      font-family: 'Alibaba PuHuiTi';
      src: url('/fonts/AlibabaPuHuiTi-3/AlibabaPuHuiTi-Regular.ttf') format('truetype');
      font-weight: normal;
    }
    @font-face {
      font-family: 'Alibaba PuHuiTi';
      src: url('/fonts/AlibabaPuHuiTi-3/AlibabaPuHuiTi-Bold.ttf') format('truetype');
      font-weight: bold;
    }
    ${style}
    .slides-container {
      width: 1920px;
      height: 1080px;
      position: relative;
      transform-origin: top left;
    }
    section {
      width: 1920px;
      height: 1080px;
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="slides-container">
    ${slideHtml}
  </div>
  <script>lucide.createIcons();</script>
</body>
</html>`;

  console.log('[Generator] Full HTML generated, total length:', fullHtml.length);
  return fullHtml;
}

// Generate CSS from advanced theme metadata
function generateAdvancedThemeCSS(theme: { palette: Record<string, string>; fonts: { display: string; body: string }; typeScale: { hero: string; heading: string; body: string; caption: string } }): string {
  return `
:root {
  --bg: ${theme.palette.bg || '#ffffff'};
  --surface: ${theme.palette.surface || '#f5f5f5'};
  --text: ${theme.palette.text || '#000000'};
  --accent: ${theme.palette.accent || '#10B981'};
  --accent2: ${theme.palette.accent2 || theme.palette.accent || '#10B981'};
  --muted: ${theme.palette.muted || '#888888'};
}

body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ${theme.fonts.body};
}

.slides-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1, h2, h3 {
  font-family: ${theme.fonts.display};
}

.hero-title {
  font-size: ${theme.typeScale.hero};
  line-height: 1.05;
}

.page-heading {
  font-size: ${theme.typeScale.heading};
}

.body-text {
  font-size: ${theme.typeScale.body};
  line-height: 1.6;
}

.caption {
  font-size: ${theme.typeScale.caption};
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
`;
}

export async function generateSlideHtml(
  slide: Slide,
  themeId: string,
  totalPages: number,
  context?: string,
  onStream?: StreamCallback,
  motionLevel?: 'static' | 'subtle' | 'rich'
): Promise<{ html: string; aiLog?: string }> {
  // For cover and end pages, use simple generators
  if (slide.page_type === 'cover') {
    if (isAdvancedTheme(themeId)) {
      const html = await generateAdvancedSlideHtml(slide, themeId as AdvancedTheme, 1, totalPages, motionLevel || 'subtle', context);
      return { html };
    }
    return { html: generateCover(slide) };
  }

  if (slide.page_type === 'end') {
    if (isAdvancedTheme(themeId)) {
      const html = await generateAdvancedSlideHtml(slide, themeId as AdvancedTheme, totalPages, totalPages, motionLevel || 'subtle', context);
      return { html };
    }
    return { html: generateEnd(slide) };
  }

  // Content slides - generate content via AI then render HTML
  const contentSlide = slide as ContentSlide;

  console.log(`[Generator] Generating slide ${contentSlide.page_number}: ${contentSlide.title}, content_type: ${contentSlide.content_type}`);

  // Generate HTML based on theme type
  let html: string;

  if (isAdvancedTheme(themeId)) {
    // Advanced theme: use advanced generator with AI-generated content
    // Create a stream callback that forwards to the main callback
    const streamCallback = onStream
      ? (token: string) => {
          try {
            onStream({ type: SSE_EVENT_TYPES.AI_TEXT, text: token });
          } catch {
            // Ignore stream errors
          }
        }
      : undefined;

    html = await generateAdvancedSlideHtml(
      contentSlide,
      themeId as AdvancedTheme,
      contentSlide.page_number,
      totalPages,
      motionLevel || 'subtle',
      context,
      streamCallback
    );

    // Notify AI completion
    if (onStream) {
      onStream({ type: SSE_EVENT_TYPES.AI_COMPLETE });
    }
  } else {
    // Template theme: use existing generators
    switch (contentSlide.content_type) {
      case 'data-cards':
        html = generateDataCardsSlide(contentSlide, totalPages);
        break;
      case 'data-chart':
        html = generateDataChartSlide(contentSlide, totalPages);
        break;
      case 'comparison-feature':
        html = generateComparisonFeatureSlide(contentSlide, totalPages);
        break;
      case 'comparison-table':
        html = generateComparisonTableSlide(contentSlide, totalPages);
        break;
      case 'timeline':
        html = generateTimelineSlide(contentSlide, totalPages);
        break;
      case 'quote':
        html = generateQuoteSlide(contentSlide, totalPages);
        break;
      case 'paragraph':
        html = generateParagraphSlide(contentSlide, totalPages);
        break;
      case 'architecture':
        html = generateArchitectureSlide(contentSlide, totalPages);
        break;
      case 'list':
      default:
        html = generateListSlide(contentSlide, totalPages);
        break;
    }
  }

  return { html };
}

export async function generateFullHtml(
  outline: Outline,
  themeId: string,
  slidesHtml: string[]
): Promise<string> {
  // For advanced themes, generate a simple HTML wrapper
  if (isAdvancedTheme(themeId)) {
    const theme = await parseThemeMarkdown(themeId as AdvancedTheme);
    const style = generateAdvancedThemeCSS(theme);

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${outline.title}</title>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
  <style>
    @font-face {
      font-family: 'JetBrains Mono';
      src: url('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0P6T76F20g.woff2') format('woff2');
    }
    ${style}
    ${theme.motion.keyframes || ''}
    .slide { width: 1920px; height: 1080px; position: relative; overflow: hidden; }
    .slide-container { display: flex; flex-direction: column; }
  </style>
</head>
<body>
  <div class="slides-container slide-container">
    ${slidesHtml.map((html, i) => `<div class="slide" data-slide="${i + 1}">${html}</div>`).join('\n')}
  </div>
  <script>lucide.createIcons();</script>
</body>
</html>`;
  }

  // Template mode: use template files
  const templatePath = path.join(process.cwd(), 'templates', themeId, 'template.html');
  const stylePath = path.join(process.cwd(), 'templates', themeId, 'style.css');
  const chartsPath = path.join(process.cwd(), 'templates', themeId, 'charts.js');

  // 读取模板文件，charts.js 可选
  const [template, style] = await Promise.all([
    fs.readFile(templatePath, 'utf-8'),
    fs.readFile(stylePath, 'utf-8'),
  ]);

  // charts.js 可选，不存在则为空
  let charts = '';
  try {
    charts = await fs.readFile(chartsPath, 'utf-8');
  } catch {
    // 主题没有 charts.js，使用空字符串
  }

  const chartInits = outline.slides
    .filter((slide): slide is ContentSlide =>
      slide.page_type === 'content' && slide.content_type === 'data-chart'
    )
    .map(slide => generateChartConfig(slide))
    .filter(Boolean);

  return template
    .replace('{{TITLE}}', outline.title)
    .replace('{{THEME_STYLE}}', style)
    .replace('{{SLIDES_CONTENT}}', slidesHtml.join('\n'))
    .replace('{{CHART_CONFIG}}', charts)
    .replace('{{CHART_INIT}}', chartInits.join('\n'))
    .replace('{{FONT_PATH}}', '/fonts/AlibabaPuHuiTi-3/');
}