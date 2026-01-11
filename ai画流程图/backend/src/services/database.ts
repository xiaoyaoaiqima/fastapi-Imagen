import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'logs.db'));

// 创建日志表
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip TEXT,
    user_agent TEXT,
    messages TEXT,
    response_time INTEGER,
    token_count INTEGER,
    error TEXT
  );
`);

// 创建用户配置表
db.exec(`
  CREATE TABLE IF NOT EXISTS user_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export interface ChatLog {
  id?: number;
  timestamp?: string;
  ip: string;
  user_agent: string;
  messages: string;
  response_time: number;
  token_count?: number;
  error?: string;
}

export const logChat = (log: ChatLog) => {
  const stmt = db.prepare(`
    INSERT INTO chat_logs (ip, user_agent, messages, response_time, token_count, error)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(log.ip, log.user_agent, log.messages, log.response_time, log.token_count, log.error);
};

export const getRecentLogs = (limit = 100) => {
  const stmt = db.prepare('SELECT * FROM chat_logs ORDER BY id DESC LIMIT ?');
  return stmt.all(limit);
};

// 用户配置相关接口和函数
export interface UserConfig {
  id?: number;
  key: string;
  value: string;
  updated_at?: string;
}

/**
 * 获取配置值
 */
export const getConfig = (key: string): string | null => {
  const stmt = db.prepare('SELECT value FROM user_config WHERE key = ?');
  const result = stmt.get(key) as { value: string } | undefined;
  return result?.value || null;
};

/**
 * 设置配置值
 */
export const setConfig = (key: string, value: string): void => {
  const stmt = db.prepare(`
    INSERT INTO user_config (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(key, value, value);
};

/**
 * 获取所有配置
 */
export const getAllConfig = (): Record<string, string> => {
  const stmt = db.prepare('SELECT key, value FROM user_config');
  const rows = stmt.all() as { key: string; value: string }[];
  const config: Record<string, string> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  return config;
};

export default db;
