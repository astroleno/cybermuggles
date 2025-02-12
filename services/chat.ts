import axios from 'axios';
import { ChatConfig, Message, ChatResponse, StreamChunk } from '@/lib/types';

export const sendMessage = async (
  messages: Message[],
  config: ChatConfig,
  onChunk: (chunk: StreamChunk) => void
) => {
  try {
    const response = await fetch(`${config.apiUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.modelName,
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
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
        }
      }
    }
  } catch (error) {
    console.error('Error in chat service:', error);
    throw error;
  }
}; 