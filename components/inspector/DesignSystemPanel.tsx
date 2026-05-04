'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Type, Maximize2, RotateCcw, Sun, Moon, Monitor } from 'lucide-react';
import type { DesignSystem } from '@/types';
import { themeDesigns } from '@/lib/generator/design-system';

interface DesignSystemPanelProps {
  onChange?: (design: DesignSystem) => void;
}

// 预设字体
const FONT_PRESETS = [
  { label: 'JetBrains Mono', value: '"JetBrains Mono", Menlo, monospace' },
  { label: 'Inter', value: '"Inter", system-ui, sans-serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
  { label: 'System Sans', value: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif' },
  { label: 'Helvetica', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Times', value: '"Times New Roman", Times, serif' },
];

// 预设主题
const PRESET_THEMES = [
  { id: 'neon-terminal', name: 'Neon Terminal', icon: Monitor },
  { id: 'paper-press', name: 'Paper Press', icon: Sun },
  { id: 'editorial-noir', name: 'Editorial Noir', icon: Moon },
];

const defaultDesign: DesignSystem = themeDesigns['neon-terminal'];

export function DesignSystemPanel({ onChange }: DesignSystemPanelProps) {
  const { design, setDesign } = useWizardStore();
  const currentDesign = design || defaultDesign;

  const updateDesign = (updates: Partial<DesignSystem>) => {
    const newDesign = { ...currentDesign, ...updates };
    setDesign(newDesign);
    onChange?.(newDesign);
  };

  const updatePalette = (key: keyof DesignSystem['palette'], value: string) => {
    updateDesign({
      palette: { ...currentDesign.palette, [key]: value },
    });
  };

  const updateFonts = (key: keyof DesignSystem['fonts'], value: string) => {
    updateDesign({
      fonts: { ...currentDesign.fonts, [key]: value },
    });
  };

  const updateTypeScale = (key: keyof DesignSystem['typeScale'], value: number) => {
    updateDesign({
      typeScale: { ...currentDesign.typeScale, [key]: value },
    });
  };

  const applyPresetTheme = (themeId: string) => {
    const preset = themeDesigns[themeId];
    if (preset) {
      setDesign(preset);
      onChange?.(preset);
    }
  };

  const resetDesign = () => {
    setDesign(null);
    onChange?.(defaultDesign);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">设计系统</span>
        </div>
        <Button variant="ghost" size="sm" onClick={resetDesign}>
          <RotateCcw className="h-3 w-3 mr-1" />
          重置
        </Button>
      </div>

      {/* Preset Themes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-muted-foreground">预设主题</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_THEMES.map((theme) => {
            const Icon = theme.icon;
            const isActive = design && JSON.stringify(design) === JSON.stringify(themeDesigns[theme.id]);
            return (
              <button
                key={theme.id}
                onClick={() => applyPresetTheme(theme.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-medium">{theme.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs font-medium text-muted-foreground">颜色</span>
        </div>
        <div className="space-y-2">
          <ColorField
            label="背景"
            value={currentDesign.palette.bg}
            onChange={(v) => updatePalette('bg', v)}
          />
          <ColorField
            label="文字"
            value={currentDesign.palette.text}
            onChange={(v) => updatePalette('text', v)}
          />
          <ColorField
            label="强调"
            value={currentDesign.palette.accent}
            onChange={(v) => updatePalette('accent', v)}
          />
          {currentDesign.palette.surface && (
            <ColorField
              label="表面"
              value={currentDesign.palette.surface}
              onChange={(v) => updatePalette('surface', v)}
            />
          )}
          {currentDesign.palette.muted && (
            <ColorField
              label="次要"
              value={currentDesign.palette.muted}
              onChange={(v) => updatePalette('muted', v)}
            />
          )}
        </div>
      </div>

      {/* Typography */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">字体</span>
        </div>
        <div className="space-y-3">
          <FontField
            label="标题字体"
            value={currentDesign.fonts.display}
            onChange={(v) => updateFonts('display', v)}
          />
          <FontField
            label="正文字体"
            value={currentDesign.fonts.body}
            onChange={(v) => updateFonts('body', v)}
          />
        </div>
      </div>

      {/* Type Scale */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-muted-foreground">字号</span>
        </div>
        <div className="space-y-3">
          <SliderField
            label="标题字号"
            value={currentDesign.typeScale.hero}
            min={48}
            max={240}
            step={2}
            suffix="px"
            onChange={(v) => updateTypeScale('hero', v)}
          />
          <SliderField
            label="正文字号"
            value={currentDesign.typeScale.body}
            min={16}
            max={72}
            step={1}
            suffix="px"
            onChange={(v) => updateTypeScale('body', v)}
          />
        </div>
      </div>

      {/* Radius */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Maximize2 className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">圆角</span>
        </div>
        <SliderField
          label="圆角"
          value={currentDesign.radius}
          min={0}
          max={80}
          step={1}
          suffix="px"
          onChange={(v) => updateDesign({ radius: v })}
        />
        <div className="flex justify-center mt-2">
          <div
            className="w-12 h-12 border-2 border-primary transition-all"
            style={{ borderRadius: currentDesign.radius }}
          />
        </div>
      </div>

      {/* CSS Output */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
          <Type className="h-3 w-3" />
          CSS 变量预览
        </summary>
        <pre className="mt-2 text-[10px] p-3 bg-muted/50 rounded overflow-x-auto">
{`:root {
  --osd-bg: ${currentDesign.palette.bg};
  --osd-text: ${currentDesign.palette.text};
  --osd-accent: ${currentDesign.palette.accent};
  --osd-surface: ${currentDesign.palette.surface || currentDesign.palette.bg};
  --osd-muted: ${currentDesign.palette.muted || currentDesign.palette.text};
  --osd-font-display: ${currentDesign.fonts.display};
  --osd-font-body: ${currentDesign.fonts.body};
  --osd-size-hero: ${currentDesign.typeScale.hero}px;
  --osd-size-body: ${currentDesign.typeScale.body}px;
  --osd-radius: ${currentDesign.radius}px;
}`}</pre>
      </details>
    </div>
  );
}

// 颜色选择器组件
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-muted-foreground w-12 shrink-0">{label}</label>
      <label className="relative inline-flex size-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-background shadow-xs">
        <span
          className="size-5 rounded-sm"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 flex-1 font-mono text-[11px] uppercase"
        placeholder="#000000"
      />
    </div>
  );
}

// 字体选择器组件
function FontField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const matched = FONT_PRESETS.find((p) => p.value === value);

  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-muted-foreground w-12 shrink-0">{label}</label>
      <Select
        value={matched ? matched.value : '__custom__'}
        onValueChange={(v) => {
          if (v && v !== '__custom__') onChange(v);
        }}
      >
        <SelectTrigger size="sm" className="h-7 flex-1 text-xs">
          <SelectValue placeholder="选择字体" />
        </SelectTrigger>
        <SelectContent>
          {FONT_PRESETS.map((font) => (
            <SelectItem key={font.label} value={font.value} className="text-xs">
              {font.label}
            </SelectItem>
          ))}
          {!matched && (
            <SelectItem value="__custom__" className="text-xs text-muted-foreground">
              自定义字体
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

// 滑块组件
function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-muted-foreground w-12 shrink-0">{label}</label>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => {
          if (Array.isArray(values) && values.length > 0) onChange(values[0]);
        }}
        className="flex-1"
      />
      <div className="w-16 shrink-0">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          min={min}
          max={max}
          step={step}
          className="h-7 text-xs text-right"
        />
      </div>
      {suffix && (
        <span className="text-[10px] text-muted-foreground w-6 shrink-0">{suffix}</span>
      )}
    </div>
  );
}
