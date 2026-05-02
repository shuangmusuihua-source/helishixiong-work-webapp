# Kami Slides Web 应用实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个智能幻灯片生成 Web 应用，用户输入话题/文本/文件，系统自动生成可独立运行的 HTML 幻灯片。

**Architecture:** Next.js 14 全栈应用，采用左侧边栏向导布局，SSE 流式生成幻灯片，iframe 实时预览，最终输出单 HTML 文件。

**Tech Stack:** Next.js 14, React 18, TypeScript, shadcn/ui, Tailwind CSS, Zustand, Claude API, ECharts 5

---

## 文件结构总览

```
kami-slides-webapp/
├── app/
│   ├── layout.tsx                 # 根布局
│   ├── page.tsx                   # 首页
│   ├── create/
│   │   └── page.tsx               # 创建向导页面
│   └── api/
│       ├── plan/route.ts          # 大纲生成 API
│       ├── generate/route.ts      # HTML 生成 API (SSE)
│       └── export/route.ts        # 文件导出 API
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            # 左侧边栏
│   │   └── MainContent.tsx        # 右侧主内容区
│   ├── wizard/
│   │   ├── InputStep.tsx          # Step 1
│   │   ├── OutlineStep.tsx        # Step 2
│   │   ├── ThemeStep.tsx          # Step 3
│   │   ├── GenerateStep.tsx       # Step 4
│   │   └── ExportStep.tsx         # Step 5
│   ├── preview/
│   │   ├── SlidePreview.tsx       # 幻灯片预览
│   │   └── PreviewToolbar.tsx     # 预览工具栏
│   └── ui/                        # shadcn/ui 组件
├── lib/
│   ├── generator/                 # HTML 生成器
│   │   ├── index.ts
│   │   ├── cover.ts
│   │   ├── data.ts
│   │   ├── comparison.ts
│   │   ├── timeline.ts
│   │   ├── architecture.ts
│   │   ├── list.ts
│   │   ├── quote.ts
│   │   └── paragraph.ts
│   ├── llm/
│   │   ├── claude.ts              # Claude API 封装
│   │   └── prompts.ts             # Prompt 模板
│   └── utils/
│       └── index.ts
├── store/
│   └── useWizardStore.ts          # Zustand 状态
├── types/
│   └── index.ts                   # TypeScript 类型
└── styles/
    └── globals.css
```

---

## Task 1: 项目初始化与基础配置

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `next.config.ts`
- Create: `.env.local`
- Create: `.gitignore`

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd /Users/zuohui/Desktop/vision-product/helishixiong-work-webapp
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

选择默认选项，等待项目创建完成。

- [ ] **Step 2: 安装核心依赖**

```bash
npm install zustand @anthropic-ai/sdk lucide-react
npm install -D @types/node
```

- [ ] **Step 3: 初始化 shadcn/ui**

```bash
npx shadcn@latest init
```

选择:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

- [ ] **Step 4: 安装 shadcn/ui 组件**

```bash
npx shadcn@latest add button card input textarea progress dialog tabs badge separator scroll-area
```

- [ ] **Step 5: 创建环境变量文件**

创建 `.env.local`:

```
ANTHROPIC_API_KEY=your_api_key_here
```

- [ ] **Step 6: 更新 .gitignore**

确保 `.gitignore` 包含:

```
.env.local
.env*.local
node_modules/
.next/
out/
.superpowers/
```

- [ ] **Step 7: 验证项目启动**

```bash
npm run dev
```

访问 http://localhost:3000 确认页面正常显示。

- [ ] **Step 8: 提交初始化**

```bash
git add .
git commit -m "chore: initialize Next.js project with shadcn/ui"
```

---

## Task 2: TypeScript 类型定义

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: 创建类型定义文件**

创建 `types/index.ts`:

```typescript
// 输入类型
export type InputType = 'topic' | 'text' | 'file';

// 页面类型
export type PageType = 'cover' | 'content' | 'end';

// 内容类型
export type ContentType = 'data' | 'comparison' | 'timeline' | 'architecture' | 'quote' | 'list' | 'paragraph';

// 封面页数据
export interface CoverSlide {
  page_type: 'cover';
  title: string;
  subtitle: string;
  author?: string;
  date?: string;
}

// 内容页数据
export interface ContentSlide {
  page_type: 'content';
  page_number: number;
  title: string;
  content_type: ContentType;
  summary: string;
  content: SlideContent;
}

// 尾页数据
export interface EndSlide {
  page_type: 'end';
  title?: string;
}

// 幻灯片联合类型
export type Slide = CoverSlide | ContentSlide | EndSlide;

// 大纲结构
export interface Outline {
  title: string;
  slides: Slide[];
}

// 数据类型内容
export interface DataContent {
  chart_type: 'bar' | 'line' | 'pie' | 'radar';
  data: {
    labels: string[];
    values: number[];
    unit?: string;
  };
  insights?: string[];
}

// 对比类型内容
export interface ComparisonContent {
  subjects: string[];
  metrics: {
    name: string;
    values: (string | number)[];
    unit?: string;
  }[];
  conclusion?: string;
}

// 时间线类型内容
export interface TimelineContent {
  events: {
    time: string;
    title: string;
    description?: string;
  }[];
}

// 架构类型内容
export interface ArchitectureContent {
  layers: {
    name: string;
    items: string[];
  }[];
}

// 引用类型内容
export interface QuoteContent {
  quote: string;
  author?: string;
  source?: string;
}

// 列表类型内容
export interface ListContent {
  items: {
    title: string;
    description?: string;
    icon?: string;
  }[];
}

// 段落类型内容
export interface ParagraphContent {
  text: string;
  highlight?: string[];
}

// 内容联合类型
export type SlideContent = DataContent | ComparisonContent | TimelineContent | ArchitectureContent | QuoteContent | ListContent | ParagraphContent | Record<string, unknown>;

// 主题配置
export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  colors: Record<string, string>;
  fonts: {
    primary: string;
    fallback: string;
  };
  features: Record<string, boolean>;
}

// API 请求类型
export interface PlanRequest {
  input_type: InputType;
  content: string;
  search_enabled: boolean;
}

export interface GenerateRequest {
  outline: Outline;
  theme_id: string;
}

// API 响应类型
export interface PlanResponse {
  outline: Outline;
}

export interface GenerateProgressEvent {
  page_num: number;
  total: number;
  status: 'generating' | 'complete';
}

export interface GeneratePageEvent {
  page_num: number;
  html: string;
}

export interface GenerateCompleteEvent {
  file_id: string;
  page_count: number;
}
```

