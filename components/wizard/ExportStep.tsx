'use client';

import { useState } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { ExternalLink, RotateCcw, Download, CheckCircle2, Sparkles, Play } from 'lucide-react';
import { createHtmlBlob } from '@/lib/utils';
import { PreviewLayout } from '@/components/preview';
import { PresenterMode } from '@/components/preview/presenter/PresenterMode';

export function ExportStep() {
  const {
    generatedHtml,
    outline,
    totalPages,
    slidePages,
    setStep,
    reset,
  } = useWizardStore();

  const [showPresenter, setShowPresenter] = useState(false);

  if (!generatedHtml) {
    return (
      <div className="step-content animate-fade-in">
        <p className="text-muted-foreground">请先生成幻灯片</p>
        <Button onClick={() => setStep(4)} className="mt-4">返回生成</Button>
      </div>
    );
  }

  const handleOpenInNewTab = () => {
    const url = createHtmlBlob(generatedHtml);
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    const url = createHtmlBlob(generatedHtml);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${outline?.title || 'slides'}-slides.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewSlides = () => {
    if (confirm('确定要创建新的幻灯片吗？')) {
      reset();
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* 左侧面板 */}
      <div className="w-80 h-full overflow-hidden flex-shrink-0 p-5 bg-sidebar/40">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">生成完成</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            幻灯片已准备就绪
          </p>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-card-sm bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{outline?.title}</h3>
              <p className="text-xs text-muted-foreground">幻灯片已生成</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">页数</span>
              <p className="font-medium">{totalPages} 页</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">大小</span>
              <p className="font-medium">{(generatedHtml.length / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => setShowPresenter(true)}
            className="w-full btn-primary-glow"
            size="lg"
          >
            <Play className="mr-2 h-4 w-4 fill-current" />
            开始演示
          </Button>

          <Button onClick={handleOpenInNewTab} variant="outline" className="w-full" size="lg">
            <ExternalLink className="mr-2 h-4 w-4" />
            在新标签页预览
          </Button>

          <Button onClick={handleDownload} variant="outline" className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            下载 HTML 文件
          </Button>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => setStep(2)} size="sm">
            修改大纲
          </Button>
          <Button variant="outline" onClick={() => setStep(3)} size="sm">
            更换主题
          </Button>
          <Button variant="ghost" onClick={handleNewSlides} size="sm" className="text-muted-foreground">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            新建
          </Button>
        </div>
      </div>

      {/* 右侧预览 */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-muted/10">
        {showPresenter ? (
          <PresenterMode onExit={() => setShowPresenter(false)} />
        ) : (
          <PreviewLayout
            showPresenterButton={true}
            onPresenterEnter={() => setShowPresenter(true)}
          />
        )}
      </div>
    </div>
  );
}
