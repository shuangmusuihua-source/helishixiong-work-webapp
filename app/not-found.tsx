import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card p-8 text-center max-w-md">
        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">页面未找到</h2>
        <p className="text-muted-foreground mb-6">
          您访问的页面不存在或已被移除
        </p>
        <Link href="/">
          <Button className="rounded-xl">
            <Home className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  );
}