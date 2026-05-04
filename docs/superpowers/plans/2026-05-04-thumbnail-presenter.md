# 缩略图导航与演示模式实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为河狸师兄添加缩略图导航和演示模式，并引入双模式架构（模板模式 + 高级模式）

**Architecture:** 采用渐进式架构，先实现模板模式的缩略图导航和演示功能，再扩展高级模式。缩略图使用 iframe 渲染 HTML 字符串，演示模式使用 Fullscreen API + 键盘导航。

**Tech Stack:** React, Zustand, Tailwind CSS, Radix UI, Lucide Icons

---

## 文件结构

```
components/
├── preview/
│   ├── index.ts                    # 导出
│   ├── PreviewLayout.tsx           # 预览布局容器（新建）
│   ├── ThumbnailRail.tsx           # 缩略图导航栏（新建）
│   ├── SlideCanvas.tsx             # 幻灯片画布（新建）
│   └── presenter/                  # 演示模式（新建目录）
│       ├── PresenterMode.tsx       # 演示模式入口
│       ├── ControlBar.tsx          # 底部控制栏
│       ├── ProgressBar.tsx         # 顶部进度条
│       ├── OverviewGrid.tsx        # 缩略图网格弹窗
│       └── LaserPointer.tsx        # 激光笔效果
│
├── wizard/
│   ├── ModeSelectStep.tsx          # Step 0 模式选择（新建）
│   ├── InputStep.tsx               # Step 1（现有）
│   ├── OutlineStep.tsx             # Step 2（现有）
│   ├── ThemeStep.tsx               # Step 3（修改）
│   ├── GenerateStep.tsx            # Step 4（修改）
│   └── ExportStep.tsx              # Step 5（修改）
│
store/
└── useWizardStore.ts               # 扩展状态

types/
└── index.ts                        # 新增类型定义
```

---

## Task 1: 扩展 Store 和类型定义

**Files:**
- Modify: `types/index.ts`
- Modify: `store/useWizardStore.ts`

- [ ] **Step 1: 添加新类型定义到 types/index.ts**

在文件末尾添加：

```typescript
// 工作模式
export type WorkMode = 'template' | 'advanced';

// 文字密度
export type TextDensity = 'minimal' | 'light' | 'standard' | 'dense';

// 动画程度
export type MotionLevel = 'static' | 'subtle' | 'rich';

// 高级模式主题
export type AdvancedTheme = 'neon-terminal' | 'paper-press' | 'editorial-noir';

// 设计系统（简化版，用于高级模式）
export interface DesignSystem {
  palette: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  typeScale: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  radius: string;
}
```

- [ ] **Step 2: 扩展 useWizardStore.ts 状态**

替换整个文件内容：

```typescript
import { create } from 'zustand';
import type { Outline, InputType, WorkMode, TextDensity, MotionLevel, AdvancedTheme, DesignSystem } from '@/types';

interface WizardState {
  // 当前步骤 (0-5, 0 为模式选择)
  currentStep: number;

  // Step 0: 模式选择
  workMode: WorkMode;

  // Step 1: 输入
  inputType: InputType;
  inputContent: string;
  searchEnabled: boolean;

  // Step 2: 大纲
  outline: Outline | null;
  isGeneratingOutline: boolean;

  // Step 3: 主题
  selectedTheme: string;

  // 高级模式专属
  advancedTheme: AdvancedTheme;
  aesthetic: string | null;
  pageCount: number | null;
  textDensity: TextDensity | null;
  motionLevel: MotionLevel | null;
  generatedComponents: string | null;
  design: DesignSystem | null;

  // Step 4: 生成
  generatedHtml: string;
  slidePages: string[];  // 各页面 HTML
  generatedPages: number;
  totalPages: number;
  isGenerating: boolean;
  fileId: string | null;

  // 预览/演示状态
  currentSlideIndex: number;
  isPresenterMode: boolean;

  // Actions
  setStep: (step: number) => void;
  setWorkMode: (mode: WorkMode) => void;
  setInput: (type: InputType, content: string) => void;
  setSearchEnabled: (enabled: boolean) => void;
  setOutline: (outline: Outline | null) => void;
  setGeneratingOutline: (generating: boolean) => void;
  setTheme: (themeId: string) => void;
  setAdvancedTheme: (theme: AdvancedTheme) => void;
  setAesthetic: (aesthetic: string) => void;
  setPageCount: (count: number) => void;
  setTextDensity: (density: TextDensity) => void;
  setMotionLevel: (level: MotionLevel) => void;
  setGeneratedComponents: (code: string) => void;
  setDesign: (design: DesignSystem) => void;
  setGenerating: (generating: boolean) => void;
  updateProgress: (pageNum: number, total: number) => void;
  appendHtml: (html: string) => void;
  appendSlidePage: (html: string) => void;
  setGeneratedHtml: (html: string) => void;
  setSlidePages: (pages: string[]) => void;
  setFileId: (fileId: string) => void;
  setCurrentSlideIndex: (index: number) => void;
  setPresenterMode: (mode: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  workMode: 'template' as WorkMode,
  inputType: 'topic' as InputType,
  inputContent: '',
  searchEnabled: true,
  outline: null,
  isGeneratingOutline: false,
  selectedTheme: 'business-modern',
  advancedTheme: 'neon-terminal' as AdvancedTheme,
  aesthetic: null,
  pageCount: null,
  textDensity: null,
  motionLevel: null,
  generatedComponents: null,
  design: null,
  generatedHtml: '',
  slidePages: [],
  generatedPages: 0,
  totalPages: 0,
  isGenerating: false,
  fileId: null,
  currentSlideIndex: 0,
  isPresenterMode: false,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setWorkMode: (mode) => set({ workMode: mode }),

  setInput: (type, content) => set({
    inputType: type,
    inputContent: content,
  }),

  setSearchEnabled: (enabled) => set({ searchEnabled: enabled }),

  setOutline: (outline) => set({ outline }),

  setGeneratingOutline: (generating) => set({ isGeneratingOutline: generating }),

  setTheme: (themeId) => set({ selectedTheme: themeId }),

  setAdvancedTheme: (theme) => set({ advancedTheme: theme }),

  setAesthetic: (aesthetic) => set({ aesthetic }),

  setPageCount: (count) => set({ pageCount: count }),

  setTextDensity: (density) => set({ textDensity: density }),

  setMotionLevel: (level) => set({ motionLevel: level }),

  setGeneratedComponents: (code) => set({ generatedComponents: code }),

  setDesign: (design) => set({ design }),

  setGenerating: (generating) => set({ isGenerating: generating }),

  updateProgress: (pageNum, total) => set({
    generatedPages: pageNum,
    totalPages: total,
  }),

  appendHtml: (html) => set((state) => ({
    generatedHtml: state.generatedHtml + html,
  })),

  appendSlidePage: (html) => set((state) => ({
    slidePages: [...state.slidePages, html],
  })),

  setGeneratedHtml: (html) => set({ generatedHtml: html }),

  setSlidePages: (pages) => set({ slidePages: pages }),

  setFileId: (fileId) => set({ fileId }),

  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),

  setPresenterMode: (mode) => set({ isPresenterMode: mode }),

  reset: () => set(initialState),
}));
```

