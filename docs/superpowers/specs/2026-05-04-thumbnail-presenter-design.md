# 缩略图导航与演示模式设计文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 版本 | 1.0.0 |
| 创建日期 | 2026-05-04 |
| 状态 | 待审批 |

---

## 1. 概述

### 1.1 目标

为河狸师兄添加两个核心功能：
1. **缩略图导航** — 左侧垂直缩略图列表，支持快速跳转
2. **演示模式** — 全屏演示 + 控制栏 + 键盘导航

同时引入**双模式架构**：
- **模板模式** — 现有逻辑，面向一般用户
- **高级模式** — OpenSlide 架构，面向设计师/开发者

### 1.2 功能范围

| 功能 | 模板模式 | 高级模式 |
|------|----------|----------|
| 缩略图导航 | ✅ | ✅ |
| 演示模式 | ✅ | ✅ |
| 控制栏 | ✅ | ✅ |
| 计时器 | ✅ | ✅ |
| 黑屏/白屏 | ✅ | ✅ |
| 缩略图网格 | ✅ | ✅ |
| 激光笔 | ✅ | ✅ |
| 可视化检查器 | ❌ | ✅ |
| 自定义主题 | ❌ | ✅ |
| React 组件生成 | ❌ | ✅ |

---

## 2. 整体架构

### 2.1 目录结构

```
components/
├── preview/                      # 预览组件（两种模式共用）
│   ├── index.ts                  # 导出
│   ├── PreviewLayout.tsx         # 预览布局容器
│   ├── ThumbnailRail.tsx         # 缩略图导航栏
│   ├── SlideCanvas.tsx           # 幻灯片画布
│   └── presenter/                # 演示模式
│       ├── PresenterMode.tsx     # 演示模式入口
│       ├── ControlBar.tsx        # 底部控制栏
│       ├── ProgressBar.tsx       # 顶部进度条
│       ├── OverviewGrid.tsx      # 缩略图网格弹窗
│       └── LaserPointer.tsx      # 激光笔效果
│
├── advanced/                     # 高级模式专属
│   ├── InspectorOverlay.tsx      # 可视化检查器覆盖层
│   ├── InspectorPanel.tsx        # 检查器面板
│   ├── CommentWidget.tsx         # 评论组件
│   ├── DesignPanel.tsx           # 设计面板
│   └── AestheticSelect.tsx       # 美学方向选择
│
├── wizard/
│   ├── ModeSelectStep.tsx        # 新增：Step 0 模式选择
│   ├── InputStep.tsx             # Step 1（共用）
│   ├── OutlineStep.tsx           # Step 2（共用）
│   ├── ThemeStep.tsx             # Step 3（根据模式显示不同选项）
│   ├── GenerateStep.tsx          # Step 4（根据模式使用不同逻辑）
│   └── ExportStep.tsx            # Step 5（共用）
│
└── themes/                       # 高级模式主题
    ├── neon-terminal.tsx         # Neon Terminal 主题
    ├── paper-press.tsx           # Paper Press 主题
    └── editorial-noir.tsx        # Editorial Noir 主题
```

### 2.2 用户流程

```
Step 0: 选择模式
    ├── 模板模式 → Step 1-5（现有流程）
    └── 高级模式 → Step 1-5（增强流程）
    
高级模式 Step 3 增强：
    → AI 询问 4 个问题（美学方向、页面数量、文字密度、动画程度）
    → 选择 OpenSlide 主题（3 个）
    
高级模式 Step 4 增强：
    → AI 生成 React 组件代码
    → 实时预览 + 可视化检查器
```

---

## 3. Store 扩展

### 3.1 新增字段

```typescript
interface WizardState {
  // ... 现有字段
  
  // 工作模式
  workMode: 'template' | 'advanced';
  
  // 预览/演示状态
  currentSlideIndex: number;
  isPresenterMode: boolean;
  
  // 高级模式专属
  aesthetic: string | null;           // 美学方向
  pageCount: number | null;           // 目标页面数量
  textDensity: 'minimal' | 'light' | 'standard' | 'dense' | null;
  motionLevel: 'static' | 'subtle' | 'rich' | null;
  generatedComponents: string | null; // React 组件代码
  design: DesignSystem | null;        // 设计系统
  
  // 页面数据（两种模式共用）
  slidePages: string[];               // 各页面 HTML/组件
}
```

### 3.2 新增 Actions

```typescript
setWorkMode: (mode: 'template' | 'advanced') => void;
setCurrentSlideIndex: (index: number) => void;
setPresenterMode: (mode: boolean) => void;
setAesthetic: (aesthetic: string) => void;
setPageCount: (count: number) => void;
setTextDensity: (density: TextDensity) => void;
setMotionLevel: (level: MotionLevel) => void;
setGeneratedComponents: (code: string) => void;
setDesign: (design: DesignSystem) => void;
setSlidePages: (pages: string[]) => void;
appendSlidePage: (html: string) => void;
```

---

## 4. 核心组件设计

