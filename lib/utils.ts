import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 创建 HTML Blob URL
export function createHtmlBlob(html: string): string {
  return URL.createObjectURL(new Blob([html], { type: 'text/html' }))
}

// 延迟函数
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// SSE 事件类型常量
export const SSE_EVENT_TYPES = {
  AI_TEXT: 'ai_text',
  AI_COMPLETE: 'ai_complete',
  PAGE_COMPLETE: 'page_complete',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const