import { NextRequest, NextResponse } from 'next/server';
import { generateOutline } from '@/lib/llm/claude';
import type { PlanRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: PlanRequest = await request.json();

    // 验证请求
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      );
    }

    // 判断输入类型
    if (!body.input_type) {
      const content = body.content;
      if (content.length < 50 && !content.includes('\n')) {
        body.input_type = 'topic';
      } else {
        body.input_type = 'text';
      }
    }

    // 生成大纲
    const outline = await generateOutline(body);

    return NextResponse.json({ outline });
  } catch (error) {
    console.error('Plan generation error:', error);
    return NextResponse.json(
      { error: '大纲生成失败，请重试' },
      { status: 500 }
    );
  }
}