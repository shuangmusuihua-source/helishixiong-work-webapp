import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyCode, createToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: '请输入手机号和验证码' },
        { status: 400 }
      );
    }

    // 验证验证码
    const isValid = await verifyCode(phone, code);
    if (!isValid) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      );
    }

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // 创建新用户
      user = await prisma.user.create({
        data: {
          phone,
          name: `用户${phone.slice(-4)}`,
        },
      });
    }

    // 创建 JWT Token
    const token = createToken(user);

    // 设置 Cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}