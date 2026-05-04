// 输入类型
export type InputType = 'topic' | 'text' | 'file';

// 页面类型
export type PageType = 'cover' | 'content' | 'end';

// 内容类型 - 9 种
export type ContentType =
  | 'data-cards'
  | 'data-chart'
  | 'comparison-feature'
  | 'comparison-table'
  | 'timeline'
  | 'architecture'
  | 'quote'
  | 'list'
  | 'paragraph';

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
  author?: string;
  date?: string;
}

// 幻灯片联合类型
export type Slide = CoverSlide | ContentSlide | EndSlide;

// 大纲结构
export interface Outline {
  title: string;
  slides: Slide[];
}

// 数据卡片内容
export interface DataCardsContent {
  items: {
    label: string;
    value: string | number;
    unit?: string;
    insight?: string;
    icon?: string;
  }[];
}

// 数据图表内容
export interface DataChartContent {
  chart_type: 'bar' | 'line' | 'pie' | 'radar';
  data: {
    labels: string[];
    values: number[];
    unit?: string;
  };
  info?: {
    title: string;
    items: string[];
  };
}

// 特点对比内容
export interface ComparisonFeatureContent {
  subjects: [string, string];
  items: {
    subject1_feature: string;
    subject2_feature: string;
  }[];
  conclusion?: string;
}

// 表格对比内容
export interface ComparisonTableContent {
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
    icon?: string;
    items: {
      label: string;
      icon?: string;
      children?: { label: string; icon?: string }[];
    }[];
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
export type SlideContent =
  | DataCardsContent
  | DataChartContent
  | ComparisonFeatureContent
  | ComparisonTableContent
  | TimelineContent
  | ArchitectureContent
  | QuoteContent
  | ListContent
  | ParagraphContent
  | Record<string, unknown>;

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