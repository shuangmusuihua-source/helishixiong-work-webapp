'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { ThumbnailRail } from './ThumbnailRail';
import { SlideCanvas } from './SlideCanvas';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface PreviewLayoutProps {
  showPresenterButton?: boolean;
  onPresenterEnter?: () => void;
}

export function PreviewLayout({
  showPresenterButton = true,
  onPresenterEnter,
}: PreviewLayoutProps) {
  const {
    slidePages,
    currentSlideIndex,
    setCurrentSlideIndex,
    workMode,
  } = useWizardStore();

  if (slidePages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        暂无幻灯片
      </div>
    );
  }

  const currentHtml = slidePages[currentSlideIndex] || '';

  return (
    <div className="flex h-full w-full">
      {/* 左侧缩略图导航 */}
      <div className="w-[200px] h-full shrink-0 hidden md:block">
        <ThumbnailRail
          pages={slidePages}
          current={currentSlideIndex}
          onSelect={setCurrentSlideIndex}
        />
      </div>

      {/* 右侧画布区域 */}
      <div className="flex-1 min-w-0 h-full flex flex-col">
        {/* 顶部工具栏 */}
        <div className="h-10 shrink-0 flex items-center justify-between px-4 border-b border-border bg-sidebar/30">
          <span className="text-xs text-muted-foreground">
            {currentSlideIndex + 1} / {slidePages.length}
          </span>
          {showPresenterButton && (
            <Button
              size="sm"
              onClick={onPresenterEnter}
              className="px-2.5 btn-primary-glow"
            >
              <Play className="size-3.5 fill-current" />
              <span className="hidden sm:inline ml-1">演示</span>
              <kbd className="ml-1 hidden sm:inline rounded-[3px] bg-white/20 px-1 font-mono text-[9.5px]">
                F
              </kbd>
            </Button>
          )}
        </div>

        {/* 画布 */}
        <div className="flex-1 bg-muted/10 p-4">
          <SlideCanvas html={currentHtml} />
        </div>

        {/* 移动端底部缩略图 */}
        <div className="shrink-0 border-t border-border md:hidden">
          <ThumbnailRail
            pages={slidePages}
            current={currentSlideIndex}
            onSelect={setCurrentSlideIndex}
          />
        </div>
      </div>
    </div>
  );
}
