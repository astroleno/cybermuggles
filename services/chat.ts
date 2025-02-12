import axios from 'axios';
import { ChatConfig, Message, ChatResponse, StreamChunk } from '@/lib/types';

export const sendMessage = async (
  messages: Message[],
  config: ChatConfig,
  onChunk: (chunk: StreamChunk) => void
) => {
  try {
    // 确保使用 HTTP
    const apiUrl = config.apiUrl.replace('https://', 'http://');
    console.log('Sending request to:', apiUrl);

    const response = await fetch(`${apiUrl}/v1/chat/completions`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      console.log('Raw chunk:', chunk);

      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

        try {
          console.log('Processing line:', trimmedLine);
          const data = JSON.parse(trimmedLine.replace(/^data: /, ''));
          console.log('Parsed data:', data);

          if (data.choices?.[0]?.delta?.content) {
            const content = data.choices[0].delta.content;
            console.log('Content:', content);
            onChunk({
              type: content.includes('<think>') ? 'thinking' : 'response',
              content: content
            });
          }
        } catch (e) {
          console.error('Error parsing line:', e);
          console.error('Problematic line:', trimmedLine);
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