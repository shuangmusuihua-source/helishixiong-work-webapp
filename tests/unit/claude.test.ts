import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to define mocks before vi.mock runs
const { mockCreate, mockStream, mockOn, mockFinal } = vi.hoisted(() => {
  return {
    mockCreate: vi.fn(),
    mockStream: vi.fn(),
    mockOn: vi.fn(),
    mockFinal: vi.fn(),
  };
});

// Mock sleep to avoid delays in tests
vi.mock('@/lib/utils', () => ({
  sleep: vi.fn().mockResolvedValue(undefined),
  cn: vi.fn(),
  createHtmlBlob: vi.fn(),
  SSE_EVENT_TYPES: {},
}));

// Mock the module
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate,
        stream: mockStream,
      };
    },
  };
});

// Import after mock
import { generateOutline, generatePageContentStream } from '@/lib/llm/claude';

describe('Claude API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup stream mock
    mockStream.mockResolvedValue({
      on: mockOn,
      finalMessage: mockFinal,
    });

    // Reset environment
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    process.env.ANTHROPIC_BASE_URL = 'https://test.anthropic.com';
    process.env.ANTHROPIC_MODEL_ID = 'test-model';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateOutline', () => {
    it('should generate valid outline from content', async () => {
      const mockOutline = {
        title: '测试大纲',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '副标题' },
          { page_type: 'content', page_number: 1, title: '内容1', content_type: 'paragraph', summary: '摘要' },
          { page_type: 'end', title: '谢谢' },
        ],
      };

      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockOutline) }],
      });

      const result = await generateOutline({ content: '人工智能发展' });

      expect(result.title).toBe('测试大纲');
      expect(result.slides).toHaveLength(3);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should include target page count in request', async () => {
      const mockOutline = {
        title: '测试',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '' },
          { page_type: 'content', page_number: 1, title: '内容', content_type: 'paragraph', summary: '' },
          { page_type: 'end' },
        ],
      };

      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockOutline) }],
      });

      await generateOutline({ content: '测试内容', targetPageCount: 5 });

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('5 页内容页');
    });

    it('should extract JSON from markdown code block', async () => {
      const mockOutline = {
        title: '测试',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '' },
          { page_type: 'end' },
        ],
      };

      mockCreate.mockResolvedValue({
        content: [{
          type: 'text',
          text: `这是一些文本\n\`\`\`json\n${JSON.stringify(mockOutline)}\n\`\`\`\n更多文本`,
        }],
      });

      const result = await generateOutline({ content: '测试' });

      expect(result.title).toBe('测试');
    });

    it('should retry on failure', async () => {
      const mockOutline = {
        title: '测试',
        slides: [
          { page_type: 'cover', title: '封面', subtitle: '' },
          { page_type: 'end' },
        ],
      };

      mockCreate
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: JSON.stringify(mockOutline) }],
        });

      const result = await generateOutline({ content: '测试' });

      expect(result.title).toBe('测试');
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      mockCreate.mockRejectedValue(new Error('Persistent error'));

      await expect(generateOutline({ content: '测试' })).rejects.toThrow('生成大纲失败');
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it('should validate outline structure', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ slides: [] }) }],
      });

      await expect(generateOutline({ content: '测试' })).rejects.toThrow();
    });

    it('should validate slides array', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ title: '测试' }) }],
      });

      await expect(generateOutline({ content: '测试' })).rejects.toThrow();
    });

    it('should use correct model from environment', async () => {
      const mockOutline = {
        title: '测试',
        slides: [{ page_type: 'cover', title: '封面', subtitle: '' }, { page_type: 'end' }],
      };

      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockOutline) }],
      });

      await generateOutline({ content: '测试' });

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.model).toBe('test-model');
    });

    it('should use system prompt', async () => {
      const mockOutline = {
        title: '测试',
        slides: [{ page_type: 'cover', title: '封面', subtitle: '' }, { page_type: 'end' }],
      };

      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockOutline) }],
      });

      await generateOutline({ content: '测试' });

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.system).toContain('幻灯片');
    });
  });

  describe('generatePageContentStream', () => {
    it('should generate content and call onToken callback', async () => {
      const mockContent = { text: '测试内容', highlight: ['关键词'] };

      mockOn.mockImplementation((event: string, callback: (token: string) => void) => {
        if (event === 'text') {
          callback(JSON.stringify(mockContent));
        }
      });

      mockFinal.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockContent) }],
      });

      const onToken = vi.fn();
      const result = await generatePageContentStream(
        { title: '测试', content_type: 'paragraph', summary: '摘要' },
        '上下文',
        onToken
      );

      expect(result).toEqual(mockContent);
    });

    it('should extract JSON from response', async () => {
      const mockContent = { items: [{ label: '指标', value: 100 }] };

      mockOn.mockImplementation(() => {});
      mockFinal.mockResolvedValue({
        content: [{
          type: 'text',
          text: `一些文本 ${JSON.stringify(mockContent)} 更多文本`,
        }],
      });

      const result = await generatePageContentStream(
        { title: '测试', content_type: 'data-cards', summary: '摘要' },
        '上下文',
        vi.fn()
      );

      expect(result).toEqual(mockContent);
    });

    it('should return empty object on failure after retries', async () => {
      mockStream.mockRejectedValue(new Error('Stream error'));

      const result = await generatePageContentStream(
        { title: '测试', content_type: 'paragraph', summary: '摘要' },
        '上下文',
        vi.fn()
      );

      expect(result).toEqual({});
    });

    it('should pass correct parameters to stream API', async () => {
      mockOn.mockImplementation(() => {});
      mockFinal.mockResolvedValue({
        content: [{ type: 'text', text: '{}' }],
      });

      await generatePageContentStream(
        { title: '测试标题', content_type: 'list', summary: '测试摘要' },
        '测试上下文',
        vi.fn()
      );

      const callArgs = mockStream.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('测试标题');
      expect(callArgs.messages[0].content).toContain('list');
      expect(callArgs.messages[0].content).toContain('测试摘要');
      expect(callArgs.messages[0].content).toContain('测试上下文');
    });

    it('should use correct max_tokens', async () => {
      mockOn.mockImplementation(() => {});
      mockFinal.mockResolvedValue({
        content: [{ type: 'text', text: '{}' }],
      });

      await generatePageContentStream(
        { title: '测试', content_type: 'paragraph', summary: '摘要' },
        '上下文',
        vi.fn()
      );

      const callArgs = mockStream.mock.calls[0][0];
      expect(callArgs.max_tokens).toBe(2048);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-text content blocks', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'image', source: {} }],
      });

      await expect(generateOutline({ content: '测试' })).rejects.toThrow();
    });

    it('should handle malformed JSON response', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: '这不是JSON' }],
      });

      await expect(generateOutline({ content: '测试' })).rejects.toThrow();
    });

    it('should handle empty response', async () => {
      mockCreate.mockResolvedValue({
        content: [],
      });

      await expect(generateOutline({ content: '测试' })).rejects.toThrow();
    });
  });
});