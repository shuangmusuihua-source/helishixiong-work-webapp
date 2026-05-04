import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './db';
import type { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'kami-slides-secret-key';
const COOKIE_NAME = 'kami_session';

export interface SessionUser {
  id: string;
  phone: string;
  name: string | null;
  avatar: string | null;
}

// 创建 JWT Token
export function createToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 验证 JWT Token
export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

// 获取当前用户（从 Cookie）
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const user = verifyToken(token);
  if (!user) return null;

  // 验证用户是否仍然存在
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) return null;

  return user;
}

// 设置 Session Cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

// 清除 Session Cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// 生成验证码（模拟）
export function generateVerificationCode(): string {
  // 开发阶段固定为 123456
  return '123456';
}

// 验证验证码
export async function verifyCode(phone: string, code: string): Promise<boolean> {
  // 开发阶段接受固定验证码
  if (code === '123456') return true;

  // 生产环境需要查询数据库
  const record = await prisma.verificationCode.findFirst({
    where: {
      phone,
      code,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  return !!record;
}

// 保存验证码到数据库
export async function saveVerificationCode(phone: string, code: string) {
  // 删除旧的验证码
  await prisma.verificationCode.deleteMany({
    where: { phone },
  });

  // 创建新验证码（5分钟有效期）
  await prisma.verificationCode.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });
}