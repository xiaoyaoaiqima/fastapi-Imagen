import express from 'express';
import { getConfig, setConfig, getAllConfig } from '../services/database.js';

const router = express.Router();

/**
 * GET /api/config
 * 获取所有配置
 */
router.get('/config', (req, res) => {
  try {
    const config = getAllConfig();
    // 隐藏 API Key 的敏感信息（只显示前 8 位）
    const sanitizedConfig = { ...config };
    if (sanitizedConfig.api_key) {
      sanitizedConfig.api_key = sanitizedConfig.api_key.slice(0, 8) + '...';
    }
    res.json({ success: true, config: sanitizedConfig });
  } catch (error) {
    console.error('获取配置失败:', error);
    res.status(500).json({ success: false, error: '获取配置失败' });
  }
});

/**
 * GET /api/config/:key
 * 获取单个配置值
 */
router.get('/config/:key', (req, res) => {
  try {
    const { key } = req.params;
    const value = getConfig(key);
    if (value === null) {
      return res.status(404).json({ success: false, error: '配置不存在' });
    }
    res.json({ success: true, key, value });
  } catch (error) {
    console.error('获取配置失败:', error);
    res.status(500).json({ success: false, error: '获取配置失败' });
  }
});

/**
 * POST /api/config
 * 设置配置值
 */
router.post('/config', (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    setConfig(key, value);
    res.json({ success: true, message: '配置保存成功' });
  } catch (error) {
    console.error('保存配置失败:', error);
    res.status(500).json({ success: false, error: '保存配置失败' });
  }
});

export default router;
