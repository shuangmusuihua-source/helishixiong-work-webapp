# Kami Slides Web 应用技术设计文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 产品名称 | Kami Slides |
| 版本 | 1.0.0 |
| 创建日期 | 2026-05-02 |
| 作者 | Claude |

---

## 1. 技术栈总览

| 层级 | 技术选型 |
|------|----------|
| 框架 | Next.js 14 (App Router) |
| 前端 | React 18 + TypeScript |
| UI 组件 | shadcn/ui + Tailwind CSS |
| 状态管理 | Zustand |
| LLM | Claude API (支持 web_search 工具) |
| 图表 | ECharts 5 |
| 动画 | Animate.css |
| 图标 | Lucide Icons |
| 字体 | 阿里巴巴普惠体 (本地部署) |

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           前端 (Next.js)                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  页面组件   │  │  向导组件   │  │  预览组件   │  │  状态管理   │    │
│  │  (React)    │  │  (5 Steps)  │  │  (iframe)   │  │  (Zustand)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  POST /api/plan │  │ POST /api/generate│  │ GET /api/export │
│  大纲生成       │  │ SSE 流式生成     │  │ 文件下载        │
└────────┬────────┘  └────────┬────────┘  └─────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Claude API                                       │
│  ┌─────────────────┐  ┌─────────────────┐                               │
│  │  内容规划       │  │  web_search     │  (联网检索)                   │
│  │  大纲生成       │  │  工具调用       │                               │
│  └─────────────────┘  └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 目录结构

```
kami-slides-webapp/
├── app/
│   ├── layout.tsx                 # 根布局
│   ├── page.tsx                   # 首页（入口）
│   ├── create/
│   │   └── page.tsx               # 创建向导页面
│   └── api/
│       ├── plan/
│       │   └── route.ts           # 大纲生成 API
│       ├── generate/
│       │   └── route.ts           # HTML 生成 API (SSE)
│       └── export/
│           └── route.ts           # 文件导出 API
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            # 左侧边栏（步骤导航）
│   │   └── MainContent.tsx        # 右侧主内容区
│   ├── wizard/
│   │   ├── InputStep.tsx          # Step 1: 输入处理
│   │   ├── OutlineStep.tsx        # Step 2: 内容规划
│   │   ├── ThemeStep.tsx          # Step 3: 主题选择
│   │   ├── GenerateStep.tsx       # Step 4: 生成预览
│   │   └── ExportStep.tsx         # Step 5: 交付导出
│   ├── preview/
│   │   ├── SlidePreview.tsx       # 幻灯片预览组件
│   │   └── PreviewToolbar.tsx     # 预览工具栏
│   └── ui/                        # shadcn/ui 组件
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
│
├── lib/
│   ├── generator/                 # HTML 生成器
│   │   ├── index.ts               # 主入口
│   │   ├── cover.ts               # 封面页生成
│   │   ├── data.ts                # 数据页生成
│   │   ├── comparison.ts          # 对比页生成
│   │   ├── timeline.ts            # 时间线页生成
│   │   ├── architecture.ts        # 架构页生成
│   │   ├── list.ts                # 列表页生成
│   │   ├── quote.ts               # 引用页生成
│   │   └── paragraph.ts           # 段落页生成
│   ├── llm/
│   │   ├── claude.ts              # Claude API 封装
│   │   └── prompts.ts             # Prompt 模板
│   └── utils/
│       └── index.ts               # 工具函数
│
├── public/
│   ├── templates/                 # 主题模板（已存在）
│   │   ├── business-modern/
│   │   ├── business-modern-dark/
│   │   └── business-simple/
│   └── fonts/
│       └── AlibabaPuHuiTi-3/      # 字体文件（已存在）
│
├── store/
│   └── useWizardStore.ts          # Zustand 状态管理
│
├── types/
│   └── index.ts                   # TypeScript 类型定义
│
└── styles/
    └── globals.css                # 全局样式
```

---