- [ ] **Step 3: 提交**

```bash
git add types/index.ts store/useWizardStore.ts
git commit -m "feat: extend store with work mode and presentation state"
```

---

## Task 2: 创建 SlideCanvas 组件

**Files:**
- Create: `components/preview/SlideCanvas.tsx`

- [ ] **Step 1: 创建 SlideCanvas.tsx**

```typescript
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// 画布尺寸（16:9）
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

interface SlideCanvasProps {
  html?: string;
  scale?: number;
  center?: boolean;
  className?: string;
}

export function SlideCanvas({
  html,
  scale: fixedScale,
  center = true,
  className,
}: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [fitScale, setFitScale] = useState(1);

  // 计算自适应缩放比例
  useEffect(() => {
    if (fixedScale !== undefined) return;
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setFitScale(Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixedScale]);

  // 更新 iframe 内容
  const updateIframe = useCallback((content: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (doc && content) {
      doc.open();
      doc.write(content);
      doc.close();
    }
  }, []);

  useEffect(() => {
    if (html) updateIframe(html);
  }, [html, updateIframe]);

  const scale = fixedScale ?? fitScale;
  const scaledW = CANVAS_WIDTH * scale;
  const scaledH = CANVAS_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full overflow-hidden', className)}
    >
      <div
        className="overflow-hidden bg-white rounded-[6px] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)]"
        style={{
          width: scaledW,
          height: scaledH,
          ...(center
            ? {
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }
            : {}),
        }}
      >
        <div
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="幻灯片"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/preview/SlideCanvas.tsx
git commit -m "feat: add SlideCanvas component with auto-scaling"
```

---

## Task 3: 创建 ThumbnailRail 组件

**Files:**
- Create: `components/preview/ThumbnailRail.tsx`

- [ ] **Step 1: 创建 ThumbnailRail.tsx**

```typescript
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const THUMB_WIDTH = 184;

interface ThumbnailRailProps {
  pages: string[];
  current: number;
  onSelect: (index: number) => void;
}

export function ThumbnailRail({ pages, current, onSelect }: ThumbnailRailProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const [iframeDocs, setIframeDocs] = useState<Map<number, Document>>(new Map());

  // 自动滚动到当前页
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    activeRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [current]);

  // 初始化 iframe 内容
  const initIframe = useCallback((index: number, iframe: HTMLIFrameElement | null) => {
    if (!iframe || !pages[index]) return;
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(pages[index]);
      doc.close();
      setIframeDocs((prev) => new Map(prev).set(index, doc));
    }
  }, [pages]);

  const scale = THUMB_WIDTH / CANVAS_WIDTH;
  const height = CANVAS_HEIGHT * scale;

  return (
    <div className="h-full overflow-y-auto border-r border-border bg-sidebar/50">
      <aside className="flex flex-col gap-2 p-3">
        <div className="flex items-baseline justify-between px-1 pb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            页面
          </span>
          <span className="text-sm font-mono text-muted-foreground">
            {pages.length.toString().padStart(2, '0')}
          </span>
        </div>
        {pages.map((_, i) => {
          const active = i === current;
          return (
            <button
              key={i}
              type="button"
              ref={active ? activeRef : undefined}
              onClick={() => onSelect(i)}
              aria-label={`跳转到第 ${i + 1} 页`}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'group/thumb flex items-start gap-2.5 rounded-[6px] p-1.5 text-left transition-colors',
                'hover:bg-muted/60',
                active && 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'mt-1.5 w-7 shrink-0 text-right font-mono text-[10px] font-medium tracking-wider tabular-nums uppercase',
                  active ? 'text-primary' : 'text-muted-foreground/70',
                )}
              >
                {(i + 1).toString().padStart(2, '0')}
              </span>
              <div
                className={cn(
                  'relative shrink-0 overflow-hidden rounded-[4px] border bg-card transition-all',
                  active
                    ? 'border-primary shadow-[0_0_0_1px_hsl(var(--primary))]'
                    : 'border-border group-hover/thumb:border-foreground/25',
                )}
                style={{ width: THUMB_WIDTH, height }}
              >
                <div
                  style={{
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <iframe
                    ref={(el) => initIframe(i, el)}
                    className="w-full h-full border-0"
                    title={`缩略图 ${i + 1}`}
                    sandbox="allow-scripts"
                  />
                </div>
                {active && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-primary"
                  />
                )}
              </div>
            </button>
          );
        })}
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/preview/ThumbnailRail.tsx
git commit -m "feat: add ThumbnailRail component for slide navigation"
```

