# 河狸师兄 - AI 幻灯片生成平台

一个基于 AI 的智能幻灯片生成工具，支持模板模式和高级模式两种生成方式。

## 功能特性

- **双模式生成**
  - 模板模式：基于预设模板快速生成，适合标准化场景
  - 高级模式：AI 深度定制，支持多种审美风格和动画程度

- **智能内容生成**
  - 自动分析输入内容，识别最佳内容类型（数据卡片、时间线、对比表等）
  - AI 生成详细内容，确保数据真实可信

- **多种内容类型**
  - 数据卡片（data-cards）
  - 数据图表（data-chart）
  - 特点对比（comparison-feature）
  - 表格对比（comparison-table）
  - 时间线（timeline）
  - 架构图（architecture）
  - 引用块（quote）
  - 列表（list）
  - 段落（paragraph）

- **主题系统**
  - 模板主题：business-modern、business-simple、aisumicha 等
  - 高级主题：neon-terminal、paper-press、editorial-noir
  - 支持深色/浅色模式切换

## 技术栈

- **前端**：Next.js 15、React 19、Tailwind CSS
- **后端**：Next.js API Routes、Prisma
- **认证**：Better Auth
- **AI**：Claude API (Anthropic)
- **数据库**：SQLite (开发)、PostgreSQL (生产)

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件：

```env
# Anthropic API
ANTHROPIC_API_KEY=your_api_key
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL_ID=claude-sonnet-4-6

# Better Auth
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=file:./dev.db
```

### 初始化数据库

```bash
npx prisma db push
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
├── app/                    # Next.js 应用目录
│   ├── (auth)/             # 认证相关页面
│   ├── (protected)/        # 受保护页面（工作空间）
│   ├── api/                # API 路由
│   └── page.tsx            # 首页
├── components/             # React 组件
│   ├── auth/               # 认证组件
│   ├── layout/             # 布局组件
│   ├── preview/            # 预览组件
│   ├── theme/              # 主题组件
│   ├── ui/                 # UI 基础组件
│   └ wizard/               # 创建流程组件
├── lib/                    # 工具库
│   ├── auth.ts             # 认证配置
│   ├── auth-client.ts      # 认证客户端
│   ├── db.ts               # 数据库连接
│   ├── generator/          # 幻灯片生成器
│   ├── llm/                # LLM 相关
│   └ utils.ts              # 通用工具
├── prisma/                 # Prisma 配置
│   └ schema.prisma         # 数据库模型
├── store/                  # Zustand 状态管理
├── templates/              # 模板主题文件
├── themes/                 # 高级主题定义
└── types/                  # TypeScript 类型定义
```

## 使用流程

1. **登录**：使用手机号验证码登录
2. **选择模式**：模板模式或高级模式
3. **输入内容**：提供话题或已有内容
4. **生成大纲**：AI 自动规划幻灯片结构
5. **选择主题**：选择视觉风格
6. **生成预览**：实时预览幻灯片效果
7. **导出**：下载 HTML 文件

## 开发

### 运行测试

```bash
npm run test
```

### 类型检查

```bash
npm run type-check
```

### 构建生产版本

```bash
npm run build
```

## 许可证

MIT