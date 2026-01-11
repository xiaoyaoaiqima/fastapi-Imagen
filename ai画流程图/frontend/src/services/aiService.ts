import { ChatMessage } from '../types/excalidraw';
import { SYSTEM_PROMPT, enhanceUserPrompt } from '../utils/prompts';

export interface StreamResponse {
  content: string;
  done: boolean;
  error?: string;
}

/**
 * AI 服务类
 */
export class AIService {
  private baseURL: string;

  constructor() {
    // 开发环境使用代理，生产环境直接访问
    this.baseURL = import.meta.env.DEV
      ? '/api'
      : window.location.origin + '/api';
  }

  /**
   * 流式对话
   */
  async *chatStream(
    userMessage: string,
    history: ChatMessage[]
  ): AsyncGenerator<StreamResponse> {
    const messages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT,
      },
      ...history
        .filter((msg) => msg.role !== 'system')
        .slice(-10) // 只保留最近 10 条消息
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      {
        role: 'user' as const,
        content: enhanceUserPrompt(userMessage),
      },
    ];

    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法获取响应流');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            try {
              const parsed = JSON.parse(data);
              if (parsed.done) {
                yield { content: '', done: true };
              } else if (parsed.error) {
                yield { content: '', done: true, error: parsed.error };
              } else if (parsed.content) {
                yield { content: parsed.content, done: false };
              }
            } catch (e) {
              console.error('解析 SSE 数据失败:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('AI 调用失败:', error);
      yield {
        content: '',
        done: true,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }
}

// 导出单例
export const aiService = new AIService();
