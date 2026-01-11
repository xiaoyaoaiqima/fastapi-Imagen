import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import configRouter from './routes/config.js';
import { getConfig } from './services/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api', chatRouter);
app.use('/api', configRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 AI Flowchart 后端服务启动成功`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🔑 环境: ${process.env.NODE_ENV || 'development'}`);

  if (!process.env.ZHIPU_API_KEY) {
    console.warn('⚠️  警告: 未设置 ZHIPU_API_KEY 环境变量');
  }
});
