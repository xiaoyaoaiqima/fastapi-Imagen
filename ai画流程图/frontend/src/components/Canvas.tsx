import React, { useEffect, useRef, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { ExcalidrawElement } from '../types/excalidraw';

interface CanvasProps {
  elements?: ExcalidrawElement[];
  onChange?: (elements: readonly ExcalidrawElement[]) => void;
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  elements = [],
  onChange,
  className = '',
}) => {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    // 加载初始数据
    if (elements.length > 0) {
      setInitialData({
        elements,
        appState: {
          viewBackgroundColor: '#ffffff',
          gridSize: null,
          theme: 'light',
        },
      });
    }
  }, [elements]);

  const handleChange = (
    elems: readonly ExcalidrawElement[],
    state: any
  ) => {
    if (onChange) {
      onChange(elems);
    }
  };

  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <Excalidraw
        ref={excalidrawRef}
        initialData={initialData}
        onChange={handleChange}
        viewModeEnabled={false}
        zenModeEnabled={false}
        gridModeEnabled={false}
        theme="light"
      />
    </div>
  );
};

export default Canvas;
