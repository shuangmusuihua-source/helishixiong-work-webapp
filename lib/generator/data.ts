import type { ContentSlide, DataCardsContent, DataChartContent } from '@/types';

// 数据卡片生成器
export function generateDataCardsSlide(slide: ContentSlide, totalPages?: number): string {
  const content = (slide.content as DataCardsContent) || {};
  const pageNum = totalPages ? `${slide.page_number} / ${totalPages}` : slide.page_number;

  // 如果没有有效内容，显示占位
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
          <div class="data-cards">
            <div class="data-card highlighted">
              <div class="card-header">
                <i data-lucide="bar-chart-3"></i>
                <span class="card-title">数据</span>
              </div>
              <div class="card-divider"></div>
              <div class="data-value">--</div>
              <div class="data-label">待补充数据</div>
            </div>
          </div>
        </div>
        <div class="page-number-region">
          <span class="page-number">${pageNum}</span>
        </div>
      </div>
    `;
  }

  // 找出最大值用于高亮
  const numericValues = content.items.filter(item => typeof item.value === 'number').map(item => item.value as number);
  const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : null;

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
        <div class="data-cards">
          ${content.items.map(item => {
            const isHighlighted = typeof item.value === 'number' && item.value === maxValue;
            return `
              <div class="data-card ${isHighlighted ? 'highlighted' : ''}">
                <div class="card-header">
                  <i data-lucide="${item.icon || 'trending-up'}"></i>
                  <span class="card-title">${item.label}</span>
                </div>
                <div class="card-divider"></div>
                <div class="data-value">${item.value}${item.unit ? `<span style="font-size:1rem;font-weight:400">${item.unit}</span>` : ''}</div>
                ${item.insight ? `<div class="data-label">${item.insight}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="page-number-region">
        <span class="page-number">${pageNum}</span>
      </div>
    </div>
  `;
}

// 数据图表生成器
export function generateDataChartSlide(slide: ContentSlide, totalPages?: number): string {
  const content = (slide.content as DataChartContent) || {};
  const pageNum = totalPages ? `${slide.page_number} / ${totalPages}` : slide.page_number;
  const chartId = `chart-${slide.page_number}`;

  // 如果没有有效内容，显示占位
  if (!content.data?.labels || !content.data?.values) {
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
          <div class="chart-layout">
            <div class="chart-info">
              <div class="chart-info-title">数据说明</div>
              <div class="chart-info-item">待补充图表数据</div>
            </div>
            <div class="chart-chart-card">
              <div class="card-header">
                <i data-lucide="bar-chart-3"></i>
                <span class="card-title">图表</span>
              </div>
              <div class="card-divider"></div>
              <div class="chart-container">
                <div id="${chartId}" class="echarts-chart" style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--secondary-color);opacity:0.5;">图表待生成</div>
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

  // 构建左侧说明
  const infoHtml = content.info ? `
    <div class="chart-info">
      <div class="chart-info-title">${content.info.title}</div>
      ${content.info.items.map(item => `<div class="chart-info-item">${item}</div>`).join('')}
    </div>
  ` : `
    <div class="chart-info">
      <div class="chart-info-title">数据洞察</div>
      ${content.data.labels.slice(0, 3).map((label, idx) => `
        <div class="chart-info-item"><span class="key-color">${label}</span>: ${content.data.values[idx]}${content.data.unit || ''}</div>
      `).join('')}
    </div>
  `;

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
        <div class="chart-layout">
          ${infoHtml}
          <div class="chart-chart-card">
            <div class="card-header">
              <i data-lucide="${getChartIcon(content.chart_type)}"></i>
              <span class="card-title">${getChartTitle(content.chart_type)}</span>
            </div>
            <div class="card-divider"></div>
            <div class="chart-container">
              <div id="${chartId}" class="echarts-chart"></div>
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

function getChartIcon(chartType: string): string {
  const icons: Record<string, string> = {
    bar: 'bar-chart-3',
    line: 'trending-up',
    pie: 'pie-chart',
    radar: 'radar'
  };
  return icons[chartType] || 'bar-chart-3';
}

function getChartTitle(chartType: string): string {
  const titles: Record<string, string> = {
    bar: '柱状图',
    line: '折线图',
    pie: '饼图',
    radar: '雷达图'
  };
  return titles[chartType] || '图表';
}

export function generateChartConfig(slide: ContentSlide): string {
  const content = slide.content as DataChartContent;

  if (!content || !content.chart_type || !content.data) {
    return '';
  }

  const chartId = `chart-${slide.page_number}`;

  if (content.chart_type === 'bar') {
    return `
      echarts.init(document.getElementById('${chartId}')).setOption({
        color: ['#10B981', '#34D399', '#14B8A6', '#84CC16', '#059669'],
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: ${JSON.stringify(content.data.labels)}, axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#1E293B', fontSize: 11, fontWeight: 500 } },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#1E293B', fontSize: 11 }, splitLine: { lineStyle: { color: '#E2E8F0' } } },
        series: [{ type: 'bar', data: ${JSON.stringify(content.data.values)}, barWidth: '55%', itemStyle: { borderRadius: [8, 8, 0, 0] }, label: { show: true, position: 'top', color: '#0F172A', fontSize: 13, fontWeight: 700 } }]
      });
    `;
  }

  if (content.chart_type === 'line') {
    return `
      echarts.init(document.getElementById('${chartId}')).setOption({
        color: ['#10B981'],
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: ${JSON.stringify(content.data.labels)}, axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#1E293B', fontSize: 11 } },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#1E293B', fontSize: 11 }, splitLine: { lineStyle: { color: '#E2E8F0' } } },
        series: [{ type: 'line', data: ${JSON.stringify(content.data.values)}, smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 }, areaStyle: { color: 'rgba(16, 185, 129, 0.1)' } }]
      });
    `;
  }

  if (content.chart_type === 'pie') {
    const pieData = content.data.labels.map((label, i) => ({
      name: label,
      value: content.data.values[i]
    }));

    return `
      echarts.init(document.getElementById('${chartId}')).setOption({
        color: ['#10B981', '#34D399', '#14B8A6', '#84CC16', '#059669'],
        series: [{ type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'], data: ${JSON.stringify(pieData)}, label: { show: true, formatter: '{b}: {d}%', color: '#1E293B', fontSize: 12 }, itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 } }]
      });
    `;
  }

  if (content.chart_type === 'radar') {
    const radarData = [{
      value: content.data.values,
      name: content.data.labels[0] || '数据'
    }];

    return `
      echarts.init(document.getElementById('${chartId}')).setOption({
        color: ['#10B981'],
        radar: { indicator: ${JSON.stringify(content.data.labels.map(label => ({ name: label })))}, axisLine: { lineStyle: { color: '#E2E8F0' } }, splitLine: { lineStyle: { color: '#E2E8F0' } }, splitArea: { areaStyle: { color: ['rgba(16, 185, 129, 0.05)', 'rgba(16, 185, 129, 0.1)'] } } },
        series: [{ type: 'radar', data: ${JSON.stringify(radarData)}, areaStyle: { color: 'rgba(16, 185, 129, 0.3)' } }]
      });
    `;
  }

  return '';
}