---

## Task 4: 创建 PreviewLayout 组件

**Files:**
- Create: `components/preview/PreviewLayout.tsx`

- [ ] **Step 1: 创建 PreviewLayout.tsx**

```typescript
'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { ThumbnailRail } from './ThumbnailRail';
import { SlideCanvas } from './SlideCanvas';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface PreviewLayoutProps {
  showPresenterButton?: boolean;
  onPresenterEnter?: () => void;
}

export function PreviewLayout({
  showPresenterButton = true,
  onPresenterEnter,
}: PreviewLayoutProps) {
  const {
    slidePages,
    currentSlideIndex,
    setCurrentSlideIndex,
    workMode,
  } = useWizardStore();

  if (slidePages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        暂无幻灯片
      </div>
    );
  }

  const currentHtml = slidePages[currentSlideIndex] || '';

  return (
    <div className="flex h-full w-full">
      {/* 左侧缩略图导航 */}
      <div className="w-[200px] h-full shrink-0 hidden md:block">
        <ThumbnailRail
          pages={slidePages}
          current={currentSlideIndex}
          onSelect={setCurrentSlideIndex}
        />
      </div>

      {/* 右侧画布区域 */}
      <div className="flex-1 min-w-0 h-full flex flex-col">
        {/* 顶部工具栏 */}
        <div className="h-10 shrink-0 flex items-center justify-between px-4 border-b border-border bg-sidebar/30">
          <span className="text-xs text-muted-foreground">
            {currentSlideIndex + 1} / {slidePages.length}
          </span>
          {showPresenterButton && (
            <Button
              size="sm"
              variant="brand"
              onClick={onPresenterEnter}
              className="px-2.5"
            >
              <Play className="size-3.5 fill-current" />
              <span className="hidden sm:inline ml-1">演示</span>
              <kbd className="ml-1 hidden sm:inline rounded-[3px] bg-brand-foreground/15 px-1 font-mono text-[9.5px]">
                F
              </kbd>
            </Button>
          )}
        </div>

        {/* 画布 */}
        <div className="flex-1 bg-muted/10 p-4">
          <SlideCanvas html={currentHtml} />
        </div>

        {/* 移动端底部缩略图 */}
        <div className="shrink-0 border-t border-border md:hidden">
          <ThumbnailRail
            pages={slidePages}
            current={currentSlideIndex}
            onSelect={setCurrentSlideIndex}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/preview/PreviewLayout.tsx
git commit -m "feat: add PreviewLayout with thumbnail navigation"
```

---

## Task 5: 创建演示模式组件

**Files:**
- Create: `components/preview/presenter/PresenterMode.tsx`
- Create: `components/preview/presenter/ControlBar.tsx`
- Create: `components/preview/presenter/ProgressBar.tsx`
- Create: `components/preview/presenter/OverviewGrid.tsx`
- Create: `components/preview/presenter/LaserPointer.tsx`

- [ ] **Step 1: 创建 LaserPointer.tsx**

```typescript
'use client';

import { useEffect, useState } from 'react';

interface LaserPointerProps {
  enabled: boolean;
}

export function LaserPointer({ enabled }: LaserPointerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left: position.x - 8,
        top: position.y - 8,
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
      }}
    />
  );
}
```

- [ ] **Step 2: 创建 ProgressBar.tsx**

```typescript
'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  index: number;
  total: number;
  visible: boolean;
}

export function ProgressBar({ index, total, visible }: ProgressBarProps) {
  const progress = ((index + 1) / total) * 100;

  return (
    <div
      className={cn(
        'absolute top-0 left-0 right-0 h-1 z-30 transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className="h-full bg-primary/80 transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 3: 创建 ControlBar.tsx**

```typescript
'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  Square,
  Sun,
  Crosshair,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlBarProps {
  index: number;
  total: number;
  startedAt: number;
  blackout: 'black' | 'white' | null;
  laser: boolean;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
  onBlackout: (mode: 'black' | 'white') => void;
  onLaser: () => void;
  onOverview: () => void;
  onExit: () => void;
}

