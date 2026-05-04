import type { ContentSlide, ParagraphContent } from '@/types';

export function generateParagraphSlide(slide: ContentSlide, totalPages?: number): string {
  const content = (slide.content as ParagraphContent) || {};
  let text = content.text || slide.summary || '内容待补充';

  // 处理高亮词
  if (content.highlight && content.highlight.length > 0) {
    content.highlight.forEach(word => {
      text = text.replace(new RegExp(word, 'g'), `<span class="highlight-text">${word}</span>`);
    });
  }

  // 将文本按段落分割
  const paragraphs = text.split('\n').filter(p => p.trim());

  const pageNum = totalPages ? `${slide.page_number} / ${totalPages}` : slide.page_number;

  return `
    <div class="slide">
      <div class="title-region">
        <h2 class="title">
          <span class="title-decor"></span>
          ${slide.title}
        </h2>
      </div>
      <div class="summary-region">
        <p class="summary">${slide.summary || ''}</p>
      </div>
      <div class="content-region">
        <div class="paragraph-content">
          ${paragraphs.map(p => `<p>${p}</p>`).join('')}
        </div>
      </div>
      <div class="page-number-region">
        <span class="page-number">${pageNum}</span>
      </div>
    </div>
  `;
}