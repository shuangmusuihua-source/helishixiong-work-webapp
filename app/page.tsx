import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Wand2, ArrowRight, Play, Layers, Palette, Download, Users, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 背景 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              AI 驱动的专业幻灯片生成工具
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              让创意
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                瞬间成真
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              输入话题，AI 自动生成专业级幻灯片
              <br className="hidden md:block" />
              分钟级完成，一键导出
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/login">
                <Button size="lg" className="text-lg px-10 py-6 rounded-2xl btn-primary-glow h-auto">
                  <Wand2 className="mr-2 h-5 w-5" />
                  免费开始
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-2xl h-auto">
                <Play className="mr-2 h-5 w-5" />
                观看演示
              </Button>
            </div>

            {/* Preview Image */}
            <div className="relative max-w-5xl mx-auto">
              <div className="glass-card-lg p-2 md:p-4 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/5 to-muted rounded-xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Layers className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground">幻灯片预览</p>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-2xl blur-xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/15 rounded-2xl blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">为什么选择 Kami Slides</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              强大的 AI 能力，让幻灯片创作变得简单高效
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="智能内容生成"
              description="输入话题或文本，AI 自动分析并生成结构化大纲和内容"
            />
            <FeatureCard
              icon={<Palette className="h-6 w-6" />}
              title="精美主题模板"
              description="多种专业设计主题，一键切换风格，满足不同场景需求"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="极速生成"
              description="从输入到完成，分钟级交付，大幅提升工作效率"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">三步完成创作</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              简单三步，即可生成专业幻灯片
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number="01"
              title="输入内容"
              description="输入话题、文本或上传文档"
            />
            <StepCard
              number="02"
              title="选择主题"
              description="挑选喜欢的视觉风格"
            />
            <StepCard
              number="03"
              title="生成导出"
              description="AI 生成并一键下载"
            />
          </div>
        </div>
      </section>

      {/* Themes Preview */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">精美主题</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              多种专业设计主题，满足不同场景
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <ThemePreview name="商务现代" color="from-emerald-400 to-teal-500" />
            <ThemePreview name="商务深色" color="from-slate-700 to-slate-900" />
            <ThemePreview name="简约白" color="from-gray-100 to-white" />
            <ThemePreview name="蓝墨茶" color="from-blue-900 to-indigo-900" />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">适用场景</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              无论是工作汇报还是教学演示，Kami Slides 都能帮你轻松应对
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <UseCaseCard title="工作汇报" description="周报、月报、项目汇报" />
            <UseCaseCard title="产品演示" description="产品介绍、方案展示" />
            <UseCaseCard title="教学课件" description="课程讲义、培训材料" />
            <UseCaseCard title="商业提案" description="商业计划、投资路演" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            免费使用，无需信用卡，立即体验 AI 幻灯片生成的魅力
          </p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-10 py-6 rounded-2xl btn-primary-glow h-auto">
              <Wand2 className="mr-2 h-5 w-5" />
              免费开始创作
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">Kami Slides</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Kami Slides. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-6 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Step Card Component
function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

// Theme Preview Component
function ThemePreview({
  name,
  color,
}: {
  name: string;
  color: string;
}) {
  return (
    <div className="group cursor-pointer">
      <div className={`aspect-video rounded-xl bg-gradient-to-br ${color} mb-2 group-hover:scale-105 transition-transform shadow-lg`}>
        <div className="w-full h-full p-3 flex flex-col justify-end">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
            <div className="h-1.5 w-12 bg-white/60 rounded mb-1" />
            <div className="h-1 w-8 bg-white/40 rounded" />
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-center">{name}</p>
    </div>
  );
}

// Use Case Card Component
function UseCaseCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-5 hover:shadow-lg transition-shadow">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
