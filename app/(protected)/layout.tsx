'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  updatedAt: string;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/?auth=login');
    }
  }, [session, isPending, router]);

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
      setProjectsLoaded(true);
    }
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <WorkspaceSidebar projects={projects} currentPath={pathname} />

      {/* Main Content */}
      <main className="md:ml-[280px] pt-16 md:pt-6 min-h-screen transition-all duration-300 px-4 md:px-6 md:pr-6">
        <div className="max-w-6xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
