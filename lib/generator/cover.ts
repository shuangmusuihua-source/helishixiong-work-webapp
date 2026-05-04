import type { CoverSlide, EndSlide } from '@/types';

export function generateCover(slide: CoverSlide): string {
  return `
    <div class="slide cover-slide active">
      <h1 class="cover-title">${slide.title}</h1>
      ${slide.subtitle ? `<p class="cover-subtitle">${slide.subtitle}</p>` : ''}
      <div class="cover-meta">
        ${slide.author ? `<p class="cover-author">${slide.author}</p>` : ''}
        ${slide.date ? `<p class="cover-date">${slide.date}</p>` : ''}
      </div>
    </div>
  `;
}

export function generateEnd(slide: EndSlide): string {
  return `
    <div class="slide end-slide">
      <h1 class="end-title">${slide.title || '感谢聆听'}</h1>
      <div class="end-meta">
        ${slide.author ? `<p class="end-author">${slide.author}</p>` : ''}
        ${slide.date ? `<p class="end-date">${slide.date}</p>` : ''}
      </div>
    </div>
  `;
}