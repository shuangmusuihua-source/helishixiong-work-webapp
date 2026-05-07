import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - 获取用户的项目列表
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // 解析 JSON 字段
    const parsedProjects = projects.map((p) => ({
      ...p,
      outline: JSON.parse(p.outline),
      slidePages: JSON.parse(p.slidePages),
    }));

    return NextResponse.json({ projects: parsedProjects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: '获取项目列表失败' }, { status: 500 });
  }
}

// POST - 创建新项目
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
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
        userId: session.user.id,
        title,
        outline: JSON.stringify(outline),
        themeId,
        workMode,
        coverImage,
        slidePages: JSON.stringify(slidePages || []),
      },
    });

    return NextResponse.json({
      project: {
        ...project,
        outline: JSON.parse(project.outline),
        slidePages: JSON.parse(project.slidePages),
      },
    });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: '创建项目失败' }, { status: 500 });
  }
}