# 河狸师兄 - 设计系统文档

> **生成时间:** 2026-05-06
> **风格:** Motion-Driven SaaS
> **模式:** Hero-Centric + Trust

---

## 设计原则

### 核心价值观
1. **专业** - 企业级品质，值得信赖
2. **简洁** - 减少认知负担，聚焦核心功能
3. **高效** - 分钟级完成，即时反馈
4. **现代** - 动效驱动，流畅体验

### 设计风格
- **Motion-Driven**: 动效驱动，微交互丰富
- **Hero-Centric**: 聚焦核心价值，单一CTA
- **Trust**: 专业配色，清晰层次

---

## 色彩系统

### 主色板

| 角色 | 色值 | 用途 |
|------|------|------|
| Primary | `#1E3A5F` | 品牌主色，导航，标题 |
| Secondary | `#2563EB` | 链接，次要操作 |
| Accent | `#059669` | CTA按钮，成功状态 |
| Destructive | `#DC2626` | 错误，删除操作 |

### 表面色

| 角色 | 亮色模式 | 暗色模式 |
|------|----------|----------|
| Background | `#F8FAFC` | `#0F172A` |
| Foreground | `#0F172A` | `#F8FAFC` |
| Card | `#FFFFFF` | `#1E293B` |
| Muted | `#F1F5F9` | `#334155` |
| Border | `#E2E8F0` | `#334155` |

### 语义色

| 状态 | 色值 | 使用场景 |
|------|------|----------|
| Success | `#059669` | 成功提示，完成状态 |
| Warning | `#F59E0B` | 警告提示 |
| Error | `#DC2626` | 错误提示，删除操作 |
| Info | `#2563EB` | 信息提示 |

---

## 字体系统

### 字体家族
- **主字体:** Plus Jakarta Sans
- **展示字体:** Plus Jakarta Sans (Bold)
- **等宽字体:** System Monospace

### 字体层级

| 元素 | 大小 | 字重 | 行高 |
|------|------|------|------|
| H1 | 48px / 3rem | 700 | 1.2 |
| H2 | 36px / 2.25rem | 700 | 1.2 |
| H3 | 24px / 1.5rem | 700 | 1.2 |
| H4 | 20px / 1.25rem | 700 | 1.2 |
| Body | 16px / 1rem | 400 | 1.6 |
| Small | 14px / 0.875rem | 400 | 1.5 |
| Caption | 12px / 0.75rem | 500 | 1.4 |

---

## 间距系统

基于 4px 基础单位的间距系统：

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-xs` | 4px | 紧凑间距 |
| `--space-sm` | 8px | 图标间距 |
| `--space-md` | 16px | 标准内边距 |
| `--space-lg` | 24px | 区块内边距 |
| `--space-xl` | 32px | 大间距 |
| `--space-2xl` | 48px | 区块间距 |
| `--space-3xl` | 64px | Hero内边距 |

---

## 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | 6px | 小元素 |
| `--radius-md` | 10px | 输入框 |
| `--radius-lg` | 12px | 卡片 |
| `--radius-xl` | 16px | 大卡片 |
| `--radius-2xl` | 20px | 模态框 |
| `--radius-3xl` | 24px | Hero容器 |

---

## 阴影系统

| Level | 值 | 用途 |
|-------|-----|------|
| xs | `0 1px 2px rgba(0,0,0,0.05)` | 微妙提升 |
| sm | `0 1px 3px rgba(0,0,0,0.1)` | 悬停状态 |
| md | `0 4px 6px rgba(0,0,0,0.07)` | 卡片 |
| lg | `0 10px 15px rgba(0,0,0,0.1)` | 模态框 |
| xl | `0 20px 25px rgba(0,0,0,0.1)` | Hero |
| 2xl | `0 25px 50px rgba(0,0,0,0.15)` | 弹窗 |

---

## 动效系统

### 时长
- **Fast:** 150ms - 微交互
- **Normal:** 200ms - 标准过渡
- **Slow:** 300ms - 复杂动画

### 缓动函数
- **Default:** `cubic-bezier(0.4, 0, 0.2, 1)` - 标准缓动
- **Bounce:** `cubic-bezier(0.68, -0.55, 0.265, 1.55)` - 弹性效果

### 动画类型
- `fade-in` - 淡入
- `fade-in-up` - 上滑淡入
- `fade-in-scale` - 缩放淡入
- `slide-in-right` - 右滑入
- `pulse-glow` - 发光脉冲

---

## 组件规范

### 按钮

```css
/* Primary Button */
.btn-primary {
  background: var(--accent);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius);
  font-weight: 600;
  transition: all 200ms ease;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
```

### 卡片

```css
.card {
  background: var(--card);
  border-radius: calc(var(--radius) * 1.5);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.card-hover:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### 输入框

```css
.input {
  padding: 12px 16px;
  border: 1px solid var(--input);
  border-radius: var(--radius);
  font-size: 16px;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
}
```

---

## 响应式断点

| 断点 | 宽度 | 设备 |
|------|------|------|
| sm | 640px | 手机横屏 |
| md | 768px | 平板竖屏 |
| lg | 1024px | 平板横屏 |
| xl | 1280px | 桌面 |
| 2xl | 1536px | 大屏 |

---

## 无障碍规范

### 必须遵守
- ✅ 颜色对比度 ≥ 4.5:1 (正文)
- ✅ 焦点状态可见 (`:focus-visible`)
- ✅ 支持 `prefers-reduced-motion`
- ✅ 语义化 HTML 标签
- ✅ ARIA 标签 (必要时)

### 禁止使用
- ❌ Emoji 作为图标
- ❌ 颜色作为唯一信息载体
- ❌ 隐藏焦点状态
- ❌ 瞬时状态变化 (无过渡)

---

## 预交付检查清单

- [ ] 无 Emoji 作为图标 (使用 SVG)
- [ ] 所有图标来自统一图标集 (Lucide)
- [ ] 可点击元素有 `cursor: pointer`
- [ ] 悬停状态有平滑过渡 (150-300ms)
- [ ] 亮色模式文字对比度 ≥ 4.5:1
- [ ] 焦点状态可见
- [ ] 支持 `prefers-reduced-motion`
- [ ] 响应式测试: 375px, 768px, 1024px, 1440px
- [ ] 无内容被固定导航遮挡
- [ ] 移动端无横向滚动
