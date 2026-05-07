import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Use vi.hoisted for mock functions
const mockGenerateSlideHtml = vi.hoisted(() => vi.fn());
const mockGenerateFullHtml = vi.hoisted(() => vi.fn());
const mockGenerateSinglePageHtml = vi.hoisted(() => vi.fn());

vi.mock('@/lib/generator', () => ({
  generateSlideHtml: mockGenerateSlideHtml,
  generateFullHtml: mockGenerateFullHtml,
  generateSinglePageHtml: mockGenerateSinglePageHtml,
}));

// Import after mock
import { POST as generatePost } from '@/app/api/generate/route';

// Helper to read stream events
async function readStreamEvents(response: Response): Promise<object[]> {
  const reader = response.body?.getReader();
  if (!reader) return [];

  const events: object[] = [];
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          events.push(JSON.parse(line.slice(6)));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  return events;
}

describe('/api/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock responses
    mockGenerateSlideHtml.mockResolvedValue({
      html: '<html><body>Slide Content</body></html>',
    });
    mockGenerateFullHtml.mockResolvedValue('<html><body>Full Document</body></html>');
    mockGenerateSinglePageHtml.mockResolvedValue('<html><body>Single Page</body></html>');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST', () => {
    it('should return 400 for empty outline', async () => {
      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ outline: null, theme_id: 'default' }),
      });

      const response = await generatePost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('大纲不能为空');
    });

    it('should return 400 for outline with no slides', async () => {
      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ outline: { title: 'Test', slides: [] }, theme_id: 'default' }),
      });

      const response = await generatePost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('大纲不能为空');
    });

    it('should generate slides and return SSE stream', async () => {
      const outline = {
        title: '测试大纲',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '副标题' },
          { page_type: 'content', page_number: 1, title: '内容1', content_type: 'paragraph', summary: '摘要' },
          { page_type: 'end', title: '谢谢' },
        ],
      };

      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ outline, theme_id: 'business-modern' }),
      });

      const response = await generatePost(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should call generateSlideHtml for each slide', async () => {
      const outline = {
        title: '测试',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '' },
          { page_type: 'end' },
        ],
      };

      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ outline, theme_id: 'default' }),
      });

      const response = await generatePost(request);
      await readStreamEvents(response);

      expect(mockGenerateSlideHtml).toHaveBeenCalledTimes(2);
    });

    it('should pass correct theme_id to generator', async () => {
      const outline = {
        title: '测试',
        slides: [{ page_type: 'cover', title: '封面', subtitle: '' }],
      };

      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ outline, theme_id: 'custom-theme' }),
      });

      const response = await generatePost(request);
      await readStreamEvents(response);

      const callArgs = mockGenerateSlideHtml.mock.calls[0];
      expect(callArgs[1]).toBe('custom-theme');
    });

    it('should adjust slides based on page_count in advanced mode', async () => {
      const outline = {
        title: '测试',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '' },
          { page_type: 'content', page_number: 1, title: '内容1', content_type: 'paragraph', summary: '' },
          { page_type: 'content', page_number: 2, title: '内容2', content_type: 'paragraph', summary: '' },
          { page_type: 'content', page_number: 3, title: '内容3', content_type: 'paragraph', summary: '' },
          { page_type: 'end' },
        ],
      };

      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          outline,
          theme_id: 'default',
          work_mode: 'advanced',
          page_count: 2, // Request only 2 content pages
        }),
      });

      const response = await generatePost(request);
      await readStreamEvents(response);

      // Should only generate for 2 content slides + cover + end = 4
      expect(mockGenerateSlideHtml).toHaveBeenCalledTimes(4);
    });

    it('should pass motion_level to generator', async () => {
      const outline = {
        title: '测试',
        slides: [{ page_type: 'cover', title: '封面', subtitle: '' }],
      };

      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          outline,
          theme_id: 'default',
          motion_level: 'rich',
        }),
      });

      const response = await generatePost(request);
      await readStreamEvents(response);

      const callArgs = mockGenerateSlideHtml.mock.calls[0];
      expect(callArgs[5]).toBe('rich');
    });

    it('should handle generation errors gracefully', async () => {
      mockGenerateSlideHtml.mockRejectedValue(new Error('Generation failed'));

      const outline = {
        title: '测试',
        slides: [{ page_type: 'cover', title: '封面', subtitle: '' }],
      };

      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ outline, theme_id: 'default' }),
      });

      const response = await generatePost(request);

      // Should still return 200 with stream, error will be in stream
      expect(response.status).toBe(200);
    });

    it('should generate full HTML after all slides', async () => {
      const outline = {
        title: '测试',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '' },
          { page_type: 'end' },
        ],
      };

      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ outline, theme_id: 'default' }),
      });

      const response = await generatePost(request);
      await readStreamEvents(response);

      expect(mockGenerateFullHtml).toHaveBeenCalledTimes(1);
    });

    it('should generate single page HTML for each slide', async () => {
      const outline = {
        title: '测试',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '' },
          { page_type: 'end' },
        ],
      };

      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ outline, theme_id: 'default' }),
      });

      const response = await generatePost(request);
      await readStreamEvents(response);

      expect(mockGenerateSinglePageHtml).toHaveBeenCalledTimes(2);
    });

    it('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost/api/generate', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await generatePost(request);

      expect(response.status).toBe(500);
    });
  });
});
