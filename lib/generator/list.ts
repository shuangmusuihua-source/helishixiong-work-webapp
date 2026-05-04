import type { ContentSlide, ListContent } from '@/types';

export function generateListSlide(slide: ContentSlide, totalPages?: number): string {
  const content = (slide.content as ListContent) || {};
  const pageNum = totalPages ? `${slide.page_number} / ${totalPages}` : slide.page_number;

  // 如果没有有效的列表内容，显示占位
  if (!content.items || content.items.length === 0) {
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
          <div class="list-content">
            <div class="list-item">
              <span class="list-decor"></span>
              <span class="list-text">内容待补充</span>
            </div>
          </div>
        </div>
        <div class="page-number-region">
          <span class="page-number">${pageNum}</span>
        </div>
      </div>
    `;
  }

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
        <div class="list-content">
          ${content.items.map((item, idx) => `
            <div class="list-item">
              <span class="list-decor"></span>
              <span class="list-text">
                ${item.icon ? `<span style="margin-right: 0.5rem">${item.icon}</span>` : ''}
                <span class="highlight">${item.title}</span>${item.description ? `：${item.description}` : ''}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="page-number-region">
        <span class="page-number">${pageNum}</span>
      </div>
    </div>
  `;
}