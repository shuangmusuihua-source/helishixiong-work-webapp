import Anthropic from '@anthropic-ai/sdk';
import { PLAN_OUTLINE_PROMPT, GENERATE_CONTENT_PROMPT } from './prompts';
import type { Outline, PlanRequest } from '@/types';
import { sleep } from '@/lib/utils';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

const MODEL_ID = process.env.ANTHROPIC_MODEL_ID || 'astron-code-latest';
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 2000;

export async function generateOutline(request: PlanRequest & { targetPageCount?: number }): Promise<Outline> {
  const { content, targetPageCount } = request;

  // 构建用户消息，包含目标页数
  let userMessage = `请根据以下内容生成幻灯片大纲：\n\n${content}`;
  if (targetPageCount) {
    userMessage += `\n\n**重要要求：请生成正好 ${targetPageCount} 页内容页（不包括封面和尾页）。**`;
  }

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL_ID,
        max_tokens: 4096,
        system: PLAN_OUTLINE_PROMPT,
        messages,
      });

      const textBlock = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );

      if (!textBlock) throw new Error('No text response from Claude');

      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const outline: Outline = JSON.parse(jsonMatch[0]);

      if (!outline.title || !Array.isArray(outline.slides)) {
        throw new Error('Invalid outline structure');
      }

      return outline;
    } catch (error) {
      console.error(`[AI] 大纲生成失败 (尝试 ${attempt}/${MAX_RETRIES}):`, error);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_BASE * attempt);
      }
    }
  }

  throw new Error('生成大纲失败');
}

export async function generatePageContentStream(
  slideInfo: { title: string; content_type: string; summary: string },
  context: string,
  onToken: (token: string) => void
): Promise<Record<string, unknown>> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const stream = await anthropic.messages.stream({
        model: MODEL_ID,
        max_tokens: 2048,
        system: GENERATE_CONTENT_PROMPT,
        messages: [{
          role: 'user',
          content: `根据以下上下文和页面信息，生成详细的幻灯片内容：

上下文：${context}

页面标题：${slideInfo.title}
内容类型：${slideInfo.content_type}
摘要：${slideInfo.summary}

请生成对应的 JSON 内容结构。`,
        }],
      });

      stream.on('text', (token) => {
        try {
          onToken(token);
        } catch {
          // Stream callback may fail if connection is closed, ignore
        }
      });

      const finalMessage = await stream.finalMessage();

      const textBlock = finalMessage.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );

      if (!textBlock) throw new Error('No text response from Claude');

      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error) {
      console.error(`[AI] 页面生成失败 (尝试 ${attempt}/${MAX_RETRIES}):`, error);
      if (attempt < MAX_RETRIES) {
        try {
          onToken(`\n⚠️ 重试中 (${attempt}/${MAX_RETRIES})...\n`);
        } catch {
          // Ignore callback errors during retry
        }
        await sleep(RETRY_DELAY_BASE * attempt);
      }
    }
  }

  // Return empty content instead of throwing - allows generation to continue
  console.warn('[AI] AI generation failed after all retries, using default content');
  return {};
}