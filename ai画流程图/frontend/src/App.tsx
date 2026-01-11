import React, { useState, useEffect, useCallback } from 'react';
import Canvas from './components/Canvas';
import ChatPanel from './components/ChatPanel';
import SettingsPanel from './components/SettingsPanel';
import { ReactDevToolsConnector } from './components/ReactDevToolsConnector';
import { ExcalidrawElement, ChatMessage } from './types/excalidraw';
import { StreamingJSONParser } from './utils/StreamingJSONParser';
import { aiService } from './services/aiService';
import { configService } from './services/configService';
import { chatStorage, canvasStorage } from './utils/storage';

const App: React.FC = () => {
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 加载保存的数据
  useEffect(() => {
    const savedData = canvasStorage.get();
    if (savedData && savedData.elements.length > 0) {
      setElements(savedData.elements);
    }
    const savedMessages = chatStorage.get();
    setMessages(savedMessages);
  }, []);

  // 处理画布变更
  const handleCanvasChange = useCallback((elems: readonly ExcalidrawElement[]) => {
    setElements(elems as ExcalidrawElement[]);
    canvasStorage.updateElements(elems as ExcalidrawElement[]);
  }, []);

  // 添加消息并同步到 storage
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      chatStorage.save(updated);
      return updated;
    });
  }, []);

  // 清空聊天历史
  const handleClearChat = useCallback(() => {
    setMessages([]);
    chatStorage.clear();
  }, []);

  // 处理 AI 生成
  const handleAISend = async (userMessage: string) => {
    // 添加用户消息
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    setIsLoading(true);
    setStreamingContent('');
    
    const parser = new StreamingJSONParser();
    const newElements: ExcalidrawElement[] = [];
    let fullContent = '';

    try {
      // 流式获取 AI 响应
      for await (const chunk of aiService.chatStream(userMessage, messages)) {
        if (chunk.error) {
          // 添加错误消息
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `❌ 生成失败：${chunk.error}`,
            timestamp: Date.now(),
          };
          addMessage(errorMessage);
          setStreamingContent('');
          break;
        }

        if (chunk.done) {
          // 生成完成，保存 AI 消息
          const summary = newElements.length > 0 
            ? `✅ 已生成 ${newElements.length} 个图形元素`
            : '⚠️ 未能解析到有效的图形元素';
          
          const aiMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: summary + (fullContent ? `\n\n原始输出:\n${fullContent.slice(0, 500)}${fullContent.length > 500 ? '...' : ''}` : ''),
            timestamp: Date.now(),
          };
          addMessage(aiMessage);
          setStreamingContent('');

          // 渲染所有元素
          if (newElements.length > 0) {
            setElements((prev) => [...prev, ...newElements]);
            canvasStorage.updateElements([...elements, ...newElements]);
          }
          break;
        }

        // 实时显示流式内容
        fullContent += chunk.content;
        setStreamingContent(fullContent);

        // 流式解析 JSON
        const result = parser.parse(chunk.content);
        if (result.elements.length > 0) {
          newElements.push(...result.elements);
        }
      }
    } catch (error) {
      console.error('AI 生成失败:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ 生成失败：${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
      addMessage(errorMessage);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  };

  // 清空画布
  const handleClearCanvas = () => {
    if (confirm('确定要清空画布吗？')) {
      setElements([]);
      canvasStorage.clear();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>AI 流程图生成器</h1>
        <div style={styles.headerActions}>
          <button onClick={() => setShowSettings(true)} style={styles.headerButton}>
            ⚙️ 设置
          </button>
          <button onClick={handleClearCanvas} style={styles.headerButton}>
            清空画布
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.headerLink}
          >
            GitHub
          </a>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.canvasContainer}>
          <Canvas elements={elements} onChange={handleCanvasChange} />
        </div>
        <div style={styles.chatContainer}>
          <ChatPanel 
            messages={messages}
            streamingContent={streamingContent}
            onSend={handleAISend} 
            onClearHistory={handleClearChat}
            isLoading={isLoading} 
          />
        </div>
      </div>

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#ffffff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderBottom: '1px solid #dee2e6',
    backgroundColor: '#ffffff',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#1e1e1e',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  headerButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e1e1e',
    backgroundColor: '#f1f3f5',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  headerLink: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1971c2',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  canvasContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  chatContainer: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
  },
};

export default App;
