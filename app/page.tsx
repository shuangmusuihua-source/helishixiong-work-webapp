'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Wand2,
  ArrowRight,
  Play,
  Zap,
  Layers,
  Palette,
  Download,
  ChevronRight,
  X,
  Check,
  Star,
  Users,
  Clock,
  FileText,
  Presentation,
} from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAuthSuccess = () => {
    setShowAuth(false);
    router.push('/projects');
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="container h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight">河狸师兄</span>
              <span className="text-xs text-muted-foreground hidden sm:block">AI Slides Generator</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">功能</NavLink>
            <NavLink href="#how-it-works">工作流程</NavLink>
            <NavLink href="#pricing">定价</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                登录
              </Button>
            </Link>
            <Button size="sm" onClick={() => setShowAuth(true)} className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              免费开始
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container">
          <div className={cn(
            "max-w-4xl mx-auto text-center transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI驱动的专业幻灯片生成</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              输入话题
              <br />
              <span className="gradient-text">AI自动生成</span>
              <br />
              专业幻灯片
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              分钟级完成，一键导出。告别繁琐的幻灯片制作流程，
              让创意瞬间成真。
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                className="btn-primary h-12 px-8 text-base"
                onClick={() => setShowAuth(true)}
              >
                <Wand2 className="mr-2 h-5 w-5" />
                免费开始创作
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
              >
                <Play className="mr-2 h-5 w-5" />
                观看演示
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>10,000+ 用户</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>50,000+ 幻灯片</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
                <span className="ml-1">4.9 评分</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className={cn(
            "mt-16 max-w-5xl mx-auto transition-all duration-700 delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-3xl opacity-60" />
              <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-accent/60" />
                  </div>
                  <div className="flex-1 text-center text-sm text-muted-foreground">
                    河狸师兄 - AI幻灯片生成
                  </div>
                </div>
                {/* Preview Content */}
                <div className="aspect-[16/10] bg-gradient-to-br from-muted/50 to-background flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                      <Presentation className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-medium">幻灯片预览区域</p>
                    <p className="text-sm text-muted-foreground/60 mt-2">输入话题即可生成</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">为什么选择河狸师兄</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              强大的AI能力，让幻灯片创作变得简单高效
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="极速生成"
              description="从输入到完成，分钟级交付。AI自动分析内容，生成专业大纲和幻灯片。"
              delay={0}
            />
            <FeatureCard
              icon={<Palette className="h-6 w-6" />}
              title="精美主题"
              description="多种专业设计主题，一键切换风格。支持自定义配色，满足不同场景需求。"
              delay={100}
            />
            <FeatureCard
              icon={<Download className="h-6 w-6" />}
              title="一键导出"
              description="支持HTML、PDF等多种格式导出。直接演示或分享，无需额外工具。"
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container">
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
              icon={<FileText className="h-5 w-5" />}
            />
            <StepCard
              number="02"
              title="选择主题"
              description="挑选喜欢的视觉风格"
              icon={<Palette className="h-5 w-5" />}
            />
            <StepCard
              number="03"
              title="生成导出"
              description="AI生成并一键下载"
              icon={<Download className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            免费使用，无需信用卡，立即体验AI幻灯片生成的魅力
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="h-12 px-8 text-base bg-white text-primary hover:bg-white/90"
            onClick={() => setShowAuth(true)}
          >
            <Wand2 className="mr-2 h-5 w-5" />
            免费开始创作
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">河狸师兄</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 河狸师兄. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAuth(false)}
          />
          <div className="relative bg-card rounded-2xl shadow-2xl border border-border p-8 w-full max-w-md animate-fade-in-scale">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold">登录 / 注册</h2>
              <p className="text-sm text-muted-foreground mt-1">使用手机号快速登录</p>
            </div>
            <AuthForm onSuccess={handleAuthSuccess} />
          </div>
        </div>
      )}
    </main>
  );
}

// Navigation Link
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  );
}

// Feature Card
function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="card card-hover p-8 text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 mx-auto mb-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary border border-primary/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

// Step Card
function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card card-hover p-8 text-center relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-accent to-emerald-400 text-white text-sm font-bold shadow-lg shadow-accent/25">
        {number}
      </div>
      <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary border border-primary/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
