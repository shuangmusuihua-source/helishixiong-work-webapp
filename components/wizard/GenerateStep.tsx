'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { SSE_EVENT_TYPES } from '@/lib/utils';
import { PreviewLayout } from '@/components/preview';
import { PresenterMode } from '@/components/preview/presenter/PresenterMode';

export function GenerateStep() {
  const {
    outline,
    selectedTheme,
    generatedHtml,
    generatedPages,
    totalPages,
    isGenerating,
    slidePages,
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
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showPresenter, setShowPresenter] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateIframeContent = useCallback((html: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, []);

  const startGeneration = useCallback(async () => {
    if (!outline || isGenerating) return;

    setGenerating(true);
    setError(null);
    updateProgress(0, outline.slides.length);
    setGenerationLogs(['🚀 开始生成...']);
    setAiStreamingText('');
    setPreviewHtml('');
    setSlidePages([]); // 重置页面数组

    try {
      setGenerationLogs(prev => [...prev, '📡 连接 AI...']);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline, theme_id: selectedTheme }),
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
                appendSlidePage(data.html); // 存储单独页面
                setPreviewHtml(data.html);
                setGenerationLogs(prev => [...prev, '   ✅ HTML 生成']);
              }
              break;

            case SSE_EVENT_TYPES.COMPLETE:
              if (data.file_id && data.html) {
                setFileId(data.file_id);
                setGeneratedHtml(data.html);
                setPreviewHtml(data.html);
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
    }
  }, [outline, selectedTheme, isGenerating, appendSlidePage, setGeneratedHtml, setFileId, setGenerating, setSlidePages, updateProgress]);

  useEffect(() => {
    if (outline && !generatedHtml && !isGenerating && previewHtml === '') {
      startGeneration();
    }
  }, [outline, generatedHtml, isGenerating, previewHtml, startGeneration]);

  // 限制日志数量防止内存溢出
  const displayLogs = useMemo(() => generationLogs.slice(-50), [generationLogs]);

  if (!outline) {
    return (
      <div className="step-content">
        <p className="text-muted-foreground">请先完成主题选择</p>
        <Button onClick={() => setStep(3)} className="mt-4">返回</Button>
      </div>
    );
  }

  const progress = totalPages > 0 ? (generatedPages / totalPages) * 100 : 0;
  const isActivelyGenerating = isGenerating || (slidePages.length === 0 && !error);

  return (
    <div className="flex h-full w-full">
      {/* 左侧面板 */}
      <div className="w-80 h-full overflow-hidden flex-shrink-0 p-5 bg-sidebar/40">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">生成预览</h2>
        </div>

        {/* 进度卡片 */}
        <div className="glass-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            {isActivelyGenerating ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <CheckCircle2 className="h-4 w-4 text-primary" />}
            <span className="text-sm font-medium">{isActivelyGenerating ? '正在生成...' : '生成完成'}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span className="truncate mr-2">{currentPageTitle || '准备中...'}</span>
            <span className="font-medium">{generatedPages}/{totalPages}</span>
          </div>
          <Progress value={progress} className="h-1.5 progress-glow" />
        </div>

        {/* AI 输出 */}
        {aiStreamingText && (
          <div className="glass-card glass-card-sm p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-xs font-medium text-primary">AI 思考中</span>
            </div>
            <div className="font-mono text-xs text-muted-foreground max-h-20 overflow-y-auto whitespace-pre-wrap break-all">
              {aiStreamingText.slice(-150)}
            </div>
          </div>
        )}

        {/* 日志 */}
        <div className="mb-4">
          <span className="text-xs text-muted-foreground mb-2 block">生成日志</span>
          <div className="log-area p-3 h-32 overflow-y-auto">
            {displayLogs.map((log, idx) => (
              <div key={idx} className={`text-xs py-0.5 ${log.includes('✅') || log.includes('🎉') ? 'text-primary' : log.includes('❌') ? 'text-destructive' : 'text-muted-foreground'}`}>
                {log}
              </div>
            ))}
            {isActivelyGenerating && <div className="animate-pulse text-primary text-xs">▊</div>}
          </div>
        </div>

        {/* 页面网格 */}
        <div className="mb-4">
          <div className="grid grid-cols-6 gap-1.5">
            {outline.slides.map((_, idx) => (
              <div key={idx} className={`page-grid-item ${generatedPages > idx ? 'completed' : generatedPages === idx && isActivelyGenerating ? 'active' : ''}`}>
                {generatedPages > idx ? '✓' : idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setStep(3)} className="flex-1">返回</Button>
          {!isActivelyGenerating && slidePages.length > 0 && <Button size="sm" onClick={() => setStep(5)} className="flex-1 btn-primary-glow">下一步</Button>}
        </div>
      </div>

      {/* 右侧预览 */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-muted/10">
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
