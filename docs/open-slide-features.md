# open-slide 完整功能清单

## 项目概述

**Open-Slide** 是一个 React/Vite 幻灯片框架，用户在 `slides/` 目录中编写 React 组件，提供完整的创作、预览和演示流程。

---

## 1. 文件结构

```
open-slide/
├── packages/
│   ├── core/                    # 主运行时和 CLI
│   │   ├── src/
│   │   │   ├── app/             # React 应用（UI、路由、组件）
│   │   │   ├── cli/             # CLI 命令（dev, build, preview, sync）
│   │   │   ├── vite/            # Vite 插件
│   │   │   └── locale/          # 国际化（en, zh-CN, zh-TW, ja）
│   │   └── skills/              # 内置 Claude Code skills
│   └── cli/                     # 脚手架 CLI
│       └── template/            # 项目模板
├── apps/
│   ├── demo/                    # 示例幻灯片
│   │   └── slides/              # 示例演示文稿
│   └── web/                     # 文档网站（Next.js）
```

---

## 2. 核心包 - `/packages/core/src/app/`

### 路由（3 个主要视图）

| 路由 | 组件 | 功能 |
|------|------|------|
| `/` | `Home` | 幻灯片浏览器，文件夹组织，搜索，拖拽 |
| `/s/:slideId` | `Slide` | 幻灯片编辑器/查看器，Inspector，Assets，Design Panel |
| `/s/:slideId/presenter` | `Presenter` | 双屏演示者视图，备注和控制 |

### 关键组件

#### 播放器和演示

| 组件 | 路径 | 功能 |
|------|------|------|
| `player.tsx` | `/components/player.tsx` | 全屏演示模式，键盘导航，触摸滑动，BroadcastChannel 同步 |
| `control-bar.tsx` | `/components/present/` | 导航控制，计时，黑屏/激光笔切换 |
| `overview-grid.tsx` | `/components/present/` | 所有幻灯片网格预览 |
| `laser-pointer.tsx` | `/components/present/` | 激光笔视觉效果 |
| `blackout-overlay.tsx` | `/components/present/` | 黑屏/白屏切换 |
| `help-overlay.tsx` | `/components/present/` | 键盘快捷键帮助 |
| `jump-input.tsx` | `/components/present/` | 输入页码跳转 |
| `progress-bar.tsx` | `/components/present/` | 进度指示器 |
| `use-presenter-channel.ts` | `/components/present/` | 演示窗口和投影窗口同步 |

#### 幻灯片编辑

| 组件 | 路径 | 功能 |
|------|------|------|
| `inspector-provider.tsx` | `/components/inspector/` | 点击选择元素编辑，undo/redo |
| `inspector-panel.tsx` | `/components/inspector/` | 样式/文本/属性编辑面板 |
| `comment-widget.tsx` | `/components/inspector/` | 添加备注/注释到元素 |
| `inspect-overlay.tsx` | `/components/inspector/` | 选中元素视觉覆盖层 |
| `save-bar.tsx` | `/components/inspector/` | 未保存更改指示器 |

#### 设计系统

| 组件 | 路径 | 功能 |
|------|------|------|
| `style-panel.tsx` | `/components/style-panel/` | 可视化设计令牌编辑器 |
| `design-provider.tsx` | `/components/style-panel/` | 设计状态管理 |
| `design.ts` | `/lib/design.ts` | 设计系统类型（palette, fonts, typeScale, radius） |

#### UI 组件（shadcn）

完整组件集在 `/components/ui/`：button, card, dialog, dropdown-menu, input, popover, scroll-area, select, slider, tabs, textarea, toggle, tooltip 等。

#### 导航和布局

| 组件 | 路径 | 功能 |
|------|------|------|
| `thumbnail-rail.tsx` | `/components/` | 垂直/水平缩略图导航条 |
| `click-nav-zones.tsx` | `/components/` | 点击区域导航（上一页/下一页） |
| `sidebar.tsx` | `/components/sidebar/` | 文件夹侧边栏，拖拽支持 |
| `folder-item.tsx` | `/components/sidebar/` | 文件夹项，图标选择器 |
| `slide-canvas.tsx` | `/components/` | 幻灯片渲染包装器 |

---

## 3. CLI 功能

### @open-slide/cli（脚手架）

