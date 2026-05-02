import type { ContentSlide, ComparisonContent } from '@/types';

export function generateComparisonSlide(slide: ContentSlide): string {
  const content = slide.content as ComparisonContent;

  return `
    <div class="slide content-slide">
      <div class="title-region">
        <h2 class="slide-title animate__animated animate__fadeInDown">${slide.title}</h2>
      </div>
      <div class="summary-region">
        <p class="slide-summary animate__animated animate__fadeIn">${slide.summary}</p>
      </div>
      <div class="content-region">
        <div class="comparison-container">
          ${content.subjects.map((subject, idx) => `
            <div class="comparison-card animate__animated animate__fadeInUp" style="animation-delay: ${idx * 0.1}s">
              <h3 class="comparison-subject">${subject}</h3>
              <div class="comparison-metrics">
                ${content.metrics.map(metric => `
                  <div class="metric-row">
                    <span class="metric-name">${metric.name}</span>
                    <span class="metric-value">${metric.values[idx]}${metric.unit || ''}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        ${content.conclusion ? `<p class="comparison-conclusion animate__animated animate__fadeIn">${content.conclusion}</p>` : ''}
      </div>
      <div class="page-number-region">
        <span class="page-number">${slide.page_number}</span>
      </div>
    </div>
  `;
}