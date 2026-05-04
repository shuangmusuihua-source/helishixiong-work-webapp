'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
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
        <p className="text-muted-foreground">请先完成主题选择</p>
        <Button onClick={() => setStep(workMode === 'advanced' ? 3 : 3)} className="mt-4">返回</Button>
      </div>
    );
  }

  const progress = totalPages > 0 ? (generatedPages / totalPages) * 100 : 0;
  const isActivelyGenerating = isGenerating || (slidePages.length === 0 && !error);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
      }}
    >
      {/* 左侧面板 */}
      <div
        style={{
          width: '320px',
          height: '100%',
          overflow: 'hidden auto',
          flexShrink: 0,
          padding: '1.25rem',
          background: 'rgba(255, 255, 255, 0.4)',
          borderRight: '1px solid rgba(217, 224, 220, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>生成预览</h2>
        </div>

        {/* 进度卡片 */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(90, 103, 95, 0.08), 0 8px 24px rgba(90, 103, 95, 0.06)',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {isActivelyGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            )}
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {isActivelyGenerating ? '正在生成...' : '生成完成'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
              {currentPageTitle || '准备中...'}
            </span>
            <span style={{ fontWeight: 500 }}>{generatedPages}/{totalPages}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* AI 输出 */}
        {aiStreamingText && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(90, 103, 95, 0.06)',
              padding: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)' }}>AI 思考中</span>
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'var(--muted-foreground)',
                maxHeight: '5rem',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {aiStreamingText.slice(-150)}
            </div>
          </div>
        )}

        {/* 日志 */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: 'block' }}>
            生成日志
          </span>
          <div
            style={{
              background: 'rgba(246, 249, 247, 0.7)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              boxShadow: 'inset 0 1px 4px rgba(90, 103, 95, 0.06)',
              padding: '0.75rem',
              height: '8rem',
              overflowY: 'auto',
            }}
          >
            {displayLogs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.125rem 0',
                  color: log.includes('✅') || log.includes('🎉')
                    ? 'var(--primary)'
                    : log.includes('❌')
                    ? 'var(--destructive)'
                    : 'var(--muted-foreground)',
                }}
              >
                {log}
              </div>
            ))}
            {isActivelyGenerating && (
              <div className="animate-pulse text-primary" style={{ fontSize: '0.75rem' }}>▊</div>
            )}
          </div>
        </div>

        {/* 页面网格 */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.375rem' }}>
            {outline.slides.map((_, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: generatedPages > idx
                    ? 'rgba(129, 197, 148, 1)'
                    : generatedPages === idx && isActivelyGenerating
                    ? 'var(--primary)'
                    : 'rgba(223, 231, 226, 1)',
                  color: generatedPages > idx || (generatedPages === idx && isActivelyGenerating)
                    ? 'white'
                    : 'rgba(90, 103, 95, 1)',
                  boxShadow: generatedPages > idx
                    ? '0 2px 6px rgba(0, 171, 109, 0.2)'
                    : generatedPages === idx && isActivelyGenerating
                    ? '0 0 12px rgba(0, 171, 109, 0.4)'
                    : '0 1px 3px rgba(90, 103, 95, 0.05)',
                }}
              >
                {generatedPages > idx ? '✓' : idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 按钮 */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep(workMode === 'advanced' ? 4 : 3)}
            style={{ flex: 1 }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          {!isActivelyGenerating && slidePages.length > 0 && (
            <Button
              size="sm"
              onClick={() => setStep(workMode === 'advanced' ? 6 : 5)}
              style={{ flex: 1 }}
            >
              下一步
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* 右侧预览 */}
      <div
        style={{
          flex: 1,
          height: '100%',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(239, 243, 241, 0.5)',
        }}
      >
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
