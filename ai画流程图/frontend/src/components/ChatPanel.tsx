import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/excalidraw';

interface ChatPanelProps {
  messages: ChatMessage[];
  streamingContent?: string;
  onSend: (message: string) => Promise<void>;
  onClearHistory: () => void;
  isLoading?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  streamingContent = '',
  onSend,
  onClearHistory,
  isLoading = false,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await onSend(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    if (confirm('确定要清空聊天历史吗？')) {
      onClearHistory();
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>AI 对话</h3>
        <button onClick={clearHistory} style={styles.clearButton}>
          清空历史
        </button>
      </div>

      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <p>开始与 AI 对话来生成图表</p>
            <p style={styles.hint}>试试说："画一个用户登录流程图"</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.message,
                ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage),
              }}
            >
              <div style={styles.messageRole}>
                {message.role === 'user' ? '👤 用户' : '🤖 AI'}
              </div>
              <div style={styles.messageContent}>{message.content}</div>
              <div style={styles.messageTime}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ ...styles.message, ...styles.assistantMessage, ...styles.streamingMessage }}>
            <div style={styles.messageRole}>🤖 AI <span style={styles.streamingBadge}>生成中...</span></div>
            <div style={styles.messageContent}>
              {streamingContent ? (
                <pre style={styles.streamingContent}>{streamingContent}</pre>
              ) : (
                <span style={styles.loading}>正在连接 AI 服务...</span>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="描述你想生成的图表... (Shift+Enter 换行)"
          style={styles.textarea}
          disabled={isLoading}
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            ...styles.sendButton,
            ...(input.trim() && !isLoading ? styles.sendButtonActive : {}),
          }}
        >
          {isLoading ? '生成中...' : '发送'}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#f8f9fa',
    borderLeft: '1px solid #dee2e6',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #dee2e6',
    backgroundColor: '#ffffff',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e1e1e',
  },
  clearButton: {
    padding: '6px 12px',
    fontSize: '12px',
    color: '#e03131',
    backgroundColor: 'transparent',
    border: '1px solid #e03131',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#868e96',
    padding: '40px 20px',
  },
  hint: {
    fontSize: '14px',
    marginTop: '8px',
  },
  message: {
    padding: '12px',
    borderRadius: '8px',
    maxWidth: '85%',
    wordWrap: 'break-word',
  },
  userMessage: {
    backgroundColor: '#a5d8ff',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  assistantMessage: {
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    alignSelf: 'flex-start',
  },
  messageRole: {
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '6px',
    color: '#495057',
  },
  messageContent: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#1e1e1e',
    whiteSpace: 'pre-wrap',
  },
  messageTime: {
    fontSize: '11px',
    color: '#868e96',
    marginTop: '6px',
  },
  loading: {
    color: '#1971c2',
    fontStyle: 'italic',
  },
  streamingMessage: {
    borderLeft: '3px solid #1971c2',
    animation: 'pulse 1.5s infinite',
  },
  streamingBadge: {
    fontSize: '10px',
    backgroundColor: '#1971c2',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '10px',
    marginLeft: '8px',
    animation: 'blink 1s infinite',
  },
  streamingContent: {
    margin: 0,
    padding: '8px',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '300px',
    overflowY: 'auto',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  inputContainer: {
    padding: '12px',
    borderTop: '1px solid #dee2e6',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  sendButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#868e96',
    backgroundColor: '#f1f3f5',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
    transition: 'all 0.2s',
    alignSelf: 'flex-end',
  },
  sendButtonActive: {
    color: '#ffffff',
    backgroundColor: '#1971c2',
    cursor: 'pointer',
  },
};

export default ChatPanel;
