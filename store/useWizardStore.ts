import { create } from 'zustand';
import type { Outline, InputType } from '@/types';

interface WizardState {
  // 当前步骤 (1-5)
  currentStep: number;

  // Step 1: 输入
  inputType: InputType;
  inputContent: string;
  searchEnabled: boolean;

  // Step 2: 大纲
  outline: Outline | null;
  isGeneratingOutline: boolean;

  // Step 3: 主题
  selectedTheme: string;

  // Step 4: 生成
  generatedHtml: string;
  generatedPages: number;
  totalPages: number;
  isGenerating: boolean;
  fileId: string | null;

  // Actions
  setStep: (step: number) => void;
  setInput: (type: InputType, content: string) => void;
  setSearchEnabled: (enabled: boolean) => void;
  setOutline: (outline: Outline) => void;
  setGeneratingOutline: (generating: boolean) => void;
  setTheme: (themeId: string) => void;
  setGenerating: (generating: boolean) => void;
  updateProgress: (pageNum: number, total: number) => void;
  appendHtml: (html: string) => void;
  setFileId: (fileId: string) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  inputType: 'topic' as InputType,
  inputContent: '',
  searchEnabled: true,
  outline: null,
  isGeneratingOutline: false,
  selectedTheme: 'business-modern',
  generatedHtml: '',
  generatedPages: 0,
  totalPages: 0,
  isGenerating: false,
  fileId: null,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setInput: (type, content) => set({
    inputType: type,
    inputContent: content,
  }),

  setSearchEnabled: (enabled) => set({ searchEnabled: enabled }),

  setOutline: (outline) => set({ outline }),

  setGeneratingOutline: (generating) => set({ isGeneratingOutline: generating }),

  setTheme: (themeId) => set({ selectedTheme: themeId }),

  setGenerating: (generating) => set({ isGenerating: generating }),

  updateProgress: (pageNum, total) => set({
    generatedPages: pageNum,
    totalPages: total,
  }),

  appendHtml: (html) => set((state) => ({
    generatedHtml: state.generatedHtml + html,
  })),

  setFileId: (fileId) => set({ fileId }),

  reset: () => set(initialState),
}));