export function ControlBar({
  index,
  total,
  startedAt,
  blackout,
  laser,
  visible,
  onPrev,
  onNext,
  onBlackout,
  onLaser,
  onOverview,
  onExit,
}: ControlBarProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4',
        'transition-all duration-300',
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0',
      )}
    >
      <div className="pointer-events-auto flex h-11 items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2 text-white/85 shadow-lg backdrop-blur-md">
        <BarButton label="上一页" onClick={onPrev} disabled={index === 0}>
          <ChevronLeft className="size-4" />
        </BarButton>
        <BarButton label="下一页" onClick={onNext} disabled={index >= total - 1}>
          <ChevronRight className="size-4" />
        </BarButton>

        <Divider />

        <span className="px-2 font-mono text-[11.5px] tracking-wider tabular-nums select-none">
          <span className="text-white">{(index + 1).toString().padStart(2, '0')}</span>
          <span className="text-white/35"> / </span>
          <span>{total.toString().padStart(2, '0')}</span>
        </span>

        <Divider />

        <time className="px-2 font-mono text-[11.5px] tracking-wider tabular-nums select-none text-white/70">
          {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </time>

        <Divider />

        <BarButton label="缩略图网格" onClick={onOverview}>
          <Grid2x2 className="size-4" />
        </BarButton>
        <BarButton
          label="黑屏"
          onClick={() => onBlackout('black')}
          active={blackout === 'black'}
        >
          <Square className="size-4 fill-current" />
        </BarButton>
        <BarButton
          label="白屏"
          onClick={() => onBlackout('white')}
          active={blackout === 'white'}
        >
          <Sun className="size-4" />
        </BarButton>
        <BarButton label="激光笔" onClick={onLaser} active={laser}>
          <Crosshair className="size-4" />
        </BarButton>

        <Divider />

        <BarButton label="退出" onClick={onExit}>
          <LogOut className="size-4" />
        </BarButton>
      </div>
    </div>
  );
}

function BarButton({
  children,
  label,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full transition-colors',
        'hover:bg-white/12 focus-visible:bg-white/12 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-30',
        active && 'bg-primary/85 text-white hover:bg-primary',
      )}
      title={label}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-4 w-px bg-white/15" />;
}
```

- [ ] **Step 4: 创建 OverviewGrid.tsx**

```typescript
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const THUMB_WIDTH = 160;

interface OverviewGridProps {
  pages: string[];
  current: number;
  open: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
}

