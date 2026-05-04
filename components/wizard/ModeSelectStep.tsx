'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Layout, Code2 } from 'lucide-react';

export function ModeSelectStep() {
  const { workMode, setWorkMode, setStep } = useWizardStore();

  const handleSelect = (mode: 'template' | 'advanced') => {
    setWorkMode(mode);
    setStep(1);
  };

  return (
    <div className="step-content animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">选择工作模式</h2>
        <p className="text-sm text-muted-foreground">
          根据您的需求选择合适的模式
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* 模板模式 */}
        <div
          className={cn(
            'glass-card p-6 cursor-pointer transition-all',
            'hover:border-primary/50 hover:shadow-lg',
            workMode === 'template' && 'border-primary ring-2 ring-primary/20',
          )}
          onClick={() => setWorkMode('template')}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Layout className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">模板模式</h3>
              <span className="text-xs text-muted-foreground">推荐</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            快速生成，专业效果，适合商务汇报
          </p>

          <ul className="text-xs text-muted-foreground space-y-1.5 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              4 个精选主题
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              标准布局模板
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              分钟级完成
            </li>
          </ul>

          <Button
            className={cn("w-full", workMode === 'template' && "btn-primary-glow")}
            variant={workMode === 'template' ? 'default' : 'outline'}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('template');
            }}
          >
            选择
          </Button>
        </div>

        {/* 高级模式 */}
        <div
          className={cn(
            'glass-card p-6 cursor-pointer transition-all',
            'hover:border-primary/50 hover:shadow-lg',
            workMode === 'advanced' && 'border-primary ring-2 ring-primary/20',
          )}
          onClick={() => setWorkMode('advanced')}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Code2 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">高级模式</h3>
              <span className="text-xs text-muted-foreground">设计师/开发者</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            完全自定义，无限创意，适合专业用户
          </p>

          <ul className="text-xs text-muted-foreground space-y-1.5 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              React 组件生成
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              自定义动画
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              可视化检查器
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              3 个 OpenSlide 主题
            </li>
          </ul>

          <Button
            className={cn("w-full", workMode === 'advanced' && "btn-primary-glow")}
            variant={workMode === 'advanced' ? 'default' : 'outline'}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('advanced');
            }}
          >
            选择
          </Button>
        </div>
      </div>
    </div>
  );
}