### 4.1 PreviewLayout.tsx

**职责**：预览布局容器，左侧缩略图 + 右侧画布

```typescript
interface PreviewLayoutProps {
  // 模板模式
  html?: string;
  slidePages?: string[];
  
  // 高级模式
  pages?: React.ComponentType[];
  design?: DesignSystem;
  
  // 共用
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  showPresenterButton?: boolean;
  onPresenterEnter?: () => void;
  
  // 模式标识
  workMode: 'template' | 'advanced';
}
```

**布局**：
```
┌──────────────────────────────────────────────────┐
│  ┌─────────┐  ┌────────────────────────────────┐ │
│  │ 缩略图  │  │                                │ │
│  │ 导航栏  │  │      SlideCanvas               │ │
│  │         │  │      (幻灯片画布)              │ │
│  │ 184px   │  │                                │ │
│  │         │  │                                │ │
│  └─────────┘  └────────────────────────────────┘ │
│  w-[200px]    flex-1                             │
└──────────────────────────────────────────────────┘
```

### 4.2 ThumbnailRail.tsx

**职责**：垂直缩略图导航

```typescript
interface ThumbnailRailProps {
  // 模板模式：HTML 字符串
  pages?: string[];
  
  // 高级模式：React 组件
  pageComponents?: React.ComponentType[];
  design?: DesignSystem;
  
  current: number;
  onSelect: (index: number) => void;
}
```

**关键实现**：
- 缩略图宽度：184px
- 缩放比例：184 / 1920
- 当前页高亮（边框 + 左侧指示条）
- 自动滚动到当前页

### 4.3 SlideCanvas.tsx

**职责**：幻灯片画布，自动缩放适配

```typescript
interface SlideCanvasProps {
  // 模板模式
  html?: string;
  
  // 高级模式
  children?: React.ReactNode;
  design?: DesignSystem;
  
  // 可选
  scale?: number;
  freezeMotion?: boolean;
}
```

**关键实现**：
- 固定画布：1920×1080
- ResizeObserver 自动计算 fitScale
- `transform: scale(fitScale)` 缩放适配

---

## 5. 演示模式组件设计

### 5.1 PresenterMode.tsx

**职责**：全屏演示模式入口

```typescript
interface PresenterModeProps {
  // 模板模式
  pages?: string[];
  
  // 高级模式
  pageComponents?: React.ComponentType[];
  design?: DesignSystem;
  
  initialIndex?: number;
  onExit: () => void;
  workMode: 'template' | 'advanced';
}
```

**内部状态**：
- `index` — 当前页码
- `blackout` — 黑屏/白屏状态
- `laser` — 激光笔开关
- `overview` — 缩略图网格开关
- `startedAt` — 开始时间戳

**生命周期**：
- 挂载时自动进入全屏
- 卸载时退出全屏
- 监听 fullscreenchange 事件

### 5.2 ControlBar.tsx

**职责**：底部控制栏

```typescript
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
```

**布局**：
```
┌─────────────────────────────────────────────────────────────┐
│  ◀  ▶  │  01 / 10  │  00:00  │  ⊞  ■  ☀  ⊙  ?  ✕  │
│  导航  │   页码    │  计时器  │  网格 黑 白 激光 帮助 退出 │
└─────────────────────────────────────────────────────────────┘
```

**交互**：
- 鼠标靠近底部 160px 区域时显示
- 2 秒无操作后隐藏
- 按任意键或移动鼠标重新显示

### 5.3 OverviewGrid.tsx

**职责**：缩略图网格弹窗

```typescript
interface OverviewGridProps {
  pages: string[] | React.ComponentType[];
  current: number;
  open: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
  workMode: 'template' | 'advanced';
  design?: DesignSystem;
}
```

**交互**：
- 按 O 键或点击控制栏网格按钮打开
- 点击缩略图跳转并关闭
- 按 ESC 或 Enter 关闭
- 方向键移动焦点

### 5.4 LaserPointer.tsx

**职责**：激光笔效果

```typescript
interface LaserPointerProps {
  enabled: boolean;
}
```

**实现**：
- 监听 mousemove 事件
- 渲染红色圆点，跟随鼠标
- `pointer-events: none` 避免阻挡点击

---

## 6. 模式选择设计

### 6.1 ModeSelectStep.tsx

**界面**：
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│              🎨 选择工作模式                                      │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │                         │  │                         │       │
│  │   📊 模板模式           │  │   🎯 高级模式           │       │
│  │   (推荐)                │  │                         │       │
│  │                         │  │                         │       │
│  │   快速生成，专业效果     │  │   完全自定义，无限创意   │       │
│  │   适合商务汇报           │  │   适合设计师/开发者     │       │
│  │                         │  │                         │       │
│  │   • 4 个精选主题         │  │   • React 组件生成      │       │
│  │   • 标准布局模板         │  │   • 自定义动画          │       │
│  │   • 分钟级完成           │  │   • 可视化检查器        │       │
│  │                         │  │   • 3 个 OpenSlide 主题 │       │
│  │                         │  │                         │       │
│  │        [选择]           │  │        [选择]           │       │
│  │                         │  │                         │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 高级模式设计

