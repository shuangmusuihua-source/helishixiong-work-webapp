'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { SSE_EVENT_TYPES } from '@/lib/utils';
import { PreviewLayout } from '@/components/preview';
import { PresenterMode } from '@/components/preview/presenter/PresenterMode';
import { cn } from '@/lib/utils';

export function GenerateStep() {
  const {
    outline,
    selectedTheme,
    generatedHtml,
    generatedPages,
    totalPages,
    isGenerating,
    slidePages,
    workMode,
    advancedTheme,
    aesthetic,
    pageCount,
    textDensity,
    motionLevel,
    setGenerating,
    updateProgress,
    setGeneratedHtml,
    setFileId,
    setStep,
    appendSlidePage,
    setSlidePages,
  } = useWizardStore();

  const [error, setError] = useState<string | null>(null);
  const [currentPageTitle, setCurrentPageTitle] = useState<string>('');
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [aiStreamingText, setAiStreamingText] = useState<string>('');
  const [showPresenter, setShowPresenter] = useState(false);
  const hasStartedRef = useRef(false);

  const startGeneration = useCallback(async () => {
    if (!outline || isGenerating || hasStartedRef.current) return;

    hasStartedRef.current = true;
    setGenerating(true);
    setError(null);
    updateProgress(0, outline.slides.length);
    setGenerationLogs(['🚀 开始生成...']);
    setAiStreamingText('');
    setSlidePages([]);

    try {
      setGenerationLogs(prev => [...prev, '📡 连接 AI...']);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outline,
          theme_id: workMode === 'advanced' ? advancedTheme : selectedTheme,
          work_mode: workMode,
          aesthetic,
          page_count: pageCount,
          text_density: textDensity,
          motion_level: motionLevel,
        }),
      });

      if (!response.ok) throw new Error('生成请求失败');

      setGenerationLogs(prev => [...prev, '✅ 连接成功']);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const data = JSON.parse(line.slice(6));

          switch (data.type) {
            case undefined:
              if (data.page_num && data.total) {
                updateProgress(data.page_num, data.total);
                if (data.title) {
                  setCurrentPageTitle(data.title);
                  setGenerationLogs(prev => [...prev, `📄 [${data.page_num}/${data.total}] ${data.title}`]);
                  setAiStreamingText('');
                }
              }
              break;

            case SSE_EVENT_TYPES.AI_TEXT:
              if (data.text) setAiStreamingText(prev => prev + data.text);
              break;

            case SSE_EVENT_TYPES.AI_COMPLETE:
              setGenerationLogs(prev => [...prev, '   ✅ AI 完成']);
              break;

            case SSE_EVENT_TYPES.PAGE_COMPLETE:
              if (data.html) {
                appendSlidePage(data.html);
                setGenerationLogs(prev => [...prev, '   ✅ HTML 生成']);
              }
              break;

            case SSE_EVENT_TYPES.COMPLETE:
              if (data.file_id && data.html) {
                setFileId(data.file_id);
                setGeneratedHtml(data.html);
                if (data.pages && Array.isArray(data.pages)) {
                  setSlidePages(data.pages);
                }
                setGenerationLogs(prev => [...prev, '🎉 全部完成！']);
                setGenerating(false);
              }
              break;

            case SSE_EVENT_TYPES.ERROR:
              setGenerationLogs(prev => [...prev, `❌ ${data.error}`]);
              break;
          }
        }
      }
    } catch (err) {
      setError('生成失败，请重试');
      setGenerationLogs(prev => [...prev, '❌ 生成失败']);
      setGenerating(false);
      hasStartedRef.current = false;
    }
  }, [outline, selectedTheme, workMode, advancedTheme, aesthetic, pageCount, textDensity, motionLevel, isGenerating, appendSlidePage, setGeneratedHtml, setFileId, setGenerating, setSlidePages, updateProgress]);

  useEffect(() => {
    if (outline && !hasStartedRef.current && !generatedHtml && !isGenerating) {
      startGeneration();
    }
  }, [outline]);

  const displayLogs = useMemo(() => generationLogs.slice(-50), [generationLogs]);

  if (!outline) {
    return (
      <div className="step-content">
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-6">请先完成主题选择</p>
          <Button onClick={() => setStep(workMode === 'advanced' ? 3 : 3)} className="rounded-xl font-semibold">
            返回
          </Button>
        </div>
      </div>
    );
  }

  const progress = totalPages > 0 ? (generatedPages / totalPages) * 100 : 0;
  const isActivelyGenerating = isGenerating || (slidePages.length === 0 && !error);

  return (
    <div className="generate-step-container">
      {/* 左侧面板 */}
      <div className="generate-left-panel flex flex-col">
        {/* 标题 */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-primary/20 border-2 border-primary/30 shadow-lg shadow-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">生成预览</h2>
            <p className="text-sm text-muted-foreground">实时查看生成进度</p>
          </div>
        </div>

        {/* 进度卡片 */}
        <div className="p-6 rounded-2xl bg-white border-2 border-primary/20 shadow-xl shadow-primary/5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {isActivelyGenerating ? (
              <div className="relative">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-chart-2 flex items-center justify-center shadow-lg shadow-chart-2/30">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-base font-bold">
              {isActivelyGenerating ? '正在生成...' : '生成完成'}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="truncate mr-2 font-semibold text-foreground">{currentPageTitle || '准备中...'}</span>
            <span className="font-bold text-primary">{generatedPages}/{totalPages}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* AI 输出 */}
        {aiStreamingText && (
          <div className="p-5 rounded-2xl bg-white border border-primary/20 shadow-lg mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-bold text-primary">AI 思考中</span>
            </div>
            <div className="font-mono text-xs text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-wrap break-all bg-muted/50 p-3 rounded-lg">
              {aiStreamingText.slice(-300)}
            </div>
          </div>
        )}

        {/* 日志 */}
        <div className="mb-6">
          <span className="text-sm font-bold text-foreground mb-3 block">生成日志</span>
          <div className="p-4 h-40 overflow-y-auto rounded-2xl bg-white border border-border shadow-sm">
            {displayLogs.map((log, idx) => (
              <div
                key={idx}
                className={cn(
                  'text-sm py-1 font-mono',
                  log.includes('✅') || log.includes('🎉') ? 'text-chart-2 font-semibold' :
                  log.includes('❌') ? 'text-destructive font-semibold' : 'text-muted-foreground'
                )}
              >
                {log}
              </div>
            ))}
            {isActivelyGenerating && (
              <div className="animate-pulse text-primary text-sm mt-1 font-bold">▊</div>
            )}
          </div>
        </div>

        {/* 页面网格 */}
        <div className="mb-8">
          <span className="text-sm font-bold text-foreground mb-3 block">页面进度</span>
          <div className="grid grid-cols-5 gap-3">
            {outline.slides.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'page-grid-item',
                  generatedPages > idx && 'completed',
                  generatedPages === idx && isActivelyGenerating && 'active'
                )}
              >
                {generatedPages > idx ? '✓' : idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-4 mt-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep(workMode === 'advanced' ? 4 : 3)}
            className="flex-1 h-12 rounded-xl font-semibold border-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回
          </Button>
          {!isActivelyGenerating && slidePages.length > 0 && (
            <Button
              size="lg"
              onClick={() => setStep(workMode === 'advanced' ? 6 : 5)}
              className="flex-1 h-12 rounded-xl font-bold shadow-xl shadow-primary/30"
            >
              下一步
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* 右侧预览 */}
      <div className="generate-right-panel">
        {showPresenter ? (
          <PresenterMode onExit={() => setShowPresenter(false)} />
        ) : (
          <PreviewLayout
            showPresenterButton={!isActivelyGenerating}
            onPresenterEnter={() => setShowPresenter(true)}
          />
        )}
      </div>
    </div>
  );
}
