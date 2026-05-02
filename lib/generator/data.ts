import type { ContentSlide, DataContent } from '@/types';

export function generateDataSlide(slide: ContentSlide): string {
  const content = slide.content as DataContent;
  const chartId = `chart-${slide.page_number}`;

  let chartHtml = '';

  if (content.chart_type === 'bar' || content.chart_type === 'line') {
    chartHtml = `<div id="${chartId}" class="chart-container" style="width: 100%; height: 350px;"></div>`;
  } else if (content.chart_type === 'pie') {
    chartHtml = `<div id="${chartId}" class="chart-container" style="width: 100%; height: 350px;"></div>`;
  }

  return `
    <div class="slide content-slide">
      <div class="title-region">
        <h2 class="slide-title animate__animated animate__fadeInDown">${slide.title}</h2>
      </div>
      <div class="summary-region">
        <p class="slide-summary animate__animated animate__fadeIn">${slide.summary}</p>
      </div>
      <div class="content-region">
        ${chartHtml}
        ${content.insights ? `
          <div class="data-insights animate__animated animate__fadeInUp">
            ${content.insights.map(insight => `<p class="insight-item">• ${insight}</p>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="page-number-region">
        <span class="page-number">${slide.page_number}</span>
      </div>
    </div>
  `;
}

export function generateChartConfig(slide: ContentSlide): string {
  const content = slide.content as DataContent;
  const chartId = `chart-${slide.page_number}`;

  if (content.chart_type === 'bar') {
    return `
      echarts.init(document.getElementById('${chartId}')).setOption({
        ...barChartOption,
        xAxis: { ...barChartOption.xAxis, data: ${JSON.stringify(content.data.labels)} },
        series: [{ ...barChartOption.series[0], data: ${JSON.stringify(content.data.values)} }]
      });
    `;
  }

  if (content.chart_type === 'line') {
    return `
      echarts.init(document.getElementById('${chartId}')).setOption({
        ...lineChartOption,
        xAxis: { ...lineChartOption.xAxis, data: ${JSON.stringify(content.data.labels)} },
        series: [{ ...lineChartOption.series[0], data: ${JSON.stringify(content.data.values)} }]
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
        ...pieChartOption,
        series: [{ ...pieChartOption.series[0], data: ${JSON.stringify(pieData)} }]
      });
    `;
  }

  return '';
}