export function OverviewGrid({
  pages,
  current,
  open,
  onClose,
  onSelect,
}: OverviewGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(current);

  useEffect(() => {
    if (open) setFocusedIndex(current);
  }, [open, current]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(focusedIndex);
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(pages.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(pages.length - 1, i + 4));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(0, i - 4));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, focusedIndex, pages.length, onClose, onSelect]);

  // 初始化 iframe
  const initIframe = useCallback((iframe: HTMLIFrameElement | null, index: number) => {
    if (!iframe || !pages[index]) return;
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(pages[index]);
      doc.close();
    }
  }, [pages]);

  if (!open) return null;

  const scale = THUMB_WIDTH / CANVAS_WIDTH;
  const height = CANVAS_HEIGHT * scale;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={gridRef}
        className="max-h-[80vh] max-w-[80vw] overflow-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-4 gap-4">
          {pages.map((_, i) => {
            const isActive = i === current;
            const isFocused = i === focusedIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onSelect(i);
                  onClose();
                }}
                onFocus={() => setFocusedIndex(i)}
                className={cn(
                  'relative overflow-hidden rounded-[6px] border-2 transition-all',
                  isActive
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-transparent hover:border-white/30',
                  isFocused && !isActive && 'border-white/50',
                )}
                style={{ width: THUMB_WIDTH, height }}
              >
                <div
                  style={{
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <iframe
                    ref={(el) => initIframe(el, i)}
                    className="w-full h-full border-0 bg-white"
                    title={`缩略图 ${i + 1}`}
                    sandbox="allow-scripts"
                  />
                </div>
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 创建 PresenterMode.tsx**

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { SlideCanvas } from '../SlideCanvas';
import { ControlBar } from './ControlBar';
import { ProgressBar } from './ProgressBar';
import { OverviewGrid } from './OverviewGrid';
import { LaserPointer } from './LaserPointer';
import { cn } from '@/lib/utils';

interface PresenterModeProps {
  onExit: () => void;
}

export function PresenterMode({ onExit }: PresenterModeProps) {
  const { slidePages, currentSlideIndex, setCurrentSlideIndex } = useWizardStore();

  const [index, setIndex] = useState(currentSlideIndex);
  const [blackout, setBlackout] = useState<'black' | 'white' | null>(null);
  const [laser, setLaser] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [controlsVisible, setControlsVisible] = useState(true);
  const [idle, setIdle] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex(index - 1);
  }, [index]);

  const goNext = useCallback(() => {
    if (index < slidePages.length - 1) setIndex(index + 1);
  }, [index, slidePages.length]);

  // 全屏生命周期
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (document.fullscreenElement !== el) {
      el.requestFullscreen?.().catch(() => {});
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  // 监听全屏变化
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) onExit();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [onExit]);

  // 键盘导航
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target;
      if (tgt instanceof HTMLElement && tgt.matches('input, textarea')) return;

      if (overviewOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setOverviewOpen(false);
        }
        return;
      }

      if (e.key === 'Escape') {
        if (blackout) {
          e.preventDefault();
          setBlackout(null);
          return;
        }
        onExit();
        return;
      }

      const isNext =
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === ' ' ||
        e.key === 'PageDown';
      const isPrev =
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowUp' ||
        e.key === 'PageUp';

      if (isNext || isPrev) {
        if (blackout) setBlackout(null);
      }

      if (isNext) {
        e.preventDefault();
        goNext();
        return;
      }
      if (isPrev) {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === 'Home') {
        setIndex(0);
        return;
      }
      if (e.key === 'End') {
        setIndex(slidePages.length - 1);
        return;
      }

      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setBlackout((c) => (c === 'black' ? null : 'black'));
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setBlackout((c) => (c === 'white' ? null : 'white'));
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setOverviewOpen((v) => !v);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setLaser((v) => !v);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overviewOpen, blackout, onExit, goNext, goPrev, slidePages.length]);

  // 鼠标活动检测
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const onMove = () => {
      setControlsVisible(true);
      setIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIdle(true);
        setControlsVisible(false);
      }, 2000);
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      clearTimeout(timeout);
    };
  }, []);

  // 同步索引到 store
  useEffect(() => {
    setCurrentSlideIndex(index);
  }, [index, setCurrentSlideIndex]);

  const currentHtml = slidePages[index] || '';

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative flex h-screen w-screen items-center justify-center',
        blackout === 'black' ? 'bg-black' : blackout === 'white' ? 'bg-white' : 'bg-black',
        (idle || laser) && !controlsVisible && 'cursor-none',
      )}
    >
      {!blackout && <SlideCanvas html={currentHtml} />}

      {/* 点击导航区域 */}
      <button
        type="button"
        aria-label="上一页"
        onClick={goPrev}
        disabled={index === 0}
        className="absolute inset-y-0 left-0 z-10 w-[30%]"
      />
      <button
        type="button"
        aria-label="下一页"
        onClick={goNext}
        disabled={index === slidePages.length - 1}
        className="absolute inset-y-0 right-0 z-10 w-[30%]"
      />

      <ProgressBar
        index={index}
        total={slidePages.length}
        visible={controlsVisible}
      />

      <ControlBar
        index={index}
        total={slidePages.length}
        startedAt={startedAt}
        blackout={blackout}
        laser={laser}
        visible={controlsVisible}
        onPrev={goPrev}
        onNext={goNext}
        onBlackout={(mode) => setBlackout((c) => (c === mode ? null : mode))}
        onLaser={() => setLaser((v) => !v)}
        onOverview={() => setOverviewOpen(true)}
        onExit={onExit}
      />

      <LaserPointer enabled={laser} />

      <OverviewGrid
        pages={slidePages}
        current={index}
        open={overviewOpen}
        onClose={() => setOverviewOpen(false)}
        onSelect={setIndex}
      />
    </div>
  );
}
```

- [ ] **Step 6: 修复 PresenterMode 缺少 useRef 导入**

在 PresenterMode.tsx 顶部添加 useRef：

```typescript
import { useEffect, useState, useCallback, useRef } from 'react';
```

- [ ] **Step 7: 提交**

```bash
git add components/preview/presenter/
git commit -m "feat: add presenter mode with control bar, progress, overview, and laser pointer"
```

---

## Task 6: 创建导出文件

**Files:**
- Create: `components/preview/index.ts`

- [ ] **Step 1: 创建 index.ts**

```typescript
export { SlideCanvas } from './SlideCanvas';
export { ThumbnailRail } from './ThumbnailRail';
export { PreviewLayout } from './PreviewLayout';
export { PresenterMode } from './presenter/PresenterMode';
```

- [ ] **Step 2: 提交**

```bash
git add components/preview/index.ts
git commit -m "feat: add preview components export"
```

---

## Task 7: 创建模式选择步骤

**Files:**
- Create: `components/wizard/ModeSelectStep.tsx`

- [ ] **Step 1: 创建 ModeSelectStep.tsx**

```typescript
'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Layout, Code2 } from 'lucide-react';

