'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, LogOut, Loader2, Phone, Shield, Calendar } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/');
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    router.push('/?auth=login');
    return null;
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container h-16 flex items-center">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回项目
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">用户中心</h1>
          <p className="text-muted-foreground">管理你的账户信息</p>
        </div>

        {/* User Card */}
        <div className="card p-8 mb-8">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-4 shadow-lg">
              {user.image ? (
                <img
                  src={user.image}
                  alt="avatar"
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold mb-1">
              {user.name || `用户${user.phoneNumber?.slice(-4)}`}
            </h2>
            <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
          </div>

          {/* Info List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">手机号</span>
              </div>
              <span className="text-sm font-semibold">{user.phoneNumber}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">用户 ID</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {user.id?.slice(0, 8)}...
              </span>
            </div>

            {user.createdAt && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">注册时间</span>
                </div>
                <span className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full h-12 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          退出登录
        </Button>
      </main>
    </div>
  );
}
