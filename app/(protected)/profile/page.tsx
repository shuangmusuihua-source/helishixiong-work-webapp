'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, LogOut, Loader2 } from 'lucide-react';

interface UserInfo {
  id: string;
  phone: string;
  name: string | null;
  avatar: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login');
          return;
        }
        setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
      </div>

      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="px-4 h-12 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
          </Link>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-xl font-semibold mb-6">用户中心</h1>

        {/* 用户信息卡片 */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-medium text-lg">
                {user?.name || `用户${user?.phone?.slice(-4)}`}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.phone}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-muted-foreground">手机号</span>
              <span>{user?.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-muted-foreground">用户 ID</span>
              <span className="font-mono text-xs">{user?.id}</span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          退出登录
        </Button>
      </main>
    </div>
  );
}