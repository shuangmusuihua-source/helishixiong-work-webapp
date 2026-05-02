'use client';

import { useState, useCallback } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, FileText } from 'lucide-react';
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

  const handleContentChange = (value: string) => {
    setLocalContent(value);
    // 自动判断输入类型
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

    try {
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

      const data = await response.json();
      setOutline(data.outline);
      setStep(2);
    } catch (error) {
      console.error('Error generating outline:', error);
      alert('大纲生成失败，请重试');
    } finally {
      setIsLoading(false);
      setGeneratingOutline(false);
    }
  };

  return (
    <div className="step-content">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">创建新幻灯片</h2>
        <p className="text-muted-foreground">
          输入话题、粘贴文本或上传文件，AI 将自动生成幻灯片大纲
        </p>
      </div>

      <div className="space-y-6">
        {/* 文本输入区 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">输入内容</CardTitle>
            <CardDescription>
              支持话题、长文本或 Markdown 格式
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请输入话题或粘贴文本内容..."
              value={localContent}
              onChange={(e) => handleContentChange(e.target.value)}
              onDrop={handleFileDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`min-h-[200px] ${dragOver ? 'border-primary border-2' : ''}`}
            />

            {/* 文件上传提示 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>拖拽 .txt 或 .md 文件到此处上传</span>
            </div>
          </CardContent>
        </Card>

        {/* 联网检索选项 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">联网检索</CardTitle>
            <CardDescription>
              对于话题类输入，AI 将联网搜索补充材料
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="search-toggle">启用联网检索</Label>
                <span className="text-sm text-muted-foreground">(推荐)</span>
              </div>
              <Switch
                id="search-toggle"
                checked={searchEnabled}
                onCheckedChange={setSearchEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* 输入类型提示 */}
        {localContent && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary" />
            <span>
              检测为：<strong>{inputType === 'topic' ? '话题' : inputType === 'text' ? '文本' : '文件'}</strong>
            </span>
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex justify-end gap-4">
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
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成大纲中...
              </>
            ) : (
              '生成大纲'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}