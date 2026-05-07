import { describe, it, expect, beforeEach } from 'vitest';
import { useWizardStore } from '@/store/useWizardStore';
import type { Outline, ContentSlide } from '@/types';

describe('WizardStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useWizardStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const state = useWizardStore.getState();

      expect(state.currentStep).toBe(0);
      expect(state.workMode).toBe('template');
      expect(state.inputType).toBe('topic');
      expect(state.inputContent).toBe('');
      expect(state.searchEnabled).toBe(true);
      expect(state.outline).toBeNull();
      expect(state.selectedTheme).toBe('business-modern');
      expect(state.generatedHtml).toBe('');
      expect(state.slidePages).toEqual([]);
      expect(state.currentSlideIndex).toBe(0);
      expect(state.isPresenterMode).toBe(false);
    });
  });

  describe('Step Navigation', () => {
    it('should set step correctly', () => {
      const { setStep } = useWizardStore.getState();

      setStep(1);
      expect(useWizardStore.getState().currentStep).toBe(1);

      setStep(3);
      expect(useWizardStore.getState().currentStep).toBe(3);
    });

    it('should allow setting step to 0', () => {
      const { setStep } = useWizardStore.getState();

      setStep(2);
      setStep(0);
      expect(useWizardStore.getState().currentStep).toBe(0);
    });
  });

  describe('Work Mode', () => {
    it('should set work mode to template', () => {
      const { setWorkMode } = useWizardStore.getState();

      setWorkMode('template');
      expect(useWizardStore.getState().workMode).toBe('template');
    });

    it('should set work mode to advanced', () => {
      const { setWorkMode } = useWizardStore.getState();

      setWorkMode('advanced');
      expect(useWizardStore.getState().workMode).toBe('advanced');
    });
  });

  describe('Input Handling', () => {
    it('should set input type and content', () => {
      const { setInput } = useWizardStore.getState();

      setInput('topic', '人工智能发展');
      const state = useWizardStore.getState();
      expect(state.inputType).toBe('topic');
      expect(state.inputContent).toBe('人工智能发展');
    });

    it('should set input type to text', () => {
      const { setInput } = useWizardStore.getState();

      setInput('text', '这是一段长文本内容...');
      const state = useWizardStore.getState();
      expect(state.inputType).toBe('text');
      expect(state.inputContent).toBe('这是一段长文本内容...');
    });

    it('should set input type to file', () => {
      const { setInput } = useWizardStore.getState();

      setInput('file', '文件内容');
      const state = useWizardStore.getState();
      expect(state.inputType).toBe('file');
    });

    it('should toggle search enabled', () => {
      const { setSearchEnabled } = useWizardStore.getState();

      expect(useWizardStore.getState().searchEnabled).toBe(true);

      setSearchEnabled(false);
      expect(useWizardStore.getState().searchEnabled).toBe(false);

      setSearchEnabled(true);
      expect(useWizardStore.getState().searchEnabled).toBe(true);
    });
  });

  describe('Outline Handling', () => {
    it('should set outline', () => {
      const { setOutline } = useWizardStore.getState();

      const mockOutline: Outline = {
        title: '测试大纲',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '副标题' },
          {
            page_type: 'content',
            page_number: 1,
            title: '内容1',
            content_type: 'paragraph',
            summary: '摘要',
            content: { text: '内容' },
          },
          { page_type: 'end', title: '结束' },
        ],
      };

      setOutline(mockOutline);
      expect(useWizardStore.getState().outline).toEqual(mockOutline);
    });

    it('should clear outline', () => {
      const { setOutline } = useWizardStore.getState();

      const mockOutline: Outline = {
        title: '测试',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '' },
          { page_type: 'end' },
        ],
      };

      setOutline(mockOutline);
      expect(useWizardStore.getState().outline).not.toBeNull();

      setOutline(null);
      expect(useWizardStore.getState().outline).toBeNull();
    });

    it('should set generating outline state', () => {
      const { setGeneratingOutline } = useWizardStore.getState();

      setGeneratingOutline(true);
      expect(useWizardStore.getState().isGeneratingOutline).toBe(true);

      setGeneratingOutline(false);
      expect(useWizardStore.getState().isGeneratingOutline).toBe(false);
    });
  });

  describe('Theme Handling', () => {
    it('should set theme', () => {
      const { setTheme } = useWizardStore.getState();

      setTheme('business-modern-dark');
      expect(useWizardStore.getState().selectedTheme).toBe('business-modern-dark');
    });

    it('should set advanced theme', () => {
      const { setAdvancedTheme } = useWizardStore.getState();

      setAdvancedTheme('paper-press');
      expect(useWizardStore.getState().advancedTheme).toBe('paper-press');
    });
  });

  describe('Advanced Mode Options', () => {
    it('should set aesthetic', () => {
      const { setAesthetic } = useWizardStore.getState();

      setAesthetic('minimal');
      expect(useWizardStore.getState().aesthetic).toBe('minimal');

      setAesthetic(null);
      expect(useWizardStore.getState().aesthetic).toBeNull();
    });

    it('should set page count', () => {
      const { setPageCount } = useWizardStore.getState();

      setPageCount(10);
      expect(useWizardStore.getState().pageCount).toBe(10);

      setPageCount(null);
      expect(useWizardStore.getState().pageCount).toBeNull();
    });

    it('should set text density', () => {
      const { setTextDensity } = useWizardStore.getState();

      setTextDensity('dense');
      expect(useWizardStore.getState().textDensity).toBe('dense');

      setTextDensity(null);
      expect(useWizardStore.getState().textDensity).toBeNull();
    });

    it('should set motion level', () => {
      const { setMotionLevel } = useWizardStore.getState();

      setMotionLevel('rich');
      expect(useWizardStore.getState().motionLevel).toBe('rich');

      setMotionLevel(null);
      expect(useWizardStore.getState().motionLevel).toBeNull();
    });
  });

  describe('Generation Handling', () => {
    it('should set generating state', () => {
      const { setGenerating } = useWizardStore.getState();

      setGenerating(true);
      expect(useWizardStore.getState().isGenerating).toBe(true);

      setGenerating(false);
      expect(useWizardStore.getState().isGenerating).toBe(false);
    });

    it('should update progress', () => {
      const { updateProgress } = useWizardStore.getState();

      updateProgress(3, 10);
      const state = useWizardStore.getState();
      expect(state.generatedPages).toBe(3);
      expect(state.totalPages).toBe(10);
    });

    it('should append slide page', () => {
      const { appendSlidePage } = useWizardStore.getState();

      appendSlidePage('<html>Page 1</html>');
      expect(useWizardStore.getState().slidePages).toEqual(['<html>Page 1</html>']);

      appendSlidePage('<html>Page 2</html>');
      expect(useWizardStore.getState().slidePages).toEqual([
        '<html>Page 1</html>',
        '<html>Page 2</html>',
      ]);
    });

    it('should set slide pages', () => {
      const { setSlidePages } = useWizardStore.getState();

      setSlidePages(['<html>P1</html>', '<html>P2</html>', '<html>P3</html>']);
      expect(useWizardStore.getState().slidePages.length).toBe(3);
    });

    it('should set generated HTML', () => {
      const { setGeneratedHtml } = useWizardStore.getState();

      setGeneratedHtml('<html><body>Full document</body></html>');
      expect(useWizardStore.getState().generatedHtml).toBe('<html><body>Full document</body></html>');
    });

    it('should set file ID', () => {
      const { setFileId } = useWizardStore.getState();

      setFileId('file-abc123');
      expect(useWizardStore.getState().fileId).toBe('file-abc123');
    });
  });

  describe('Preview/Presenter Mode', () => {
    it('should set current slide index', () => {
      const { setCurrentSlideIndex } = useWizardStore.getState();

      setCurrentSlideIndex(5);
      expect(useWizardStore.getState().currentSlideIndex).toBe(5);
    });

    it('should toggle presenter mode', () => {
      const { setPresenterMode } = useWizardStore.getState();

      setPresenterMode(true);
      expect(useWizardStore.getState().isPresenterMode).toBe(true);

      setPresenterMode(false);
      expect(useWizardStore.getState().isPresenterMode).toBe(false);
    });
  });

  describe('Reset', () => {
    it('should reset all state to initial values', () => {
      const store = useWizardStore.getState();

      // Modify state
      store.setStep(4);
      store.setWorkMode('advanced');
      store.setInput('text', 'modified content');
      store.setOutline({
        title: 'Test',
        slides: [
          { page_type: 'cover', title: 'Cover', subtitle: '' },
          { page_type: 'end' },
        ],
      });
      store.setTheme('new-theme');
      store.appendSlidePage('<html>test</html>');
      store.setGenerating(true);
      store.setCurrentSlideIndex(3);
      store.setPresenterMode(true);

      // Reset
      store.reset();

      const resetState = useWizardStore.getState();
      expect(resetState.currentStep).toBe(0);
      expect(resetState.workMode).toBe('template');
      expect(resetState.inputContent).toBe('');
      expect(resetState.outline).toBeNull();
      expect(resetState.selectedTheme).toBe('business-modern');
      expect(resetState.slidePages).toEqual([]);
      expect(resetState.isGenerating).toBe(false);
      expect(resetState.currentSlideIndex).toBe(0);
      expect(resetState.isPresenterMode).toBe(false);
    });
  });

  describe('Generated Components', () => {
    it('should set generated components', () => {
      const { setGeneratedComponents } = useWizardStore.getState();

      setGeneratedComponents('import React from "react";');
      expect(useWizardStore.getState().generatedComponents).toBe('import React from "react";');

      setGeneratedComponents(null);
      expect(useWizardStore.getState().generatedComponents).toBeNull();
    });

    it('should set design', () => {
      const { setDesign } = useWizardStore.getState();

      const mockDesign = {
        palette: { bg: '#fff', text: '#000', accent: '#blue' },
        fonts: { display: 'font1', body: 'font2' },
        typeScale: { hero: 48, body: 16 },
        radius: 8,
      };

      setDesign(mockDesign);
      expect(useWizardStore.getState().design).toEqual(mockDesign);

      setDesign(null);
      expect(useWizardStore.getState().design).toBeNull();
    });
  });
});