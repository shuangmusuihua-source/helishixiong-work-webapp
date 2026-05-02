import fs from 'fs/promises';
import path from 'path';
import type { Slide, ContentSlide, Outline } from '@/types';
import { generateCover, generateEnd } from './cover';
import { generateDataSlide, generateChartConfig } from './data';
import { generateComparisonSlide } from './comparison';
import { generateListSlide } from './list';

export async function generateSlideHtml(
  slide: Slide,
  themeId: string
): Promise<string> {
  if (slide.page_type === 'cover') {
    return generateCover(slide);
  }

  if (slide.page_type === 'end') {
    return generateEnd(slide);
  }

  // 内容页
  const contentSlide = slide as ContentSlide;

  switch (contentSlide.content_type) {
    case 'data':
      return generateDataSlide(contentSlide);
    case 'comparison':
      return generateComparisonSlide(contentSlide);
    case 'list':
      return generateListSlide(contentSlide);
    case 'timeline':
    case 'architecture':
    case 'quote':
    case 'paragraph':
    default:
      return generateListSlide(contentSlide); // 默认使用列表布局
  }
}

export async function generateFullHtml(
  outline: Outline,
  themeId: string,
  slidesHtml: string[]
): Promise<string> {
  // 读取模板文件
  const templatePath = path.join(process.cwd(), 'templates', themeId, 'template.html');
  const stylePath = path.join(process.cwd(), 'templates', themeId, 'style.css');
  const chartsPath = path.join(process.cwd(), 'templates', themeId, 'charts.js');

  const template = await fs.readFile(templatePath, 'utf-8');
  const style = await fs.readFile(stylePath, 'utf-8');
  const charts = await fs.readFile(chartsPath, 'utf-8');

  // 生成图表初始化代码
  const chartInits: string[] = [];
  outline.slides.forEach((slide) => {
    if (slide.page_type === 'content' && (slide as ContentSlide).content_type === 'data') {
      chartInits.push(generateChartConfig(slide as ContentSlide));
    }
  });

  // 替换模板占位符
  const html = template
    .replace('{{TITLE}}', outline.title)
    .replace('{{THEME_STYLE}}', style)
    .replace('{{SLIDES_CONTENT}}', slidesHtml.join('\n'))
    .replace('{{CHART_CONFIG}}', charts)
    .replace('{{CHART_INIT}}', chartInits.join('\n'))
    .replace('{{FONT_PATH}}', '/fonts/AlibabaPuHuiTi-3/');

  return html;
}