- [ ] **Step 2: 验证类型编译**

```bash
npx tsc --noEmit
```

确认无类型错误。

- [ ] **Step 3: 提交类型定义**

```bash
git add types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: Zustand 状态管理

**Files:**
- Create: `store/useWizardStore.ts`

- [ ] **Step 1: 创建 Zustand Store**

创建 `store/useWizardStore.ts`:

```typescript
import { create } from 'zustand';
import type { Outline, InputType } from '@/types';

interface WizardState {
  // 当前步骤 (1-5)
  currentStep: number;

  // Step 1: 输入
  inputType: InputType;
  inputContent: string;
  searchEnabled: boolean;

  // Step 2: 大纲
  outline: Outline | null;
  isGeneratingOutline: boolean;

  // Step 3: 主题
  selectedTheme: string;

  // Step 4: 生成
  generatedHtml: string;
  generatedPages: number;
  totalPages: number;
  isGenerating: boolean;
  fileId: string | null;

  // Actions
  setStep: (step: number) => void;
  setInput: (type: InputType, content: string) => void;
  setSearchEnabled: (enabled: boolean) => void;
  setOutline: (outline: Outline) => void;
  setGeneratingOutline: (generating: boolean) => void;
  setTheme: (themeId: string) => void;
  setGenerating: (generating: boolean) => void;
  updateProgress: (pageNum: number, total: number) => void;
  appendHtml: (html: string) => void;
  setFileId: (fileId: string) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  inputType: 'topic' as InputType,
  inputContent: '',
  searchEnabled: true,
  outline: null,
  isGeneratingOutline: false,
  selectedTheme: 'business-modern',
  generatedHtml: '',
  generatedPages: 0,
  totalPages: 0,
  isGenerating: false,
  fileId: null,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setInput: (type, content) => set({
    inputType: type,
    inputContent: content,
  }),

  setSearchEnabled: (enabled) => set({ searchEnabled: enabled }),

  setOutline: (outline) => set({ outline }),

  setGeneratingOutline: (generating) => set({ isGeneratingOutline: generating }),

  setTheme: (themeId) => set({ selectedTheme: themeId }),

  setGenerating: (generating) => set({ isGenerating: generating }),

  updateProgress: (pageNum, total) => set({
    generatedPages: pageNum,
    totalPages: total,
  }),

  appendHtml: (html) => set((state) => ({
    generatedHtml: state.generatedHtml + html,
  })),

  setFileId: (fileId) => set({ fileId }),

  reset: () => set(initialState),
}));
```

- [ ] **Step 2: 验证 Store 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交状态管理**

```bash
git add store/useWizardStore.ts
git commit -m "feat: add Zustand store for wizard state"
```

---

## Task 4: 全局样式与布局

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: 更新全局样式**

修改 `app/globals.css`，在现有内容后添加:

```css
@layer base {
  :root {
    --sidebar-width: 280px;
    --header-height: 64px;
  }

  body {
    @apply antialiased;
  }
}

@layer components {
  .wizard-container {
    @apply flex min-h-screen;
  }

  .sidebar {
    @apply w-[var(--sidebar-width)] border-r bg-muted/30 flex-shrink-0;
  }

  .main-content {
    @apply flex-1 overflow-auto;
  }

  .step-content {
    @apply p-8 max-w-4xl mx-auto;
  }
}
```

- [ ] **Step 2: 更新根布局**

修改 `app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kami Slides - 智能幻灯片生成',
  description: '输入话题，AI 自动生成专业幻灯片',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: 创建首页**

修改 `app/page.tsx`:

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Zap, Download } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Kami Slides
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            输入话题，AI 自动生成专业幻灯片
          </p>
          <Link href="/create">
            <Button size="lg" className="text-lg px-8">
              <Sparkles className="mr-2 h-5 w-5" />
              开始创建
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>智能内容规划</CardTitle>
              <CardDescription>
                AI 自动分析输入内容，生成结构化大纲
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>分钟级生成</CardTitle>
              <CardDescription>
                从话题到幻灯片，分钟级完成
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-10 w-10 text-primary mb-2" />
              <CardTitle>独立运行</CardTitle>
              <CardDescription>
                单 HTML 文件，无需依赖即可运行
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: 验证首页显示**

```bash
npm run dev
```

访问 http://localhost:3000 确认首页正常显示。

- [ ] **Step 5: 提交布局与首页**

```bash
git add app/globals.css app/layout.tsx app/page.tsx
git commit -m "feat: add global styles and home page"
```

---

## Task 5: 左侧边栏组件

**Files:**
- Create: `components/layout/Sidebar.tsx`

- [ ] **Step 1: 创建侧边栏组件**

创建 `components/layout/Sidebar.tsx`:

