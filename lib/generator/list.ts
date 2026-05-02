import type { ContentSlide, ListContent } from '@/types';

export function generateListSlide(slide: ContentSlide): string {
  const content = slide.content as ListContent;

  return `
    <div class="slide content-slide">
      <div class="title-region">
        <h2 class="slide-title animate__animated animate__fadeInDown">${slide.title}</h2>
      </div>
      <div class="summary-region">
        <p class="slide-summary animate__animated animate__fadeIn">${slide.summary}</p>
      </div>
      <div class="content-region">
        <div class="list-container">
          ${content.items.map((item, idx) => `
            <div class="list-item animate__animated animate__fadeInLeft" style="animation-delay: ${idx * 0.1}s">
              ${item.icon ? `<span class="list-icon">${item.icon}</span>` : '<span class="list-bullet">•</span>'}
              <div class="list-content">
                <h4 class="list-title">${item.title}</h4>
                ${item.description ? `<p class="list-description">${item.description}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="page-number-region">
        <span class="page-number">${slide.page_number}</span>
      </div>
    </div>
  `;
}