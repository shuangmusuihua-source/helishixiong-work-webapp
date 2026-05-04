import type { ContentSlide, ArchitectureContent } from '@/types';

export function generateArchitectureSlide(slide: ContentSlide, totalPages?: number): string {
  const content = (slide.content as ArchitectureContent) || {};
  const pageNum = totalPages ? `${slide.page_number} / ${totalPages}` : slide.page_number;

  if (!content.layers || content.layers.length === 0) {
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
          <div class="architecture-placeholder">
            <p>架构内容待补充</p>
          </div>
        </div>
        <div class="page-number-region">
          <span class="page-number">${pageNum}</span>
        </div>
      </div>
    `;
  }

  const layersHtml = content.layers.map((layer, idx) => {
    const isLast = idx === content.layers.length - 1;
    const layerClass = isLast ? 'arch-layer arch-layer-last' : 'arch-layer';

    const itemsHtml = layer.items.map(item => {
      if (item.children && item.children.length > 0) {
        // 标签集合：集合名称 + 子标签
        const childrenHtml = item.children.map(child => `
          <span class="arch-tag arch-tag-child">
            ${child.icon ? `<span class="arch-tag-icon">${child.icon}</span>` : ''}
            <span class="arch-tag-label">${child.label}</span>
          </span>
        `).join('');

        return `
          <div class="arch-tag-group">
            <span class="arch-tag arch-tag-parent">
              ${item.icon ? `<span class="arch-tag-icon">${item.icon}</span>` : ''}
              <span class="arch-tag-label">${item.label}</span>
            </span>
            <div class="arch-tag-children">
              ${childrenHtml}
            </div>
          </div>
        `;
      } else {
        // 简单标签
        return `
          <span class="arch-tag">
            ${item.icon ? `<span class="arch-tag-icon">${item.icon}</span>` : ''}
            <span class="arch-tag-label">${item.label}</span>
          </span>
        `;
      }
    }).join('');

    return `
      <div class="${layerClass}">
        <div class="arch-layer-header">
          ${layer.icon ? `<span class="arch-layer-icon">${layer.icon}</span>` : ''}
          <span class="arch-layer-name">${layer.name}</span>
        </div>
        <div class="arch-layer-content">
          ${itemsHtml}
        </div>
        ${!isLast ? '<div class="arch-layer-gradient-separator"></div>' : ''}
      </div>
    `;
  }).join('');

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
        <div class="architecture-content">
          ${layersHtml}
        </div>
      </div>
      <div class="page-number-region">
        <span class="page-number">${pageNum}</span>
      </div>
    </div>
  `;
}