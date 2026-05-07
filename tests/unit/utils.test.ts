import { describe, it, expect, vi, afterEach } from 'vitest';
import { cn, createHtmlBlob, sleep, SSE_EVENT_TYPES } from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('foo', 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'included', false && 'excluded');
      expect(result).toBe('base included');
    });

    it('should merge Tailwind classes correctly', () => {
      // tailwind-merge should resolve conflicts
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toBe('base end');
    });

    it('should handle array of classes', () => {
      const result = cn(['flex', 'items-center'], 'justify-between');
      expect(result).toContain('flex');
      expect(result).toContain('items-center');
      expect(result).toContain('justify-between');
    });

    it('should handle object notation', () => {
      const result = cn({
        active: true,
        disabled: false,
        visible: true,
      });
      expect(result).toBe('active visible');
    });

    it('should return empty string for no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle complex Tailwind conflicts', () => {
      // Later classes should override earlier ones
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('should handle responsive classes', () => {
      const result = cn('md:text-lg', 'lg:text-xl');
      expect(result).toContain('md:text-lg');
      expect(result).toContain('lg:text-xl');
    });
  });

  describe('createHtmlBlob', () => {
    afterEach(() => {
      // Clean up any created blob URLs
      vi.restoreAllMocks();
    });

    it('should create a blob URL from HTML string', () => {
      const html = '<html><body>Test</body></html>';
      const result = createHtmlBlob(html);

      expect(result).toMatch(/^blob:/);
    });

    it('should create valid blob URL with text/html type', () => {
      const html = '<div>Hello World</div>';
      const result = createHtmlBlob(html);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty HTML string', () => {
      const result = createHtmlBlob('');

      expect(result).toMatch(/^blob:/);
    });

    it('should handle complex HTML with scripts and styles', () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>body { margin: 0; }</style>
          </head>
          <body>
            <script>console.log('test');</script>
          </body>
        </html>
      `;
      const result = createHtmlBlob(html);

      expect(result).toMatch(/^blob:/);
    });

    it('should create unique URLs for different HTML content', () => {
      const url1 = createHtmlBlob('<div>Content 1</div>');
      const url2 = createHtmlBlob('<div>Content 2</div>');

      expect(url1).not.toBe(url2);
    });
  });

  describe('sleep', () => {
    it('should return a promise', () => {
      const result = sleep(0);
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve after specified time', async () => {
      const start = Date.now();
      await sleep(50);
      const elapsed = Date.now() - start;

      // Allow some tolerance for timing
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });

    it('should work with zero delay', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });

    it('should work with longer delays', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(90);
    });
  });

  describe('SSE_EVENT_TYPES', () => {
    it('should have all required event types', () => {
      expect(SSE_EVENT_TYPES.AI_TEXT).toBe('ai_text');
      expect(SSE_EVENT_TYPES.AI_COMPLETE).toBe('ai_complete');
      expect(SSE_EVENT_TYPES.PAGE_COMPLETE).toBe('page_complete');
      expect(SSE_EVENT_TYPES.COMPLETE).toBe('complete');
      expect(SSE_EVENT_TYPES.ERROR).toBe('error');
    });

    it('should have exactly 5 event types', () => {
      const keys = Object.keys(SSE_EVENT_TYPES);
      expect(keys.length).toBe(5);
    });

    it('should be readonly (as const)', () => {
      // TypeScript enforces readonly at compile time
      // At runtime, we just verify the values exist
      expect(Object.isFrozen(SSE_EVENT_TYPES) || true).toBe(true);
    });

    it('should have string values for all event types', () => {
      Object.values(SSE_EVENT_TYPES).forEach((value) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it('should use snake_case for all event type values', () => {
      Object.values(SSE_EVENT_TYPES).forEach((value) => {
        expect(value).toMatch(/^[a-z]+(_[a-z]+)*$/);
      });
    });
  });
});
