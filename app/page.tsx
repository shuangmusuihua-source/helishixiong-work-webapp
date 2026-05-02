import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Zap, Download } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Kami Slides
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            输入话题，AI 自动生成专业幻灯片
          </p>
          <Link href="/create">
            <Button size="lg" className="text-lg px-8">
              <Sparkles className="mr-2 h-5 w-5" />
              开始创建
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>智能内容规划</CardTitle>
              <CardDescription>
                AI 自动分析输入内容，生成结构化大纲
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>分钟级生成</CardTitle>
              <CardDescription>
                从话题到幻灯片，分钟级完成
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-10 w-10 text-primary mb-2" />
              <CardTitle>独立运行</CardTitle>
              <CardDescription>
                单 HTML 文件，无需依赖即可运行
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}