import fs from 'fs/promises';
import path from 'path';
import type { Slide, ContentSlide, Outline } from '@/types';
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

export type StreamCallback = (event: {
  type: typeof SSE_EVENT_TYPES[keyof typeof SSE_EVENT_TYPES];
  text?: string;
  content?: Record<string, unknown>;
  error?: string;
}) => void;

export async function generateSlideHtml(
  slide: Slide,
  themeId: string,
  totalPages: number,
  context?: string,
  onStream?: StreamCallback
): Promise<{ html: string; aiLog?: string }> {
  if (slide.page_type === 'cover') {
    return { html: generateCover(slide) };
  }

  if (slide.page_type === 'end') {
    return { html: generateEnd(slide) };
  }

  const contentSlide = slide as ContentSlide;
  let aiLog: string | undefined;

  if (context && onStream) {
    try {
      onStream({ type: SSE_EVENT_TYPES.AI_TEXT, text: `🤖 AI 正在生成 "${contentSlide.title}"...\n` });

      const aiContent = await generatePageContentStream(
        { title: contentSlide.title, content_type: contentSlide.content_type, summary: contentSlide.summary },
        context,
        (token) => onStream({ type: SSE_EVENT_TYPES.AI_TEXT, text: token })
      );

      onStream({ type: SSE_EVENT_TYPES.AI_COMPLETE, content: aiContent });

      if (aiContent && Object.keys(aiContent).length > 0) {
        contentSlide.content = aiContent;
        aiLog = 'AI 已生成内容';
      }
    } catch (error) {
      console.error('[AI] 生成错误:', error);
      onStream({ type: SSE_EVENT_TYPES.ERROR, error: (error as Error).message });
      aiLog = `AI 生成失败: ${(error as Error).message}`;
    }
  }

  // 根据内容类型调用对应的生成器
  let html: string;
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

  return { html, aiLog };
}

export async function generateFullHtml(
  outline: Outline,
  themeId: string,
  slidesHtml: string[]
): Promise<string> {
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