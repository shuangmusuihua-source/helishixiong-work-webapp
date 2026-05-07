'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Settings, Home, FileText, Palette, Layers, Download } from 'lucide-react';

const templateSteps = [
  { id: 0, title: '模式', description: '选择工作模式', icon: Home },
  { id: 1, title: '输入', description: '话题或内容', icon: FileText },
  { id: 2, title: '大纲', description: '内容规划', icon: Layers },
  { id: 3, title: '主题', description: '视觉风格', icon: Palette },
  { id: 4, title: '生成', description: '实时预览', icon: Layers },
  { id: 5, title: '导出', description: '下载文件', icon: Download },
];

const advancedSteps = [
  { id: 0, title: '模式', description: '选择工作模式', icon: Home },
  { id: 1, title: '输入', description: '话题或内容', icon: FileText },
  { id: 2, title: '大纲', description: '内容规划', icon: Layers },
  { id: 3, title: '主题', description: '高级主题', icon: Palette },
  { id: 4, title: '选项', description: '配置参数', icon: Settings },
  { id: 5, title: '生成', description: '组件生成', icon: Layers },
  { id: 6, title: '导出', description: '下载文件', icon: Download },
];

export function Sidebar() {
  const { currentStep, setStep, outline, selectedTheme, advancedTheme, generatedHtml, workMode } = useWizardStore();

  const steps = workMode === 'advanced' ? advancedSteps : templateSteps;

  const canNavigate = (stepId: number): boolean => {
    if (stepId === 0) return true;
    if (stepId === 1) return true;
    if (stepId === 2) return true;
    if (workMode === 'template') {
      if (stepId === 3) return outline !== null;
      if (stepId === 4) return outline !== null && selectedTheme !== '';
      if (stepId === 5) return generatedHtml !== '';
    } else {
      if (stepId === 3) return outline !== null;
      if (stepId === 4) return outline !== null && advancedTheme !== null;
      if (stepId === 5) return outline !== null && advancedTheme !== null;
      if (stepId === 6) return generatedHtml !== '';
    }
    return false;
  };

  const isCompleted = (stepId: number): boolean => {
    if (stepId === 0) return workMode !== null;
    if (stepId === 1) return outline !== null;
    if (workMode === 'template') {
      if (stepId === 2) return outline !== null && selectedTheme !== '';
      if (stepId === 3) return outline !== null && selectedTheme !== '' && generatedHtml !== '';
      if (stepId === 4) return generatedHtml !== '';
    } else {
      if (stepId === 2) return outline !== null && advancedTheme !== null;
      if (stepId === 3) return advancedTheme !== null;
      if (stepId === 4) return advancedTheme !== null;
      if (stepId === 5) return generatedHtml !== '';
    }
    return false;
  };

  return (
    <aside className="sidebar flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3 p-3 rounded-xl glass-button">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground">河狸师兄</span>
            <span className="text-[10px] text-muted-foreground">AI Slides</span>
          </div>
        </div>
      </div>

      {/* Mode indicator */}
      {workMode === 'advanced' && (
        <div className="px-6 pb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-chart-4/10 border border-chart-4/20 text-chart-4 text-xs font-semibold">
            <Settings className="h-3 w-3" />
            高级模式
          </div>
        </div>
      )}

      {/* Steps */}
      <nav className="flex-1 p-4 pt-2">
        <ol className="space-y-1.5">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const completed = isCompleted(step.id);
            const clickable = canNavigate(step.id);
            const Icon = step.icon;

            return (
              <li key={step.id}>
                <button
                  onClick={() => clickable && setStep(step.id)}
                  disabled={!clickable}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl transition-all duration-300',
                    isActive && 'bg-primary/10 border border-primary/20',
                    !isActive && clickable && 'hover:bg-muted/50 cursor-pointer border border-transparent',
                    !clickable && 'opacity-40 cursor-not-allowed border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        'step-indicator',
                        completed && 'completed',
                        isActive && 'active',
                        !isActive && !completed && 'pending'
                      )}
                    >
                      {completed ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'font-semibold text-sm tracking-tight',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground/70 truncate">
                        {step.description}
                      </div>
                    </div>
                    {clickable && !isActive && (
                      <Icon className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-border/30">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <Sparkles className="h-3 w-3" />
          <span>AI 驱动的幻灯片生成</span>
        </div>
      </div>
    </aside>
  );
}