export function ModeSelectStep() {
  const { workMode, setWorkMode, setStep } = useWizardStore();

  const handleSelect = (mode: 'template' | 'advanced') => {
    setWorkMode(mode);
    setStep(1);
  };

  return (
    <div className="step-content animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">选择工作模式</h2>
        <p className="text-sm text-muted-foreground">
          根据您的需求选择合适的模式
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* 模板模式 */}
        <div
          className={cn(
            'glass-card p-6 cursor-pointer transition-all',
            'hover:border-primary/50 hover:shadow-lg',
            workMode === 'template' && 'border-primary ring-2 ring-primary/20',
          )}
          onClick={() => setWorkMode('template')}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Layout className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">模板模式</h3>
              <span className="text-xs text-muted-foreground">推荐</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            快速生成，专业效果，适合商务汇报
          </p>

          <ul className="text-xs text-muted-foreground space-y-1.5 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              4 个精选主题
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              标准布局模板
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              分钟级完成
            </li>
          </ul>

          <Button
            variant={workMode === 'template' ? 'brand' : 'outline'}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('template');
            }}
          >
            选择
          </Button>
        </div>

        {/* 高级模式 */}
        <div
          className={cn(
            'glass-card p-6 cursor-pointer transition-all',
            'hover:border-primary/50 hover:shadow-lg',
            workMode === 'advanced' && 'border-primary ring-2 ring-primary/20',
          )}
          onClick={() => setWorkMode('advanced')}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Code2 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">高级模式</h3>
              <span className="text-xs text-muted-foreground">设计师/开发者</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            完全自定义，无限创意，适合专业用户
          </p>

          <ul className="text-xs text-muted-foreground space-y-1.5 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              React 组件生成
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              自定义动画
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              可视化检查器
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              3 个 OpenSlide 主题
            </li>
          </ul>

          <Button
            variant={workMode === 'advanced' ? 'brand' : 'outline'}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('advanced');
            }}
          >
            选择
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/wizard/ModeSelectStep.tsx
git commit -m "feat: add mode selection step (Step 0)"
```

---

## Task 8: 修改 GenerateStep 集成预览

**Files:**
- Modify: `components/wizard/GenerateStep.tsx`

- [ ] **Step 1: 修改 GenerateStep.tsx 集成 PreviewLayout**

在文件中找到 SSE 事件处理部分，修改 `PAGE_COMPLETE` 事件处理，添加页面存储：

```typescript
// 在 useWizardStore 解构中添加
const {
  // ... 现有字段
  appendSlidePage,  // 新增
} = useWizardStore();

// 在 SSE 事件处理中修改 PAGE_COMPLETE
case SSE_EVENT_TYPES.PAGE_COMPLETE:
  if (data.html) {
    appendSlidePage(data.html);  // 存储单独页面
    setPreviewHtml(data.html);
    setGenerationLogs(prev => [...prev, '   ✅ HTML 生成']);
  }
  break;
```

- [ ] **Step 2: 修改完成后的预览区域**

将预览区域替换为 PreviewLayout 组件。找到返回 JSX 的部分，将右侧预览区域替换：

```typescript
// 在文件顶部添加导入
import { PreviewLayout } from '@/components/preview';
import { PresenterMode } from '@/components/preview/presenter/PresenterMode';

// 在组件内添加状态
const [showPresenter, setShowPresenter] = useState(false);

// 替换右侧预览部分
{/* 右侧预览 */}
<div className="flex-1 flex flex-col h-full min-w-0">
  {showPresenter ? (
    <PresenterMode onExit={() => setShowPresenter(false)} />
  ) : (
    <PreviewLayout
      showPresenterButton={!isActivelyGenerating}
      onPresenterEnter={() => setShowPresenter(true)}
    />
  )}
