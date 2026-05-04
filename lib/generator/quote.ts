import type { ContentSlide, QuoteContent } from '@/types';

export function generateQuoteSlide(slide: ContentSlide, totalPages?: number): string {
  const content = (slide.content as QuoteContent) || {};
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
        <div class="quote-block">
          <p class="quote-text">${content.quote || slide.summary || '引用内容待补充'}</p>
          ${content.author ? `<p class="quote-author">${content.author}</p>` : ''}
        </div>
      </div>
      <div class="page-number-region">
        <span class="page-number">${pageNum}</span>
      </div>
    </div>
  `;
}