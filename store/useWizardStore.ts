import { create } from 'zustand';
import type { Outline, InputType, WorkMode, TextDensity, MotionLevel, AdvancedTheme, DesignSystem } from '@/types';

interface WizardState {
  // 当前步骤 (0-5, 0 为模式选择)
  currentStep: number;

  // Step 0: 模式选择
  workMode: WorkMode;

  // Step 1: 输入
  inputType: InputType;
  inputContent: string;
  searchEnabled: boolean;

  // Step 2: 大纲
  outline: Outline | null;
  isGeneratingOutline: boolean;

  // Step 3: 主题
  selectedTheme: string;

  // 高级模式专属
  advancedTheme: AdvancedTheme;
  aesthetic: string | null;
  pageCount: number | null;
  textDensity: TextDensity | null;
  motionLevel: MotionLevel | null;
  generatedComponents: string | null;
  design: DesignSystem | null;

  // Step 4: 生成
  generatedHtml: string;
  slidePages: string[];  // 各页面 HTML
  generatedPages: number;
  totalPages: number;
  isGenerating: boolean;
  fileId: string | null;

  // 预览/演示状态
  currentSlideIndex: number;
  isPresenterMode: boolean;

  // Actions
  setStep: (step: number) => void;
  setWorkMode: (mode: WorkMode) => void;
  setInput: (type: InputType, content: string) => void;
  setSearchEnabled: (enabled: boolean) => void;
  setOutline: (outline: Outline | null) => void;
  setGeneratingOutline: (generating: boolean) => void;
  setTheme: (themeId: string) => void;
  setAdvancedTheme: (theme: AdvancedTheme) => void;
  setAesthetic: (aesthetic: string) => void;
  setPageCount: (count: number) => void;
  setTextDensity: (density: TextDensity) => void;
  setMotionLevel: (level: MotionLevel) => void;
  setGeneratedComponents: (code: string) => void;
  setDesign: (design: DesignSystem) => void;
  setGenerating: (generating: boolean) => void;
  updateProgress: (pageNum: number, total: number) => void;
  appendHtml: (html: string) => void;
  appendSlidePage: (html: string) => void;
  setGeneratedHtml: (html: string) => void;
  setSlidePages: (pages: string[]) => void;
  setFileId: (fileId: string) => void;
  setCurrentSlideIndex: (index: number) => void;
  setPresenterMode: (mode: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  workMode: 'template' as WorkMode,
  inputType: 'topic' as InputType,
  inputContent: '',
  searchEnabled: true,
  outline: null,
  isGeneratingOutline: false,
  selectedTheme: 'business-modern',
  advancedTheme: 'neon-terminal' as AdvancedTheme,
  aesthetic: null,
  pageCount: null,
  textDensity: null,
  motionLevel: null,
  generatedComponents: null,
  design: null,
  generatedHtml: '',
  slidePages: [],
  generatedPages: 0,
  totalPages: 0,
  isGenerating: false,
  fileId: null,
  currentSlideIndex: 0,
  isPresenterMode: false,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setWorkMode: (mode) => set({ workMode: mode }),

  setInput: (type, content) => set({
    inputType: type,
    inputContent: content,
  }),

  setSearchEnabled: (enabled) => set({ searchEnabled: enabled }),

  setOutline: (outline) => set({ outline }),

  setGeneratingOutline: (generating) => set({ isGeneratingOutline: generating }),

  setTheme: (themeId) => set({ selectedTheme: themeId }),

  setAdvancedTheme: (theme) => set({ advancedTheme: theme }),

  setAesthetic: (aesthetic) => set({ aesthetic }),

  setPageCount: (count) => set({ pageCount: count }),

  setTextDensity: (density) => set({ textDensity: density }),

  setMotionLevel: (level) => set({ motionLevel: level }),

  setGeneratedComponents: (code) => set({ generatedComponents: code }),

  setDesign: (design) => set({ design }),

  setGenerating: (generating) => set({ isGenerating: generating }),

  updateProgress: (pageNum, total) => set({
    generatedPages: pageNum,
    totalPages: total,
  }),

  appendHtml: (html) => set((state) => ({
    generatedHtml: state.generatedHtml + html,
  })),

  appendSlidePage: (html) => set((state) => ({
    slidePages: [...state.slidePages, html],
  })),

  setGeneratedHtml: (html) => set({ generatedHtml: html }),

  setSlidePages: (pages) => set({ slidePages: pages }),

  setFileId: (fileId) => set({ fileId }),

  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),

  setPresenterMode: (mode) => set({ isPresenterMode: mode }),

  reset: () => set(initialState),
}));
