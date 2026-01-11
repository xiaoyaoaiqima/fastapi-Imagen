# AI 流程图生成器

基于 AI + Excalidraw 的手绘风格绘图工具，通过自然语言对话生成流程图、架构图等技术文档图表。

## 功能特性

- ✅ **自然语言生成**: 用描述性语言直接生成图表
- ✅ **流式解析**: 实时解析 AI 输出的 JSON 元素
- ✅ **多轮对话**: 支持上下文理解的连续对话
- ✅ **本地存储**: 对话历史和画布数据自动保存
- ✅ **手绘风格**: Excalidraw 美观的手绘效果
- ✅ **错误修复**: 智能修复常见 JSON 格式错误

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Excalidraw
- localStorage

### 后端
- Node.js + Express
- TypeScript
- SQLite
- 智谱 AI (GLM-4)

## 项目结构

```
ai画流程图/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/     # React 组件
│   │   │   ├── Canvas.tsx       # Excalidraw 画布封装
│   │   │   └── ChatPanel.tsx    # 对话面板
│   │   ├── services/       # 服务层
│   │   │   └── aiService.ts     # AI API 调用
│   │   ├── utils/          # 工具函数
│   │   │   ├── StreamingJSONParser.ts  # 流式 JSON 解析器
│   │   │   ├── prompts.ts          # AI 提示词
│   │   │   └── storage.ts          # localStorage 封装
│   │   ├── types/          # 类型定义
│   │   │   └── excalidraw.ts       # Excalidraw 类型
│   │   ├── App.tsx         # 主应用
│   │   └── main.tsx        # 入口文件
│   ├── package.json
│   └── vite.config.ts
├── backend/                # 后端项目
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   │   └── chat.ts          # 聊天 API
│   │   ├── services/       # 服务层
│   │   │   ├── aiProvider.ts     # AI 服务抽象层
│   │   │   └── database.ts       # SQLite 数据库
│   │   ├── types/          # 类型定义
│   │   └── index.ts        # 主服务
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
ZHIPU_API_KEY=your_zhipu_api_key_here
PORT=3001
NODE_ENV=development
```

获取智谱 API Key: https://open.bigmodel.cn/

### 3. 启动服务

```bash
# 启动后端（在 backend 目录）
npm run dev

# 启动前端（在 frontend 目录）
npm run dev
```

### 4. 访问应用

打开浏览器访问 http://localhost:3000

## 使用示例

在对话框中输入描述：

- "画一个用户登录流程图"
- "创建微服务架构图，包含 API 网关、用户服务和订单服务"
- "画一个 RESTful API 请求处理流程"

## 核心特性说明

### 流式 JSON 解析

前端实现了智能流式 JSON 解析器 ([StreamingJSONParser.ts](frontend/src/utils/StreamingJSONParser.ts))，支持：

- 处理嵌套花括号
- 识别字符串内的花括号（不进行计数）
- 处理转义字符
- 自动修复常见 JSON 错误

### AI 服务兼容层

后端实现了 AI 服务抽象层 ([aiProvider.ts](backend/src/services/aiProvider.ts))，支持：

- 统一的 AI 服务接口
- 灵活切换 AI 提供商（智谱、OpenAI 等）
- 流式输出（SSE）
- 错误处理和日志记录

### Excalidraw 元素补全

自动补全 Excalidraw 必需字段：

- 坐标和尺寸
- 颜色和样式
- 随机种子和版本号
- 文本元素自动计算宽度

## 开发计划

- [ ] 支持更多 AI 提供商（OpenAI、阿里百炼等）
- [ ] 添加图表模板库
- [ ] 支持导出 SVG/PNG
- [ ] 添加移动端适配
- [ ] 支持协作编辑

## 许可证

MIT
