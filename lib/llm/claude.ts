import Anthropic from '@anthropic-ai/sdk';
import { PLAN_OUTLINE_PROMPT, GENERATE_CONTENT_PROMPT } from './prompts';
import type { Outline, PlanRequest } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateOutline(
  request: PlanRequest
): Promise<Outline> {
  const { content } = request;

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `请根据以下内容生成幻灯片大纲：\n\n${content}`,
    },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: PLAN_OUTLINE_PROMPT,
    messages,
  });

  // 提取 JSON 响应
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  if (!textBlock) {
    throw new Error('No text response from Claude');
  }

  // 解析 JSON
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  const outline: Outline = JSON.parse(jsonMatch[0]);

  // 验证大纲结构
  if (!outline.title || !Array.isArray(outline.slides)) {
    throw new Error('Invalid outline structure');
  }

  return outline;
}

export async function generatePageContent(
  slideInfo: {
    title: string;
    content_type: string;
    summary: string;
  },
  context: string
): Promise<Record<string, unknown>> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: GENERATE_CONTENT_PROMPT,
    messages: [
      {
        role: 'user',
        content: `根据以下上下文和页面信息，生成详细的幻灯片内容：

上下文：${context}

页面标题：${slideInfo.title}
内容类型：${slideInfo.content_type}
摘要：${slideInfo.summary}

请生成对应的 JSON 内容结构。`,
      },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  if (!textBlock) {
    throw new Error('No text response from Claude');
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {};
  }

  return JSON.parse(jsonMatch[0]);
}