import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET - 获取用户的项目列表
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'slides' | 'document'

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
        // 可以根据 workMode 过滤
        ...(type === 'slides' ? {} : {}),
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        themeId: true,
        workMode: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
        outline: true,
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: '获取项目列表失败' }, { status: 500 });
  }
}

// POST - 创建新项目
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, outline, themeId, workMode, coverImage, slidePages } = body;

    if (!title || !outline || !themeId || !workMode) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        title,
        outline,
        themeId,
        workMode,
        coverImage,
        slidePages: slidePages || [],
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: '创建项目失败' }, { status: 500 });
  }
}