## 4. 核心数据流

```
用户输入
    │
    ▼
┌─────────────────┐
│  Step 1: 输入   │
│  - 判断输入类型  │
│  - 可选联网检索  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│  POST /api/plan │ ───▶ │  Claude API     │
│  请求体:        │      │  + web_search   │
│  {              │      │  (可选)         │
│   input_type,   │      └────────┬────────┘
│   content,      │               │
│   search_enabled│               ▼
│  }             │      ┌─────────────────┐
└────────┬────────┘      │  返回大纲 JSON  │
         │               │  { slides: [] } │
         ▼               └────────┬────────┘
┌─────────────────┐               │
│  Step 2: 大纲   │ ◀─────────────┘
│  - 展示大纲列表  │
│  - 用户可编辑    │
│  - 拖拽排序      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Step 3: 主题   │
│  - 3个主题选择   │
│  - 预览对比      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ POST /api/generate│ ──▶│  SSE 流式响应   │
│ 请求体:         │      │  event: page    │
│ {               │      │  data: {        │
│   outline,      │      │    page_num,    │
│   theme_id      │      │    html,        │
│ }               │      │    progress     │
└────────┬────────┘      │  }              │
         │               └────────┬────────┘
         ▼                        │
┌─────────────────┐               │
│  Step 4: 生成   │ ◀─────────────┘
│  - 实时进度条    │
│  - 逐页预览更新  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Step 5: 导出   │
│  - 下载 HTML    │
│  - 返回修改      │
└─────────────────┘
```

---

## 5. API 设计

### 5.1 POST /api/plan

**请求**
```json
{
  "input_type": "topic" | "text" | "file",
  "content": "造车新势力对比",
  "search_enabled": true
}
```

**响应**
```json
{
  "outline": {
    "title": "造车新势力对比",
    "slides": [
      {
        "page_type": "cover",
        "title": "造车新势力对比",
        "subtitle": "2024年度核心指标分析"
      },
      {
        "page_type": "content",
        "page_number": 1,
        "title": "市场格局",
        "content_type": "data",
        "summary": "造车新势力2024年销量排名",
        "content": { ... }
      }
    ]
  }
}
```

### 5.2 POST /api/generate (SSE)

**请求**
```json
{
  "outline": { ... },
  "theme_id": "business-modern"
}
```

**响应 (Server-Sent Events)**
```
event: progress
data: {"page_num": 1, "total": 8, "status": "generating"}

event: page
data: {"page_num": 1, "html": "<div class=\"slide\">...</div>"}

event: progress
data: {"page_num": 2, "total": 8, "status": "generating"}

event: page
data: {"page_num": 2, "html": "<div class=\"slide\">...</div>"}

...

event: complete
data: {"file_id": "abc123", "page_count": 8}
```

### 5.3 GET /api/export?file_id=abc123

**响应**
- Content-Type: `text/html`
- Content-Disposition: `attachment; filename="造车新势力对比-slides.html"`

---

## 6. 状态管理 (Zustand)

```typescript
interface WizardState {
  // 当前步骤
  currentStep: 1 | 2 | 3 | 4 | 5;

  // Step 1: 输入
  inputType: 'topic' | 'text' | 'file';
  inputContent: string;
  searchEnabled: boolean;

  // Step 2: 大纲
  outline: Outline | null;

  // Step 3: 主题
  selectedTheme: string;

  // Step 4: 生成
  generatedSlides: string[];
  generateProgress: number;

  // Step 5: 导出
  fileId: string | null;

  // Actions
  setStep: (step: number) => void;
  setInput: (type, content, search) => void;
  setOutline: (outline: Outline) => void;
  setTheme: (themeId: string) => void;
  addSlide: (html: string) => void;
  setProgress: (progress: number) => void;
}
```

---

## 7. 页面类型与生成器映射

