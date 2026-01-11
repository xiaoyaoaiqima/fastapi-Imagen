import { ExcalidrawElement, ChatMessage, ExcalidrawData } from '../types/excalidraw';

const STORAGE_KEYS = {
  CHAT_HISTORY: 'ai-flowchart-chat-history',
  CANVAS_DATA: 'ai-flowchart-canvas-data',
} as const;

/**
 * 聊天历史存储
 */
export const chatStorage = {
  get: (): ChatMessage[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('读取聊天历史失败:', error);
      return [];
    }
  },

  save: (messages: ChatMessage[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch (error) {
      console.error('保存聊天历史失败:', error);
    }
  },

  add: (message: ChatMessage): void => {
    const messages = chatStorage.get();
    messages.push(message);
    chatStorage.save(messages);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  },
};

/**
 * 画布数据存储
 */
export const canvasStorage = {
  get: (): ExcalidrawData | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CANVAS_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('读取画布数据失败:', error);
      return null;
    }
  },

  save: (data: ExcalidrawData): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CANVAS_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('保存画布数据失败:', error);
    }
  },

  updateElements: (elements: ExcalidrawElement[]): void => {
    const currentData = canvasStorage.get() || { elements: [], appState: {} };
    currentData.elements = elements;
    canvasStorage.save(currentData);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CANVAS_DATA);
  },
};
