import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test-api-key';
process.env.ANTHROPIC_BASE_URL = 'https://test.anthropic.com';
process.env.ANTHROPIC_MODEL_ID = 'test-model';
process.env.BETTER_AUTH_SECRET = 'test-secret-min-32-characters-long';
process.env.BETTER_AUTH_URL = 'http://localhost:3000';
