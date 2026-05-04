'use client';

import { useState, useCallback } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Sparkles, FileText, Zap } from 'lucide-react';
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

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setLocalContent(content);
        setInput('file', content);
      };
      reader.readAsText(file);
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">创建幻灯片</h2>
        <p className="text-sm text-muted-foreground">
          输入话题或内容，AI 将自动生成专业幻灯片
        </p>
      </div>

      <div className="space-y-4">
        {/* 输入区 */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">输入内容</span>
          </div>

          <Textarea
            placeholder="请输入话题，例如：人工智能的发展历程与未来趋势"
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            onDrop={handleFileDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`min-h-[160px] resize-none input-glow ${dragOver ? 'border-primary border-2' : ''}`}
            disabled={isLoading}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-3.5 w-3.5" />
              <span>支持拖拽 .txt / .md 文件</span>
            </div>

            {localContent && !isLoading && (
              <span className="text-xs text-muted-foreground">
                {inputType === 'topic' ? '话题' : inputType === 'text' ? '文本' : '文件'}
              </span>
            )}
          </div>
        </div>

        {/* 联网检索 */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-card-sm bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label htmlFor="search-toggle" className="text-sm font-medium">联网检索</Label>
                <p className="text-xs text-muted-foreground">为话题补充相关资料</p>
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
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">{generationStatus}</span>
            </div>
            <Progress value={66} className="h-1 progress-glow" />
            <div className="mt-3 space-y-0.5 font-mono text-xs text-muted-foreground">
              {generationLogs.map((log, idx) => (
                <div key={idx} className={log.includes('✅') ? 'text-primary' : ''}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setLocalContent('');
              setInput('topic', '');
            }}
            disabled={!localContent || isLoading}
          >
            清空
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!localContent || isLoading}
            size="lg"
            className="btn-primary-glow"
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