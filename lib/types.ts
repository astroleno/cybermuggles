export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_content?: string;
}

export interface ChatConfig {
  apiUrl: string;
  modelName: string;
  apiKey: string;
}

export interface ChatResponse {
  text: string;
  error_code: number;
}

export interface StreamChunk {
  type: 'thinking' | 'response';
  content: string;
} 