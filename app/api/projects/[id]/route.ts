import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET - 获取单个项目
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 });
    }

    return NextResponse.json({ project });
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
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // 验证项目所有权
    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
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
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    // 验证项目所有权
    const existingProject = await prisma.project.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: '更新项目失败' }, { status: 500 });
  }
}