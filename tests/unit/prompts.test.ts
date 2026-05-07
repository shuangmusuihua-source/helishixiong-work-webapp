import { describe, it, expect } from 'vitest';
import {
  PLAN_OUTLINE_PROMPT,
  GENERATE_CONTENT_PROMPT,
  DATA_SLIDE_PROMPT,
  COMPARISON_SLIDE_PROMPT,
  LIST_SLIDE_PROMPT,
} from '@/lib/llm/prompts';

describe('AI Prompts', () => {
  describe('PLAN_OUTLINE_PROMPT', () => {
    it('should be defined and non-empty', () => {
      expect(PLAN_OUTLINE_PROMPT).toBeDefined();
      expect(PLAN_OUTLINE_PROMPT.length).toBeGreaterThan(0);
    });

    it('should contain input analysis rules', () => {
      expect(PLAN_OUTLINE_PROMPT).toContain('输入分析规则');
      expect(PLAN_OUTLINE_PROMPT).toContain('话题');
      expect(PLAN_OUTLINE_PROMPT).toContain('长文本');
    });

    it('should contain outline generation rules', () => {
      expect(PLAN_OUTLINE_PROMPT).toContain('大纲生成规则');
      expect(PLAN_OUTLINE_PROMPT).toContain('封面页');
      expect(PLAN_OUTLINE_PROMPT).toContain('内容页');
      expect(PLAN_OUTLINE_PROMPT).toContain('尾页');
    });

    it('should define all 9 content types', () => {
      const contentTypes = [
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
        expect(PLAN_OUTLINE_PROMPT).toContain(type);
      });
    });

    it('should contain JSON output format specification', () => {
      expect(PLAN_OUTLINE_PROMPT).toContain('JSON');
      expect(PLAN_OUTLINE_PROMPT).toContain('"page_type"');
      expect(PLAN_OUTLINE_PROMPT).toContain('"cover"');
      expect(PLAN_OUTLINE_PROMPT).toContain('"content"');
      expect(PLAN_OUTLINE_PROMPT).toContain('"end"');
    });

    it('should specify slide structure requirements', () => {
      expect(PLAN_OUTLINE_PROMPT).toContain('第一页必须是封面页');
      expect(PLAN_OUTLINE_PROMPT).toContain('最后一页是尾页');
    });

    it('should include content_type field in output format', () => {
      expect(PLAN_OUTLINE_PROMPT).toContain('"content_type"');
      expect(PLAN_OUTLINE_PROMPT).toContain('"summary"');
    });
  });

  describe('GENERATE_CONTENT_PROMPT', () => {
    it('should be defined and non-empty', () => {
      expect(GENERATE_CONTENT_PROMPT).toBeDefined();
      expect(GENERATE_CONTENT_PROMPT.length).toBeGreaterThan(0);
    });

    it('should contain content generation rules', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('内容生成规则');
      expect(GENERATE_CONTENT_PROMPT).toContain('具体');
      expect(GENERATE_CONTENT_PROMPT).toContain('简洁');
    });

    it('should define data-cards content structure', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('### data-cards');
      expect(GENERATE_CONTENT_PROMPT).toContain('"items"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"label"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"value"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"insight"');
    });

    it('should define data-chart content structure', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('### data-chart');
      expect(GENERATE_CONTENT_PROMPT).toContain('"chart_type"');
      expect(GENERATE_CONTENT_PROMPT).toContain('bar|line|pie|radar');
      expect(GENERATE_CONTENT_PROMPT).toContain('"labels"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"values"');
    });

    it('should define comparison-feature content structure', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('### comparison-feature');
      expect(GENERATE_CONTENT_PROMPT).toContain('"subjects"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"subject1_feature"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"subject2_feature"');
    });

    it('should define comparison-table content structure', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('### comparison-table');
      expect(GENERATE_CONTENT_PROMPT).toContain('"metrics"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"name"');
    });

    it('should define timeline content structure', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('### timeline');
      expect(GENERATE_CONTENT_PROMPT).toContain('"events"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"time"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"title"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"description"');
    });

    it('should define architecture content structure', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('### architecture');
      expect(GENERATE_CONTENT_PROMPT).toContain('"layers"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"children"');
    });

    it('should define quote content structure', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('### quote');
      expect(GENERATE_CONTENT_PROMPT).toContain('"quote"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"author"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"source"');
    });

    it('should define list content structure', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('### list');
      expect(GENERATE_CONTENT_PROMPT).toContain('"items"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"description"');
    });

    it('should define paragraph content structure', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('### paragraph');
      expect(GENERATE_CONTENT_PROMPT).toContain('"text"');
      expect(GENERATE_CONTENT_PROMPT).toContain('"highlight"');
    });

    it('should specify JSON output format requirement', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('JSON');
      expect(GENERATE_CONTENT_PROMPT).toContain('严格按照');
    });

    it('should include quantity guidelines', () => {
      expect(GENERATE_CONTENT_PROMPT).toContain('4-6');
      expect(GENERATE_CONTENT_PROMPT).toContain('4-5');
    });
  });

  describe('Simple Prompts', () => {
    it('should define DATA_SLIDE_PROMPT', () => {
      expect(DATA_SLIDE_PROMPT).toBeDefined();
      expect(DATA_SLIDE_PROMPT).toContain('数据展示');
    });

    it('should define COMPARISON_SLIDE_PROMPT', () => {
      expect(COMPARISON_SLIDE_PROMPT).toBeDefined();
      expect(COMPARISON_SLIDE_PROMPT).toContain('对比分析');
    });

    it('should define LIST_SLIDE_PROMPT', () => {
      expect(LIST_SLIDE_PROMPT).toBeDefined();
      expect(LIST_SLIDE_PROMPT).toContain('列表');
    });
  });

  describe('Prompt Consistency', () => {
    it('should have consistent content type names across prompts', () => {
      const contentTypes = [
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
        expect(PLAN_OUTLINE_PROMPT).toContain(type);
        expect(GENERATE_CONTENT_PROMPT).toContain(type);
      });
    });

    it('should use Chinese language consistently', () => {
      expect(PLAN_OUTLINE_PROMPT).toContain('幻灯片');
      expect(GENERATE_CONTENT_PROMPT).toContain('幻灯片');
    });
  });
});
