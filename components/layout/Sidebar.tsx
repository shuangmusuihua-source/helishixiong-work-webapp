'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Settings } from 'lucide-react';

const steps = [
  { id: 0, title: '模式', description: '选择工作模式' },
  { id: 1, title: '输入', description: '话题或内容' },
  { id: 2, title: '大纲', description: '内容规划' },
  { id: 3, title: '主题', description: '视觉风格' },
  { id: 4, title: '生成', description: '实时预览' },
  { id: 5, title: '导出', description: '下载文件' },
];

export function Sidebar() {
  const { currentStep, setStep, outline, selectedTheme, generatedHtml, workMode } = useWizardStore();

  const canNavigate = (stepId: number): boolean => {
    if (stepId === 0) return true;
    if (stepId === 1) return true;
    if (stepId === 2) return true;
    if (stepId === 3) return outline !== null;
    if (stepId === 4) return outline !== null && selectedTheme !== '';
    if (stepId === 5) return generatedHtml !== '';
    return false;
  };

  const isCompleted = (stepId: number): boolean => {
    if (stepId === 0) return workMode !== null;
    if (stepId === 1) return outline !== null;
    if (stepId === 2) return outline !== null && selectedTheme !== '';
    if (stepId === 3) return outline !== null && selectedTheme !== '' && generatedHtml !== '';
    if (stepId === 4) return generatedHtml !== '';
    return false;
  };

  return (
    <aside className="sidebar flex flex-col">
      {/* Logo */}
      <div className="p-5">
        <div className="glass-card glass-card-sm p-3 inline-flex items-center gap-2.5">
          <div className="p-1.5 rounded-card-sm bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">Kami Slides</span>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 p-4 pt-0">
        <ol className="space-y-1.5">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const completed = isCompleted(step.id);
            const clickable = canNavigate(step.id);

            return (
              <li key={step.id}>
                <button
                  onClick={() => clickable && setStep(step.id)}
                  disabled={!clickable}
                  className={cn(
                    'w-full text-left p-3 rounded-card transition-all duration-200',
                    isActive && 'bg-primary/8',
                    !isActive && clickable && 'hover:bg-muted/50 cursor-pointer',
                    !clickable && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'step-indicator',
                        completed && 'completed',
                        isActive && 'active',
                        !isActive && !completed && 'pending'
                      )}
                    >
                      {completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'font-medium text-sm',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
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

      {/* Footer */}
      <div className="p-4">
        <div className="text-xs text-muted-foreground text-center opacity-60">
          AI 驱动的幻灯片生成
        </div>
      </div>
    </aside>
  );
}