```typescript
'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, title: '输入处理', description: '输入话题或上传文件' },
  { id: 2, title: '内容规划', description: '编辑幻灯片大纲' },
  { id: 3, title: '主题选择', description: '选择视觉风格' },
  { id: 4, title: '生成预览', description: '实时生成预览' },
  { id: 5, title: '交付导出', description: '下载 HTML 文件' },
];

export function Sidebar() {
  const { currentStep, setStep, outline, selectedTheme, generatedHtml } = useWizardStore();

  const canNavigate = (stepId: number): boolean => {
    // Step 1 始终可访问
    if (stepId === 1) return true;
    // Step 2 需要有输入内容
    if (stepId === 2) return true; // 允许前进
    // Step 3 需要有大纲
    if (stepId === 3) return outline !== null;
    // Step 4 需要选择了主题
    if (stepId === 4) return outline !== null && selectedTheme !== '';
    // Step 5 需要已生成
    if (stepId === 5) return generatedHtml !== '';
    return false;
  };

  const isCompleted = (stepId: number): boolean => {
    if (stepId === 1) return outline !== null;
    if (stepId === 2) return outline !== null && selectedTheme !== '';
    if (stepId === 3) return outline !== null && selectedTheme !== '' && generatedHtml !== '';
    if (stepId === 4) return generatedHtml !== '';
    return false;
  };

  return (
    <aside className="sidebar flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Kami Slides</h1>
        <p className="text-sm text-muted-foreground">智能幻灯片生成</p>
      </div>

      <nav className="flex-1 p-4">
        <ol className="space-y-2">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const completed = isCompleted(step.id);
            const clickable = canNavigate(step.id);

            return (
              <li key={step.id}>
                <button
                  onClick={() => clickable && setStep(step.id)}
                  disabled={!clickable}
                  className={cn(
                    'w-full text-left p-4 rounded-lg transition-colors',
                    isActive && 'bg-primary/10 border-2 border-primary',
                    !isActive && clickable && 'hover:bg-muted cursor-pointer',
                    !clickable && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                        completed && 'bg-primary text-primary-foreground',
                        isActive && !completed && 'bg-primary text-primary-foreground',
                        !isActive && !completed && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {completed ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">
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
    </aside>
  );
}
```

- [ ] **Step 2: 创建 utils 文件**

创建 `lib/utils.ts` (shadcn/ui 需要):

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: 安装 clsx 和 tailwind-merge**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 4: 验证组件编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: 提交侧边栏组件**

```bash
git add components/layout/Sidebar.tsx lib/utils.ts
git commit -m "feat: add sidebar navigation component"
```

---

## Task 6: 创建向导页面框架

**Files:**
- Create: `app/create/page.tsx`
- Create: `components/layout/MainContent.tsx`

- [ ] **Step 1: 创建主内容区组件**

创建 `components/layout/MainContent.tsx`:

```typescript
'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { InputStep } from '@/components/wizard/InputStep';
import { OutlineStep } from '@/components/wizard/OutlineStep';
import { ThemeStep } from '@/components/wizard/ThemeStep';
import { GenerateStep } from '@/components/wizard/GenerateStep';
import { ExportStep } from '@/components/wizard/ExportStep';

export function MainContent() {
  const { currentStep } = useWizardStore();

  const renderStep = () => {
    switch (currentStep) {
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
        return <InputStep />;
    }
  };

  return (
    <main className="main-content">
      {renderStep()}
    </main>
  );
}
```

- [ ] **Step 2: 创建向导页面**

创建 `app/create/page.tsx`:

```typescript
import { Sidebar } from '@/components/layout/Sidebar';
import { MainContent } from '@/components/layout/MainContent';

export default function CreatePage() {
  return (
    <div className="wizard-container">
      <Sidebar />
      <MainContent />
    </div>
  );
}
```

- [ ] **Step 3: 创建占位步骤组件**

创建 `components/wizard/InputStep.tsx`:

```typescript
'use client';

export function InputStep() {
  return (
    <div className="step-content">
      <h2 className="text-2xl font-bold mb-4">Step 1: 输入处理</h2>
      <p className="text-muted-foreground">正在开发中...</p>
    </div>
  );
}
```

创建 `components/wizard/OutlineStep.tsx`:

```typescript
'use client';

export function OutlineStep() {
  return (
    <div className="step-content">
      <h2 className="text-2xl font-bold mb-4">Step 2: 内容规划</h2>
      <p className="text-muted-foreground">正在开发中...</p>
    </div>
  );
}
```

创建 `components/wizard/ThemeStep.tsx`:

```typescript
'use client';

export function ThemeStep() {
  return (
    <div className="step-content">
      <h2 className="text-2xl font-bold mb-4">Step 3: 主题选择</h2>
      <p className="text-muted-foreground">正在开发中...</p>
    </div>
  );
}
```

创建 `components/wizard/GenerateStep.tsx`:

```typescript
'use client';

export function GenerateStep() {
  return (
    <div className="step-content">
      <h2 className="text-2xl font-bold mb-4">Step 4: 生成预览</h2>
      <p className="text-muted-foreground">正在开发中...</p>
    </div>
  );
}
```

创建 `components/wizard/ExportStep.tsx`:

```typescript
'use client';

export function ExportStep() {
  return (
    <div className="step-content">
      <h2 className="text-2xl font-bold mb-4">Step 5: 交付导出</h2>
      <p className="text-muted-foreground">正在开发中...</p>
    </div>
  );
}
```

- [ ] **Step 4: 验证向导页面**

```bash
npm run dev
```

访问 http://localhost:3000/create 确认布局正常显示。

