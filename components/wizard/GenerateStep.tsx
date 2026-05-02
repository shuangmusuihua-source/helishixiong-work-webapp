'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { SlidePreview } from '@/components/preview/SlidePreview';

export function GenerateStep() {
  const {
    outline,
    selectedTheme,
    generatedHtml,
    generatedPages,
    totalPages,
    isGenerating,
    setGenerating,
    updateProgress,
    appendHtml,
    setFileId,
    setStep,
  } = useWizardStore();

  const [error, setError] = useState<string | null>(null);

  const startGeneration = useCallback(async () => {
    if (!outline || isGenerating) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outline,
          theme_id: selectedTheme,
        }),
      });

      if (!response.ok) {
        throw new Error('生成请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 解析 SSE 事件
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7);
            continue;
          }

          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.page_num && data.total) {
              updateProgress(data.page_num, data.total);
            }

            if (data.html && !data.file_id) {
              appendHtml(data.html);
            }

            if (data.file_id) {
              setFileId(data.file_id);
              appendHtml(data.html);
              setGenerating(false);
            }
          }
        }
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('生成失败，请重试');
      setGenerating(false);
    }
  }, [outline, selectedTheme, isGenerating]);

  useEffect(() => {
    if (outline && !generatedHtml && !isGenerating) {
      startGeneration();
    }
  }, [outline, generatedHtml, isGenerating]);

  if (!outline) {
    return (
      <div className="step-content">
        <p className="text-muted-foreground">请先完成主题选择</p>
        <Button onClick={() => setStep(3)} className="mt-4">
          返回选择主题
        </Button>
      </div>
    );
  }

  const progress = totalPages > 0 ? (generatedPages / totalPages) * 100 : 0;

  return (
    <div className="flex h-full">
      {/* 左侧：进度和状态 */}
      <div className="w-80 border-r p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">生成预览</h2>

        {isGenerating ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                正在生成...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">
                第 {generatedPages} / {totalPages} 页
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">生成失败</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={startGeneration} className="mt-4">
                重试
              </Button>
            </CardContent>
          </Card>
        ) : generatedHtml ? (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                生成完成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                共 {totalPages} 页幻灯片已生成
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-auto flex gap-2">
          <Button variant="outline" onClick={() => setStep(3)}>
            返回
          </Button>
          {generatedHtml && (
            <Button onClick={() => setStep(5)}>
              下一步：导出
            </Button>
          )}
        </div>
      </div>

      {/* 右侧：预览 */}
      <div className="flex-1">
        {generatedHtml ? (
          <SlidePreview
            html={generatedHtml}
            currentPage={generatedPages}
            totalPages={totalPages}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            {isGenerating ? '正在生成预览...' : '等待生成'}
          </div>
        )}
      </div>
    </div>
  );
}