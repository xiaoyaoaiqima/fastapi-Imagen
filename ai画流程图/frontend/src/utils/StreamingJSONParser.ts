import { ExcalidrawElement } from '../types/excalidraw';

export interface ParseResult {
  elements: ExcalidrawElement[];
  isPartial: boolean;
  error?: string;
}

/**
 * 智能流式 JSON 解析器
 * 处理嵌套花括号、字符串内花括号、转义字符
 */
export class StreamingJSONParser {
  private buffer = '';
  private braceDepth = 0;
  private bracketDepth = 0;
  private inString = false;
  private escapeNext = false;
  private completedElements: ExcalidrawElement[] = [];
  private errors: string[] = [];

  /**
   * 添加数据块并尝试解析
   */
  parse(chunk: string): ParseResult {
    this.buffer += chunk;
    const result = this._tryParse();
    return {
      elements: result.elements,
      isPartial: result.isPartial,
      error: result.error,
    };
  }

  /**
   * 重置解析器状态
   */
  reset(): void {
    this.buffer = '';
    this.braceDepth = 0;
    this.bracketDepth = 0;
    this.inString = false;
    this.escapeNext = false;
    this.completedElements = [];
    this.errors = [];
  }

  /**
   * 获取所有已完成的元素
   */
  getCompletedElements(): ExcalidrawElement[] {
    return [...this.completedElements];
  }

  /**
   * 尝试解析缓冲区中的完整 JSON 对象/数组
   */
  private _tryParse(): ParseResult {
    const newElements: ExcalidrawElement[] = [];
    let i = 0;
    let startIndex = -1;

    while (i < this.buffer.length) {
      const char = this.buffer[i];

      // 处理转义字符
      if (this.escapeNext) {
        this.escapeNext = false;
        i++;
        continue;
      }

      // 处理字符串状态
      if (char === '\\') {
        this.escapeNext = true;
        i++;
        continue;
      }

      if (char === '"' && !this.escapeNext) {
        this.inString = !this.inString;
        i++;
        continue;
      }

      // 在字符串内，跳过所有花括号计算
      if (this.inString) {
        i++;
        continue;
      }

      // 计算括号深度
      if (char === '{') {
        if (this.braceDepth === 0 && this.bracketDepth === 0) {
          startIndex = i;
        }
        this.braceDepth++;
      } else if (char === '}') {
        this.braceDepth--;
      } else if (char === '[') {
        if (this.braceDepth === 0 && this.bracketDepth === 0) {
          startIndex = i;
        }
        this.bracketDepth++;
      } else if (char === ']') {
        this.bracketDepth--;
      }

      // 检测到完整 JSON 对象/数组
      if ((this.braceDepth === 0 || this.bracketDepth === 0) && startIndex >= 0) {
        const jsonStr = this.buffer.slice(startIndex, i + 1);
        const element = this._parseJSONElement(jsonStr);

        if (element) {
          newElements.push(element);
          this.completedElements.push(element);
        }

        // 清除已解析的内容
        this.buffer = this.buffer.slice(i + 1);
        startIndex = -1;
        i = 0;
        continue;
      }

      i++;
    }

    return {
      elements: newElements,
      isPartial: this.braceDepth > 0 || this.bracketDepth > 0,
      error: this.errors.length > 0 ? this.errors.join('; ') : undefined,
    };
  }

  /**
   * 解析单个 JSON 元素，带错误修复
   */
  private _parseJSONElement(jsonStr: string): ExcalidrawElement | null {
    try {
      // 尝试直接解析
      const element = JSON.parse(jsonStr);

      // 补全必需字段
      return this._fillDefaults(element);
    } catch (error) {
      // 尝试修复常见错误
      const fixed = this._fixCommonErrors(jsonStr);
      if (fixed) {
        try {
          const element = JSON.parse(fixed);
          return this._fillDefaults(element);
        } catch (e) {
          this.errors.push(`JSON 解析失败: ${e}`);
          return null;
        }
      }

      this.errors.push(`JSON 修复失败: ${error}`);
      return null;
    }
  }

  /**
   * 修复常见 JSON 错误
   */
  private _fixCommonErrors(jsonStr: string): string | null {
    let fixed = jsonStr.trim();

    // 1. 移除多余的逗号（如 {a: 1,} → {a: 1}）
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // 2. 修复未加引号的属性名（如 {a: 1} → {"a": 1}）
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');

    // 3. 修复单引号（如 {'a': 1} → {"a": 1}）
    fixed = fixed.replace(/'/g, '"');

    // 4. 移除注释（如 {"a": 1 /* comment */} → {"a": 1}）
    fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');
    fixed = fixed.replace(/\/\/.*/g, '');

    // 5. 修复尾随逗号在数组中（如 [1, 2,] → [1, 2]）
    fixed = fixed.replace(/,(\s*\])/g, '$1');

    return fixed;
  }

