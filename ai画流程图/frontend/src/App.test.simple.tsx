import React from 'react';
import Canvas from './components/Canvas';
import ChatPanel from './components/ChatPanel';
import SettingsPanel from './components/SettingsPanel';
import { ExcalidrawElement, ChatMessage } from './types/excalidraw';

const App: React.FC = () => {
  const [elements, setElements] = React.useState<ExcalidrawElement[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#ffffff',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        borderBottom: '1px solid #dee2e6',
        backgroundColor: '#ffffff',
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e1e1e' }}>
          AI 流程图生成器
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowSettings(true)} style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1e1e1e',
            backgroundColor: '#f1f3f5',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            cursor: 'pointer',
          }}>
            ⚙️ 设置
          </button>
          <button onClick={() => {
            if (confirm('确定要清空画布吗？')) {
              setElements([]);
            }
          }} style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1e1e1e',
            backgroundColor: '#f1f3f5',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            cursor: 'pointer',
          }}>
            清空画布
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'hidden', borderRight: '1px solid #dee2e6' }}>
          <Canvas
            elements={elements}
            onChange={(elems) => setElements(elems as ExcalidrawElement[])}
          />
        </div>

        {/* Chat Panel */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
          <ChatPanel
            onSend={async (msg) => {
              console.log('发送消息:', msg);
              setIsLoading(true);
              // TODO: 实现 AI 调用
              setTimeout(() => setIsLoading(false), 1000);
            }}
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

export default App;
