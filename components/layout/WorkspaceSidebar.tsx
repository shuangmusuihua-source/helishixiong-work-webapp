'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  FolderOpen,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  User,
  Menu,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface Project {
  id: string;
  title: string;
  updatedAt: string;
}

interface WorkspaceSidebarProps {
  projects: Project[];
  currentPath: string;
}

export function WorkspaceSidebar({ projects, currentPath }: WorkspaceSidebarProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/');
  };

  const recentProjects = projects.slice(0, 4);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border/30">
        <Link href="/projects" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-lg truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">河狸师兄</span>
              <span className="text-xs text-muted-foreground">工作空间</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* 我的项目 */}
        <div className="space-y-1">
          <Link
            href="/projects"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
              currentPath === '/projects'
                ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}
          >
            <FolderOpen className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>我的项目</span>}
          </Link>

          {/* 最近项目 */}
          {!collapsed && recentProjects.length > 0 && (
            <div className="ml-4 pl-3 border-l border-primary/20 space-y-0.5">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all truncate',
                    currentPath === `/projects/${project.id}`
                      ? 'bg-primary/8 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  <span className="truncate">{project.title}</span>
                </Link>
              ))}
              {projects.length > 4 && (
                <Link
                  href="/projects"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span>查看全部</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 新建 */}
        <Link
          href="/create"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
            currentPath === '/create'
              ? 'bg-accent/10 text-accent font-semibold shadow-sm'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          )}
        >
          <Plus className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>新建项目</span>}
        </Link>
      </nav>

      {/* Settings Section */}
      <div className="p-3 border-t border-border/30">
        {collapsed ? (
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
          >
            <Settings className="h-5 w-5" />
          </button>
        ) : (
          <div className="space-y-1">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <span>设置</span>
              </div>
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  settingsOpen && 'rotate-90'
                )}
              />
            </button>

            {settingsOpen && (
              <div className="ml-4 pl-3 border-l border-border/30 space-y-1">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm">
                  <span className="text-muted-foreground">主题</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出登录</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Info */}
        {!collapsed && session?.user && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">
                  {session.user.name || `用户${session.user.phoneNumber?.slice(-4)}`}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.phoneNumber}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle - Desktop Only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute top-1/2 -right-3 w-6 h-6 items-center justify-center rounded-full bg-card border border-border shadow-lg text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-xl transition-all z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-b border-border/50 z-40 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-md shadow-primary/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">河狸师兄</span>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'md:hidden fixed top-0 left-0 h-full bg-card/95 backdrop-blur-xl border-r border-border/50 z-50 transition-transform duration-300 w-72 shadow-2xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar - Floating */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed bg-card/80 backdrop-blur-xl border border-border/50 z-30 transition-all duration-300 rounded-2xl shadow-xl',
          collapsed ? 'w-[72px]' : 'w-64',
          'top-4 left-4 bottom-4'
        )}
        style={{ height: 'calc(100vh - 32px)' }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
