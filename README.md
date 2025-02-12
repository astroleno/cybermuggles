# AI 聊天应用

基于 Next.js 14 构建的 AI 聊天应用，支持流式输出。

## 技术栈

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- shadcn/ui
- React Query
- Axios

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 运行开发服务器：
```bash
npm run dev
```

3. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 使用说明

1. 在首页输入 API URL、模型名称和 API Key
2. 点击"开始聊天"进入聊天界面
3. 在输入框中输入消息并发送
4. 等待 AI 响应（支持流式输出）

AI Chat Web App
基于Next.js 14构建的AI聊天应用，支持多轮对话和流式输出。

主要功能
多轮对话
流式输出
消息历史
代码高亮
响应式设计

项目结构
src/
  ├── app/
  │   ├── layout.tsx
  │   ├── page.tsx
  │   └── chat/
  │       └── page.tsx
  ├── components/
  │   ├── chat/
  │   │   ├── ChatInput.tsx
  │   │   ├── ChatMessage.tsx
  │   │   └── ChatWindow.tsx
  │   └── ui/
  ├── lib/
  │   └── api.ts
  └── types/
      └── chat.ts