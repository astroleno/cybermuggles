import axios from 'axios';
import { ChatConfig, Message, ChatResponse, StreamChunk } from '@/lib/types';

export const sendMessage = async (
  messages: Message[],
  config: ChatConfig,
  onChunk: (chunk: StreamChunk) => void
) => {
  try {
    // 使用我们的代理端点
    const apiUrl = '/api/proxy';
    console.log('Sending request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        model: config.modelName,
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: apiUrl
      });
      throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let isThinking = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

        try {
          const data = JSON.parse(trimmedLine.replace(/^data: /, ''));
          
          if (data.choices?.[0]?.delta?.content) {
            const content = data.choices[0].delta.content;
            
            // 检查是否包含思考标记
            if (content.includes('<think>')) {
              isThinking = true;
            } else if (content.includes('</think>')) {
              isThinking = false;
            }
            
            // 发送处理后的内容
            onChunk({
              type: isThinking ? 'thinking' : 'response',
              content: content
                .replace(/<\/?think>/g, '')
                .replace(/【，】/g, '')
            });
          }
        } catch (e) {
          console.error('Error parsing line:', e);
        }
      }
    }
  } catch (error) {
    console.error('Chat service error:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('无法连接到API服务器，请确保服务器正在运行且可访问');
    }
    throw new Error(error instanceof Error ? error.message : '与API通信时发生错误');
  }
}; 