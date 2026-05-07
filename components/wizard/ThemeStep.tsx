'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Check, Palette, ArrowRight } from 'lucide-react';
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
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-6">请先完成大纲编辑</p>
          <Button onClick={() => setStep(2)} className="rounded-xl font-semibold">
            返回大纲
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="step-content animate-fade-in">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button mb-6">
          <Palette className="h-4 w-4 text-chart-3" />
          <span className="text-sm font-medium">视觉风格</span>
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight">选择主题</h2>
        <p className="text-muted-foreground">
          选择适合您内容的视觉风格
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={cn(
              'rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group',
              selectedTheme === theme.id
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl shadow-primary/20'
                : 'glass hover:shadow-lg hover:scale-[1.02]'
            )}
          >
            {/* 预览 */}
            <div
              className="h-36 relative overflow-hidden"
              style={{ background: theme.preview.background }}
            >
              <div
                className="absolute inset-4 rounded-xl"
                style={{
                  backgroundColor: theme.preview.cardBg,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="p-3">
                  <div
                    className="h-2.5 w-16 rounded mb-2"
                    style={{ backgroundColor: theme.preview.primary }}
                  />
                  <div className="h-1.5 w-24 bg-gray-300/40 rounded mb-3" />
                  <div className="space-y-1.5">
                    <div className="h-1 w-full bg-gray-200/40 rounded" />
                    <div className="h-1 w-4/5 bg-gray-200/40 rounded" />
                    <div className="h-1 w-3/5 bg-gray-200/40 rounded" />
                  </div>
                </div>
              </div>

              {selectedTheme === theme.id && (
                <div className="absolute top-3 right-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: theme.preview.primary }}
                  >
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* 信息 */}
            <div className="p-4 glass">
              <h3 className="font-semibold mb-1">{theme.name}</h3>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-10">
        <Button
          variant="outline"
          onClick={() => setStep(2)}
          className="h-11 px-6 rounded-xl font-medium"
        >
          返回
        </Button>
        <Button
          onClick={() => setStep(4)}
          className="h-11 px-8 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
        >
          下一步：生成
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
