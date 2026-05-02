'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import type { ContentSlide } from '@/types';

const contentTypeLabels: Record<string, string> = {
  data: '数据型',
  comparison: '对比型',
  timeline: '时间线',
  architecture: '架构型',
  quote: '引用型',
  list: '列表型',
  paragraph: '段落型',
};

export function OutlineStep() {
  const { outline, setOutline, setStep } = useWizardStore();

  if (!outline) {
    return (
      <div className="step-content">
        <p className="text-muted-foreground">请先输入内容生成大纲</p>
        <Button onClick={() => setStep(1)} className="mt-4">
          返回输入
        </Button>
      </div>
    );
  }

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...outline.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

    // 更新页码
    newSlides.forEach((slide, i) => {
      if (slide.page_type === 'content') {
        slide.page_number = i;
      }
    });

    setOutline({ ...outline, slides: newSlides });
  };

  const deleteSlide = (index: number) => {
    const newSlides = outline.slides.filter((_, i) => i !== index);

    // 更新页码
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
    <div className="step-content">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">幻灯片大纲</h2>
          <p className="text-muted-foreground">
            共 {outline.slides.length} 页，可拖拽排序或编辑
          </p>
        </div>
        <Button variant="outline" onClick={handleRegenerate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          AI 重新生成
        </Button>
      </div>

      <div className="space-y-3">
        {outline.slides.map((slide, index) => (
          <Card
            key={index}
            className="transition-all"
          >
            <CardHeader className="py-3">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">
                      {slide.page_type === 'cover' ? '封面' :
                       slide.page_type === 'end' ? '尾页' : `第${index}页`}
                    </Badge>
                    {slide.page_type === 'content' && (
                      <Badge variant="secondary">
                        {contentTypeLabels[(slide as ContentSlide).content_type] || '内容'}
                      </Badge>
                    )}
                  </div>

                  <CardTitle
                    className="text-lg cursor-pointer hover:text-primary"
                    onClick={() => {
                      const newTitle = prompt('编辑标题', slide.title);
                      if (newTitle) updateSlideTitle(index, newTitle);
                    }}
                  >
                    {slide.title}
                  </CardTitle>

                  {slide.page_type === 'content' && (slide as ContentSlide).summary && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {(slide as ContentSlide).summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {slide.page_type !== 'cover' && slide.page_type !== 'end' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 1}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === outline.slides.length - 2}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSlide(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          返回上一步
        </Button>
        <Button onClick={() => setStep(3)}>
          下一步：选择主题
        </Button>
      </div>
    </div>
  );
}