```bash
open-slide init [dir]           # 创建新工作区
  --force                       # 覆盖非空目录
  --name <name>                 # 包名
  --use-npm/--use-pnpm/--use-yarn/--use-bun
  --no-install                  # 跳过依赖安装
  --no-git                      # 跳过 git init
```

### @open-slide/core（开发）

```bash
open-slide dev                  # 启动开发服务器
  -p, --port <port>             # 端口（默认 5173）
  --host [host]                 # 网络暴露
  --open                        # 打开浏览器
  --no-skills-check             # 跳过 skills 检查

open-slide build                # 构建静态站点
  --out-dir <dir>               # 输出目录（默认: dist）

open-slide preview              # 预览生产构建
  -p, --port <port>
  --host [host]
  --open

open-slide sync:skills          # 同步内置 skills
  --dry-run                     # 显示变更预览
```

---

## 4. 幻灯片模块结构

```typescript
// packages/core/src/app/lib/sdk.ts
export type Page = ComponentType;

export type SlideMeta = {
  title?: string;
};

export type SlideModule = {
  default: Page[];              // 页面组件数组
  meta?: SlideMeta;             // 标题元数据
  design?: DesignSystem;        // 自定义设计令牌
  notes?: (string | undefined)[]; // 每页演讲者备注
};

export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;
```

---

## 5. 导出/构建功能

### HTML 导出

- 单文件 HTML，包含所有页面
- 嵌入 CSS 和资源
- JavaScript 键盘导航
- 自动缩放到视口
- 外部资源打包成 ZIP

### PDF 导出

- 浏览器原生打印引擎
- 1920x1080 页面（16:9）
- 矢量文本和 SVG 保留
- 超采样处理滤镜/合成层
- 导出进度报告
- 动画等待超时

---

## 6. 编辑器/播放器功能

### 幻灯片编辑器（开发模式）

| 功能 | 说明 |
|------|------|
| **Inspector** | 点击选择元素，编辑样式/文本 |
| **Design Panel** | 可视化编辑设计令牌（palette, fonts, typeScale, radius） |
| **Assets View** | 上传、重命名、删除、预览资源 |
| **Logo Search** | SVGL 集成搜索 logo |
| **Comments System** | 添加 AI 可处理的注释 `{/* @slide-comment */}` |
| **Undo/Redo** | 编辑历史 |
| **Auto-save** | 缓冲编辑，提交/取消 |

### 演示模式（播放器）

| 功能 | 说明 |
|------|------|
| **全屏** | 自动进入全屏，Escape 退出 |
| **键盘导航** | 方向键、Space、PageUp/PageDown、Home/End |
| **触摸支持** | 滑动手势导航 |
| **演示者同步** | BroadcastChannel 双屏同步 |
| **黑屏/白屏** | B 键黑屏，W 键白屏 |
| **激光笔** | L 键切换 |
| **概览模式** | O 键网格视图 |
| **跳转页码** | 数字输入直接跳转 |
| **帮助覆盖** | H 或 ? 键 |
| **进度条** | 自动隐藏进度指示器 |

### 演示者视图

| 功能 | 说明 |
|------|------|
| **当前幻灯片 + 下一页预览** | 并排视图 |
| **演讲者备注** | 每页备注显示 |
| **计时器** | 演示时长 |
| **时钟** | 当前时间 |
| **导航控制** | 与投影窗口同步 |
| **连接状态** | 显示是否链接到投影 |

---

## 7. 高级功能

### Comments/Annotations 系统

- 源码 JSX 标记：`{/* @slide-comment id="c-xxx" ts="..." text="base64url" */}`
- 服务器端点：add/edit/delete 操作
- AST 基础插入 JSX 元素
- 批量编辑支持
- AI 可处理格式（base64url 编码 JSON，包含 `note` 和可选 `hint`）

### 文件夹组织

- 创建/重命名/删除文件夹
- 分配幻灯片到文件夹
- Emoji 或颜色图标
- 拖拽幻灯片组织
- 持久化到 `slides/.folders.json`

### 资源管理

- 每幻灯片资源目录 `slides/<id>/assets/`
- 上传/重命名/删除操作
- SVGL logo 搜索集成
- MIME 类型检测
- 资源变更热更新

### 本地化

- 4 种语言：English, Chinese (Simplified), Chinese (Traditional), Japanese
- 完整翻译键覆盖所有 UI 元素
- 复数形式支持

### 设计系统类型