### 7.1 主题系统

内置 3 个 OpenSlide 主题：

| 主题 | 风格 | 模式 |
|------|------|------|
| **Neon Terminal** | 黑色终端，霓虹绿，等宽字体，闪烁光标 | dark |
| **Paper Press** | 印纸风格，奶油色背景，墨黑标题 | light |
| **Editorial Noir** | 深色杂志，衬线标题，琥珀点缀 | dark |

### 7.2 AI 生成流程

```
Step 3: 主题选择后
    ↓
AI 询问 4 个问题：
    1. 美学方向（3 个选项，针对话题定制）
    2. 页面数量（3-5 / 6-10 / 11-20）
    3. 文字密度（极简 / 轻量 / 标准 / 密集）
    4. 动画程度（静态 / 轻微 / 丰富）
    ↓
Step 4: AI 生成
    ↓
AI 编写 React 组件代码
    ↓
实时预览 + 可视化检查器
    ↓
用户可通过检查器添加评论
    ↓
AI 应用评论修改
```

### 7.3 可视化检查器

**功能**：
- 点击预览中的元素
- 添加 `@slide-comment` 标记
- AI 应用修改后移除标记

**组件**：
- `InspectorOverlay.tsx` — 覆盖层，捕获点击事件
- `InspectorPanel.tsx` — 右侧面板，显示元素信息和评论输入
- `CommentWidget.tsx` — 评论列表和输入组件

---

## 8. API 调整

### 8.1 /api/generate

```typescript
interface GenerateRequest {
  outline: Outline;
  work_mode: 'template' | 'advanced';
  
  // 模板模式
  theme_id?: string;
  
  // 高级模式
  theme?: 'neon-terminal' | 'paper-press' | 'editorial-noir';
  aesthetic?: string;
  page_count?: number;
  text_density?: 'minimal' | 'light' | 'standard' | 'dense';
  motion_level?: 'static' | 'subtle' | 'rich';
}

interface GenerateResponse {
  // 模板模式
  html?: string;
  
  // 高级模式
  components?: string;         // React 组件代码
  design?: DesignSystem;
}
```

### 8.2 SSE 事件扩展

```typescript
// 现有事件
{ type: 'page_complete', html: '...' }

// 新增：高级模式事件
{ type: 'component_complete', code: '...' }  // React 组件代码
{ type: 'design_complete', design: {...} }   // 设计系统
```

---

## 9. 导出 HTML 增强

### 9.1 内置演示功能

导出的 HTML 文件内置：
- 自动缩放适配
- 键盘导航（方向键、空格、Home/End）
- 页码显示
- 全屏按钮
- 控制栏（可选显示）

### 9.2 控制栏嵌入

```html
<!-- 在导出的 HTML 中嵌入 -->
<div class="os-control-bar" style="position:fixed;bottom:12px;left:50%;transform:translateX(-50%)">
  <span id="os-page">1</span> / <span id="os-total">10</span>
  <button onclick="toggleFullscreen()">⛶</button>
</div>

<script>
// 键盘导航
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight' || e.key === ' ') goNext();
  if (e.key === 'ArrowLeft') goPrev();
  if (e.key === 'f' || e.key === 'F') toggleFullscreen();
});
</script>
```

---

## 10. 实现优先级

| 优先级 | 功能 | 工作量 |
|--------|------|--------|
| **P0** | Step 0 模式选择 | 0.5 天 |
| **P0** | 缩略图导航（模板模式） | 1 天 |
| **P0** | 演示模式（模板模式） | 1.5 天 |
| **P1** | 高级模式 AI 生成流程 | 2 天 |
| **P1** | 高级模式主题移植 | 1 天 |
| **P1** | 可视化检查器 | 1.5 天 |
| **P2** | 导出 HTML 演示功能增强 | 0.5 天 |

**总计**：约 8 天

---

## 11. 验收标准

### 11.1 缩略图导航

- [ ] 左侧显示缩略图列表
- [ ] 点击缩略图切换页面
- [ ] 当前页高亮显示
- [ ] 自动滚动到当前页
- [ ] 支持键盘导航

### 11.2 演示模式

- [ ] 点击按钮进入全屏演示
- [ ] 键盘导航正常工作
- [ ] 控制栏显示页码和计时器
- [ ] 黑屏/白屏功能正常
- [ ] 缩略图网格功能正常
- [ ] 激光笔功能正常
- [ ] ESC 退出演示

### 11.3 模式选择

- [ ] Step 0 显示模式选择界面
- [ ] 模板模式流程正常
- [ ] 高级模式流程正常
- [ ] 模式选择后正确切换

### 11.4 高级模式

- [ ] AI 询问 4 个问题
- [ ] 3 个主题可选
- [ ] 生成 React 组件代码
- [ ] 可视化检查器工作
- [ ] 评论功能正常
