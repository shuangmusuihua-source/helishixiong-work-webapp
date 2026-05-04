import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Wand2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 弥散渐变背景 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/4 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 glass-card glass-card-sm">
            <Sparkles className="h-4 w-4" />
            AI 驱动的幻灯片生成器
          </div>

          <h1 className="text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Kami Slides
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            输入话题或内容，AI 自动生成专业级幻灯片
            <br />
            分钟级完成，一键导出
          </p>

          <Link href="/create">
            <Button size="lg" className="text-lg px-10 py-6 rounded-card-lg btn-primary-glow">
              <Wand2 className="mr-2 h-5 w-5" />
              开始创建
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="智能规划"
            description="AI 自动分析内容，生成结构化大纲"
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="极速生成"
            description="从话题到幻灯片，分钟级完成"
          />
          <FeatureCard
            icon={<Wand2 className="h-5 w-5" />}
            title="精美主题"
            description="多种专业主题，一键切换风格"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-card-sm bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}