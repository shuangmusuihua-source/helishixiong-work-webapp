'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Settings, Sparkles, FileText, Zap, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TextDensity, MotionLevel } from '@/types';

const aestheticOptions = [
  { id: 'professional', name: '专业严谨', description: '适合商务汇报、技术分享' },
  { id: 'creative', name: '创意活泼', description: '适合产品发布、品牌展示' },
  { id: 'minimal', name: '极简克制', description: '适合设计展示、艺术内容' },
  { id: 'editorial', name: '编辑风格', description: '适合故事叙述、年度总结' },
];

const textDensityOptions: { id: TextDensity; name: string; description: string; lines: number }[] = [
  { id: 'minimal', name: '极简', description: '每页 1-2 个要点', lines: 2 },
  { id: 'light', name: '轻量', description: '每页 2-3 个要点', lines: 3 },
  { id: 'standard', name: '标准', description: '每页 3-4 个要点', lines: 4 },
  { id: 'dense', name: '密集', description: '每页 5+ 个要点', lines: 5 },
];

const motionLevelOptions: { id: MotionLevel; name: string; description: string; icon: React.ReactNode }[] = [
  { id: 'static', name: '静态', description: '无动画，适合打印', icon: <FileText className="h-4 w-4" /> },
  { id: 'subtle', name: '微妙', description: '淡入淡出，专业感', icon: <Eye className="h-4 w-4" /> },
  { id: 'rich', name: '丰富', description: '完整动画效果', icon: <Zap className="h-4 w-4" /> },
];

export function AdvancedOptionsStep() {
  const {
    outline,
    aesthetic,
    pageCount,
    textDensity,
    motionLevel,
    setAesthetic,
    setPageCount,
    setTextDensity,
    setMotionLevel,
    setStep,
  } = useWizardStore();

  if (!outline) {
    return (
      <div className="step-content animate-fade-in">
        <p className="text-muted-foreground">请先完成大纲编辑</p>
        <Button onClick={() => setStep(2)} className="mt-4">返回大纲</Button>
      </div>
    );
  }

  const suggestedPages = outline.slides.length;

  return (
    <div className="step-content animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">配置选项</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          调整幻灯片的视觉风格和内容密度
        </p>
      </div>

      <div className="space-y-8">
        {/* 审美风格 */}
        <div>
          <label className="text-sm font-medium mb-3 block flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            审美风格
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {aestheticOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setAesthetic(option.id)}
                className={cn(
                  'glass-card p-4 cursor-pointer transition-all text-center',
                  aesthetic === option.id && 'border-primary ring-2 ring-primary/20'
                )}
              >
                <h4 className="font-medium text-sm">{option.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 页数 */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            目标页数
            <span className="text-muted-foreground font-normal ml-2">
              (大纲建议: {suggestedPages} 页)
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={30}
              value={pageCount || suggestedPages}
              onChange={(e) => setPageCount(parseInt(e.target.value))}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-lg font-semibold w-12 text-center">
              {pageCount || suggestedPages}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            AI 会根据目标页数调整每页的内容量
          </p>
        </div>

        {/* 文字密度 */}
        <div>
          <label className="text-sm font-medium mb-3 block">文字密度</label>
          <div className="grid grid-cols-4 gap-3">
            {textDensityOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setTextDensity(option.id)}
                className={cn(
                  'glass-card p-4 cursor-pointer transition-all',
                  textDensity === option.id && 'border-primary ring-2 ring-primary/20'
                )}
              >
                <h4 className="font-medium text-sm mb-2">{option.name}</h4>
                <div className="space-y-1">
                  {Array.from({ length: option.lines }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 bg-muted-foreground/20 rounded"
                      style={{ width: `${80 - i * 15}%` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 动画程度 */}
        <div>
          <label className="text-sm font-medium mb-3 block">动画程度</label>
          <div className="grid grid-cols-3 gap-3">
            {motionLevelOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setMotionLevel(option.id)}
                className={cn(
                  'glass-card p-4 cursor-pointer transition-all flex items-start gap-3',
                  motionLevel === option.id && 'border-primary ring-2 ring-primary/20'
                )}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {option.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{option.name}</h4>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(3)}>
          返回主题选择
        </Button>
        <Button onClick={() => setStep(5)} className="btn-primary-glow">
          开始生成
        </Button>
      </div>
    </div>
  );
}
