'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Layout, Code2, Sparkles, Zap, ArrowRight, Check } from 'lucide-react';

export function ModeSelectStep() {
  const { workMode, setWorkMode, setStep } = useWizardStore();

  const handleSelect = (mode: 'template' | 'advanced') => {
    setWorkMode(mode);
    setStep(1);
  };

  return (
    <div className="step-content animate-fade-in">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">开始创作</span>
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight">选择工作模式</h2>
        <p className="text-muted-foreground">
          根据您的需求选择合适的模式
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* 模板模式 */}
        <div
          className={cn(
            'p-8 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group',
            workMode === 'template'
              ? 'glass border-primary/30 shadow-xl shadow-primary/10'
              : 'glass hover:shadow-lg',
          )}
          onClick={() => setWorkMode('template')}
        >
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">模板模式</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-2/10 text-chart-2 text-xs font-semibold mt-1">
                  <Check className="h-3 w-3" />
                  推荐
                </span>
              </div>
            </div>

            <p className="text-muted-foreground mb-5 leading-relaxed">
              快速生成，专业效果，适合商务汇报、教学课件等场景
            </p>

            <ul className="text-sm text-muted-foreground/80 space-y-2.5 mb-8">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                4 个精选主题模板
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                标准布局，一键生成
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                分钟级完成交付
              </li>
            </ul>

            <Button
              className={cn(
                "w-full h-12 rounded-xl font-semibold transition-all",
                workMode === 'template'
                  ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                  : "glass-button hover:bg-primary/10"
              )}
              variant={workMode === 'template' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('template');
              }}
            >
              选择模板模式
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 高级模式 */}
        <div
          className={cn(
            'p-8 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group',
            workMode === 'advanced'
              ? 'glass border-chart-4/30 shadow-xl shadow-chart-4/10'
              : 'glass hover:shadow-lg',
          )}
          onClick={() => setWorkMode('advanced')}
        >
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-chart-4/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 rounded-xl bg-chart-4/20 border border-chart-4/30">
                <Code2 className="h-6 w-6 text-chart-4" />
              </div>
              <div>
                <h3 className="font-bold text-lg">高级模式</h3>
                <span className="text-xs text-muted-foreground mt-1">设计师 / 开发者</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-5 leading-relaxed">
              完全自定义，无限创意，适合专业用户和定制需求
            </p>

            <ul className="text-sm text-muted-foreground/80 space-y-2.5 mb-8">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-chart-4" />
                React 组件生成
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-chart-4" />
                自定义动画效果
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-chart-4" />
                可视化检查器
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-chart-4" />
                3 个 OpenSlide 主题
              </li>
            </ul>

            <Button
              className={cn(
                "w-full h-12 rounded-xl font-semibold transition-all",
                workMode === 'advanced'
                  ? "bg-chart-4 hover:bg-chart-4/90 shadow-lg shadow-chart-4/30"
                  : "glass-button hover:bg-chart-4/10"
              )}
              variant={workMode === 'advanced' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('advanced');
              }}
            >
              选择高级模式
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}