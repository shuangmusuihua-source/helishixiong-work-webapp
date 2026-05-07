'use client';

import { useState, useCallback } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  RefreshCw,
  Pencil,
  ArrowRight,
  Layers,
  GripVertical,
  FileText,
  Upload,
  X,
  Loader2,
  Plus,
  Sparkles,
} from 'lucide-react';
import type { ContentSlide } from '@/types';
import { cn } from '@/lib/utils';

const contentTypeLabels: Record<string, string> = {
  data: '数据',
  comparison: '对比',
  timeline: '时间线',
  architecture: '架构',
  quote: '引用',
  list: '列表',
  paragraph: '段落',
};

const contentTypeColors: Record<string, string> = {
  data: 'bg-primary/15 text-primary border-primary/20',
  comparison: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  timeline: 'bg-violet-500/15 text-violet-500 border-violet-500/20',
  architecture: 'bg-orange-500/15 text-orange-500 border-orange-500/20',
  quote: 'bg-pink-500/15 text-pink-500 border-pink-500/20',
  list: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
  paragraph: 'bg-muted text-muted-foreground border-border',
};

export function OutlineStep() {
  const { outline, setOutline, setStep, inputContent } = useWizardStore();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingSummary, setEditingSummary] = useState('');
  const [editingContentType, setEditingContentType] = useState<string>('');
  const [editingContext, setEditingContext] = useState('');
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!outline) {
    return (
      <div className="step-content animate-fade-in">
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-6">请先输入内容生成大纲</p>
          <Button onClick={() => setStep(1)} className="rounded-xl font-semibold">
            返回输入
          </Button>
        </div>
      </div>
    );
  }

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...outline.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

    newSlides.forEach((slide, i) => {
      if (slide.page_type === 'content') {
        slide.page_number = i;
      }
    });

    setOutline({ ...outline, slides: newSlides });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newSlides = [...outline.slides];
    const [draggedSlide] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(targetIndex, 0, draggedSlide);

    newSlides.forEach((slide, i) => {
      if (slide.page_type === 'content') {
        slide.page_number = i;
      }
    });

    setOutline({ ...outline, slides: newSlides });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDeleteClick = (index: number) => {
    if (outline.slides.length <= 3) {
      setDeleteDialogOpen(true);
      return;
    }
    deleteSlide(index);
  };

  const deleteSlide = (index: number) => {
    const newSlides = outline.slides.filter((_, i) => i !== index);
    newSlides.forEach((slide, i) => {
      if (slide.page_type === 'content') {
        slide.page_number = i;
      }
    });
    setOutline({ ...outline, slides: newSlides });
  };

  const handleEditClick = (index: number) => {
    const slide = outline.slides[index];
    setEditingIndex(index);
    setEditingTitle(slide.title || '');
    if (slide.page_type === 'content') {
      const contentSlide = slide as ContentSlide;
      setEditingSummary(contentSlide.summary || '');
      setEditingContentType(contentSlide.content_type || 'paragraph');
      setEditingContext(contentSlide.context || '');
    } else {
      setEditingSummary('');
      setEditingContentType('');
      setEditingContext('');
    }
    setEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingTitle.trim()) {
      const newSlides = [...outline.slides];
      const slide = newSlides[editingIndex];
      newSlides[editingIndex] = {
        ...slide,
        title: editingTitle.trim(),
      };
      if (slide.page_type === 'content') {
        (newSlides[editingIndex] as ContentSlide).summary = editingSummary.trim();
        (newSlides[editingIndex] as ContentSlide).content_type = editingContentType as ContentSlide['content_type'];
        (newSlides[editingIndex] as ContentSlide).context = editingContext.trim();
      }
      setOutline({ ...outline, slides: newSlides });
    }
    setEditDialogOpen(false);
    setEditingIndex(null);
    setEditingTitle('');
    setEditingSummary('');
    setEditingContentType('');
    setEditingContext('');
  };

  const handleRegenerateSlide = async (index: number) => {
    setRegeneratingIndex(index);

    try {
      const slide = outline.slides[index];
      const context = (slide as ContentSlide).context || '';

      const response = await fetch('/api/regenerate-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideIndex: index,
          currentTitle: slide.title,
          currentSummary: (slide as ContentSlide).summary,
          context: context,
          outline: outline,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newSlides = [...outline.slides];
        newSlides[index] = {
          ...newSlides[index],
          title: data.title,
          summary: data.summary,
        };
        setOutline({ ...outline, slides: newSlides });
      }
    } catch (error) {
      console.error('Regenerate error:', error);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const addSlide = (afterIndex: number) => {
    const newSlide: ContentSlide = {
      page_type: 'content',
      page_number: afterIndex + 1,
      title: '新幻灯片',
      summary: '',
      content_type: 'paragraph',
    };

    const newSlides = [...outline.slides];
    newSlides.splice(afterIndex + 1, 0, newSlide);

    newSlides.forEach((slide, i) => {
      if (slide.page_type === 'content') {
        slide.page_number = i;
      }
    });

    setOutline({ ...outline, slides: newSlides });

    // Open edit dialog for the new slide
    setTimeout(() => {
      handleEditClick(afterIndex + 1);
    }, 100);
  };

  const handleFullRegenerate = async () => {
    setRegenerateDialogOpen(false);
    setOutline(null);
    setStep(1);
  };

  return (
    <div className="step-content animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">内容规划</span>
            </div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">内容大纲</h2>
            <p className="text-muted-foreground">
              共 {outline.slides.length} 页 · 拖拽调整顺序 · 点击编辑内容
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setRegenerateDialogOpen(true)}
            size="sm"
            className="h-10 px-5 rounded-xl font-medium border-primary/30 text-primary hover:bg-primary/5"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            重新生成全部
          </Button>
        </div>

        {/* Outline Cards */}
        <div className="space-y-3">
          {outline.slides.map((slide, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              onDrop={() => handleDrop(index)}
              className={cn(
                "group relative bg-card/80 backdrop-blur-sm rounded-2xl border transition-all duration-200",
                dragOverIndex === index && draggedIndex !== index
                  ? "border-primary border-2 scale-[1.02]"
                  : "border-border/50 hover:border-primary/30",
                draggedIndex === index && "opacity-50 scale-95"
              )}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Drag Handle & Number */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground/40 cursor-grab active:cursor-grabbing" />
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-bold border border-primary/10">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-lg bg-muted/50">
                        {slide.page_type === 'cover' ? '封面' :
                         slide.page_type === 'end' ? '尾页' : '内容页'}
                      </span>
                      {slide.page_type === 'content' && (
                        <Badge
                          variant="outline"
                          className={cn("text-xs border font-medium", contentTypeColors[(slide as ContentSlide).content_type] || '')}
                        >
                          {contentTypeLabels[(slide as ContentSlide).content_type] || '内容'}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {slide.title}
                    </h3>

                    {slide.page_type === 'content' && (slide as ContentSlide).summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {(slide as ContentSlide).summary}
                      </p>
                    )}

                    {/* Context indicator */}
                    {slide.page_type === 'content' && (slide as ContentSlide).context && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>已补充上下文</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {slide.page_type !== 'cover' && slide.page_type !== 'end' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSlide(index, 'up')}
                          disabled={index === 1}
                          className="h-9 w-9 rounded-xl"
                          title="上移"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSlide(index, 'down')}
                          disabled={index === outline.slides.length - 2}
                          className="h-9 w-9 rounded-xl"
                          title="下移"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRegenerateSlide(index)}
                          disabled={regeneratingIndex === index}
                          className="h-9 w-9 rounded-xl text-primary hover:bg-primary/10"
                          title="重新生成此页"
                        >
                          {regeneratingIndex === index ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(index)}
                          className="h-9 w-9 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(index)}
                      className="h-9 w-9 rounded-xl"
                      title="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add slide button between cards */}
              {index < outline.slides.length - 1 && slide.page_type !== 'end' && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSlide(index)}
                    className="h-7 px-3 rounded-full bg-card border-border/50 text-xs font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加页面
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <Button
            variant="outline"
            onClick={() => setStep(1)}
            className="h-11 px-6 rounded-xl font-medium"
          >
            返回
          </Button>
          <Button
            onClick={() => setStep(3)}
            className="h-11 px-8 rounded-xl font-semibold bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            下一步：选择主题
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl">编辑幻灯片</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                placeholder="请输入标题"
                className="h-11 rounded-xl"
              />
            </div>

            {editingIndex !== null && outline.slides[editingIndex]?.page_type === 'content' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="summary">内容摘要</Label>
                  <Textarea
                    id="summary"
                    value={editingSummary}
                    onChange={(e) => setEditingSummary(e.target.value)}
                    placeholder="描述这一页的主要内容..."
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">内容类型</Label>
                  <Select value={editingContentType} onValueChange={(value) => setEditingContentType(value || '')}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="选择内容类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraph">段落</SelectItem>
                      <SelectItem value="list">列表</SelectItem>
                      <SelectItem value="data">数据</SelectItem>
                      <SelectItem value="comparison">对比</SelectItem>
                      <SelectItem value="timeline">时间线</SelectItem>
                      <SelectItem value="architecture">架构</SelectItem>
                      <SelectItem value="quote">引用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="context">补充上下文</Label>
                    <span className="text-xs text-muted-foreground">可选</span>
                  </div>
                  <Textarea
                    id="context"
                    value={editingContext}
                    onChange={(e) => setEditingContext(e.target.value)}
                    placeholder="上传或输入补充材料，帮助 AI 更好地生成内容..."
                    rows={4}
                    className="rounded-xl resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    可以粘贴相关文本、数据或参考资料，AI 会根据这些内容生成更准确的幻灯片
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-xl font-medium">
              取消
            </Button>
            <Button onClick={saveEdit} className="rounded-xl font-semibold bg-gradient-to-r from-primary to-blue-500">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl">无法删除</DialogTitle>
            <DialogDescription>
              至少保留 3 页幻灯片，当前大纲页数不足。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteDialogOpen(false)} className="rounded-xl font-semibold">
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate All Dialog */}
      <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl">重新生成大纲</DialogTitle>
            <DialogDescription>
              确定要重新生成整个大纲吗？当前的所有修改将会丢失。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegenerateDialogOpen(false)} className="rounded-xl font-medium">
              取消
            </Button>
            <Button onClick={handleFullRegenerate} className="rounded-xl font-semibold bg-destructive hover:bg-destructive/90">
              确认重新生成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
