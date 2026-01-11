# 快速启动指南

## 安装步骤

### 1. 安装依赖
```bash
npm run install:all
```

### 2. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，填入你的智谱 API Key：

```env
ZHIPU_API_KEY=你的智谱API密钥
PORT=3001
NODE_ENV=development
```

**获取智谱 API Key**：
1. 访问 https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入"API密钥"页面
4. 创建新的 API 密钥

### 3. 启动服务

**方式一：同时启动前后端（推荐）**
```bash
npm run dev
```

**方式二：分别启动**
```bash
# 终端 1：启动后端
npm run dev:backend

# 终端 2：启动前端
npm run dev:frontend
```

### 4. 访问应用

打开浏览器访问：http://localhost:3000

## 使用示例

在右侧对话框中输入：

1. **流程图**
   ```
   画一个用户注册流程：填写信息 → 验证邮箱 → 设置密码 → 注册成功
   ```

2. **架构图**
   ```
   创建微服务架构图，包含 API 网关、用户服务、订单服务、数据库
   ```

3. **时序图**
   ```
   画一个客户端请求服务器的时序图
   ```

## 功能说明

### 左侧画布
- 🎨 Excalidraw 手绘风格
- ✏️ 支持手动编辑图形
- 💾 自动保存到 localStorage

### 右侧对话
- 💬 自然语言生成图表
- 📝 保留对话历史
- 🔄 支持多轮上下文

### 工具栏
- 清空画布
- 清空对话历史
- 导出功能（Excalidraw 内置）

## 技术架构

### 核心特性

1. **流式 JSON 解析**
   - 智能状态机解析
   - 支持嵌套花括号
   - 自动修复 JSON 错误

2. **AI 服务兼容层**
   - 统一接口抽象
   - 支持多供应商切换
   - SSE 流式输出

3. **Excalidraw 集成**
   - 自动补全默认字段
   - 智能布局计算
   - 文本宽度自动调整

## 开发命令

```bash
# 安装所有依赖
npm run install:all

# 开发模式
npm run dev                # 同时启动前后端
npm run dev:backend        # 仅启动后端
npm run dev:frontend       # 仅启动前端

# 构建
npm run build              # 构建所有
npm run build:backend      # 构建后端
npm run build:frontend     # 构建前端
```

## 故障排除

### 后端启动失败
- 检查端口 3001 是否被占用
- 确认 Node.js 版本 >= 18
- 检查 `.env` 文件是否存在

### 前端启动失败
- 检查端口 3000 是否被占用
- 确认依赖是否安装完整
- 清除缓存：`rm -rf node_modules && npm install`

### AI 调用失败
- 检查 API Key 是否正确
- 确认网络连接正常
- 查看智谱 AI 额度是否用完

### 画布不显示
- 打开浏览器控制台查看错误
- 清除 localStorage：开发者工具 → Application → Local Storage → Clear
- 刷新页面

## 项目结构

```
ai画流程图/
├── frontend/           # React 前端
│   ├── src/
│   │   ├── components/    # Canvas, ChatPanel
│   │   ├── services/      # AI 服务
│   │   ├── utils/         # 解析器、存储
│   │   └── types/         # TypeScript 类型
│   └── package.json
├── backend/            # Node.js 后端
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   ├── services/      # AI、数据库
│   │   └── index.ts       # 主服务
│   └── package.json
└── README.md
```

## 下一步

- [ ] 添加更多 AI 提供商
- [ ] 支持图表模板
- [ ] 导出 SVG/PNG
- [ ] 移动端适配
- [ ] 协作编辑

## 许可证

MIT