| 页面类型 | 生成器文件 | 内容识别特征 |
|----------|-----------|--------------|
| cover | `cover.ts` | 固定为第一页 |
| data | `data.ts` | 数字、百分比、统计数据 |
| comparison | `comparison.ts` | "vs"、"对比"、两对象对比 |
| timeline | `timeline.ts` | 时间节点、年份序列 |
| architecture | `architecture.ts` | 层级结构、架构描述 |
| quote | `quote.ts` | 引用符号、名人名言 |
| list | `list.ts` | 列表项、要点 |
| paragraph | `paragraph.ts` | 纯文本段落 |
| end | `cover.ts` | 固定为最后一页 |

---

## 8. 关键实现细节

### 8.1 模板渲染流程

```typescript
// lib/generator/index.ts
async function generateSlide(slide, theme) {
  // 1. 读取主题模板
  const template = await fs.readFile(`templates/${theme}/template.html`);
  const style = await fs.readFile(`templates/${theme}/style.css`);
  const charts = await fs.readFile(`templates/${theme}/charts.js`);

  // 2. 根据页面类型生成内容
  const content = await generateContent(slide); // 调用具体生成器

  // 3. 替换模板占位符
  const html = template
    .replace('{{TITLE}}', slide.title)
    .replace('{{THEME_STYLE}}', style)
    .replace('{{SLIDES_CONTENT}}', content)
    .replace('{{CHART_CONFIG}}', charts)
    .replace('{{FONT_PATH}}', '/fonts/AlibabaPuHuiTi-3/');

  return html;
}
```

### 8.2 SSE 流式生成

```typescript
// app/api/generate/route.ts
export async function POST(req: Request) {
  const { outline, theme_id } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < outline.slides.length; i++) {
        // 发送进度
        controller.enqueue(encoder.encode(
          `event: progress\ndata: ${JSON.stringify({
            page_num: i + 1,
            total: outline.slides.length
          })}\n\n`
        ));

        // 生成单页
        const html = await generateSlide(outline.slides[i], theme_id);

        // 发送页面
        controller.enqueue(encoder.encode(
          `event: page\ndata: ${JSON.stringify({
            page_num: i + 1,
            html
          })}\n\n`
        ));
      }

      // 发送完成
      controller.enqueue(encoder.encode(
        `event: complete\ndata: ${JSON.stringify({
          file_id: generateFileId()
        })}\n\n`
      ));

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

---

## 9. UI 布局设计

### 9.1 向导页面布局

采用**左侧边栏 + 右侧内容区**布局：

- 左侧边栏：显示 5 个步骤列表，支持点击跳转
- 右侧内容区：当前步骤的表单/内容

### 9.2 预览布局

采用**左编辑右预览**布局：

- 左侧：大纲列表/编辑区
- 右侧：iframe 实时预览

---

## 10. 开发里程碑

| 阶段 | 内容 | 工期 |
|------|------|------|
| M1 | 项目搭建 + shadcn/ui 集成 + 基础布局 | 1 天 |
| M2 | Step 1 输入处理 + Step 2 大纲生成 (API + UI) | 2 天 |
| M3 | Step 3 主题选择 + 预览组件 | 1 天 |
| M4 | Step 4 生成预览 (SSE + 页面生成器) | 3 天 |
| M5 | Step 5 导出 + 整体联调优化 | 2 天 |
| **总计** | | **9 天** |

---

## 11. 设计决策记录

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 部署方式 | 全栈部署 (Next.js) | API Key 在后端环境变量，用户体验流畅 |
| 联网检索 | Claude 内置 web_search | 无需额外集成，依赖模型能力 |
| 向导布局 | 左侧边栏布局 | 可随时跳转任意步骤 |
| 预览布局 | 左编辑右预览 | 所见即所得，适合内容迭代 |
| 历史记录 | MVP 不实现 | 简化实现，后续迭代再加 |
| UI 组件库 | shadcn/ui | 可定制性强，与 Next.js 完美集成 |
| 生成进度 | SSE 流式生成 | 实时推送每页结果，用户体验最佳 |