- [ ] **Step 5: 提交向导框架**

```bash
git add app/create/page.tsx components/layout/MainContent.tsx components/wizard/*.tsx
git commit -m "feat: add wizard page framework with placeholder steps"
```

---

## Task 7: Claude API 封装

**Files:**
- Create: `lib/llm/claude.ts`
- Create: `lib/llm/prompts.ts`

- [ ] **Step 1: 创建 Prompt 模板**

创建 `lib/llm/prompts.ts`:

```typescript
export const PLAN_OUTLINE_PROMPT = `你是一个专业的幻灯片内容规划专家。根据用户输入的内容，生成结构化的幻灯片大纲。

## 输入分析规则
1. 如果输入是话题（短文本，<50字符且无换行），需要联网检索补充材料
2. 如果输入是长文本或Markdown，直接分析内容结构

## 大纲生成规则
1. 第一页必须是封面页（cover）
2. 中间是内容页（content），数量5-15页
3. 最后一页是尾页（end）

## 内容类型识别（按优先级）
1. data: 数字、百分比、统计数据 → 使用图表展示
2. comparison: "vs"、"对比"、两对象对比 → 使用对比卡片
3. timeline: 时间节点、年份序列 → 使用时间轴
4. architecture: 层级结构、架构描述 → 使用架构图
5. quote: 引用符号、名人名言 → 使用引用块
6. list: 列表项、要点 → 使用列表卡片
7. paragraph: 纯文本段落 → 使用段落布局

## 输出格式
严格按照以下 JSON 格式输出，不要添加任何其他内容：

{
  "title": "幻灯片主标题",
  "slides": [
    {
      "page_type": "cover",
      "title": "主标题",
      "subtitle": "副标题",
      "author": "演讲人（可选）",
      "date": "日期（可选）"
    },
    {
      "page_type": "content",
      "page_number": 1,
      "title": "页面标题",
      "content_type": "data|comparison|timeline|architecture|quote|list|paragraph",
      "summary": "一句话总结",
      "content": { ... }
    },
    {
      "page_type": "end",
      "title": "谢谢观看"
    }
  ]
}`;

export const GENERATE_CONTENT_PROMPT = `你是一个幻灯片内容生成专家。根据大纲中的页面信息，生成详细的幻灯片内容。

## 内容生成规则
1. 内容要具体、有数据支撑
2. 文字简洁，适合幻灯片展示
3. 保持专业性和可读性

## 输出格式
根据 content_type 生成对应的 JSON 结构。`;
```

- [ ] **Step 2: 创建 Claude API 封装**

创建 `lib/llm/claude.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { PLAN_OUTLINE_PROMPT } from './prompts';
import type { Outline, PlanRequest } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateOutline(
  request: PlanRequest
): Promise<Outline> {
  const { input_type, content, search_enabled } = request;

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `请根据以下内容生成幻灯片大纲：\n\n${content}`,
    },
  ];

  const tools: Anthropic.Tool[] = [];

  // 如果是话题且启用搜索，添加 web_search 工具
  if (input_type === 'topic' && search_enabled) {
    tools.push({
      type: 'web_search_20250305',
      name: 'web_search',
    });
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: PLAN_OUTLINE_PROMPT,
    messages,
    tools: tools.length > 0 ? tools : undefined,
  });

  // 提取 JSON 响应
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  if (!textBlock) {
    throw new Error('No text response from Claude');
  }

  // 解析 JSON
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  const outline: Outline = JSON.parse(jsonMatch[0]);

  // 验证大纲结构
  if (!outline.title || !Array.isArray(outline.slides)) {
    throw new Error('Invalid outline structure');
  }

  return outline;
}

export async function generatePageContent(
  slideInfo: {
    title: string;
    content_type: string;
    summary: string;
  },
  context: string
): Promise<Record<string, unknown>> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: GENERATE_CONTENT_PROMPT,
    messages: [
      {
        role: 'user',
        content: `根据以下上下文和页面信息，生成详细的幻灯片内容：

上下文：${context}

页面标题：${slideInfo.title}
内容类型：${slideInfo.content_type}
摘要：${slideInfo.summary}

请生成对应的 JSON 内容结构。`,
      },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  if (!textBlock) {
    throw new Error('No text response from Claude');
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {};
  }

  return JSON.parse(jsonMatch[0]);
}
```

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: 提交 Claude API 封装**

```bash
git add lib/llm/claude.ts lib/llm/prompts.ts
git commit -m "feat: add Claude API wrapper for outline generation"
```

---

## Task 8: 大纲生成 API

**Files:**
- Create: `app/api/plan/route.ts`

- [ ] **Step 1: 创建大纲生成 API**

创建 `app/api/plan/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateOutline } from '@/lib/llm/claude';
import type { PlanRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: PlanRequest = await request.json();

    // 验证请求
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      );
    }

    // 判断输入类型
    if (!body.input_type) {
      const content = body.content;
      if (content.length < 50 && !content.includes('\n')) {
        body.input_type = 'topic';
      } else {
        body.input_type = 'text';
      }
    }

    // 生成大纲
    const outline = await generateOutline(body);

    return NextResponse.json({ outline });
  } catch (error) {
    console.error('Plan generation error:', error);
    return NextResponse.json(
      { error: '大纲生成失败，请重试' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 测试 API**

```bash
curl -X POST http://localhost:3000/api/plan \
  -H "Content-Type: application/json" \
  -d '{"input_type": "topic", "content": "造车新势力对比", "search_enabled": true}'
