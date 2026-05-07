'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Folder,
  LayoutGrid,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

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

type TabType = 'slides' | 'document';

export default function ProjectsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('slides');

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">工作空间</h1>
        <p className="text-muted-foreground text-sm">管理你的幻灯片和文档</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('slides')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'slides'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          幻灯片
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'document'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          文档
          <span className="text-xs opacity-60 font-normal">(即将推出)</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'slides' && (
        <>
          {/* Create New */}
          <Link href="/create" className="block mb-6">
            <div className="card card-hover card-interactive p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20 flex items-center justify-center">
                <Plus className="h-6 w-6 text-accent" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold">创建新的幻灯片</p>
                <p className="text-sm text-muted-foreground">AI驱动，分钟级完成</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <LayoutGrid className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-1">暂无项目</p>
              <p className="text-muted-foreground text-sm">
                点击上方创建你的第一个幻灯片
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group"
                >
                  <div className="card card-hover card-interactive overflow-hidden">
                    {/* Cover */}
                    <div className="aspect-video bg-muted relative -mx-6 -mt-6 mb-3">
                      {project.coverImage ? (
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <Folder className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-medium border border-border">
                        {project.outline?.slides?.length || 0} 页
                      </div>
                    </div>
                    {/* Info */}
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors mb-1.5">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(project.updatedAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Document Tab */}
      {activeTab === 'document' && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <Folder className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium mb-1">文档功能即将推出</p>
          <p className="text-muted-foreground text-sm">敬请期待</p>
        </div>
      )}
    </div>
  );
}
