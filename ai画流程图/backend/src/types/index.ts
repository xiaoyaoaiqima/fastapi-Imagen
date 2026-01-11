export interface ChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  provider?: string;
  model?: string;
}

export interface ChatResponse {
  content: string;
  done: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
