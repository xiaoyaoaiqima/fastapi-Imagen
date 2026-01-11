const BASE_URL = import.meta.env.DEV ? '/api' : window.location.origin + '/api';

export interface ConfigResponse {
  success: boolean;
  config?: Record<string, string>;
  error?: string;
}

export interface ConfigItemResponse {
  success: boolean;
  key?: string;
  value?: string;
  error?: string;
}

/**
 * 配置服务
 */
export class ConfigService {
  /**
   * 获取所有配置
   */
  async getAllConfig(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${BASE_URL}/config`);
      const data: ConfigResponse = await response.json();
      if (data.success && data.config) {
        return data.config;
      }
      return {};
    } catch (error) {
      console.error('获取配置失败:', error);
      return {};
    }
  }

  /**
   * 获取单个配置
   */
  async getConfig(key: string): Promise<string | null> {
    try {
      const response = await fetch(`${BASE_URL}/config/${key}`);
      const data: ConfigItemResponse = await response.json();
      if (data.success && data.value) {
        return data.value;
      }
      return null;
    } catch (error) {
      console.error('获取配置失败:', error);
      return null;
    }
  }

  /**
   * 设置配置
   */
  async setConfig(key: string, value: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });
      const data: ConfigResponse = await response.json();
      return data.success;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  }

  /**
   * 检查是否已配置 API Key
   */
  async hasApiKey(): Promise<boolean> {
    const apiKey = await this.getConfig('api_key');
    return !!apiKey && apiKey.length > 10; // 至少要有一定的长度
  }
}

// 导出单例
export const configService = new ConfigService();
