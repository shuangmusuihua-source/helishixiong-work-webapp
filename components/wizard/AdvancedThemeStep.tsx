'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Check, Palette, Monitor, FileText, Newspaper, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdvancedTheme } from '@/types';
import { DesignSystemPanel } from '@/components/inspector/DesignSystemPanel';
import { useState } from 'react';

const advancedThemes: {
  id: AdvancedTheme;
  name: string;
  description: string;
  icon: React.ReactNode;
  mode: 'dark' | 'light';
  preview: {
    background: string;
    accent: string;
    text: string;
    secondary: string;
  };
  features: string[];
}[] = [
  {
    id: 'neon-terminal',
    name: 'Neon Terminal',
    description: '暗色终端风格 · 霓虹绿点缀 · 代码感',
    icon: <Monitor className="h-5 w-5" />,
    mode: 'dark',
    preview: {
      background: '#05070a',
      accent: '#39ff88',
      text: '#e6edf3',
      secondary: '#5cd0ff',
    },
    features: ['等宽字体', '闪烁光标', 'CRT扫描线', '霓虹发光'],
  },
  {
    id: 'paper-press',
    name: 'Paper Press',
    description: '印刷纸张风格 · 米白底色 · 朱砂红点缀',
    icon: <FileText className="h-5 w-5" />,
    mode: 'light',
    preview: {
      background: '#f6f1e7',
      accent: '#c43a1d',
      text: '#141210',
      secondary: '#8a8276',
    },
    features: ['衬线标题', '纸张质感', '无动画', '印刷风格'],
  },
  {
    id: 'editorial-noir',
    name: 'Editorial Noir',
    description: '暗色杂志风格 · 琥珀色点缀 · 编辑感',
    icon: <Newspaper className="h-5 w-5" />,
    mode: 'dark',
    preview: {
      background: '#0b0d10',
      accent: '#d6a64b',
      text: '#f4ecdc',
      secondary: '#7a7468',
    },
    features: ['衬线标题', '微妙动画', '杂志排版', '优雅克制'],
  },
];

export function AdvancedThemeStep() {
  const { advancedTheme, setAdvancedTheme, setStep, outline } = useWizardStore();
  const [showCustomize, setShowCustomize] = useState(false);

  if (!outline) {
    return (
      <div className="step-content animate-fade-in">
        <p className="text-muted-foreground">请先完成大纲编辑</p>
        <Button onClick={() => setStep(2)} className="mt-4">返回大纲</Button>
      </div>
    );
  }

  return (
    <div className="step-content animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">选择高级主题</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          高级模式主题使用 React 组件生成，支持更灵活的自定义
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {advancedThemes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => setAdvancedTheme(theme.id)}
            className={cn(
              'advanced-theme-card cursor-pointer transition-all',
              advancedTheme === theme.id && 'selected'
            )}
          >
            {/* 预览 */}
            <div
              className="h-40 relative overflow-hidden"
              style={{ backgroundColor: theme.preview.background }}
            >
              {/* 模拟终端/印刷布局 */}
              <div className="absolute inset-4 flex flex-col gap-3">
                {/* Eyebrow */}
                <div
                  className="text-xs font-medium tracking-widest uppercase"
                  style={{ color: theme.preview.accent }}
                >
                  {theme.mode === 'dark' ? '[ CHAPTER 01 ]' : 'FIELD NOTES · 2026'}
                </div>

                {/* Title */}
                <div
                  className="text-lg font-bold leading-tight"
                  style={{ color: theme.preview.text }}
                >
                  {theme.id === 'neon-terminal' && (
                    <span className="flex items-center gap-2">
                      <span style={{ color: theme.preview.accent }}>$</span>
                      <span>boot sequence</span>
                      <span
                        className="inline-block w-1.5 h-4"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                    </span>
                  )}
                  {theme.id === 'paper-press' && 'Notes from a slow studio.'}
                  {theme.id === 'editorial-noir' && 'The shape of a quiet year.'}
                </div>

                {/* Body lines */}
                <div className="space-y-1.5 flex-1">
                  <div
                    className="h-1 w-full rounded"
                    style={{ backgroundColor: theme.preview.secondary, opacity: 0.3 }}
                  />
                  <div
                    className="h-1 w-3/4 rounded"
                    style={{ backgroundColor: theme.preview.secondary, opacity: 0.3 }}
                  />
                  <div
                    className="h-1 w-5/6 rounded"
                    style={{ backgroundColor: theme.preview.secondary, opacity: 0.2 }}
                  />
                </div>

                {/* Footer */}
                <div
                  className="text-xs flex justify-between pt-2 border-t"
                  style={{
                    color: theme.preview.secondary,
                    borderColor: theme.preview.secondary,
                    opacity: 0.5
                  }}
                >
                  <span>{theme.name}</span>
                  <span>01 / 08</span>
                </div>
              </div>

              {/* 选中标记 */}
              {advancedTheme === theme.id && (
                <div className="absolute top-3 right-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.preview.accent, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {/* 模式标签 */}
              <div
                className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.preview.secondary,
                }}
              >
                {theme.mode === 'dark' ? '深色' : '浅色'}
              </div>
            </div>

            {/* 信息 */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div style={{ color: theme.preview.accent }}>{theme.icon}</div>
                <h3 className="font-semibold">{theme.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{theme.description}</p>

              {/* 特性标签 */}
              <div className="flex flex-wrap gap-1.5">
                {theme.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-0.5 text-xs rounded-full bg-muted/50"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 自定义设计系统 */}
      <div className="mt-6 border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCustomize(!showCustomize)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">自定义设计系统</span>
            <span className="text-xs text-muted-foreground">（颜色、字体、字号）</span>
          </div>
          {showCustomize ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {showCustomize && (
          <div className="border-t bg-card">
            <DesignSystemPanel />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(2)}>
          返回
        </Button>
        <Button onClick={() => setStep(4)} className="btn-primary-glow">
          下一步：配置选项
        </Button>
      </div>
    </div>
  );
}