```typescript
export type DesignSystem = {
  palette: {
    bg: string;      // 背景色
    text: string;    // 文字色
    accent: string;  // 强调色
  };
  fonts: {
    display: string; // 标题字体
    body: string;    // 正文字体
  };
  typeScale: {
    hero: number;    // 标题字号（px）
    body: number;    // 正文字号（px）
  };
  radius: number;    // 圆角（px）
};
```

---

## 8. Vite 插件

| 插件 | 功能 |
|------|------|
| `open-slide-plugin.ts` | 加载用户配置，虚拟模块 |
| `files-plugin.ts` | 幻灯片发现，文件夹管理，资源服务，SVGL 代理 |
| `comments-plugin.ts` | 注释标记，编辑操作，AST 操作 |
| `design-plugin.ts` | 设计令牌编辑，热更新 |
| `loc-tags-plugin.ts` | 行/列跟踪，Inspector 点击选择 |

---

## 9. Claude Code Skills（内置）

位于 `/packages/cli/template/.agents/skills/`：

1. **create-slide** - 创建新演示文稿流程
2. **slide-authoring** - 幻灯片结构、画布、排版技术参考
3. **apply-comments** - 处理和应用 @slide-comment 标记
4. **create-theme** - 创建可复用主题文件

---

## 10. 配置

```typescript
export type OpenSlideConfig = {
  slidesDir?: string;           // 自定义幻灯片目录（默认: 'slides')
  port?: number;                // 开发服务器端口（默认: 5173）
  locale?: Locale;              // UI 语言
  build?: {
    showSlideBrowser?: boolean; // 显示首页幻灯片网格
    showSlideUi?: boolean;      // 显示编辑器 UI
    allowHtmlDownload?: boolean; // 启用导出菜单
  };
};
```

---

## 11. 关键依赖

- **React 18** + **React Router DOM** - UI 框架
- **Vite 5** - 构建工具
- **Tailwind CSS 4** - 样式
- **Radix UI** - 无障碍 UI 原语
- **Lucide React** - 图标库
- **fflate** - ZIP 压缩导出
- **@babel/parser** - AST 操作注释/编辑
- **sonner** - Toast 通知
- **emoji-picker-react** - Emoji 选择文件夹图标

---

## 12. 动画系统

### Keyframes

```css
@keyframes lFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes lFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes lFadeRight {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes lScale {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes lLineGrow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes lBarGrow {
  from { transform: scaleX(0); }
  to { transform: scaleX(var(--scale, 1)); }
}
@keyframes lBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
@keyframes lSlide {
  0% { transform: translateX(0); }
  100% { transform: translateX(var(--dist, 0px)); }
}
@keyframes lWindowSlide {
  0%, 100% { transform: translateX(0px); }
  50% { transform: translateX(var(--dist, 200px)); }
}
```

### 动画类

```css
.l-fadeup    { animation: lFadeUp 1000ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.l-fade      { animation: lFade 1200ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.l-faderight { animation: lFadeRight 800ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.l-scale     { animation: lScale 1000ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.l-line      { animation: lLineGrow 900ms cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: left center; }
.l-blink     { animation: lBlink 1.1s steps(1) infinite; }
.l-bar       { animation: lBarGrow 1100ms cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: left center; }
```

---

## 13. 装饰元素

### 网格背景

```jsx
<svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }}>
  <defs>
    <pattern id="lgrid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke={palette.line} strokeWidth="1" />
    </pattern>
    <radialGradient id="lvignette" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stopColor={palette.bg} stopOpacity="0" />
      <stop offset="100%" stopColor={palette.bg} stopOpacity="1" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#lgrid)" />
  <rect width="100%" height="100%" fill="url(#lvignette)" />
</svg>
```

---

## 总结

open-slide 是一个**完整的幻灯片创作和演示框架**：

- **React 幻灯片创作** - 1920x1080 画布
- **集成开发服务器** - 热更新
- **可视化设计编辑器** - 自定义主题
- **点击编辑 Inspector** - 元素级修改
- **双屏演示者视图** - 备注和同步
- **导出 HTML/PDF** - 单文件导出
- **文件夹组织** - 拖拽管理
- **资源管理** - Logo 搜索集成
- **AI 注释系统** - 处理编辑
- **多语言支持** - EN/ZH-CN/ZH-TW/JA
- **Claude Code Skills** - 自动幻灯片创建