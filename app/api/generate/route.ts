import { NextRequest } from 'next/server';
import { generateSlideHtml, generateFullHtml, generateSinglePageHtml, type StreamCallback } from '@/lib/generator';
import { SSE_EVENT_TYPES } from '@/lib/utils';
import type { GenerateRequest, WorkMode, Slide, ContentSlide } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { outline, theme_id, work_mode, aesthetic, page_count, text_density, motion_level } = body;

    console.log('[API] Generate request received:', {
      theme_id,
      work_mode,
      slides_count: outline?.slides?.length,
      aesthetic,
      page_count,
      text_density,
      motion_level
    });

    if (!outline?.slides?.length) {
      return new Response(JSON.stringify({ error: '大纲不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 根据配置的页数调整大纲
    let adjustedSlides = outline.slides;
    if (page_count && work_mode === 'advanced') {
      const contentSlides = outline.slides.filter(s => s.page_type === 'content');
      const coverSlide = outline.slides.find(s => s.page_type === 'cover');
      const endSlide = outline.slides.find(s => s.page_type === 'end');

      // 如果配置的页数与当前不同，调整内容页数量
      if (contentSlides.length !== page_count) {
        if (contentSlides.length > page_count) {
          // 裁剪多余的内容页
          const trimmedContent = contentSlides.slice(0, page_count);
          adjustedSlides = [
            ...(coverSlide ? [coverSlide] : []),
            ...trimmedContent,
            ...(endSlide ? [endSlide] : [])
          ];
        } else {
          // 如果需要更多页，保持原样（AI 已经生成了合理的大纲）
          console.log('[API] Requested more pages than available, using all content slides');
        }
      }

      console.log('[API] Adjusted slides count:', adjustedSlides.length, '(content pages:', page_count, ')');
    }

    const adjustedOutline = { ...outline, slides: adjustedSlides };

    const encoder = new TextEncoder();
    const slidesHtml: string[] = [];
    const singlePageHtmls: string[] = []; // 存储单页完整 HTML
    const context = `主题：${adjustedOutline.title}\n大纲概览：\n${adjustedOutline.slides
      .map((s, i) => `${i + 1}. ${s.title}${s.page_type === 'content' && s.summary ? ` - ${s.summary}` : ''}`)
      .join('\n')}`;

    // Add advanced mode context if applicable
    const advancedContext = work_mode === 'advanced'
      ? `\n高级模式参数：审美风格=${aesthetic || '默认'}, 目标页数=${page_count || adjustedOutline.slides.length}, 文字密度=${text_density || 'standard'}, 动画程度=${motion_level || 'subtle'}`
      : '';

    const fullContext = context + advancedContext;

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          for (let i = 0; i < adjustedOutline.slides.length; i++) {
            send({ page_num: i + 1, total: adjustedOutline.slides.length, status: 'generating', title: adjustedOutline.slides[i].title });

            const streamCallback: StreamCallback = (event) => {
              try {
                if (event.type === SSE_EVENT_TYPES.AI_TEXT && event.text) {
                  send({ type: SSE_EVENT_TYPES.AI_TEXT, text: event.text });
                } else if (event.type === SSE_EVENT_TYPES.AI_COMPLETE) {
                  send({ type: SSE_EVENT_TYPES.AI_COMPLETE });
                } else if (event.type === SSE_EVENT_TYPES.ERROR) {
                  // Log error but don't send to stream to avoid breaking it
                  console.warn('[API] Stream callback error (not breaking stream):', event.error);
                }
              } catch (callbackError) {
                console.warn('[API] Stream callback failed (stream may be closed):', callbackError);
              }
            };

            const result = await generateSlideHtml(adjustedOutline.slides[i], theme_id, adjustedOutline.slides.length, fullContext, streamCallback, motion_level || 'subtle');
            slidesHtml.push(result.html);

            console.log(`[API] Slide ${i + 1} generated, HTML length:`, result.html.length);
            console.log(`[API] Slide ${i + 1} HTML preview:`, result.html.substring(0, 300));

            // 生成单页完整 HTML 用于缩略图
            const singleHtml = await generateSinglePageHtml(result.html, theme_id, i, adjustedOutline.slides.length);
            singlePageHtmls.push(singleHtml);

            console.log(`[API] Single page HTML generated, length:`, singleHtml.length);

            // 发送完整页面 HTML
            send({ type: SSE_EVENT_TYPES.PAGE_COMPLETE, page_num: i + 1, html: singleHtml });
          }

          const fullHtml = await generateFullHtml(adjustedOutline, theme_id, slidesHtml);
          const fileId = `slides-${Date.now()}`;

          send({ type: SSE_EVENT_TYPES.COMPLETE, file_id: fileId, page_count: adjustedOutline.slides.length, html: fullHtml, pages: singlePageHtmls });
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