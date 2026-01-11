import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('错误边界捕获到错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          backgroundColor: '#fff5f5',
        }}>
          <h2 style={{ color: '#c92a2a' }}>⚠️ 应用出现错误</h2>
          <details style={{ marginTop: '20px', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
              查看错误详情
            </summary>
            <pre style={{
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              overflow: 'auto',
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1971c2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            重新加载页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