</div>
```

- [ ] **Step 3: 完整替换 GenerateStep.tsx**

由于修改较多，完整替换文件内容：

```typescript
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
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
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showPresenter, setShowPresenter] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateIframeContent = useCallback((html: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, []);

  const startGeneration = useCallback(async () => {
    if (!outline || isGenerating) return;

    setGenerating(true);
    setError(null);
    updateProgress(0, outline.slides.length);
    setGenerationLogs(['🚀 开始生成...']);
    setAiStreamingText('');
    setPreviewHtml('');
    setSlidePages([]); // 重置页面数组

    try {
      setGenerationLogs(prev => [...prev, '📡 连接 AI...']);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline, theme_id: selectedTheme }),
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
                appendSlidePage(data.html); // 存储单独页面
                setPreviewHtml(data.html);
                setGenerationLogs(prev => [...prev, '   ✅ HTML 生成']);
              }
              break;

            case SSE_EVENT_TYPES.COMPLETE:
              if (data.file_id && data.html) {
                setFileId(data.file_id);
                setGeneratedHtml(data.html);
                setPreviewHtml(data.html);
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
    }
  }, [outline, selectedTheme, isGenerating, appendSlidePage, setGeneratedHtml, setFileId, setGenerating, setSlidePages, updateProgress]);

  useEffect(() => {
    if (outline && !generatedHtml && !isGenerating && previewHtml === '') {
      startGeneration();
    }
  }, [outline, generatedHtml, isGenerating, previewHtml, startGeneration]);

  // 限制日志数量防止内存溢出
  const displayLogs = useMemo(() => generationLogs.slice(-50), [generationLogs]);

  if (!outline) {
    return (
      <div className="step-content">
        <p className="text-muted-foreground">请先完成主题选择</p>
        <Button onClick={() => setStep(3)} className="mt-4">返回</Button>
      </div>
    );
  }

  const progress = totalPages > 0 ? (generatedPages / totalPages) * 100 : 0;
  const isActivelyGenerating = isGenerating || (slidePages.length === 0 && !error);

  return (
    <div className="flex h-full w-full">
      {/* 左侧面板 */}
      <div className="w-80 h-full overflow-hidden flex-shrink-0 p-5 bg-sidebar/40">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">生成预览</h2>
        </div>

        {/* 进度卡片 */}
        <div className="glass-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            {isActivelyGenerating ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <CheckCircle2 className="h-4 w-4 text-primary" />}
            <span className="text-sm font-medium">{isActivelyGenerating ? '正在生成...' : '生成完成'}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span className="truncate mr-2">{currentPageTitle || '准备中...'}</span>
            <span className="font-medium">{generatedPages}/{totalPages}</span>
          </div>
          <Progress value={progress} className="h-1.5 progress-glow" />
        </div>

        {/* AI 输出 */}
        {aiStreamingText && (
          <div className="glass-card glass-card-sm p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-xs font-medium text-primary">AI 思考中</span>
            </div>
            <div className="font-mono text-xs text-muted-foreground max-h-20 overflow-y-auto whitespace-pre-wrap break-all">
              {aiStreamingText.slice(-150)}
            </div>
          </div>
        )}

        {/* 日志 */}
        <div className="mb-4">
          <span className="text-xs text-muted-foreground mb-2 block">生成日志</span>
          <div className="log-area p-3 h-32 overflow-y-auto">
            {displayLogs.map((log, idx) => (
              <div key={idx} className={`text-xs py-0.5 ${log.includes('✅') || log.includes('🎉') ? 'text-primary' : log.includes('❌') ? 'text-destructive' : 'text-muted-foreground'}`}>
                {log}
              </div>
            ))}
            {isActivelyGenerating && <div className="animate-pulse text-primary text-xs">▊</div>}
          </div>
        </div>

        {/* 页面网格 */}
        <div className="mb-4">
          <div className="grid grid-cols-6 gap-1.5">
            {outline.slides.map((_, idx) => (
              <div key={idx} className={`page-grid-item ${generatedPages > idx ? 'completed' : generatedPages === idx && isActivelyGenerating ? 'active' : ''}`}>
                {generatedPages > idx ? '✓' : idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setStep(3)} className="flex-1">返回</Button>
          {!isActivelyGenerating && slidePages.length > 0 && <Button size="sm" onClick={() => setStep(5)} className="flex-1 btn-primary-glow">下一步</Button>}
        </div>
      </div>

      {/* 右侧预览 */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-muted/10">
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
```

- [ ] **Step 4: 提交**

```bash
git add components/wizard/GenerateStep.tsx
git commit -m "feat: integrate PreviewLayout and PresenterMode into GenerateStep"
```

---

## Task 9: 修改 ExportStep 集成预览

**Files:**
- Modify: `components/wizard/ExportStep.tsx`

- [ ] **Step 1: 修改 ExportStep.tsx**

```typescript
'use client';

import { useState } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { ExternalLink, RotateCcw, Download, CheckCircle2, Sparkles, Play } from 'lucide-react';
import { createHtmlBlob } from '@/lib/utils';
import { PreviewLayout } from '@/components/preview';
import { PresenterMode } from '@/components/preview/presenter/PresenterMode';

export function ExportStep() {
  const {
    generatedHtml,
    outline,
    totalPages,
    slidePages,
    setStep,
    reset,
  } = useWizardStore();

  const [showPresenter, setShowPresenter] = useState(false);

  if (!generatedHtml) {
    return (
      <div className="step-content animate-fade-in">
        <p className="text-muted-foreground">请先生成幻灯片</p>
        <Button onClick={() => setStep(4)} className="mt-4">返回生成</Button>
      </div>
    );
  }

  const handleOpenInNewTab = () => {
    const url = createHtmlBlob(generatedHtml);
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    const url = createHtmlBlob(generatedHtml);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${outline?.title || 'slides'}-slides.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewSlides = () => {
    if (confirm('确定要创建新的幻灯片吗？')) {
      reset();
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* 左侧面板 */}
      <div className="w-80 h-full overflow-hidden flex-shrink-0 p-5 bg-sidebar/40">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">生成完成</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            幻灯片已准备就绪
          </p>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-card-sm bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{outline?.title}</h3>
              <p className="text-xs text-muted-foreground">幻灯片已生成</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">页数</span>
              <p className="font-medium">{totalPages} 页</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">大小</span>
              <p className="font-medium">{(generatedHtml.length / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => setShowPresenter(true)}
            className="w-full btn-primary-glow"
            size="lg"
          >
            <Play className="mr-2 h-4 w-4 fill-current" />
            开始演示
          </Button>

          <Button onClick={handleOpenInNewTab} variant="outline" className="w-full" size="lg">
            <ExternalLink className="mr-2 h-4 w-4" />
            在新标签页预览
          </Button>

          <Button onClick={handleDownload} variant="outline" className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            下载 HTML 文件
          </Button>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => setStep(2)} size="sm">
            修改大纲
          </Button>
          <Button variant="outline" onClick={() => setStep(3)} size="sm">
            更换主题
          </Button>
          <Button variant="ghost" onClick={handleNewSlides} size="sm" className="text-muted-foreground">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            新建
          </Button>
        </div>
      </div>

      {/* 右侧预览 */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-muted/10">
        {showPresenter ? (
          <PresenterMode onExit={() => setShowPresenter(false)} />
        ) : (
          <PreviewLayout
            showPresenterButton={true}
            onPresenterEnter={() => setShowPresenter(true)}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/wizard/ExportStep.tsx
git commit -m "feat: integrate PreviewLayout and PresenterMode into ExportStep"
```

---

## Task 10: 更新主流程集成模式选择

**Files:**
- Modify: `components/layout/MainContent.tsx`

- [ ] **Step 1: 修改 MainContent.tsx 添加 Step 0**

```typescript
'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { ModeSelectStep } from '@/components/wizard/ModeSelectStep';
import { InputStep } from '@/components/wizard/InputStep';
import { OutlineStep } from '@/components/wizard/OutlineStep';
import { ThemeStep } from '@/components/wizard/ThemeStep';
import { GenerateStep } from '@/components/wizard/GenerateStep';
import { ExportStep } from '@/components/wizard/ExportStep';

export function MainContent() {
  const { currentStep } = useWizardStore();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ModeSelectStep />;
      case 1:
        return <InputStep />;
      case 2:
        return <OutlineStep />;
      case 3:
        return <ThemeStep />;
      case 4:
        return <GenerateStep />;
      case 5:
        return <ExportStep />;
      default:
        return <ModeSelectStep />;
    }
  };

  // 生成步骤不需要额外滚动容器
  const needsScroll = currentStep !== 4 && currentStep !== 5;

  return (
    <main className="main-content">
      {needsScroll ? (
        <div className="h-full overflow-y-auto">
          {renderStep()}
        </div>
      ) : (
        renderStep()
      )}
    </main>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/layout/MainContent.tsx
git commit -m "feat: integrate ModeSelectStep into main wizard flow"
```

---

## Task 11: 更新侧边栏步骤指示

**Files:**
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: 修改 Sidebar.tsx**

```typescript
'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Settings } from 'lucide-react';

const steps = [
  { id: 0, title: '模式', description: '选择工作模式' },
  { id: 1, title: '输入', description: '话题或内容' },
  { id: 2, title: '大纲', description: '内容规划' },
  { id: 3, title: '主题', description: '视觉风格' },
  { id: 4, title: '生成', description: '实时预览' },
  { id: 5, title: '导出', description: '下载文件' },
];

export function Sidebar() {
  const { currentStep, setStep, outline, selectedTheme, generatedHtml, workMode } = useWizardStore();

  const canNavigate = (stepId: number): boolean => {
    if (stepId === 0) return true;
    if (stepId === 1) return true;
    if (stepId === 2) return true;
    if (stepId === 3) return outline !== null;
    if (stepId === 4) return outline !== null && selectedTheme !== '';
    if (stepId === 5) return generatedHtml !== '';
    return false;
  };

  const isCompleted = (stepId: number): boolean => {
    if (stepId === 0) return workMode !== null;
    if (stepId === 1) return outline !== null;
    if (stepId === 2) return outline !== null && selectedTheme !== '';
    if (stepId === 3) return outline !== null && selectedTheme !== '' && generatedHtml !== '';
    if (stepId === 4) return generatedHtml !== '';
    return false;
  };

  return (
    <aside className="sidebar flex flex-col">
      {/* Logo */}
      <div className="p-5">
        <div className="glass-card glass-card-sm p-3 inline-flex items-center gap-2.5">
          <div className="p-1.5 rounded-card-sm bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">Kami Slides</span>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 p-4 pt-0">
        <ol className="space-y-1.5">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const completed = isCompleted(step.id);
            const clickable = canNavigate(step.id);

            return (
              <li key={step.id}>
                <button
                  onClick={() => clickable && setStep(step.id)}
                  disabled={!clickable}
                  className={cn(
                    'w-full text-left p-3 rounded-card transition-all duration-200',
                    isActive && 'bg-primary/8',
                    !isActive && clickable && 'hover:bg-muted/50 cursor-pointer',
                    !clickable && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'step-indicator',
                        completed && 'completed',
                        isActive && 'active',
                        !isActive && !completed && 'pending'
                      )}
                    >
                      {completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'font-medium text-sm',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className="text-xs text-muted-foreground text-center opacity-60">
          AI 驱动的幻灯片生成
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat: add Step 0 to sidebar navigation"
```

---

## Task 12: 测试和修复

**Files:**
- Various

- [ ] **Step 1: 运行开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 测试模式选择**

- 访问应用首页
- 验证 Step 0 显示模式选择
- 选择模板模式，验证进入 Step 1

- [ ] **Step 3: 测试缩略图导航**

- 完成生成流程
- 验证左侧缩略图列表显示
- 点击缩略图验证页面切换
- 验证当前页高亮

- [ ] **Step 4: 测试演示模式**

- 点击演示按钮
- 验证全屏进入
- 测试键盘导航（方向键、空格）
- 测试黑屏/白屏（B/W 键）
- 测试缩略图网格（O 键）
- 测试激光笔（L 键）
- 测试 ESC 退出

- [ ] **Step 5: 修复发现的问题**

根据测试结果修复任何问题。

- [ ] **Step 6: 最终提交**

```bash
git add -A
git commit -m "fix: resolve issues found during testing"
```

---

## 验收清单

### 缩略图导航
- [ ] 左侧显示缩略图列表
- [ ] 点击缩略图切换页面
- [ ] 当前页高亮显示
- [ ] 自动滚动到当前页
- [ ] 支持键盘导航

### 演示模式
- [ ] 点击按钮进入全屏演示
- [ ] 键盘导航正常工作
- [ ] 控制栏显示页码和计时器
- [ ] 黑屏/白屏功能正常
- [ ] 缩略图网格功能正常
- [ ] 激光笔功能正常
- [ ] ESC 退出演示

### 模式选择
- [ ] Step 0 显示模式选择界面
- [ ] 模板模式流程正常
- [ ] 模式选择后正确切换
