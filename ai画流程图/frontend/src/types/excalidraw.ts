/**
 * Excalidraw 元素类型定义（简化版）
 */
export type ElementType =
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'text'
  | 'arrow'
  | 'line'
  | 'freedraw';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: 'solid' | 'hachure' | 'cross-hatch';
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  roughness: number;
  opacity: number;
  groupIds: string[];
  frameId?: string;
  index: string;
  roundness?: { type: 'round' | 'not-rounded'; value?: number };
  seed: number;
  version: number;
  isDeleted: boolean;
  boundElements?: Record<string, { type: string; id: string }[]>;
  updated?: number;
  link?: string;
  locked?: boolean;
}

export interface RectangleElement extends BaseElement {
  type: 'rectangle';
}

export interface EllipseElement extends BaseElement {
  type: 'ellipse';
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: number;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  containerId?: string;
  originalText: string;
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  points: [[number, number], ...[number, number][]];
  startArrowhead?: string | null;
  endArrowhead?: string | null;
  startBinding?: {
    type: string;
    elementId: string;
    focus?: number;
    gap?: number;
  };
  endBinding?: {
    type: string;
    elementId: string;
    focus?: number;
    gap?: number;
  };
  elbowed?: boolean;
  lastCommittedPoint?: [number, number];
  startAngle?: number;
  endAngle?: number;
}

export type ExcalidrawElement =
  | RectangleElement
  | EllipseElement
  | TextElement
  | ArrowElement;

export interface ExcalidrawData {
  elements: ExcalidrawElement[];
  appState?: {
    viewBackgroundColor: string;
    gridSize: number | null;
    theme: 'light' | 'dark';
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
