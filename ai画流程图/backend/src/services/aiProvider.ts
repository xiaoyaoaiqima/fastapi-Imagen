export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

/**
 * AI 服务抽象接口
 */
export abstract class AIProvider {
  abstract name: string;
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  /**
   * 流式对话
   */
  abstract chatStream(options: ChatOptions): AsyncGenerator<StreamChunk>;
}

/**
 * 智谱 AI 提供商
 */
export class ZhipuAIProvider extends AIProvider {
  name = 'zhipu';
  private baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

  async *chatStream(options: ChatOptions): AsyncGenerator<StreamChunk> {
    const { messages, temperature = 0.7, maxTokens = 8192 } = options;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model || 'glm-4-flash',
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`智谱 API 错误: ${response.status} ${response.statusText}`);
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
            if (data === '[DONE]') {
              yield { content: '', done: true };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                yield { content, done: false };
              }
            } catch (e) {
              console.error('解析 SSE 数据失败:', e);
            }
          }
        }
      }

      yield { content: '', done: true };
    } catch (error) {
      console.error('智谱 AI 调用失败:', error);
      throw error;
    }
  }
}

/**
 * OpenAI 提供商（预留）
 */
export class OpenAIProvider extends AIProvider {
  name = 'openai';
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  async *chatStream(options: ChatOptions): AsyncGenerator<StreamChunk> {
    // 类似实现，兼容 OpenAI 格式
    throw new Error('OpenAI provider 未实现');
  }
}

/**
 * AI 服务工厂
 */
export class AIServiceFactory {
  private static providers: Map<string, AIProvider> = new Map();

  static register(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }

  static get(name: string): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new Error(`未找到 AI 提供商: ${name}`);
    return provider;
  }

  static create(name: string, config: AIProviderConfig): AIProvider {
    switch (name) {
      case 'zhipu':
        return new ZhipuAIProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      default:
        throw new Error(`不支持的 AI 提供商: ${name}`);
    }
  }
}
