import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fs module
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn().mockResolvedValue('/* mock style */'),
  },
}));

// Mock path module
vi.mock('path', () => ({
  default: {
    join: vi.fn((...args) => args.join('/')),
  },
}));

// Mock advanced generator
vi.mock('./advanced', () => ({
  generateAdvancedSlideHtml: vi.fn().mockResolvedValue('<div>Advanced HTML</div>'),
  parseThemeMarkdown: vi.fn().mockResolvedValue({
    palette: { bg: '#fff', text: '#000', accent: '#10B981' },
    fonts: { display: 'font1', body: 'font2' },
    typeScale: { hero: '48px', heading: '32px', body: '16px', caption: '12px' },
    motion: {},
  }),
}));

// Import after mocks
import { generateCover, generateEnd } from '@/lib/generator/cover';
import { generateListSlide } from '@/lib/generator/list';
import { generateParagraphSlide } from '@/lib/generator/paragraph';
import { generateQuoteSlide } from '@/lib/generator/quote';
import { generateTimelineSlide } from '@/lib/generator/timeline';
import { generateDataCardsSlide, generateDataChartSlide } from '@/lib/generator/data';
import { generateComparisonFeatureSlide, generateComparisonTableSlide } from '@/lib/generator/comparison';
import { generateArchitectureSlide } from '@/lib/generator/architecture';

