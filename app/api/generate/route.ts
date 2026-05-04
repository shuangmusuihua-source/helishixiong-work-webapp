import { NextRequest } from 'next/server';
import { generateSlideHtml, generateFullHtml, type StreamCallback } from '@/lib/generator';
import { SSE_EVENT_TYPES } from '@/lib/utils';
import type { GenerateRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { outline, theme_id } = body;

    if (!outline?.slides?.length) {
      return new Response(JSON.stringify({ error: '大纲不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const slidesHtml: string[] = [];
    const context = `主题：${outline.title}\n大纲概览：\n${outline.slides
      .map((s, i) => `${i + 1}. ${s.title}${s.page_type === 'content' && s.summary ? ` - ${s.summary}` : ''}`)
      .join('\n')}`;

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          for (let i = 0; i < outline.slides.length; i++) {
            send({ page_num: i + 1, total: outline.slides.length, status: 'generating', title: outline.slides[i].title });

            const streamCallback: StreamCallback = (event) => {
              if (event.type === SSE_EVENT_TYPES.AI_TEXT && event.text) {
                send({ type: SSE_EVENT_TYPES.AI_TEXT, text: event.text });
              } else if (event.type === SSE_EVENT_TYPES.AI_COMPLETE) {
                send({ type: SSE_EVENT_TYPES.AI_COMPLETE });
              } else if (event.type === SSE_EVENT_TYPES.ERROR) {
                send({ type: SSE_EVENT_TYPES.ERROR, error: event.error });
              }
            };

            const result = await generateSlideHtml(outline.slides[i], theme_id, outline.slides.length, context, streamCallback);
            slidesHtml.push(result.html);
            send({ type: SSE_EVENT_TYPES.PAGE_COMPLETE, page_num: i + 1, html: result.html });
          }

          const fullHtml = await generateFullHtml(outline, theme_id, slidesHtml);
          const fileId = `slides-${Date.now()}`;

          send({ type: SSE_EVENT_TYPES.COMPLETE, file_id: fileId, page_count: outline.slides.length, html: fullHtml });
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          send({ type: SSE_EVENT_TYPES.ERROR, error: `生成失败: ${(error as Error).message}` });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return new Response(JSON.stringify({ error: '生成失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}