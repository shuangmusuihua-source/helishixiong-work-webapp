'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWizardStore } from '@/store/useWizardStore';

interface EditSlideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slideIndex: number;
}

export function EditSlideDialog({ open, onOpenChange, slideIndex }: EditSlideDialogProps) {
  const { slidePages, setSlidePages } = useWizardStore();
  const [editContent, setEditContent] = useState('');

  // 当前幻灯片的 HTML
  const currentHtml = slidePages[slideIndex] || '';

  // 提取可编辑的文本内容
  useEffect(() => {
    if (open && currentHtml) {
      // 从 HTML 中提取纯文本
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentHtml, 'text/html');
      const bodyText = doc.body?.textContent || '';
      setEditContent(bodyText.trim());
    }
  }, [open, currentHtml]);

  // 保存编辑
  const handleSave = useCallback(() => {
    if (!editContent.trim()) return;

    // 更新 HTML 中的文本内容
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentHtml, 'text/html');

    // 找到主要的文本容器并更新
    const textElements = doc.querySelectorAll('h1, h2, h3, p, span, div');
    const lines = editContent.split('\n').filter(line => line.trim());

    let lineIndex = 0;
    textElements.forEach((el) => {
      const text = el.textContent?.trim();
      if (text && text.length > 5 && lineIndex < lines.length) {
        // 只更新主要文本内容
        if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
          el.textContent = lines[lineIndex];
          lineIndex++;
        }
      }
    });

    const updatedHtml = doc.documentElement.outerHTML;
    const newPages = [...slidePages];
    newPages[slideIndex] = updatedHtml;
    setSlidePages(newPages);
    onOpenChange(false);
  }, [editContent, currentHtml, slidePages, slideIndex, setSlidePages, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑幻灯片内容</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>文本内容</Label>
            <p className="text-xs text-muted-foreground">
              编辑幻灯片中的主要文本内容。每行对应一个文本元素。
            </p>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="输入文本内容..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSave} className="btn-primary-glow">
              保存更改
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
