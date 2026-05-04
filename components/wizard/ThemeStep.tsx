'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  {
    id: 'business-modern',
    name: '商务现代',
    description: '清新绿色 · 毛玻璃质感',
    preview: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)',
      primary: '#10B981',
      cardBg: 'rgba(255, 255, 255, 0.7)',
    },
  },
  {
    id: 'business-modern-dark',
    name: '商务深色',
    description: '深色背景 · 绿色点缀',
    preview: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      primary: '#10B981',
      cardBg: 'rgba(30, 41, 59, 0.8)',
    },
  },
  {
    id: 'business-simple',
    name: '简约白',
    description: '极简风格 · 白底深字',
    preview: {
      background: '#ffffff',
      primary: '#1E293B',
      cardBg: '#f8fafc',
    },
  },
  {
    id: 'aisumicha',
    name: '蓝墨茶',
    description: '纸张质感 · 衬线字体',
    preview: {
      background: '#f5f4ed',
      primary: '#1B365D',
      cardBg: '#faf9f5',
    },
  },
];

export function ThemeStep() {
  const { selectedTheme, setTheme, setStep, outline } = useWizardStore();

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
          <h2 className="text-2xl font-bold">选择主题</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          选择适合您内容的视觉风格
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={cn(
              'theme-preview-card cursor-pointer',
              selectedTheme === theme.id && 'selected'
            )}
          >
            {/* 预览 */}
            <div
              className="h-28 relative"
              style={{ background: theme.preview.background }}
            >
              <div
                className="absolute inset-3 rounded-card"
                style={{
                  backgroundColor: theme.preview.cardBg,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="p-2.5">
                  <div
                    className="h-2 w-14 rounded mb-1.5"
                    style={{ backgroundColor: theme.preview.primary }}
                  />
                  <div className="h-1.5 w-20 bg-gray-300/40 rounded mb-2" />
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-gray-200/40 rounded" />
                    <div className="h-1 w-3/4 bg-gray-200/40 rounded" />
                  </div>
                </div>
              </div>

              {selectedTheme === theme.id && (
                <div className="absolute top-2.5 right-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.preview.primary, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* 信息 */}
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-0.5">{theme.name}</h3>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(2)}>
          返回
        </Button>
        <Button onClick={() => setStep(4)} className="btn-primary-glow">
          下一步：生成
        </Button>
      </div>
    </div>
  );
}