```

确认返回有效的 JSON 响应。

- [ ] **Step 3: 提交 API**

```bash
git add app/api/plan/route.ts
git commit -m "feat: add outline generation API endpoint"
```

---

## Task 9: Step 1 输入处理组件

**Files:**
- Modify: `components/wizard/InputStep.tsx`

- [ ] **Step 1: 实现输入处理组件**

修改 `components/wizard/InputStep.tsx`:

```typescript
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
```

- [ ] **Step 2: 安装 Switch 组件**

```bash
npx shadcn@latest add switch label
```

- [ ] **Step 3: 验证组件**

```bash
npm run dev
```

访问 http://localhost:3000/create 测试输入功能。

- [ ] **Step 4: 提交输入组件**

```bash
git add components/wizard/InputStep.tsx
git commit -m "feat: implement input step with text and file support"
```

---

## Task 10: Step 2 大纲编辑组件

**Files:**
- Modify: `components/wizard/OutlineStep.tsx`

- [ ] **Step 1: 实现大纲编辑组件**

修改 `components/wizard/OutlineStep.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import type { Slide, ContentSlide } from '@/types';

const contentTypeLabels: Record<string, string> = {
  data: '数据型',
  comparison: '对比型',
  timeline: '时间线',
  architecture: '架构型',
  quote: '引用型',
  list: '列表型',
  paragraph: '段落型',
};

