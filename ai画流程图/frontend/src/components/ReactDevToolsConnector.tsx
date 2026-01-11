import { useEffect } from 'react';

/**
 * React DevTools 连接器
 * 连接到 MCP React DevTools 服务器（端口 8097）
 */
export function ReactDevToolsConnector() {
  useEffect(() => {
    // Only in development
    if (import.meta.env.DEV) {
      // Connect to standalone React DevTools server on port 8097
      const script = document.createElement('script');
      script.src = 'http://localhost:8097';
      script.onload = () => {
        console.log('✅ Connected to React DevTools server on localhost:8097');
      };
      script.onerror = () => {
        console.warn('⚠️ Could not connect to React DevTools server. Make sure MCP server is running.');
      };
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  return null; // No UI
}