  /**
   * 补全 Excalidraw 必需的默认字段
   */
  private _fillDefaults(element: any): ExcalidrawElement {
    const seed = Math.floor(Math.random() * 2**31);

    const baseDefaults = {
      version: 1,
      isDeleted: false,
      groupIds: [],
      strokeSharpness: 'sharp' as const,
      seed,
      index: `${seed}`,
      updated: Date.now(),
    };

    switch (element.type) {
      case 'rectangle':
      case 'ellipse':
      case 'diamond':
        return {
          ...baseDefaults,
          x: element.x ?? 0,
          y: element.y ?? 0,
          width: element.width ?? 160,
          height: element.height ?? 80,
          strokeColor: element.strokeColor ?? '#1e1e1e',
          backgroundColor: element.backgroundColor ?? 'transparent',
          fillStyle: element.fillStyle ?? 'solid',
          strokeWidth: element.strokeWidth ?? 2,
          strokeStyle: element.strokeStyle ?? 'solid',
          roughness: element.roughness ?? 1,
          opacity: element.opacity ?? 100,
          roundness: element.roundness ?? null,
          boundElements: element.boundElements ?? {},
          ...element,
        };

      case 'text':
        // 自动计算文本宽度
        const textLength = element.text?.length || 0;
        const fontSize = element.fontSize ?? 20;
        const avgCharWidth = fontSize * 0.5; // 估算平均字符宽度

        return {
          ...baseDefaults,
          x: element.x ?? 0,
          y: element.y ?? 0,
          width: element.width ?? textLength * avgCharWidth + 20,
          height: element.height ?? fontSize + 10,
          strokeColor: element.strokeColor ?? '#1e1e1e',
          backgroundColor: element.backgroundColor ?? 'transparent',
          fillStyle: element.fillStyle ?? 'solid',
          strokeWidth: element.strokeWidth ?? 2,
          strokeStyle: element.strokeStyle ?? 'solid',
          roughness: element.roughness ?? 1,
          opacity: element.opacity ?? 100,
          text: element.text ?? '',
          fontSize: fontSize,
          fontFamily: element.fontFamily ?? 1,
          textAlign: element.textAlign ?? 'left',
          verticalAlign: element.verticalAlign ?? 'top',
          containerId: element.containerId ?? undefined,
          originalText: element.originalText ?? element.text ?? '',
          ...element,
        };

      case 'arrow':
      case 'line':
        return {
          ...baseDefaults,
          x: element.x ?? 0,
          y: element.y ?? 0,
          width: element.width ?? 100,
          height: element.height ?? 100,
          strokeColor: element.strokeColor ?? '#1e1e1e',
          backgroundColor: element.backgroundColor ?? 'transparent',
          fillStyle: element.fillStyle ?? 'solid',
          strokeWidth: element.strokeWidth ?? 2,
          strokeStyle: element.strokeStyle ?? 'solid',
          roughness: element.roughness ?? 1,
          opacity: element.opacity ?? 100,
          points: element.points ?? [[0, 0], [100, 100]],
          startArrowhead: element.startArrowhead ?? null,
          endArrowhead: element.endArrowhead ?? 'arrow',
          startBinding: element.startBinding ?? undefined,
          endBinding: element.endBinding ?? undefined,
          elbowed: element.elbowed ?? false,
          lastCommittedPoint: element.lastCommittedPoint ?? undefined,
          boundElements: element.boundElements ?? {},
          ...element,
        };

      default:
        return {
          ...baseDefaults,
          x: element.x ?? 0,
          y: element.y ?? 0,
          width: element.width ?? 100,
          height: element.height ?? 100,
          strokeColor: element.strokeColor ?? '#1e1e1e',
          backgroundColor: element.backgroundColor ?? 'transparent',
          fillStyle: element.fillStyle ?? 'solid',
          strokeWidth: element.strokeWidth ?? 2,
          strokeStyle: element.strokeStyle ?? 'solid',
          roughness: element.roughness ?? 1,
          opacity: element.opacity ?? 100,
          ...element,
        };
    }
  }
}
