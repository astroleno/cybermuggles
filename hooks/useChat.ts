import { useState, useCallback } from 'react';
import { Message, ChatConfig, StreamChunk } from '@/lib/types';
import { sendMessage } from '@/services/chat';

export const useChat = (config: ChatConfig) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentThinking, setCurrentThinking] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [isThinkingComplete, setIsThinkingComplete] = useState(false);

  const sendUserMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentThinking('');
      setCurrentResponse('');
      setIsThinkingComplete(false);
      
      // 添加用户消息
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      let rawContent = '';
      let isFirstResponse = true;

      // 发送消息
      await sendMessage([...messages, userMessage], config, (chunk) => {
        const content = chunk.content;
        // 立即清理新接收的内容中的所有think标记
        const cleanedContent = content
          .replace(/<\/?think>/g, '') // 移除<think>和</think>
          .replace(/【，】/g, ''); // 移除【，】标记
        rawContent += cleanedContent;
        
        // 检查是否包含分隔标记
        const separator = "辅助思考已结束，以上辅助思考内容用户不可见，请MODEL开始以中文作为主要语言进行正式输出";
        if (rawContent.includes(separator)) {
          // 分割内容
          const [thinkingPart, outputPart] = rawContent.split(separator);
          
          // 更新当前思考和响应状态
          if (isFirstResponse) {
            setCurrentThinking(thinkingPart.trim());
            setIsThinkingComplete(true);
            isFirstResponse = false;
          }
          
          // 更新响应内容
          setCurrentResponse(outputPart.trim());
          
          // 不再将响应添加到消息历史中
          // 移除这部分代码，这样就不会创建新的对话框
          // if (!outputPart.trim().endsWith('...')) {
          //   const assistantMessage: Message = {
          //     role: 'assistant',
          //     content: outputPart.trim(),
          //     isTemp: false
          //   };
          //   setMessages(prev => [...prev, assistantMessage]);
          // }
        } else {
          // 在收到分隔符之前，更新思考过程
          setCurrentThinking(rawContent);
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
    isThinkingComplete,
    sendMessage: sendUserMessage
  };
}; 