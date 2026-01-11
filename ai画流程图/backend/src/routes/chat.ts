import express from 'express';
import { AIServiceFactory } from '../services/aiProvider.js';
import { logChat, getConfig } from '../services/database.js';

const router = express.Router();

/**
 * POST /api/chat
 * 流式 AI 对话接口
 */
router.post('/chat', async (req, res) => {
  const startTime = Date.now();
  const { messages, provider = 'zhipu', model = 'glm-4-flash' } = req.body;

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 提取客户端信息
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  let fullContent = '';
  let hasError = false;

  try {
    // 优先从数据库获取 API Key，其次使用环境变量
    let apiKey = getConfig('api_key');
    if (!apiKey) {
      apiKey = process.env.ZHIPU_API_KEY || '';
    }

    if (!apiKey) {
      throw new Error('未配置 API Key，请在设置中配置');
    }

    // 获取 AI 服务
    const aiService = AIServiceFactory.create(provider, {
      apiKey,
      model,
    });

    // 流式响应
    const stream = aiService.chatStream({ messages });

    for await (const chunk of stream) {
      if (chunk.done) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      } else {
        fullContent += chunk.content;
        res.write(`data: ${JSON.stringify({ content: chunk.content, done: false })}\n\n`);
      }
    }

    const responseTime = Date.now() - startTime;

    // 记录日志
    logChat({
      ip,
      user_agent: userAgent,
      messages: JSON.stringify(messages),
      response_time: responseTime,
      token_count: fullContent.length,
    });

  } catch (error) {
    hasError = true;
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('聊天 API 错误:', error);

    res.write(`data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`);

    // 记录错误日志
    logChat({
      ip,
      user_agent: userAgent,
      messages: JSON.stringify(messages),
      response_time: Date.now() - startTime,
      error: errorMessage,
    });
  } finally {
    res.end();
  }
});

export default router;
