import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// 解析项目 JSON 字段
function parseProject(project: {
  id: string;
  userId: string;
  title: string;
  outline: string;
  themeId: string;
  workMode: string;
  coverImage: string | null;
  slidePages: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...project,
    outline: JSON.parse(project.outline),
    slidePages: JSON.parse(project.slidePages),
  };
}

// GET - 获取单个项目
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 });
    }

    return NextResponse.json({ project: parseProject(project) });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: '获取项目失败' }, { status: 500 });
  }
}

// DELETE - 删除项目
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: '删除项目失败' }, { status: 500 });
  }
}

// PATCH - 更新项目
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const existingProject = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 });
    }

    // 处理 JSON 字段
    const updateData: Record<string, unknown> = { ...body };
    if (body.outline) updateData.outline = JSON.stringify(body.outline);
    if (body.slidePages) updateData.slidePages = JSON.stringify(body.slidePages);

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ project: parseProject(project) });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: '更新项目失败' }, { status: 500 });
  }
}