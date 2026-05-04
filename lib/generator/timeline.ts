import type { ContentSlide, TimelineContent } from '@/types';

export function generateTimelineSlide(slide: ContentSlide, totalPages?: number): string {
  const content = (slide.content as TimelineContent) || {};
  const pageNum = totalPages ? `${slide.page_number} / ${totalPages}` : slide.page_number;

  if (!content.events || content.events.length === 0) {
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
          <div class="timeline-horizontal">
            <div class="timeline-track">
              <div class="timeline-line-h"></div>
              <div class="timeline-nodes">
                <div class="timeline-node">
                  <div class="timeline-dot-h"></div>
                  <div class="timeline-card">
                    <div class="timeline-year-h">待补充</div>
                    <div class="timeline-title-h">事件</div>
                    <div class="timeline-desc-h">内容待补充</div>
                  </div>
                </div>
              </div>
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
        <div class="timeline-horizontal">
          <div class="timeline-track">
            <div class="timeline-line-h"></div>
            <div class="timeline-nodes">
              ${content.events.map((event, idx) => `
                <div class="timeline-node">
                  <div class="timeline-dot-h"></div>
                  <div class="timeline-card">
                    <div class="timeline-year-h">${event.time}</div>
                    <div class="timeline-title-h">${event.title}</div>
                    <div class="timeline-desc-h">${event.description || ''}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="page-number-region">
        <span class="page-number">${pageNum}</span>
      </div>
    </div>
  `;
}