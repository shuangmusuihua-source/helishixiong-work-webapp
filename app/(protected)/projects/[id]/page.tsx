'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Trash2, Download, Play } from 'lucide-react';
import { PreviewLayout } from '@/components/preview';

interface Project {
  id: string;
  title: string;
  themeId: string;
  workMode: string;
  coverImage: string | null;
  slidePages: string[];
  createdAt: string;
  updatedAt: string;
  outline: {
    title: string;
    slides: Array<{ title: string }>;
  };
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();

      if (!res.ok) {
        router.push('/');
        return;
      }

      setProject(data.project);
    } catch (error) {
      console.error('Fetch project error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个项目吗？')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    if (!project || !project.slidePages) return;

    // 合合所有页面 HTML
    const fullHtml = project.slidePages.join('\n');

    // 创建下载
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回
              </Button>
            </Link>
            <h1 className="font-medium truncate">{project.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              下载
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* 预览区域 */}
      <main className="flex-1">
        {project.slidePages && project.slidePages.length > 0 ? (
          <PreviewLayout showPresenterButton />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">暂无内容</p>
          </div>
        )}
      </main>
    </div>
  );
}