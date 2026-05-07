import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路径（不需要认证）
const publicPaths = ['/', '/login', '/register', '/api/auth'];

// 需要认证的路径
const protectedPaths = ['/projects', '/create', '/profile'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better Auth session cookie name
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;

  // 检查是否是公开路径
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // 如果是公开路径，直接放行
  if (isPublic) {
    return NextResponse.next();
  }

  // API 路径（除了 auth）需要认证
  const isApiPath = pathname.startsWith('/api');
  const isAuthApi = pathname.startsWith('/api/auth');

  // 如果没有 session token
  if (!sessionToken) {
    // API 返回 401
    if (isApiPath && !isAuthApi) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 页面重定向到首页（带有登录弹窗）
    const homeUrl = new URL('/', request.url);
    homeUrl.searchParams.set('auth', 'login');
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
