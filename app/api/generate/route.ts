import { NextRequest } from 'next/server';
import { generateSlideHtml, generateFullHtml } from '@/lib/generator';
import type { GenerateRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { outline, theme_id } = body;

    if (!outline || !outline.slides || outline.slides.length === 0) {
      return new Response(JSON.stringify({ error: '大纲不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const slidesHtml: string[] = [];

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < outline.slides.length; i++) {
            // 发送进度事件
            const progressEvent = {
              page_num: i + 1,
              total: outline.slides.length,
              status: 'generating',
            };
            controller.enqueue(
              encoder.encode(`event: progress\ndata: ${JSON.stringify(progressEvent)}\n\n`)
            );

            // 生成单页 HTML
            const slideHtml = await generateSlideHtml(outline.slides[i], theme_id);
            slidesHtml.push(slideHtml);

            // 发送页面事件
            const pageEvent = {
              page_num: i + 1,
              html: slideHtml,
            };
            controller.enqueue(
              encoder.encode(`event: page\ndata: ${JSON.stringify(pageEvent)}\n\n`)
            );

            // 模拟生成延迟（实际生产中可移除）
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // 生成完整 HTML
          const fullHtml = await generateFullHtml(outline, theme_id, slidesHtml);
          const fileId = `slides-${Date.now()}`;

          // 发送完成事件
          const completeEvent = {
            file_id: fileId,
            page_count: outline.slides.length,
            html: fullHtml,
          };
          controller.enqueue(
            encoder.encode(`event: complete\ndata: ${JSON.stringify(completeEvent)}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: '生成失败' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return new Response(JSON.stringify({ error: '生成失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}