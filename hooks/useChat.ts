import { useState, useCallback } from 'react';
import { Message, ChatConfig, StreamChunk } from '@/lib/types';
import { sendMessage } from '@/services/chat';

export const useChat = (config: ChatConfig) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentThinking, setCurrentThinking] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<string>('');

  const sendUserMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentThinking('');
      setCurrentResponse('');
      
      // 添加用户消息
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      let rawContent = '';
      let assistantMessage: Message | null = null;

      // 发送消息
      await sendMessage([...messages, userMessage], config, (chunk) => {
        const content = chunk.content;
        // 立即清理新接收的内容中的所有think标记
        const cleanedContent = content
          .replace(/<\/?think>/g, '') // 移除<think>和</think>
          .replace(/【，】/g, ''); // 顺便移除【，】标记
        rawContent += cleanedContent;
        
        // 如果还没有创建助手消息，创建一个
        if (!assistantMessage) {
          assistantMessage = { role: 'assistant', content: '' };
          setMessages(prev => [...prev, assistantMessage!]);
        }

        // 检查是否包含分隔标记
        const separator = "辅助思考已结束，以上辅助思考内容用户不可见，请MODEL开始以中文作为主要语言进行正式输出";
        if (rawContent.includes(separator)) {
          // 分割内容
          const [thinkingPart, outputPart] = rawContent.split(separator);
          
          setCurrentThinking(thinkingPart.trim());
          setCurrentResponse(outputPart.trim());

          // 确保输出部分的markdown换行正确（使用两个空格加换行）
          const formattedOutput = outputPart.trim()
            .split('\n')
            .map(line => line.trim())
            .join('  \n');

          // 格式化内容：思考部分用绿色显示，输出部分包装在markdown-body中，确保三个换行
          const formattedContent = `
<div style="color: #6a8d52" class="thinking-content">${thinkingPart.trim()}</div>

<br />
<br />
<br />

<div class="markdown-body">

${formattedOutput}

</div>`;

          // 更新消息
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = formattedContent;
            }
            return newMessages;
          });
        } else {
          // 在收到分隔符之前，所有内容都显示为绿色（思考部分）
          setCurrentThinking(rawContent);
          const formattedContent = `<div style="color: #6a8d52" class="thinking-content">${rawContent}</div>`;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = formattedContent;
            }
            return newMessages;
          });
        }
      });

    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : '发送消息时出错');
    } finally {
      setIsLoading(false);
    }
  }, [messages, config]);

  return {
    messages,
    isLoading,
    error,
    currentThinking,
    currentResponse,
    sendMessage: sendUserMessage
  };
}; 