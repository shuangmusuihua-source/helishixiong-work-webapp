import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Use vi.hoisted for mock functions
const mockGenerateOutline = vi.hoisted(() => vi.fn());

vi.mock('@/lib/llm/claude', () => ({
  generateOutline: mockGenerateOutline,
}));

// Import after mock
import { POST as planPost } from '@/app/api/plan/route';

describe('/api/plan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST', () => {
    it('should generate outline from valid content', async () => {
      const mockOutline = {
        title: '测试大纲',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '副标题' },
          { page_type: 'content', page_number: 1, title: '内容1', content_type: 'paragraph', summary: '摘要' },
          { page_type: 'end', title: '谢谢' },
        ],
      };

      mockGenerateOutline.mockResolvedValue(mockOutline);

      const request = new NextRequest('http://localhost/api/plan', {
        method: 'POST',
        body: JSON.stringify({ content: '人工智能发展' }),
      });

      const response = await planPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.outline).toEqual(mockOutline);
      expect(mockGenerateOutline).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for empty content', async () => {
      const request = new NextRequest('http://localhost/api/plan', {
        method: 'POST',
        body: JSON.stringify({ content: '' }),
      });

      const response = await planPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('内容不能为空');
    });

    it('should return 400 for whitespace-only content', async () => {
      const request = new NextRequest('http://localhost/api/plan', {
        method: 'POST',
        body: JSON.stringify({ content: '   ' }),
      });

      const response = await planPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('内容不能为空');
    });

    it('should auto-detect topic input type for short content', async () => {
      const mockOutline = {
        title: '测试',
        slides: [{ page_type: 'cover', title: '封面', subtitle: '' }, { page_type: 'end' }],
      };

      mockGenerateOutline.mockResolvedValue(mockOutline);

      const request = new NextRequest('http://localhost/api/plan', {
        method: 'POST',
        body: JSON.stringify({ content: '短话题' }), // < 50 chars, no newline
      });

      await planPost(request);

      const callArgs = mockGenerateOutline.mock.calls[0][0];
      expect(callArgs.input_type).toBe('topic');
    });

    it('should auto-detect text input type for long content', async () => {
      const mockOutline = {
        title: '测试',
        slides: [{ page_type: 'cover', title: '封面', subtitle: '' }, { page_type: 'end' }],
      };

      mockGenerateOutline.mockResolvedValue(mockOutline);

      // Content > 50 chars to be detected as text
      const longContent = '这是一段很长的文本内容，超过了五十个字符的限制，应该被识别为文本类型输入而不是话题类型输入。这是一段很长的文本内容。';

      const request = new NextRequest('http://localhost/api/plan', {
        method: 'POST',
        body: JSON.stringify({ content: longContent }),
      });

      await planPost(request);

      const callArgs = mockGenerateOutline.mock.calls[0][0];
      expect(callArgs.input_type).toBe('text');
    });

    it('should auto-detect text input type for multiline content', async () => {
      const mockOutline = {
        title: '测试',
        slides: [{ page_type: 'cover', title: '封面', subtitle: '' }, { page_type: 'end' }],
      };

      mockGenerateOutline.mockResolvedValue(mockOutline);

      const request = new NextRequest('http://localhost/api/plan', {
        method: 'POST',
        body: JSON.stringify({ content: '第一行\n第二行' }), // Has newline
      });

      await planPost(request);

      const callArgs = mockGenerateOutline.mock.calls[0][0];
      expect(callArgs.input_type).toBe('text');
    });

    it('should pass targetPageCount to generateOutline', async () => {
      const mockOutline = {
        title: '测试',
        slides: [{ page_type: 'cover', title: '封面', subtitle: '' }, { page_type: 'end' }],
      };

      mockGenerateOutline.mockResolvedValue(mockOutline);

      const request = new NextRequest('http://localhost/api/plan', {
        method: 'POST',
        body: JSON.stringify({ content: '测试', targetPageCount: 5 }),
      });

      await planPost(request);

      const callArgs = mockGenerateOutline.mock.calls[0][0];
      expect(callArgs.targetPageCount).toBe(5);
    });

    it('should preserve explicit input_type', async () => {
      const mockOutline = {
        title: '测试',
        slides: [{ page_type: 'cover', title: '封面', subtitle: '' }, { page_type: 'end' }],
      };

      mockGenerateOutline.mockResolvedValue(mockOutline);

      const request = new NextRequest('http://localhost/api/plan', {
        method: 'POST',
        body: JSON.stringify({ content: '测试内容', input_type: 'file' }),
      });

      await planPost(request);

      const callArgs = mockGenerateOutline.mock.calls[0][0];
      expect(callArgs.input_type).toBe('file');
    });

    it('should return 500 on generation error', async () => {
      mockGenerateOutline.mockRejectedValue(new Error('Generation failed'));

      const request = new NextRequest('http://localhost/api/plan', {
        method: 'POST',
        body: JSON.stringify({ content: '测试' }),
      });

      const response = await planPost(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('大纲生成失败，请重试');
    });

    it('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost/api/plan', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await planPost(request);

      expect(response.status).toBe(500);
    });
  });
});
