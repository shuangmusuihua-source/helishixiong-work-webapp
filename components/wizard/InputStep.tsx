'use client';

import { useState, useCallback } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Sparkles, FileText, Zap, ArrowRight, Globe } from 'lucide-react';
import type { InputType } from '@/types';

export function InputStep() {
  const {
    inputType,
    inputContent,
    searchEnabled,
    setInput,
    setSearchEnabled,
    setStep,
    setOutline,
    setGeneratingOutline,
  } = useWizardStore();

  const [localContent, setLocalContent] = useState(inputContent);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string>('');

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleContentChange = (value: string) => {
    setLocalContent(value);
    if (value.length < 50 && !value.includes('\n')) {
      setInput('topic', value);
    } else {
      setInput('text', value);
    }
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFileError('');

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`文件大小超出限制（最大 5MB），当前文件 ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setLocalContent(content);
        setInput('file', content);
      };
      reader.readAsText(file);
    } else if (file) {
      setFileError('仅支持 .txt 和 .md 格式的文件');
    }
  }, [setInput]);

  const handleSubmit = async () => {
    if (!localContent.trim()) return;

    setIsLoading(true);
    setGeneratingOutline(true);
    setGenerationLogs([]);
    setGenerationStatus('连接 AI 服务...');

    try {
      setGenerationLogs(prev => [...prev, '📡 发送请求...']);

      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_type: inputType,
          content: localContent,
          search_enabled: searchEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate outline');
      }

      setGenerationLogs(prev => [...prev, '🤖 AI 分析中...']);
      setGenerationStatus('生成大纲...');

      const data = await response.json();

      setGenerationLogs(prev => [...prev, '✅ 大纲完成']);
      setGenerationStatus(`生成 ${data.outline.slides.length} 页幻灯片`);

      setOutline(data.outline);

      setTimeout(() => {
        setStep(2);
      }, 500);

    } catch (error) {
      console.error('Error generating outline:', error);
      setGenerationLogs(prev => [...prev, '❌ 生成失败']);
      setGenerationStatus('请重试');
    } finally {
      setIsLoading(false);
      setGeneratingOutline(false);
    }
  };

  return (
    <div className="step-content animate-fade-in">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button mb-6">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">内容输入</span>
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight">创建幻灯片</h2>
        <p className="text-muted-foreground">
          输入话题或内容，AI 将自动生成专业幻灯片
        </p>
      </div>

      <div className="space-y-5 max-w-2xl">
        {/* 输入区 */}
        <div className="p-6 rounded-2xl glass">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">输入内容</span>
          </div>

          <Textarea
            placeholder="请输入话题，例如：人工智能的发展历程与未来趋势"
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            onDrop={handleFileDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`min-h-[180px] resize-none bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 rounded-xl transition-all ${dragOver ? 'border-primary border-2 bg-primary/5' : ''}`}
            disabled={isLoading}
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-3.5 w-3.5" />
              <span>支持拖拽 .txt / .md 文件（最大 5MB）</span>
            </div>

            {localContent && !isLoading && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {inputType === 'topic' ? '话题' : inputType === 'text' ? '文本' : '文件'}
              </span>
            )}
          </div>

          {fileError && (
            <p className="text-destructive text-sm mt-3 px-1">{fileError}</p>
          )}
        </div>

        {/* 联网检索 */}
        <div className="p-5 rounded-2xl glass">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-chart-2/10 border border-chart-2/20">
                <Globe className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <Label htmlFor="search-toggle" className="text-sm font-semibold">联网检索</Label>
                <p className="text-xs text-muted-foreground mt-0.5">为话题补充相关资料</p>
              </div>
            </div>
            <Switch
              id="search-toggle"
              checked={searchEnabled}
              onCheckedChange={setSearchEnabled}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* 生成进度 */}
        {isLoading && (
          <div className="p-6 rounded-2xl glass border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
              <span className="text-sm font-semibold">{generationStatus}</span>
            </div>
            <Progress value={66} className="h-1.5" />
            <div className="mt-4 space-y-1 font-mono text-xs text-muted-foreground">
              {generationLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`transition-colors ${log.includes('✅') ? 'text-chart-2' : log.includes('❌') ? 'text-destructive' : ''}`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setLocalContent('');
              setInput('topic', '');
            }}
            disabled={!localContent || isLoading}
            className="h-11 px-6 rounded-xl font-medium"
          >
            清空
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!localContent || isLoading}
            size="lg"
            className="h-11 px-8 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成大纲
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
