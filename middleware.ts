import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路径
const publicPaths = ['/', '/login', '/register', '/api/auth'];

// 需要认证的路径
const protectedPaths = ['/projects', '/create', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是公开路径
  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // API 路径（除了 auth）需要认证
  const isApiPath = pathname.startsWith('/api');
  const isAuthApi = pathname.startsWith('/api/auth');

  // 获取 session cookie
  const token = request.cookies.get('kami_session')?.value;

  // 如果没有 token 且访问需要认证的路径
  if (!token) {
    // 检查是否是受保护的路径
    const isProtected = protectedPaths.some((path) =>
      pathname === path || pathname.startsWith(`${path}/`)
    );

    if (isProtected || (isApiPath && !isAuthApi)) {
      // 重定向到登录页
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
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