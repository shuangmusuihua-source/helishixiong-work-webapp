import type { ContentSlide, ComparisonFeatureContent, ComparisonTableContent } from '@/types';

// 特点对比生成器：两对象不同维度的优势对比
export function generateComparisonFeatureSlide(slide: ContentSlide, totalPages?: number): string {
  const content = (slide.content as ComparisonFeatureContent) || {};
  const pageNum = totalPages ? `${slide.page_number} / ${totalPages}` : slide.page_number;

  // 如果没有有效内容，显示占位
  if (!content.subjects || !content.items || content.items.length === 0) {
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
          <div class="feature-compare-layout">
            <div class="feature-card left">
              <div class="feature-card-header">
                <div class="feature-card-icon"><i data-lucide="box"></i></div>
                <div>
                  <div class="feature-card-title">对象 A</div>
                  <div class="feature-card-subtitle">待补充</div>
                </div>
              </div>
              <div class="feature-card-divider"></div>
              <ul class="feature-list">
                <li><span class="check-icon"><i data-lucide="check"></i></span><span class="feature-text">特点待补充</span></li>
              </ul>
            </div>
            <div class="vs-badge"><i data-lucide="git-compare"></i></div>
            <div class="feature-card right">
              <div class="feature-card-header">
                <div class="feature-card-icon"><i data-lucide="box"></i></div>
                <div>
                  <div class="feature-card-title">对象 B</div>
                  <div class="feature-card-subtitle">待补充</div>
                </div>
              </div>
              <div class="feature-card-divider"></div>
              <ul class="feature-list">
                <li><span class="check-icon"><i data-lucide="check"></i></span><span class="feature-text">特点待补充</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="page-number-region">
          <span class="page-number">${pageNum}</span>
        </div>
      </div>
    `;
  }

  const [subject1, subject2] = content.subjects;

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
        <div class="feature-compare-layout">
          <div class="feature-card left">
            <div class="feature-card-header">
              <div class="feature-card-icon"><i data-lucide="star"></i></div>
              <div>
                <div class="feature-card-title">${subject1}</div>
                <div class="feature-card-subtitle">核心优势</div>
              </div>
            </div>
            <div class="feature-card-divider"></div>
            <ul class="feature-list">
              ${content.items.map(item => `
                <li><span class="check-icon"><i data-lucide="check"></i></span><span class="feature-text">${item.subject1_feature}</span></li>
              `).join('')}
            </ul>
          </div>
          <div class="vs-badge"><i data-lucide="git-compare"></i></div>
          <div class="feature-card right">
            <div class="feature-card-header">
              <div class="feature-card-icon"><i data-lucide="star"></i></div>
              <div>
                <div class="feature-card-title">${subject2}</div>
                <div class="feature-card-subtitle">核心优势</div>
              </div>
            </div>
            <div class="feature-card-divider"></div>
            <ul class="feature-list">
              ${content.items.map(item => `
                <li><span class="check-icon"><i data-lucide="check"></i></span><span class="feature-text">${item.subject2_feature}</span></li>
              `).join('')}
            </ul>
          </div>
        </div>
        ${content.conclusion ? `<p class="comparison-conclusion" style="text-align: center; margin-top: 1rem; color: var(--secondary-color);">${content.conclusion}</p>` : ''}
      </div>
      <div class="page-number-region">
        <span class="page-number">${pageNum}</span>
      </div>
    </div>
  `;
}

// 表格对比生成器：多对象同维度数据对比
export function generateComparisonTableSlide(slide: ContentSlide, totalPages?: number): string {
  const content = (slide.content as ComparisonTableContent) || {};
  const pageNum = totalPages ? `${slide.page_number} / ${totalPages}` : slide.page_number;

  // 如果没有有效内容，显示占位
  if (!content.subjects || content.subjects.length < 2 || !content.metrics || content.metrics.length === 0) {
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
          <div class="compare-table-wrapper">
            <table class="compare-table">
              <thead>
                <tr>
                  <th>对比维度</th>
                  <th>对象 A</th>
                  <th>对象 B</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="company-name">维度 1</td>
                  <td>待补充</td>
                  <td>待补充</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="page-number-region">
          <span class="page-number">${pageNum}</span>
        </div>
      </div>
    `;
  }

  const headerCells = content.subjects.map(s => `<th>${s}</th>`).join('');

  const bodyRows = content.metrics.map((metric, idx) => {
    const valueCells = metric.values.map(v => {
      const isHighlight = typeof v === 'number' && v === Math.max(...content.metrics.filter(m => typeof m.values[idx] === 'number').map(m => m.values[idx] as number));
      return `<td${isHighlight ? ' class="highlight-cell"' : ''}>${v}${metric.unit || ''}</td>`;
    }).join('');

    return `
      <tr>
        <td class="company-name">${metric.name}</td>
        ${valueCells}
      </tr>
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
        <div class="compare-table-wrapper">
          <table class="compare-table">
            <thead>
              <tr>
                <th>对比维度</th>
                ${headerCells}
              </tr>
            </thead>
            <tbody>
              ${bodyRows}
            </tbody>
          </table>
        </div>
        ${content.conclusion ? `<p class="comparison-conclusion" style="text-align: center; margin-top: 1rem; color: var(--secondary-color);">${content.conclusion}</p>` : ''}
      </div>
      <div class="page-number-region">
        <span class="page-number">${pageNum}</span>
      </div>
    </div>
  `;
}