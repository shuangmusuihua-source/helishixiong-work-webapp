import { describe, it, expect } from 'vitest';
import type {
  CoverSlide,
  ContentSlide,
  EndSlide,
  Slide,
  Outline,
  ContentType,
  InputType,
  WorkMode,
  TextDensity,
  MotionLevel,
} from '@/types';

describe('Types System', () => {
  describe('ContentType', () => {
    it('should have exactly 9 content types', () => {
      const contentTypes: ContentType[] = [
        'data-cards',
        'data-chart',
        'comparison-feature',
        'comparison-table',
        'timeline',
        'architecture',
        'quote',
        'list',
        'paragraph',
      ];
      expect(contentTypes.length).toBe(9);
    });

    it('should accept valid content types', () => {
      const validTypes: ContentType[] = [
        'data-cards',
        'data-chart',
        'comparison-feature',
        'comparison-table',
        'timeline',
        'architecture',
        'quote',
        'list',
        'paragraph',
      ];

      validTypes.forEach((type) => {
        expect(type).toBeDefined();
      });
    });
  });

  describe('CoverSlide', () => {
    it('should create valid cover slide', () => {
      const coverSlide: CoverSlide = {
        page_type: 'cover',
        title: '演示标题',
        subtitle: '副标题',
        author: '作者',
        date: '2024-01-01',
      };

      expect(coverSlide.page_type).toBe('cover');
      expect(coverSlide.title).toBeDefined();
      expect(coverSlide.subtitle).toBeDefined();
    });

    it('should allow optional fields', () => {
      const minimalCover: CoverSlide = {
        page_type: 'cover',
        title: '标题',
        subtitle: '副标题',
      };

      expect(minimalCover.author).toBeUndefined();
      expect(minimalCover.date).toBeUndefined();
    });
  });

  describe('ContentSlide', () => {
    it('should create valid content slide', () => {
      const contentSlide: ContentSlide = {
        page_type: 'content',
        page_number: 1,
        title: '内容标题',
        content_type: 'paragraph',
        summary: '内容摘要',
        content: { text: '段落内容' },
      };

      expect(contentSlide.page_type).toBe('content');
      expect(contentSlide.page_number).toBeGreaterThanOrEqual(0);
      expect(contentSlide.content_type).toBeDefined();
    });

    it('should support context field', () => {
      const slideWithContext: ContentSlide = {
        page_type: 'content',
        page_number: 1,
        title: '标题',
        content_type: 'paragraph',
        summary: '摘要',
        content: { text: '内容' },
        context: '用户补充的上下文信息',
      };

      expect(slideWithContext.context).toBeDefined();
    });

    it('should support all content types', () => {
      const contentTypes: ContentType[] = [
        'data-cards',
        'data-chart',
        'comparison-feature',
        'comparison-table',
        'timeline',
        'architecture',
        'quote',
        'list',
        'paragraph',
      ];

      contentTypes.forEach((type) => {
        const slide: ContentSlide = {
          page_type: 'content',
          page_number: 1,
          title: '测试',
          content_type: type,
          summary: '摘要',
          content: {},
        };
        expect(slide.content_type).toBe(type);
      });
    });
  });

  describe('EndSlide', () => {
    it('should create valid end slide', () => {
      const endSlide: EndSlide = {
        page_type: 'end',
        title: '感谢观看',
        author: '作者',
        date: '2024',
      };

      expect(endSlide.page_type).toBe('end');
    });

    it('should allow minimal end slide', () => {
      const minimalEnd: EndSlide = {
        page_type: 'end',
      };

      expect(minimalEnd.title).toBeUndefined();
    });
  });

  describe('Slide Union Type', () => {
    it('should accept CoverSlide as Slide', () => {
      const slide: Slide = {
        page_type: 'cover',
        title: '标题',
        subtitle: '副标题',
      };
      expect(slide.page_type).toBe('cover');
    });

    it('should accept ContentSlide as Slide', () => {
      const slide: Slide = {
        page_type: 'content',
        page_number: 1,
        title: '标题',
        content_type: 'paragraph',
        summary: '摘要',
        content: {},
      };
      expect(slide.page_type).toBe('content');
    });

    it('should accept EndSlide as Slide', () => {
      const slide: Slide = {
        page_type: 'end',
      };
      expect(slide.page_type).toBe('end');
    });
  });

  describe('Outline', () => {
    it('should create valid outline', () => {
      const outline: Outline = {
        title: '演示大纲',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '副标题' },
          {
            page_type: 'content',
            page_number: 1,
            title: '内容1',
            content_type: 'paragraph',
            summary: '摘要',
            content: {},
          },
          { page_type: 'end', title: '结束' },
        ],
      };

      expect(outline.title).toBeDefined();
      expect(outline.slides.length).toBe(3);
      expect(outline.slides[0].page_type).toBe('cover');
      expect(outline.slides[outline.slides.length - 1].page_type).toBe('end');
    });

    it('should have cover as first slide', () => {
      const outline: Outline = {
        title: '测试',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '' },
          { page_type: 'content', page_number: 1, title: '内容', content_type: 'paragraph', summary: '', content: {} },
          { page_type: 'end' },
        ],
      };

      expect(outline.slides[0].page_type).toBe('cover');
    });

    it('should have end as last slide', () => {
      const outline: Outline = {
        title: '测试',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '' },
          { page_type: 'content', page_number: 1, title: '内容', content_type: 'paragraph', summary: '', content: {} },
          { page_type: 'end' },
        ],
      };

      expect(outline.slides[outline.slides.length - 1].page_type).toBe('end');
    });
  });

  describe('InputType', () => {
    it('should have valid input types', () => {
      const validTypes: InputType[] = ['topic', 'text', 'file'];
      expect(validTypes.length).toBe(3);
    });
  });

  describe('WorkMode', () => {
    it('should have valid work modes', () => {
      const validModes: WorkMode[] = ['template', 'advanced'];
      expect(validModes.length).toBe(2);
    });
  });

  describe('TextDensity', () => {
    it('should have valid text density levels', () => {
      const validDensities: TextDensity[] = ['minimal', 'light', 'standard', 'dense'];
      expect(validDensities.length).toBe(4);
    });
  });

  describe('MotionLevel', () => {
    it('should have valid motion levels', () => {
      const validLevels: MotionLevel[] = ['static', 'subtle', 'rich'];
      expect(validLevels.length).toBe(3);
    });
  });

  describe('Slide Content Types', () => {
    it('should define DataCardsContent structure', () => {
      const dataCards = {
        items: [
          { label: '指标1', value: 100, unit: '%', insight: '洞察' },
        ],
      };
      expect(dataCards.items).toBeDefined();
      expect(Array.isArray(dataCards.items)).toBe(true);
    });

    it('should define DataChartContent structure', () => {
      const dataChart = {
        chart_type: 'bar' as const,
        data: {
          labels: ['A', 'B', 'C'],
          values: [1, 2, 3],
          unit: '%',
        },
      };
      expect(dataChart.chart_type).toBe('bar');
      expect(dataChart.data.labels.length).toBe(dataChart.data.values.length);
    });

    it('should define TimelineContent structure', () => {
      const timeline = {
        events: [
          { time: '2020', title: '事件1', description: '描述' },
          { time: '2021', title: '事件2' },
        ],
      };
      expect(timeline.events).toBeDefined();
      expect(Array.isArray(timeline.events)).toBe(true);
    });

    it('should define QuoteContent structure', () => {
      const quote = {
        quote: '名言内容',
        author: '作者',
        source: '来源',
      };
      expect(quote.quote).toBeDefined();
    });

    it('should define ListContent structure', () => {
      const list = {
        items: [
          { title: '要点1', description: '描述1' },
          { title: '要点2' },
        ],
      };
      expect(list.items).toBeDefined();
      expect(Array.isArray(list.items)).toBe(true);
    });

    it('should define ParagraphContent structure', () => {
      const paragraph = {
        text: '段落内容',
        highlight: ['关键词1', '关键词2'],
      };
      expect(paragraph.text).toBeDefined();
    });
  });
});