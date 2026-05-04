'use client';

import { useEffect, useState } from 'react';
import { X, Save, Undo2, Redo2, Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { useInspector } from './inspector-provider';
import { useWizardStore } from '@/store/useWizardStore';

export function InspectorEditPanel() {
  const { active, selected, selectElement, applyEdit, undo, redo, canUndo, canRedo, getEditedHtml } = useInspector();
  const { slidePages, setSlidePages, currentSlideIndex } = useWizardStore();
  const [localText, setLocalText] = useState('');

  // 同步本地文本状态
  useEffect(() => {
    if (selected?.text) {
      setLocalText(selected.text);
    }
  }, [selected?.text]);

  // 保存编辑到 store
  const handleSave = () => {
    const editedHtml = getEditedHtml();
    if (!editedHtml) return;

    // 更新当前幻灯片的 HTML
    const newPages = [...slidePages];
    // 包装成完整的 HTML 文档
    const fullHtml = slidePages[currentSlideIndex]?.includes('<!DOCTYPE')
      ? slidePages[currentSlideIndex].replace(/<body[^>]*>[\s\S]*?<\/body>/i, `<body>${editedHtml}</body>`)
      : editedHtml;
    newPages[currentSlideIndex] = fullHtml;
    setSlidePages(newPages);
  };

  if (!active || !selected) return null;

  const handleTextChange = (value: string) => {
    setLocalText(value);
    applyEdit({ type: 'text', value });
  };

  const handleFontSizeChange = (value: number) => {
    applyEdit({ type: 'style', key: 'fontSize', value: `${value}px` });
  };

  const handleFontWeightChange = (bold: boolean) => {
    applyEdit({ type: 'style', key: 'fontWeight', value: bold ? '700' : '400' });
  };

  const handleFontStyleChange = (italic: boolean) => {
    applyEdit({ type: 'style', key: 'fontStyle', value: italic ? 'italic' : 'normal' });
  };

  const handleColorChange = (value: string) => {
    applyEdit({ type: 'style', key: 'color', value });
  };

  const handleBackgroundColorChange = (value: string) => {
    applyEdit({ type: 'style', key: 'backgroundColor', value });
  };

  const handleTextAlignChange = (value: 'left' | 'center' | 'right' | 'justify') => {
    applyEdit({ type: 'style', key: 'textAlign', value });
  };

  return (
    <div className="fixed right-4 top-20 w-72 bg-card border rounded-lg shadow-lg z-50 animate-in slide-in-from-right-4" data-inspector-ui>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">编辑元素</span>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
            &lt;{selected.tagName}&gt;
          </span>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => selectElement(null)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Undo/Redo/Save */}
      <div className="flex items-center gap-1 p-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canUndo}
          onClick={undo}
          className="text-xs"
        >
          <Undo2 className="h-3.5 w-3.5 mr-1" />
          撤销
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!canRedo}
          onClick={redo}
          className="text-xs"
        >
          <Redo2 className="h-3.5 w-3.5 mr-1" />
          重做
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          className="text-xs ml-auto btn-primary-glow"
        >
          <Save className="h-3.5 w-3.5 mr-1" />
          保存
        </Button>
      </div>

      <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Text Content */}
        {selected.text !== null && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              文本内容
            </label>
            <textarea
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full min-h-[80px] p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入文本..."
            />
          </div>
        )}

        <Separator />

        {/* Typography */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            字体大小: {Math.round(selected.styles.fontSize)}px
          </label>
          <Slider
            min={8}
            max={200}
            step={1}
            value={[selected.styles.fontSize]}
            onValueChange={(values) => {
              if (Array.isArray(values) && values.length > 0) {
                const v = values[0];
                if (v) handleFontSizeChange(v);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground w-12">样式</label>
          <Toggle
            size="sm"
            variant="outline"
            pressed={selected.styles.fontWeight >= 600}
            onPressedChange={handleFontWeightChange}
            aria-label="粗体"
          >
            <Bold className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            variant="outline"
            pressed={selected.styles.fontStyle === 'italic'}
            onPressedChange={handleFontStyleChange}
            aria-label="斜体"
          >
            <Italic className="h-3.5 w-3.5" />
          </Toggle>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground w-12">对齐</label>
          <div className="flex gap-1">
            <Toggle
              size="sm"
              variant="outline"
              pressed={selected.styles.textAlign === 'left'}
              onPressedChange={() => handleTextAlignChange('left')}
              aria-label="左对齐"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              size="sm"
              variant="outline"
              pressed={selected.styles.textAlign === 'center'}
              onPressedChange={() => handleTextAlignChange('center')}
              aria-label="居中"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              size="sm"
              variant="outline"
              pressed={selected.styles.textAlign === 'right'}
              onPressedChange={() => handleTextAlignChange('right')}
              aria-label="右对齐"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              size="sm"
              variant="outline"
              pressed={selected.styles.textAlign === 'justify'}
              onPressedChange={() => handleTextAlignChange('justify')}
              aria-label="两端对齐"
            >
              <AlignJustify className="h-3.5 w-3.5" />
            </Toggle>
          </div>
        </div>

        <Separator />

        {/* Colors */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            文字颜色
          </label>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-background shadow-xs">
              <span
                className="size-5 rounded-sm"
                style={{ backgroundColor: selected.styles.color }}
              />
              <input
                type="color"
                value={rgbToHex(selected.styles.color)}
                onChange={(e) => handleColorChange(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            <Input
              value={rgbToHex(selected.styles.color)}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-8 flex-1 font-mono text-xs uppercase"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            背景颜色
          </label>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-background shadow-xs">
              <span
                className="size-5 rounded-sm"
                style={{
                  backgroundColor: selected.styles.backgroundColor || 'transparent',
                  backgroundImage: !selected.styles.backgroundColor
                    ? 'linear-gradient(45deg, #d4d4d4 25%, transparent 25%, transparent 75%, #d4d4d4 75%), linear-gradient(45deg, #d4d4d4 25%, transparent 25%, transparent 75%, #d4d4d4 75%)'
                    : undefined,
                  backgroundSize: !selected.styles.backgroundColor ? '8px 8px' : undefined,
                  backgroundPosition: !selected.styles.backgroundColor ? '0 0, 4px 4px' : undefined,
                }}
              />
              <input
                type="color"
                value={rgbToHex(selected.styles.backgroundColor || '#ffffff')}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            <Input
              value={selected.styles.backgroundColor ? rgbToHex(selected.styles.backgroundColor) : ''}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              placeholder="透明"
              className="h-8 flex-1 font-mono text-xs uppercase"
            />
            {selected.styles.backgroundColor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBackgroundColorChange('transparent')}
                className="text-xs"
              >
                清除
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// RGB 转 HEX
function rgbToHex(value: string): string {
  if (!value) return '#000000';
  if (value.startsWith('#')) return value;

  const m = value.match(/^rgba?\(([^)]+)\)$/);
  if (!m) return '#000000';

  const parts = m[1].split(',').map((s) => s.trim());
  if (parts.length < 3) return '#000000';

  const r = clampByte(Number(parts[0]));
  const g = clampByte(Number(parts[1]));
  const b = clampByte(Number(parts[2]));

  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(Number.isFinite(n) ? n : 0)));
}
