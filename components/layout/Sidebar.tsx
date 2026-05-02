'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, title: '输入处理', description: '输入话题或上传文件' },
  { id: 2, title: '内容规划', description: '编辑幻灯片大纲' },
  { id: 3, title: '主题选择', description: '选择视觉风格' },
  { id: 4, title: '生成预览', description: '实时生成预览' },
  { id: 5, title: '交付导出', description: '下载 HTML 文件' },
];

export function Sidebar() {
  const { currentStep, setStep, outline, selectedTheme, generatedHtml } = useWizardStore();

  const canNavigate = (stepId: number): boolean => {
    // Step 1 始终可访问
    if (stepId === 1) return true;
    // Step 2 需要有输入内容
    if (stepId === 2) return true; // 允许前进
    // Step 3 需要有大纲
    if (stepId === 3) return outline !== null;
    // Step 4 需要选择了主题
    if (stepId === 4) return outline !== null && selectedTheme !== '';
    // Step 5 需要已生成
    if (stepId === 5) return generatedHtml !== '';
    return false;
  };

  const isCompleted = (stepId: number): boolean => {
    if (stepId === 1) return outline !== null;
    if (stepId === 2) return outline !== null && selectedTheme !== '';
    if (stepId === 3) return outline !== null && selectedTheme !== '' && generatedHtml !== '';
    if (stepId === 4) return generatedHtml !== '';
    return false;
  };

  return (
    <aside className="sidebar flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Kami Slides</h1>
        <p className="text-sm text-muted-foreground">智能幻灯片生成</p>
      </div>

      <nav className="flex-1 p-4">
        <ol className="space-y-2">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const completed = isCompleted(step.id);
            const clickable = canNavigate(step.id);

            return (
              <li key={step.id}>
                <button
                  onClick={() => clickable && setStep(step.id)}
                  disabled={!clickable}
                  className={cn(
                    'w-full text-left p-4 rounded-lg transition-colors',
                    isActive && 'bg-primary/10 border-2 border-primary',
                    !isActive && clickable && 'hover:bg-muted cursor-pointer',
                    !clickable && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                        completed && 'bg-primary text-primary-foreground',
                        isActive && !completed && 'bg-primary text-primary-foreground',
                        !isActive && !completed && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {completed ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}