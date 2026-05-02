import type { CoverSlide, EndSlide } from '@/types';

export function generateCover(slide: CoverSlide): string {
  return `
    <div class="slide cover-slide active">
      <div class="cover-content">
        <h1 class="cover-title animate__animated animate__fadeInUp">${slide.title}</h1>
        ${slide.subtitle ? `<p class="cover-subtitle animate__animated animate__fadeInUp animate__delay-1s">${slide.subtitle}</p>` : ''}
        <div class="cover-meta animate__animated animate__fadeIn animate__delay-1s">
          ${slide.author ? `<span class="cover-author">${slide.author}</span>` : ''}
          ${slide.date ? `<span class="cover-date">${slide.date}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

export function generateEnd(slide: EndSlide): string {
  return `
    <div class="slide end-slide">
      <div class="end-content">
        <h1 class="end-title animate__animated animate__fadeIn">${slide.title || '谢谢观看'}</h1>
      </div>
    </div>
  `;
}