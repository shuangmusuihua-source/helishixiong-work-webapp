'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  {
    id: 'business-modern',
    name: '商务现代白',
    description: '清新绿色系、毛玻璃卡片、弥散渐变背景',
    preview: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)',
      primary: '#10B981',
      cardBg: 'rgba(255, 255, 255, 0.8)',
    },
  },
  {
    id: 'business-modern-dark',
    name: '商务现代黑',
    description: '深色背景、绿色系点缀、毛玻璃质感',
    preview: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      primary: '#10B981',
      cardBg: 'rgba(30, 41, 59, 0.8)',
    },
  },
  {
    id: 'business-simple',
    name: '商务简白',
    description: '简约风格、白底深字、清新配色',
    preview: {
      background: '#ffffff',
      primary: '#1E293B',
      cardBg: '#f8fafc',
    },
  },
];

export function ThemeStep() {
  const { selectedTheme, setTheme, setStep, outline } = useWizardStore();

  if (!outline) {
    return (
      <div className="step-content">
        <p className="text-muted-foreground">请先完成大纲编辑</p>
        <Button onClick={() => setStep(2)} className="mt-4">
          返回大纲
        </Button>
      </div>
    );
  }

  return (
    <div className="step-content">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">选择主题</h2>
        <p className="text-muted-foreground">
          选择适合您内容的视觉风格
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg',
              selectedTheme === theme.id && 'ring-2 ring-primary'
            )}
            onClick={() => setTheme(theme.id)}
          >
            {/* 预览区域 */}
            <div
              className="h-40 rounded-t-lg relative overflow-hidden"
              style={{ background: theme.preview.background }}
            >
              {/* 模拟幻灯片预览 */}
              <div
                className="absolute inset-4 rounded-lg p-4"
                style={{
                  backgroundColor: theme.preview.cardBg,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  className="h-3 w-24 rounded mb-2"
                  style={{ backgroundColor: theme.preview.primary }}
                />
                <div className="h-2 w-32 bg-gray-300 rounded mb-3" />
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-gray-200 rounded" />
                  <div className="h-1.5 w-3/4 bg-gray-200 rounded" />
                  <div className="h-1.5 w-5/6 bg-gray-200 rounded" />
                </div>
              </div>

              {/* 选中标记 */}
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.preview.primary }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            <CardHeader className="py-4">
              <CardTitle className="text-lg">{theme.name}</CardTitle>
              <CardDescription>{theme.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(2)}>
          返回上一步
        </Button>
        <Button onClick={() => setStep(4)}>
          下一步：生成预览
        </Button>
      </div>
    </div>
  );
}