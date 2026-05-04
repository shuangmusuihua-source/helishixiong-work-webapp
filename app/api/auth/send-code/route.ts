import { NextRequest, NextResponse } from 'next/server';
import { generateVerificationCode, saveVerificationCode } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: '请输入手机号' },
        { status: 400 }
      );
    }

    // 验证手机号格式（简单验证）
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 生成验证码
    const code = generateVerificationCode();

    // 保存验证码到数据库
    await saveVerificationCode(phone, code);

    // 开发环境返回验证码（生产环境不返回）
    return NextResponse.json({
      success: true,
      message: '验证码已发送',
      // 开发环境直接返回验证码
      code: process.env.NODE_ENV === 'development' ? code : undefined,
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json(
      { error: '发送验证码失败' },
      { status: 500 }
    );
  }
}