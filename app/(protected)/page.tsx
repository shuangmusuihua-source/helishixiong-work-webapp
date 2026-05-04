'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, Folder, FileText, User, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  themeId: string;
  workMode: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  outline: {
    title: string;
    slides: Array<{ title: string }>;
  };
}

interface User {
  id: string;
  phone: string;
  name: string | null;
  avatar: string | null;
}

type TabType = 'slides' | 'document';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('slides');

  useEffect(() => {
    // 获取用户信息
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login');
          return;
        }
        setUser(data.user);
      });

    // 获取项目列表
    fetchProjects();
  }, [router]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Fetch projects error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/6 rounded-full blur-3xl" />
      </div>

      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">Kami Slides</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-1" />
                {user?.name || user?.phone?.slice(-4) || '用户'}
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 标签切换 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('slides')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
              activeTab === 'slides'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 hover:bg-muted'
            )}
          >
            <Folder className="h-4 w-4" />
            Slides
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
              activeTab === 'document'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 hover:bg-muted'
            )}
          >
            <FileText className="h-4 w-4" />
            文档
            <span className="text-xs opacity-60">(即将推出)</span>
          </button>
        </div>

        {/* Slides 内容 */}
        {activeTab === 'slides' && (
          <>
            {/* 新建按钮 */}
            <Link href="/create" className="block mb-6">
              <div className="glass-card p-6 flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer border-2 border-dashed border-muted-foreground/30">
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">创建新的幻灯片</span>
              </div>
            </Link>

            {/* 项目列表 */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">暂无项目</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  点击上方创建你的第一个幻灯片
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group"
                  >
                    <div className="glass-card overflow-hidden hover:shadow-lg transition-all">
                      {/* 封面 */}
                      <div className="aspect-video bg-muted/50 relative">
                        {project.coverImage ? (
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Folder className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-xs">
                          {project.outline?.slides?.length || 0} 页
                        </div>
                      </div>
                      {/* 信息 */}
                      <div className="p-3">
                        <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(project.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* 文档内容（占位符） */}
        {activeTab === 'document' && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">文档功能即将推出</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              敬请期待
            </p>
          </div>
        )}

        {/* 案例展示区 */}
        <section className="mt-16">
          <h2 className="text-xl font-semibold mb-6">案例展示</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slides 样例 */}
            <div className="glass-card p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Folder className="h-4 w-4 text-primary" />
                Slides 样例
              </h3>
              <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground text-sm">精选幻灯片案例</p>
              </div>
            </div>
            {/* 文档样例 */}
            <div className="glass-card p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                文档样例
              </h3>
              <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground text-sm">精选文档案例</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}