'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, RotateCcw, FileDown } from 'lucide-react';
import { SlidePreview } from '@/components/preview/SlidePreview';

export function ExportStep() {
  const {
    generatedHtml,
    outline,
    totalPages,
    setStep,
    reset,
  } = useWizardStore();

  if (!generatedHtml) {
    return (
      <div className="step-content">
        <p className="text-muted-foreground">请先生成幻灯片</p>
        <Button onClick={() => setStep(4)} className="mt-4">
          返回生成
        </Button>
      </div>
    );
  }

  const handleDownload = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${outline?.title || 'slides'}-slides.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewSlides = () => {
    if (confirm('确定要创建新的幻灯片吗？当前内容将被清除。')) {
      reset();
    }
  };

  return (
    <div className="flex h-full">
      {/* 左侧：导出选项 */}
      <div className="w-80 border-r p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">交付导出</h2>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5 text-green-500" />
              生成完成
            </CardTitle>
            <CardDescription>
              幻灯片已准备就绪，可以下载
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">文件名</span>
              <span className="font-medium">{outline?.title}-slides.html</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">页数</span>
              <span className="font-medium">{totalPages} 页</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">文件大小</span>
              <span className="font-medium">约 {(generatedHtml.length / 1024).toFixed(0)} KB</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button onClick={handleDownload} className="w-full" size="lg">
            <Download className="mr-2 h-5 w-5" />
            下载 HTML 文件
          </Button>

          <Button
            variant="outline"
            onClick={() => setStep(2)}
            className="w-full"
          >
            返回修改大纲
          </Button>

          <Button
            variant="outline"
            onClick={() => setStep(3)}
            className="w-full"
          >
            更换主题
          </Button>

          <Button
            variant="ghost"
            onClick={handleNewSlides}
            className="w-full text-muted-foreground"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            创建新幻灯片
          </Button>
        </div>
      </div>

      {/* 右侧：最终预览 */}
      <div className="flex-1">
        <SlidePreview html={generatedHtml} totalPages={totalPages} />
      </div>
    </div>
  );
}