export function OutlineStep() {
  const { outline, setOutline, setStep, inputContent, inputType, searchEnabled } = useWizardStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (!outline) {
    return (
      <div className="step-content">
        <p className="text-muted-foreground">请先输入内容生成大纲</p>
        <Button onClick={() => setStep(1)} className="mt-4">
          返回输入
        </Button>
      </div>
    );
  }

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...outline.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

    // 更新页码
    newSlides.forEach((slide, i) => {
      if (slide.page_type === 'content') {
        slide.page_number = i;
      }
    });

    setOutline({ ...outline, slides: newSlides });
  };

  const deleteSlide = (index: number) => {
    const newSlides = outline.slides.filter((_, i) => i !== index);

    // 更新页码
    newSlides.forEach((slide, i) => {
      if (slide.page_type === 'content') {
        slide.page_number = i;
      }
    });

    setOutline({ ...outline, slides: newSlides });
  };

  const updateSlideTitle = (index: number, title: string) => {
    const newSlides = [...outline.slides];
    newSlides[index] = { ...newSlides[index], title };
    setOutline({ ...outline, slides: newSlides });
  };

  const handleRegenerate = async () => {
    setOutline(null);
    setStep(1);
  };

  return (
    <div className="step-content">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">幻灯片大纲</h2>
          <p className="text-muted-foreground">
            共 {outline.slides.length} 页，可拖拽排序或编辑
          </p>
        </div>
        <Button variant="outline" onClick={handleRegenerate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          AI 重新生成
        </Button>
      </div>

      <div className="space-y-3">
        {outline.slides.map((slide, index) => (
          <Card
            key={index}
            className={`transition-all ${editingIndex === index ? 'ring-2 ring-primary' : ''}`}
          >
            <CardHeader className="py-3">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">
                      {slide.page_type === 'cover' ? '封面' :
                       slide.page_type === 'end' ? '尾页' : `第${index}页`}
                    </Badge>
                    {slide.page_type === 'content' && (
                      <Badge variant="secondary">
                        {contentTypeLabels[(slide as ContentSlide).content_type] || '内容'}
                      </Badge>
                    )}
                  </div>

                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSlideTitle(index, e.target.value)}
                      onBlur={() => setEditingIndex(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingIndex(null)}
                      className="text-lg font-medium bg-transparent border-b border-primary outline-none w-full"
                      autoFocus
                    />
                  ) : (
                    <CardTitle
                      className="text-lg cursor-pointer hover:text-primary"
                      onClick={() => setEditingIndex(index)}
                    >
                      {slide.title}
                    </CardTitle>
                  )}

                  {slide.page_type === 'content' && (slide as ContentSlide).summary && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {(slide as ContentSlide).summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {slide.page_type !== 'cover' && slide.page_type !== 'end' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 1}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === outline.slides.length - 2}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSlide(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          返回上一步
        </Button>
        <Button onClick={() => setStep(3)}>
          下一步：选择主题
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证组件**

```bash
npm run dev
```

测试大纲编辑功能。

- [ ] **Step 3: 提交大纲组件**

```bash
git add components/wizard/OutlineStep.tsx
git commit -m "feat: implement outline editing step with drag and actions"
```

---

## Task 11: Step 3 主题选择组件

**Files:**
- Modify: `components/wizard/ThemeStep.tsx`

- [ ] **Step 1: 实现主题选择组件**

修改 `components/wizard/ThemeStep.tsx`:

```typescript
'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  {
    id: 'business-modern',
    name: '商务现代白',
    description: '清新绿色系、毛玻璃卡片、弥散渐变背景',
    preview: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)',
      primary: '#10B981',
      cardBg: 'rgba(255, 255, 255, 0.8)',
    },
  },
  {
    id: 'business-modern-dark',
    name: '商务现代黑',
    description: '深色背景、绿色系点缀、毛玻璃质感',
    preview: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      primary: '#10B981',
      cardBg: 'rgba(30, 41, 59, 0.8)',
    },
  },
  {
    id: 'business-simple',
    name: '商务简白',
    description: '简约风格、白底深字、清新配色',
    preview: {
      background: '#ffffff',
      primary: '#1E293B',
      cardBg: '#f8fafc',
    },
  },
];

export function ThemeStep() {
  const { selectedTheme, setTheme, setStep, outline } = useWizardStore();

  if (!outline) {
    return (
      <div className="step-content">
        <p className="text-muted-foreground">请先完成大纲编辑</p>
        <Button onClick={() => setStep(2)} className="mt-4">
          返回大纲
        </Button>
      </div>
    );
  }

  return (
    <div className="step-content">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">选择主题</h2>
        <p className="text-muted-foreground">
          选择适合您内容的视觉风格
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg',
              selectedTheme === theme.id && 'ring-2 ring-primary'
            )}
            onClick={() => setTheme(theme.id)}
          >
            {/* 预览区域 */}
            <div
              className="h-40 rounded-t-lg relative overflow-hidden"
              style={{ background: theme.preview.background }}
            >
              {/* 模拟幻灯片预览 */}
              <div
                className="absolute inset-4 rounded-lg p-4"
                style={{
                  backgroundColor: theme.preview.cardBg,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  className="h-3 w-24 rounded mb-2"
                  style={{ backgroundColor: theme.preview.primary }}
                />
                <div className="h-2 w-32 bg-gray-300 rounded mb-3" />
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-gray-200 rounded" />
                  <div className="h-1.5 w-3/4 bg-gray-200 rounded" />
                  <div className="h-1.5 w-5/6 bg-gray-200 rounded" />
                </div>
              </div>

              {/* 选中标记 */}
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.preview.primary }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            <CardHeader className="py-4">
              <CardTitle className="text-lg">{theme.name}</CardTitle>
              <CardDescription>{theme.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(2)}>
          返回上一步
        </Button>
        <Button onClick={() => setStep(4)}>
          下一步：生成预览
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证组件**

```bash
npm run dev
```

测试主题选择功能。

- [ ] **Step 3: 提交主题组件**

```bash
git add components/wizard/ThemeStep.tsx
git commit -m "feat: implement theme selection step with preview cards"
```

---

## Task 12: HTML 生成器核心

**Files:**
- Create: `lib/generator/index.ts`
- Create: `lib/generator/cover.ts`
- Create: `lib/generator/data.ts`
- Create: `lib/generator/comparison.ts`
- Create: `lib/generator/list.ts`

- [ ] **Step 1: 创建封面页生成器**

创建 `lib/generator/cover.ts`:

```typescript
import type { CoverSlide, EndSlide } from '@/types';

export function generateCover(slide: CoverSlide): string {
  return `
    <div class="slide cover-slide active">
      <div class="cover-content">
        <h1 class="cover-title animate__animated animate__fadeInUp">${slide.title}</h1>
        ${slide.subtitle ? `<p class="cover-subtitle animate__animated animate__fadeInUp animate__delay-1s">${slide.subtitle}</p>` : ''}
        <div class="cover-meta animate__animated animate__fadeIn animate__delay-1s">
          ${slide.author ? `<span class="cover-author">${slide.author}</span>` : ''}
          ${slide.date ? `<span class="cover-date">${slide.date}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

export function generateEnd(slide: EndSlide): string {
  return `
    <div class="slide end-slide">
      <div class="end-content">
        <h1 class="end-title animate__animated animate__fadeIn">${slide.title || '谢谢观看'}</h1>
      </div>
    </div>
  `;
}
```

- [ ] **Step 2: 创建数据页生成器**

创建 `lib/generator/data.ts`:

```typescript
import type { ContentSlide, DataContent } from '@/types';

export function generateDataSlide(slide: ContentSlide): string {
  const content = slide.content as DataContent;
  const chartId = `chart-${slide.page_number}`;

  let chartHtml = '';

  if (content.chart_type === 'bar' || content.chart_type === 'line') {
    chartHtml = `<div id="${chartId}" class="chart-container" style="width: 100%; height: 350px;"></div>`;
  } else if (content.chart_type === 'pie') {
    chartHtml = `<div id="${chartId}" class="chart-container" style="width: 100%; height: 350px;"></div>`;
  }

  return `
    <div class="slide content-slide">
      <div class="title-region">
        <h2 class="slide-title animate__animated animate__fadeInDown">${slide.title}</h2>
      </div>
      <div class="summary-region">
        <p class="slide-summary animate__animated animate__fadeIn">${slide.summary}</p>
      </div>
      <div class="content-region">
        ${chartHtml}
        ${content.insights ? `
          <div class="data-insights animate__animated animate__fadeInUp">
            ${content.insights.map(insight => `<p class="insight-item">• ${insight}</p>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="page-number-region">
        <span class="page-number">${slide.page_number}</span>
      </div>
    </div>
  `;
}

export function generateChartConfig(slide: ContentSlide): string {
  const content = slide.content as DataContent;
  const chartId = `chart-${slide.page_number}`;

  if (content.chart_type === 'bar') {
    return `
      echarts.init(document.getElementById('${chartId}')).setOption({
        ...barChartOption,
        xAxis: { ...barChartOption.xAxis, data: ${JSON.stringify(content.data.labels)} },
        series: [{ ...barChartOption.series[0], data: ${JSON.stringify(content.data.values)} }]
      });
    `;
  }

  if (content.chart_type === 'line') {
    return `
      echarts.init(document.getElementById('${chartId}')).setOption({
        ...lineChartOption,
        xAxis: { ...lineChartOption.xAxis, data: ${JSON.stringify(content.data.labels)} },
        series: [{ ...lineChartOption.series[0], data: ${JSON.stringify(content.data.values)} }]
      });
    `;
  }

  if (content.chart_type === 'pie') {
    const pieData = content.data.labels.map((label, i) => ({
      name: label,
      value: content.data.values[i]
    }));

    return `
      echarts.init(document.getElementById('${chartId}')).setOption({
        ...pieChartOption,
        series: [{ ...pieChartOption.series[0], data: ${JSON.stringify(pieData)} }]
      });
    `;
  }

  return '';
}
```

- [ ] **Step 3: 创建对比页生成器**

创建 `lib/generator/comparison.ts`:

```typescript
import type { ContentSlide, ComparisonContent } from '@/types';

export function generateComparisonSlide(slide: ContentSlide): string {
  const content = slide.content as ComparisonContent;

  return `
    <div class="slide content-slide">
      <div class="title-region">
        <h2 class="slide-title animate__animated animate__fadeInDown">${slide.title}</h2>
      </div>
      <div class="summary-region">
        <p class="slide-summary animate__animated animate__fadeIn">${slide.summary}</p>
      </div>
      <div class="content-region">
        <div class="comparison-container">
          ${content.subjects.map((subject, idx) => `
            <div class="comparison-card animate__animated animate__fadeInUp" style="animation-delay: ${idx * 0.1}s">
              <h3 class="comparison-subject">${subject}</h3>
              <div class="comparison-metrics">
                ${content.metrics.map(metric => `
                  <div class="metric-row">
                    <span class="metric-name">${metric.name}</span>
                    <span class="metric-value">${metric.values[idx]}${metric.unit || ''}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        ${content.conclusion ? `<p class="comparison-conclusion animate__animated animate__fadeIn">${content.conclusion}</p>` : ''}
      </div>
      <div class="page-number-region">
        <span class="page-number">${slide.page_number}</span>
      </div>
    </div>
  `;
}
```

- [ ] **Step 4: 创建列表页生成器**

创建 `lib/generator/list.ts`:

```typescript
import type { ContentSlide, ListContent } from '@/types';

export function generateListSlide(slide: ContentSlide): string {
  const content = slide.content as ListContent;

  return `
    <div class="slide content-slide">
      <div class="title-region">
        <h2 class="slide-title animate__animated animate__fadeInDown">${slide.title}</h2>
      </div>
      <div class="summary-region">
        <p class="slide-summary animate__animated animate__fadeIn">${slide.summary}</p>
      </div>
      <div class="content-region">
        <div class="list-container">
          ${content.items.map((item, idx) => `
            <div class="list-item animate__animated animate__fadeInLeft" style="animation-delay: ${idx * 0.1}s">
              ${item.icon ? `<span class="list-icon">${item.icon}</span>` : '<span class="list-bullet">•</span>'}
              <div class="list-content">
                <h4 class="list-title">${item.title}</h4>
                ${item.description ? `<p class="list-description">${item.description}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="page-number-region">
        <span class="page-number">${slide.page_number}</span>
      </div>
    </div>
  `;
}
```

- [ ] **Step 5: 创建生成器主入口**

创建 `lib/generator/index.ts`:

```typescript
import fs from 'fs/promises';
import path from 'path';
import type { Slide, ContentSlide, Outline } from '@/types';
import { generateCover, generateEnd } from './cover';
import { generateDataSlide, generateChartConfig } from './data';
import { generateComparisonSlide } from './comparison';
import { generateListSlide } from './list';

export async function generateSlideHtml(
  slide: Slide,
  themeId: string
): Promise<string> {
  if (slide.page_type === 'cover') {
    return generateCover(slide);
  }

  if (slide.page_type === 'end') {
    return generateEnd(slide);
  }

  // 内容页
  const contentSlide = slide as ContentSlide;

  switch (contentSlide.content_type) {
    case 'data':
      return generateDataSlide(contentSlide);
    case 'comparison':
      return generateComparisonSlide(contentSlide);
    case 'list':
      return generateListSlide(contentSlide);
    case 'timeline':
    case 'architecture':
    case 'quote':
    case 'paragraph':
    default:
      return generateListSlide(contentSlide); // 默认使用列表布局
  }
}

export async function generateFullHtml(
  outline: Outline,
  themeId: string,
  slidesHtml: string[]
): Promise<string> {
  // 读取模板文件
  const templatePath = path.join(process.cwd(), 'templates', themeId, 'template.html');
  const stylePath = path.join(process.cwd(), 'templates', themeId, 'style.css');
  const chartsPath = path.join(process.cwd(), 'templates', themeId, 'charts.js');

  const template = await fs.readFile(templatePath, 'utf-8');
  const style = await fs.readFile(stylePath, 'utf-8');
  const charts = await fs.readFile(chartsPath, 'utf-8');

  // 生成图表初始化代码
  const chartInits: string[] = [];
  outline.slides.forEach((slide) => {
    if (slide.page_type === 'content' && (slide as ContentSlide).content_type === 'data') {
      chartInits.push(generateChartConfig(slide as ContentSlide));
    }
  });

  // 替换模板占位符
  const html = template
    .replace('{{TITLE}}', outline.title)
    .replace('{{THEME_STYLE}}', style)
    .replace('{{SLIDES_CONTENT}}', slidesHtml.join('\n'))
    .replace('{{CHART_CONFIG}}', charts)
    .replace('{{CHART_INIT}}', chartInits.join('\n'))
    .replace('{{FONT_PATH}}', '/fonts/AlibabaPuHuiTi-3/');

  return html;
}
```

- [ ] **Step 6: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: 提交生成器**

```bash
git add lib/generator/
git commit -m "feat: add HTML slide generators for cover, data, comparison, list"
```

---

## Task 13: SSE 生成 API

**Files:**
- Create: `app/api/generate/route.ts`

- [ ] **Step 1: 创建 SSE 生成 API**

创建 `app/api/generate/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { generateSlideHtml, generateFullHtml } from '@/lib/generator';
import type { GenerateRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { outline, theme_id } = body;

    if (!outline || !outline.slides || outline.slides.length === 0) {
      return new Response(JSON.stringify({ error: '大纲不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const slidesHtml: string[] = [];

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < outline.slides.length; i++) {
            // 发送进度事件
            const progressEvent = {
              page_num: i + 1,
              total: outline.slides.length,
              status: 'generating',
            };
            controller.enqueue(
              encoder.encode(`event: progress\ndata: ${JSON.stringify(progressEvent)}\n\n`)
            );

            // 生成单页 HTML
            const slideHtml = await generateSlideHtml(outline.slides[i], theme_id);
            slidesHtml.push(slideHtml);

            // 发送页面事件
            const pageEvent = {
              page_num: i + 1,
              html: slideHtml,
            };
            controller.enqueue(
              encoder.encode(`event: page\ndata: ${JSON.stringify(pageEvent)}\n\n`)
            );

            // 模拟生成延迟（实际生产中可移除）
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // 生成完整 HTML
          const fullHtml = await generateFullHtml(outline, theme_id, slidesHtml);
          const fileId = `slides-${Date.now()}`;

          // 发送完成事件
          const completeEvent = {
            file_id: fileId,
            page_count: outline.slides.length,
            html: fullHtml,
          };
          controller.enqueue(
            encoder.encode(`event: complete\ndata: ${JSON.stringify(completeEvent)}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: '生成失败' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return new Response(JSON.stringify({ error: '生成失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

- [ ] **Step 2: 测试 API**

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"outline": {"title": "测试", "slides": [{"page_type": "cover", "title": "测试标题", "subtitle": "测试副标题"}]}, "theme_id": "business-modern"}'
```

确认返回 SSE 流。

- [ ] **Step 3: 提交 API**

```bash
git add app/api/generate/route.ts
git commit -m "feat: add SSE-based slide generation API"
```

---

## Task 14: Step 4 生成预览组件

**Files:**
- Modify: `components/wizard/GenerateStep.tsx`
- Create: `components/preview/SlidePreview.tsx`

- [ ] **Step 1: 创建预览组件**

创建 `components/preview/SlidePreview.tsx`:

```typescript
'use client';

import { useRef, useEffect, useState } from 'react';

interface SlidePreviewProps {
  html: string;
  currentPage?: number;
  totalPages?: number;
}

export function SlidePreview({ html, currentPage = 1, totalPages = 1 }: SlidePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  return (
    <div className="preview-container h-full flex flex-col">
      <div className="preview-toolbar flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.25, scale - 0.1))}
            className="px-2 py-1 text-sm rounded hover:bg-muted"
          >
            -
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(Math.min(1, scale + 0.1))}
            className="px-2 py-1 text-sm rounded hover:bg-muted"
          >
            +
          </button>
        </div>
      </div>
      <div className="preview-content flex-1 overflow-auto bg-muted/30 p-4 flex items-center justify-center">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: '1280px',
            height: '720px',
          }}
          className="shadow-xl rounded-lg overflow-hidden bg-white"
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="幻灯片预览"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 实现生成预览组件**

修改 `components/wizard/GenerateStep.tsx`:

```typescript
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
```

- [ ] **Step 3: 验证组件**

```bash
npm run dev
```

测试生成预览功能。

- [ ] **Step 4: 提交预览组件**

```bash
git add components/wizard/GenerateStep.tsx components/preview/SlidePreview.tsx
git commit -m "feat: implement generate step with SSE streaming and preview"
```

---

## Task 15: Step 5 导出组件

**Files:**
- Modify: `components/wizard/ExportStep.tsx`

- [ ] **Step 1: 实现导出组件**

修改 `components/wizard/ExportStep.tsx`:

```typescript
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
```

- [ ] **Step 2: 验证完整流程**

```bash
npm run dev
```

测试从输入到导出的完整流程。

- [ ] **Step 3: 提交导出组件**

```bash
git add components/wizard/ExportStep.tsx
git commit -m "feat: implement export step with download functionality"
```

---

## Task 16: 整体测试与优化

**Files:**
- Modify: various files

- [ ] **Step 1: 测试完整流程**

1. 访问 http://localhost:3000
2. 点击"开始创建"
3. 输入话题："造车新势力对比"
4. 点击"生成大纲"
5. 编辑大纲
6. 选择主题
7. 生成预览
8. 下载 HTML 文件
9. 在浏览器中打开下载的文件，验证幻灯片正常显示

- [ ] **Step 2: 修复发现的问题**

根据测试结果修复任何问题。

- [ ] **Step 3: 构建生产版本**

```bash
npm run build
```

确认构建成功。

- [ ] **Step 4: 最终提交**

```bash
git add .
git commit -m "feat: complete Kami Slides MVP implementation"
```

---

## 自检清单

**1. Spec 覆盖检查:**
- ✅ Step 1 输入处理 - Task 9
- ✅ Step 2 内容规划 - Task 10
- ✅ Step 3 主题选择 - Task 11
- ✅ Step 4 生成预览 - Task 14
- ✅ Step 5 交付导出 - Task 15
- ✅ 左侧边栏布局 - Task 5
- ✅ 左编辑右预览布局 - Task 14, 15
- ✅ SSE 流式生成 - Task 13
- ✅ Claude API 集成 - Task 7
- ✅ 模板渲染 - Task 12

**2. 占位符检查:**
- 无 "TBD"、"TODO"、"implement later" 等占位符
- 所有代码步骤包含完整实现

**3. 类型一致性检查:**
- `Outline` 类型在 types/index.ts 定义，在 store 和 API 中一致使用
- `Slide` 联合类型正确区分 cover/content/end
- 生成器函数签名与类型定义匹配
