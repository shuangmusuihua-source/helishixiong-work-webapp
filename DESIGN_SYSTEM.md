# 河狸师兄 Design System

## 设计理念

**清新通透的现代 SaaS 设计** - 采用明亮、干净的配色，配合柔和的阴影和精致的玻璃效果，营造专业且友好的用户体验。

---

## 色彩系统

### 主色 (Primary)

| 名称 | Light Mode | Dark Mode | 用途 |
|------|------------|-----------|------|
| Primary | `#2563EB` | `#60A5FA` | 主要按钮、链接、重点强调 |
| Primary Foreground | `#FFFFFF` | `#0F172A` | 主色上的文字 |

### 辅助色 (Secondary)

| 名称 | Light Mode | Dark Mode | 用途 |
|------|------------|-----------|------|
| Secondary | `#7C3AED` | `#A78BFA` | 次要按钮、标签 |
| Accent | `#10B981` | `#34D399` | 成功状态、新建按钮 |
| Destructive | `#EF4444` | `#F87171` | 错误、删除、危险操作 |

### 表面色 (Surfaces)

| 名称 | Light Mode | Dark Mode | 用途 |
|------|------------|-----------|------|
| Background | `#FAFBFC` | `#030712` | 页面背景 |
| Card | `#FFFFFF` | `#111827` | 卡片、侧边栏背景 |
| Muted | `#F3F4F6` | `#1F2937` | 次级背景、禁用状态 |
| Border | `#E5E7EB` | `#374151` | 边框、分隔线 |

### 文字色 (Text)

| 名称 | Light Mode | Dark Mode | 用途 |
|------|------------|-----------|------|
| Foreground | `#111827` | `#F9FAFB` | 主要文字 |
| Muted Foreground | `#6B7280` | `#9CA3AF` | 次级文字、说明 |

### 图表色 (Charts)

| 名称 | Light Mode | Dark Mode |
|------|------------|-----------|
| Chart 1 | `#2563EB` | `#60A5FA` |
| Chart 2 | `#10B981` | `#34D399` |
| Chart 3 | `#7C3AED` | `#A78BFA` |
| Chart 4 | `#F59E0B` | `#FBBF24` |
| Chart 5 | `#EF4444` | `#F87171` |

---

## 字体系统

### 字体家族

```css
--font-sans: "Alibaba PuHuiTi", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
--font-display: "Alibaba PuHuiTi", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, monospace;
```

### 字号层级

| 名称 | 大小 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| Display | 3rem (48px) | 1.2 | 700 | 大标题 |
| H1 | 2.25rem (36px) | 1.2 | 700 | 页面标题 |
| H2 | 1.5rem (24px) | 1.3 | 700 | 区块标题 |
| H3 | 1.25rem (20px) | 1.4 | 600 | 小标题 |
| Body | 1rem (16px) | 1.6 | 400 | 正文 |
| Small | 0.875rem (14px) | 1.5 | 400 | 辅助文字 |
| Tiny | 0.75rem (12px) | 1.5 | 400 | 标签、提示 |

---

## 间距系统

基于 4px/8dp 的间距系统：

| 名称 | 值 | 用途 |
|------|------|------|
| xs | 4px | 紧凑间距 |
| sm | 8px | 小间距 |
| md | 16px | 标准间距 |
| lg | 24px | 大间距 |
| xl | 32px | 区块间距 |
| 2xl | 48px | 大区块间距 |
| 3xl | 64px | 页面级间距 |

---

## 圆角系统

| 名称 | 值 | 用途 |
|------|------|------|
| sm | 6px | 小元素 |
| md | 8px | 输入框、按钮 |
| lg | 12px | 卡片 |
| xl | 16px | 大卡片 |
| 2xl | 20px | 侧边栏 |
| full | 9999px | 标签、徽章 |

---

## 阴影系统

柔和、低对比度的阴影，营造轻盈感：

| 名称 | Light Mode | Dark Mode |
|------|------------|-----------|
| xs | `0 1px 2px rgba(0,0,0,0.03)` | `0 1px 2px rgba(0,0,0,0.1)` |
| sm | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)` | `0 1px 3px rgba(0,0,0,0.15)` |
| md | `0 4px 6px -1px rgba(0,0,0,0.05)` | `0 4px 6px rgba(0,0,0,0.2)` |
| lg | `0 10px 15px -3px rgba(0,0,0,0.05)` | `0 10px 15px rgba(0,0,0,0.25)` |
| xl | `0 20px 25px -5px rgba(0,0,0,0.05)` | `0 20px 25px rgba(0,0,0,0.3)` |
| primary | `0 2px 8px rgba(37,99,235,0.25)` | `0 2px 8px rgba(96,165,250,0.3)` |

---

## 玻璃效果 (Glass)

```css
/* Light Mode */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

/* Dark Mode */
.dark .glass {
  background: rgba(17, 24, 39, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}
```

---

## 组件规范

### 按钮 (Button)

**主按钮**
- 背景：渐变 `linear-gradient(135deg, primary, #3B82F6)`
- 文字：白色
- 圆角：`--radius`
- 阴影：`shadow-primary`
- 悬停：上移 1px，阴影增强
- 点击：下移 1px，阴影减弱

**次按钮**
- 背景：透明
- 边框：1.5px solid primary
- 文字：primary
- 悬停：填充 primary 背景

**幽灵按钮**
- 背景：透明
- 文字：foreground
- 悬停：muted 背景

### 卡片 (Card)

- 背景：card
- 圆角：2xl (20px)
- 边框：1px solid border
- 阴影：shadow-sm
- 悬停：shadow-lg，上移 2px，边框变 primary/30

### 输入框 (Input)

- 背景：background
- 边框：1px solid input
- 圆角：md (8px)
- 高度：44px (满足触摸目标)
- 聚焦：primary 边框，`0 0 0 3px rgba(37,99,235,0.1)` 阴影

### 侧边栏 (Sidebar)

- 背景：card/80 + backdrop-blur-xl
- 圆角：2xl (20px)
- 边框：border/50
- 阴影：shadow-xl
- 悬浮效果：上下左右 16px 边距

---

## 动画规范

| 名称 | 时长 | 缓动函数 | 用途 |
|------|------|----------|------|
| fast | 150ms | ease-out | 微交互 |
| normal | 200ms | ease-out | 标准过渡 |
| slow | 300ms | ease-out | 页面切换 |

**缓动函数**
```css
--easing: cubic-bezier(0.4, 0, 0.2, 1);
--easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 图标规范

- 使用 Lucide React 图标库
- 标准尺寸：16px (sm), 20px (md), 24px (lg)
- stroke-width: 2
- 与文字对齐时保持 8px 间距

---

## 响应式断点

| 名称 | 值 | 用途 |
|------|------|------|
| sm | 640px | 手机横屏 |
| md | 768px | 平板竖屏 |
| lg | 1024px | 平板横屏/小桌面 |
| xl | 1280px | 标准桌面 |
| 2xl | 1536px | 大桌面 |

---

## 无障碍规范

- 文字对比度：≥ 4.5:1 (WCAG AA)
- 大文字对比度：≥ 3:1
- 触摸目标：≥ 44x44px
- 聚焦环：2px solid primary，offset 2px
- 支持 prefers-reduced-motion
- 支持 prefers-color-scheme