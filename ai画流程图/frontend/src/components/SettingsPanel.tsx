import React, { useState, useEffect } from 'react';
import { configService } from '../services/configService';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [model, setModel] = useState('glm-4.7');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  // 可用模型列表
  const availableModels = [
    { value: 'glm-4.7', label: 'GLM-4.7 (最新，推荐)' },
    { value: 'glm-4-flash', label: 'GLM-4-Flash (快速，适合测试)' },
    { value: 'glm-z1-flash', label: 'GLM-Z1-Flash (推理模型)' },
    { value: 'glm-z1-air', label: 'GLM-Z1-Air (推理模型，轻量)' },
    { value: 'glm-4-plus', label: 'GLM-4-Plus (强大)' },
    { value: 'glm-4-air', label: 'GLM-4-Air (轻量)' },
    { value: 'glm-4', label: 'GLM-4 (标准)' },
  ];

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await configService.getAllConfig();
        if (config.api_key) {
          setMaskedKey(config.api_key);
        }
        if (config.model) {
          // 确保加载的模型在可用列表中
          const isValidModel = availableModels.some(m => m.value === config.model);
          setModel(isValidModel ? config.model : 'glm-4.7');
        }
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setSaveMessage('API Key 不能为空');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      // 保存 API Key
      const success = await configService.setConfig('api_key', apiKey.trim());
      if (success) {
        setSaveMessage('✅ 保存成功');
        setMaskedKey(apiKey.slice(0, 8) + '...');
        setApiKey('');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setSaveMessage('❌ 保存失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      setSaveMessage('❌ 保存失败');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleClear = async () => {
    if (!confirm('确定要清除 API Key 吗？清除后将无法使用 AI 功能。')) {
      return;
    }

    setIsSaving(true);
    try {
      const success = await configService.setConfig('api_key', '');
      if (success) {
        setMaskedKey('');
        setSaveMessage('✅ 已清除');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('清除配置失败:', error);
      setSaveMessage('❌ 清除失败');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // 测试 API 连接
  const handleTest = async () => {
    setIsTesting(true);
    setTestResult('');

    try {
      const baseURL = import.meta.env.DEV ? '/api' : window.location.origin + '/api';
      const response = await fetch(`${baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Hello! 请用一句话回复。' }
          ],
          model: model,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法获取响应流');

      const decoder = new TextDecoder();
      let result = '';
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
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.content) {
                result += parsed.content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      if (result) {
        setTestResult(`✅ 连接成功！AI 回复：${result.slice(0, 100)}${result.length > 100 ? '...' : ''}`);
      } else {
        setTestResult('⚠️ 连接成功，但未收到回复内容');
      }
    } catch (error) {
      console.error('测试失败:', error);
      setTestResult(`❌ 测试失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>⚙️ 设置</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.content}>
          {/* API Key 配置 */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🔑 API Key 配置</h3>

            {maskedKey && !apiKey && (
              <div style={styles.currentConfig}>
                <span style={styles.label}>当前配置：</span>
                <code style={styles.code}>{maskedKey}</code>
                <button onClick={handleClear} style={styles.clearButton}>
                  清除
                </button>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                智谱 AI API Key
                <a
                  href="https://open.bigmodel.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  (获取密钥)
                </a>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入你的智谱 AI API Key"
                style={styles.input}
                disabled={isSaving}
              />
              <p style={styles.hint}>
                API Key 将加密存储在数据库中，仅用于 AI 调用
              </p>
            </div>
          </div>

          {/* 模型选择 */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🤖 模型选择</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>AI 模型</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={styles.select}
                disabled={isSaving || isTesting}
              >
                {availableModels.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p style={styles.hint}>
                不同模型的性能和价格不同，可根据需求选择
              </p>
            </div>

            {/* 测试连接 */}
            <div style={styles.testSection}>
              <button
                onClick={handleTest}
                disabled={isTesting || !maskedKey}
                style={{
                  ...styles.testButton,
                  ...(maskedKey && !isTesting ? styles.testButtonActive : {}),
                }}
              >
                {isTesting ? '🔄 测试中...' : '🧪 测试 API 连接'}
              </button>
              {!maskedKey && (
                <p style={styles.hint}>请先保存 API Key 后再测试</p>
              )}
              {testResult && (
                <div style={{
                  ...styles.testResult,
                  backgroundColor: testResult.startsWith('✅') ? '#d3f9d8' : 
                                   testResult.startsWith('⚠️') ? '#fff3bf' : '#ffe3e3',
                }}>
                  {testResult}
                </div>
              )}
            </div>
          </div>

          {/* 保存按钮 */}
          <div style={styles.actions}>
            {saveMessage && (
              <div style={styles.message}>{saveMessage}</div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !apiKey.trim()}
              style={{
                ...styles.saveButton,
                ...(apiKey.trim() && !isSaving ? styles.saveButtonActive : {}),
              }}
            >
              {isSaving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #dee2e6',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#1e1e1e',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#868e96',
    cursor: 'pointer',
    padding: '4px 8px',
    transition: 'color 0.2s',
  },
  content: {
    padding: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e1e1e',
  },
  currentConfig: {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#495057',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    appearance: 'auto' as const,
    WebkitAppearance: 'menulist' as const,
    color: '#1e1e1e',
  },
  hint: {
    margin: '8px 0 0 0',
    fontSize: '12px',
    color: '#868e96',
    lineHeight: '1.4',
  },
  code: {
    padding: '4px 8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#495057',
  },
  clearButton: {
    padding: '4px 12px',
    fontSize: '12px',
    color: '#e03131',
    backgroundColor: 'transparent',
    border: '1px solid #e03131',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  link: {
    marginLeft: '8px',
    fontSize: '12px',
    color: '#1971c2',
    textDecoration: 'none',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px',
  },
  message: {
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    color: '#495057',
  },
  saveButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#868e96',
    backgroundColor: '#f1f3f5',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
    transition: 'all 0.2s',
  },
  saveButtonActive: {
    color: '#ffffff',
    backgroundColor: '#1971c2',
    cursor: 'pointer',
  },
  testSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e9ecef',
  },
  testButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#868e96',
    backgroundColor: '#f1f3f5',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
    transition: 'all 0.2s',
    width: '100%',
  },
  testButtonActive: {
    color: '#ffffff',
    backgroundColor: '#37b24d',
    cursor: 'pointer',
  },
  testResult: {
    marginTop: '12px',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '13px',
    lineHeight: '1.5',
    wordBreak: 'break-all',
  },
};

export default SettingsPanel;
