'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import type { ContentSlide } from '@/types';

const contentTypeLabels: Record<string, string> = {
  data: '数据',
  comparison: '对比',
  timeline: '时间线',
  architecture: '架构',
  quote: '引用',
  list: '列表',
  paragraph: '段落',
};

const contentTypeColors: Record<string, string> = {
  data: 'bg-primary/15 text-primary',
  comparison: 'bg-blue-500/15 text-blue-600',
  timeline: 'bg-purple-500/15 text-purple-600',
  architecture: 'bg-orange-500/15 text-orange-600',
  quote: 'bg-pink-500/15 text-pink-600',
  list: 'bg-teal-500/15 text-teal-600',
  paragraph: 'bg-gray-500/15 text-gray-600',
};

export function OutlineStep() {
  const { outline, setOutline, setStep } = useWizardStore();

  if (!outline) {
    return (
      <div className="step-content animate-fade-in">
        <p className="text-muted-foreground">请先输入内容生成大纲</p>
        <Button onClick={() => setStep(1)} className="mt-4">返回输入</Button>
      </div>
    );
  }

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...outline.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

    newSlides.forEach((slide, i) => {
      if (slide.page_type === 'content') {
        slide.page_number = i;
      }
    });

    setOutline({ ...outline, slides: newSlides });
  };

  const deleteSlide = (index: number) => {
    if (outline.slides.length <= 3) {
      alert('至少保留 3 页幻灯片');
      return;
    }
    const newSlides = outline.slides.filter((_, i) => i !== index);
    newSlides.forEach((slide, i) => {
      if (slide.page_type === 'content') {
        slide.page_number = i;
      }
    });
    setOutline({ ...outline, slides: newSlides });
  };

  const updateSlideTitle = (index: number, title: string) => {
    const newSlides = [...outline.slides];
    newSlides[index] = { ...newSlides[index], title };
    setOutline({ ...outline, slides: newSlides });
  };

  const handleRegenerate = async () => {
    setOutline(null);
    setStep(1);
  };

  return (
    <div className="step-content animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">内容大纲</h2>
          <p className="text-sm text-muted-foreground">
            共 {outline.slides.length} 页 · 点击标题可编辑
          </p>
        </div>
        <Button variant="outline" onClick={handleRegenerate} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          重新生成
        </Button>
      </div>

      <div className="space-y-2">
        {outline.slides.map((slide, index) => (
          <div
            key={index}
            className="outline-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-card-sm bg-primary/10 text-primary text-xs font-semibold">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">
                    {slide.page_type === 'cover' ? '封面' :
                     slide.page_type === 'end' ? '尾页' : '内容'}
                  </span>
                  {slide.page_type === 'content' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${contentTypeColors[(slide as ContentSlide).content_type] || ''}`}>
                      {contentTypeLabels[(slide as ContentSlide).content_type] || '内容'}
                    </span>
                  )}
                </div>

                <h3
                  className="font-medium cursor-pointer hover:text-primary transition-colors truncate"
                  onClick={() => {
                    const newTitle = prompt('编辑标题', slide.title);
                    if (newTitle) updateSlideTitle(index, newTitle);
                  }}
                >
                  {slide.title}
                </h3>

                {slide.page_type === 'content' && (slide as ContentSlide).summary && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {(slide as ContentSlide).summary}
                  </p>
                )}
              </div>

              {slide.page_type !== 'cover' && slide.page_type !== 'end' && (
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSlide(index, 'up')}
                    disabled={index === 1}
                    className="h-7 w-7"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSlide(index, 'down')}
                    disabled={index === outline.slides.length - 2}
                    className="h-7 w-7"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSlide(index)}
                    className="h-7 w-7 text-destructive/50 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(1)}>
          返回
        </Button>
        <Button onClick={() => setStep(3)} className="btn-primary-glow">
          下一步：选择主题
        </Button>
      </div>
    </div>
  );
}