describe('Generator Modules', () => {
  describe('Cover Generator', () => {
    it('should generate cover slide with title', () => {
      const html = generateCover({
        page_type: 'cover',
        title: '演示标题',
        subtitle: '副标题',
      });

      expect(html).toContain('演示标题');
      expect(html).toContain('副标题');
      expect(html).toContain('cover-slide');
    });

    it('should include author and date when provided', () => {
      const html = generateCover({
        page_type: 'cover',
        title: '标题',
        subtitle: '副标题',
        author: '作者名',
        date: '2024-01-01',
      });

      expect(html).toContain('作者名');
      expect(html).toContain('2024-01-01');
    });

    it('should handle missing optional fields', () => {
      const html = generateCover({
        page_type: 'cover',
        title: '只有标题',
        subtitle: '',
      });

      expect(html).toContain('只有标题');
      expect(html).not.toContain('cover-author');
      expect(html).not.toContain('cover-date');
    });
  });

  describe('End Generator', () => {
    it('should generate end slide with default title', () => {
      const html = generateEnd({ page_type: 'end' });

      expect(html).toContain('感谢聆听');
      expect(html).toContain('end-slide');
    });

    it('should use custom title when provided', () => {
      const html = generateEnd({
        page_type: 'end',
        title: '谢谢观看',
      });

      expect(html).toContain('谢谢观看');
    });

    it('should include author and date when provided', () => {
      const html = generateEnd({
        page_type: 'end',
        title: '谢谢',
        author: '作者',
        date: '2024',
      });

      expect(html).toContain('作者');
      expect(html).toContain('2024');
    });
  });

  describe('List Generator', () => {
    it('should generate list slide with items', () => {
      const html = generateListSlide({
        page_type: 'content',
        page_number: 1,
        title: '功能列表',
        content_type: 'list',
        summary: '摘要',
        content: {
          items: [
            { title: '功能1', description: '描述1' },
            { title: '功能2', description: '描述2' },
          ],
        },
      }, 5);

      expect(html).toContain('功能列表');
      expect(html).toContain('功能1');
      expect(html).toContain('功能2');
    });

    it('should handle items without description', () => {
      const html = generateListSlide({
        page_type: 'content',
        page_number: 1,
        title: '简单列表',
        content_type: 'list',
        summary: '',
        content: {
          items: [{ title: '项目1' }, { title: '项目2' }],
        },
      }, 3);

      expect(html).toContain('项目1');
      expect(html).toContain('项目2');
    });
  });

  describe('Paragraph Generator', () => {
    it('should generate paragraph slide with text', () => {
      const html = generateParagraphSlide({
        page_type: 'content',
        page_number: 1,
        title: '段落标题',
        content_type: 'paragraph',
        summary: '',
        content: {
          text: '这是一段很长的文本内容，用于展示段落类型的幻灯片。',
        },
      }, 5);

      expect(html).toContain('段落标题');
      expect(html).toContain('这是一段很长的文本内容');
    });

    it('should highlight specified keywords', () => {
      const html = generateParagraphSlide({
        page_type: 'content',
        page_number: 1,
        title: '标题',
        content_type: 'paragraph',
        summary: '',
        content: {
          text: '人工智能正在改变世界',
          highlight: ['人工智能', '世界'],
        },
      }, 3);

      expect(html).toContain('人工智能');
      expect(html).toContain('世界');
    });
  });

  describe('Quote Generator', () => {
    it('should generate quote slide', () => {
      const html = generateQuoteSlide({
        page_type: 'content',
        page_number: 1,
        title: '名言引用',
        content_type: 'quote',
        summary: '',
        content: {
          quote: '创新是引领发展的第一动力',
          author: '作者名',
          source: '出处',
        },
      }, 5);

      expect(html).toContain('创新是引领发展的第一动力');
      expect(html).toContain('作者名');
    });

    it('should handle quote without source', () => {
      const html = generateQuoteSlide({
        page_type: 'content',
        page_number: 1,
        title: '名言',
        content_type: 'quote',
        summary: '',
        content: {
          quote: '简单名言',
          author: '匿名',
        },
      }, 3);

      expect(html).toContain('简单名言');
      expect(html).toContain('匿名');
    });
  });

  describe('Timeline Generator', () => {
    it('should generate timeline slide with events', () => {
      const html = generateTimelineSlide({
        page_type: 'content',
        page_number: 1,
        title: '发展历程',
        content_type: 'timeline',
        summary: '',
        content: {
          events: [
            { time: '2020', title: '事件1', description: '描述1' },
            { time: '2021', title: '事件2', description: '描述2' },
            { time: '2022', title: '事件3' },
          ],
        },
      }, 5);

      expect(html).toContain('发展历程');
      expect(html).toContain('2020');
      expect(html).toContain('2021');
      expect(html).toContain('事件1');
      expect(html).toContain('事件2');
    });

    it('should handle events without description', () => {
      const html = generateTimelineSlide({
        page_type: 'content',
        page_number: 1,
        title: '时间线',
        content_type: 'timeline',
        summary: '',
        content: {
          events: [
            { time: '2023', title: '里程碑' },
          ],
        },
      }, 3);

      expect(html).toContain('2023');
      expect(html).toContain('里程碑');
    });
  });

  describe('Data Cards Generator', () => {
    it('should generate data cards with items', () => {
      const html = generateDataCardsSlide({
        page_type: 'content',
        page_number: 1,
        title: '关键指标',
        content_type: 'data-cards',
        summary: '数据摘要',
        content: {
          items: [
            { label: '用户数', value: 1000, unit: '万' },
            { label: '增长率', value: 25, unit: '%' },
          ],
        },
      }, 5);

      expect(html).toContain('关键指标');
      expect(html).toContain('用户数');
      expect(html).toContain('1000');
      expect(html).toContain('增长率');
    });

    it('should show placeholder for empty content', () => {
      const html = generateDataCardsSlide({
        page_type: 'content',
        page_number: 1,
        title: '数据展示',
        content_type: 'data-cards',
        summary: '',
        content: {},
      }, 3);

      expect(html).toContain('数据展示');
      expect(html).toContain('待补充数据');
    });

    it('should highlight maximum value', () => {
      const html = generateDataCardsSlide({
        page_type: 'content',
        page_number: 1,
        title: '指标对比',
        content_type: 'data-cards',
        summary: '',
        content: {
          items: [
            { label: '指标A', value: 100 },
            { label: '指标B', value: 500 },
            { label: '指标C', value: 300 },
          ],
        },
      }, 5);

      expect(html).toContain('highlighted');
    });
  });

  describe('Data Chart Generator', () => {
    it('should generate chart slide', () => {
      const html = generateDataChartSlide({
        page_type: 'content',
        page_number: 1,
        title: '销售趋势',
        content_type: 'data-chart',
        summary: '趋势分析',
        content: {
          chart_type: 'line',
          data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            values: [100, 150, 200, 250],
            unit: '万元',
          },
        },
      }, 5);

      expect(html).toContain('销售趋势');
      expect(html).toContain('chart-container');
    });

    it('should handle different chart types', () => {
      const barHtml = generateDataChartSlide({
        page_type: 'content',
        page_number: 1,
        title: '柱状图',
        content_type: 'data-chart',
        summary: '',
        content: {
          chart_type: 'bar',
          data: {
            labels: ['A', 'B'],
            values: [1, 2],
          },
        },
      }, 3);

      expect(barHtml).toContain('柱状图');
    });
  });

  describe('Comparison Feature Generator', () => {
    it('should generate feature comparison slide', () => {
      const html = generateComparisonFeatureSlide({
        page_type: 'content',
        page_number: 1,
        title: '产品对比',
        content_type: 'comparison-feature',
        summary: '',
        content: {
          subjects: ['产品A', '产品B'],
          items: [
            { subject1_feature: '高性能', subject2_feature: '低成本' },
            { subject1_feature: '易用性强', subject2_feature: '功能丰富' },
          ],
        },
      }, 5);

      expect(html).toContain('产品对比');
      expect(html).toContain('产品A');
      expect(html).toContain('产品B');
    });
  });

  describe('Comparison Table Generator', () => {
    it('should generate table comparison slide', () => {
      const html = generateComparisonTableSlide({
        page_type: 'content',
        page_number: 1,
        title: '参数对比',
        content_type: 'comparison-table',
        summary: '',
        content: {
          subjects: ['型号A', '型号B', '型号C'],
          metrics: [
            { name: '价格', values: ['1000', '2000', '3000'], unit: '元' },
            { name: '重量', values: ['1.5', '2.0', '1.8'], unit: 'kg' },
          ],
        },
      }, 5);

      expect(html).toContain('参数对比');
      expect(html).toContain('型号A');
      expect(html).toContain('价格');
    });
  });

  describe('Architecture Generator', () => {
    it('should generate architecture slide', () => {
      const html = generateArchitectureSlide({
        page_type: 'content',
        page_number: 1,
        title: '系统架构',
        content_type: 'architecture',
        summary: '',
        content: {
          layers: [
            {
              name: '表现层',
              items: [{ label: 'Web前端' }],
            },
            {
              name: '服务层',
              items: [{ label: 'API服务' }],
            },
          ],
        },
      }, 5);

      expect(html).toContain('系统架构');
      expect(html).toContain('表现层');
      expect(html).toContain('服务层');
    });
  });
});
