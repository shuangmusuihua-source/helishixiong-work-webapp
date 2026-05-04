'use client';

import { useState } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { ThumbnailRail } from './ThumbnailRail';
import { SlideCanvas } from './SlideCanvas';
import { Button } from '@/components/ui/button';
import { Play, Crosshair, Pencil } from 'lucide-react';
import {
  InspectorProvider,
  InspectorToggleButton,
  InspectorClickLayer,
} from '@/components/inspector/inspector-provider';
import { InspectorEditPanel } from '@/components/inspector/inspector-edit-panel';
import { EditSlideDialog } from '@/components/inspector/EditSlideDialog';

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  console.log('[PreviewLayout] Rendering with slidePages:', slidePages.length, 'currentSlideIndex:', currentSlideIndex);

  if (slidePages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        暂无幻灯片
      </div>
    );
  }

  const currentHtml = slidePages[currentSlideIndex] || '';
  console.log('[PreviewLayout] Current HTML length:', currentHtml.length, 'index:', currentSlideIndex);

  const handleSelect = (index: number) => {
    console.log('[PreviewLayout] Thumbnail clicked, setting index to:', index);
    setCurrentSlideIndex(index);
  };

  return (
    <InspectorProvider>
      <div className="flex h-full w-full">
        {/* 左侧缩略图导航 */}
        <div className="w-[200px] h-full shrink-0 hidden md:block">
          <ThumbnailRail
            pages={slidePages}
            current={currentSlideIndex}
            onSelect={handleSelect}
          />
        </div>

        {/* 右侧画布区域 */}
        <div className="flex-1 min-w-0 h-full flex flex-col">
          {/* 顶部工具栏 */}
          <div className="h-10 shrink-0 flex items-center justify-between px-4 border-b border-border bg-sidebar/30">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {currentSlideIndex + 1} / {slidePages.length}
              </span>
              {/* 编辑按钮 */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditDialogOpen(true)}
                title="编辑当前幻灯片"
              >
                <Pencil className="size-3.5" />
                <span className="hidden md:inline ml-1">编辑</span>
              </Button>
              {/* Inspector 按钮 */}
              <InspectorToggleButton />
            </div>
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
            <SlideCanvas html={currentHtml} inspectorMode />
            <InspectorClickLayer />
          </div>

          {/* Inspector 编辑面板 */}
          <InspectorEditPanel />

          {/* 编辑幻灯片对话框 */}
          <EditSlideDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            slideIndex={currentSlideIndex}
          />

          {/* 移动端底部缩略图 */}
          <div className="shrink-0 border-t border-border md:hidden">
            <ThumbnailRail
              pages={slidePages}
              current={currentSlideIndex}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </div>
    </InspectorProvider>
  );
}
